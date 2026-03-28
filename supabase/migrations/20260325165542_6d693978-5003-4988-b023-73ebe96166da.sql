-- Add certification definitions for the 3 new softball hitting certs
INSERT INTO public.certification_definitions (
  certification_type, name, description, passing_score, question_count, validity_months, price_cents, is_required
) VALUES
  ('softball_hitting_foundations', 'Softball Hitting Foundations', 'Required for all softball coaches. Covers mechanics, sequencing, timing, and approach.', 85, 40, 24, 0, true),
  ('softball_hitting_performance', 'Softball Hitting Performance', 'Advanced hitting certification covering adjustability, KPIs, game transfer, and decision-making.', 88, 50, 24, 2500, false),
  ('softball_slap_specialist', 'Softball Slap Specialist', 'Premium certification covering footwork, barrel control, and triple-threat slap system.', 90, 40, 24, 2500, false)
ON CONFLICT (certification_type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  passing_score = EXCLUDED.passing_score,
  question_count = EXCLUDED.question_count,
  price_cents = EXCLUDED.price_cents;