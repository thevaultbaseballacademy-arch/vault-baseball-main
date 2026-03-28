
-- Add approval/certification fields to coaches table
ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS is_certified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_bypass_certified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_staff boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_marketplace_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_by_admin uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS marketplace_status text NOT NULL DEFAULT 'applied';

-- Add comment for marketplace_status valid values
COMMENT ON COLUMN public.coaches.marketplace_status IS 'Valid values: applied, pending_review, certification_required, certified, bypass_certified, approved, rejected, suspended';
