import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Users, ClipboardList, Megaphone, Plus, Trash2,
  Calendar, ChevronDown, ChevronUp, GraduationCap, BarChart3, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { dataClient } from "@/lib/data-client";
import { getSafeUser } from "@/lib/session-client";
import { toast } from "sonner";
import { labData, LabActivity } from "@/data/labActivities";
import { useLanguage } from "@/contexts/LanguageContext";

interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade: number;
  section: string;
}

interface Assignment {
  id: string;
  classroom_id: string;
  experiment_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
}

interface Announcement {
  id: string;
  classroom_id: string;
  title: string;
  content: string;
  created_at: string;
}

interface StudentProgress {
  student_id: string;
  full_name: string;
  experiments_completed: number;
  avg_score: number;
  total_time: number;
}

export default function TeacherClassroomView() {
  const { t } = useLanguage();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Create assignment
  const [showAssignment, setShowAssignment] = useState(false);
  const [assignExpId, setAssignExpId] = useState("");
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignDue, setAssignDue] = useState("");
  const [saving, setSaving] = useState(false);

  // Create announcement
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");

  useEffect(() => {
    const load = async () => {
      const user = await getSafeUser();
      if (!user) return;

      const { data: cls } = await dataClient.from("classrooms")
        .select("id, name, subject, grade, section")
        .eq("teacher_id", user.id)
        .order("grade");

      if (cls && cls.length > 0) {
        setClassrooms(cls as Classroom[]);
        setSelectedClassroom(cls[0].id);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Load classroom data when selection changes
  useEffect(() => {
    if (!selectedClassroom) return;

    const loadClassroomData = async () => {
      const user = await getSafeUser();
      if (!user) return;

      // Assignments
      const { data: assigns } = await dataClient.from("assignments")
        .select("*").eq("classroom_id", selectedClassroom).order("created_at", { ascending: false });
      if (assigns) setAssignments(assigns as Assignment[]);

      // Announcements
      const { data: anns } = await dataClient.from("announcements")
        .select("*").eq("classroom_id", selectedClassroom).order("created_at", { ascending: false });
      if (anns) setAnnouncements(anns as Announcement[]);

      // Student progress
      const { data: enrolled } = await dataClient.from("classroom_students")
        .select("student_id").eq("classroom_id", selectedClassroom);
      if (enrolled && enrolled.length > 0) {
        const studentIds = enrolled.map((e: any) => e.student_id);
        const cls = classrooms.find(c => c.id === selectedClassroom);

        // Get profiles
        const { data: profiles } = await dataClient.from("profiles")
          .select("user_id, full_name").in("user_id", studentIds);

        // Get experiment progress for these students
        const { data: progress } = await dataClient.from("experiment_progress")
          .select("user_id, status, time_spent_seconds")
          .in("user_id", studentIds)
          .eq("subject", cls?.subject || "");

        const progressMap: StudentProgress[] = (profiles || []).map((p: any) => {
          const userProgress = (progress || []).filter((ep: any) => ep.user_id === p.user_id);
          const completed = userProgress.filter((ep: any) => ep.status === "completed").length;
          const totalTime = userProgress.reduce((sum: number, ep: any) => sum + (ep.time_spent_seconds || 0), 0);

          return { student_id: p.user_id, full_name: p.full_name, experiments_completed: completed, avg_score: 0, total_time: totalTime };
        });

        setStudentProgress(progressMap);
      } else {
        setStudentProgress([]);
      }
    };

    loadClassroomData();
  }, [selectedClassroom, classrooms]);

  const currentClassroom = classrooms.find(c => c.id === selectedClassroom);

  // Available experiments for this classroom's subject & grade
  const availableExperiments: LabActivity[] = currentClassroom
    ? (labData[currentClassroom.subject]?.[currentClassroom.grade] || [])
    : [];

  const handleCreateAssignment = async () => {
    if (!assignExpId || !assignTitle) { toast.error("Select experiment and add title"); return; }
    setSaving(true);
    const user = await getSafeUser();
    if (!user) return;

    const { error } = await dataClient.from("assignments").insert({
      classroom_id: selectedClassroom,
      experiment_id: assignExpId,
      title: assignTitle,
      description: assignDesc || null,
      due_date: assignDue || null,
      created_by: user.id,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Assignment created");
    setShowAssignment(false);
    setAssignExpId(""); setAssignTitle(""); setAssignDesc(""); setAssignDue("");
    // Reload
    const { data: assigns } = await dataClient.from("assignments")
      .select("*").eq("classroom_id", selectedClassroom).order("created_at", { ascending: false });
    if (assigns) setAssignments(assigns as Assignment[]);
  };

  const handleDeleteAssignment = async (id: string) => {
    await dataClient.from("assignments").delete().eq("id", id);
    setAssignments(prev => prev.filter(a => a.id !== id));
    toast.success("Assignment deleted");
  };

  const handleCreateAnnouncement = async () => {
    if (!annTitle || !annContent) { toast.error("Fill title and content"); return; }
    setSaving(true);
    const user = await getSafeUser();
    if (!user) return;

    const { error } = await dataClient.from("announcements").insert({
      classroom_id: selectedClassroom,
      author_id: user.id,
      title: annTitle,
      content: annContent,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Announcement posted");
    setShowAnnouncement(false);
    setAnnTitle(""); setAnnContent("");
    const { data: anns } = await dataClient.from("announcements")
      .select("*").eq("classroom_id", selectedClassroom).order("created_at", { ascending: false });
    if (anns) setAnnouncements(anns as Announcement[]);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await dataClient.from("announcements").delete().eq("id", id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success("Announcement deleted");
  };

  const selectExperiment = (expId: string) => {
    setAssignExpId(expId);
    const exp = availableExperiments.find(e => e.id === expId);
    if (exp) setAssignTitle(exp.title);
  };

  if (loading) {
    return <div className="bg-card rounded-xl p-6 border border-border animate-pulse h-32" />;
  }

  if (classrooms.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{t("teacher.noClassrooms")}</p>
          <p className="text-sm mt-1">{t("teacher.noClassroomsDesc")}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> My Classrooms
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

      {currentClassroom && (
        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="progress" className="gap-1.5">
              <BarChart3 className="w-4 h-4" /> Student Progress
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-1.5">
              <ClipboardList className="w-4 h-4" /> Assignments ({assignments.length})
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-1.5">
              <Megaphone className="w-4 h-4" /> Announcements ({announcements.length})
            </TabsTrigger>
          </TabsList>

          {/* Student Progress */}
          <TabsContent value="progress">
            {studentProgress.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No students enrolled in this classroom yet.</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Labs Done</th>
                      <th className="text-right p-4 font-medium text-muted-foreground hidden sm:table-cell">Time (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentProgress.map(sp => (
                      <tr key={sp.student_id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-muted-foreground" />
                          {sp.full_name}
                        </td>
                        <td className="p-4 text-right">{sp.experiments_completed}</td>
                        <td className="p-4 text-right text-muted-foreground hidden sm:table-cell">
                          {Math.round(sp.total_time / 60)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Assignments */}
          <TabsContent value="assignments">
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => setShowAssignment(true)} className="gap-1.5">
                <Plus className="w-4 h-4" /> Assign Experiment
              </Button>
            </div>

            {assignments.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No assignments yet. Assign experiments for your students to complete.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map(a => (
                  <div key={a.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{a.title}</h4>
                      {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {a.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Due: {new Date(a.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <span>Created: {new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => handleDeleteAssignment(a.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Announcements */}
          <TabsContent value="announcements">
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => setShowAnnouncement(true)} className="gap-1.5">
                <Plus className="w-4 h-4" /> Post Announcement
              </Button>
            </div>

            {announcements.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
                <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No announcements yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map(a => (
                  <div key={a.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-sm">{a.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.content}</p>
                        <span className="text-xs text-muted-foreground mt-2 block">{new Date(a.created_at).toLocaleString()}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => handleDeleteAnnouncement(a.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={showAssignment} onOpenChange={setShowAssignment}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Experiment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Experiment *</Label>
              <Select value={assignExpId} onValueChange={selectExperiment}>
                <SelectTrigger><SelectValue placeholder="Select experiment" /></SelectTrigger>
                <SelectContent>
                  {availableExperiments.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      Unit {e.unit}: {e.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title *</Label>
              <Input value={assignTitle} onChange={e => setAssignTitle(e.target.value)} />
            </div>
            <div>
              <Label>Instructions (optional)</Label>
              <Textarea value={assignDesc} onChange={e => setAssignDesc(e.target.value)} rows={3} placeholder="Additional instructions for students..." />
            </div>
            <div>
              <Label>Due Date (optional)</Label>
              <Input type="date" value={assignDue} onChange={e => setAssignDue(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignment(false)}>Cancel</Button>
            <Button onClick={handleCreateAssignment} disabled={saving}>
              {saving ? "Creating..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Announcement Dialog */}
      <Dialog open={showAnnouncement} onOpenChange={setShowAnnouncement}>
        <DialogContent>
          <DialogHeader><DialogTitle>Post Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Title *</Label>
              <Input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Announcement title" />
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea value={annContent} onChange={e => setAnnContent(e.target.value)} rows={4} placeholder="Write your message..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnnouncement(false)}>Cancel</Button>
            <Button onClick={handleCreateAnnouncement} disabled={saving} className="gap-1.5">
              <Send className="w-4 h-4" /> {saving ? "Posting..." : "Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
