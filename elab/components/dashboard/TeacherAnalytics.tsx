import { useEffect, useState } from "react";
import { dataClient } from "@/lib/data-client";
import { getSafeUser } from "@/lib/session-client";
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
      // Get classrooms for this teacher
      const { data: cls } = await dataClient.from("classrooms").select("id").eq("teacher_id", user.id);
      const classroomIds = (cls || []).map((c: any) => c.id);

      if (classroomIds.length === 0) {
        setData({ totalStudents: 0, totalCompleted: 0, avgTime: 0, students: [] });
        setLoading(false);
        return;
      }

      // Get students enrolled in these classrooms
      const { data: enrolled } = await dataClient.from("classroom_students").select("student_id").in("classroom_id", classroomIds);
      const studentIds = [...new Set((enrolled || []).map((e: any) => e.student_id))] as string[];

      if (studentIds.length === 0) {
        setData({ totalStudents: 0, totalCompleted: 0, avgTime: 0, students: [] });
        setLoading(false);
        return;
      }

      // Get progress and profiles only for these students
      const [{ data: progress }, { data: profiles }] = await Promise.all([
        dataClient.from("experiment_progress").select("*").in("user_id", studentIds),
        dataClient.from("profiles").select("user_id, full_name").in("user_id", studentIds),
      ]);

      const completed = (progress || []).filter((p: any) => p.status === "completed");
      const totalTime = completed.reduce((sum: number, p: any) => sum + (p.time_spent_seconds || 0), 0);
      const avgTime = completed.length ? Math.round(totalTime / completed.length / 60) : 0;

      const students: StudentDetail[] = studentIds
        .filter((id: string) => id !== user.id)
        .map((userId: string) => {
          const profile = (profiles || []).find((p: any) => p.user_id === userId);
          const studentProgress = (progress || []).filter((p: any) => p.user_id === userId) || [];
          const studentCompleted = studentProgress.filter((p: any) => p.status === "completed");
          const studentInProgress = studentProgress.filter((p: any) => p.status === "started");
          const studentTime = studentCompleted.reduce((s: number, p: any) => s + (p.time_spent_seconds || 0), 0);

          return {
            userId,
            fullName: profile?.full_name || t("teacherAnalytics.unknown"),
            completedCount: studentCompleted.length,
            inProgressCount: studentInProgress.length,
            totalTime: studentTime,
            experiments: studentProgress.map((p: any) => ({
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
