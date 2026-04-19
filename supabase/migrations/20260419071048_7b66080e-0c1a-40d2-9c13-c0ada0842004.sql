
-- ============ LIBRARY TABLES ============

CREATE TABLE public.textbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  cover_url TEXT,
  file_url TEXT NOT NULL,
  total_pages INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.textbook_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  textbook_id UUID NOT NULL REFERENCES public.textbooks(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_page INTEGER NOT NULL DEFAULT 1,
  end_page INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.chapter_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.textbook_chapters(id) ON DELETE CASCADE,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_by_ai BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.chapter_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  chapter_id UUID NOT NULL REFERENCES public.textbook_chapters(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  textbook_id UUID NOT NULL REFERENCES public.textbooks(id) ON DELETE CASCADE,
  last_page INTEGER NOT NULL DEFAULT 1,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, textbook_id)
);

-- ============ SUCCESS GUIDE TABLES ============

CREATE TABLE public.student_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_of DATE NOT NULL,
  what_went_well TEXT,
  what_to_improve TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_of)
);

CREATE TABLE public.student_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.student_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_key)
);

-- ============ ENABLE RLS ============
ALTER TABLE public.textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbook_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES: textbooks ============
CREATE POLICY "Anyone authenticated can view textbooks" ON public.textbooks
  AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admins manage textbooks" ON public.textbooks
  AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- ============ POLICIES: textbook_chapters ============
CREATE POLICY "Anyone authenticated can view chapters" ON public.textbook_chapters
  AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admins manage chapters" ON public.textbook_chapters
  AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- ============ POLICIES: chapter_quizzes ============
CREATE POLICY "Anyone authenticated can view chapter quizzes" ON public.chapter_quizzes
  AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admins manage chapter quizzes" ON public.chapter_quizzes
  AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- ============ POLICIES: chapter_quiz_results ============
CREATE POLICY "Users view own quiz results" ON public.chapter_quiz_results
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Teachers view school quiz results" ON public.chapter_quiz_results
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (
    (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'school_admin'))
    AND user_id IN (SELECT user_id FROM profiles WHERE school_id = get_my_school_id())
  );
CREATE POLICY "Users insert own quiz results" ON public.chapter_quiz_results
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============ POLICIES: reading_progress ============
CREATE POLICY "Users manage own reading progress" ON public.reading_progress
  AS PERMISSIVE FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============ POLICIES: student_reflections ============
CREATE POLICY "Users manage own reflections" ON public.student_reflections
  AS PERMISSIVE FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============ POLICIES: student_routines ============
CREATE POLICY "Users manage own routines" ON public.student_routines
  AS PERMISSIVE FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============ POLICIES: student_gamification ============
CREATE POLICY "Users manage own gamification" ON public.student_gamification
  AS PERMISSIVE FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============ POLICIES: student_badges ============
CREATE POLICY "Users view own badges" ON public.student_badges
  AS PERMISSIVE FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own badges" ON public.student_badges
  AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============ TIMESTAMP TRIGGERS ============
CREATE TRIGGER update_textbooks_updated_at BEFORE UPDATE ON public.textbooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chapter_quizzes_updated_at BEFORE UPDATE ON public.chapter_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_routines_updated_at BEFORE UPDATE ON public.student_routines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_gamification_updated_at BEFORE UPDATE ON public.student_gamification
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ STORAGE: textbooks bucket ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('textbooks', 'textbooks', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read textbook files" ON storage.objects
  AS PERMISSIVE FOR SELECT TO public
  USING (bucket_id = 'textbooks');

CREATE POLICY "Super admins upload textbook files" ON storage.objects
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'textbooks' AND has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins update textbook files" ON storage.objects
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (bucket_id = 'textbooks' AND has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins delete textbook files" ON storage.objects
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (bucket_id = 'textbooks' AND has_role(auth.uid(), 'super_admin'));

-- ============ INDEXES ============
CREATE INDEX idx_textbooks_grade_subject ON public.textbooks(grade, subject);
CREATE INDEX idx_chapters_textbook ON public.textbook_chapters(textbook_id, chapter_number);
CREATE INDEX idx_chapter_quizzes_chapter ON public.chapter_quizzes(chapter_id);
CREATE INDEX idx_quiz_results_user ON public.chapter_quiz_results(user_id);
CREATE INDEX idx_reading_progress_user ON public.reading_progress(user_id);
