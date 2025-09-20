-- Sprint 10: Multi-User Teams & RBAC
-- PRD v1.3, Sec 3: Data Model Update

-- 1. Create the user role ENUM
CREATE TYPE public.user_role AS ENUM (
    'owner',
    'admin',
    'editor',
    'viewer'
);

-- 2. Create the teams table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.teams IS 'Stores team information, linking users together.';

-- 3. Update the profiles table
ALTER TABLE public.profiles
ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
ADD COLUMN role public.user_role NOT NULL DEFAULT 'viewer';

COMMENT ON COLUMN public.profiles.team_id IS 'The team this user belongs to.';
COMMENT ON COLUMN public.profiles.role IS 'The role of the user within their team.';

-- 4. Add a function to create a team for a new user (can be called via RPC)
CREATE OR REPLACE FUNCTION public.create_team_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_team_id UUID;
BEGIN
  -- Create a new team for the user
  INSERT INTO public.teams (owner_id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name' || '\'s Team')
  RETURNING id INTO new_team_id;

  -- Update the user's profile with the new team_id and set them as owner
  UPDATE public.profiles
  SET team_id = new_team_id,
      role = 'owner'
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 

-- 5. Create a trigger to automatically create a team when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_team_for_new_user();
