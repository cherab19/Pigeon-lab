
-- Student progress tracking
CREATE TABLE public.experiment_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experiment_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, experiment_id)
);

ALTER TABLE public.experiment_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.experiment_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress" ON public.experiment_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON public.experiment_progress
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Teachers can view progress of students in their school
CREATE POLICY "Teachers can view school student progress" ON public.experiment_progress
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT p2.user_id FROM profiles p2
      WHERE p2.school_id IN (
        SELECT p1.school_id FROM profiles p1 WHERE p1.user_id = auth.uid()
      )
    )
    AND (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'school_admin'))
  );

-- Quiz results
CREATE TABLE public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experiment_id TEXT NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('pre', 'post')),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results" ON public.quiz_results
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quiz results" ON public.quiz_results
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can view school quiz results" ON public.quiz_results
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT p2.user_id FROM profiles p2
      WHERE p2.school_id IN (
        SELECT p1.school_id FROM profiles p1 WHERE p1.user_id = auth.uid()
      )
    )
    AND (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'school_admin'))
  );
