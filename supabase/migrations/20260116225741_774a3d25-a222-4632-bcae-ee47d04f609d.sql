-- Create a function to get certificate leaderboard data
CREATE OR REPLACE FUNCTION get_certificate_leaderboard(result_limit integer DEFAULT 50)
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
BEGIN
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
  GROUP BY cc.user_id, p.display_name, p.avatar_url
  ORDER BY certificate_count DESC, latest_certificate_date DESC
  LIMIT result_limit;
END;
$$;