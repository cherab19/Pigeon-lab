import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, School, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSafeSession, getSafeUser } from "@/lib/safeAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import PigeonlabLogo from "@/components/PigeonlabLogo";

type InviteMeta = {
  full_name?: string;
  invited_role?: "teacher" | "student" | string;
  invited_school_id?: string;
};

const PRICE_PER_SEAT = 30;

export default function Signup() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    schoolName: "", schoolLocation: "", schoolPhone: "",
    teacherSeats: 2, studentSeats: 30,
  });
  const [inviteForm, setInviteForm] = useState({ fullName: "", password: "", confirmPassword: "" });
  const [inviteMeta, setInviteMeta] = useState<InviteMeta | null>(null);
  const [checkingInviteSession, setCheckingInviteSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (key: string, value: string | number) => setForm((prev) => ({ ...prev, [key]: value as never }));
  const updateInvite = (key: string, value: string) => setInviteForm((prev) => ({ ...prev, [key]: value }));

  const totalSeats = form.teacherSeats + form.studentSeats;
  const totalAmount = totalSeats * PRICE_PER_SEAT;

  useEffect(() => {
    let mounted = true;
    const hydrateInviteState = (session: Awaited<ReturnType<typeof getSafeSession>>) => {
      if (!mounted) return;
      const metadata = (session?.user?.user_metadata || {}) as InviteMeta;
      if (session && metadata.invited_school_id) {
        setInviteMeta(metadata);
        setInviteForm((prev) => ({ ...prev, fullName: prev.fullName || metadata.full_name || "" }));
      } else {
        setInviteMeta(null);
      }
      setCheckingInviteSession(false);
    };
    getSafeSession().then(hydrateInviteState);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateInviteState(session);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: t("signup.passwordsMismatch"), variant: "destructive" }); return;
    }
    if (form.password.length < 6) {
      toast({ title: t("signup.passwordLength"), variant: "destructive" }); return;
    }
    if (totalSeats <= 0) {
      toast({ title: "Select at least 1 seat", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chapa-initiate-signup", {
        body: {
          email: form.email,
          password: form.password,
          full_name: form.fullName,
          school_name: form.schoolName,
          school_location: form.schoolLocation,
          school_phone: form.schoolPhone,
          teacher_seats: form.teacherSeats,
          student_seats: form.studentSeats,
          return_url: `${window.location.origin}/signup/complete`,
        },
      });
      if (error || !data?.checkout_url) {
        toast({
          title: "Could not start payment",
          description: data?.error || error?.message || "Please try again.",
          variant: "destructive",
        });
        return;
      }
      // Persist tx_ref so /signup/complete can recover it if Chapa drops the query
      try { sessionStorage.setItem("pigeonlab.signup.tx_ref", data.tx_ref); } catch {}
      // Redirect to Chapa checkout
      window.location.href = data.checkout_url;
    } finally {
      setLoading(false);
    }
  };

  const handleInviteActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteForm.password !== inviteForm.confirmPassword) {
      toast({ title: t("signup.passwordsMismatch"), variant: "destructive" }); return;
    }
    if (inviteForm.password.length < 6) {
      toast({ title: t("signup.passwordLength"), variant: "destructive" }); return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: inviteForm.password, data: { full_name: inviteForm.fullName } });
    if (!error) {
      const user = await getSafeUser();
      if (user) await supabase.from("profiles").update({ full_name: inviteForm.fullName }).eq("user_id", user.id);
    }
    setLoading(false);
    if (error) {
      toast({ title: t("invite.failed"), description: error.message, variant: "destructive" }); return;
    }
    toast({ title: t("invite.activated"), description: t("invite.welcome") });
    navigate("/dashboard", { replace: true });
  };

  if (checkingInviteSession) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (inviteMeta) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
          <div className="text-primary-foreground max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <PigeonlabLogo size="lg" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-4">{t("invite.title")}</h2>
            <p className="opacity-80">{t("invite.desc")}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md space-y-6">
            <div className="flex justify-end"><LanguageToggle /></div>
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                <PigeonlabLogo size="md" />
              </div>
              <h1 className="text-2xl font-display font-bold">{t("invite.complete")}</h1>
              <p className="text-sm text-muted-foreground mt-2">
                {t("common.role")}: <span className="font-medium capitalize text-foreground">{inviteMeta.invited_role || "member"}</span>
              </p>
            </div>
            <form onSubmit={handleInviteActivation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteName">{t("signup.fullName")}</Label>
                <Input id="inviteName" placeholder={t("signup.fullName")} value={inviteForm.fullName} onChange={(e) => updateInvite("fullName", e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="invitePassword">{t("signup.password")}</Label>
                  <Input id="invitePassword" type="password" placeholder="••••••••" value={inviteForm.password} onChange={(e) => updateInvite("password", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteConfirmPassword">{t("signup.confirm")}</Label>
                  <Input id="inviteConfirmPassword" type="password" placeholder="••••••••" value={inviteForm.confirmPassword} onChange={(e) => updateInvite("confirmPassword", e.target.value)} required />
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? t("invite.activating") : <><UserPlus className="w-4 h-4 mr-2" /> {t("invite.activateBtn")}</>}
              </Button>
            </form>
            <p className="text-center">
              <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">{t("nav.backToHome")}</Link>
            </p>
          </div>
        </div>
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
          <h2 className="text-2xl font-display font-bold mb-4">{t("signup.registerSchool")}</h2>
          <p className="opacity-80">{t("signup.registerDesc")}</p>
          <div className="mt-8 space-y-3 text-sm opacity-70">
            <p>✓ {t("signup.simulations")}</p>
            <p>✓ {t("signup.subjects")}</p>
            <p>✓ {t("signup.grades")}</p>
            <p>✓ Pay once · {PRICE_PER_SEAT} ETB / seat / month</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-end"><LanguageToggle /></div>
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <PigeonlabLogo size="md" />
            </div>
            <h1 className="text-2xl font-display font-bold">{t("signup.createAccount")}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Pay your school's subscription first — your account is created the moment payment succeeds.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("signup.adminInfo")}</p>
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("signup.fullName")}</Label>
                <Input id="fullName" placeholder="Abebe Kebede" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input id="email" type="email" placeholder="admin@school.edu.et" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("signup.password")}</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => update("password", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("signup.confirm")}</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 pt-2">
                <School className="w-3.5 h-3.5" /> {t("signup.schoolInfo")}
              </p>
              <div className="space-y-2">
                <Label htmlFor="schoolName">{t("signup.schoolName")}</Label>
                <Input id="schoolName" placeholder="Addis Ababa Science Academy" value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolLocation">{t("signup.location")}</Label>
                <Input id="schoolLocation" placeholder="Addis Ababa" value={form.schoolLocation} onChange={(e) => update("schoolLocation", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolPhone">{t("signup.phone")}</Label>
                <Input id="schoolPhone" type="tel" placeholder="+251 9XX XXX XXXX" value={form.schoolPhone} onChange={(e) => update("schoolPhone", e.target.value)} />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 pt-2">
                <CreditCard className="w-3.5 h-3.5" /> Subscription seats
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="teacherSeats">{t("common.teachers")}</Label>
                  <Input id="teacherSeats" type="number" min={0} value={form.teacherSeats}
                    onChange={(e) => update("teacherSeats", Math.max(0, parseInt(e.target.value || "0", 10)))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentSeats">{t("common.students")}</Label>
                  <Input id="studentSeats" type="number" min={0} value={form.studentSeats}
                    onChange={(e) => update("studentSeats", Math.max(0, parseInt(e.target.value || "0", 10)))} />
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Total seats</span><span className="font-medium">{totalSeats}</span></div>
                <div className="flex justify-between"><span>Price / seat / month</span><span>{PRICE_PER_SEAT} ETB</span></div>
                <div className="flex justify-between text-base pt-1 border-t border-border">
                  <span className="font-medium">Total due now</span>
                  <span className="font-display font-bold text-primary">{totalAmount} ETB</span>
                </div>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={loading || totalSeats <= 0}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting to payment…</>
              ) : (
                <><CreditCard className="w-4 h-4 mr-2" /> Pay {totalAmount} ETB & create account</>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              You'll be redirected to Chapa to complete payment securely. Your account is created automatically once the payment is confirmed.
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("signup.haveAccount")}{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">{t("signup.signIn")}</Link>
          </p>
          <p className="text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">{t("nav.backToHome")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
