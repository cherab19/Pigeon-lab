import { motion } from "framer-motion";
import { Beaker, Atom, Microscope, FlaskConical, BookOpen, Users, BarChart3, Shield, Zap, Globe, GraduationCap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-lab.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const subjects = [
  { name: "Physics", icon: Atom, gradient: "bg-gradient-physics", desc: "Mechanics, optics, electricity & magnetism simulations" },
  { name: "Chemistry", icon: FlaskConical, gradient: "bg-gradient-chemistry", desc: "Chemical reactions, titration, molecular structures" },
  { name: "Biology", icon: Microscope, gradient: "bg-gradient-biology", desc: "Cell biology, genetics, human anatomy explorations" },
];

const features = [
  { icon: Beaker, title: "Interactive Simulations", desc: "Drag-and-drop experiments with real-time results and measurement tools" },
  { icon: BookOpen, title: "Curriculum Aligned", desc: "Mapped to Ethiopian national curriculum for Grades 7–12" },
  { icon: BarChart3, title: "Smart Analytics", desc: "Track student performance, completion rates, and progress trends" },
  { icon: Users, title: "Multi-Tenant SaaS", desc: "Each school gets its own dashboard, branding, and data isolation" },
  { icon: Shield, title: "Safe Experiments", desc: "No harmful chemicals—learn safely in a digital environment" },
  { icon: Zap, title: "Low Bandwidth", desc: "Optimized for school computer labs with offline caching support" },
];

const plan = {
  name: "Standard",
  price: "30 ETB",
  unit: "per student/month",
  features: ["Unlimited experiments", "Unlimited students", "Advanced analytics", "Priority support", "Lab report exports", "Custom school branding"],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Beaker className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">EthioLab</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#subjects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Subjects</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">Log In</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/dashboard">Get Started</Link>
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
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
          >
            <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-8">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Grades 7–12 · Ethiopian Curriculum</span>
            </motion.div>
            <motion.h1 custom={1} variants={fadeUp} className="text-5xl md:text-7xl font-display font-bold leading-[1.1] mb-6">
              <span className="text-foreground">Ethiopia's </span>
              <span className="text-gradient-hero">Virtual Science Laboratory</span>
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Interactive physics, chemistry, and biology experiments aligned with the national curriculum. Safe, scalable, and accessible for every school.
            </motion.p>
            <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/login">
                  Start Experimenting <ChevronRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div custom={4} variants={fadeUp} className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> 500+ Schools</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-secondary" /> 50K+ Students</div>
              <div className="flex items-center gap-2"><Beaker className="w-4 h-4 text-accent" /> 200+ Experiments</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Three Core Subjects</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Comprehensive experiment libraries covering all science streams in the Ethiopian curriculum.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {subjects.map((s, i) => (
              <motion.div
                key={s.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
              >
                <div className={`${s.gradient} p-8 h-64 flex flex-col justify-end text-primary-foreground transition-transform duration-300 group-hover:scale-[1.02]`}>
                  <s.icon className="w-10 h-10 mb-4 opacity-90" />
                  <h3 className="text-2xl font-display font-bold mb-2">{s.name}</h3>
                  <p className="text-sm opacity-80">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Built for Ethiopian Schools</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to bring science experiments to life—safely and at scale.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Simple, School-Friendly Pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Transparent per-student pricing. No hidden fees.</p>
          </motion.div>
          <div className="max-w-md mx-auto">
            <motion.div
              variants={fadeUp}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl p-8 border border-primary shadow-glow-primary bg-card relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-hero text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                One Simple Plan
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.unit}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-3 h-3 text-primary" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="hero" className="w-full" asChild>
                <Link to="/login">Get Started</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Beaker className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">EthioLab</span>
          </div>
          <p className="text-sm text-muted-foreground">Empowering science education across Ethiopia</p>
          <p className="text-xs text-muted-foreground mt-2">© 2026 EthioLab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
