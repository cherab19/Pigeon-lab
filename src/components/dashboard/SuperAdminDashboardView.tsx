import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { School, Users, GraduationCap, BookOpen, Activity, Shield, MapPin, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

interface SchoolFull {
  id: string;
  name: string;
  location: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  member_count: number;
}

interface Props {
  fullName: string;
}

export default function SuperAdminDashboardView({ fullName }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [schools, setSchools] = useState<SchoolFull[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [statsRes, schoolsRes] = await Promise.all([
      supabase.rpc("get_super_admin_stats"),
      supabase.from("schools").select("*").order("name"),
    ]);
    if (statsRes.data) setStats(statsRes.data as unknown as Stats);
    if (schoolsRes.data) {
      // Merge member counts from stats
      const details = (statsRes.data as unknown as Stats)?.school_details || [];
      const merged = schoolsRes.data.map((s) => {
        const detail = details.find((d) => d.id === s.id);
        return { ...s, member_count: detail?.member_count || 0 };
      });
      setSchools(merged);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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
          {Array.from({ length: 4 }).map((_, i) => (
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

          {/* Schools Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="mb-4">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <School className="w-5 h-5 text-primary" /> Registered Schools ({schools.length})
              </h2>
            </div>

            {schools.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
                <School className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No schools registered yet</p>
                <p className="text-sm mt-1">Schools will appear here as admins sign up</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {schools.map((school, i) => (
                  <motion.div
                    key={school.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="bg-card rounded-xl border border-border shadow-card p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <School className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-semibold text-base truncate">{school.name}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                            {school.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {school.location}
                              </span>
                            )}
                            {school.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {school.email}
                              </span>
                            )}
                            {school.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {school.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-lg font-display font-bold">{school.member_count}</span>
                          <p className="text-xs text-muted-foreground">Members</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      ) : null}
    </>
  );
}
