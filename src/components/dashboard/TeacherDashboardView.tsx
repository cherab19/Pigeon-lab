import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SubjectCards, totalExperiments } from "./SharedDashboard";
import TeacherAnalytics from "./TeacherAnalytics";
import TeacherClassroomView from "./TeacherClassroomView";

interface Props {
  fullName: string;
  schoolName: string;
}

export default function TeacherDashboardView({ fullName, schoolName }: Props) {
  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Teacher</span>
        </div>
        <h1 className="text-3xl font-display font-bold">
          Welcome{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        {schoolName && <p className="text-muted-foreground mt-1">{schoolName}</p>}
      </motion.div>

      {/* Quick action banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 bg-gradient-hero rounded-2xl p-6 text-primary-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-lg font-display font-bold mb-1">
            {totalExperiments} Lab Experiments Available
          </h2>
          <p className="text-sm opacity-80">
            Browse experiments across Physics, Chemistry, and Biology to guide your students.
          </p>
        </div>
        <Button variant="secondary" size="sm" asChild className="shrink-0">
          <Link to="/lab"><Beaker className="w-4 h-4 mr-1" /> Open Lab</Link>
        </Button>
      </motion.div>

      {/* Student Analytics — the core of teacher dashboard */}
      <TeacherAnalytics />

      {/* Subject Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Browse by Subject
          </h2>
        </div>
        <SubjectCards />
      </motion.div>
    </>
  );
}
