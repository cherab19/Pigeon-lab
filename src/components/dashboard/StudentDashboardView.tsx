import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, PlayCircle, BookOpen, Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SubjectCards, totalExperiments, allExperiments } from "./SharedDashboard";
import StudentProgress from "./StudentProgress";
import StudentClassroomView from "./StudentClassroomView";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  fullName: string;
  schoolName: string;
}

interface InProgressExp {
  experiment_id: string;
  subject: string;
  grade: number;
  title: string;
}

export default function StudentDashboardView({ fullName, schoolName }: Props) {
  const [inProgress, setInProgress] = useState<InProgressExp[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("experiment_progress")
        .select("experiment_id, subject, grade")
        .eq("user_id", user.id)
        .eq("status", "started")
        .order("created_at", { ascending: false })
        .limit(3);

      if (data) {
        setInProgress(
          data.map(d => ({
            ...d,
            title: allExperiments.find(e => e.id === d.experiment_id)?.title || d.experiment_id,
          }))
        );
      }
    };
    load();
  }, []);

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold">
          Welcome{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        {schoolName && <p className="text-muted-foreground mt-1">{schoolName}</p>}
      </motion.div>

      {/* Motivational banner */}
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
          You have access to {totalExperiments} virtual lab experiments across Physics, Chemistry, and Biology.
          Pick a subject below and dive in — no lab coat required!
        </p>
      </motion.div>

      {/* Continue Where You Left Off */}
      {inProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-primary" /> Continue Where You Left Off
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {inProgress.map((exp, i) => (
              <Link
                key={exp.experiment_id}
                to={`/lab/${exp.subject}`}
                className="block bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-all p-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Beaker className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{exp.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{exp.subject} · Grade {exp.grade}</p>
                  </div>
                  <PlayCircle className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* My Classes - Assignments & Announcements */}
      <StudentClassroomView />

      {/* Progress & Achievements */}
      <StudentProgress />

      {/* Subject Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Choose a Subject
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/lab">Browse All</Link>
          </Button>
        </div>
        <SubjectCards />
      </motion.div>
    </>
  );
}
