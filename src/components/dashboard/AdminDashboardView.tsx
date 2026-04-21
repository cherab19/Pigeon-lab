import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Beaker, Atom, FlaskConical, Microscope, Users, ChevronRight, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { totalExperiments, subjectCounts } from "./SharedDashboard";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";
import { Badge } from "@/components/ui/badge";
import AdminClassroomManager from "./AdminClassroomManager";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  fullName: string;
  schoolName: string;
}

type SubStatus = "active" | "trial" | "expired" | "suspended";

export default function AdminDashboardView({ fullName, schoolName }: Props) {
  const { t } = useLanguage();
  const [sub, setSub] = useState<{ status: SubStatus; student_count: number; current_period_end: string; price_per_student: number } | null>(null);

  const statusConfig: Record<SubStatus, { icon: typeof CheckCircle2; label: string; color: string; bg: string; description: string }> = {
    active: { icon: CheckCircle2, label: t("admin.active"), color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800", description: t("admin.activeDesc") },
    trial: { icon: Clock, label: t("admin.trial"), color: "text-amber-600", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800", description: t("admin.trialDesc") },
    expired: { icon: AlertTriangle, label: t("admin.expired"), color: "text-destructive", bg: "bg-destructive/5 border-destructive/20", description: t("admin.expiredDesc") },
    suspended: { icon: ShieldAlert, label: t("admin.suspended"), color: "text-destructive", bg: "bg-destructive/5 border-destructive/20", description: t("admin.suspendedDesc") },
  };

  useEffect(() => {
    const load = async () => {
      const user = await getSafeUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("school_id").eq("user_id", user.id).single();
      if (!profile?.school_id) return;
      const { data } = await supabase.from("school_subscriptions").select("status, student_count, current_period_end, price_per_student").eq("school_id", profile.school_id).single();
      if (data) setSub(data as any);
    };
    load();
  }, []);

  const cfg = sub ? statusConfig[sub.status] || statusConfig.trial : null;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{t("admin.role")}</span>
        </div>
        <h1 className="text-3xl font-display font-bold">
          {t("admin.welcome")}{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        {schoolName && <p className="text-muted-foreground mt-1">{schoolName}</p>}
      </motion.div>

      {cfg && sub && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`rounded-xl border p-4 mb-8 ${cfg.bg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <cfg.icon className={`w-5 h-5 ${cfg.color} shrink-0`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-sm">{t("admin.subscription")}</span>
                  <Badge variant={sub.status === "active" ? "default" : sub.status === "trial" ? "secondary" : "destructive"} className="text-xs">
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{cfg.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pl-8 sm:pl-0">
              {sub.student_count > 0 && <span><strong className="text-foreground">{sub.student_count}</strong> {t("common.students")}</span>}
              {sub.status === "active" && <span>Renews {new Date(sub.current_period_end).toLocaleDateString()}</span>}
              {sub.status === "active" && <span className="font-semibold text-foreground">{sub.student_count * sub.price_per_student} ETB/mo</span>}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 bg-gradient-hero rounded-2xl p-6 text-primary-foreground">
        <h2 className="text-lg font-display font-bold mb-1">{totalExperiments} {t("admin.totalExperiments")}</h2>
        <p className="text-sm opacity-80">{schoolName ? `${schoolName} · ` : ""}{t("admin.manageMembersDesc")}</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t("admin.totalExperiments"), value: totalExperiments.toString(), icon: Beaker, color: "text-primary" },
          { label: t("admin.physicsLabs"), value: subjectCounts.physics.toString(), icon: Atom, color: "text-primary" },
          { label: t("admin.chemistryLabs"), value: subjectCounts.chemistry.toString(), icon: FlaskConical, color: "text-secondary" },
          { label: t("admin.biologyLabs"), value: subjectCounts.biology.toString(), icon: Microscope, color: "text-accent" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -2 }} className="relative overflow-hidden bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-elevated transition-all">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-primary/5 blur-2xl" />
            <div className="relative flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight">{s.value}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-lg font-display font-semibold mb-4">{t("admin.quickActions")}</h2>
        <Link to="/manage-users" className="block bg-card rounded-2xl border border-border shadow-card hover:shadow-elevated transition-all p-6 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{t("admin.manageMembers")}</h3>
              <p className="text-sm text-muted-foreground">{t("admin.manageMembersDesc")}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
        <AdminClassroomManager />
      </motion.div>
    </>
  );
}
