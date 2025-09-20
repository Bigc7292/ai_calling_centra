-- Sprint 9: Insights & Alerts Tables
-- PRD v1.3, Section 2 & 7

-- Create insights table
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- e.g., 'weekly'
  insight JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own insights" ON insights FOR SELECT USING (auth.uid() = user_id);

-- Create compliance_alerts table
CREATE TABLE compliance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- e.g., 'DNC_Violation'
  severity TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own compliance alerts" ON compliance_alerts FOR SELECT USING (auth.uid() = user_id);
