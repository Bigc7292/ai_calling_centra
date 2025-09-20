-- Sprint 10: RLS Policy Updates for Multi-Tenancy
-- PRD v1.3, Sec 3: RLS Enforcement

-- Helper function to get the team_id of the currently authenticated user.
-- SECURITY DEFINER is used to bypass user's RLS and reliably get their profile data for policy checks.
CREATE OR REPLACE FUNCTION public.get_my_team_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
-- IMPORTANT: Set the search_path to prevent hijacking. 'public' should be the schema of your profiles table.
SET search_path = public
AS $ 
  SELECT team_id FROM profiles WHERE user_id = auth.uid();
$;

-- Helper function to get the role of the currently authenticated user.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $ 
  SELECT role FROM profiles WHERE user_id = auth.uid();
$;

-- =============================================
-- Table: contacts
-- =============================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view contacts" ON public.contacts;
CREATE POLICY "Team members can view contacts" ON public.contacts
  FOR SELECT
  USING (team_id = get_my_team_id());

DROP POLICY IF EXISTS "Editors and above can insert contacts" ON public.contacts;
CREATE POLICY "Editors and above can insert contacts" ON public.contacts
  FOR INSERT
  WITH CHECK (team_id = get_my_team_id() AND get_my_role() IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "Admins and above can update contacts" ON public.contacts;
CREATE POLICY "Admins and above can update contacts" ON public.contacts
  FOR UPDATE
  USING (team_id = get_my_team_id() AND get_my_role() IN ('owner', 'admin'))
  WITH CHECK (team_id = get_my_team_id());

DROP POLICY IF EXISTS "Owners can delete contacts" ON public.contacts;
CREATE POLICY "Owners can delete contacts" ON public.contacts
  FOR DELETE
  USING (team_id = get_my_team_id() AND get_my_role() = 'owner');

-- =============================================
-- Table: campaigns
-- =============================================
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view campaigns" ON public.campaigns;
CREATE POLICY "Team members can view campaigns" ON public.campaigns
  FOR SELECT
  USING (team_id = get_my_team_id());

DROP POLICY IF EXISTS "Editors and above can create campaigns" ON public.campaigns;
CREATE POLICY "Editors and above can create campaigns" ON public.campaigns
  FOR INSERT
  WITH CHECK (team_id = get_my_team_id() AND get_my_role() IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "Admins and above can update campaigns" ON public.campaigns;
CREATE POLICY "Admins and above can update campaigns" ON public.campaigns
  FOR UPDATE
  USING (team_id = get_my_team_id() AND get_my_role() IN ('owner', 'admin'))
  WITH CHECK (team_id = get_my_team_id());

DROP POLICY IF EXISTS "Owners can delete campaigns" ON public.campaigns;
CREATE POLICY "Owners can delete campaigns" ON public.campaigns
  FOR DELETE
  USING (team_id = get_my_team_id() AND get_my_role() = 'owner');

-- =============================================
-- Table: insights
-- =============================================
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view insights" ON public.insights;
CREATE POLICY "Team members can view insights" ON public.insights
  FOR SELECT
  USING (team_id = get_my_team_id());

-- Insights are read-only for most users; only backend processes should create them.
-- For this reason, we do not define INSERT/UPDATE/DELETE policies for client-side roles.

