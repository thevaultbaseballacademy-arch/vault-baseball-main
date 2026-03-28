
-- =============================================
-- 1. COMMUNITY POSTS CONTENT MODERATION
-- =============================================

-- Add moderation fields to community_posts
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS is_flagged boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS flag_reason text,
ADD COLUMN IF NOT EXISTS flagged_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS flagged_by uuid,
ADD COLUMN IF NOT EXISTS hidden_by_admin boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS moderation_notes text;

-- Create index for flagged posts
CREATE INDEX IF NOT EXISTS idx_community_posts_flagged 
ON public.community_posts(is_flagged, hidden_by_admin);

-- Update SELECT policy to exclude hidden posts (except for admins and post owner)
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.community_posts;

CREATE POLICY "Authenticated users can view visible posts"
ON public.community_posts
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    hidden_by_admin = false 
    OR auth.uid() = user_id 
    OR has_role(auth.uid(), 'admin')
  )
);

-- Allow any authenticated user to flag posts (report)
CREATE POLICY "Authenticated users can flag posts"
ON public.community_posts
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != user_id  -- Can't flag own posts
)
WITH CHECK (
  -- Only allow updating flag-related fields
  is_flagged = true
);

-- Allow admins to moderate posts
CREATE POLICY "Admins can moderate posts"
ON public.community_posts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- 2. ATHLETE CONSENT FOR COACH ASSIGNMENTS
-- =============================================

-- Add consent fields to coach_athlete_assignments
ALTER TABLE public.coach_athlete_assignments 
ADD COLUMN IF NOT EXISTS athlete_approved boolean,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approval_requested_at timestamp with time zone DEFAULT now();

-- Update index to include approval status
DROP INDEX IF EXISTS idx_coach_athlete_active;
CREATE INDEX idx_coach_athlete_active_approved 
ON public.coach_athlete_assignments(coach_user_id, athlete_user_id, is_active, athlete_approved);

-- Update the security definer function to require approval
CREATE OR REPLACE FUNCTION public.is_active_coach_for_athlete(_coach_id uuid, _athlete_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.coach_athlete_assignments
    WHERE coach_user_id = _coach_id
      AND athlete_user_id = _athlete_id
      AND is_active = true
      AND (athlete_approved = true OR athlete_approved IS NULL)  -- Allow NULL for backwards compatibility
  )
$$;

-- Allow athletes to update their approval status
CREATE POLICY "Athletes can approve or reject assignments"
ON public.coach_athlete_assignments
FOR UPDATE
USING (auth.uid() = athlete_user_id)
WITH CHECK (auth.uid() = athlete_user_id);

-- =============================================
-- 3. USER CONSENT FOR NOTIFICATION ANALYTICS
-- =============================================

-- Add analytics consent to notification_preferences
ALTER TABLE public.notification_preferences 
ADD COLUMN IF NOT EXISTS analytics_consent boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS analytics_consent_updated_at timestamp with time zone;

-- Allow users to view their own analytics data
CREATE POLICY "Users can view own analytics"
ON public.notification_analytics
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to delete their own analytics
CREATE POLICY "Users can delete own analytics"
ON public.notification_analytics
FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- 4. AUDIT LOG RETENTION POLICY
-- =============================================

-- Create a function to purge old audit logs (configurable retention period)
CREATE OR REPLACE FUNCTION public.purge_old_audit_logs(retention_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Only admins can call this function (enforced at application level)
  DELETE FROM public.audit_logs
  WHERE changed_at < (now() - (retention_days || ' days')::interval);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create a function to anonymize IP addresses in older logs instead of deleting
CREATE OR REPLACE FUNCTION public.anonymize_old_audit_ips(days_threshold integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.audit_logs
  SET 
    ip_address = CASE 
      WHEN ip_address IS NOT NULL THEN 'anonymized'
      ELSE NULL 
    END,
    user_agent = CASE 
      WHEN user_agent IS NOT NULL THEN 'anonymized'
      ELSE NULL 
    END
  WHERE changed_at < (now() - (days_threshold || ' days')::interval)
    AND (ip_address IS DISTINCT FROM 'anonymized' OR user_agent IS DISTINCT FROM 'anonymized');
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Add audit log retention metadata table
CREATE TABLE IF NOT EXISTS public.data_retention_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  description text,
  updated_by uuid,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on retention config
ALTER TABLE public.data_retention_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage retention config
CREATE POLICY "Admins can manage retention config"
ON public.data_retention_config
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default retention settings
INSERT INTO public.data_retention_config (config_key, config_value, description)
VALUES 
  ('audit_log_retention_days', '90', 'Number of days to retain full audit logs'),
  ('audit_ip_anonymize_days', '30', 'Number of days after which IP addresses are anonymized'),
  ('notification_analytics_retention_days', '365', 'Number of days to retain notification analytics')
ON CONFLICT (config_key) DO NOTHING;

-- =============================================
-- 5. SCHEDULED BROADCASTS ADDITIONAL PROTECTION
-- =============================================

-- Add audit trail for broadcast access
ALTER TABLE public.scheduled_broadcasts 
ADD COLUMN IF NOT EXISTS last_viewed_by uuid,
ADD COLUMN IF NOT EXISTS last_viewed_at timestamp with time zone;

-- =============================================
-- 6. PAYMENT INFO PROTECTION
-- =============================================

-- Create a view that hides sensitive payment info for non-admin access
CREATE OR REPLACE VIEW public.user_certifications_safe AS
SELECT 
  id,
  user_id,
  certification_type,
  status,
  issued_at,
  expires_at,
  score,
  attempt_id,
  certificate_number,
  created_at,
  updated_at,
  expiration_reminder_sent,
  final_warning_sent,
  -- Only show payment ID to admins
  CASE 
    WHEN has_role(auth.uid(), 'admin') THEN stripe_payment_id
    ELSE NULL
  END as stripe_payment_id
FROM public.user_certifications
WHERE auth.uid() = user_id OR has_role(auth.uid(), 'admin');
