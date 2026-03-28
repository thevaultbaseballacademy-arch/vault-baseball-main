
-- Add submitted_at column
ALTER TABLE public.content_submissions 
ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

-- Update existing pending/approved/rejected rows to have submitted_at = created_at
UPDATE public.content_submissions 
SET submitted_at = created_at 
WHERE status IN ('pending', 'approved', 'rejected', 'revision_requested') AND submitted_at IS NULL;

-- Rename revision_requested to revision for consistency
UPDATE public.content_submissions SET status = 'revision' WHERE status = 'revision_requested';

-- Drop old RLS policies and recreate with proper visibility rules
DROP POLICY IF EXISTS "Owners see all content submissions" ON public.content_submissions;
DROP POLICY IF EXISTS "Coaches create submissions" ON public.content_submissions;
DROP POLICY IF EXISTS "Owners manage submissions" ON public.content_submissions;

-- SELECT: owners/admins see all; coaches see own drafts/pending/rejected/revision + all approved
CREATE POLICY "content_submissions_select"
ON public.content_submissions FOR SELECT TO authenticated
USING (
  public.is_owner(auth.uid()) 
  OR public.has_role(auth.uid(), 'admin')
  OR (created_by = auth.uid())
  OR (status = 'approved')
);

-- INSERT: coaches can create their own submissions
CREATE POLICY "content_submissions_insert"
ON public.content_submissions FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- UPDATE: owners/admins can update any; coaches can update own drafts/revisions only
CREATE POLICY "content_submissions_update"
ON public.content_submissions FOR UPDATE TO authenticated
USING (
  public.is_owner(auth.uid()) 
  OR public.has_role(auth.uid(), 'admin')
  OR (created_by = auth.uid() AND status IN ('draft', 'revision', 'rejected'))
);

-- Notification trigger for content status changes
CREATE OR REPLACE FUNCTION public.notify_content_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  coach_name text;
  owner_ids uuid[];
BEGIN
  -- Get coach display name
  SELECT display_name INTO coach_name
  FROM public.profiles WHERE user_id = NEW.created_by LIMIT 1;

  -- When coach submits (status changes to pending)
  IF NEW.status = 'pending' AND (OLD.status IS DISTINCT FROM 'pending') THEN
    -- Set submitted_at
    NEW.submitted_at := now();
    
    -- Notify all owners
    SELECT array_agg(user_id) INTO owner_ids
    FROM public.user_roles WHERE role::text = 'owner';
    
    IF owner_ids IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, actor_id)
      SELECT 
        unnest(owner_ids),
        'content_submitted',
        'New content pending approval',
        COALESCE(coach_name, 'A coach') || ' submitted "' || NEW.title || '" (' || NEW.content_type || ') for review.',
        NEW.created_by;
    END IF;
  END IF;

  -- When owner approves
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    NEW.published_at := now();
    
    INSERT INTO public.notifications (user_id, type, title, message, actor_id)
    VALUES (
      NEW.created_by,
      'content_approved',
      'Content approved',
      'Your ' || NEW.content_type || ' "' || NEW.title || '" has been approved and is now live.',
      COALESCE(NEW.reviewed_by, auth.uid())
    );
  END IF;

  -- When owner rejects
  IF NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM 'rejected' THEN
    INSERT INTO public.notifications (user_id, type, title, message, actor_id)
    VALUES (
      NEW.created_by,
      'content_rejected',
      'Content not approved',
      'Your ' || NEW.content_type || ' "' || NEW.title || '" was not approved.' || 
        CASE WHEN NEW.rejection_note IS NOT NULL THEN ' Note: ' || NEW.rejection_note ELSE '' END,
      COALESCE(NEW.reviewed_by, auth.uid())
    );
  END IF;

  -- When owner requests revision
  IF NEW.status = 'revision' AND OLD.status IS DISTINCT FROM 'revision' THEN
    INSERT INTO public.notifications (user_id, type, title, message, actor_id)
    VALUES (
      NEW.created_by,
      'content_revision_requested',
      'Revision requested',
      '"' || NEW.title || '" needs revision.' || 
        CASE WHEN NEW.revision_note IS NOT NULL THEN ' Feedback: ' || NEW.revision_note ELSE '' END,
      COALESCE(NEW.reviewed_by, auth.uid())
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach the trigger
DROP TRIGGER IF EXISTS content_status_change_trigger ON public.content_submissions;
CREATE TRIGGER content_status_change_trigger
  BEFORE UPDATE ON public.content_submissions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_content_status_change();

-- Also fire on insert when status is pending (direct submit)
CREATE OR REPLACE FUNCTION public.notify_content_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  coach_name text;
  owner_ids uuid[];
BEGIN
  IF NEW.status = 'pending' THEN
    NEW.submitted_at := now();
    
    SELECT display_name INTO coach_name
    FROM public.profiles WHERE user_id = NEW.created_by LIMIT 1;
    
    SELECT array_agg(user_id) INTO owner_ids
    FROM public.user_roles WHERE role::text = 'owner';
    
    IF owner_ids IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, actor_id)
      SELECT 
        unnest(owner_ids),
        'content_submitted',
        'New content pending approval',
        COALESCE(coach_name, 'A coach') || ' submitted "' || NEW.title || '" (' || NEW.content_type || ') for review.',
        NEW.created_by;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS content_insert_notify_trigger ON public.content_submissions;
CREATE TRIGGER content_insert_notify_trigger
  BEFORE INSERT ON public.content_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_content_insert();
