
-- 1. Create a trigger to auto-notify recipient on new messages
CREATE OR REPLACE FUNCTION public.notify_new_coaching_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sender_name text;
BEGIN
  -- Get sender display name
  SELECT display_name INTO sender_name
  FROM public.profiles WHERE user_id = NEW.sender_id LIMIT 1;

  -- Insert in-app notification for recipient
  INSERT INTO public.notifications (user_id, type, title, message, actor_id)
  VALUES (
    NEW.recipient_id,
    'coach_message',
    'New message from ' || COALESCE(sender_name, 'someone'),
    LEFT(NEW.content, 120),
    NEW.sender_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_coaching_message ON public.coaching_messages;

CREATE TRIGGER trg_notify_new_coaching_message
  AFTER INSERT ON public.coaching_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_coaching_message();

-- 2. Replace the open INSERT policy with RBAC-enforced policy
DROP POLICY IF EXISTS "Users can send messages" ON public.coaching_messages;

CREATE POLICY "Users can send messages to valid recipients"
  ON public.coaching_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      -- Owners/admins can message anyone
      public.has_role(auth.uid(), 'admin')
      OR public.is_owner(auth.uid())
      -- Coaches can message their assigned athletes
      OR public.is_active_coach_for_athlete(auth.uid(), recipient_id)
      -- Athletes can message their assigned coach
      OR public.is_active_coach_for_athlete(recipient_id, auth.uid())
      -- Parents can message their child's coach (through parent_athlete_links)
      OR EXISTS (
        SELECT 1 FROM public.parent_athlete_links pal
        JOIN public.coach_athlete_assignments caa ON caa.athlete_user_id = pal.athlete_user_id AND caa.is_active = true
        WHERE pal.parent_user_id = auth.uid() AND caa.coach_user_id = recipient_id AND pal.status = 'active'
      )
      -- Coaches can message parents of their assigned athletes
      OR EXISTS (
        SELECT 1 FROM public.parent_athlete_links pal
        JOIN public.coach_athlete_assignments caa ON caa.athlete_user_id = pal.athlete_user_id AND caa.is_active = true
        WHERE pal.parent_user_id = recipient_id AND caa.coach_user_id = auth.uid() AND pal.status = 'active'
      )
    )
  );
