"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "@/lib/pdfWorker";
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, BookOpen, ListTree, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import LabAssistant from "@/components/lab/LabAssistant";
import { toast } from "sonner";

interface Textbook {
  id: string; title: string; subject: string; grade: number;
  file_url: string; total_pages: number; description: string | null;
}
interface Chapter {
  id: string; chapter_number: number; title: string; start_page: number; end_page: number;
}

export default function TextbookReader() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { t } = useLanguage();
  const [book, setBook] = useState<Textbook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.0);
  const [loadingPdf, setLoadingPdf] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/textbooks/${id}`);
        if (!res.ok) {
          toast.error(t("textbook.notFound") || "Textbook not found");
          router.push("/textbooks");
          return;
        }
        const data = await res.json();
        setBook(data.book);
        setChapters(data.chapters || []);
        if (data.progress?.last_page) {
          setPageNum(data.progress.last_page);
        }
      } catch (err) {
        console.error(err);
        toast.error(t("textbook.notFound") || "Textbook not found");
        router.push("/textbooks");
      }
    };
    load();
  }, [id, router, t]);

  // Persist reading progress (debounced)
  useEffect(() => {
    if (!book) return;
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/textbooks/${book.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageNum }),
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [pageNum, book]);

  const onDocLoad = ({ numPages: n }: { numPages: number }) => { setNumPages(n); setLoadingPdf(false); };

  const goToChapter = useCallback((c: Chapter) => setPageNum(c.start_page), []);

  const currentChapter = chapters.find(c => pageNum >= c.start_page && pageNum <= c.end_page);

  if (!book) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" asChild><Link href="/textbooks"><ArrowLeft className="w-4 h-4" /></Link></Button>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-sm truncate">{book.title}</h1>
              <p className="text-xs text-muted-foreground truncate">{currentChapter ? `Ch.${currentChapter.chapter_number} · ${currentChapter.title}` : `${t("textbook.page") || "Page"} ${pageNum}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5"><ListTree className="w-4 h-4" /><span className="hidden sm:inline">{t("textbook.toc") || "TOC"}</span></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader><SheetTitle>{t("textbook.toc") || "Table of Contents"}</SheetTitle></SheetHeader>
                <div className="mt-4 space-y-1">
                  {chapters.length === 0 && <p className="text-sm text-muted-foreground">{t("textbook.noChapters") || "No chapters loaded"}</p>}
                  {chapters.map(c => (
                    <div key={c.id} className={`p-3 rounded-lg border ${currentChapter?.id === c.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"} transition-colors`}>
                      <button onClick={() => goToChapter(c)} className="block text-left w-full">
                        <p className="text-xs text-muted-foreground">{t("textbook.chapter") || "Chapter"} {c.chapter_number} · {t("textbook.page") || "Page"} {c.start_page}</p>
                        <p className="font-medium text-sm">{c.title}</p>
                      </button>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.2))}><ZoomOut className="w-4 h-4" /></Button>
            <span className="text-xs font-mono w-10 text-center">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2.5, s + 0.2))}><ZoomIn className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" asChild><a href={book.file_url} download target="_blank" rel="noreferrer"><Download className="w-4 h-4" /></a></Button>
          </div>
        </div>
      </header>

      {/* PDF view */}
      <main className="flex-1 overflow-auto bg-muted/30 flex justify-center p-4">
        <Document
          file={book.file_url}
          onLoadSuccess={onDocLoad}
          onLoadError={(e) => { console.error("PDF load error", e); toast.error(t("textbook.loadError") || "Error loading PDF"); setLoadingPdf(false); }}
          loading={<div className="flex items-center justify-center h-96"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
        >
          {!loadingPdf && <Page pageNumber={pageNum} scale={scale} renderAnnotationLayer={false} renderTextLayer={false} className="shadow-elevated" />}
        </Document>
      </main>

      {/* Bottom nav */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum <= 1}>
            <ChevronLeft className="w-4 h-4 mr-1" /> {t("textbook.prev") || "Previous"}
          </Button>
          <span className="text-sm font-medium">{pageNum} / {numPages || "?"}</span>
          <Button variant="outline" size="sm" onClick={() => setPageNum(p => Math.min(numPages, p + 1))} disabled={pageNum >= numPages}>
            {t("textbook.next") || "Next"} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </footer>

      {/* SciBot AI assistant — contextual help while reading */}
      <LabAssistant
        mode="textbook"
        context={{
          subject: book.subject,
          grade: String(book.grade),
          experiment: `Textbook: ${book.title}`,
          step: currentChapter
            ? `Chapter ${currentChapter.chapter_number}: ${currentChapter.title}`
            : undefined,
          readings: `Currently reading page ${pageNum} of ${numPages || book.total_pages}`,
        }}
      />
    </div>
  );
}
