import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Search, Atom, FlaskConical, Microscope, ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const navigate = useNavigate();
  const [books, setBooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [lang, setLang] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [userGrade, setUserGrade] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const user = await getSafeUser();
      if (!user) { navigate("/login"); return; }
      // Try to detect student grade from latest experiment_progress
      const { data: prog } = await supabase
        .from("experiment_progress")
        .select("grade")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prog?.grade) setUserGrade(prog.grade);

      const { data } = await supabase.from("textbooks").select("*").order("grade").order("subject");
      setBooks(data || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const filtered = books.filter(b =>
    (grade === "all" || b.grade === Number(grade)) &&
    (subject === "all" || b.subject === subject) &&
    (lang === "all" || b.language === lang) &&
    (!search || b.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 max-w-7xl mx-auto gap-2">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground min-w-0">
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
            const active = subject === s;
            return (
              <button key={s} onClick={() => setSubject(active ? "all" : s)} className={`text-left ${subjectGradient[s]} rounded-2xl p-5 text-primary-foreground transition-all duration-300 hover:scale-[1.02] ${active ? "ring-4 ring-primary/40" : ""}`}>
                <Icon className="w-7 h-7 mb-3 opacity-90" />
                <h3 className="font-display font-bold text-lg">{t(`subject.${s}`)}</h3>
                <p className="text-sm opacity-80">{count} {t("textbook.books")}</p>
              </button>
            );
          })}
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder={t("textbook.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("textbook.allGrades")}</SelectItem>
              {[9, 10, 11, 12].map(g => <SelectItem key={g} value={String(g)}>{t("common.grade")} {g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-72 bg-card rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-medium">{t("textbook.empty")}</p>
            <p className="text-sm mt-1">{t("textbook.emptyDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((book, i) => {
              const Icon = subjectIcon(book.subject);
              return (
                <motion.div key={book.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link to={`/textbooks/${book.id}`} className="block bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 group h-full">
                    <div className={`${subjectGradient[book.subject] || "bg-gradient-physics"} h-40 flex items-center justify-center relative`}>
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="w-14 h-14 text-primary-foreground opacity-80" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t(`subject.${book.subject}`)} · {t("common.grade")} {book.grade}</p>
                      <h3 className="font-display font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
