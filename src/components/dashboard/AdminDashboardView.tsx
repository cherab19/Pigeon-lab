import { motion } from "framer-motion";
import { Beaker, Atom, FlaskConical, Microscope, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { totalExperiments, subjectCounts } from "./SharedDashboard";

interface Props {
  fullName: string;
  schoolName: string;
}

export default function AdminDashboardView({ fullName, schoolName }: Props) {
  return (
    <>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">School Admin</span>
        </div>
        <h1 className="text-3xl font-display font-bold">
          Welcome{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        {schoolName && <p className="text-muted-foreground mt-1">{schoolName}</p>}
      </motion.div>

      {/* Stats */}
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

      {/* Quick admin action — Manage Members only */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-lg font-display font-semibold mb-4">Quick Actions</h2>
        <Link to="/manage-users" className="block bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-all p-6 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">Manage Members</h3>
              <p className="text-sm text-muted-foreground">Add teachers & students individually or import in bulk via CSV, then send magic link invitations</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Link>
      </motion.div>
    </>
  );
}
