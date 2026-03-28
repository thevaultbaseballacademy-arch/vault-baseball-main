-- Clean up conflicting and redundant policies

-- PROFILES: Remove the overly permissive public policy, keep only authenticated access
DROP POLICY IF EXISTS "Anyone can view public profile basics" ON public.profiles;

-- ATHLETIC_STATS: Remove redundant policy, keep only privacy-aware one
DROP POLICY IF EXISTS "Anyone can view public athletic stats" ON public.athletic_stats;
DROP POLICY IF EXISTS "Users can view own athletic stats" ON public.athletic_stats;

-- CERTIFICATION_QUESTIONS: Keep only one admin policy
DROP POLICY IF EXISTS "Admins can view questions with answers" ON public.certification_questions;

-- PUSH_TOKENS: Already has proper RLS but add explicit deny for safety
-- (RLS is enabled and only owner can access their tokens)

-- AUDIT_LOGS: Remove the overly permissive insert policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;