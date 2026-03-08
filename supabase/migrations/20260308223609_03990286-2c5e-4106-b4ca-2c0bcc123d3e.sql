
-- Drop ALL existing restrictive policies and recreate as PERMISSIVE

-- ============ experiment_progress ============
DROP POLICY IF EXISTS "Users can view own progress" ON public.experiment_progress;
DROP POLICY IF EXISTS "Teachers can view school student progress" ON public.experiment_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.experiment_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.experiment_progress;

CREATE POLICY "Users can view own progress" ON public.experiment_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers can view school student progress" ON public.experiment_progress FOR SELECT TO authenticated USING (
  (user_id IN (SELECT p2.user_id FROM profiles p2 WHERE p2.school_id IN (SELECT p1.school_id FROM profiles p1 WHERE p1.user_id = auth.uid())))
  AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'school_admin'))
);
CREATE POLICY "Users can insert own progress" ON public.experiment_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own progress" ON public.experiment_progress FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ============ quiz_results ============
DROP POLICY IF EXISTS "Users can view own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Teachers can view school quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can insert own quiz results" ON public.quiz_results;

CREATE POLICY "Users can view own quiz results" ON public.quiz_results FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers can view school quiz results" ON public.quiz_results FOR SELECT TO authenticated USING (
  (user_id IN (SELECT p2.user_id FROM profiles p2 WHERE p2.school_id IN (SELECT p1.school_id FROM profiles p1 WHERE p1.user_id = auth.uid())))
  AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'school_admin'))
);
CREATE POLICY "Users can insert own quiz results" ON public.quiz_results FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============ profiles ============
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "School members can view profiles in same school" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "School members can view profiles in same school" ON public.profiles FOR SELECT TO authenticated USING (school_id = get_my_school_id());
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ============ user_roles ============
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============ schools ============
DROP POLICY IF EXISTS "Schools are viewable by their members" ON public.schools;
DROP POLICY IF EXISTS "School admins can update their school" ON public.schools;

CREATE POLICY "Schools are viewable by their members" ON public.schools FOR SELECT TO authenticated USING (id IN (SELECT school_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "School admins can update their school" ON public.schools FOR UPDATE TO authenticated USING (
  (id IN (SELECT school_id FROM profiles WHERE user_id = auth.uid())) AND has_role(auth.uid(), 'school_admin')
);

-- ============ school_subscriptions ============
DROP POLICY IF EXISTS "School admins can view own subscription" ON public.school_subscriptions;

CREATE POLICY "School admins can view own subscription" ON public.school_subscriptions FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE user_id = auth.uid()));

-- ============ classrooms ============
DROP POLICY IF EXISTS "School members can view classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "School admins can manage classrooms" ON public.classrooms;

CREATE POLICY "School members can view classrooms" ON public.classrooms FOR SELECT TO authenticated USING (school_id = get_my_school_id());
CREATE POLICY "School admins can manage classrooms" ON public.classrooms FOR ALL TO authenticated USING (
  (school_id = get_my_school_id()) AND has_role(auth.uid(), 'school_admin')
) WITH CHECK (
  (school_id = get_my_school_id()) AND has_role(auth.uid(), 'school_admin')
);

-- ============ classroom_students ============
DROP POLICY IF EXISTS "Classroom members can view students" ON public.classroom_students;
DROP POLICY IF EXISTS "School admins can manage classroom students" ON public.classroom_students;

CREATE POLICY "Classroom members can view students" ON public.classroom_students FOR SELECT TO authenticated USING (is_classroom_member(auth.uid(), classroom_id));
CREATE POLICY "School admins can manage classroom students" ON public.classroom_students FOR ALL TO authenticated USING (
  (EXISTS (SELECT 1 FROM classrooms c WHERE c.id = classroom_students.classroom_id AND c.school_id = get_my_school_id())) AND has_role(auth.uid(), 'school_admin')
) WITH CHECK (
  (EXISTS (SELECT 1 FROM classrooms c WHERE c.id = classroom_students.classroom_id AND c.school_id = get_my_school_id())) AND has_role(auth.uid(), 'school_admin')
);

-- ============ assignments ============
DROP POLICY IF EXISTS "Classroom members can view assignments" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can manage assignments" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can update assignments" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can delete assignments" ON public.assignments;

CREATE POLICY "Classroom members can view assignments" ON public.assignments FOR SELECT TO authenticated USING (is_classroom_member(auth.uid(), classroom_id));
CREATE POLICY "Teachers can manage assignments" ON public.assignments FOR INSERT TO authenticated WITH CHECK (is_classroom_teacher(auth.uid(), classroom_id) AND created_by = auth.uid());
CREATE POLICY "Teachers can update assignments" ON public.assignments FOR UPDATE TO authenticated USING (is_classroom_teacher(auth.uid(), classroom_id));
CREATE POLICY "Teachers can delete assignments" ON public.assignments FOR DELETE TO authenticated USING (is_classroom_teacher(auth.uid(), classroom_id));

-- ============ announcements ============
DROP POLICY IF EXISTS "Classroom members can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers can delete announcements" ON public.announcements;

CREATE POLICY "Classroom members can view announcements" ON public.announcements FOR SELECT TO authenticated USING (is_classroom_member(auth.uid(), classroom_id));
CREATE POLICY "Teachers can create announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (is_classroom_teacher(auth.uid(), classroom_id) AND author_id = auth.uid());
CREATE POLICY "Teachers can delete announcements" ON public.announcements FOR DELETE TO authenticated USING (is_classroom_teacher(auth.uid(), classroom_id));
