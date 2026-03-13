import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  School, Users, Plus, Trash2, UserPlus, GraduationCap, BookOpen, Search, X, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";
import { toast } from "sonner";

interface Classroom {
  id: string;
  school_id: string;
  teacher_id: string;
  subject: string;
  grade: number;
  section: string;
  name: string;
  created_at: string;
}

interface MemberRow {
  user_id: string;
  full_name: string;
  role: string;
}

export default function AdminClassroomManager() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(null);
  const [enrollingClassroom, setEnrollingClassroom] = useState<Classroom | null>(null);
  const [expandedClassroom, setExpandedClassroom] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Create form
  const [formTeacher, setFormTeacher] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formGrade, setFormGrade] = useState("");
  const [formSection, setFormSection] = useState("A");

  // Enrollment
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  const teachers = members.filter(m => m.role === "teacher");
  const students = members.filter(m => m.role === "student");

  const loadData = async () => {
    const user = await getSafeUser();
    if (!user) return;

    // Load classrooms
    const { data: cls } = await supabase.from("classrooms").select("*").order("grade").order("subject");
    if (cls) setClassrooms(cls as Classroom[]);

    // Load school members (need profiles + roles)
    const { data: profile } = await supabase.from("profiles").select("school_id").eq("user_id", user.id).single();
    if (!profile?.school_id) return;

    const { data: membersData } = await supabase.rpc("get_school_members_with_roles");
    if (membersData && Array.isArray(membersData)) {
      setMembers(membersData as unknown as MemberRow[]);
    }

    // Load enrolled students for all classrooms
    const { data: enrollments } = await supabase.from("classroom_students").select("classroom_id, student_id");
    if (enrollments) {
      const map: Record<string, string[]> = {};
      for (const e of enrollments) {
        if (!map[e.classroom_id]) map[e.classroom_id] = [];
        map[e.classroom_id].push(e.student_id);
      }
      setEnrolledStudents(map);
    }

    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!formTeacher || !formSubject || !formGrade) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("manage-classroom", {
      body: { action: "create_classroom", teacher_id: formTeacher, subject: formSubject, grade: parseInt(formGrade), section: formSection },
    });
    setSaving(false);
    if (error || !data?.success) {
      toast.error(data?.error || error?.message || "Failed to create classroom");
      return;
    }
    toast.success("Classroom created");
    setShowCreate(false);
    setFormTeacher(""); setFormSubject(""); setFormGrade(""); setFormSection("A");
    loadData();
  };

  const handleDelete = async () => {
    if (!deletingClassroom) return;
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("manage-classroom", {
      body: { action: "delete_classroom", classroom_id: deletingClassroom.id },
    });
    setSaving(false);
    if (error || !data?.success) {
      toast.error(data?.error || error?.message || "Failed to delete");
      return;
    }
    toast.success("Classroom deleted");
    setDeletingClassroom(null);
    loadData();
  };

  const handleEnroll = async () => {
    if (!enrollingClassroom || selectedStudents.length === 0) return;
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("manage-classroom", {
      body: { action: "enroll_students", classroom_id: enrollingClassroom.id, student_ids: selectedStudents },
    });
    setSaving(false);
    if (error || !data?.success) {
      toast.error(data?.error || error?.message || "Failed to enroll");
      return;
    }
    toast.success(`${selectedStudents.length} student(s) enrolled`);
    setEnrollingClassroom(null);
    setSelectedStudents([]);
    loadData();
  };

  const handleUnenroll = async (classroomId: string, studentId: string) => {
    const { data, error } = await supabase.functions.invoke("manage-classroom", {
      body: { action: "unenroll_student", classroom_id: classroomId, student_id: studentId },
    });
    if (error || !data?.success) {
      toast.error("Failed to remove student");
      return;
    }
    toast.success("Student removed from classroom");
    loadData();
  };

  const openEnroll = (cls: Classroom) => {
    setEnrollingClassroom(cls);
    const already = enrolledStudents[cls.id] || [];
    setSelectedStudents([]);
    setStudentSearch("");
  };

  const getTeacherName = (id: string) => members.find(m => m.user_id === id)?.full_name || "Unknown";
  const getStudentName = (id: string) => members.find(m => m.user_id === id)?.full_name || "Unknown";

  const subjectIcon = (subject: string) => {
    if (subject === "physics") return "⚛️";
    if (subject === "chemistry") return "🧪";
    return "🔬";
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) &&
    !(enrolledStudents[enrollingClassroom?.id || ""] || []).includes(s.user_id)
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold flex items-center gap-2">
          <School className="w-5 h-5 text-primary" /> Classrooms ({classrooms.length})
        </h2>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Create Classroom
        </Button>
      </div>

      {teachers.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4 text-sm text-amber-800 dark:text-amber-200">
          ⚠️ No teachers found in your school. Invite teachers first before creating classrooms.
        </div>
      )}

      {classrooms.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
          <School className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No classrooms yet</p>
          <p className="text-sm mt-1">Create classrooms to link teachers with their grade & subject students.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classrooms.map((cls) => {
            const enrolled = enrolledStudents[cls.id] || [];
            const isExpanded = expandedClassroom === cls.id;

            return (
              <div key={cls.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedClassroom(isExpanded ? null : cls.id)}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                    {subjectIcon(cls.subject)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold truncate">{cls.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Teacher: {getTeacherName(cls.teacher_id)} · {enrolled.length} students
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">{cls.subject}</Badge>
                  <Badge variant="secondary" className="text-xs shrink-0">Grade {cls.grade}</Badge>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Enrolled Students ({enrolled.length})</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEnroll(cls)} className="gap-1">
                          <UserPlus className="w-3.5 h-3.5" /> Add Students
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive gap-1" onClick={() => setDeletingClassroom(cls)}>
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </div>

                    {enrolled.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {enrolled.map(sid => (
                          <div key={sid} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/30">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-sm">{getStudentName(sid)}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleUnenroll(cls.id, sid); }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Classroom Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Classroom</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Teacher *</Label>
              <Select value={formTeacher} onValueChange={setFormTeacher}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subject *</Label>
                <Select value={formSubject} onValueChange={setFormSubject}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Grade *</Label>
                <Select value={formGrade} onValueChange={setFormGrade}>
                  <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Section</Label>
              <Input value={formSection} onChange={e => setFormSection(e.target.value)} placeholder="A" maxLength={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enroll Students Dialog */}
      <Dialog open={!!enrollingClassroom} onOpenChange={() => setEnrollingClassroom(null)}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Students — {enrollingClassroom?.name}</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex-1 overflow-auto space-y-1 max-h-60">
            {filteredStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No students available to add.</p>
            ) : (
              filteredStudents.map(s => (
                <label key={s.user_id} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-muted/30 cursor-pointer">
                  <Checkbox
                    checked={selectedStudents.includes(s.user_id)}
                    onCheckedChange={(checked) => {
                      setSelectedStudents(prev =>
                        checked ? [...prev, s.user_id] : prev.filter(id => id !== s.user_id)
                      );
                    }}
                  />
                  <span className="text-sm">{s.full_name}</span>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollingClassroom(null)}>Cancel</Button>
            <Button onClick={handleEnroll} disabled={saving || selectedStudents.length === 0}>
              {saving ? "Enrolling..." : `Enroll ${selectedStudents.length} Student(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingClassroom} onOpenChange={() => setDeletingClassroom(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Classroom?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingClassroom?.name}</strong> and all its assignments and enrollments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
