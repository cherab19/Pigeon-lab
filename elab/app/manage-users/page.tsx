"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Beaker, Users, UserPlus, ChevronLeft, User, Shield, Upload, Send,
  CheckCircle2, XCircle, FileSpreadsheet, Mail, Loader2, MoreHorizontal,
  Pencil, Trash2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import PigeonlabLogo from "@/components/PigeonlabLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSafeUser } from "@/lib/session-client";
import { toast } from "sonner";
import ChapaCheckoutModal from "@/components/payments/ChapaCheckoutModal";
import SeatUsageCard from "@/components/payments/SeatUsageCard";
import { useSeatQuota } from "@/hooks/useSeatQuota";

type MemberRow = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
};

type BulkEntry = {
  email: string;
  full_name: string;
  role: "teacher" | "student";
};

type InviteResult = {
  email: string;
  success: boolean;
  error?: string;
};

export default function ManageUsers() {
  const { t } = useLanguage();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState("");
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { quota, refresh: refreshQuota } = useSeatQuota(schoolId);

  // Payment modal state
  const [payOpen, setPayOpen] = useState(false);
  const [payDefaults, setPayDefaults] = useState<{ teachers: number; students: number; reason: string }>({ teachers: 0, students: 0, reason: "" });
  const [pendingInvites, setPendingInvites] = useState<BulkEntry[] | null>(null);

  // Individual invite state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"teacher" | "student">("student");
  const [inviting, setInviting] = useState(false);

  // Bulk import state
  const [bulkEntries, setBulkEntries] = useState<BulkEntry[]>([]);
  const [bulkText, setBulkText] = useState("");
  const [bulkInviting, setBulkInviting] = useState(false);
  const [inviteResults, setInviteResults] = useState<InviteResult[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit/Delete state
  const [editingMember, setEditingMember] = useState<MemberRow | null>(null);
  const [editRole, setEditRole] = useState<"teacher" | "student">("student");
  const [savingRole, setSavingRole] = useState(false);
  const [removingMember, setRemovingMember] = useState<MemberRow | null>(null);
  const [removing, setRemoving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const loadMembers = async () => {
    const user = await getSafeUser();
    if (!user) { router.push("/login"); return; }
    setCurrentUserId(user.id);

    try {
      const resProfile = await fetch("/api/profile");
      if (!resProfile.ok) { router.push("/dashboard"); return; }
      const profData = await resProfile.json();

      if (profData.role !== "school_admin" && profData.role !== "super_admin") {
        toast.error(t("manage.accessDenied"));
        router.push("/dashboard");
        return;
      }
      setIsAdmin(true);
      setSchoolId(profData.school_id);
      setSchoolName(profData.school_name);

      const resMembers = await fetch("/api/rpc/get-school-members-with-roles");
      if (resMembers.ok) {
        const membersData = await resMembers.json();
        setMembers(membersData.map((m: any) => ({ ...m, avatar_url: null })));
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  const sendInvitations = async (entries: BulkEntry[]) => {
    const res = await fetch("/api/invite-school-members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ members: entries }),
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  };

  const triggerPaymentForShortfall = (entries: BulkEntry[], shortfall: { teacher_seats: number; student_seats: number }) => {
    setPendingInvites(entries);
    setPayDefaults({
      teachers: shortfall.teacher_seats || 0,
      students: shortfall.student_seats || 0,
      reason: t("pay.quotaReason") || "Your school has reached its seat limit. Buy more seats to invite these members.",
    });
    setPayOpen(true);
  };

  const handleInvite = async () => {
    if (!newEmail || !newName) {
      toast.error(t("manage.fillNameEmail"));
      return;
    }
    setInviting(true);
    try {
      const entries: BulkEntry[] = [{ email: newEmail, full_name: newName, role: newRole }];
      const { status, json } = await sendInvitations(entries);

      if (status === 402 && json?.shortfall) {
        triggerPaymentForShortfall(entries, json.shortfall);
        toast.message(t("pay.quotaToast") || "Seat limit reached — opening checkout");
        return;
      }
      if (!json?.success) {
        toast.error(json?.results?.[0]?.error || json?.message || t("manage.failedInvite"));
      } else if (json?.results?.[0]?.success) {
        toast.success(`${t("manage.invitationSent")} ${newEmail}`);
        setNewEmail(""); setNewName(""); setNewRole("student");
        loadMembers(); refreshQuota();
      } else {
        toast.error(json?.results?.[0]?.error || t("manage.failedInvite"));
      }
    } catch (e: any) {
      toast.error(e.message || t("manage.errorOccurred"));
    } finally {
      setInviting(false);
    }
  };

  const parseCSV = (text: string): BulkEntry[] => {
    const lines = text.trim().split("\n");
    const entries: BulkEntry[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const lower = line.toLowerCase();
      if (lower.includes("email") && lower.includes("name") && lower.includes("role")) continue;

      const parts = line.split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
      if (parts.length >= 3) {
        const [email, full_name, role] = parts;
        if (email && full_name && (role === "teacher" || role === "student")) {
          entries.push({ email, full_name, role: role as "teacher" | "student" });
        }
      }
    }
    return entries;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkText(text);
      const entries = parseCSV(text);
      setBulkEntries(entries);
      if (entries.length === 0) {
        toast.error(t("manage.noValidEntries"));
      } else {
        toast.success(`${entries.length} ${t("manage.validEntries")}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePasteChange = (text: string) => {
    setBulkText(text);
    const entries = parseCSV(text);
    setBulkEntries(entries);
  };

  const handleBulkInvite = async (entriesArg?: BulkEntry[]) => {
    const entries = entriesArg ?? bulkEntries;
    if (entries.length === 0) {
      toast.error(t("manage.noValidEntries"));
      return;
    }
    setBulkInviting(true);
    setInviteResults(null);
    try {
      const { status, json } = await sendInvitations(entries);

      if (status === 402 && json?.shortfall) {
        triggerPaymentForShortfall(entries, json.shortfall);
        toast.message(t("pay.quotaToast") || "Seat limit reached — opening checkout");
        return;
      }
      if (!json?.success) {
        toast.error(json?.message || t("manage.failedInvite"));
        return;
      }
      setInviteResults(json.results);
      const { invited, failed } = json.summary;
      if (failed === 0) {
        toast.success(t("manage.allSent"));
      } else {
        toast.warning(
          t("manage.someSent").replace("{invited}", String(invited)).replace("{failed}", String(failed))
        );
      }
      loadMembers(); refreshQuota();
    } catch (e: any) {
      toast.error(e.message || t("manage.errorOccurred"));
    } finally {
      setBulkInviting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    refreshQuota();
    if (pendingInvites && pendingInvites.length > 0) {
      const queued = pendingInvites;
      setPendingInvites(null);
      toast.message(t("pay.retrying") || "Payment received — sending invitations…");
      await handleBulkInvite(queued);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingMember) return;
    setSavingRole(true);
    try {
      const res = await fetch("/api/manage-school-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_role",
          member_user_id: editingMember.user_id,
          new_role: editRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success(t("manage.roleUpdated"));
      setEditingMember(null);
      loadMembers();
    } catch (e: any) {
      toast.error(e.message || t("manage.errorOccurred"));
    } finally {
      setSavingRole(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMember) return;
    setRemoving(true);
    try {
      const res = await fetch("/api/manage-school-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove",
          member_user_id: removingMember.user_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Removal failed");
      toast.success(t("manage.memberRemoved"));
      setRemovingMember(null);
      loadMembers(); refreshQuota();
    } catch (e: any) {
      toast.error(e.message || t("manage.errorOccurred"));
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 gap-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
              <Link href="/dashboard">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </Button>
            <span className="font-semibold text-lg">{t("manage.schoolUsers")}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{schoolName}</h1>
            <p className="text-sm text-muted-foreground">{t("manage.desc")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setPayDefaults({ teachers: 0, students: 0, reason: "" }); setPayOpen(true); }}>
            <UserPlus className="w-4 h-4 mr-2" /> Buy Seats
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{t("manage.schoolMembers")}</CardTitle>
                <CardDescription>{t("manage.membersCount").replace("{count}", String(members.length))}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common.name")}</TableHead>
                        <TableHead>{t("common.role")}</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.user_id} className={member.user_id === currentUserId ? "bg-muted/40" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                                {member.full_name[0]?.toUpperCase() || "U"}
                              </div>
                              <div>
                                <span>{member.full_name}</span>
                                {member.user_id === currentUserId && (
                                  <span className="ml-2 text-xs text-muted-foreground">({t("common.you")})</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                             <Badge variant={member.role === "school_admin" ? "default" : member.role === "teacher" ? "secondary" : "outline"}>
                              {t(`common.${member.role}`) || member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {member.user_id !== currentUserId && member.role !== "school_admin" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setEditingMember(member); setEditRole(member.role as any); }}>
                                    <Pencil className="w-4 h-4 mr-2" /> {t("common.edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setRemovingMember(member)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> {t("common.remove")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <SeatUsageCard quota={quota} loading={false} />

            <Card>
              <CardHeader>
                <CardTitle>{t("manage.addMembers")}</CardTitle>
                <CardDescription>{t("manage.inviteOption")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="single">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="single">{t("manage.single")}</TabsTrigger>
                    <TabsTrigger value="bulk">{t("manage.bulk")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="single" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>{t("common.name")}</Label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Abebe Bikila" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.email")}</Label>
                      <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="abebe@school.edu.et" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.role")}</Label>
                      <Select value={newRole} onValueChange={(val) => setNewRole(val as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">{t("common.student")}</SelectItem>
                          <SelectItem value="teacher">{t("common.teacher")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleInvite} className="w-full" disabled={inviting}>
                      {inviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      {t("manage.sendInvite")}
                    </Button>
                  </TabsContent>

                  <TabsContent value="bulk" className="space-y-4 pt-4">
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" /> {t("manage.uploadCsv")}
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("manage.pasteCsv")}</Label>
                      <Textarea
                        rows={6}
                        placeholder={`email,name,role\nabebe@school.edu.et,Abebe Bikila,student\naster@school.edu.et,Aster Aweke,teacher`}
                        value={bulkText}
                        onChange={(e) => handlePasteChange(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => handleBulkInvite()} className="w-full" disabled={bulkInviting || bulkEntries.length === 0}>
                      {bulkInviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      {t("manage.inviteCount").replace("{count}", String(bulkEntries.length))}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("manage.editRole")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {t("manage.editRoleDesc").replace("{name}", editingMember?.full_name || "")}
            </p>
            <div className="space-y-2">
              <Label>{t("common.role")}</Label>
              <Select value={editRole} onValueChange={(val) => setEditRole(val as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">{t("common.student")}</SelectItem>
                  <SelectItem value="teacher">{t("common.teacher")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>{t("common.cancel")}</Button>
            <Button onClick={handleUpdateRole} disabled={savingRole}>
              {savingRole && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member AlertDialog */}
      <AlertDialog open={!!removingMember} onOpenChange={(open) => !open && setRemovingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("manage.removeConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("manage.removeConfirmDesc").replace("{name}", removingMember?.full_name || "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemovingMember(null)}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} disabled={removing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {removing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t("common.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Chapa Payment checkout */}
      {schoolId && (
        <ChapaCheckoutModal
          open={payOpen}
          onOpenChange={setPayOpen}
          defaultTeacherSeats={payDefaults.teachers}
          defaultStudentSeats={payDefaults.students}
          reason={payDefaults.reason}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
