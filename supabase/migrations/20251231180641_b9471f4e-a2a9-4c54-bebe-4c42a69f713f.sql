-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_by uuid,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Create index for faster lookups
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_changed_by ON public.audit_logs(changed_by);
CREATE INDEX idx_audit_logs_changed_at ON public.audit_logs(changed_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs (via triggers)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Create audit function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  record_id uuid;
  old_data jsonb := NULL;
  new_data jsonb := NULL;
BEGIN
  -- Determine record ID and data based on operation
  IF TG_OP = 'DELETE' THEN
    record_id := OLD.id;
    old_data := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    record_id := NEW.id;
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSE -- INSERT
    record_id := NEW.id;
    new_data := to_jsonb(NEW);
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    record_id,
    TG_OP,
    old_data,
    new_data,
    auth.uid()
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Add triggers to sensitive tables

-- user_roles: log all role changes
CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- profiles: log all profile updates
CREATE TRIGGER audit_profiles
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- user_certifications: log certification changes
CREATE TRIGGER audit_user_certifications
AFTER INSERT OR UPDATE OR DELETE ON public.user_certifications
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- coach_athlete_assignments: log assignment changes
CREATE TRIGGER audit_coach_athlete_assignments
AFTER INSERT OR UPDATE OR DELETE ON public.coach_athlete_assignments
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- scheduled_broadcasts: log broadcast changes
CREATE TRIGGER audit_scheduled_broadcasts
AFTER INSERT OR UPDATE OR DELETE ON public.scheduled_broadcasts
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();