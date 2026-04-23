import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, X, MoreHorizontal, Shield, GraduationCap, BookOpen, User, Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserRow {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  school_id: string | null;
  school_name: string | null;
  role: string;
  created_at: string;
}

const roleIcons: Record<string, typeof Shield> = {
  super_admin: Shield,
  school_admin: Building,
  teacher: BookOpen,
  student: GraduationCap,
};

const roleColors: Record<string, string> = {
  super_admin: "bg-primary/10 text-primary border-primary/20",
  school_admin: "bg-secondary/10 text-secondary border-secondary/20",
  teacher: "bg-accent/10 text-accent border-accent/20",
  student: "bg-muted text-muted-foreground border-border",
};

export default function SuperAdminUserManager() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentUserId, setCurrentUserId] = useState("");

  // Edit role state
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);

  // Remove state
  const [removingUser, setRemovingUser] = useState<UserRow | null>(null);

  const loadUsers = async () => {
    const user = await getSafeUser();
    if (user) setCurrentUserId(user.id);

    const { data } = await supabase.rpc("get_super_admin_all_users");
    if (data) setUsers(data as unknown as UserRow[]);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.school_name?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("super-admin-manage", {
      body: { action: "update_user_role", user_id: editingUser.user_id, new_role: editRole },
    });
    setSaving(false);
    if (error || !data?.success) {
      toast.error(data?.error || error?.message || t("superUsers.failedUpdate"));
      return;
    }
    toast.success(`${t("superUsers.roleUpdated")} ${editRole}`);
    setEditingUser(null);
    loadUsers();
  };

  const handleRemoveUser = async () => {
    if (!removingUser) return;
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("super-admin-manage", {
      body: { action: "remove_user", user_id: removingUser.user_id },
    });
    setSaving(false);
    if (error || !data?.success) {
      toast.error(data?.error || error?.message || t("superUsers.failedRemove"));
      return;
    }
    toast.success(t("superUsers.removed"));
    setRemovingUser(null);
    loadUsers();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse h-16" />
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> {t("superUsers.title")} ({users.length})
        </h2>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("superUsers.searchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("superUsers.filterByRole")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("superUsers.allRoles")}</SelectItem>
            <SelectItem value="super_admin">{t("super.role")}</SelectItem>
            <SelectItem value="school_admin">{t("admin.role")}</SelectItem>
            <SelectItem value="teacher">{t("teacher.role")}</SelectItem>
            <SelectItem value="student">{t("manage.student")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{t("superUsers.noUsersFound")}</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">{t("superUsers.user")}</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">{t("superUsers.school")}</th>
                <th className="text-left p-4 font-medium text-muted-foreground">{t("common.role")}</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">{t("manage.joined")}</th>
                <th className="text-right p-4 font-medium text-muted-foreground">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const RoleIcon = roleIcons[u.role] || User;
                const isSelf = u.user_id === currentUserId;
                return (
                  <tr key={u.user_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">{u.full_name || t("superUsers.unnamed")}</span>
                          {isSelf && <Badge variant="outline" className="ml-2 text-[10px]">{t("superUsers.you")}</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                      {u.school_name || <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={`${roleColors[u.role] || ""} border text-xs`}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {u.role?.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs hidden lg:table-cell">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {!isSelf && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingUser(u); setEditRole(u.role); }}>
                              {t("superUsers.changeRole")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setRemovingUser(u)}>
                              {t("superUsers.removeUser")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("superUsers.changeRole")} — {editingUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">{t("super.role")}</SelectItem>
                <SelectItem value="school_admin">{t("admin.role")}</SelectItem>
                <SelectItem value="teacher">{t("teacher.role")}</SelectItem>
                <SelectItem value="student">{t("manage.student")}</SelectItem>
              </SelectContent>
            </Select>
            {editingUser?.school_name && (
              <p className="text-xs text-muted-foreground mt-2">{t("superUsers.schoolLabel")}: {editingUser.school_name}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>{t("common.cancel")}</Button>
            <Button onClick={handleUpdateRole} disabled={saving}>{saving ? t("superUsers.savingDots") : t("superUsers.updateRole")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove User Confirmation */}
      <AlertDialog open={!!removingUser} onOpenChange={() => setRemovingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("superUsers.removeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("superUsers.removeDesc").replace("{name}", removingUser?.full_name || "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("manage.removeTitle")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
