import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SubjectCards, ExperimentGrid, totalExperiments } from "./SharedDashboard";
import StudentProgress from "./StudentProgress";

interface Props {
  fullName: string;
  schoolName: string;
}

export default function StudentDashboardView({ fullName, schoolName }: Props) {
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-1">
          Welcome{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        {schoolName && <p className="text-muted-foreground">{schoolName} · Student</p>}
      </motion.div>

      {/* Student motivational banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 bg-gradient-hero rounded-2xl p-6 text-primary-foreground"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-7 h-7" />
          <h2 className="text-xl font-display font-bold">Start Experimenting!</h2>
        </div>
        <p className="text-sm opacity-80 max-w-xl">
          You have access to {totalExperiments} virtual lab experiments. 
          Pick a subject below and dive into interactive simulations — no lab coat required!
        </p>
      </motion.div>

      {/* Progress tracking */}
      <StudentProgress />

      {/* Subjects */}
      <div className="mb-6">
        <h2 className="text-xl font-display font-semibold mb-4">Choose a Subject</h2>
      </div>
      <SubjectCards />

      <ExperimentGrid count={9} />
    </>
  );
}
