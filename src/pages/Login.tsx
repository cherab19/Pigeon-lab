import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Beaker, LogIn, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSafeSession } from "@/lib/safeAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import PigeonlabLogo from "@/components/PigeonlabLogo";

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        navigate("/dashboard", { replace: true });
      }
      setCheckingSession(false);
    });

    const checkSession = async () => {
      const session = await getSafeSession();
      if (session) {
        navigate("/dashboard", { replace: true });
      } else {
        setCheckingSession(false);
      }
    };
    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({ title: t("login.failed"), description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <PigeonlabLogo size="lg" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-4">{t("login.welcomeBack")}</h2>
          <p className="opacity-80">{t("login.accessLab")}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-end">
            <LanguageToggle />
          </div>
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <PigeonlabLogo size="md" />
            </div>
            <h1 className="text-2xl font-display font-bold">{t("login.signIn")}</h1>
            <p className="text-sm text-muted-foreground mt-2">{t("login.credentials")}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input id="email" type="email" placeholder="admin@school.edu.et" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? t("login.signingIn") : <><LogIn className="w-4 h-4 mr-2" /> {t("login.signInBtn")}</>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">{t("login.registerSchool")}</Link>
          </p>
          <p className="text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">{t("nav.backToHome")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
