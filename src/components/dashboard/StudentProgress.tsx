import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";
import { CheckCircle, Clock, Beaker, Trophy, Award, Star, Flame, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { allExperiments } from "./SharedDashboard";

interface ProgressItem {
  experiment_id: string;
  subject: string;
  grade: number;
  status: string;
  time_spent_seconds: number | null;
  completed_at: string | null;
}

interface Badge {
  id: string;
  label: string;
  description: string;
  icon: typeof Star;
  earned: boolean;
  color: string;
}

export default function StudentProgress() {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = await getSafeUser();
      if (!user) { setLoading(false); return; }

      const { data: prog } = await supabase
        .from("experiment_progress")
        .select("experiment_id, subject, grade, status, time_spent_seconds, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      setProgress(prog || []);
      setLoading(false);
    };
    load();
  }, []);

  const completed = progress.filter(p => p.status === "completed");
  const totalTime = completed.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
  const totalExps = allExperiments.length;
  const pct = totalExps ? Math.round((completed.length / totalExps) * 100) : 0;

  const subjectsCompleted = new Set(completed.map(p => p.subject));

  const badges: Badge[] = [
    { id: "first_exp", label: "First Step", description: "Complete your first experiment", icon: Star, earned: completed.length >= 1, color: "text-primary" },
    { id: "five_exp", label: "Lab Regular", description: "Complete 5 experiments", icon: Beaker, earned: completed.length >= 5, color: "text-secondary" },
    { id: "ten_exp", label: "Science Explorer", description: "Complete 10 experiments", icon: Zap, earned: completed.length >= 10, color: "text-accent" },
    { id: "all_subjects", label: "Renaissance", description: "Complete labs in all 3 subjects", icon: Target, earned: subjectsCompleted.size >= 3, color: "text-accent" },
    { id: "time_warrior", label: "Dedicated", description: "Spend 60+ minutes in labs", icon: Clock, earned: totalTime >= 3600, color: "text-primary" },
    { id: "streak", label: "On Fire", description: "Complete 3 experiments in a row", icon: Flame, earned: completed.length >= 3, color: "text-destructive" },
    { id: "twenty_exp", label: "Lab Master", description: "Complete 20 experiments", icon: Trophy, earned: completed.length >= 20, color: "text-primary" },
    { id: "two_subjects", label: "Cross Discipline", description: "Complete labs in 2+ subjects", icon: Award, earned: subjectsCompleted.size >= 2, color: "text-secondary" },
  ];

  const earnedCount = badges.filter(b => b.earned).length;

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse">
            <div className="h-8 w-16 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Completed", value: completed.length, icon: CheckCircle, color: "text-primary" },
    { label: "Time Spent", value: `${Math.round(totalTime / 60)}m`, icon: Clock, color: "text-secondary" },
    { label: "Progress", value: `${pct}%`, icon: Trophy, color: "text-accent" },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
        <Beaker className="w-5 h-5 text-primary" /> Your Progress of lab experiment
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -2 }}
            className="relative overflow-hidden bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-elevated transition-all"
          >
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

      {/* Progress bar */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Overall Completion</span>
          <span className="text-sm font-mono text-muted-foreground">{completed.length} / {totalExps}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-hero h-2.5 rounded-full"
          />
        </div>
      </div>

      {/* Achievement Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <h3 className="text-lg font-display font-semibold mb-1 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" /> Achievements you earned on experiments
          <span className="text-xs font-normal text-muted-foreground ml-1">{earnedCount}/{badges.length} earned</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className={`relative rounded-2xl border p-4 text-center transition-all ${
                badge.earned
                  ? "bg-card border-primary/30 shadow-card hover:shadow-elevated"
                  : "bg-muted/30 border-border opacity-60"
              }`}
            >
              <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${badge.earned ? "bg-primary/10" : "bg-muted"}`}>
                <badge.icon className={`w-6 h-6 ${badge.earned ? badge.color : "text-muted-foreground"}`} />
              </div>
              <p className="text-xs font-semibold">{badge.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{badge.description}</p>
              {badge.earned && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-card">
                  <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Completions */}
      {completed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <h3 className="text-sm font-semibold mb-2">Recent Completions</h3>
          <div className="space-y-2">
            {completed.slice(0, 5).map(p => {
              const exp = allExperiments.find(e => e.id === p.experiment_id);
              return (
                <div key={p.experiment_id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5 text-sm hover:border-primary/30 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="flex-1 truncate font-medium">{exp?.title || p.experiment_id}</span>
                  <span className="text-xs text-muted-foreground capitalize">{p.subject} · G{p.grade}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
