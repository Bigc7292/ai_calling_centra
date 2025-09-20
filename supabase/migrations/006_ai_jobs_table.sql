-- Sprint 6: AI Jobs Table & Campaign Script Update
-- PRD v1.3, Section 3 & 5

-- Create ai_jobs table
CREATE TYPE ai_job_type AS ENUM ('script', 'voice', 'data');
CREATE TYPE ai_job_status AS ENUM ('pending', 'running', 'complete', 'failed');

CREATE TABLE ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type ai_job_type NOT NULL,
  status ai_job_status DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own AI jobs"
ON ai_jobs FOR ALL
USING (auth.uid() = user_id);

-- Update campaigns table to enforce JSONB for script
ALTER TABLE campaigns
ALTER COLUMN script TYPE JSONB USING script::jsonb;
