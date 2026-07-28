"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Search, Atom, FlaskConical, Microscope, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

interface Textbook {
  id: string;
  title: string;
  subject: string;
  grade: number;
  language: string;
  cover_url: string | null;
  total_pages: number;
  description: string | null;
}

const subjectIcon = (s: string) => s === "physics" ? Atom : s === "chemistry" ? FlaskConical : Microscope;
const subjectGradient: Record<string, string> = {
  physics: "bg-gradient-physics",
  chemistry: "bg-gradient-chemistry",
  biology: "bg-gradient-biology",
};

export default function Textbooks() {
  const { t } = useLanguage();
  const router = useRouter();
  const [books, setBooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [lang, setLang] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/textbooks");
        if (!res.ok) { router.push("/login"); return; }
        const data = await res.json();
        setBooks(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const filtered = books.filter(b =>
    (grade === "all" || b.grade === Number(grade)) &&
    (subject === "all" || b.subject === subject) &&
    (lang === "all" || b.language === lang) &&
    (!search || b.title.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 max-w-7xl mx-auto gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground min-w-0">
            <ArrowLeft className="w-4 h-4 shrink-0" /> <span className="text-sm truncate">{t("nav.backToDashboard")}</span>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 bg-gradient-hero rounded-3xl p-8 md:p-12 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-4 right-4 opacity-20"><BookOpen className="w-32 h-32" /></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">{t("textbook.heroBadge")}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">{t("textbook.heroTitle")}</h1>
            <p className="opacity-90 max-w-2xl">{t("textbook.heroDesc")}</p>
          </div>
        </motion.div>

        {/* Subject quick picker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-3 gap-4 mb-8">
          {(["physics", "chemistry", "biology"] as const).map((s) => {
            const Icon = subjectIcon(s);
            const count = books.filter(b => b.subject === s).length;

            return (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`text-left p-6 rounded-2xl border transition-all ${
                  subject === s ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border bg-card hover:shadow-elevated"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${subjectGradient[s]} text-white flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-lg capitalize">{t(`subject.${s}`)}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {count} {t("textbook.booksCount")}
                </p>
              </button>
            );
          })}
        </motion.div>

        {/* Filter bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("textbook.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder={t("textbook.filterGrade")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("textbook.allGrades")}</SelectItem>
                <SelectItem value="9">Grade 9</SelectItem>
                <SelectItem value="10">Grade 10</SelectItem>
                <SelectItem value="11">Grade 11</SelectItem>
                <SelectItem value="12">Grade 12</SelectItem>
              </SelectContent>
            </Select>

            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder={t("textbook.filterLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("textbook.allLanguages")}</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="am">Amharic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((b) => {
            const Icon = subjectIcon(b.subject);

            return (
              <Link href={`/textbooks/${b.id}`} key={b.id} className="group">
                <motion.div
                  layout
                  className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-elevated transition-all flex flex-col h-full"
                >
                  <div className={`h-40 ${subjectGradient[b.subject]} text-white p-6 relative flex flex-col justify-between overflow-hidden`}>
                    <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                      <Icon className="w-40 h-40" />
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {t("common.grade")} {b.grade}
                      </span>
                      <span className="text-xs uppercase bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {b.language}
                      </span>
                    </div>
                    <div>
                      <Icon className="w-8 h-8 mb-2" />
                      <h3 className="font-display font-bold text-lg leading-tight group-hover:underline line-clamp-2">
                        {b.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {b.description || t("textbook.noDesc")}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                      <span>{b.total_pages} {t("textbook.pages")}</span>
                      <span className="font-medium text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                        {t("textbook.read")} &rarr;
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-muted/25 rounded-2xl border border-dashed border-border mt-6">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg text-muted-foreground">{t("textbook.noBooks")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("textbook.noBooksDesc")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
