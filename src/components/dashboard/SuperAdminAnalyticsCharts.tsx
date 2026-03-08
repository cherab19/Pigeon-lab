import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend
} from "recharts";

interface AnalyticsData {
  experiments_by_subject: { subject: string; total: number; completed: number }[];
  monthly_signups: { month: string; count: number }[];
  top_schools: { name: string; members: number; completed_labs: number; avg_score: number }[];
  role_distribution: Record<string, number>;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))"];

export default function SuperAdminAnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: result } = await supabase.rpc("get_super_admin_analytics");
      if (result) setData(result as unknown as AnalyticsData);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-6 border border-border animate-pulse h-72" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const roleData = Object.entries(data.role_distribution).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" /> Platform Analytics
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Signups */}
        {data.monthly_signups.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border shadow-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Monthly Signups
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[...data.monthly_signups].reverse()}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Role Distribution */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> User Role Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsPie>
              <Pie data={roleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                {roleData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        {/* Experiments by Subject */}
        {data.experiments_by_subject.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border shadow-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Experiments by Subject
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.experiments_by_subject}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Started" />
                <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Schools */}
        {data.top_schools.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border shadow-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">🏆 Top Schools by Lab Completion</h3>
            <div className="space-y-3">
              {data.top_schools.slice(0, 5).map((school, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{school.name}</p>
                      <p className="text-xs text-muted-foreground">{school.members} members · {school.avg_score}% avg score</p>
                    </div>
                  </div>
                  <span className="text-sm font-display font-bold">{school.completed_labs} labs</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
