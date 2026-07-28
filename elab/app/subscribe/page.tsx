"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, CreditCard, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PigeonlabLogo from "@/components/PigeonlabLogo";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSafeUser } from "@/lib/session-client";
import { useSeatQuota } from "@/hooks/useSeatQuota";
import SeatUsageCard from "@/components/payments/SeatUsageCard";
import ChapaCheckoutModal from "@/components/payments/ChapaCheckoutModal";
import { toast } from "sonner";

function SubscribeContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [open, setOpen] = useState(false);
  const { quota, loading, refresh } = useSeatQuota(schoolId);

  useEffect(() => {
    (async () => {
      const user = await getSafeUser();
      if (!user) { router.push("/login"); return; }

      const resProfile = await fetch("/api/profile");
      if (!resProfile.ok) { router.push("/dashboard"); return; }
      const profile = await resProfile.json();

      if (profile.role !== "school_admin") { router.push("/dashboard"); return; }
      setSchoolId(profile.school_id);
      setSchoolName(profile.school_name);

      // If returning from Chapa with a tx_ref, verify it
      const tx = params.get("tx_ref") || params.get("trx_ref");
      if (tx) {
        try {
          const verifyRes = await fetch("/api/chapa/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tx_ref: tx }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData?.status === "success") {
            toast.success(t("pay.success") || "Payment confirmed — seats added!");
            refresh();
            if (params.get("onboarding")) {
              setTimeout(() => router.replace("/dashboard"), 1200);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    })();
  }, [params, router, refresh, t]);

  const isOnboarding = params.get("onboarding") === "1";

  // Auto-redirect to dashboard once seats are purchased during onboarding
  useEffect(() => {
    if (isOnboarding && quota && (quota.teacher_seats + quota.student_seats) > 0) {
      router.replace("/dashboard");
    }
  }, [isOnboarding, quota, router]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 gap-2">
          <Link href="/" className="flex items-center gap-2 min-w-0"><PigeonlabLogo size="sm" responsiveText /></Link>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <LanguageToggle />
            {!isOnboarding && (
              <Button variant="ghost" size="sm" asChild className="px-2 sm:px-3">
                <Link href="/dashboard">
                  <ChevronLeft className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">{t("nav.backToDashboard")}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <CreditCard className="w-7 h-7 text-primary" /> {t("pay.subscriptionTitle") || "Subscription & Seats"}
            </h1>
            {schoolName && <p className="text-muted-foreground mt-1">{schoolName}</p>}
            {isOnboarding && (
              <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                <p className="font-medium text-foreground">Activate your school subscription</p>
                <p className="text-muted-foreground mt-1">
                  Welcome! To access your dashboard and start inviting teachers and students, please purchase your seats below. You can always top up later.
                </p>
              </div>
            )}
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

      {schoolId && (
        <ChapaCheckoutModal
          open={open}
          onOpenChange={setOpen}
          defaultTeacherSeats={5}
          defaultStudentSeats={50}
          onPaymentSuccess={refresh}
        />
      )}
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
      <SubscribeContent />
    </Suspense>
  );
}
