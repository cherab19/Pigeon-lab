import { useState } from "react";
import { motion } from "framer-motion";
import {
  School, Plus, Edit2, Trash2, MapPin, Mail, Phone, Search, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionData {
  school_id: string;
  school_name: string;
  school_location: string | null;
  school_email: string | null;
  school_phone: string | null;
  status: string;
  total_members: number;
  student_count: number;
  monthly_revenue: number;
}

interface Props {
  subscriptions: SubscriptionData[];
  onRefresh: () => void;
}

export default function SuperAdminSchoolManager({ subscriptions, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SubscriptionData | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<SubscriptionData | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const filtered = subscriptions.filter(s =>
    s.school_name.toLowerCase().includes(search.toLowerCase()) ||
    s.school_location?.toLowerCase().includes(search.toLowerCase()) || false
  );

  const openCreate = () => {
    setFormName(""); setFormLocation(""); setFormEmail(""); setFormPhone("");
    setShowCreate(true);
  };

  const openEdit = (s: SubscriptionData) => {
    setFormName(s.school_name);
    setFormLocation(s.school_location || "");
    setFormEmail(s.school_email || "");
    setFormPhone(s.school_phone || "");
    setEditingSchool(s);
  };

  const handleCreate = async () => {
    if (!formName.trim()) { toast.error("School name is required"); return; }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("super-admin-manage", {
      body: { action: "create_school", name: formName, location: formLocation, email: formEmail, phone: formPhone },
    });
    setSaving(false);
    if (error || !data?.success) {
      toast.error(data?.error || error?.message || "Failed to create school");
      return;
    }
    toast.success("School created successfully");
    setShowCreate(false);
    onRefresh();
  };

  const handleUpdate = async () => {
    if (!editingSchool || !formName.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("super-admin-manage", {
      body: { action: "update_school", school_id: editingSchool.school_id, name: formName, location: formLocation, email: formEmail, phone: formPhone },
    });
    setSaving(false);
    if (error || !data?.success) {
      toast.error(data?.error || error?.message || "Failed to update school");
      return;
    }
    toast.success("School updated");
    setEditingSchool(null);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!deletingSchool) return;
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("super-admin-manage", {
      body: { action: "delete_school", school_id: deletingSchool.school_id },
    });
    setSaving(false);
    if (error || !data?.success) {
      toast.error(data?.error || error?.message || "Failed to delete school");
      return;
    }
    toast.success("School deleted");
    setDeletingSchool(null);
    onRefresh();
  };

  const SchoolForm = ({ onSave, title }: { onSave: () => void; title: string }) => (
    <>
      <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
      <div className="space-y-4 py-2">
        <div>
          <label className="text-sm font-medium mb-1.5 block">School Name *</label>
          <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="School name" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Location</label>
          <Input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="City, Region" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email</label>
          <Input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="school@example.com" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Phone</label>
          <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+251..." />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => { setShowCreate(false); setEditingSchool(null); }}>Cancel</Button>
        <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
      </DialogFooter>
    </>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold flex items-center gap-2">
          <School className="w-5 h-5 text-primary" /> Schools ({subscriptions.length})
        </h2>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add School
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search schools..."
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

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
          <School className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{search ? "No schools match your search" : "No schools registered yet"}</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">School</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Location</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Members</th>
                <th className="text-right p-4 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.school_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{s.school_name}</div>
                    {s.school_email && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{s.school_email}</div>}
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">
                    {s.school_location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.school_location}</span>}
                  </td>
                  <td className="p-4 text-right">{s.total_members}</td>
                  <td className="p-4 text-right hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">{s.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingSchool(s)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <SchoolForm onSave={handleCreate} title="Create New School" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingSchool} onOpenChange={() => setEditingSchool(null)}>
        <DialogContent>
          <SchoolForm onSave={handleUpdate} title={`Edit — ${editingSchool?.school_name}`} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSchool} onOpenChange={() => setDeletingSchool(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingSchool?.school_name}</strong> and remove all members from this school. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving ? "Deleting..." : "Delete School"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
