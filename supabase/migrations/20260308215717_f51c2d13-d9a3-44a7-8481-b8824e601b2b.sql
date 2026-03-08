
-- Classrooms: links a teacher to a grade + subject within a school
CREATE TABLE public.classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL,
  subject text NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology')),
  grade integer NOT NULL CHECK (grade BETWEEN 9 AND 12),
  section text DEFAULT 'A',
  name text GENERATED ALWAYS AS (
    'Grade ' || grade || section || ' - ' || initcap(subject)
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, teacher_id, subject, grade, section)
);

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

-- Classroom students: many-to-many
CREATE TABLE public.classroom_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);

ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;

-- Assignments: teacher assigns experiments to a classroom
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  experiment_id text NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Announcements: teacher posts to classroom
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is member of classroom (teacher or student)
CREATE OR REPLACE FUNCTION public.is_classroom_member(_user_id uuid, _classroom_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM classrooms WHERE id = _classroom_id AND teacher_id = _user_id
    UNION ALL
    SELECT 1 FROM classroom_students WHERE classroom_id = _classroom_id AND student_id = _user_id
  )
$$;

-- Helper: check if user is classroom teacher
CREATE OR REPLACE FUNCTION public.is_classroom_teacher(_user_id uuid, _classroom_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM classrooms WHERE id = _classroom_id AND teacher_id = _user_id
  )
$$;

-- RLS: classrooms
CREATE POLICY "School members can view classrooms" ON public.classrooms
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

CREATE POLICY "School admins can manage classrooms" ON public.classrooms
  FOR ALL TO authenticated
  USING (school_id = get_my_school_id() AND has_role(auth.uid(), 'school_admin'));

-- RLS: classroom_students
CREATE POLICY "Classroom members can view students" ON public.classroom_students
  FOR SELECT TO authenticated
  USING (is_classroom_member(auth.uid(), classroom_id));

CREATE POLICY "School admins can manage classroom students" ON public.classroom_students
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classrooms c WHERE c.id = classroom_id AND c.school_id = get_my_school_id()
    )
    AND has_role(auth.uid(), 'school_admin')
  );

-- RLS: assignments
CREATE POLICY "Classroom members can view assignments" ON public.assignments
  FOR SELECT TO authenticated
  USING (is_classroom_member(auth.uid(), classroom_id));

CREATE POLICY "Teachers can manage assignments" ON public.assignments
  FOR INSERT TO authenticated
  WITH CHECK (is_classroom_teacher(auth.uid(), classroom_id) AND created_by = auth.uid());

CREATE POLICY "Teachers can update assignments" ON public.assignments
  FOR UPDATE TO authenticated
  USING (is_classroom_teacher(auth.uid(), classroom_id));

CREATE POLICY "Teachers can delete assignments" ON public.assignments
  FOR DELETE TO authenticated
  USING (is_classroom_teacher(auth.uid(), classroom_id));

-- RLS: announcements
CREATE POLICY "Classroom members can view announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (is_classroom_member(auth.uid(), classroom_id));

CREATE POLICY "Teachers can create announcements" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (is_classroom_teacher(auth.uid(), classroom_id) AND author_id = auth.uid());

CREATE POLICY "Teachers can delete announcements" ON public.announcements
  FOR DELETE TO authenticated
  USING (is_classroom_teacher(auth.uid(), classroom_id));

-- Triggers for updated_at
CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON public.classrooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
