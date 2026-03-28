ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_group text DEFAULT NULL;
COMMENT ON COLUMN public.profiles.age_group IS 'Age division: 8U, 10U, 12U, 14U, 16U, 18U, College, Adult';