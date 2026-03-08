import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Beaker, Users, UserPlus, Trash2, ChevronLeft, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type MemberRow = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
};

export default function ManageUsers() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Add-member form state
  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"teacher" | "student">("student");
  const [newPassword, setNewPassword] = useState("");
  const [adding, setAdding] = useState(false);

  const loadMembers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }

    // Check if school_admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "school_admin" as any);

    if (!roleData || roleData.length === 0) {
      toast.error("Access denied. School admin role required.");
      navigate("/dashboard");
      return;
    }
    setIsAdmin(true);

    // Get admin's school
    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.school_id) { navigate("/dashboard"); return; }

    const { data: school } = await supabase
      .from("schools")
      .select("name")
      .eq("id", profile.school_id)
      .single();
    if (school) setSchoolName(school.name);

    // Get all profiles in this school
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .eq("school_id", profile.school_id);

    if (profiles) {
      // Get roles for each member
      const memberRows: MemberRow[] = [];
      for (const p of profiles) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", p.user_id);
        const role = roles?.[0]?.role || "student";
        memberRows.push({ ...p, role });
      }
      setMembers(memberRows);
    }
    setLoading(false);
  };

  useEffect(() => { loadMembers(); }, [navigate]);

  const handleAddMember = async () => {
    if (!newEmail || !newName || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setAdding(true);
    try {
      // Get admin's school_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .single();

      if (!adminProfile?.school_id) {
        toast.error("Could not determine school");
        return;
      }

      // Call edge function to create user
      const { data, error } = await supabase.functions.invoke("create-school-member", {
        body: {
          email: newEmail,
          password: newPassword,
          full_name: newName,
          role: newRole,
          school_id: adminProfile.school_id,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to add member");
      } else {
        toast.success(`${newRole === "teacher" ? "Teacher" : "Student"} added successfully`);
        setAddOpen(false);
        setNewEmail("");
        setNewName("");
        setNewPassword("");
        setNewRole("student");
        loadMembers();
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setAdding(false);
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
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Beaker className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">EthioLab</span>
            </Link>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-2">
                <Users className="w-7 h-7 text-primary" /> Manage Members
              </h1>
              {schoolName && <p className="text-muted-foreground mt-1">{schoolName}</p>}
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="default">
                  <UserPlus className="w-4 h-4 mr-1" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                  <DialogDescription>Create a teacher or student account for your school.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newRole} onValueChange={(v) => setNewRole(v as "teacher" | "student")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddMember} disabled={adding}>
                    {adding ? "Adding..." : "Add Member"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Members", value: members.length, icon: Users },
              { label: "Teachers", value: members.filter(m => m.role === "teacher").length, icon: Shield },
              { label: "Students", value: members.filter(m => m.role === "student").length, icon: User },
            ].map((s, i) => (
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

          {/* Members table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">School Members</CardTitle>
              <CardDescription>Teachers and students in your school</CardDescription>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No members yet. Add your first teacher or student.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map(m => (
                      <TableRow key={m.user_id}>
                        <TableCell className="font-medium">{m.full_name}</TableCell>
                        <TableCell>
                          <Badge variant={roleBadgeVariant(m.role)}>
                            {m.role === "school_admin" ? "Admin" : m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                          </Badge>
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
    </div>
  );
}
