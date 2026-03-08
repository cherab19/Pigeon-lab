import { motion } from "framer-motion";
import { Beaker, Atom, FlaskConical, Microscope, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { labData } from "@/data/labActivities";

const subjectIcon = (s: string) => {
  if (s === "physics") return Atom;
  if (s === "chemistry") return FlaskConical;
  return Microscope;
};
const subjectLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const gradientMap: Record<string, string> = {
  physics: "bg-gradient-physics",
  chemistry: "bg-gradient-chemistry",
  biology: "bg-gradient-biology",
};

export const allExperiments = Object.entries(labData).flatMap(([subject, grades]) =>
  Object.entries(grades).flatMap(([grade, labs]) =>
    labs.map(lab => ({
      ...lab,
      subject,
      grade: Number(grade),
      gradient: gradientMap[subject] || "bg-gradient-physics",
    }))
  )
);

export const subjectCounts = {
  physics: allExperiments.filter(e => e.subject === "physics").length,
  chemistry: allExperiments.filter(e => e.subject === "chemistry").length,
  biology: allExperiments.filter(e => e.subject === "biology").length,
};

export const totalExperiments = allExperiments.length;

export function SubjectCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-10">
      {(["physics", "chemistry", "biology"] as const).map((subject, i) => {
        const Icon = subjectIcon(subject);
        const grades = Object.keys(labData[subject] || {}).sort();
        return (
          <motion.div
            key={subject}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Link to={`/lab/${subject}`} className="block group">
              <div className={`${gradientMap[subject]} rounded-2xl p-6 text-primary-foreground transition-transform duration-300 group-hover:scale-[1.02]`}>
                <Icon className="w-8 h-8 mb-3 opacity-90" />
                <h3 className="text-xl font-display font-bold mb-1">{subjectLabel(subject)}</h3>
                <p className="text-sm opacity-80">{subjectCounts[subject]} experiments · Grades {grades.join(", ")}</p>
                <div className="flex items-center gap-1 mt-3 text-sm opacity-70">
                  Open Lab <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export function ExperimentGrid({ count = 6 }: { count?: number }) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold">Available Experiments</h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/lab"><BookOpen className="w-4 h-4 mr-1" /> Browse All</Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allExperiments.slice(0, count).map((exp, i) => {
          const Icon = subjectIcon(exp.subject);
          return (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <Link to={`/lab/${exp.subject}`} className="block bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden group">
                <div className={`${exp.gradient} h-2`} />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{subjectLabel(exp.subject)} · Grade {exp.grade}</span>
                  </div>
                  <h3 className="font-display font-semibold mb-1 group-hover:text-primary transition-colors">{exp.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{exp.objective}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

export { subjectIcon, subjectLabel, gradientMap };
