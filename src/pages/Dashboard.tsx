import { motion } from "framer-motion";
import { Beaker, Atom, FlaskConical, Microscope, BookOpen, FileText, TrendingUp, Clock, ChevronRight, Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const experiments = [
  { id: 1, title: "Newton's Laws of Motion", subject: "Physics", grade: 9, progress: 75, status: "In Progress", gradient: "bg-gradient-physics" },
  { id: 2, title: "Acid-Base Titration", subject: "Chemistry", grade: 10, progress: 100, status: "Completed", gradient: "bg-gradient-chemistry" },
  { id: 3, title: "Cell Division: Mitosis", subject: "Biology", grade: 11, progress: 30, status: "In Progress", gradient: "bg-gradient-biology" },
  { id: 4, title: "Ohm's Law & Circuits", subject: "Physics", grade: 8, progress: 0, status: "Not Started", gradient: "bg-gradient-physics" },
  { id: 5, title: "Photosynthesis Process", subject: "Biology", grade: 9, progress: 50, status: "In Progress", gradient: "bg-gradient-biology" },
  { id: 6, title: "Periodic Table Trends", subject: "Chemistry", grade: 10, progress: 0, status: "Assigned", gradient: "bg-gradient-chemistry" },
];

const subjectIcon = (s: string) => {
  if (s === "Physics") return Atom;
  if (s === "Chemistry") return FlaskConical;
  return Microscope;
};

const stats = [
  { label: "Experiments Done", value: "12", icon: Beaker, color: "text-primary" },
  { label: "Lab Reports", value: "8", icon: FileText, color: "text-secondary" },
  { label: "Avg. Score", value: "87%", icon: TrendingUp, color: "text-emerald-light" },
  { label: "Hours Spent", value: "24h", icon: Clock, color: "text-accent" },
];

export default function StudentDashboard() {
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
              <Button variant="ghost" size="sm" className="text-muted-foreground">Dashboard</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild><Link to="/lab">Lab</Link></Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">Reports</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">Grades</Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input placeholder="Search experiments..." className="bg-transparent text-sm outline-none w-48 placeholder:text-muted-foreground" />
            </div>
            <Button variant="ghost" size="icon"><Bell className="w-5 h-5" /></Button>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-1">Welcome back, Abebe 👋</h1>
          <p className="text-muted-foreground">Grade 10 · Addis Ababa Science Academy</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
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

        {/* Experiments */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold">My Experiments</h2>
          <Button variant="outline" size="sm">
            <BookOpen className="w-4 h-4 mr-1" /> Browse All
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiments.map((exp, i) => {
            const Icon = subjectIcon(exp.subject);
            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <Link to="/lab" className="block bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden group">
                  <div className={`${exp.gradient} h-2`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{exp.subject} · Grade {exp.grade}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        exp.status === "Completed" ? "bg-primary/10 text-primary" :
                        exp.status === "In Progress" ? "bg-secondary/20 text-secondary-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {exp.status}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold mb-3 group-hover:text-primary transition-colors">{exp.title}</h3>
                    <div className="flex items-center gap-3">
                      <Progress value={exp.progress} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground font-medium">{exp.progress}%</span>
                    </div>
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
