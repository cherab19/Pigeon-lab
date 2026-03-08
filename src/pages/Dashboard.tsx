import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Beaker, Atom, FlaskConical, Microscope, BookOpen, Clock, ChevronRight, Search, Bell, User, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

export default function Dashboard() {
  const [profile, setProfile] = useState<{ full_name: string; school_id: string | null } | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, school_id")
        .eq("user_id", user.id)
        .single();

      if (prof) {
        setProfile(prof);
        if (prof.school_id) {
          const { data: school } = await supabase
            .from("schools")
            .select("name")
            .eq("id", prof.school_id)
            .single();
          if (school) setSchoolName(school.name);
        }
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Build flat list of all experiments from real curriculum data
  const allExperiments = Object.entries(labData).flatMap(([subject, grades]) =>
    Object.entries(grades).flatMap(([grade, labs]) =>
      labs.map(lab => ({
        ...lab,
        subject,
        grade: Number(grade),
        gradient: gradientMap[subject] || "bg-gradient-physics",
      }))
    )
  );

  // Summary stats from real data
  const totalExperiments = allExperiments.length;
  const subjectCounts = {
    physics: allExperiments.filter(e => e.subject === "physics").length,
    chemistry: allExperiments.filter(e => e.subject === "chemistry").length,
    biology: allExperiments.filter(e => e.subject === "biology").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Beaker className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">EthioLab</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 ml-6">
              <Button variant="ghost" size="sm" className="text-foreground font-medium">Dashboard</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild><Link to="/lab">Lab</Link></Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-1">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
          </h1>
          {schoolName && <p className="text-muted-foreground">{schoolName}</p>}
        </motion.div>

        {/* Stats from real data */}
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

        {/* Subject cards linking to labs */}
        <div className="mb-6">
          <h2 className="text-xl font-display font-semibold mb-4">Explore Subjects</h2>
        </div>
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

        {/* Recent experiments quick access */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold">Available Experiments</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/lab"><BookOpen className="w-4 h-4 mr-1" /> Browse All</Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allExperiments.slice(0, 6).map((exp, i) => {
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
      </main>
    </div>
  );
}
