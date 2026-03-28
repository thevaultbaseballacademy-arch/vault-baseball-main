-- Fix audit_logs INSERT policy - only allow system inserts via trigger
-- The audit_trigger_function runs as SECURITY DEFINER so it can insert
-- Regular users should not be able to insert fake audit records
CREATE POLICY "No direct inserts allowed" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (false);

-- Note: The audit_trigger_function is SECURITY DEFINER, so it bypasses RLS
-- This means legitimate audit entries via triggers still work, but direct INSERT is blocked