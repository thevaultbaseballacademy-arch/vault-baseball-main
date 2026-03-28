-- Drop and recreate the function with time filter support
DROP FUNCTION IF EXISTS get_certificate_leaderboard(integer);

CREATE OR REPLACE FUNCTION get_certificate_leaderboard(
  result_limit integer DEFAULT 50,
  time_filter text DEFAULT 'all'
)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  certificate_count bigint,
  latest_certificate_date timestamptz,
  courses_completed text[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  filter_date timestamptz;
BEGIN
  -- Calculate filter date based on time_filter parameter
  CASE time_filter
    WHEN 'week' THEN
      filter_date := NOW() - INTERVAL '7 days';
    WHEN 'month' THEN
      filter_date := NOW() - INTERVAL '30 days';
    WHEN 'year' THEN
      filter_date := NOW() - INTERVAL '365 days';
    ELSE
      filter_date := NULL; -- 'all' time, no filter
  END CASE;

  RETURN QUERY
  SELECT 
    cc.user_id,
    COALESCE(p.display_name, 'Anonymous Athlete') as display_name,
    p.avatar_url,
    COUNT(cc.id) as certificate_count,
    MAX(cc.issued_at) as latest_certificate_date,
    ARRAY_AGG(DISTINCT cc.course_title ORDER BY cc.course_title) as courses_completed
  FROM course_certificates cc
  LEFT JOIN profiles p ON cc.user_id = p.user_id
  WHERE (filter_date IS NULL OR cc.issued_at >= filter_date)
  GROUP BY cc.user_id, p.display_name, p.avatar_url
  ORDER BY certificate_count DESC, latest_certificate_date DESC
  LIMIT result_limit;
END;
$$;