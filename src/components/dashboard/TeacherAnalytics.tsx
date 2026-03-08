import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsData {
  totalStudents: number;
  totalCompleted: number;
  avgScore: number;
  avgTime: number;
  subjectBreakdown: { subject: string; count: number }[];
}

export default function TeacherAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get school students' progress
      const { data: progress } = await supabase
        .from("experiment_progress")
        .select("*");

      const { data: quizzes } = await supabase
        .from("quiz_results")
        .select("*");

      const completed = progress?.filter(p => p.status === "completed") || [];
      const uniqueStudents = new Set(progress?.map(p => p.user_id) || []);
      const totalTime = completed.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
      const avgTime = completed.length ? Math.round(totalTime / completed.length / 60) : 0;

      const postQuizzes = quizzes?.filter(q => q.quiz_type === "post") || [];
      const avgScore = postQuizzes.length
        ? Math.round(postQuizzes.reduce((sum, q) => sum + (q.score / q.total_questions) * 100, 0) / postQuizzes.length)
        : 0;

      const subjectMap = new Map<string, number>();
      completed.forEach(p => {
        subjectMap.set(p.subject, (subjectMap.get(p.subject) || 0) + 1);
      });

      setData({
        totalStudents: uniqueStudents.size,
        totalCompleted: completed.length,
        avgScore,
        avgTime,
        subjectBreakdown: Array.from(subjectMap).map(([subject, count]) => ({ subject, count })),
      });
      setLoading(false);
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse">
            <div className="h-8 w-16 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Active Students", value: data.totalStudents, icon: Users, color: "text-primary" },
    { label: "Experiments Done", value: data.totalCompleted, icon: CheckCircle, color: "text-secondary" },
    { label: "Avg. Quiz Score", value: `${data.avgScore}%`, icon: TrendingUp, color: "text-accent" },
    { label: "Avg. Time (min)", value: data.avgTime, icon: Clock, color: "text-sky-500" },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" /> Student Analytics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      {data.subjectBreakdown.length > 0 && (
        <div className="mt-4 bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold mb-3">Experiments by Subject</h3>
          <div className="space-y-2">
            {data.subjectBreakdown.map(s => (
              <div key={s.subject} className="flex items-center gap-3">
                <span className="text-xs w-20 capitalize text-muted-foreground">{s.subject}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(s.count / Math.max(...data.subjectBreakdown.map(x => x.count))) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-semibold w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
