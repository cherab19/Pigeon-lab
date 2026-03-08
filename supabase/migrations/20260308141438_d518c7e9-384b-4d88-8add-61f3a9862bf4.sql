
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT json_build_object(
    'schools', (SELECT count(*) FROM public.schools),
    'students', (SELECT count(*) FROM public.user_roles WHERE role = 'student'),
    'experiments', 0
  )
$$;
