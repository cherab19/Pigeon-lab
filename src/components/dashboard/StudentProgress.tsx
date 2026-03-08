import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, Beaker, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { labData } from "@/data/labActivities";
import { allExperiments } from "./SharedDashboard";

interface ProgressItem {
  experiment_id: string;
  subject: string;
  grade: number;
  status: string;
  time_spent_seconds: number | null;
  completed_at: string | null;
}

export default function StudentProgress() {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("experiment_progress")
        .select("experiment_id, subject, grade, status, time_spent_seconds, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      setProgress(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const completed = progress.filter(p => p.status === "completed");
  const totalTime = completed.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
  const totalExps = allExperiments.length;
  const pct = totalExps ? Math.round((completed.length / totalExps) * 100) : 0;

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
        <Beaker className="w-5 h-5 text-primary" /> Your Progress
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {stats.map((s, i) => (
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
      {/* Progress bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Completion</span>
          <span className="text-sm font-mono">{completed.length} / {totalExps}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {/* Recent activity */}
      {completed.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Recent Completions</h3>
          <div className="space-y-2">
            {completed.slice(0, 5).map(p => {
              const exp = allExperiments.find(e => e.id === p.experiment_id);
              return (
                <div key={p.experiment_id} className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1 truncate">{exp?.title || p.experiment_id}</span>
                  <span className="text-xs text-muted-foreground capitalize">{p.subject} · G{p.grade}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
