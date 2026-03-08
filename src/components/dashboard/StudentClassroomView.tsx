import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, ClipboardList, Megaphone, Calendar, Beaker, AlertCircle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade: number;
  section: string;
}

interface Assignment {
  id: string;
  experiment_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function StudentClassroomView() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [completedExps, setCompletedExps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get classrooms via classroom_students
      const { data: enrollments } = await supabase.from("classroom_students")
        .select("classroom_id").eq("student_id", user.id);

      if (enrollments && enrollments.length > 0) {
        const classroomIds = enrollments.map(e => e.classroom_id);
        const { data: cls } = await supabase.from("classrooms")
          .select("id, name, subject, grade, section")
          .in("id", classroomIds)
          .order("grade");

        if (cls && cls.length > 0) {
          setClassrooms(cls as Classroom[]);
          setSelectedClassroom(cls[0].id);
        }
      }

      // Get completed experiments
      const { data: progress } = await supabase.from("experiment_progress")
        .select("experiment_id").eq("user_id", user.id).eq("status", "completed");
      if (progress) setCompletedExps(progress.map(p => p.experiment_id));

      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedClassroom) return;

    const loadData = async () => {
      const { data: assigns } = await supabase.from("assignments")
        .select("id, experiment_id, title, description, due_date, created_at")
        .eq("classroom_id", selectedClassroom)
        .order("created_at", { ascending: false });
      if (assigns) setAssignments(assigns as Assignment[]);

      const { data: anns } = await supabase.from("announcements")
        .select("id, title, content, created_at")
        .eq("classroom_id", selectedClassroom)
        .order("created_at", { ascending: false });
      if (anns) setAnnouncements(anns as Announcement[]);
    };
    loadData();
  }, [selectedClassroom]);

  const currentClassroom = classrooms.find(c => c.id === selectedClassroom);

  if (loading) {
    return <div className="bg-card rounded-xl p-6 border border-border animate-pulse h-32 mb-8" />;
  }

  if (classrooms.length === 0) return null; // Student may not have classrooms yet

  const isOverdue = (date: string) => new Date(date) < new Date();
  const pendingAssignments = assignments.filter(a => !completedExps.includes(a.experiment_id));
  const completedAssignments = assignments.filter(a => completedExps.includes(a.experiment_id));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> My Classes
        </h2>
        <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {classrooms.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4" /> Pending Assignments ({pendingAssignments.length})
          </h3>
          <div className="space-y-2">
            {pendingAssignments.map(a => (
              <div key={a.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Beaker className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{a.title}</h4>
                  {a.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>}
                  {a.due_date && (
                    <span className={`text-xs mt-1 flex items-center gap-1 ${isOverdue(a.due_date) ? "text-destructive" : "text-muted-foreground"}`}>
                      {isOverdue(a.due_date) && <AlertCircle className="w-3 h-3" />}
                      <Calendar className="w-3 h-3" /> Due: {new Date(a.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <Button size="sm" asChild>
                  <Link to={`/lab/${currentClassroom?.subject}`}>Start Lab</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedAssignments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed ({completedAssignments.length})
          </h3>
          <div className="space-y-2">
            {completedAssignments.map(a => (
              <div key={a.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 opacity-70">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{a.title}</h4>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Done</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
            <Megaphone className="w-4 h-4" /> Announcements
          </h3>
          <div className="space-y-2">
            {announcements.map(a => (
              <div key={a.id} className="bg-card rounded-xl border border-border p-4">
                <h4 className="font-medium text-sm">{a.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.content}</p>
                <span className="text-xs text-muted-foreground mt-2 block">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {assignments.length === 0 && announcements.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
          <p className="text-sm">No assignments or announcements yet from your teacher.</p>
        </div>
      )}
    </motion.div>
  );
}
