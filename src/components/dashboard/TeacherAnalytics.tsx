import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";
import { BarChart3, Users, CheckCircle, Clock, ChevronDown, ChevronUp, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { allExperiments } from "./SharedDashboard";
import { useLanguage } from "@/contexts/LanguageContext";

interface StudentDetail {
  userId: string;
  fullName: string;
  completedCount: number;
  inProgressCount: number;
  totalTime: number;
  experiments: { experiment_id: string; subject: string; grade: number; status: string; time_spent_seconds: number | null }[];
}

interface AnalyticsData {
  totalStudents: number;
  totalCompleted: number;
  avgTime: number;
  subjectBreakdown: { subject: string; count: number }[];
  students: StudentDetail[];
}

export default function TeacherAnalytics() {
  const { t } = useLanguage();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const user = await getSafeUser();
      if (!user) return;

      const [{ data: progress }, { data: profiles }] = await Promise.all([
        supabase.from("experiment_progress").select("*"),
        supabase.from("profiles").select("user_id, full_name"),
      ]);

      const completed = progress?.filter(p => p.status === "completed") || [];
      const uniqueStudentIds = [...new Set(progress?.map(p => p.user_id) || [])];
      const totalTime = completed.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
      const avgTime = completed.length ? Math.round(totalTime / completed.length / 60) : 0;

      const subjectMap = new Map<string, number>();
      completed.forEach(p => {
        subjectMap.set(p.subject, (subjectMap.get(p.subject) || 0) + 1);
      });

      const students: StudentDetail[] = uniqueStudentIds
        .filter(id => id !== user.id)
        .map(userId => {
          const profile = profiles?.find(p => p.user_id === userId);
          const studentProgress = progress?.filter(p => p.user_id === userId) || [];
          const studentCompleted = studentProgress.filter(p => p.status === "completed");
          const studentInProgress = studentProgress.filter(p => p.status === "started");
          const studentTime = studentCompleted.reduce((s, p) => s + (p.time_spent_seconds || 0), 0);

          return {
            userId,
            fullName: profile?.full_name || t("teacherAnalytics.unknown"),
            completedCount: studentCompleted.length,
            inProgressCount: studentInProgress.length,
            totalTime: studentTime,
            experiments: studentProgress.map(p => ({
              experiment_id: p.experiment_id,
              subject: p.subject,
              grade: p.grade,
              status: p.status,
              time_spent_seconds: p.time_spent_seconds,
            })),
          };
        })
        .sort((a, b) => b.completedCount - a.completedCount);

      setData({
        totalStudents: students.length,
        totalCompleted: completed.length,
        avgTime,
        subjectBreakdown: Array.from(subjectMap).map(([subject, count]) => ({ subject, count })),
        students,
      });
      setLoading(false);
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-2xl p-5 border border-border animate-pulse">
            <div className="h-8 w-16 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: t("teacherAnalytics.activeStudents"), value: data.totalStudents, icon: Users, color: "text-primary" },
    { label: t("teacherAnalytics.experimentsDone"), value: data.totalCompleted, icon: CheckCircle, color: "text-secondary" },
    { label: t("teacherAnalytics.avgTime"), value: data.avgTime, icon: Clock, color: "text-accent" },
  ];

  const getExpTitle = (id: string) => allExperiments.find(e => e.id === id)?.title || id;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" /> {t("teacherAnalytics.title")}
      </h2>
      <div className="grid grid-cols-3 gap-4">
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

      {data.subjectBreakdown.length > 0 && (
        <div className="mt-4 bg-card rounded-2xl border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-3">{t("teacherAnalytics.bySubject")}</h3>
          <div className="space-y-2">
            {data.subjectBreakdown.map(s => (
              <div key={s.subject} className="flex items-center gap-3">
                <span className="text-xs w-20 capitalize text-muted-foreground">{s.subject}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-hero h-2 rounded-full transition-all"
                    style={{ width: `${(s.count / Math.max(...data.subjectBreakdown.map(x => x.count))) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-semibold w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> {t("teacherAnalytics.individualProgress")}
          </h3>
          <div className="space-y-2">
            {data.students.map((student) => {
              const isExpanded = expandedStudent === student.userId;
              const totalExps = allExperiments.length;
              const pct = totalExps ? Math.round((student.completedCount / totalExps) * 100) : 0;

              return (
                <div key={student.userId} className="bg-card rounded-2xl border border-border shadow-card hover:shadow-elevated transition-all overflow-hidden">
                  <button
                    onClick={() => setExpandedStudent(isExpanded ? null : student.userId)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.completedCount} {t("teacherAnalytics.completed")} · {student.inProgressCount} {t("teacherAnalytics.inProgress")}
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {Math.round(student.totalTime / 60)}m
                      </span>
                    </div>
                    <div className="w-16 hidden sm:block">
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-gradient-hero h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right mt-0.5">{pct}%</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border p-4 space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("teacherAnalytics.experiments")}</h4>
                            {student.experiments.length === 0 ? (
                              <p className="text-sm text-muted-foreground">{t("teacherAnalytics.noStarted")}</p>
                            ) : (
                              <div className="space-y-1.5">
                                {student.experiments.map((exp) => (
                                  <div key={exp.experiment_id} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${exp.status === "completed" ? "text-primary" : "text-muted-foreground/40"}`} />
                                    <span className="flex-1 truncate">{getExpTitle(exp.experiment_id)}</span>
                                    <span className="text-xs text-muted-foreground capitalize">{exp.subject} · G{exp.grade}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${exp.status === "completed" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                      {exp.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
