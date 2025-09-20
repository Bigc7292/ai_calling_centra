## 3. Phone Number Profiles & Data Model

### Core Entity: Contact Profile (Expanded with Triggers)
Supabase `contacts` table – Tenant-isolated via RLS; Auto-audit on mutations.

**Full Schema (SQL for Gemini – Includes Functions):**
```sql
-- Enum for statuses
CREATE TYPE contact_status AS ENUM ('hot', 'cold', 'dnc', 'booked', 'escalated');

-- Main table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL CHECK (phone ~ '^\+[1-9]\d{1,14}$'),  -- E.164 strict
  name_hash TEXT,  -- Keccak256 from client-side
  email_hash TEXT,
  status contact_status DEFAULT 'cold',
  tags JSONB DEFAULT '{}'::JSONB,  -- e.g., {"industry": "real_estate", "sentiment": 8}
  metadata JSONB,  -- e.g., {"source": "twitter", "ip_geo": "NYC"}
  call_logs JSONB[] DEFAULT '{}',  -- [{ts: ISO, duration: 120, outcome: "booked", assistant_id: "gemini-1.5"}]
  transcript TEXT,  -- Encrypted via pg_crypto (client key)
  recording_url TEXT,  -- GCS signed URL with 7d TTL
  dnc_scrubbed_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX CONCURRENTLY idx_contacts_user_status ON contacts(user_id, status);
CREATE INDEX CONCURRENTLY idx_contacts_phone_hash ON contacts(phone, name_hash);
CREATE INDEX CONCURRENTLY idx_contacts_tags_gin ON contacts USING GIN(tags);

-- RLS: Granular tenant + role access
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User owns own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin views all" ON contacts FOR SELECT USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

-- Edge Function: Auto-tag post-insert (triggered by VAPI webhook)
CREATE OR REPLACE FUNCTION analyze_transcript()
RETURNS TRIGGER AS $$
BEGIN
  -- Async call to Gemini API (via pg_net or Edge Function HTTP)
  PERFORM net.http_post(
    url := 'https://api.gemini.com/v1/analyze',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.gemini_key')),
    body := jsonb_build_object(
      'transcript': NEW.transcript,
      'context': NEW.tags
    )
  );
  -- Update tags from response (simplified – parse in function)
  UPDATE contacts SET tags = (response::jsonb)['tags'] WHERE id = NEW.id;
  RETURN NEW;
END;
  $$ LANGUAGE plpgsql;

CREATE TRIGGER trig_analyze_after_insert
AFTER INSERT OR UPDATE OF transcript ON contacts
FOR EACH ROW EXECUTE FUNCTION analyze_transcript();
