
-- Subscription status tracking for schools
CREATE TABLE public.school_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'trial')),
  student_count integer NOT NULL DEFAULT 0,
  price_per_student numeric NOT NULL DEFAULT 30,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  activated_at timestamptz DEFAULT now(),
  suspended_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id)
);

-- Enable RLS
ALTER TABLE public.school_subscriptions ENABLE ROW LEVEL SECURITY;

-- Super admin can do everything (via security definer function)
-- School admins can view their own subscription
CREATE POLICY "School admins can view own subscription"
ON public.school_subscriptions
FOR SELECT
TO authenticated
USING (
  school_id IN (
    SELECT p.school_id FROM public.profiles p WHERE p.user_id = auth.uid()
  )
);

-- Update trigger for updated_at
CREATE TRIGGER update_school_subscriptions_updated_at
  BEFORE UPDATE ON public.school_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create subscription when a school is created
CREATE OR REPLACE FUNCTION public.handle_new_school_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.school_subscriptions (school_id, status, student_count)
  VALUES (NEW.id, 'trial', 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_school_created_subscription
  AFTER INSERT ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_school_subscription();

-- Function for super admin to get subscription overview
CREATE OR REPLACE FUNCTION public.get_subscription_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_active', (SELECT count(*) FROM school_subscriptions WHERE status = 'active'),
    'total_expired', (SELECT count(*) FROM school_subscriptions WHERE status = 'expired'),
    'total_suspended', (SELECT count(*) FROM school_subscriptions WHERE status = 'suspended'),
    'total_trial', (SELECT count(*) FROM school_subscriptions WHERE status = 'trial'),
    'total_revenue', (SELECT coalesce(sum(student_count * price_per_student), 0) FROM school_subscriptions WHERE status = 'active'),
    'total_paying_students', (SELECT coalesce(sum(student_count), 0) FROM school_subscriptions WHERE status = 'active'),
    'subscriptions', (
      SELECT coalesce(json_agg(row_to_json(sub)), '[]'::json)
      FROM (
        SELECT 
          ss.id,
          ss.school_id,
          s.name as school_name,
          s.location as school_location,
          s.email as school_email,
          s.phone as school_phone,
          ss.status,
          ss.student_count,
          ss.price_per_student,
          ss.billing_cycle,
          ss.current_period_start,
          ss.current_period_end,
          ss.activated_at,
          ss.suspended_at,
          ss.notes,
          (SELECT count(*) FROM profiles p WHERE p.school_id = s.id) as total_members,
          (ss.student_count * ss.price_per_student) as monthly_revenue
        FROM school_subscriptions ss
        JOIN schools s ON s.id = ss.school_id
        ORDER BY s.name
      ) sub
    )
  )
$$;

-- Edge function or RPC to manage subscriptions (super admin only)
CREATE OR REPLACE FUNCTION public.update_school_subscription(
  _school_id uuid,
  _status text DEFAULT NULL,
  _student_count integer DEFAULT NULL,
  _notes text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super_admin can call this
  IF NOT has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE school_subscriptions SET
    status = COALESCE(_status, status),
    student_count = COALESCE(_student_count, student_count),
    notes = COALESCE(_notes, notes),
    suspended_at = CASE WHEN _status = 'suspended' THEN now() ELSE suspended_at END,
    current_period_start = CASE WHEN _status = 'active' AND status != 'active' THEN now() ELSE current_period_start END,
    current_period_end = CASE WHEN _status = 'active' AND status != 'active' THEN now() + interval '30 days' ELSE current_period_end END
  WHERE school_id = _school_id;

  RETURN json_build_object('success', true);
END;
$$;

-- Function to check if a user's school has active subscription
CREATE OR REPLACE FUNCTION public.check_subscription_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN school_subscriptions ss ON ss.school_id = p.school_id
    WHERE p.user_id = _user_id
      AND ss.status IN ('active', 'trial')
  )
$$;
