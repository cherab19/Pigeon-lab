import { useEffect, useState } from "react";
import { dataClient } from "@/lib/data-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, BookOpen, Loader2, Upload, ListTree } from "lucide-react";
import { toast } from "sonner";
import { getSafeUser } from "@/lib/session-client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Textbook {
  id: string; title: string; subject: string; grade: number; language: string;
  total_pages: number; file_url: string; cover_url: string | null; description: string | null;
}
interface Chapter {
  id: string; textbook_id: string; chapter_number: number; title: string; start_page: number; end_page: number;
}

export default function SuperAdminTextbookManager() {
  const { t } = useLanguage();
  const [books, setBooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [openUpload, setOpenUpload] = useState(false);
  const [openChapters, setOpenChapters] = useState<Textbook | null>(null);

  // Upload form
  const [form, setForm] = useState({ title: "", subject: "physics", grade: "9", language: "en", description: "", total_pages: "0" });
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Chapters
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newCh, setNewCh] = useState({ chapter_number: 1, title: "", start_page: 1, end_page: 1 });

  const loadBooks = async () => {
    const { data } = await dataClient.from("textbooks").select("*").order("grade").order("subject");
    setBooks((data || []) as Textbook[]);
    setLoading(false);
  };

  useEffect(() => { loadBooks(); }, []);

  const loadChapters = async (textbookId: string) => {
    const { data } = await dataClient.from("textbook_chapters").select("*").eq("textbook_id", textbookId).order("chapter_number");
    setChapters((data || []) as Chapter[]);
  };

  const handleUpload = async () => {
    if (!file || !form.title.trim()) { toast.error("PDF file and title required"); return; }
    setUploading(true);
    try {
      const user = await getSafeUser();
      if (!user) throw new Error("Not authenticated");

      const ts = Date.now();
      const pdfPath = `${form.subject}/grade${form.grade}/${ts}-${file.name}`;
      const { error: pdfErr } = await dataClient.storage.from("textbooks").upload(pdfPath, file, { contentType: "application/pdf", upsert: false });
      if (pdfErr) throw pdfErr;
      const { data: { publicUrl: fileUrl } } = dataClient.storage.from("textbooks").getPublicUrl(pdfPath);

      let coverUrl: string | null = null;
      if (coverFile) {
        const coverPath = `${form.subject}/grade${form.grade}/cover-${ts}-${coverFile.name}`;
        const { error: ce } = await dataClient.storage.from("textbooks").upload(coverPath, coverFile, { upsert: false });
        if (!ce) coverUrl = dataClient.storage.from("textbooks").getPublicUrl(coverPath).data.publicUrl;
      }

      const { error: insErr } = await dataClient.from("textbooks").insert({
        title: form.title, subject: form.subject, grade: Number(form.grade), language: form.language,
        description: form.description || null, total_pages: Number(form.total_pages) || 0,
        file_url: fileUrl, cover_url: coverUrl, created_by: user.id,
      });
      if (insErr) throw insErr;

      toast.success("Textbook uploaded");
      setOpenUpload(false);
      setForm({ title: "", subject: "physics", grade: "9", language: "en", description: "", total_pages: "0" });
      setFile(null); setCoverFile(null);
      await loadBooks();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Upload failed");
    } finally { setUploading(false); }
  };

  const deleteBook = async (b: Textbook) => {
    if (!confirm(`Delete "${b.title}"?`)) return;
    const { error } = await dataClient.from("textbooks").delete().eq("id", b.id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Deleted");
    await loadBooks();
  };

  const addChapter = async () => {
    if (!openChapters || !newCh.title.trim()) return;
    const { error } = await dataClient.from("textbook_chapters").insert({
      textbook_id: openChapters.id, chapter_number: newCh.chapter_number,
      title: newCh.title, start_page: newCh.start_page, end_page: newCh.end_page,
    });
    if (error) { toast.error("Failed"); return; }
    setNewCh({ chapter_number: newCh.chapter_number + 1, title: "", start_page: newCh.end_page + 1, end_page: newCh.end_page + 10 });
    await loadChapters(openChapters.id);
  };

  const deleteChapter = async (id: string) => {
    await dataClient.from("textbook_chapters").delete().eq("id", id);
    if (openChapters) await loadChapters(openChapters.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-display font-semibold flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> {t("super.textbookLibrary")}</h2>
          <p className="text-sm text-muted-foreground">{t("super.textbookLibraryDesc")}</p>
        </div>
        <Dialog open={openUpload} onOpenChange={setOpenUpload}>
          <DialogTrigger asChild><Button><Upload className="w-4 h-4 mr-1" /> {t("super.uploadTextbook")}</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{t("super.uploadNewTextbook")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder={t("super.title")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="grid grid-cols-3 gap-2">
                <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="physics">Physics</SelectItem><SelectItem value="chemistry">Chemistry</SelectItem><SelectItem value="biology">Biology</SelectItem></SelectContent>
                </Select>
                <Select value={form.grade} onValueChange={(v) => setForm({ ...form, grade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[9, 10, 11, 12].map(g => <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="am">Amharic</SelectItem></SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Description (optional)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div>
                <label className="text-xs font-medium mb-1 block">{t("super.pdfFile")} *</label>
                <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">{t("super.coverImage")}</label>
                <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenUpload(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleUpload} disabled={uploading}>{uploading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t("super.uploading")}</> : t("super.upload")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />)}</div>
      ) : books.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground"><BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" /><p className="font-medium">{t("super.noTextbooks")}</p><p className="text-sm">{t("super.uploadFirst")}</p></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {books.map(b => (
            <Card key={b.id} className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{b.subject} · Grade {b.grade} · {b.language.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setOpenChapters(b); loadChapters(b.id); }}><ListTree className="w-3.5 h-3.5 mr-1" /> {t("super.chapters")}</Button>
                <Button size="sm" variant="ghost" onClick={() => deleteBook(b)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Chapters dialog */}
      <Dialog open={!!openChapters} onOpenChange={(o) => !o && setOpenChapters(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("super.chapters")} — {openChapters?.title}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Card className="p-3">
              <p className="text-xs font-semibold mb-2">{t("super.addChapter")}</p>
              <div className="grid grid-cols-12 gap-2">
                <Input className="col-span-2" type="number" placeholder="#" value={newCh.chapter_number} onChange={(e) => setNewCh({ ...newCh, chapter_number: Number(e.target.value) })} />
                <Input className="col-span-6" placeholder={t("super.title")} value={newCh.title} onChange={(e) => setNewCh({ ...newCh, title: e.target.value })} />
                <Input className="col-span-2" type="number" placeholder="Start" value={newCh.start_page} onChange={(e) => setNewCh({ ...newCh, start_page: Number(e.target.value) })} />
                <Input className="col-span-2" type="number" placeholder="End" value={newCh.end_page} onChange={(e) => setNewCh({ ...newCh, end_page: Number(e.target.value) })} />
              </div>
              <Button size="sm" className="mt-2 w-full" onClick={addChapter}><Plus className="w-3.5 h-3.5 mr-1" /> {t("super.addChapter")}</Button>
            </Card>
            {chapters.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("super.noChapters")}</p>
            ) : chapters.map(c => (
              <div key={c.id} className="flex items-center gap-2 p-3 border border-border rounded-lg">
                <span className="font-mono text-xs text-muted-foreground w-8">{c.chapter_number}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">Pages {c.start_page}–{c.end_page}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteChapter(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
