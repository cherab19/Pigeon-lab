"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Moon, Apple, Activity, Heart, ArrowLeft, Trophy, Flame, Star, Plus, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { useGamification, getBadgeInfo } from "@/hooks/useGamification";
import { getSafeUser } from "@/lib/session-client";
import { toast } from "sonner";

const PILLARS = [
  { key: "study", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
  { key: "sleep", icon: Moon, color: "text-secondary", bg: "bg-secondary/10" },
  { key: "nutrition", icon: Apple, color: "text-accent", bg: "bg-accent/10" },
  { key: "movement", icon: Activity, color: "text-primary", bg: "bg-primary/10" },
  { key: "community", icon: Heart, color: "text-destructive", bg: "bg-destructive/10" },
] as const;

const QUOTES = [
  { text: "የእውቀት ጅምር ጥያቄ ነው።", textEn: "The beginning of knowledge is the question.", author: "Ethiopian Proverb" },
  { text: "Success is no accident. It is hard work, perseverance, learning, and sacrifice.", textEn: "Success is no accident. It is hard work, perseverance, learning, and sacrifice.", author: "Pelé" },
  { text: "An investment in knowledge pays the best interest.", textEn: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "ቀስ በቀስ እንቁላል በእግሩ ይሄዳል።", textEn: "Slowly, slowly, even an egg will walk.", author: "Ethiopian Proverb" },
  { text: "Education is the most powerful weapon which you can use to change the world.", textEn: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
];

interface RoutineSlot { time: string; activity: string; }

export default function SuccessGuide() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { state, awardXP, reload } = useGamification();
  const [reflection, setReflection] = useState({ went_well: "", to_improve: "" });
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [routine, setRoutine] = useState<RoutineSlot[]>([]);
  const [newSlot, setNewSlot] = useState<RoutineSlot>({ time: "", activity: "" });
  const [quoteIdx, setQuoteIdx] = useState(0);

  const getWeekStart = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().slice(0, 10);
  };

  useEffect(() => {
    const init = async () => {
      const user = await getSafeUser();
      if (!user) { router.push("/login"); return; }
      const weekOf = getWeekStart();
      try {
        const res = await fetch(`/api/student/success-guide?weekOf=${weekOf}`);
        if (res.ok) {
          const data = await res.json();
          if (data.reflection) {
            setReflection({ went_well: data.reflection.what_went_well || "", to_improve: data.reflection.what_to_improve || "" });
            setReflectionSaved(true);
          }
          if (data.routine && Array.isArray(data.routine)) {
            setRoutine(data.routine as RoutineSlot[]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [router]);

  useEffect(() => {
    const i = setInterval(() => setQuoteIdx(q => (q + 1) % QUOTES.length), 8000);
    return () => clearInterval(i);
  }, []);

  const saveReflection = async () => {
    const user = await getSafeUser();
    if (!user) return;
    if (!reflection.went_well.trim() && !reflection.to_improve.trim()) { toast.error(t("guide.reflectionEmpty") || "Please write something first"); return; }
    const weekOf = getWeekStart();
    try {
      const res = await fetch("/api/student/success-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reflection",
          weekOf,
          wentWell: reflection.went_well,
          toImprove: reflection.to_improve,
        }),
      });
      if (res.ok) {
        if (!reflectionSaved) await awardXP(20, ["first_reflection"]);
        else await awardXP(5);
        setReflectionSaved(true);
        toast.success("Reflection saved!");
      } else {
        toast.error("Failed to save");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  };

  const addSlot = () => {
    if (!newSlot.time || !newSlot.activity) return;
    setRoutine([...routine, newSlot].sort((a, b) => a.time.localeCompare(b.time)));
    setNewSlot({ time: "", activity: "" });
  };

  const removeSlot = (idx: number) => setRoutine(routine.filter((_, i) => i !== idx));

  const saveRoutine = async () => {
    const user = await getSafeUser();
    if (!user) return;
    if (routine.length === 0) { toast.error(t("guide.routineEmpty") || "Routine is empty"); return; }
    const isFirst = !state || state.badges.indexOf("first_routine") === -1;
    try {
      const res = await fetch("/api/student/success-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "routine",
          schedule: routine,
        }),
      });
      if (res.ok) {
        if (isFirst) await awardXP(15, ["first_routine"]);
        else await awardXP(5);
        toast.success("Routine saved!");
      } else {
        toast.error("Failed to save");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  };

  const xpProgress = state ? ((state.xp % 100) / 100) * 100 : 0;
  const currentQuote = QUOTES[quoteIdx];

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

      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-20">
        {/* HERO */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center relative">
          <div className="absolute inset-0 bg-gradient-hero opacity-10 blur-3xl rounded-full" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-secondary/15 text-secondary-foreground rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5" /> {t("guide.heroBadge")}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4 bg-gradient-hero bg-clip-text text-transparent">
              {t("guide.heroTitle")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("guide.heroDesc")}</p>
          </div>
        </motion.section>

        {/* GAMIFICATION HUD */}
        {state && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5"><div className="flex items-center gap-3"><Star className="w-8 h-8 text-secondary" /><div><p className="text-2xl font-display font-bold">{state.xp}</p><p className="text-xs text-muted-foreground">XP</p></div></div><Progress value={xpProgress} className="mt-3 h-1.5" /><p className="text-[10px] text-muted-foreground mt-1">{state.xp % 100} / 100 to level up</p></Card>
              <Card className="p-5"><div className="flex items-center gap-3"><Flame className="w-8 h-8 text-destructive" /><div><p className="text-2xl font-display font-bold">{state.current_streak}</p><p className="text-xs text-muted-foreground">{t("guide.dayStreak")}</p></div></div></Card>
              <Card className="p-5"><div className="flex items-center gap-3"><Trophy className="w-8 h-8 text-secondary" /><div><p className="text-2xl font-display font-bold">{state.longest_streak}</p><p className="text-xs text-muted-foreground">{t("guide.longestStreak")}</p></div></div></Card>
              <Card className="p-5"><div className="flex items-center gap-3"><div className="text-3xl">🏅</div><div><p className="text-2xl font-display font-bold">{state.badges.length}</p><p className="text-xs text-muted-foreground">{t("guide.badges")}</p></div></div></Card>
            </div>
            {state.badges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {state.badges.map(b => {
                  const info = getBadgeInfo(b);
                  return <span key={b} className="inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1 text-xs" title={info.description}>{info.icon} {info.name}</span>;
                })}
              </div>
            )}
          </motion.section>
        )}

        {/* 5 PILLARS */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-display font-bold mb-2">{t("guide.pillarsTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("guide.pillarsDesc")}</p>
          <Accordion type="single" collapsible className="space-y-3">
            {PILLARS.map((p, i) => (
              <AccordionItem key={p.key} value={p.key} className="border border-border rounded-xl bg-card overflow-hidden px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center`}><p.icon className={`w-6 h-6 ${p.color}`} /></div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">Pillar {i + 1}</p>
                      <p className="font-display font-semibold">{t(`guide.pillar.${p.key}.title`)}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pl-16 pb-4 leading-relaxed">{t(`guide.pillar.${p.key}.body`)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section>

        {/* DAILY ROUTINE BUILDER */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-display font-bold mb-2">{t("guide.routineTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("guide.routineDesc")}</p>
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Input type="time" value={newSlot.time} onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })} className="sm:w-32" />
              <Input placeholder={t("guide.activityPlaceholder")} value={newSlot.activity} onChange={(e) => setNewSlot({ ...newSlot, activity: e.target.value })} />
              <Button onClick={addSlot}><Plus className="w-4 h-4 mr-1" /> {t("guide.addSlot")}</Button>
            </div>
            {routine.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">{t("guide.routineEmptyHint")}</p>
            ) : (
              <div className="space-y-2 mb-4">
                {routine.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="font-mono text-sm font-semibold w-16">{s.time}</span>
                    <span className="flex-1 text-sm">{s.activity}</span>
                    <Button size="icon" variant="ghost" onClick={() => removeSlot(i)} className="h-7 w-7">×</Button>
                  </div>
                ))}
              </div>
            )}
            {routine.length > 0 && <Button onClick={saveRoutine} className="w-full"><Check className="w-4 h-4 mr-1" /> {t("guide.saveRoutine")}</Button>}
          </Card>
        </motion.section>

        {/* WEEKLY REFLECTION */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-display font-bold mb-2">{t("guide.reflectionTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("guide.reflectionDesc")}</p>
          <Card className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("guide.wentWell")}</label>
              <Textarea rows={3} value={reflection.went_well} onChange={(e) => setReflection({ ...reflection, went_well: e.target.value })} placeholder={t("guide.wentWellPh")} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("guide.toImprove")}</label>
              <Textarea rows={3} value={reflection.to_improve} onChange={(e) => setReflection({ ...reflection, to_improve: e.target.value })} placeholder={t("guide.toImprovePh")} />
            </div>
            <Button onClick={saveReflection} className="w-full"><Check className="w-4 h-4 mr-1" /> {reflectionSaved ? t("guide.updateReflection") : t("guide.saveReflection")}</Button>
          </Card>
        </motion.section>

        {/* INSPIRATION WALL */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-display font-bold mb-6">{t("guide.inspirationTitle")}</h2>
          <Card className="p-8 md:p-12 bg-gradient-hero text-primary-foreground relative overflow-hidden">
            <Quote className="absolute top-4 left-4 w-12 h-12 opacity-20" />
            <motion.div key={quoteIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative text-center">
              <p className="text-xl md:text-2xl font-display italic mb-4">"{language === "am" ? currentQuote.text : currentQuote.textEn}"</p>
              <p className="text-sm opacity-80">— {currentQuote.author}</p>
            </motion.div>
            <div className="flex justify-center gap-2 mt-6">
              {QUOTES.map((_, i) => (
                <button key={i} onClick={() => setQuoteIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === quoteIdx ? "bg-primary-foreground w-6" : "bg-primary-foreground/40"}`} />
              ))}
            </div>
          </Card>
        </motion.section>

        {/* CTA */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center pb-10">
          <h2 className="text-2xl font-display font-bold mb-3">{t("guide.ctaTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("guide.ctaDesc")}</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Button asChild><Link href="/lab">{t("guide.ctaLab")}</Link></Button>
            <Button asChild variant="outline"><Link href="/textbooks">{t("guide.ctaLibrary")}</Link></Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
