
CREATE OR REPLACE FUNCTION public.get_super_admin_all_users()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE WHEN NOT has_role(auth.uid(), 'super_admin') THEN '[]'::json
  ELSE (
    SELECT coalesce(json_agg(row_to_json(u)), '[]'::json)
    FROM (
      SELECT 
        p.user_id,
        p.full_name,
        p.avatar_url,
        p.school_id,
        s.name as school_name,
        ur.role,
        p.created_at
      FROM profiles p
      LEFT JOIN schools s ON s.id = p.school_id
      LEFT JOIN user_roles ur ON ur.user_id = p.user_id
      ORDER BY p.created_at DESC
    ) u
  ) END
$$;

CREATE OR REPLACE FUNCTION public.get_super_admin_analytics()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE WHEN NOT has_role(auth.uid(), 'super_admin') THEN '{}'::json
  ELSE json_build_object(
    'experiments_by_subject', (
      SELECT coalesce(json_agg(row_to_json(s)), '[]'::json)
      FROM (
        SELECT subject, count(*) as total, 
          count(*) FILTER (WHERE status = 'completed') as completed
        FROM experiment_progress GROUP BY subject
      ) s
    ),
    'monthly_signups', (
      SELECT coalesce(json_agg(row_to_json(m)), '[]'::json)
      FROM (
        SELECT to_char(created_at, 'YYYY-MM') as month, count(*) as count
        FROM profiles
        GROUP BY to_char(created_at, 'YYYY-MM')
        ORDER BY month DESC LIMIT 12
      ) m
    ),
    'top_schools', (
      SELECT coalesce(json_agg(row_to_json(ts)), '[]'::json)
      FROM (
        SELECT s.name, 
          (SELECT count(*) FROM profiles p WHERE p.school_id = s.id) as members,
          (SELECT count(*) FROM experiment_progress ep JOIN profiles p2 ON p2.user_id = ep.user_id WHERE p2.school_id = s.id AND ep.status = 'completed') as completed_labs,
          (SELECT coalesce(round(avg(qr.score::numeric / qr.total_questions * 100)), 0) FROM quiz_results qr JOIN profiles p3 ON p3.user_id = qr.user_id WHERE p3.school_id = s.id AND qr.total_questions > 0) as avg_score
        FROM schools s
        ORDER BY completed_labs DESC LIMIT 10
      ) ts
    ),
    'role_distribution', json_build_object(
      'super_admin', (SELECT count(*) FROM user_roles WHERE role = 'super_admin'),
      'school_admin', (SELECT count(*) FROM user_roles WHERE role = 'school_admin'),
      'teacher', (SELECT count(*) FROM user_roles WHERE role = 'teacher'),
      'student', (SELECT count(*) FROM user_roles WHERE role = 'student')
    )
  ) END
$$;
