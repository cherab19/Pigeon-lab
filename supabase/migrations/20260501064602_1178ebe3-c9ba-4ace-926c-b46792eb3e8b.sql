
-- Add seat tracking columns to school_subscriptions
ALTER TABLE public.school_subscriptions
  ADD COLUMN IF NOT EXISTS teacher_seats integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS student_seats integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_seats integer GENERATED ALWAYS AS (teacher_seats + student_seats) STORED;

-- Payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  user_id uuid NOT NULL,
  tx_ref text NOT NULL UNIQUE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ETB',
  teacher_seats integer NOT NULL DEFAULT 0,
  student_seats integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  chapa_response jsonb,
  applied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "School admins view own school transactions" ON public.payment_transactions;
CREATE POLICY "School admins view own school transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (
  school_id = public.get_my_school_id()
  AND public.has_role(auth.uid(), 'school_admin'::app_role)
);

DROP POLICY IF EXISTS "Super admins view all transactions" ON public.payment_transactions;
CREATE POLICY "Super admins view all transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_payment_tx_school ON public.payment_transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_status ON public.payment_transactions(status);

CREATE TRIGGER trg_payment_tx_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Quota check function
CREATE OR REPLACE FUNCTION public.can_invite_member(_school_id uuid, _role text)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _teacher_seats int := 0;
  _student_seats int := 0;
  _used_teachers int := 0;
  _used_students int := 0;
  _allowed boolean := false;
BEGIN
  SELECT COALESCE(teacher_seats,0), COALESCE(student_seats,0)
    INTO _teacher_seats, _student_seats
  FROM public.school_subscriptions WHERE school_id = _school_id;

  SELECT
    COUNT(*) FILTER (WHERE ur.role = 'teacher'),
    COUNT(*) FILTER (WHERE ur.role = 'student')
  INTO _used_teachers, _used_students
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.user_id
  WHERE p.school_id = _school_id;

  IF _role = 'teacher' THEN
    _allowed := _used_teachers < _teacher_seats;
  ELSIF _role = 'student' THEN
    _allowed := _used_students < _student_seats;
  END IF;

  RETURN json_build_object(
    'allowed', _allowed,
    'teacher_seats', _teacher_seats,
    'student_seats', _student_seats,
    'used_teachers', _used_teachers,
    'used_students', _used_students,
    'available_teachers', GREATEST(_teacher_seats - _used_teachers, 0),
    'available_students', GREATEST(_student_seats - _used_students, 0)
  );
END;
$$;

-- Apply purchased seats after successful payment (called by webhook with service role)
CREATE OR REPLACE FUNCTION public.apply_seat_topup(_tx_ref text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tx record;
BEGIN
  SELECT * INTO _tx FROM public.payment_transactions WHERE tx_ref = _tx_ref;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'transaction_not_found');
  END IF;
  IF _tx.applied_at IS NOT NULL THEN
    RETURN json_build_object('success', true, 'already_applied', true);
  END IF;

  UPDATE public.school_subscriptions
    SET teacher_seats = teacher_seats + _tx.teacher_seats,
        student_seats = student_seats + _tx.student_seats,
        status = 'active',
        activated_at = COALESCE(activated_at, now()),
        current_period_start = COALESCE(current_period_start, now()),
        current_period_end = GREATEST(COALESCE(current_period_end, now()), now() + interval '30 days')
  WHERE school_id = _tx.school_id;

  UPDATE public.payment_transactions
    SET status = 'success', applied_at = now()
  WHERE tx_ref = _tx_ref;

  RETURN json_build_object('success', true, 'school_id', _tx.school_id);
END;
$$;

-- Allow school admins to read seat usage via RPC (no direct UPDATE permission needed)
GRANT EXECUTE ON FUNCTION public.can_invite_member(uuid, text) TO authenticated;
