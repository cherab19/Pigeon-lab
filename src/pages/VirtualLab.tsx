import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, ArrowLeft, Play, RotateCcw, CheckCircle, AlertCircle, ChevronRight, Thermometer, Eye, FileText, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const steps = [
  { id: 1, title: "Set Up Apparatus", desc: "Connect the resistor, ammeter, and voltmeter in a circuit with a battery.", completed: false },
  { id: 2, title: "Measure Voltage", desc: "Use the voltmeter to measure the potential difference across the resistor.", completed: false },
  { id: 3, title: "Measure Current", desc: "Read the ammeter to find the current flowing through the circuit.", completed: false },
  { id: 4, title: "Record Observations", desc: "Record voltage and current values for 5 different resistor settings.", completed: false },
  { id: 5, title: "Calculate Resistance", desc: "Use R = V/I to calculate resistance for each trial.", completed: false },
];

export default function VirtualLab() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(100);

  const current = (voltage / resistance) * 1000; // mA

  const completeStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-sm font-display font-semibold">Ohm's Law & Circuits</h1>
              <p className="text-xs text-muted-foreground">Physics · Grade 8</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <Progress value={progress} className="w-32 h-2" />
              <span>{Math.round(progress)}%</span>
            </div>
            <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-1" /> Lab Report</Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)]">
        {/* Simulation Area */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1 bg-card rounded-2xl border border-border shadow-card p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Circuit visualization */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="ghost" size="sm"><RotateCcw className="w-4 h-4" /> Reset</Button>
              <Button variant="gold" size="sm"><Play className="w-4 h-4" /> Run</Button>
            </div>

            <motion.div
              className="relative w-full max-w-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Simple circuit diagram */}
              <svg viewBox="0 0 400 300" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Battery */}
                <rect x="170" y="20" width="60" height="30" rx="4" className="fill-secondary/20 stroke-secondary" strokeWidth="2" />
                <text x="200" y="40" textAnchor="middle" className="fill-foreground text-xs font-body" fontSize="12">{voltage}V</text>
                {/* Wires */}
                <path d="M170 35 L50 35 L50 265 L170 265" className="stroke-foreground/40" strokeWidth="2" />
                <path d="M230 35 L350 35 L350 265 L230 265" className="stroke-foreground/40" strokeWidth="2" />
                {/* Resistor */}
                <rect x="170" y="250" width="60" height="30" rx="4" className="fill-accent/10 stroke-accent" strokeWidth="2" />
                <text x="200" y="270" textAnchor="middle" className="fill-foreground text-xs font-body" fontSize="12">{resistance}Ω</text>
                {/* Ammeter */}
                <circle cx="50" cy="150" r="25" className="fill-primary/10 stroke-primary" strokeWidth="2" />
                <text x="50" y="148" textAnchor="middle" className="fill-primary text-xs font-display font-bold" fontSize="10">A</text>
                <text x="50" y="162" textAnchor="middle" className="fill-primary text-xs font-body" fontSize="9">{current.toFixed(1)}mA</text>
                {/* Voltmeter */}
                <circle cx="350" cy="150" r="25" className="fill-secondary/10 stroke-secondary" strokeWidth="2" />
                <text x="350" y="148" textAnchor="middle" className="fill-secondary-foreground text-xs font-display font-bold" fontSize="10">V</text>
                <text x="350" y="162" textAnchor="middle" className="fill-secondary-foreground text-xs font-body" fontSize="9">{voltage}V</text>
                {/* Current flow arrows */}
                <motion.circle cx="110" cy="35" r="3" className="fill-secondary" animate={{ cx: [110, 230] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
              </svg>
            </motion.div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-6 mt-8 w-full max-w-lg">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> Voltage: {voltage}V
                </label>
                <input
                  type="range" min="1" max="12" value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Resistance: {resistance}Ω
                </label>
                <input
                  type="range" min="10" max="500" step="10" value={resistance}
                  onChange={(e) => setResistance(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
            </div>

            {/* Live readings */}
            <div className="flex gap-4 mt-6">
              <div className="bg-muted rounded-lg px-4 py-2 text-center">
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="font-display font-bold text-primary">{current.toFixed(1)} mA</p>
              </div>
              <div className="bg-muted rounded-lg px-4 py-2 text-center">
                <p className="text-xs text-muted-foreground">Voltage</p>
                <p className="font-display font-bold text-secondary">{voltage} V</p>
              </div>
              <div className="bg-muted rounded-lg px-4 py-2 text-center">
                <p className="text-xs text-muted-foreground">Resistance</p>
                <p className="font-display font-bold text-accent">{resistance} Ω</p>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Panel */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-secondary" />
            <h2 className="font-display font-semibold">Guided Steps</h2>
          </div>
          <div className="space-y-3">
            {steps.map((step, i) => {
              const isCompleted = completedSteps.includes(i);
              const isCurrent = i === currentStep;
              return (
                <motion.button
                  key={step.id}
                  onClick={() => setCurrentStep(i)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    isCurrent ? 'border-primary bg-primary/5 shadow-card' :
                    isCompleted ? 'border-border bg-muted/50' :
                    'border-border hover:border-muted-foreground/20'
                  }`}
                  layout
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isCompleted ? 'bg-primary' : isCurrent ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <span className={`text-xs font-bold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{i + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isCompleted ? 'text-muted-foreground line-through' : ''}`}>{step.title}</p>
                      <AnimatePresence>
                        {isCurrent && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-xs text-muted-foreground mt-1"
                          >
                            {step.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
          <Button variant="hero" className="w-full mt-6" onClick={completeStep}>
            {currentStep === steps.length - 1 && completedSteps.includes(currentStep) ? "Submit Lab Report" : "Complete Step"} <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="mt-4 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-secondary-foreground">Hint:</span> Ohm's Law states V = IR. As you increase voltage, current increases proportionally if resistance is constant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
