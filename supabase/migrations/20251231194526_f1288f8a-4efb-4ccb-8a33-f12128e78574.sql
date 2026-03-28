
-- Drop the security definer view and replace with a standard approach
DROP VIEW IF EXISTS public.user_certifications_safe;

-- The existing RLS policies on user_certifications already protect access
-- Users can only see their own certifications, admins can see all
-- The stripe_payment_id is only visible through direct table access which is already protected by RLS
-- No additional view is needed - the RLS policies handle this correctly
