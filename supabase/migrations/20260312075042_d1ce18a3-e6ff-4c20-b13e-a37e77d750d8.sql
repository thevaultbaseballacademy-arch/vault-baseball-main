
-- Backfill: create remote_lessons for existing confirmed session_bookings that don't have one
-- Only for bookings with a matching auth.users email
INSERT INTO public.remote_lessons (coach_user_id, athlete_user_id, scheduled_at, duration_minutes, status, notes)
SELECT 
  sb.coach_user_id,
  u.id as athlete_user_id,
  sb.session_date::date + make_interval(
    hours => CASE 
      WHEN sb.session_time ILIKE '%PM%' AND split_part(split_part(sb.session_time, ':', 1), ' ', 1)::int != 12 
        THEN split_part(split_part(sb.session_time, ':', 1), ' ', 1)::int + 12
      WHEN sb.session_time ILIKE '%AM%' AND split_part(split_part(sb.session_time, ':', 1), ' ', 1)::int = 12 
        THEN 0
      ELSE split_part(split_part(sb.session_time, ':', 1), ' ', 1)::int
    END,
    mins => split_part(split_part(sb.session_time, ':', 2), ' ', 1)::int
  ) as scheduled_at,
  COALESCE(sb.duration_minutes, 60),
  'confirmed',
  'Booked via ' || COALESCE(replace(sb.session_type, '_', ' '), 'session') || ' - ' || COALESCE(sb.athlete_name, '')
FROM public.session_bookings sb
JOIN auth.users u ON u.email = sb.email
WHERE sb.status = 'confirmed'
  AND sb.session_date >= CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM public.remote_lessons rl
    WHERE rl.coach_user_id = sb.coach_user_id
      AND rl.athlete_user_id = u.id
      AND rl.scheduled_at = sb.session_date::date + make_interval(
        hours => CASE 
          WHEN sb.session_time ILIKE '%PM%' AND split_part(split_part(sb.session_time, ':', 1), ' ', 1)::int != 12 
            THEN split_part(split_part(sb.session_time, ':', 1), ' ', 1)::int + 12
          WHEN sb.session_time ILIKE '%AM%' AND split_part(split_part(sb.session_time, ':', 1), ' ', 1)::int = 12 
            THEN 0
          ELSE split_part(split_part(sb.session_time, ':', 1), ' ', 1)::int
        END,
        mins => split_part(split_part(sb.session_time, ':', 2), ' ', 1)::int
      )
  );
