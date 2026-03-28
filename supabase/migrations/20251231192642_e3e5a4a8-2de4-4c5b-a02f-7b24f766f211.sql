-- Add explicit RESTRICTIVE policies to ensure audit log immutability

-- Prevent any updates to audit logs
CREATE POLICY "Audit logs are immutable"
ON public.audit_logs
FOR UPDATE
USING (false);

-- Prevent any deletes of audit logs
CREATE POLICY "Audit logs cannot be deleted"
ON public.audit_logs
FOR DELETE
USING (false);