-- Add softball-specific certification types to the enum
ALTER TYPE public.certification_type ADD VALUE IF NOT EXISTS 'softball_foundations';
ALTER TYPE public.certification_type ADD VALUE IF NOT EXISTS 'softball_performance';
ALTER TYPE public.certification_type ADD VALUE IF NOT EXISTS 'softball_pitching_specialist';
ALTER TYPE public.certification_type ADD VALUE IF NOT EXISTS 'softball_hitting_specialist';
ALTER TYPE public.certification_type ADD VALUE IF NOT EXISTS 'softball_defense_specialist';