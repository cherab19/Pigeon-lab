
CREATE OR REPLACE FUNCTION public.get_super_admin_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'total_schools', (SELECT count(*) FROM public.schools),
    'total_users', (SELECT count(*) FROM public.profiles),
    'total_students', (SELECT count(*) FROM public.user_roles WHERE role = 'student'),
    'total_teachers', (SELECT count(*) FROM public.user_roles WHERE role = 'teacher'),
    'total_admins', (SELECT count(*) FROM public.user_roles WHERE role = 'school_admin'),
    'experiments_started', (SELECT count(*) FROM public.experiment_progress),
    'experiments_completed', (SELECT count(*) FROM public.experiment_progress WHERE status = 'completed'),
    'avg_time_spent', (SELECT coalesce(round(avg(time_spent_seconds)), 0) FROM public.experiment_progress WHERE status = 'completed'),
    'quizzes_taken', (SELECT count(*) FROM public.quiz_results),
    'avg_quiz_score', (SELECT coalesce(round(avg(score::numeric / total_questions * 100)), 0) FROM public.quiz_results WHERE total_questions > 0),
    'school_details', (
      SELECT coalesce(json_agg(row_to_json(s)), '[]'::json)
      FROM (
        SELECT 
          sch.id,
          sch.name,
          (SELECT count(*) FROM public.profiles p WHERE p.school_id = sch.id) as member_count,
          (SELECT count(*) FROM public.experiment_progress ep 
           JOIN public.profiles p2 ON p2.user_id = ep.user_id 
           WHERE p2.school_id = sch.id AND ep.status = 'completed') as completed_experiments
        FROM public.schools sch
        ORDER BY sch.name
      ) s
    )
  )
$$;
