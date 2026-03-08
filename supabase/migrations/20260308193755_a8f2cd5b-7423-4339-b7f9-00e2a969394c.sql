
-- Backfill subscriptions for existing schools that don't have one
INSERT INTO public.school_subscriptions (school_id, status, student_count)
SELECT s.id, 'trial', 0
FROM public.schools s
WHERE NOT EXISTS (
  SELECT 1 FROM public.school_subscriptions ss WHERE ss.school_id = s.id
);
