import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { School, Users, GraduationCap, BookOpen, Trophy, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SchoolDetail {
  id: string;
  name: string;
  member_count: number;
  completed_experiments: number;
}

interface Stats {
  total_schools: number;
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_admins: number;
  experiments_started: number;
  experiments_completed: number;
  avg_time_spent: number;
  quizzes_taken: number;
  avg_quiz_score: number;
  school_details: SchoolDetail[];
}

export default function SuperAdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.rpc("get_super_admin_stats");
      if (data) setStats(data as unknown as Stats);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse h-24" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const completionRate = stats.experiments_started > 0
    ? Math.round((stats.experiments_completed / stats.experiments_started) * 100)
    : 0;

  const cards = [
    { label: "Total Schools", value: stats.total_schools, icon: School, color: "text-primary" },
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-secondary" },
    { label: "Students", value: stats.total_students, icon: GraduationCap, color: "text-accent" },
    { label: "Teachers", value: stats.total_teachers, icon: BookOpen, color: "text-primary" },
    { label: "Experiments Done", value: stats.experiments_completed, icon: Trophy, color: "text-secondary" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp, color: "text-accent" },
    { label: "Avg Time (min)", value: Math.round(stats.avg_time_spent / 60), icon: Clock, color: "text-secondary" },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
        <h2 className="text-xl font-display font-semibold">System-Wide Analytics</h2>
        <p className="text-sm text-muted-foreground">Cross-school overview of the entire platform</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-card rounded-xl p-5 border border-border shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <c.icon className={`w-5 h-5 ${c.color}`} />
              <span className="text-2xl font-display font-bold">{c.value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {stats.school_details.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h3 className="text-lg font-display font-semibold mb-4">Schools Overview</h3>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">School</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Members</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Completed Labs</th>
                </tr>
              </thead>
              <tbody>
                {stats.school_details.map((school) => (
                  <tr key={school.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{school.name}</td>
                    <td className="p-4 text-right text-muted-foreground">{school.member_count}</td>
                    <td className="p-4 text-right text-muted-foreground">{school.completed_experiments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </>
  );
}
