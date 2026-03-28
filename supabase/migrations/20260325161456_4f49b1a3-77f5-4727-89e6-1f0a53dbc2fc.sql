-- Insert softball certification definitions
INSERT INTO public.certification_definitions (
  certification_type, name, description, passing_score, question_count, validity_months, price_cents, is_required, prerequisites
) VALUES
  ('softball_foundations', 'VAULT™ Softball Foundations', 'Core softball coaching certification covering pitcher-centric game model, short-game philosophy, windmill pitching basics, and softball-specific development principles.', 80, 30, 24, 0, true, NULL),
  ('softball_performance', 'VAULT™ Softball Performance', 'Advanced softball certification covering elite windmill pitching mechanics, slap hitting systems, defensive adjustments, and tournament workload management.', 85, 40, 18, 2500, false, ARRAY['softball_foundations']::certification_type[]),
  ('softball_pitching_specialist', 'Softball Pitching Specialist', 'Expert-level certification for windmill pitching coaches. Biomechanics-based assessment covering all 4 phases, spin creation, velocity development, and shoulder health management.', 85, 35, 18, 2500, false, ARRAY['softball_foundations']::certification_type[]),
  ('softball_hitting_specialist', 'Softball Hitting Specialist', 'Specialist certification for softball hitting coaches covering rotational mechanics, slap hitting systems, pitch recognition, and short-game integration.', 85, 30, 18, 1500, false, ARRAY['softball_foundations']::certification_type[]),
  ('softball_defense_specialist', 'Softball Defense Specialist', 'Specialist certification covering softball-specific defensive techniques, faster reaction training, catching rise balls, and team defensive systems.', 85, 30, 18, 1500, false, ARRAY['softball_foundations']::certification_type[])
ON CONFLICT (certification_type) DO NOTHING;