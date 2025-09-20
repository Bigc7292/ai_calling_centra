-- Sprint 3: Campaigns Table
-- PRD v1.3, Section 3: Data Model

CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cron TEXT, -- e.g., '0 9 * * 1-5' for Mon-Fri 9 AM
  script JSONB,
  leads UUID[],
  status campaign_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own campaigns"
ON campaigns FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX idx_campaigns_user_id_status ON campaigns(user_id, status);
