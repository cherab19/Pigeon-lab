import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CreditCard, Loader2, XCircle } from "lucide-react";
import PigeonlabLogo from "@/components/PigeonlabLogo";

type State = "verifying" | "success" | "pending" | "error";

export default function SignupComplete() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<State>("verifying");
  const [message, setMessage] = useState<string>("Confirming your payment with Chapa…");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const tx_ref =
      params.get("tx_ref") ||
      params.get("trx_ref") ||
      (() => {
        try {
          return sessionStorage.getItem("pigeonlab.signup.tx_ref") || sessionStorage.getItem("dovelab.signup.tx_ref");
        } catch {
          return null;
        }
      })();

    if (!tx_ref) {
      setState("error");
      setMessage("Missing payment reference. Please return to signup and try again.");
      return;
    }

    const finalize = async () => {
      // Poll up to ~5 minutes for the payment to be confirmed
      const start = Date.now();
      const TIMEOUT = 5 * 60 * 1000;
      let attempt = 0;
      while (Date.now() - start < TIMEOUT) {
        attempt++;
        const { data, error } = await supabase.functions.invoke("chapa-finalize-signup", {
          body: { tx_ref },
        });
        if (error) {
          // Network/transient — retry
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        if (data?.status === "success") {
          // Account ready — try to fetch the password from sessionStorage to log in
          const email: string = data.email;
          let password: string | null = null;
          try { password = sessionStorage.getItem(`pigeonlab.signup.pw.${email}`) || sessionStorage.getItem(`dovelab.signup.pw.${email}`); } catch {}
          // We didn't actually store the password client-side for security, so just send to login.
          try {
            sessionStorage.removeItem("pigeonlab.signup.tx_ref");
            sessionStorage.removeItem("dovelab.signup.tx_ref");
            if (password) {
              sessionStorage.removeItem(`pigeonlab.signup.pw.${email}`);
              sessionStorage.removeItem(`dovelab.signup.pw.${email}`);
            }
          } catch {}
          setState("success");
          setMessage("Payment confirmed! Your account has been created. Redirecting you to login…");
          setTimeout(() => navigate(`/login?email=${encodeURIComponent(email)}`, { replace: true }), 1800);
          return;
        }
        const chapaMsg = data?.message || data?.chapa?.message || null;
        setMessage(`Waiting for payment confirmation… (attempt ${attempt})${chapaMsg ? ` — ${chapaMsg}` : ''}`);
        await new Promise(r => setTimeout(r, 3000));
      }
      setState("pending");
      setMessage("We haven't received confirmation from Chapa yet. If you completed the payment, refresh this page or try again later.");
    };
    finalize();
  }, [params, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center"><PigeonlabLogo size="lg" /></div>

        <div className="rounded-2xl border border-border bg-card p-8 space-y-4 shadow-elegant">
          {state === "verifying" && (
            <>
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
              <h1 className="text-xl font-display font-bold">Finalizing your subscription</h1>
            </>
          )}
          {state === "success" && (
            <>
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <h1 className="text-xl font-display font-bold">Welcome to Pigeonlab!</h1>
            </>
          )}
          {state === "pending" && (
            <>
              <CreditCard className="w-10 h-10 mx-auto text-amber-500" />
              <h1 className="text-xl font-display font-bold">Payment still pending</h1>
            </>
          )}
          {state === "error" && (
            <>
              <XCircle className="w-10 h-10 mx-auto text-destructive" />
              <h1 className="text-xl font-display font-bold">Something went wrong</h1>
            </>
          )}
          <p className="text-sm text-muted-foreground">{message}</p>

          {state !== "verifying" && state !== "success" && (
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" onClick={() => window.location.reload()}>Refresh status</Button>
              <Button asChild variant="ghost"><Link to="/signup">Back to signup</Link></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
