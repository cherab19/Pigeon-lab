import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Beaker, Atom, Microscope, FlaskConical, BookOpen, Users, BarChart3, Shield, Zap, Globe, GraduationCap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-lab.jpg";
import { supabase } from "@/integrations/supabase/client";
import { labData } from "@/data/labActivities";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import DovelabLogo from "@/components/DovelabLogo";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const subjectKeys = [
  { key: "physics", icon: Atom, gradient: "bg-gradient-physics" },
  { key: "chemistry", icon: FlaskConical, gradient: "bg-gradient-chemistry" },
  { key: "biology", icon: Microscope, gradient: "bg-gradient-biology" },
];

const featureKeys = [
  { icon: Beaker, titleKey: "feature.simulations", descKey: "feature.simulations.desc" },
  { icon: BookOpen, titleKey: "feature.curriculum", descKey: "feature.curriculum.desc" },
  { icon: BarChart3, titleKey: "feature.analytics", descKey: "feature.analytics.desc" },
  { icon: Users, titleKey: "feature.multiTenant", descKey: "feature.multiTenant.desc" },
  { icon: Shield, titleKey: "feature.safe", descKey: "feature.safe.desc" },
  { icon: Zap, titleKey: "feature.lowBandwidth", descKey: "feature.lowBandwidth.desc" },
];

const planFeatureKeys = [
  "plan.unlimited", "plan.unlimitedStudents", "plan.advancedAnalytics",
  "plan.prioritySupport", "plan.labReports", "plan.customBranding",
];

export default function LandingPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ schools: 0, students: 0, experiments: 0 });

  useEffect(() => {
    let expCount = 0;
    Object.values(labData).forEach(grades => {
      Object.values(grades).forEach(labs => {
        expCount += labs.length;
      });
    });

    supabase.rpc("get_public_stats").then(({ data }) => {
      if (data) {
        setStats({
          schools: (data as any).schools || 0,
          students: (data as any).students || 0,
          experiments: expCount,
        });
      } else {
        setStats(prev => ({ ...prev, experiments: expCount }));
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <DovelabLogo size="md" textClassName="text-foreground" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#subjects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.subjects")}</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.features")}</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.pricing")}</a>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/signup">{t("nav.getStarted")}</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" animate="visible">
            <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-8">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">{t("landing.badge")}</span>
            </motion.div>
            <motion.h1 custom={1} variants={fadeUp} className="text-5xl md:text-7xl font-display font-bold leading-[1.1] mb-6">
              <span className="text-foreground">{t("landing.heroTitle1")}</span>
              <span className="text-gradient-hero">{t("landing.heroTitle2")}</span>
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              {t("landing.heroDesc")}
            </motion.p>
            <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/login">
                  {t("landing.cta")} <ChevronRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div custom={4} variants={fadeUp} className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> {stats.schools} {t("common.schools")}</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-secondary" /> {stats.students} {t("common.students")}</div>
              <div className="flex items-center gap-2"><Beaker className="w-4 h-4 text-accent" /> {stats.experiments} {t("common.experiments")}</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">{t("landing.subjectsTitle")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("landing.subjectsDesc")}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {subjectKeys.map((s, i) => (
              <Link key={s.key} to={`/lab/${s.key}`}>
                <motion.div custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="group relative rounded-2xl overflow-hidden cursor-pointer">
                  <div className={`${s.gradient} p-8 h-64 flex flex-col justify-end text-primary-foreground transition-transform duration-300 group-hover:scale-[1.02]`}>
                    <s.icon className="w-10 h-10 mb-4 opacity-90" />
                    <h3 className="text-2xl font-display font-bold mb-2">{t(`subject.${s.key}`)}</h3>
                    <p className="text-sm opacity-80">{t(`subject.${s.key}.desc`)}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">{t("landing.featuresTitle")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("landing.featuresDesc")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featureKeys.map((f, i) => (
              <motion.div key={f.titleKey} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{t(f.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">{t("landing.pricingTitle")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("landing.pricingDesc")}</p>
          </motion.div>
          <div className="max-w-md mx-auto">
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-2xl p-8 border border-primary shadow-glow-primary bg-card relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-hero text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                {t("landing.oneSimplePlan")}
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{t("landing.planName")}</h3>
              <div className="mb-2">
                <span className="text-4xl font-display font-bold">30 ETB</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{t("landing.perStudentMonth")}</p>
              <ul className="space-y-3 mb-8">
                {planFeatureKeys.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-3 h-3 text-primary" />
                    </div>
                    {t(f)}
                  </li>
                ))}
              </ul>
              <Button variant="hero" className="w-full" asChild>
                <Link to="/signup">{t("nav.getStarted")}</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <DovelabLogo size="sm" />
          </div>
          <p className="text-sm text-muted-foreground">{t("landing.footerTagline")}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("landing.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
