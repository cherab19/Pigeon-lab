import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { School, Users, GraduationCap, BookOpen, Trophy, TrendingUp, BarChart3, Clock, Activity, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { totalExperiments } from "./SharedDashboard";

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

interface Props {
  fullName: string;
}

export default function SuperAdminDashboardView({ fullName }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc("get_super_admin_stats");
      if (data) setStats(data as unknown as Stats);
      setLoading(false);
    };
    load();
  }, []);

  const completionRate = stats && stats.experiments_started > 0
    ? Math.round((stats.experiments_completed / stats.experiments_started) * 100)
    : 0;

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Platform Admin</span>
        </div>
        <h1 className="text-3xl font-display font-bold">
          Welcome{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          EthioLab platform overview · {totalExperiments} experiments available
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse h-24" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Platform KPIs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Platform Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Schools", value: stats.total_schools, icon: School, color: "text-primary" },
                { label: "Total Users", value: stats.total_users, icon: Users, color: "text-secondary" },
                { label: "Students", value: stats.total_students, icon: GraduationCap, color: "text-accent" },
                { label: "Teachers", value: stats.total_teachers, icon: BookOpen, color: "text-primary" },
              ].map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
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
          </motion.div>

          {/* Schools Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <School className="w-5 h-5 text-primary" /> Registered Schools
              </h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/manage-users">
                  <Users className="w-4 h-4 mr-1" /> Manage Members
                </Link>
              </Button>
            </div>

            {stats.school_details.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
                <School className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No schools registered yet</p>
                <p className="text-sm mt-1">Schools will appear here as admins sign up</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-4 font-medium text-muted-foreground">School Name</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Members</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Labs Completed</th>
                      <th className="text-right p-4 font-medium text-muted-foreground hidden md:table-cell">Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.school_details.map((school) => {
                      const activityLevel = school.completed_experiments > 20 ? "High" : school.completed_experiments > 5 ? "Medium" : "Low";
                      const activityColor = activityLevel === "High" ? "text-primary" : activityLevel === "Medium" ? "text-accent" : "text-muted-foreground";
                      return (
                        <tr key={school.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <School className="w-4 h-4 text-primary" />
                              </div>
                              <span className="font-medium">{school.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right font-mono">{school.member_count}</td>
                          <td className="p-4 text-right font-mono">{school.completed_experiments}</td>
                          <td className={`p-4 text-right font-medium text-xs hidden md:table-cell ${activityColor}`}>
                            {activityLevel}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Quick System Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Platform Health
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <p className="text-xs text-muted-foreground mb-2">User Distribution</p>
                <div className="space-y-2">
                  {[
                    { label: "Students", value: stats.total_students, total: stats.total_users },
                    { label: "Teachers", value: stats.total_teachers, total: stats.total_users },
                    { label: "Admins", value: stats.total_admins, total: stats.total_users },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{item.label}</span>
                        <span className="font-mono">{item.value}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <p className="text-xs text-muted-foreground mb-2">Experiment Engagement</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Started</span>
                      <span className="font-mono">{stats.experiments_started}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-secondary h-1.5 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Completed</span>
                      <span className="font-mono">{stats.experiments_completed}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${completionRate}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <p className="text-xs text-muted-foreground mb-2">Quiz Performance</p>
                <div className="flex flex-col items-center justify-center h-full py-2">
                  <span className="text-4xl font-display font-bold text-primary">{stats.avg_quiz_score}%</span>
                  <span className="text-xs text-muted-foreground mt-1">Platform Average Score</span>
                  <span className="text-xs text-muted-foreground">{stats.quizzes_taken} quizzes taken</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </>
  );
}
