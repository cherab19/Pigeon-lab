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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
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
      toast.error(t("adminClass.fillRequired"));
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("manage-classroom", {
      body: { action: "create_classroom", teacher_id: formTeacher, subject: formSubject, grade: parseInt(formGrade), section: formSection },
    });
    setSaving(false);
    if (error || !data?.success) {
      toast.error(data?.error || error?.message || t("adminClass.fillRequired"));
      return;
    }
    toast.success(t("adminClass.created"));
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
      toast.error(data?.error || error?.message || t("common.delete"));
      return;
    }
    toast.success(t("adminClass.deleted"));
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
      toast.error(data?.error || error?.message || t("adminClass.enroll"));
      return;
    }
    toast.success(`${selectedStudents.length} ${t("adminClass.studentsEnrolled")}`);
    setEnrollingClassroom(null);
    setSelectedStudents([]);
    loadData();
  };

  const handleUnenroll = async (classroomId: string, studentId: string) => {
    const { data, error } = await supabase.functions.invoke("manage-classroom", {
      body: { action: "unenroll_student", classroom_id: classroomId, student_id: studentId },
    });
    if (error || !data?.success) {
      toast.error(t("adminClass.failedRemove"));
      return;
    }
    toast.success(t("adminClass.studentRemoved"));
    loadData();
  };

  const openEnroll = (cls: Classroom) => {
    setEnrollingClassroom(cls);
    const already = enrolledStudents[cls.id] || [];
    setSelectedStudents([]);
    setStudentSearch("");
  };

  const getTeacherName = (id: string) => members.find(m => m.user_id === id)?.full_name || t("common.unknown");
  const getStudentName = (id: string) => members.find(m => m.user_id === id)?.full_name || t("common.unknown");

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
          <School className="w-5 h-5 text-primary" /> {t("adminClass.title")} ({classrooms.length})
        </h2>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> {t("adminClass.create")}
        </Button>
      </div>

      {teachers.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4 text-sm text-amber-800 dark:text-amber-200">
          {t("adminClass.noTeachers")}
        </div>
      )}

      {classrooms.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
          <School className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{t("adminClass.noClassrooms")}</p>
          <p className="text-sm mt-1">{t("adminClass.noClassroomsDesc")}</p>
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
                      {t("adminClass.teacher")}: {getTeacherName(cls.teacher_id)} · {enrolled.length} {t("adminClass.students")}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">{cls.subject}</Badge>
                  <Badge variant="secondary" className="text-xs shrink-0">{t("common.grade")} {cls.grade}</Badge>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{t("adminClass.enrolledStudents")} ({enrolled.length})</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEnroll(cls)} className="gap-1">
                          <UserPlus className="w-3.5 h-3.5" /> {t("adminClass.addStudents")}
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive gap-1" onClick={() => setDeletingClassroom(cls)}>
                          <Trash2 className="w-3.5 h-3.5" /> {t("adminClass.delete")}
                        </Button>
                      </div>
                    </div>

                    {enrolled.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t("adminClass.noEnrolled")}</p>
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
                              {t("adminClass.remove")}
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
          <DialogHeader><DialogTitle>{t("adminClass.create")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>{t("adminClass.formTeacher")} *</Label>
              <Select value={formTeacher} onValueChange={setFormTeacher}>
                <SelectTrigger><SelectValue placeholder={t("adminClass.selectTeacher")} /></SelectTrigger>
                <SelectContent>
                  {teachers.map(t2 => (
                    <SelectItem key={t2.user_id} value={t2.user_id}>{t2.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("adminClass.formSubject")} *</Label>
                <Select value={formSubject} onValueChange={setFormSubject}>
                  <SelectTrigger><SelectValue placeholder={t("adminClass.selectSubject")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physics">{t("subject.physics")}</SelectItem>
                    <SelectItem value="chemistry">{t("subject.chemistry")}</SelectItem>
                    <SelectItem value="biology">{t("subject.biology")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("adminClass.formGrade")} *</Label>
                <Select value={formGrade} onValueChange={setFormGrade}>
                  <SelectTrigger><SelectValue placeholder={t("common.grade")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">{t("common.grade")} 9</SelectItem>
                    <SelectItem value="10">{t("common.grade")} 10</SelectItem>
                    <SelectItem value="11">{t("common.grade")} 11</SelectItem>
                    <SelectItem value="12">{t("common.grade")} 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("adminClass.formSection")}</Label>
              <Input value={formSection} onChange={e => setFormSection(e.target.value)} placeholder="A" maxLength={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? t("adminClass.creating") : t("adminClass.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enroll Students Dialog */}
      <Dialog open={!!enrollingClassroom} onOpenChange={() => setEnrollingClassroom(null)}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("adminClass.addStudents")} — {enrollingClassroom?.name}</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("adminClass.searchStudents")}
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex-1 overflow-auto space-y-1 max-h-60">
            {filteredStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("adminClass.noStudentsAvail")}</p>
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
            <Button variant="outline" onClick={() => setEnrollingClassroom(null)}>{t("common.cancel")}</Button>
            <Button onClick={handleEnroll} disabled={saving || selectedStudents.length === 0}>
              {saving ? t("adminClass.enrolling") : `${t("adminClass.enroll")} ${selectedStudents.length} ${t("adminClass.studentsCount")}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingClassroom} onOpenChange={() => setDeletingClassroom(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("adminClass.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("adminClass.deleteDesc").replace("{name}", deletingClassroom?.name || "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
