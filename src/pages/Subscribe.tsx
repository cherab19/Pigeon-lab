import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, CreditCard, Sparkles } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AxislabLogo from "@/components/AxislabLogo";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";
import { useSeatQuota } from "@/hooks/useSeatQuota";
import SeatUsageCard from "@/components/payments/SeatUsageCard";
import ChapaCheckoutModal from "@/components/payments/ChapaCheckoutModal";
import { toast } from "@/components/ui/sonner";

export default function Subscribe() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [open, setOpen] = useState(false);
  const { quota, loading, refresh } = useSeatQuota(schoolId);

  useEffect(() => {
    (async () => {
      const user = await getSafeUser();
      if (!user) { navigate("/login"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "school_admin" as any);
      if (!roles || roles.length === 0) { navigate("/dashboard"); return; }
      const { data: profile } = await supabase.from("profiles").select("school_id").eq("user_id", user.id).single();
      if (!profile?.school_id) { navigate("/dashboard"); return; }
      setSchoolId(profile.school_id);
      const { data: s } = await supabase.from("schools").select("name").eq("id", profile.school_id).single();
      if (s) setSchoolName(s.name);

      // If returning from Chapa with a tx_ref, verify it
      const tx = params.get("tx_ref") || params.get("trx_ref");
      if (tx) {
        const { data } = await supabase.functions.invoke("chapa-verify-payment", { body: { tx_ref: tx } });
        if (data?.status === "success") {
          toast.success(t("pay.success") || "Payment confirmed — seats added!");
          refresh();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2"><AxislabLogo size="sm" /></Link>
          <LanguageToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ChevronLeft className="w-4 h-4 mr-1" /> {t("nav.backToDashboard")}</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <CreditCard className="w-7 h-7 text-primary" /> {t("pay.subscriptionTitle") || "Subscription & Seats"}
            </h1>
            {schoolName && <p className="text-muted-foreground mt-1">{schoolName}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <SeatUsageCard quota={quota} loading={loading} onBuyMore={() => setOpen(true)} />

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-secondary" /> {t("landing.planName")}</CardTitle>
                <CardDescription>{t("pay.standardDesc") || "Pay only for the seats you need."}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold">30</span>
                  <span className="text-muted-foreground">ETB / {t("pay.seat") || "seat"} / {t("pay.month") || "month"}</span>
                </div>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• {t("pay.featSeats") || "Buy teacher and student seats separately"}</li>
                  <li>• {t("pay.featInvite") || "Invite up to your purchased capacity"}</li>
                  <li>• {t("pay.featTopup") || "Top up anytime via Chapa"}</li>
                </ul>
                <Button className="w-full mt-3 gap-2" onClick={() => setOpen(true)}>
                  <CreditCard className="w-4 h-4" /> {t("pay.buyCta") || "Buy seats"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      <ChapaCheckoutModal
        open={open}
        onOpenChange={setOpen}
        defaultTeacherSeats={5}
        defaultStudentSeats={50}
        onPaymentSuccess={refresh}
      />
    </div>
  );
}
