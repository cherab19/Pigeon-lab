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

interface QuizItem {
  experiment_id: string;
  quiz_type: string;
  score: number;
  total_questions: number;
  completed_at: string;
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
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = await getSafeUser();
      if (!user) { setLoading(false); return; }

      const [{ data: prog }, { data: quiz }] = await Promise.all([
        supabase
          .from("experiment_progress")
          .select("experiment_id, subject, grade, status, time_spent_seconds, completed_at")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false }),
        supabase
          .from("quiz_results")
          .select("experiment_id, quiz_type, score, total_questions, completed_at")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false }),
      ]);

      setProgress(prog || []);
      setQuizzes(quiz || []);
      setLoading(false);
    };
    load();
  }, []);

  const completed = progress.filter(p => p.status === "completed");
  const totalTime = completed.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
  const totalExps = allExperiments.length;
  const pct = totalExps ? Math.round((completed.length / totalExps) * 100) : 0;

  // Compute badges
  const postQuizzes = quizzes.filter(q => q.quiz_type === "post");
  const perfectQuizzes = postQuizzes.filter(q => q.score === q.total_questions);
  const avgScore = postQuizzes.length
    ? Math.round(postQuizzes.reduce((s, q) => s + (q.score / q.total_questions) * 100, 0) / postQuizzes.length)
    : 0;
  const subjectsCompleted = new Set(completed.map(p => p.subject));

  const badges: Badge[] = [
    { id: "first_exp", label: "First Step", description: "Complete your first experiment", icon: Star, earned: completed.length >= 1, color: "text-primary" },
    { id: "five_exp", label: "Lab Regular", description: "Complete 5 experiments", icon: Beaker, earned: completed.length >= 5, color: "text-secondary" },
    { id: "ten_exp", label: "Science Explorer", description: "Complete 10 experiments", icon: Zap, earned: completed.length >= 10, color: "text-accent" },
    { id: "perfect_quiz", label: "Perfect Score", description: "Get 100% on a post-lab quiz", icon: Trophy, earned: perfectQuizzes.length >= 1, color: "text-primary" },
    { id: "high_avg", label: "Honor Roll", description: "Maintain 80%+ average quiz score", icon: Award, earned: postQuizzes.length >= 3 && avgScore >= 80, color: "text-secondary" },
    { id: "all_subjects", label: "Renaissance", description: "Complete labs in all 3 subjects", icon: Target, earned: subjectsCompleted.size >= 3, color: "text-accent" },
    { id: "time_warrior", label: "Dedicated", description: "Spend 60+ minutes in labs", icon: Clock, earned: totalTime >= 3600, color: "text-primary" },
    { id: "streak", label: "On Fire", description: "Complete 3 experiments in a row", icon: Flame, earned: completed.length >= 3, color: "text-destructive" },
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

      {/* Achievement Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <h3 className="text-lg font-display font-semibold mb-1 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" /> Achievements
          <span className="text-xs font-normal text-muted-foreground ml-1">{earnedCount}/{badges.length} earned</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className={`relative rounded-xl border p-4 text-center transition-all ${
                badge.earned
                  ? "bg-card border-primary/30 shadow-card"
                  : "bg-muted/30 border-border opacity-50"
              }`}
            >
              <badge.icon className={`w-7 h-7 mx-auto mb-2 ${badge.earned ? badge.color : "text-muted-foreground"}`} />
              <p className="text-xs font-semibold">{badge.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{badge.description}</p>
              {badge.earned && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quiz Score History */}
      {quizzes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <h3 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Quiz History
          </h3>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Experiment</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-right p-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.slice(0, 10).map((q, i) => {
                  const scorePct = Math.round((q.score / q.total_questions) * 100);
                  const exp = allExperiments.find(e => e.id === q.experiment_id);
                  return (
                    <tr key={`${q.experiment_id}-${q.quiz_type}-${i}`} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium truncate max-w-[200px]">{exp?.title || q.experiment_id}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${q.quiz_type === "pre" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                          {q.quiz_type}-lab
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-mono font-semibold ${scorePct >= 70 ? "text-primary" : scorePct >= 50 ? "text-accent" : "text-destructive"}`}>
                          {q.score}/{q.total_questions}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">({scorePct}%)</span>
                      </td>
                      <td className="p-3 text-right text-muted-foreground text-xs hidden sm:table-cell">
                        {new Date(q.completed_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

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
                <div key={p.experiment_id} className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1 truncate">{exp?.title || p.experiment_id}</span>
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
