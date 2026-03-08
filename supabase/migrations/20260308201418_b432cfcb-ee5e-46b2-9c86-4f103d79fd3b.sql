
-- Create a helper function to get the caller's school_id without hitting RLS
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT school_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "School members can view profiles in same school" ON public.profiles;

-- Recreate it using the security definer function (no recursion)
CREATE POLICY "School members can view profiles in same school"
ON public.profiles
FOR SELECT
TO authenticated
USING (school_id = public.get_my_school_id());
