import { motion } from "framer-motion";
import { Beaker, Atom, FlaskConical, Microscope, GraduationCap } from "lucide-react";
import { SubjectCards, ExperimentGrid, totalExperiments, subjectCounts } from "./SharedDashboard";

interface Props {
  fullName: string;
  schoolName: string;
}

export default function TeacherDashboardView({ fullName, schoolName }: Props) {
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-1">
          Welcome{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        {schoolName && <p className="text-muted-foreground">{schoolName} · Teacher</p>}
      </motion.div>

      {/* Teacher-focused banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 bg-gradient-hero rounded-2xl p-6 text-primary-foreground"
      >
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-7 h-7" />
          <h2 className="text-xl font-display font-bold">Your Teaching Lab</h2>
        </div>
        <p className="text-sm opacity-80 max-w-xl">
          Explore {totalExperiments} interactive experiments across Physics, Chemistry, and Biology. 
          Assign simulations to your students and guide them through hands-on learning.
        </p>
      </motion.div>

      {/* Compact stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Physics", value: subjectCounts.physics, icon: Atom, color: "text-primary" },
          { label: "Chemistry", value: subjectCounts.chemistry, icon: FlaskConical, color: "text-secondary" },
          { label: "Biology", value: subjectCounts.biology, icon: Microscope, color: "text-accent" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className="bg-card rounded-xl p-5 border border-border shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-2xl font-display font-bold">{s.value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{s.label} Labs</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-display font-semibold mb-4">Subjects</h2>
      </div>
      <SubjectCards />

      <ExperimentGrid count={6} />
    </>
  );
}
