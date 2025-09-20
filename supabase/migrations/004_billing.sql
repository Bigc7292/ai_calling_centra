-- Sprint 4: Billing & Quota
-- PRD v1.3, Section 3 & 5

-- Update profiles table for Stripe and plans
ALTER TABLE profiles
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN plan TEXT DEFAULT 'trial';

-- Create billing_logs table
CREATE TYPE billing_status AS ENUM ('pending', 'paid', 'failed');

CREATE TABLE billing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_invoice_id TEXT,
  minutes_billed INT,
  amount_cents INT,
  status billing_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE billing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own billing logs"
ON billing_logs FOR SELECT
USING (auth.uid() = user_id);

-- Trigger to decrement quota on call completion
CREATE OR REPLACE FUNCTION decrement_quota()
RETURNS TRIGGER AS $$
DECLARE
  call_duration_minutes INT;
BEGIN
  call_duration_minutes := round(NEW.call_logs[array_length(NEW.call_logs, 1)]->>'duration' / 60);

  UPDATE profiles
  SET quota_minutes = quota_minutes - call_duration_minutes
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_call_completion
AFTER UPDATE OF call_logs ON contacts
FOR EACH ROW
EXECUTE FUNCTION decrement_quota();
