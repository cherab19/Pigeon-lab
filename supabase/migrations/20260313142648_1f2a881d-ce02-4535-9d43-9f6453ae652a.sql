
CREATE OR REPLACE FUNCTION public.get_school_members_with_roles()
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT coalesce(json_agg(row_to_json(m)), '[]'::json)
  FROM (
    SELECT p.user_id, p.full_name, ur.role::text
    FROM profiles p
    LEFT JOIN user_roles ur ON ur.user_id = p.user_id
    WHERE p.school_id = get_my_school_id()
    ORDER BY p.full_name
  ) m
$$;
