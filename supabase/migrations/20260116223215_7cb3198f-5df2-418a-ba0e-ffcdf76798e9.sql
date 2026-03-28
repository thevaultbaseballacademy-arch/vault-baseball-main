-- Add label column to kpi_share_tokens for organizing share links
ALTER TABLE public.kpi_share_tokens 
ADD COLUMN label TEXT;