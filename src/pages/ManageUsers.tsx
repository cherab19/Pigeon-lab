import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Beaker, Users, UserPlus, ChevronLeft, User, Shield, Upload, Send,
  CheckCircle2, XCircle, FileSpreadsheet, Mail, Loader2, MoreHorizontal,
  Pencil, Trash2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import AxislabLogo from "@/components/AxislabLogo";
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
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";
import { toast } from "@/components/ui/sonner";
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
  const navigate = useNavigate();
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
    if (!user) { navigate("/login"); return; }
    setCurrentUserId(user.id);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "school_admin" as any);

    if (!roleData || roleData.length === 0) {
      toast.error(t("manage.accessDenied"));
      navigate("/dashboard");
      return;
    }
    setIsAdmin(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.school_id) { navigate("/dashboard"); return; }
    setSchoolId(profile.school_id);

    const { data: school } = await supabase
      .from("schools")
      .select("name")
      .eq("id", profile.school_id)
      .single();
    if (school) setSchoolName(school.name);

    const { data: membersData } = await supabase.rpc("get_school_members_with_roles");
    if (membersData) {
      const parsed = membersData as unknown as { user_id: string; full_name: string; role: string }[];
      setMembers(parsed.map(m => ({ ...m, avatar_url: null })));
    }
    setLoading(false);
  };

  useEffect(() => { loadMembers(); }, [navigate]);

  // Send invitations via raw fetch so we can read the 402 quota body
  const sendInvitations = async (entries: BulkEntry[]) => {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess?.session?.access_token;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-school-members`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
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

  // Individual invite
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

  // CSV parsing
  const parseCSV = (text: string): BulkEntry[] => {
    const lines = text.trim().split("\n");
    const entries: BulkEntry[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip header row
      const lower = line.toLowerCase();
      if (lower.includes("email") && lower.includes("name") && lower.includes("role")) continue;

      const parts = line.split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
      if (parts.length >= 3) {
        const [email, full_name, role] = parts;
        if (email && full_name && (role === "teacher" || role === "student")) {
          entries.push({ email, full_name, role });
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
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const handlePasteChange = (text: string) => {
    setBulkText(text);
    const entries = parseCSV(text);
    setBulkEntries(entries);
  };

  // Bulk invite
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

  // After successful payment, retry the queued invitations
  const handlePaymentSuccess = async () => {
    refreshQuota();
    if (pendingInvites && pendingInvites.length > 0) {
      const queued = pendingInvites;
      setPendingInvites(null);
      toast.message(t("pay.retrying") || "Payment received — sending invitations…");
      await handleBulkInvite(queued);
    }
  };

  // Update member role
  const handleUpdateRole = async () => {
    if (!editingMember) return;
    setSavingRole(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-school-member", {
        body: { action: "update_role", member_user_id: editingMember.user_id, new_role: editRole },
      });
      if (error || !data?.success) {
        toast.error(data?.error || error?.message || t("manage.failedUpdateRole"));
      } else {
        toast.success(`${editingMember.full_name} — ${t("manage.roleUpdatedTo")} ${editRole}`);
        setEditingMember(null);
        loadMembers();
      }
    } catch (e: any) {
      toast.error(e.message || t("manage.errorOccurred"));
    } finally {
      setSavingRole(false);
    }
  };

  // Remove member from school
  const handleRemoveMember = async () => {
    if (!removingMember) return;
    setRemoving(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-school-member", {
        body: { action: "remove", member_user_id: removingMember.user_id },
      });
      if (error || !data?.success) {
        toast.error(data?.error || error?.message || t("manage.failedRemove"));
      } else {
        toast.success(`${removingMember.full_name} — ${t("manage.removedFromSchool")}`);
        setRemovingMember(null);
        loadMembers();
      }
    } catch (e: any) {
      toast.error(e.message || t("manage.errorOccurred"));
    } finally {
      setRemoving(false);
    }
  };

  const roleBadgeVariant = (role: string) => {
    if (role === "school_admin") return "default";
    if (role === "teacher") return "secondary";
    return "outline";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <AxislabLogo size="sm" />
            </Link>
          </div>
          <LanguageToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ChevronLeft className="w-4 h-4 mr-1" /> {t("nav.backToDashboard")}</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" /> {t("manage.title")}
            </h1>
            {schoolName && <p className="text-muted-foreground mt-1">{schoolName}</p>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: t("manage.totalMembers"), value: members.length, icon: Users },
              { label: t("common.teachers"), value: members.filter(m => m.role === "teacher").length, icon: Shield },
              { label: t("common.students"), value: members.filter(m => m.role === "student").length, icon: User },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-display font-bold">{s.value}</p>
                  </div>
                  <s.icon className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Invite Tabs */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> {t("manage.inviteMembers")}
              </CardTitle>
              <CardDescription>
                {t("manage.inviteDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="individual">
                <TabsList className="mb-6">
                  <TabsTrigger value="individual" className="gap-1.5">
                    <UserPlus className="w-4 h-4" /> {t("manage.individual")}
                  </TabsTrigger>
                  <TabsTrigger value="bulk" className="gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" /> {t("manage.bulkImport")}
                  </TabsTrigger>
                </TabsList>

                {/* Individual Invite */}
                <TabsContent value="individual">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inv-name">{t("signup.fullName")}</Label>
                      <Input
                        id="inv-name"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Abebe Kebede"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-email">{t("common.email")}</Label>
                      <Input
                        id="inv-email"
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="member@school.edu.et"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.role")}</Label>
                      <Select value={newRole} onValueChange={(v) => setNewRole(v as "teacher" | "student")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">{t("manage.student")}</SelectItem>
                          <SelectItem value="teacher">{t("manage.teacher")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleInvite} disabled={inviting} className="w-full gap-2">
                        {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {inviting ? t("manage.sending") : t("manage.sendInvitation")}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Bulk Import */}
                <TabsContent value="bulk">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" /> {t("manage.uploadCsvBtn")}
                      </Button>
                      <span className="text-sm text-muted-foreground">{t("manage.orPaste")}</span>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("manage.csvFormatHint")}</p>
                      <code className="text-xs text-foreground">email, full_name, role</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("manage.example")}: <code className="text-foreground">teacher@school.et, Tigist Hailu, teacher</code>
                      </p>
                    </div>

                    <Textarea
                      placeholder={`email, full_name, role\nteacher@school.et, Tigist Hailu, teacher\nstudent@school.et, Dawit Tadesse, student`}
                      value={bulkText}
                      onChange={e => handlePasteChange(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />

                    {bulkEntries.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {bulkEntries.length} {bulkEntries.length === 1 ? t("manage.entry") : t("manage.entries")} · {t("manage.validEntries")}
                          </p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>{bulkEntries.filter(e => e.role === "teacher").length} {t("common.teachers")}</span>
                            <span>·</span>
                            <span>{bulkEntries.filter(e => e.role === "student").length} {t("common.students")}</span>
                          </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">{t("common.email")}</TableHead>
                                <TableHead className="text-xs">{t("common.name")}</TableHead>
                                <TableHead className="text-xs">{t("common.role")}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bulkEntries.map((entry, i) => (
                                <TableRow key={i}>
                                  <TableCell className="text-sm">{entry.email}</TableCell>
                                  <TableCell className="text-sm">{entry.full_name}</TableCell>
                                  <TableCell>
                                    <Badge variant={entry.role === "teacher" ? "secondary" : "outline"}>
                                      {entry.role.charAt(0).toUpperCase() + entry.role.slice(1)}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        <Button
                          onClick={handleBulkInvite}
                          disabled={bulkInviting}
                          className="w-full gap-2"
                        >
                          {bulkInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          {bulkInviting ? t("manage.sendingInvitations") : `${t("manage.send")} ${bulkEntries.length} ${t("manage.sendInvitations")}`}
                        </Button>
                      </div>
                    )}

                    {/* Results */}
                    {inviteResults && (
                      <div className="space-y-2 border-t border-border pt-4">
                        <p className="text-sm font-medium">{t("manage.invitationResults")}</p>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {inviteResults.map((r, i) => (
                            <div key={i} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${r.success ? "bg-green-500/10" : "bg-destructive/10"}`}>
                              {r.success
                                ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                : <XCircle className="w-4 h-4 text-destructive shrink-0" />
                              }
                              <span className="font-medium">{r.email}</span>
                              {!r.success && <span className="text-xs text-muted-foreground ml-auto">{r.error}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Members table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("manage.schoolMembers")}</CardTitle>
              <CardDescription>{t("manage.schoolMembersDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>{t("manage.noMembersYet")}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("common.role")}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map(m => (
                      <TableRow key={m.user_id}>
                        <TableCell className="font-medium">{m.full_name}</TableCell>
                        <TableCell>
                          <Badge variant={roleBadgeVariant(m.role)}>
                            {m.role === "school_admin"
                              ? t("manage.admin")
                              : m.role === "teacher"
                              ? t("manage.teacher")
                              : t("manage.student")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {m.role !== "school_admin" && m.user_id !== currentUserId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setEditingMember(m);
                                  setEditRole(m.role as "teacher" | "student");
                                }}>
                                  <Pencil className="w-4 h-4 mr-2" /> {t("manage.changeRoleTo")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setRemovingMember(m)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> {t("manage.removeMemberAction")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("manage.changeRoleTitle")} — {editingMember?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">{t("manage.newRole")}</Label>
            <Select value={editRole} onValueChange={(v) => setEditRole(v as "teacher" | "student")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">{t("manage.student")}</SelectItem>
                <SelectItem value="teacher">{t("manage.teacher")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>{t("common.cancel")}</Button>
            <Button onClick={handleUpdateRole} disabled={savingRole}>
              {savingRole ? t("manage.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removingMember} onOpenChange={() => setRemovingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("manage.removeTitle")} {removingMember?.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {t("manage.removeMemberDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? t("manage.removingMember") : t("manage.removeMemberAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
