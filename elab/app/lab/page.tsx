"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, ArrowLeft, Play, RotateCcw, CheckCircle, AlertCircle, ChevronRight, Thermometer, Eye, FileText, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

export default function VirtualLab() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(100);

  const steps = [
    { id: 1, title: t("vlab.step1") || "Step 1", desc: t("vlab.step1Desc") || "Select voltage" },
    { id: 2, title: t("vlab.step2") || "Step 2", desc: t("vlab.step2Desc") || "Select resistance" },
    { id: 3, title: t("vlab.step3") || "Step 3", desc: t("vlab.step3Desc") || "Observe current changes" },
    { id: 4, title: t("vlab.step4") || "Step 4", desc: t("vlab.step4Desc") || "Verify using V = I * R" },
    { id: 5, title: t("vlab.step5") || "Step 5", desc: t("vlab.step5Desc") || "Done" },
  ];

  const current = (voltage / resistance) * 1000;

  const completeStep = () => {
    if (!completedSteps.includes(currentStep)) setCompletedSteps([...completedSteps, currentStep]);
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-14 px-3 sm:px-6 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="ghost" size="sm" asChild className="px-2 sm:px-3">
              <Link href="/dashboard"><ArrowLeft className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">{t("common.back")}</span></Link>
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="min-w-0">
              <h1 className="text-sm font-display font-semibold truncate">{t("vlab.ohmsLaw") || "Ohm's Law Experiment"}</h1>
              <p className="text-xs text-muted-foreground truncate">{t("vlab.physicsGrade8") || "Grade 8 Physics"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <LanguageToggle />
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <Progress value={progress} className="w-32 h-2" />
              <span>{Math.round(progress)}%</span>
            </div>
            <Button variant="outline" size="sm" className="px-2 sm:px-3"><FileText className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">{t("vlab.labReport") || "Lab Report"}</span></Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)]">
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1 bg-card rounded-2xl border border-border shadow-card p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="ghost" size="sm"><RotateCcw className="w-4 h-4" /> {t("vlab.reset") || "Reset"}</Button>
              <Button variant="gold" size="sm"><Play className="w-4 h-4" /> {t("vlab.run") || "Run"}</Button>
            </div>

            <motion.div className="relative w-full max-w-lg" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <svg viewBox="0 0 400 300" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="170" y="20" width="60" height="30" rx="4" className="fill-secondary/20 stroke-secondary" strokeWidth="2" />
                <text x="200" y="40" textAnchor="middle" className="fill-foreground text-xs font-body" fontSize="12">{voltage}V</text>
                <path d="M170 35 L50 35 L50 265 L170 265" className="stroke-foreground/40" strokeWidth="2" />
                <path d="M230 35 L350 35 L350 265 L230 265" className="stroke-foreground/40" strokeWidth="2" />
                <rect x="170" y="250" width="60" height="30" rx="4" className="fill-accent/10 stroke-accent" strokeWidth="2" />
                <text x="200" y="270" textAnchor="middle" className="fill-foreground text-xs font-body" fontSize="12">{resistance}Ω</text>
                <circle cx="50" cy="150" r="25" className="fill-primary/10 stroke-primary" strokeWidth="2" />
                <text x="50" y="148" textAnchor="middle" className="fill-primary text-xs font-display font-bold" fontSize="10">A</text>
                <text x="50" y="162" textAnchor="middle" className="fill-primary text-xs font-body" fontSize="9">{current.toFixed(1)}mA</text>
                <circle cx="350" cy="150" r="25" className="fill-secondary/10 stroke-secondary" strokeWidth="2" />
                <text x="350" y="148" textAnchor="middle" className="fill-secondary-foreground text-xs font-display font-bold" fontSize="10">V</text>
                <text x="350" y="162" textAnchor="middle" className="fill-secondary-foreground text-xs font-body" fontSize="9">{voltage}V</text>
                <motion.circle cx="110" cy="35" r="3" className="fill-secondary" animate={{ cx: [110, 230] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
              </svg>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-6 mt-8 w-full max-w-lg">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> {t("vlab.voltage") || "Voltage"}: {voltage}V
                </label>
                <input type="range" min="1" max="12" value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {t("vlab.resistance") || "Resistance"}: {resistance}Ω
                </label>
                <input type="range" min="10" max="500" step="10" value={resistance} onChange={(e) => setResistance(Number(e.target.value))} className="w-full accent-accent" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-display font-bold text-foreground mb-1">{t("vlab.instructions") || "Instructions"}</h2>
              <p className="text-sm text-muted-foreground">{t("vlab.instructionsDesc") || "Follow these steps to complete the experiment"}</p>
            </div>

            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={step.id} className={`flex gap-3 p-3 rounded-lg border transition-all ${idx === currentStep ? "border-primary bg-primary/5" : "border-transparent"}`}>
                  <div className="mt-0.5">
                    {completedSteps.includes(idx) ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${idx === currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {step.id}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${idx === currentStep ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>{t("vlab.tip") || "Tip: Observe how current changes with voltage."}</span>
            </div>
            <Button onClick={completeStep} size="sm">{t("common.next") || "Next"} <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
