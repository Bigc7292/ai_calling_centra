-- Per PRD Sec 3: Full contacts table schema

-- 1. Create ENUM types for structured data
CREATE TYPE call_status AS ENUM ('pending', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer');
CREATE TYPE contact_tag AS ENUM ('hot', 'warm', 'cold', 'dnc', 'unqualified', 'follow-up');

-- 2. Create the main `contacts` table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  name TEXT,
  last_call_id TEXT, -- From VAPI
  last_call_status call_status DEFAULT 'pending' NOT NULL,
  transcript TEXT, -- The full transcript from the last call
  recording_url TEXT,
  tags contact_tag[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't have the same phone number twice
  UNIQUE(user_id, phone_number)
);

-- 3. Add indexes for performance
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_phone_number ON contacts(phone_number);

-- 4. Enable Row Level Security (RLS)
-- Per PRD Sec 3: RLS policies for tenant isolation
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own contacts" 
ON contacts FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Create a function to be called by the trigger
-- This function invokes the `analyze_transcript` Edge Function asynchronously.
-- Per PRD Sec 3: Trigger AFTER INSERT/UPDATE on transcript
CREATE OR REPLACE FUNCTION trigger_analyze_transcript() 
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if the transcript has been updated and is not empty
  IF NEW.transcript IS NOT NULL AND NEW.transcript != '' AND (OLD.transcript IS NULL OR NEW.transcript != OLD.transcript) THEN
    PERFORM net.http_post(
      url := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/analyze_transcript',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || '<YOUR_SUPABASE_ANON_KEY>' || '"}'::jsonb,
      body := jsonb_build_object(
        'contact_id', NEW.id,
        'transcript', NEW.transcript
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create the trigger
CREATE TRIGGER on_transcript_update
  AFTER INSERT OR UPDATE OF transcript ON contacts
  FOR EACH ROW EXECUTE FUNCTION trigger_analyze_transcript();

-- 7. Simple DNC Scrubbing Cron Job Stub
-- Per PRD Sec 3: Simple cron stub for DNC scrub
-- This is a mock. A real implementation would call a DNC provider API.
SELECT cron.schedule(
  'daily-dnc-scrub', 
  '0 0 * * *', -- Every day at midnight
  $$
    UPDATE contacts
    SET tags = array_append(tags, 'dnc')
    WHERE phone_number IN ('555-0100', '555-0199'); -- Example DNC numbers
  $$
);
