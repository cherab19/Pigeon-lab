import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Beaker, Atom, FlaskConical, Microscope, Users, ChevronRight, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { totalExperiments, subjectCounts } from "./SharedDashboard";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import AdminClassroomManager from "./AdminClassroomManager";

interface Props {
  fullName: string;
  schoolName: string;
}

type SubStatus = "active" | "trial" | "expired" | "suspended";

const statusConfig: Record<SubStatus, { icon: typeof CheckCircle2; label: string; color: string; bg: string; description: string }> = {
  active: { icon: CheckCircle2, label: "Active", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800", description: "Your subscription is active. All features are available." },
  trial: { icon: Clock, label: "Trial", color: "text-amber-600", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800", description: "You're on a free trial. Contact support to activate your subscription." },
  expired: { icon: AlertTriangle, label: "Expired", color: "text-destructive", bg: "bg-destructive/5 border-destructive/20", description: "Your subscription has expired. Lab access is restricted until renewed." },
  suspended: { icon: ShieldAlert, label: "Suspended", color: "text-destructive", bg: "bg-destructive/5 border-destructive/20", description: "Your subscription is suspended. Please contact support." },
};

export default function AdminDashboardView({ fullName, schoolName }: Props) {
  const [sub, setSub] = useState<{ status: SubStatus; student_count: number; current_period_end: string; price_per_student: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">School Admin</span>
        </div>
        <h1 className="text-3xl font-display font-bold">
          Welcome{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        {schoolName && <p className="text-muted-foreground mt-1">{schoolName}</p>}
      </motion.div>

      {/* Subscription Banner */}
      {cfg && sub && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`rounded-xl border p-4 mb-8 ${cfg.bg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <cfg.icon className={`w-5 h-5 ${cfg.color} shrink-0`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-sm">Subscription</span>
                  <Badge variant={sub.status === "active" ? "default" : sub.status === "trial" ? "secondary" : "destructive"} className="text-xs">
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{cfg.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pl-8 sm:pl-0">
              {sub.student_count > 0 && (
                <span><strong className="text-foreground">{sub.student_count}</strong> students</span>
              )}
              {sub.status === "active" && (
                <span>Renews {new Date(sub.current_period_end).toLocaleDateString()}</span>
              )}
              {sub.status === "active" && (
                <span className="font-semibold text-foreground">{sub.student_count * sub.price_per_student} ETB/mo</span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Experiments", value: totalExperiments.toString(), icon: Beaker, color: "text-primary" },
          { label: "Physics Labs", value: subjectCounts.physics.toString(), icon: Atom, color: "text-primary" },
          { label: "Chemistry Labs", value: subjectCounts.chemistry.toString(), icon: FlaskConical, color: "text-secondary" },
          { label: "Biology Labs", value: subjectCounts.biology.toString(), icon: Microscope, color: "text-accent" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-5 border border-border shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-2xl font-display font-bold">{s.value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick admin action */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-lg font-display font-semibold mb-4">Quick Actions</h2>
        <Link to="/manage-users" className="block bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-all p-6 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">Manage Members</h3>
              <p className="text-sm text-muted-foreground">Add teachers & students individually or import in bulk via CSV, then send magic link invitations</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Link>
      </motion.div>

      {/* Classroom Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
        <AdminClassroomManager />
      </motion.div>
    </>
  );
}
