-- Pending signups: store School Admin signup data BEFORE payment
CREATE TABLE IF NOT EXISTS public.pending_school_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_ref TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  password TEXT NOT NULL, -- short-lived; deleted after account creation
  full_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  school_location TEXT,
  school_phone TEXT,
  teacher_seats INTEGER NOT NULL DEFAULT 0,
  student_seats INTEGER NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | consumed | failed
  chapa_response JSONB,
  consumed_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_pending_signups_email ON public.pending_school_signups(email);
CREATE INDEX IF NOT EXISTS idx_pending_signups_status ON public.pending_school_signups(status);

ALTER TABLE public.pending_school_signups ENABLE ROW LEVEL SECURITY;

-- No PERMISSIVE policies for select/insert/update/delete by anon or authenticated:
-- only the service role (used by edge functions) may access this table.
-- Block any super-admin read of plaintext passwords too.

CREATE TRIGGER trg_pending_signups_updated_at
BEFORE UPDATE ON public.pending_school_signups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
