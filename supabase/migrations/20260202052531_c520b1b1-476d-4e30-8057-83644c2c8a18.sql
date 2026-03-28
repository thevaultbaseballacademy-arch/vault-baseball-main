-- Create team_whitelist table for granting full access to team members
CREATE TABLE public.team_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_access BOOLEAN DEFAULT true,
  admin_access BOOLEAN DEFAULT false,
  notes TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_whitelist ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage whitelist
CREATE POLICY "Admins can manage team whitelist"
ON public.team_whitelist
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Anyone can check if their own email is whitelisted (for access checks)
CREATE POLICY "Users can check own whitelist status"
ON public.team_whitelist
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create function to check if user has team access
CREATE OR REPLACE FUNCTION public.has_team_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_whitelist tw
    JOIN auth.users u ON u.email = tw.email
    WHERE u.id = _user_id
      AND tw.full_access = true
  )
$$;

-- Create function to check if user has admin via whitelist
CREATE OR REPLACE FUNCTION public.has_team_admin_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_whitelist tw
    JOIN auth.users u ON u.email = tw.email
    WHERE u.id = _user_id
      AND tw.admin_access = true
  )
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_team_whitelist_updated_at
BEFORE UPDATE ON public.team_whitelist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();