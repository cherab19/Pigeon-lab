import { motion } from "framer-motion";
import { Beaker, Atom, FlaskConical, Microscope, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SubjectCards, ExperimentGrid, totalExperiments, subjectCounts } from "./SharedDashboard";
import SuperAdminAnalytics from "./SuperAdminAnalytics";

interface Props {
  fullName: string;
  schoolName: string;
  isSuperAdmin?: boolean;
}

export default function AdminDashboardView({ fullName, schoolName, isSuperAdmin }: Props) {
  return (
    <>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-1">
          Welcome{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        {schoolName && <p className="text-muted-foreground">{schoolName} · School Admin</p>}
      </motion.div>

      {/* Admin stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Experiments", value: totalExperiments.toString(), icon: Beaker, color: "text-primary" },
          { label: "Physics Labs", value: subjectCounts.physics.toString(), icon: Atom, color: "text-primary" },
          { label: "Chemistry Labs", value: subjectCounts.chemistry.toString(), icon: FlaskConical, color: "text-secondary" },
          { label: "Biology Labs", value: subjectCounts.biology.toString(), icon: Microscope, color: "text-accent" },
        ].map((s, i) => (
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

      {/* Quick admin actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
        <h2 className="text-xl font-display font-semibold mb-4">Admin Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/manage-users" className="block bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-all p-5 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold group-hover:text-primary transition-colors">Manage Members</h3>
                <p className="text-xs text-muted-foreground">Add or view teachers and students</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
          <Link to="/lab" className="block bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-all p-5 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Beaker className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold group-hover:text-primary transition-colors">Virtual Lab</h3>
                <p className="text-xs text-muted-foreground">Browse all experiments</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Subjects */}
      <div className="mb-6">
        <h2 className="text-xl font-display font-semibold mb-4">Explore Subjects</h2>
      </div>
      <SubjectCards />

      <ExperimentGrid count={6} />
    </>
  );
}
