import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";
import { Button } from "@/components/ui/button";

/* ======================================================================
   LAB 1 — MICROSCOPE SIMULATION (Unit 1)
   ====================================================================== */
export function MicroscopeSimulation() {
  const [objective, setObjective] = useState(4);
  const [coarseFocus, setCoarseFocus] = useState(50);
  const [fineFocus, setFineFocus] = useState(50);
  const [light, setLight] = useState(0);
  const [slideX, setSlideX] = useState(150);
  const [slideY, setSlideY] = useState(150);
  const [step, setStep] = useState(0);

  const magnification = 10 * objective;
  const focusQuality = 100 - Math.abs(coarseFocus - 50) * 1.5 - Math.abs(fineFocus - 50) * 0.5;
  const clarity = Math.max(0, Math.min(100, focusQuality));

  const reset = () => {
    setObjective(4); setCoarseFocus(50); setFineFocus(50);
    setLight(0); setSlideX(150); setSlideY(150); setStep(0);
  };

  // Auto-advance steps based on actions
  useEffect(() => {
    if (step === 0 && light > 0) setStep(1);
  }, [light, step]);
  useEffect(() => {
    if (step === 1 && (slideX !== 150 || slideY !== 150)) setStep(2);
  }, [slideX, slideY, step]);
  useEffect(() => {
    if (step === 2 && objective === 4) setStep(3);
  }, [objective, step]);
  useEffect(() => {
    if (step === 3 && coarseFocus !== 50) setStep(4);
  }, [coarseFocus, step]);
  useEffect(() => {
    if (step === 4 && fineFocus !== 50) setStep(5);
  }, [fineFocus, step]);
  useEffect(() => {
    if (step === 6 && objective >= 10) setStep(7);
  }, [objective, step]);

  const steps = [
    "Turn on the microscope light",
    "Place the slide on the stage",
    "Rotate to lowest magnification (4×)",
    "Adjust the coarse adjustment knob",
    "Use fine adjustment to sharpen image",
    "Move the slide to observe different parts",
    "Rotate to higher magnification (10× or 40×)",
    "Observe the inverted, larger image",
    "Record observations",
  ];

  // Cell pattern shown through microscope (inverted)
  const cellScale = objective / 4;

  return (
    <SimulationLayout
      title="Lab 1: Using a Microscope"
      objective="Learn to properly use a microscope and observe objects"
      theory="A compound microscope uses two lens systems. Total magnification = eyepiece (10×) × objective lens. The image appears inverted. Focusing starts with coarse knob at low power, then fine knob for sharpness."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Objective Lens</p>
            {[4, 10, 40].map(o => (
              <label key={o} className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="radio" checked={objective === o} onChange={() => setObjective(o)} className="accent-primary" />
                {o}× {o === 4 ? "(Low)" : o === 10 ? "(Medium)" : "(High)"}
              </label>
            ))}
          </div>
          <ControlGroup label="Coarse Focus" value={coarseFocus} onChange={setCoarseFocus} min={0} max={100} />
          <ControlGroup label="Fine Focus" value={fineFocus} onChange={setFineFocus} min={0} max={100} />
          <ControlGroup label="Light Intensity" value={light} onChange={v => { setLight(v); }} min={0} max={100} unit="%" />
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground font-medium mb-1">Slide Position</p>
            <ControlGroup label="X" value={slideX} onChange={setSlideX} min={80} max={220} />
            <ControlGroup label="Y" value={slideY} onChange={setSlideY} min={80} max={220} />
          </div>
        </div>
      }
      workspace={
        <div className="relative">
          <svg viewBox="0 0 300 300" className="w-full h-64">
            {/* Microscope field of view */}
            <defs>
              <clipPath id="fov"><circle cx={150} cy={150} r={120} /></clipPath>
              <radialGradient id="vignette">
                <stop offset="70%" stopColor="transparent" />
                <stop offset="100%" stopColor="black" stopOpacity={0.4} />
              </radialGradient>
            </defs>
            {/* Background - dark when light is off */}
            <circle cx={150} cy={150} r={130} fill={`rgba(${light * 2.55},${light * 2.55},${light * 2.4},1)`} stroke="hsl(var(--border))" strokeWidth={4} />
            {/* Specimen (shown inverted - flipped) */}
            <g clipPath="url(#fov)" opacity={clarity / 100} transform={`translate(${150},${150}) scale(${-cellScale},${-cellScale}) translate(${-slideX},${-slideY})`}>
              {/* Letter "e" specimen */}
              <text x={150} y={165} textAnchor="middle" fontSize={40} fill="#333" fontFamily="serif">e</text>
              {/* Cell structures visible at higher magnification */}
              {objective >= 10 && (
                <g>
                  {[0,1,2,3,4,5].map(i => (
                    <g key={i}>
                      <rect x={100 + (i % 3) * 35} y={100 + Math.floor(i / 3) * 40} width={30} height={35} fill="none" stroke="#22c55e" strokeWidth={1.5 / cellScale} rx={2} />
                      <circle cx={115 + (i % 3) * 35} cy={115 + Math.floor(i / 3) * 40} r={6} fill="#22c55e33" stroke="#16a34a" strokeWidth={0.5 / cellScale} />
                    </g>
                  ))}
                </g>
              )}
              {objective >= 40 && (
                <g>
                  {[0,1,2,3,4,5].map(i => (
                    <g key={`d-${i}`}>
                      <circle cx={115 + (i % 3) * 35} cy={115 + Math.floor(i / 3) * 40} r={3} fill="#15803d" />
                      <text x={115 + (i % 3) * 35} y={128 + Math.floor(i / 3) * 40} textAnchor="middle" fontSize={3} fill="#333">nucleus</text>
                    </g>
                  ))}
                </g>
              )}
            </g>
            {/* Vignette overlay */}
            <circle cx={150} cy={150} r={120} fill="url(#vignette)" />
            {/* Outer ring */}
            <circle cx={150} cy={150} r={130} fill="none" stroke="hsl(var(--border))" strokeWidth={12} />
          </svg>
          <div className="text-center mt-1">
            <span className="text-xs font-mono font-bold text-primary">{magnification}× Magnification</span>
            {objective >= 10 && <span className="text-xs text-muted-foreground ml-2">(Image is inverted)</span>}
          </div>
        </div>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Magnification" value={`${magnification}×`} />
          <DataRow label="Clarity" value={`${Math.round(clarity)}%`} />
          <DataRow label="Light" value={light > 0 ? "ON" : "OFF"} />
          <DataRow label="Objective" value={`${objective}×`} />
          <DataRow label="Image" value={objective >= 10 ? "Inverted" : "—"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ======================================================================
   LAB 2 — SEED GERMINATION (Unit 1)
   ====================================================================== */
export function SeedGerminationLab() {
  const [day, setDay] = useState(0);
  const [containers, setContainers] = useState([
    { label: "A — Warm + Water", temp: "warm", water: true },
    { label: "B — Cold + Water", temp: "cold", water: true },
    { label: "C — Warm + No Water", temp: "warm", water: false },
  ]);
  const [step, setStep] = useState(0);

  const getGrowth = (temp: string, water: boolean, d: number) => {
    if (!water) return 0;
    if (temp === "cold") return Math.max(0, (d - 3) * 1.5);
    return Math.min(d * 4, 30); // warm + water
  };

  const reset = () => { setDay(0); setStep(0); };

  const steps = [
    "Place cotton in three containers",
    "Add bean seeds to each container",
    "Moisten cotton with water (A & B only)",
    "Place A in warm place, B in cold, C dry",
    "Observe seeds daily for several days",
    "Measure sprout length",
    "Record results in table",
    "Compare germination conditions",
  ];

  return (
    <SimulationLayout
      title="Lab 2: Seed Germination"
      objective="Investigate factors affecting seed germination"
      theory="Seeds need water, warmth, and air to germinate. The embryo breaks through the seed coat when optimal conditions are met."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Day" value={day} onChange={d => { setDay(d); if (d > 0 && step < 4) setStep(4); }} min={0} max={10} unit="" />
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setDay(Math.min(day + 1, 10))}>▶ Next Day</Button>
          <div className="border-t border-border pt-2">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Containers</p>
            {containers.map((c, i) => (
              <div key={i} className="text-xs py-1 border-b border-border/50">
                <span className="font-medium">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 450 220" className="w-full h-52">
          {containers.map((c, i) => {
            const x = 30 + i * 150;
            const growth = getGrowth(c.temp, c.water, day);
            return (
              <g key={i}>
                {/* Container */}
                <rect x={x} y={80} width={120} height={100} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={2} rx={6} />
                {/* Cotton */}
                <rect x={x + 10} y={140} width={100} height={30} fill={c.water ? "#d4e7d4" : "#e5e5e5"} rx={4} />
                {/* Seed */}
                <ellipse cx={x + 60} cy={145} rx={8} ry={5} fill="#8B4513" />
                {/* Sprout */}
                {growth > 0 && (
                  <g>
                    <line x1={x + 60} y1={145} x2={x + 60} y2={145 - growth * 2} stroke="#22c55e" strokeWidth={2} />
                    {growth > 5 && <>
                      <ellipse cx={x + 55} cy={145 - growth * 2 + 5} rx={6} ry={3} fill="#22c55e" transform={`rotate(-30 ${x + 55} ${145 - growth * 2 + 5})`} />
                      <ellipse cx={x + 65} cy={145 - growth * 2 + 5} rx={6} ry={3} fill="#22c55e" transform={`rotate(30 ${x + 65} ${145 - growth * 2 + 5})`} />
                    </>}
                  </g>
                )}
                {/* Label */}
                <text x={x + 60} y={200} textAnchor="middle" className="text-[9px] fill-foreground font-bold">{c.label}</text>
                {/* Temp icon */}
                <text x={x + 60} y={75} textAnchor="middle" className="text-[14px]">{c.temp === "cold" ? "❄️" : "☀️"}</text>
                {/* Water indicator */}
                {!c.water && <text x={x + 60} y={135} textAnchor="middle" className="text-[8px] fill-destructive">No water</text>}
                {/* Growth measurement */}
                <text x={x + 60} y={215} textAnchor="middle" className="text-[8px] fill-muted-foreground">{growth.toFixed(1)} mm</text>
              </g>
            );
          })}
          <text x={225} y={20} textAnchor="middle" className="text-[11px] fill-foreground font-bold">Day {day} of 10</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Day" value={day} />
          {containers.map((c, i) => (
            <DataRow key={i} label={`${String.fromCharCode(65 + i)} Growth`} value={`${getGrowth(c.temp, c.water, day).toFixed(1)} mm`} />
          ))}
          <DataRow label="Best Condition" value={day > 0 ? "Warm + Water" : "—"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ======================================================================
   LAB 3 — DICHOTOMOUS KEY (Unit 2)
   ====================================================================== */
interface KeyNode {
  question: string;
  yes: string | KeyNode;
  no: string | KeyNode;
}

const dichotomousTree: KeyNode = {
  question: "Does the organism have a backbone?",
  yes: {
    question: "Does it have feathers?",
    yes: "Bird (Aves) 🐦",
    no: {
      question: "Does it have fur or hair?",
      yes: "Mammal 🦁",
      no: "Reptile / Fish 🐊",
    },
  },
  no: {
    question: "Does it have legs?",
    yes: {
      question: "Does it have more than 6 legs?",
      yes: "Arachnid 🕷️",
      no: "Insect 🦗",
    },
    no: "Worm / Mollusk 🐛",
  },
};

export function DichotomousKeyLab() {
  const [path, setPath] = useState<("yes" | "no")[]>([]);
  const [step, setStep] = useState(0);

  const getCurrentNode = (): KeyNode | string => {
    let node: KeyNode | string = dichotomousTree;
    for (const choice of path) {
      if (typeof node === "string") return node;
      node = node[choice];
    }
    return node;
  };

  const current = getCurrentNode();
  const isResult = typeof current === "string";

  const reset = () => { setPath([]); setStep(0); };

  const choose = (choice: "yes" | "no") => {
    setPath([...path, choice]);
    setStep(Math.min(step + 1, 6));
  };

  const steps = [
    "Observe the organism carefully",
    "Read the first pair of statements",
    "Choose the best description",
    "Follow the direction given",
    "Continue selecting until identified",
    "Write the organism name",
    "Repeat for other organisms",
  ];

  return (
    <SimulationLayout
      title="Lab 3: Using a Dichotomous Key"
      objective="Identify organisms using a dichotomous key"
      theory="A dichotomous key uses pairs of contrasting characteristics to narrow down identification step by step."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Path History</p>
          {path.length === 0 && <p className="text-xs text-muted-foreground italic">No choices yet</p>}
          {path.map((p, i) => (
            <div key={i} className="text-xs py-1 px-2 rounded bg-muted">
              Step {i + 1}: {p.toUpperCase()}
            </div>
          ))}
          {path.length > 0 && (
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setPath(path.slice(0, -1))}>← Go Back</Button>
          )}
        </div>
      }
      workspace={
        <div className="w-full max-w-md mx-auto space-y-6 py-4">
          {/* Branching tree visualization */}
          <svg viewBox="0 0 400 60" className="w-full h-12">
            {path.map((choice, i) => {
              const x = 40 + i * 80;
              return (
                <g key={i}>
                  <circle cx={x} cy={30} r={12} fill="hsl(var(--primary))" />
                  <text x={x} y={34} textAnchor="middle" className="text-[8px] fill-primary-foreground font-bold">{choice === "yes" ? "Y" : "N"}</text>
                  {i < path.length - 1 && <line x1={x + 12} y1={30} x2={x + 68} y2={30} stroke="hsl(var(--primary))" strokeWidth={2} />}
                </g>
              );
            })}
            {!isResult && (
              <circle cx={40 + path.length * 80} cy={30} r={12} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="4" />
            )}
            {isResult && (
              <g>
                <rect x={40 + path.length * 80 - 30} y={15} width={80} height={30} fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth={1.5} rx={6} />
                <text x={40 + path.length * 80 + 10} y={34} textAnchor="middle" className="text-[7px] fill-primary font-bold">✓ Found</text>
              </g>
            )}
          </svg>

          {/* Question or Result */}
          <div className="text-center">
            {isResult ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6 rounded-xl bg-primary/10 border-2 border-primary">
                <p className="text-xs text-muted-foreground mb-1">Identified as:</p>
                <p className="text-2xl font-bold text-primary">{current}</p>
              </motion.div>
            ) : (
              <motion.div key={path.length} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <p className="text-sm font-semibold">{current.question}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => choose("yes")} className="min-w-[100px]">Yes</Button>
                  <Button onClick={() => choose("no")} variant="outline" className="min-w-[100px]">No</Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Choices Made" value={path.length} />
          <DataRow label="Status" value={isResult ? "Identified!" : "In Progress"} />
          {isResult && <DataRow label="Result" value={String(current)} />}
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ======================================================================
   LAB 4 — ONION CELL OBSERVATION (Unit 3)
   ====================================================================== */
export function OnionCellObservation() {
  const [slide, setSlide] = useState<"onion" | "cheek" | "bacteria">("onion");
  const [zoom, setZoom] = useState(4);
  const [focus, setFocus] = useState(50);
  const [step, setStep] = useState(0);
  const [labels, setLabels] = useState<Record<string, boolean>>({
    "Cell Wall": false, "Nucleus": false, "Cytoplasm": false, "Vacuole": false, "Cell Membrane": false,
  });

  const clarity = 100 - Math.abs(focus - 50) * 2;
  const reset = () => { setSlide("onion"); setZoom(4); setFocus(50); setStep(0); setLabels(Object.fromEntries(Object.keys(labels).map(k => [k, false]))); };

  const toggleLabel = (label: string) => {
    setLabels({ ...labels, [label]: !labels[label] });
    if (step < 8) setStep(8);
  };

  const steps = [
    "Peel a thin layer of onion epidermis",
    "Place the peel on a glass slide",
    "Add one drop of water",
    "Place a cover slip on top",
    "Put slide on microscope stage",
    "Observe at low magnification",
    "Adjust focus with coarse and fine knobs",
    "Observe cell wall, cytoplasm, nucleus",
    "Draw and label cell parts",
  ];

  const slideColors: Record<string, { cell: string; nucleus: string; bg: string }> = {
    onion: { cell: "#22c55e", nucleus: "#15803d", bg: "#f0fdf4" },
    cheek: { cell: "#f97316", nucleus: "#ea580c", bg: "#fff7ed" },
    bacteria: { cell: "#8b5cf6", nucleus: "#6d28d9", bg: "#faf5ff" },
  };
  const colors = slideColors[slide];

  return (
    <SimulationLayout
      title="Lab 4: Observing Onion Cells"
      objective="Observe plant cells under a microscope and label parts"
      theory="Plant cells have cell walls, cell membrane, cytoplasm, nucleus, and large vacuole. Onion epidermal cells are ideal for viewing."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Slide Selection</p>
            {(["onion", "cheek", "bacteria"] as const).map(s => (
              <label key={s} className="flex items-center gap-2 text-xs cursor-pointer capitalize">
                <input type="radio" checked={slide === s} onChange={() => setSlide(s)} className="accent-primary" />
                {s === "onion" ? "Onion Epidermis" : s === "cheek" ? "Cheek Cells" : "Bacteria"}
              </label>
            ))}
          </div>
          <ControlGroup label="Magnification" value={zoom} onChange={setZoom} min={4} max={40} step={1} unit="×" />
          <ControlGroup label="Focus" value={focus} onChange={setFocus} min={0} max={100} />
          <div className="border-t border-border pt-2">
            <p className="text-xs text-muted-foreground font-medium mb-1">Drag Labels</p>
            {Object.entries(labels).map(([label, placed]) => (
              <button key={label} onClick={() => toggleLabel(label)} className={`block w-full text-left text-xs py-1.5 px-2 mb-1 rounded border transition-all ${placed ? "bg-primary/10 border-primary text-primary" : "border-border hover:border-primary"}`}>
                {placed ? "✓ " : "○ "}{label}
              </button>
            ))}
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 350 300" className="w-full h-64">
          <defs>
            <clipPath id="cellFov"><circle cx={175} cy={150} r={120} /></clipPath>
          </defs>
          <circle cx={175} cy={150} r={130} fill={colors.bg} stroke="hsl(var(--border))" strokeWidth={4} />
          <g clipPath="url(#cellFov)" opacity={clarity / 100}>
            {/* Grid of cells */}
            {Array.from({ length: 9 }).map((_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const cx = 110 + col * 50;
              const cy = 85 + row * 50;
              const scale = zoom / 10;
              return (
                <g key={i} transform={`translate(${cx},${cy}) scale(${Math.max(0.6, scale)})`}>
                  {/* Cell wall (plant only) */}
                  {slide === "onion" && <rect x={-20} y={-22} width={40} height={44} fill="none" stroke={colors.cell} strokeWidth={2} rx={3} />}
                  {slide !== "onion" && <ellipse cx={0} cy={0} rx={18} ry={20} fill="none" stroke={colors.cell} strokeWidth={1.5} />}
                  {/* Cytoplasm */}
                  {zoom >= 10 && <ellipse cx={0} cy={0} rx={14} ry={16} fill={`${colors.cell}22`} />}
                  {/* Nucleus */}
                  {zoom >= 10 && <circle cx={-3} cy={-4} r={6} fill={`${colors.nucleus}44`} stroke={colors.nucleus} strokeWidth={0.8} />}
                  {/* Vacuole */}
                  {zoom >= 20 && slide === "onion" && <ellipse cx={5} cy={5} rx={8} ry={10} fill={`${colors.cell}11`} stroke={colors.cell} strokeWidth={0.5} strokeDasharray="2" />}
                  {/* Labels */}
                  {labels["Cell Wall"] && zoom >= 10 && i === 0 && <text x={25} y={-18} className="text-[5px] fill-primary font-bold">Cell Wall →</text>}
                  {labels["Nucleus"] && zoom >= 10 && i === 4 && <text x={8} y={-8} className="text-[5px] fill-primary font-bold">← Nucleus</text>}
                  {labels["Cytoplasm"] && zoom >= 10 && i === 2 && <text x={-15} y={18} className="text-[5px] fill-primary font-bold">Cytoplasm</text>}
                  {labels["Vacuole"] && zoom >= 20 && i === 4 && <text x={10} y={15} className="text-[5px] fill-primary font-bold">Vacuole →</text>}
                </g>
              );
            })}
          </g>
          <circle cx={175} cy={150} r={130} fill="none" stroke="hsl(var(--border))" strokeWidth={10} />
          <text x={175} y={290} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{zoom * 10}× — {slide === "onion" ? "Onion Epidermis" : slide === "cheek" ? "Cheek Cells" : "Bacteria"}</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Slide" value={slide} />
          <DataRow label="Magnification" value={`${zoom * 10}×`} />
          <DataRow label="Clarity" value={`${Math.round(clarity)}%`} />
          <DataRow label="Labels Placed" value={`${Object.values(labels).filter(Boolean).length}/5`} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ======================================================================
   LAB 5 — OSMOSIS EXPERIMENT (Unit 3)
   ====================================================================== */
export function OsmosisExperiment() {
  const [minutes, setMinutes] = useState(0);
  const [step, setStep] = useState(0);

  // Strip A in water gains length, Strip B in salt loses length
  const stripA = 5 + Math.min(minutes / 60, 1) * 1.2; // cm, grows
  const stripB = 5 - Math.min(minutes / 60, 1) * 0.8; // cm, shrinks
  const stripAWidth = 20 + (stripA - 5) * 15;
  const stripBWidth = 20 - (5 - stripB) * 15;

  const reset = () => { setMinutes(0); setStep(0); };

  const steps = [
    "Cut two equal potato strips",
    "Measure their initial length (5 cm each)",
    "Place Strip A in pure water",
    "Place Strip B in salt solution",
    "Leave for 30–60 minutes",
    "Remove the strips",
    "Measure length again",
    "Explain results using osmosis concept",
  ];

  return (
    <SimulationLayout
      title="Lab 5: Osmosis Experiment"
      objective="Demonstrate osmosis using potato strips"
      theory="Osmosis: water moves from dilute (hypotonic) to concentrated (hypertonic) solution through a semi-permeable membrane. Potato in water swells; in salt solution it shrinks."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Time Elapsed" value={minutes} onChange={m => { setMinutes(m); if (m > 0 && step < 4) setStep(4); }} min={0} max={60} unit="min" />
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setMinutes(Math.min(minutes + 10, 60))}>▶ +10 min</Button>
          <div className="border-t border-border pt-2 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Solution Type</p>
            <div className="text-xs py-1">A: Pure Water (Hypotonic)</div>
            <div className="text-xs py-1">B: Salt Solution (Hypertonic)</div>
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          {/* Container A */}
          <rect x={30} y={50} width={150} height={140} fill="#dbeafe" stroke="#3b82f6" strokeWidth={2} rx={6} />
          <text x={105} y={40} textAnchor="middle" className="text-[10px] fill-foreground font-bold">A: Pure Water</text>
          {/* Water molecules */}
          {[0,1,2,3,4].map(i => (
            <motion.circle key={`wa-${i}`} cx={50 + i * 25} cy={160} r={3} fill="#3b82f680"
              animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }} />
          ))}
          {/* Potato strip A */}
          <motion.rect x={80} y={90} width={stripAWidth} height={80} fill="#eab308" stroke="#a16207" strokeWidth={1.5} rx={4}
            animate={{ width: stripAWidth }} transition={{ duration: 0.5 }} />
          <text x={105} y={135} textAnchor="middle" className="text-[8px] fill-foreground font-bold">{stripA.toFixed(1)} cm</text>
          {/* Arrows showing water entering */}
          {minutes > 0 && <>
            <motion.text x={65} y={115} className="text-[12px]" animate={{ x: [60, 75] }} transition={{ duration: 1, repeat: Infinity }}>→</motion.text>
            <motion.text x={65} y={145} className="text-[12px]" animate={{ x: [60, 75] }} transition={{ duration: 1, delay: 0.5, repeat: Infinity }}>→</motion.text>
          </>}

          {/* Container B */}
          <rect x={220} y={50} width={150} height={140} fill="#fef3c7" stroke="#f59e0b" strokeWidth={2} rx={6} />
          <text x={295} y={40} textAnchor="middle" className="text-[10px] fill-foreground font-bold">B: Salt Solution</text>
          {/* Salt particles */}
          {[0,1,2,3].map(i => (
            <circle key={`s-${i}`} cx={240 + i * 30} cy={170} r={2.5} fill="#f59e0b" />
          ))}
          {/* Potato strip B */}
          <motion.rect x={270} y={90} width={Math.max(10, stripBWidth)} height={80} fill="#eab308" stroke="#a16207" strokeWidth={1.5} rx={4}
            animate={{ width: Math.max(10, stripBWidth) }} transition={{ duration: 0.5 }} />
          <text x={295} y={135} textAnchor="middle" className="text-[8px] fill-foreground font-bold">{stripB.toFixed(1)} cm</text>
          {/* Arrows showing water leaving */}
          {minutes > 0 && <>
            <motion.text x={305} y={115} className="text-[12px]" animate={{ x: [300, 315] }} transition={{ duration: 1, repeat: Infinity }}>→</motion.text>
            <motion.text x={305} y={145} className="text-[12px]" animate={{ x: [300, 315] }} transition={{ duration: 1, delay: 0.5, repeat: Infinity }}>→</motion.text>
          </>}

          <text x={200} y={220} textAnchor="middle" className="text-[9px] fill-muted-foreground">{minutes > 0 ? "Water moves from low → high solute concentration" : "Adjust time to observe osmosis"}</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Time" value={`${minutes} min`} />
          <DataRow label="Strip A" value={`${stripA.toFixed(1)} cm`} />
          <DataRow label="Strip B" value={`${stripB.toFixed(1)} cm`} />
          <DataRow label="A Change" value={`+${(stripA - 5).toFixed(1)} cm`} />
          <DataRow label="B Change" value={`${(stripB - 5).toFixed(1)} cm`} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ======================================================================
   LAB 6 — STARCH TEST / IODINE (Unit 5)
   ====================================================================== */
export function StarchTestLab() {
  const [food, setFood] = useState<"bread" | "potato" | "rice" | "oil">("bread");
  const [dropsAdded, setDropsAdded] = useState(0);
  const [step, setStep] = useState(0);

  const hasStarch: Record<string, boolean> = { bread: true, potato: true, rice: true, oil: false };
  const resultColor = hasStarch[food] && dropsAdded >= 2 ? "#1e2d5f" : "#b8860b"; // blue-black vs brown

  const reset = () => { setFood("bread"); setDropsAdded(0); setStep(0); };

  const addDrop = () => {
    setDropsAdded(Math.min(dropsAdded + 1, 3));
    if (step < 2) setStep(2);
  };

  const steps = [
    "Place the food sample on a plate",
    "Select food to test",
    "Add 2–3 drops of iodine solution",
    "Observe the color change",
    "If blue-black → starch is present",
    "Record the result",
  ];

  return (
    <SimulationLayout
      title="Lab 6: Testing for Starch (Iodine Test)"
      objective="Test the presence of starch in food samples"
      theory="Iodine solution turns blue-black in presence of starch. Iodine molecules fit inside the coiled amylose structure."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Food Sample</p>
            {(["bread", "potato", "rice", "oil"] as const).map(f => (
              <label key={f} className="flex items-center gap-2 text-xs cursor-pointer capitalize">
                <input type="radio" checked={food === f} onChange={() => { setFood(f); setDropsAdded(0); setStep(1); }} className="accent-primary" />
                {f}
              </label>
            ))}
          </div>
          <div className="border-t border-border pt-2">
            <p className="text-xs text-muted-foreground font-medium mb-2">Iodine Solution</p>
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={addDrop} disabled={dropsAdded >= 3}>
              💧 Add Drop ({dropsAdded}/3)
            </Button>
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          {/* Plate */}
          <ellipse cx={150} cy={130} rx={100} ry={80} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Food sample */}
          <ellipse cx={150} cy={120} rx={30} ry={20} fill={food === "oil" ? "#fef08a" : "#d4a574"} stroke="#a16207" strokeWidth={1} />
          <text x={150} y={125} textAnchor="middle" className="text-[8px] fill-foreground font-bold capitalize">{food}</text>
          {/* Iodine drops */}
          {Array.from({ length: dropsAdded }).map((_, i) => (
            <motion.circle key={i} cx={140 + i * 10} cy={115} r={5} fill={resultColor} opacity={0.8}
              initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 0.8 }} transition={{ duration: 0.5 }} />
          ))}
          {/* Dropper */}
          <rect x={200} y={30} width={12} height={50} fill="#f59e0b" rx={2} />
          <circle cx={206} cy={85} r={4} fill="#b8860b" />
          <text x={206} y={25} textAnchor="middle" className="text-[7px] fill-foreground">Iodine</text>
          {/* Result */}
          {dropsAdded >= 2 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <text x={150} y={200} textAnchor="middle" className="text-[11px] fill-foreground font-bold">
                {hasStarch[food] ? "✅ Blue-black → Starch PRESENT" : "❌ Brown → No Starch"}
              </text>
            </motion.g>
          )}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Food" value={food} />
          <DataRow label="Drops Added" value={dropsAdded} />
          <DataRow label="Color" value={dropsAdded >= 2 ? (hasStarch[food] ? "Blue-black" : "Brown") : "—"} />
          <DataRow label="Result" value={dropsAdded >= 2 ? (hasStarch[food] ? "Positive" : "Negative") : "Pending"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ======================================================================
   LAB 7 — PROTEIN TEST / BIURET (Unit 5)
   ====================================================================== */
export function ProteinTestLab() {
  const [food, setFood] = useState<"milk" | "egg" | "bread" | "water">("milk");
  const [reagentAdded, setReagentAdded] = useState(false);
  const [shaken, setShaken] = useState(false);
  const [step, setStep] = useState(0);

  const hasProtein: Record<string, boolean> = { milk: true, egg: true, bread: false, water: false };
  const getColor = () => {
    if (!reagentAdded) return "#93c5fd"; // biuret blue
    if (!shaken) return "#93c5fd";
    return hasProtein[food] ? "#7c3aed" : "#93c5fd"; // purple or stays blue
  };

  const reset = () => { setFood("milk"); setReagentAdded(false); setShaken(false); setStep(0); };

  const steps = [
    "Put food sample solution in test tube",
    "Add Biuret reagent",
    "Shake gently",
    "Observe color change",
    "Purple color indicates protein",
  ];

  return (
    <SimulationLayout
      title="Lab 7: Testing for Protein (Biuret Test)"
      objective="Test the presence of protein in food samples"
      theory="Biuret reagent (Cu²⁺ ions) turns purple/violet when peptide bonds in proteins form a complex with the copper ions."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Food Sample</p>
            {(["milk", "egg", "bread", "water"] as const).map(f => (
              <label key={f} className="flex items-center gap-2 text-xs cursor-pointer capitalize">
                <input type="radio" checked={food === f} onChange={() => { setFood(f); setReagentAdded(false); setShaken(false); setStep(0); }} className="accent-primary" />
                {f}
              </label>
            ))}
          </div>
          <div className="border-t border-border pt-2 space-y-2">
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setReagentAdded(true); setStep(1); }} disabled={reagentAdded}>
              🧪 Add Biuret Reagent
            </Button>
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setShaken(true); setStep(3); }} disabled={!reagentAdded || shaken}>
              🫧 Shake Gently
            </Button>
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 260" className="w-full h-56">
          {/* Test tube */}
          <rect x={120} y={30} width={60} height={160} fill="hsl(var(--muted) / 0.2)" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <rect x={115} y={25} width={70} height={15} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={1.5} rx={3} />
          {/* Solution */}
          <motion.rect x={125} y={80} width={50} height={105} fill={getColor()} rx={3} opacity={0.7}
            animate={shaken ? { y: [80, 75, 80] } : {}} transition={{ duration: 0.3, repeat: shaken ? 3 : 0 }} />
          {/* Food sample label */}
          <text x={150} y={135} textAnchor="middle" className="text-[8px] fill-foreground font-bold capitalize">{food}</text>
          {/* Biuret bottle */}
          {!reagentAdded && (
            <g>
              <rect x={220} y={60} width={30} height={60} fill="#93c5fd" stroke="#3b82f6" strokeWidth={1.5} rx={4} />
              <text x={235} y={95} textAnchor="middle" className="text-[6px] fill-foreground">Biuret</text>
            </g>
          )}
          {/* Result */}
          {shaken && (
            <motion.text x={150} y={220} textAnchor="middle" className="text-[11px] fill-foreground font-bold"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {hasProtein[food] ? "✅ Purple → Protein PRESENT" : "❌ Blue → No Protein"}
            </motion.text>
          )}
          {!shaken && reagentAdded && (
            <text x={150} y={220} textAnchor="middle" className="text-[9px] fill-muted-foreground">Shake the test tube to observe result</text>
          )}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Food" value={food} />
          <DataRow label="Reagent" value={reagentAdded ? "Added" : "Not added"} />
          <DataRow label="Color" value={shaken ? (hasProtein[food] ? "Purple" : "Blue") : "—"} />
          <DataRow label="Result" value={shaken ? (hasProtein[food] ? "Positive" : "Negative") : "Pending"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ======================================================================
   LAB 8 — FOOD CHAIN BUILDER (Unit 6)
   ====================================================================== */
const organisms = [
  { id: "plant", name: "Grass", emoji: "🌿", level: "Producer" },
  { id: "grasshopper", name: "Grasshopper", emoji: "🦗", level: "Primary Consumer" },
  { id: "frog", name: "Frog", emoji: "🐸", level: "Secondary Consumer" },
  { id: "snake", name: "Snake", emoji: "🐍", level: "Tertiary Consumer" },
  { id: "hawk", name: "Hawk", emoji: "🦅", level: "Apex Predator" },
];

export function FoodChainBuilder() {
  const [chain, setChain] = useState<string[]>([]);
  const [removedId, setRemovedId] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const correctOrder = ["plant", "grasshopper", "frog", "snake", "hawk"];
  const isCorrect = chain.length === 5 && chain.every((id, i) => id === correctOrder[i]);

  const addToChain = (id: string) => {
    if (chain.includes(id)) return;
    setChain([...chain, id]);
    if (step < 3) setStep(3);
  };

  const removeFromChain = (index: number) => {
    setChain(chain.filter((_, i) => i !== index));
  };

  const simulateRemoval = (id: string) => {
    setRemovedId(removedId === id ? null : id);
    if (step < 6) setStep(6);
  };

  const reset = () => { setChain([]); setRemovedId(null); setStep(0); };

  const steps = [
    "Observe the organisms provided",
    "Identify the producer",
    "Arrange organisms (who eats whom)",
    "Form a food chain",
    "Draw arrows showing energy flow",
    "Label each trophic level",
    "Discuss removing one organism",
  ];

  return (
    <SimulationLayout
      title="Lab 8: Constructing a Food Chain"
      objective="Understand feeding relationships in ecosystems"
      theory="A food chain shows energy flow from producers → consumers. Arrows point in the direction of energy transfer. Removing a link affects the entire chain."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Organism Cards</p>
          {organisms.map(org => {
            const inChain = chain.includes(org.id);
            return (
              <button key={org.id} onClick={() => addToChain(org.id)} disabled={inChain}
                className={`flex items-center gap-2 w-full text-left text-xs p-2 rounded border transition-all ${inChain ? "opacity-40 border-border" : "border-border hover:border-primary cursor-pointer"}`}>
                <span className="text-lg">{org.emoji}</span>
                <div>
                  <div className="font-semibold">{org.name}</div>
                  <div className="text-muted-foreground text-[10px]">{org.level}</div>
                </div>
              </button>
            );
          })}
          {chain.length === 5 && (
            <div className="border-t border-border pt-2">
              <p className="text-xs text-muted-foreground font-medium mb-1">Remove Species</p>
              {organisms.map(org => (
                <button key={org.id} onClick={() => simulateRemoval(org.id)}
                  className={`text-xs py-1 px-2 w-full text-left rounded ${removedId === org.id ? "bg-destructive/10 text-destructive" : "hover:bg-muted"}`}>
                  ✕ Remove {org.name}
                </button>
              ))}
            </div>
          )}
        </div>
      }
      workspace={
        <div className="w-full py-4">
          {/* Food chain display */}
          <svg viewBox="0 0 500 160" className="w-full h-36">
            {chain.map((id, i) => {
              const org = organisms.find(o => o.id === id)!;
              const x = 50 + i * 100;
              const removed = removedId === id;
              return (
                <g key={id}>
                  <motion.g initial={{ scale: 0 }} animate={{ scale: removed ? 0.3 : 1, opacity: removed ? 0.2 : 1 }} transition={{ type: "spring" }}>
                    <rect x={x - 30} y={30} width={60} height={70} fill={removed ? "hsl(var(--destructive) / 0.1)" : "hsl(var(--card))"} stroke={removed ? "hsl(var(--destructive))" : "hsl(var(--border))"} strokeWidth={1.5} rx={8} />
                    <text x={x} y={65} textAnchor="middle" className="text-[24px]">{org.emoji}</text>
                    <text x={x} y={85} textAnchor="middle" className="text-[7px] fill-foreground font-bold">{org.name}</text>
                    <text x={x} y={95} textAnchor="middle" className="text-[5px] fill-muted-foreground">{org.level}</text>
                  </motion.g>
                  {/* Arrow */}
                  {i < chain.length - 1 && (
                    <g>
                      <line x1={x + 32} y1={65} x2={x + 68} y2={65} stroke="hsl(var(--primary))" strokeWidth={2} markerEnd="url(#arrowhead)" />
                    </g>
                  )}
                </g>
              );
            })}
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--primary))" />
              </marker>
            </defs>
            {chain.length === 0 && (
              <text x={250} y={80} textAnchor="middle" className="text-[11px] fill-muted-foreground">Click organism cards to build your food chain →</text>
            )}
          </svg>

          {/* Removal effect */}
          {removedId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-xs text-destructive font-semibold">
                ⚠️ Removing {organisms.find(o => o.id === removedId)?.name} disrupts the food chain!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {removedId === "plant" && "Without producers, all consumers lose their energy source."}
                {removedId === "grasshopper" && "Frogs lose their food source; grass overgrows without herbivores."}
                {removedId === "frog" && "Grasshopper population explodes; snakes lose food."}
                {removedId === "snake" && "Frog population increases; hawks must find other prey."}
                {removedId === "hawk" && "Snake population increases without apex predator control."}
              </p>
            </motion.div>
          )}

          {/* Correct chain indicator */}
          {isCorrect && !removedId && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-primary font-bold mt-2">
              ✅ Correct food chain! Energy flows from producer → apex predator
            </motion.p>
          )}
        </div>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Chain Length" value={`${chain.length}/5`} />
          <DataRow label="Order" value={isCorrect ? "Correct ✓" : chain.length === 5 ? "Incorrect" : "Building..."} />
          {removedId && <DataRow label="Removed" value={organisms.find(o => o.id === removedId)?.name || ""} />}
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}
