import { useState, useCallback } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";

/* ═══════════════════════════════════════════════════
   UNIT 1: Scientific Method & Classification
   ═══════════════════════════════════════════════════ */

const OBJECTS = [
  { name: "Plant 🌱", living: true }, { name: "Stone 🪨", living: false },
  { name: "Bacteria 🦠", living: true }, { name: "Water 💧", living: false },
  { name: "Dog 🐕", living: true }, { name: "Chair 🪑", living: false },
  { name: "Mushroom 🍄", living: true }, { name: "Glass 🥛", living: false },
];

export function ClassificationLab() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "living" | "nonliving" | null>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean | null>>({});
  const steps = [
    "Open the classification workspace",
    "Observe the objects provided",
    "Drag each object into Living or Non-living",
    "Compare characteristics of the objects",
    "Record which features identify living organisms",
    "Submit the classification result",
  ];

  const classify = (name: string, choice: "living" | "nonliving") => {
    const obj = OBJECTS.find(o => o.name === name)!;
    const correct = (choice === "living") === obj.living;
    setAnswers(a => ({ ...a, [name]: choice }));
    setFeedback(f => ({ ...f, [name]: correct }));
    if (step < 3) setStep(3);
  };

  const total = OBJECTS.length;
  const answered = Object.keys(answers).length;
  const correct = Object.values(feedback).filter(Boolean).length;
  const reset = () => { setStep(0); setAnswers({}); setFeedback({}); };

  return (
    <SimulationLayout
      title="Lab: Classification of Living & Non-Living"
      objective="Classify objects into living and non-living categories"
      theory="Living things exhibit growth, reproduction, respiration, excretion, irritability, nutrition, and movement."
      onReset={reset}
      equipment={
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Click an object, then choose a category.</p>
          {OBJECTS.map(obj => {
            const fb = feedback[obj.name];
            return (
              <div key={obj.name} className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-1 transition-all ${fb === true ? "border-primary bg-primary/10" : fb === false ? "border-destructive bg-destructive/10 animate-[shake_0.3s]" : "border-border"}`}>
                <span>{obj.name}</span>
                {!answers[obj.name] ? (
                  <div className="flex gap-1">
                    <button onClick={() => classify(obj.name, "living")} className="px-2 py-0.5 rounded bg-primary/20 hover:bg-primary/40 text-[10px]">Living</button>
                    <button onClick={() => classify(obj.name, "nonliving")} className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-[10px]">Non-living</button>
                  </div>
                ) : (
                  <span className={`text-[10px] font-bold ${fb ? "text-primary" : "text-destructive"}`}>{fb ? "✓" : "✗"}</span>
                )}
              </div>
            );
          })}
        </div>
      }
      workspace={
        <div className="w-full flex flex-col items-center gap-4">
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            <div className="border-2 border-primary/30 rounded-xl p-3 min-h-[120px]">
              <h4 className="text-xs font-bold text-primary mb-2">🌿 Living</h4>
              {OBJECTS.filter(o => answers[o.name] === "living").map(o => (
                <div key={o.name} className={`text-xs p-1 rounded mb-1 ${o.living ? "bg-primary/10" : "bg-destructive/10"}`}>{o.name}</div>
              ))}
            </div>
            <div className="border-2 border-muted-foreground/30 rounded-xl p-3 min-h-[120px]">
              <h4 className="text-xs font-bold text-muted-foreground mb-2">🪨 Non-living</h4>
              {OBJECTS.filter(o => answers[o.name] === "nonliving").map(o => (
                <div key={o.name} className={`text-xs p-1 rounded mb-1 ${!o.living ? "bg-primary/10" : "bg-destructive/10"}`}>{o.name}</div>
              ))}
            </div>
          </div>
        </div>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Answered" value={`${answered}/${total}`} />
          <DataRow label="Correct" value={correct} />
          <DataRow label="Score" value={answered > 0 ? `${Math.round(correct / answered * 100)}%` : "—"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function ScientificMethodSim() {
  const [step, setStep] = useState(0);
  const [hypothesis, setHypothesis] = useState<number | null>(null);
  const [indepVar, setIndepVar] = useState<number | null>(null);
  const [depVar, setDepVar] = useState<number | null>(null);
  const [ran, setRan] = useState(false);
  const steps = [
    "Read the problem presented",
    "Identify the research question",
    "Propose a hypothesis",
    "Select the independent variable",
    "Select the dependent variable",
    "Set up experimental conditions",
    "Run the experiment simulation",
    "Observe the results",
    "Record observations",
    "Draw a conclusion",
  ];

  const hypotheses = ["More sunlight → taller plants", "More water → taller plants", "More fertilizer → taller plants"];
  const indepVars = ["Sunlight hours", "Water amount", "Fertilizer amount"];
  const depVars = ["Plant height", "Number of leaves", "Stem thickness"];

  const runExperiment = () => { setRan(true); setStep(7); };
  const reset = () => { setStep(0); setHypothesis(null); setIndepVar(null); setDepVar(null); setRan(false); };

  return (
    <SimulationLayout
      title="Lab: Practicing the Scientific Method"
      objective="Design and run an experiment following the scientific method"
      theory="The scientific method: observation → question → hypothesis → experiment → data → conclusion."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground mb-1">Hypothesis</p>
            {hypotheses.map((h, i) => (
              <button key={i} onClick={() => { setHypothesis(i); if (step < 3) setStep(3); }} className={`block w-full text-left text-[10px] p-1.5 rounded mb-1 ${hypothesis === i ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>{h}</button>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground mb-1">Independent Variable</p>
            {indepVars.map((v, i) => (
              <button key={i} onClick={() => { setIndepVar(i); if (step < 4) setStep(4); }} className={`block w-full text-left text-[10px] p-1.5 rounded mb-1 ${indepVar === i ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>{v}</button>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground mb-1">Dependent Variable</p>
            {depVars.map((v, i) => (
              <button key={i} onClick={() => { setDepVar(i); if (step < 5) setStep(5); }} className={`block w-full text-left text-[10px] p-1.5 rounded mb-1 ${depVar === i ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>{v}</button>
            ))}
          </div>
          {hypothesis !== null && indepVar !== null && depVar !== null && !ran && (
            <button onClick={runExperiment} className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90">▶ Run Experiment</button>
          )}
        </div>
      }
      workspace={
        <div className="w-full max-w-sm">
          {!ran ? (
            <div className="text-center text-muted-foreground text-sm p-8">
              <p className="text-2xl mb-2">🔬</p>
              <p>Select hypothesis, variables, then run the experiment</p>
            </div>
          ) : (
            <svg viewBox="0 0 300 200" className="w-full">
              <text x={150} y={20} textAnchor="middle" className="text-[10px] fill-foreground font-bold">Experiment Results</text>
              {[1, 2, 3, 4, 5].map(i => (
                <g key={i}>
                  <rect x={30 + (i - 1) * 52} y={180 - (20 + i * 25 + Math.random() * 10)} width={40} height={20 + i * 25} fill="hsl(var(--primary))" opacity={0.6 + i * 0.08} rx={3} />
                  <text x={50 + (i - 1) * 52} y={195} textAnchor="middle" className="text-[7px] fill-muted-foreground">G{i}</text>
                </g>
              ))}
              <text x={150} y={15} textAnchor="middle" className="text-[8px] fill-muted-foreground">{indepVars[indepVar!]} vs {depVars[depVar!]}</text>
            </svg>
          )}
        </div>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Hypothesis" value={hypothesis !== null ? `H${hypothesis + 1}` : "—"} />
          <DataRow label="Indep. Var" value={indepVar !== null ? indepVars[indepVar] : "—"} />
          <DataRow label="Dep. Var" value={depVar !== null ? depVars[depVar] : "—"} />
          <DataRow label="Status" value={ran ? "Complete ✓" : "Pending"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ═══════════════════════════════════════════════════
   UNIT 2: Cell Biology
   ═══════════════════════════════════════════════════ */

export function MicroscopePartsLab() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const steps = [
    "Open the microscope simulation",
    "Rotate to view all parts",
    "Click each part to learn its function",
    "Read the function description",
    "Match part name to location",
    "Complete the labeling activity",
  ];

  const parts = [
    { name: "Eyepiece", x: 150, y: 30, desc: "Lens you look through (10×)" },
    { name: "Objective Lens", x: 150, y: 100, desc: "Magnifies specimen (4×, 10×, 40×)" },
    { name: "Stage", x: 150, y: 140, desc: "Platform to hold the slide" },
    { name: "Coarse Knob", x: 70, y: 100, desc: "Moves stage up/down for rough focus" },
    { name: "Fine Knob", x: 70, y: 130, desc: "Fine-tunes focus for clarity" },
    { name: "Light Source", x: 150, y: 200, desc: "Illuminates the specimen from below" },
    { name: "Diaphragm", x: 150, y: 170, desc: "Controls the amount of light" },
  ];

  const reset = () => { setStep(0); setSelected(null); };

  return (
    <SimulationLayout
      title="Lab: Identifying Microscope Parts"
      objective="Identify and learn the function of each microscope part"
      theory="A compound microscope magnifies using eyepiece and objective lenses."
      onReset={reset}
      equipment={
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Click parts on the microscope to learn about them.</p>
          {selected && (
            <div className="p-2 rounded-lg bg-primary/10 border border-primary text-xs">
              <p className="font-bold">{selected}</p>
              <p className="text-muted-foreground mt-1">{parts.find(p => p.name === selected)?.desc}</p>
            </div>
          )}
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 240" className="w-full h-56">
          {/* Microscope body */}
          <rect x={135} y={25} width={30} height={25} rx={4} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={140} y={50} width={20} height={60} rx={2} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={100} y={130} width={100} height={15} rx={2} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={130} y={110} width={40} height={20} rx={2} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={140} y={145} width={20} height={30} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />
          <circle cx={150} cy={195} r={30} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Knobs */}
          <rect x={55} y={90} width={30} height={12} rx={6} fill="hsl(var(--muted-foreground))" opacity={0.5} />
          <rect x={55} y={120} width={25} height={10} rx={5} fill="hsl(var(--muted-foreground))" opacity={0.4} />
          {/* Clickable labels */}
          {parts.map(p => (
            <g key={p.name} onClick={() => { setSelected(p.name); if (step < 3) setStep(3); }} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r={8} fill={selected === p.name ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.3)"} />
              <text x={p.x} y={p.y + 3} textAnchor="middle" className="text-[6px] fill-primary-foreground font-bold pointer-events-none">?</text>
            </g>
          ))}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Selected" value={selected || "None"} />
          <DataRow label="Parts Explored" value={`${selected ? 1 : 0}/7`} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function OnionEpidermisSlideLab() {
  const [step, setStep] = useState(0);
  const [stained, setStained] = useState(false);
  const [coverSlip, setCoverSlip] = useState(false);
  const [magnification, setMagnification] = useState(4);
  const [focus, setFocus] = useState(50);
  const steps = [
    "Select an onion sample",
    "Use forceps to peel thin epidermis",
    "Place epidermis on slide",
    "Add one drop of iodine stain",
    "Place the cover slip",
    "Place slide on microscope stage",
    "Adjust focus knob",
    "Observe the onion cells",
    "Draw or record observations",
  ];

  const clarity = Math.max(0, 1 - Math.abs(focus - 50) / 50);
  const reset = () => { setStep(0); setStained(false); setCoverSlip(false); setMagnification(4); setFocus(50); };

  return (
    <SimulationLayout
      title="Lab: Preparing an Onion Epidermis Slide"
      objective="Prepare and observe onion cells under a microscope"
      theory="Onion epidermal cells show visible cell wall, nucleus, and cytoplasm when stained with iodine."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <button onClick={() => { setStained(true); if (step < 4) setStep(4); }} className={`w-full text-xs py-1.5 rounded ${stained ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>
            {stained ? "✓ Iodine Added" : "Add Iodine Stain"}
          </button>
          <button onClick={() => { setCoverSlip(true); if (step < 5) setStep(5); }} className={`w-full text-xs py-1.5 rounded ${coverSlip ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>
            {coverSlip ? "✓ Cover Slip Placed" : "Place Cover Slip"}
          </button>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-bold">Objective Lens</p>
            <div className="flex gap-1">
              {[4, 10, 40].map(m => (
                <button key={m} onClick={() => { setMagnification(m); if (step < 7) setStep(7); }} className={`flex-1 text-[10px] py-1 rounded ${magnification === m ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{m}×</button>
              ))}
            </div>
          </div>
          <ControlGroup label="Focus" value={focus} onChange={v => { setFocus(v); if (step < 7) setStep(7); }} min={0} max={100} unit="%" />
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-56">
          <circle cx={150} cy={125} r={100} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={3} />
          <circle cx={150} cy={125} r={95} fill={stained ? "#fef3c755" : "#f5f5f511"} />
          {coverSlip && stained && Array.from({ length: Math.floor(magnification / 2) }, (_, r) =>
            Array.from({ length: Math.floor(magnification / 2) }, (_, c) => {
              const cx = 80 + c * (180 / Math.floor(magnification / 2));
              const cy = 65 + r * (120 / Math.floor(magnification / 2));
              const dist = Math.sqrt((cx - 150) ** 2 + (cy - 125) ** 2);
              if (dist > 85) return null;
              return (
                <g key={`${r}-${c}`} opacity={clarity}>
                  <rect x={cx - 15} y={cy - 10} width={30} height={20} rx={2} fill="none" stroke={stained ? "#a16207" : "#666"} strokeWidth={1.5} />
                  <circle cx={cx} cy={cy} r={3} fill={stained ? "#a16207" : "#999"} opacity={0.7} />
                </g>
              );
            })
          )}
          {(!stained || !coverSlip) && (
            <text x={150} y={130} textAnchor="middle" className="text-[10px] fill-muted-foreground">
              {!stained ? "Add iodine stain first" : "Place cover slip"}
            </text>
          )}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Magnification" value={`${magnification * 10}×`} />
          <DataRow label="Stained" value={stained ? "Yes" : "No"} />
          <DataRow label="Cover Slip" value={coverSlip ? "Yes" : "No"} />
          <DataRow label="Focus Clarity" value={`${Math.round(clarity * 100)}%`} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function DiffusionDemo() {
  const [step, setStep] = useState(0);
  const [dropped, setDropped] = useState(false);
  const [time, setTime] = useState(0);
  const steps = [
    "Fill a beaker with water",
    "Add a crystal of potassium permanganate",
    "Observe the color spreading",
    "Record how particles move",
    "Measure time for color to spread",
    "Explain how diffusion occurs",
  ];

  const spread = Math.min(120, time * 4);
  const reset = () => { setStep(0); setDropped(false); setTime(0); };

  return (
    <SimulationLayout
      title="Lab: Diffusion Demonstration"
      objective="Observe diffusion of potassium permanganate in water"
      theory="Diffusion is the net movement of particles from high to low concentration."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <button onClick={() => { setDropped(true); setStep(2); }} className={`w-full text-xs py-1.5 rounded ${dropped ? "bg-purple-500/20 border border-purple-500" : "bg-muted hover:bg-muted/80"}`}>
            {dropped ? "✓ Crystal Added" : "Drop KMnO₄ Crystal"}
          </button>
          {dropped && <ControlGroup label="Time Elapsed" value={time} onChange={v => { setTime(v); if (step < 4) setStep(4); }} min={0} max={30} unit="min" />}
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-56">
          {/* Beaker */}
          <rect x={75} y={50} width={150} height={170} rx={5} fill="#bfdbfe22" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={75} y={50} width={150} height={160} rx={5} fill="#bfdbfe33" />
          {dropped && (
            <circle cx={150} cy={150} r={spread} fill="#7c3aed" opacity={Math.max(0.05, 0.4 - spread * 0.003)}>
              <animate attributeName="opacity" values={`${0.4 - spread * 0.003};${0.3 - spread * 0.003}`} dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          {dropped && <circle cx={150} cy={150} r={4} fill="#7c3aed" />}
          <text x={150} y={240} textAnchor="middle" className="text-[9px] fill-muted-foreground">Beaker with water</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Crystal" value={dropped ? "Added" : "Not added"} />
          <DataRow label="Time" value={time} unit="min" />
          <DataRow label="Spread Radius" value={spread.toFixed(0)} unit="mm" />
          <DataRow label="Concentration" value={spread > 0 ? "Decreasing outward" : "—"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function OsmosisSimulation() {
  const [step, setStep] = useState(0);
  const [concentration, setConcentration] = useState(0);
  const [time, setTime] = useState(0);
  const steps = [
    "Cut two equal potato strips",
    "Measure their initial length",
    "Place one strip in salt solution",
    "Place the other in distilled water",
    "Wait for a set period",
    "Remove the strips",
    "Measure final length",
    "Compare results",
    "Identify swelling or shrinking",
  ];

  const waterChange = time * 0.3;
  const saltChange = -concentration * time * 0.02;
  const waterLen = 50 + waterChange;
  const saltLen = 50 + saltChange;
  const reset = () => { setStep(0); setConcentration(0); setTime(0); };

  return (
    <SimulationLayout
      title="Lab: Osmosis Experiment (Potato Strips)"
      objective="Demonstrate osmosis using potato strips in different solutions"
      theory="Osmosis moves water across a semi-permeable membrane from dilute to concentrated solution."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Salt Concentration" value={concentration} onChange={v => { setConcentration(v); if (step < 3) setStep(3); }} min={0} max={20} unit="%" />
          <ControlGroup label="Time" value={time} onChange={v => { setTime(v); if (step < 5) setStep(5); }} min={0} max={60} unit="min" />
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-56">
          {/* Water beaker */}
          <rect x={30} y={80} width={100} height={120} rx={5} fill="#bfdbfe33" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={60} y={130 - waterLen * 0.4} width={20} height={waterLen * 0.8} rx={3} fill="#f59e0b" opacity={0.8} />
          <text x={80} y={220} textAnchor="middle" className="text-[8px] fill-muted-foreground">Pure Water</text>
          <text x={80} y={232} textAnchor="middle" className="text-[7px] fill-primary">{waterLen.toFixed(1)}mm</text>
          {/* Salt beaker */}
          <rect x={170} y={80} width={100} height={120} rx={5} fill="#bfdbfe55" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={200} y={130 - saltLen * 0.4} width={20} height={Math.max(10, saltLen * 0.8)} rx={3} fill="#f59e0b" opacity={0.8} />
          <text x={220} y={220} textAnchor="middle" className="text-[8px] fill-muted-foreground">Salt Solution ({concentration}%)</text>
          <text x={220} y={232} textAnchor="middle" className="text-[7px] fill-primary">{saltLen.toFixed(1)}mm</text>
          {time > 0 && (
            <>
              <text x={70} y={75} textAnchor="middle" className="text-[8px] fill-primary">↓ H₂O in</text>
              <text x={210} y={75} textAnchor="middle" className="text-[8px] fill-destructive">↑ H₂O out</text>
            </>
          )}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Initial Length" value="50.0" unit="mm" />
          <DataRow label="Water Strip" value={waterLen.toFixed(1)} unit="mm" />
          <DataRow label="Salt Strip" value={saltLen.toFixed(1)} unit="mm" />
          <DataRow label="Water Δ" value={`+${waterChange.toFixed(1)}`} unit="mm" />
          <DataRow label="Salt Δ" value={saltChange.toFixed(1)} unit="mm" />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ═══════════════════════════════════════════════════
   UNIT 3: Food Tests
   ═══════════════════════════════════════════════════ */

function FoodTestSim({ title, objective, theory, reagent, positiveColor, positiveLabel, steps: stepsArr }: {
  title: string; objective: string; theory: string; reagent: string; positiveColor: string; positiveLabel: string; steps: string[];
}) {
  const [step, setStep] = useState(0);
  const [samplePlaced, setSamplePlaced] = useState(false);
  const [reagentAdded, setReagentAdded] = useState(false);
  const [shaken, setShaken] = useState(false);
  const reset = () => { setStep(0); setSamplePlaced(false); setReagentAdded(false); setShaken(false); };
  const positive = samplePlaced && reagentAdded && shaken;

  return (
    <SimulationLayout title={title} objective={objective} theory={theory} onReset={reset}
      equipment={
        <div className="space-y-2">
          <button onClick={() => { setSamplePlaced(true); if (step < 1) setStep(1); }} className={`w-full text-xs py-1.5 rounded ${samplePlaced ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>
            {samplePlaced ? "✓ Sample Added" : "Add Food Sample"}
          </button>
          <button onClick={() => { if (samplePlaced) { setReagentAdded(true); if (step < 2) setStep(2); }}} className={`w-full text-xs py-1.5 rounded ${reagentAdded ? "bg-primary/20 border border-primary" : samplePlaced ? "bg-muted hover:bg-muted/80" : "bg-muted opacity-50 cursor-not-allowed"}`}>
            {reagentAdded ? `✓ ${reagent} Added` : `Add ${reagent}`}
          </button>
          <button onClick={() => { if (reagentAdded) { setShaken(true); if (step < 4) setStep(4); }}} className={`w-full text-xs py-1.5 rounded ${shaken ? "bg-primary/20 border border-primary" : reagentAdded ? "bg-muted hover:bg-muted/80" : "bg-muted opacity-50 cursor-not-allowed"}`}>
            {shaken ? "✓ Shaken" : "Shake / Observe"}
          </button>
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-56">
          {/* Test tube */}
          <rect x={120} y={40} width={60} height={160} rx={30} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={122} y={100} width={56} height={98} rx={28} fill={positive ? positiveColor : samplePlaced ? "#d4d4d833" : "transparent"} />
          {samplePlaced && !reagentAdded && <text x={150} y={160} textAnchor="middle" className="text-[8px] fill-muted-foreground">Sample</text>}
          {reagentAdded && !shaken && <text x={150} y={160} textAnchor="middle" className="text-[8px] fill-muted-foreground">{reagent} added</text>}
          {positive && <text x={150} y={160} textAnchor="middle" className="text-[9px] fill-foreground font-bold">{positiveLabel}</text>}
          <text x={150} y={220} textAnchor="middle" className="text-[9px] fill-muted-foreground">Test Tube</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Sample" value={samplePlaced ? "Added" : "—"} />
          <DataRow label="Reagent" value={reagentAdded ? reagent : "—"} />
          <DataRow label="Result" value={positive ? positiveLabel : "Pending"} />
        </div>
      }
      analysis={<StepByStep steps={stepsArr} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function StarchTestLab() {
  return <FoodTestSim
    title="Lab: Test for Starch (Iodine Test)"
    objective="Test the presence of starch in food samples"
    theory="Iodine turns blue-black with starch due to the amylose helix structure."
    reagent="Iodine"
    positiveColor="#1e3a5f"
    positiveLabel="Blue-Black → Starch ✓"
    steps={["Place food sample in test tube", "Add iodine solution", "Observe the color change", "Blue-black = starch present", "Record the observation"]}
  />;
}

export function ProteinTestLab() {
  return <FoodTestSim
    title="Lab: Test for Protein (Biuret Test)"
    objective="Test the presence of protein in food samples"
    theory="Biuret reagent turns purple with peptide bonds in proteins."
    reagent="Biuret Reagent"
    positiveColor="#7c3aed55"
    positiveLabel="Purple → Protein ✓"
    steps={["Place food sample in test tube", "Add Biuret reagent", "Shake gently", "Observe color change", "Purple = protein present", "Record results"]}
  />;
}

export function LipidTestLab() {
  return <FoodTestSim
    title="Lab: Test for Lipids (Sudan III)"
    objective="Test the presence of lipids in food samples"
    theory="Sudan III stains lipids red/orange. A red oil layer indicates fat."
    reagent="Sudan III"
    positiveColor="#ef444455"
    positiveLabel="Red Layer → Lipid ✓"
    steps={["Place food sample in test tube", "Add Sudan III solution", "Shake the test tube", "Observe the red oil layer", "Record results"]}
  />;
}

/* ═══════════════════════════════════════════════════
   UNIT 4: Respiration
   ═══════════════════════════════════════════════════ */

export function CO2ProductionTest() {
  const [step, setStep] = useState(0);
  const [blown, setBlown] = useState(false);
  const steps = [
    "Prepare two test tubes with limewater",
    "Blow air into one tube using a straw",
    "Leave the second tube as control",
    "Observe limewater color change",
    "Record which tube turns milky",
    "Conclude exhaled air contains CO₂",
  ];
  const reset = () => { setStep(0); setBlown(false); };

  return (
    <SimulationLayout
      title="Lab: CO₂ Production Test"
      objective="Demonstrate that exhaled air contains carbon dioxide"
      theory="CO₂ turns limewater milky: CO₂ + Ca(OH)₂ → CaCO₃ + H₂O"
      onReset={reset}
      equipment={
        <div className="space-y-2">
          <button onClick={() => { setBlown(true); setStep(4); }} className={`w-full text-xs py-1.5 rounded ${blown ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>
            {blown ? "✓ Air Blown" : "💨 Blow Into Tube A"}
          </button>
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-56">
          {/* Tube A */}
          <rect x={60} y={50} width={50} height={140} rx={25} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={62} y={100} width={46} height={88} rx={23} fill={blown ? "#d4d4d8" : "#bfdbfe33"} />
          <text x={85} y={210} textAnchor="middle" className="text-[8px] fill-foreground font-bold">Tube A (blown)</text>
          {blown && <text x={85} y={145} textAnchor="middle" className="text-[8px] fill-foreground">Milky ☁️</text>}
          {/* Tube B */}
          <rect x={190} y={50} width={50} height={140} rx={25} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={192} y={100} width={46} height={88} rx={23} fill="#bfdbfe33" />
          <text x={215} y={210} textAnchor="middle" className="text-[8px] fill-foreground font-bold">Tube B (control)</text>
          <text x={215} y={145} textAnchor="middle" className="text-[8px] fill-muted-foreground">Clear</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Tube A" value={blown ? "Milky (CO₂)" : "Clear"} />
          <DataRow label="Tube B" value="Clear (control)" />
          <DataRow label="Conclusion" value={blown ? "CO₂ present in exhaled air" : "—"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function BreathingRateInvestigation() {
  const [step, setStep] = useState(0);
  const [resting, setResting] = useState(16);
  const [exercising, setExercising] = useState(false);
  const [exerciseRate, setExerciseRate] = useState<number | null>(null);
  const steps = [
    "Sit quietly and measure breathing rate",
    "Record the number of breaths",
    "Perform exercise for 2 minutes",
    "Measure breathing rate again",
    "Compare the results",
    "Explain why breathing rate increased",
  ];

  const doExercise = () => {
    setExercising(true);
    setStep(3);
    setTimeout(() => {
      setExerciseRate(resting + 10 + Math.floor(Math.random() * 8));
      setExercising(false);
      setStep(4);
    }, 2000);
  };
  const reset = () => { setStep(0); setResting(16); setExerciseRate(null); setExercising(false); };

  return (
    <SimulationLayout
      title="Lab: Breathing Rate Investigation"
      objective="Compare breathing rates at rest and after exercise"
      theory="Exercise increases O₂ demand, so the body increases breathing rate."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <ControlGroup label="Resting Rate" value={resting} onChange={v => { setResting(v); if (step < 1) setStep(1); }} min={10} max={25} unit="br/min" />
          <button onClick={doExercise} disabled={exercising} className={`w-full text-xs py-1.5 rounded ${exercising ? "bg-muted animate-pulse" : exerciseRate ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>
            {exercising ? "🏃 Exercising..." : exerciseRate ? "✓ Exercise Done" : "🏃 Start Exercise"}
          </button>
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 200" className="w-full h-48">
          <text x={150} y={20} textAnchor="middle" className="text-[10px] fill-foreground font-bold">Breathing Rate Comparison</text>
          <rect x={60} y={180 - resting * 5} width={60} height={resting * 5} fill="hsl(var(--primary))" opacity={0.5} rx={4} />
          <text x={90} y={195} textAnchor="middle" className="text-[8px] fill-muted-foreground">Rest</text>
          <text x={90} y={175 - resting * 5} textAnchor="middle" className="text-[8px] fill-primary font-bold">{resting}</text>
          {exerciseRate && (
            <>
              <rect x={180} y={180 - exerciseRate * 5} width={60} height={exerciseRate * 5} fill="hsl(var(--destructive))" opacity={0.5} rx={4} />
              <text x={210} y={195} textAnchor="middle" className="text-[8px] fill-muted-foreground">Exercise</text>
              <text x={210} y={175 - exerciseRate * 5} textAnchor="middle" className="text-[8px] fill-destructive font-bold">{exerciseRate}</text>
            </>
          )}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Resting Rate" value={resting} unit="br/min" />
          <DataRow label="Exercise Rate" value={exerciseRate ?? "—"} unit={exerciseRate ? "br/min" : ""} />
          <DataRow label="Increase" value={exerciseRate ? `+${exerciseRate - resting}` : "—"} unit={exerciseRate ? "br/min" : ""} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ═══════════════════════════════════════════════════
   UNIT 5: Transport in Plants
   ═══════════════════════════════════════════════════ */

export function TranspirationLab() {
  const [step, setStep] = useState(0);
  const [time, setTime] = useState(0);
  const steps = [
    "Place cobalt chloride paper on leaf",
    "Observe the paper color",
    "Wait for some time",
    "Paper changes from blue to pink",
    "Record the result",
    "Conclude water vapor is released",
  ];
  const pinkness = Math.min(1, time / 20);
  const reset = () => { setStep(0); setTime(0); };

  return (
    <SimulationLayout
      title="Lab: Transpiration (Cobalt Chloride Paper)"
      objective="Demonstrate transpiration using cobalt chloride paper"
      theory="Cobalt chloride paper changes from blue to pink when moisture is detected from stomata."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <ControlGroup label="Time Elapsed" value={time} onChange={v => { setTime(v); if (step < 3) setStep(3); }} min={0} max={30} unit="min" />
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-56">
          {/* Leaf */}
          <ellipse cx={150} cy={100} rx={80} ry={50} fill="#22c55e44" stroke="#22c55e" strokeWidth={2} />
          <line x1={150} y1={50} x2={150} y2={150} stroke="#22c55e" strokeWidth={2} />
          {/* Paper strip */}
          <rect x={110} y={160} width={80} height={25} rx={3} fill={`rgb(${66 + 189 * pinkness}, ${133 - 63 * pinkness}, ${244 - 144 * pinkness})`} stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={150} y={177} textAnchor="middle" className="text-[8px] fill-foreground font-bold">
            {pinkness < 0.3 ? "Blue" : pinkness < 0.7 ? "Changing..." : "Pink"}
          </text>
          <text x={150} y={210} textAnchor="middle" className="text-[8px] fill-muted-foreground">Cobalt Chloride Paper</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Paper Color" value={pinkness < 0.3 ? "Blue" : pinkness < 0.7 ? "Transitioning" : "Pink"} />
          <DataRow label="Moisture" value={pinkness > 0.5 ? "Detected" : "Not yet"} />
          <DataRow label="Conclusion" value={pinkness > 0.7 ? "Transpiration confirmed" : "—"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function WaterTransportDye() {
  const [step, setStep] = useState(0);
  const [time, setTime] = useState(0);
  const steps = [
    "Place celery stem in colored water",
    "Leave for several hours",
    "Observe the stem",
    "Cut the stem cross section",
    "Identify colored xylem vessels",
    "Record the observation",
  ];
  const dyeHeight = Math.min(140, time * 10);
  const reset = () => { setStep(0); setTime(0); };

  return (
    <SimulationLayout
      title="Lab: Water Transport Using Colored Dye"
      objective="Observe water transport through xylem vessels"
      theory="Xylem transports water from roots to leaves via transpiration pull. Colored dye makes the path visible."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <ControlGroup label="Time" value={time} onChange={v => { setTime(v); if (step < 2) setStep(2); }} min={0} max={24} unit="hrs" />
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-56">
          {/* Beaker */}
          <rect x={100} y={160} width={100} height={70} rx={5} fill="#ef444433" stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Stem */}
          <rect x={143} y={30} width={14} height={180} rx={3} fill="#86efac" stroke="#22c55e" strokeWidth={1} />
          {/* Dye rising */}
          <rect x={145} y={210 - dyeHeight} width={10} height={dyeHeight} rx={2} fill="#ef4444" opacity={0.6} />
          {/* Leaves at top */}
          <ellipse cx={130} cy={35} rx={25} ry={12} fill="#22c55e44" stroke="#22c55e" strokeWidth={1} />
          <ellipse cx={170} cy={35} rx={25} ry={12} fill="#22c55e44" stroke="#22c55e" strokeWidth={1} />
          <text x={150} y={248} textAnchor="middle" className="text-[8px] fill-muted-foreground">Celery in red dye</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Time" value={time} unit="hrs" />
          <DataRow label="Dye Height" value={dyeHeight.toFixed(0)} unit="mm" />
          <DataRow label="Xylem" value={dyeHeight > 50 ? "Visible (red)" : "Not yet visible"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ═══════════════════════════════════════════════════
   UNIT 6: Plant Reproduction
   ═══════════════════════════════════════════════════ */

export function FlowerDissection() {
  const [step, setStep] = useState(0);
  const [layer, setLayer] = useState(0);
  const parts = ["Complete Flower", "Remove Sepals", "Remove Petals", "Remove Stamens", "Pistil Only"];
  const steps = [
    "Obtain a fresh flower",
    "Observe external parts",
    "Remove petals carefully",
    "Identify sepals, stamens, pistil",
    "Examine the anther and stigma",
    "Draw and label the parts",
  ];
  const reset = () => { setStep(0); setLayer(0); };

  return (
    <SimulationLayout
      title="Lab: Virtual Flower Dissection"
      objective="Dissect a flower and identify its reproductive parts"
      theory="Sepals→Petals→Stamens (male)→Pistil (female: stigma, style, ovary)"
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Dissection Layer" value={layer} onChange={v => { setLayer(v); setStep(Math.min(v + 1, 5)); }} min={0} max={4} unit="" />
          <p className="text-xs text-muted-foreground font-semibold">{parts[layer]}</p>
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          {layer < 1 && [0, 1, 2, 3, 4].map(i => <ellipse key={`s${i}`} cx={150 + Math.cos(i * 1.26) * 50} cy={125 + Math.sin(i * 1.26) * 50} rx={20} ry={10} fill="#22c55e" transform={`rotate(${i * 72},${150 + Math.cos(i * 1.26) * 50},${125 + Math.sin(i * 1.26) * 50})`} />)}
          {layer < 2 && [0, 1, 2, 3, 4].map(i => <ellipse key={`p${i}`} cx={150 + Math.cos(i * 1.26 + 0.3) * 35} cy={125 + Math.sin(i * 1.26 + 0.3) * 35} rx={18} ry={10} fill="#ec4899" opacity={0.7} transform={`rotate(${i * 72 + 36},${150 + Math.cos(i * 1.26 + 0.3) * 35},${125 + Math.sin(i * 1.26 + 0.3) * 35})`} />)}
          {layer < 3 && [0, 1, 2, 3].map(i => (
            <g key={`st${i}`}>
              <line x1={150} y1={125} x2={150 + Math.cos(i * 1.57) * 25} y2={125 + Math.sin(i * 1.57) * 25} stroke="#eab308" strokeWidth={2} />
              <circle cx={150 + Math.cos(i * 1.57) * 25} cy={125 + Math.sin(i * 1.57) * 25} r={4} fill="#eab308" />
            </g>
          ))}
          <rect x={145} y={110} width={10} height={30} fill="#16a34a" rx={2} />
          <circle cx={150} cy={105} r={6} fill="#15803d" />
          <ellipse cx={150} cy={145} rx={12} ry={8} fill="#166534" />
          <text x={150} y={200} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{parts[layer]}</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Layer" value={parts[layer]} />
          <DataRow label="Visible" value={layer === 0 ? "All parts" : layer === 4 ? "Pistil only" : `${4 - layer} layers left`} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ═══════════════════════════════════════════════════
   UNIT 7: Skeletal System
   ═══════════════════════════════════════════════════ */

const BONES = [
  { name: "Skull", x: 150, y: 25, desc: "Protects the brain" },
  { name: "Clavicle", x: 120, y: 55, desc: "Connects arm to body" },
  { name: "Ribs", x: 150, y: 85, desc: "Protect heart and lungs" },
  { name: "Spine", x: 150, y: 120, desc: "Supports body, protects spinal cord" },
  { name: "Pelvis", x: 150, y: 150, desc: "Supports organs, connects legs" },
  { name: "Femur", x: 135, y: 190, desc: "Longest & strongest bone" },
];

export function IdentifyingBones() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const steps = [
    "Open the skeleton model",
    "Rotate the skeleton",
    "Click on individual bones",
    "Identify their names",
    "Match bones to their functions",
  ];
  const reset = () => { setStep(0); setSelected(null); };

  return (
    <SimulationLayout
      title="Lab: Identifying Bones"
      objective="Identify major bones and their functions"
      theory="The human skeleton has 206 bones providing support, protection, and movement."
      onReset={reset}
      equipment={
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Click bones on the skeleton to identify them.</p>
          {selected && (
            <div className="p-2 rounded-lg bg-primary/10 border border-primary text-xs">
              <p className="font-bold">{selected}</p>
              <p className="text-muted-foreground mt-1">{BONES.find(b => b.name === selected)?.desc}</p>
            </div>
          )}
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 240" className="w-full h-56">
          {/* Simple skeleton outline */}
          <circle cx={150} cy={25} r={15} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
          <line x1={150} y1={40} x2={150} y2={155} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
          <line x1={110} y1={55} x2={190} y2={55} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
          <line x1={110} y1={55} x2={95} y2={120} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
          <line x1={190} y1={55} x2={205} y2={120} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
          <ellipse cx={150} cy={85} rx={30} ry={25} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} />
          <ellipse cx={150} cy={150} rx={25} ry={15} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} />
          <line x1={135} y1={165} x2={120} y2={230} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
          <line x1={165} y1={165} x2={180} y2={230} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
          {/* Clickable points */}
          {BONES.map(b => (
            <g key={b.name} onClick={() => { setSelected(b.name); if (step < 3) setStep(3); }} className="cursor-pointer">
              <circle cx={b.x} cy={b.y} r={10} fill={selected === b.name ? "hsl(var(--primary) / 0.4)" : "hsl(var(--primary) / 0.15)"} stroke={selected === b.name ? "hsl(var(--primary))" : "transparent"} strokeWidth={2} />
            </g>
          ))}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Selected" value={selected || "None"} />
          <DataRow label="Function" value={selected ? (BONES.find(b => b.name === selected)?.desc ?? "") : "—"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ═══════════════════════════════════════════════════
   UNIT 8: Circulatory System
   ═══════════════════════════════════════════════════ */

export function MeasuringPulseRate() {
  const [step, setStep] = useState(0);
  const [restRate, setRestRate] = useState(72);
  const [exercising, setExercising] = useState(false);
  const [exerciseRate, setExerciseRate] = useState<number | null>(null);
  const steps = [
    "Place two fingers on the wrist",
    "Count pulse beats for 60 seconds",
    "Record the pulse rate",
    "Perform exercise",
    "Measure pulse rate again",
    "Compare results",
  ];

  const doExercise = () => {
    setExercising(true);
    setStep(4);
    setTimeout(() => {
      setExerciseRate(restRate + 30 + Math.floor(Math.random() * 20));
      setExercising(false);
      setStep(5);
    }, 2000);
  };
  const reset = () => { setStep(0); setRestRate(72); setExerciseRate(null); setExercising(false); };

  return (
    <SimulationLayout
      title="Lab: Measuring Pulse Rate"
      objective="Measure pulse rate at rest and after exercise"
      theory="Normal resting heart rate: 60-100 bpm. Exercise increases heart rate for greater O₂ delivery."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <ControlGroup label="Resting Pulse" value={restRate} onChange={v => { setRestRate(v); if (step < 2) setStep(2); }} min={50} max={100} unit="bpm" />
          <button onClick={doExercise} disabled={exercising} className={`w-full text-xs py-1.5 rounded ${exercising ? "bg-muted animate-pulse" : exerciseRate ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>
            {exercising ? "🏃 Exercising..." : exerciseRate ? "✓ Done" : "🏃 Exercise"}
          </button>
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 200" className="w-full h-48">
          <text x={150} y={20} textAnchor="middle" className="text-[10px] fill-foreground font-bold">Pulse Rate</text>
          {/* ECG-like line */}
          <polyline
            points={Array.from({ length: 30 }, (_, i) => {
              const rate = exerciseRate || restRate;
              const x = 10 + i * 10;
              const peak = i % Math.max(2, Math.floor(30 / (rate / 20))) === 0;
              const y = peak ? 60 : 100;
              return `${x},${y}`;
            }).join(" ")}
            fill="none" stroke="hsl(var(--primary))" strokeWidth={2}
          />
          <text x={150} y={140} textAnchor="middle" className="text-[14px] fill-foreground font-bold">
            ❤️ {exercising ? "..." : exerciseRate || restRate} bpm
          </text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Resting" value={restRate} unit="bpm" />
          <DataRow label="After Exercise" value={exerciseRate ?? "—"} unit={exerciseRate ? "bpm" : ""} />
          <DataRow label="Increase" value={exerciseRate ? `+${exerciseRate - restRate}` : "—"} unit={exerciseRate ? "bpm" : ""} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ═══════════════════════════════════════════════════
   UNIT 9: Nervous System
   ═══════════════════════════════════════════════════ */

export function ReflexActionDemo() {
  const [step, setStep] = useState(0);
  const [tapped, setTapped] = useState(false);
  const [signal, setSignal] = useState(0);
  const steps = [
    "Sit with legs hanging freely",
    "Tap the knee with reflex hammer",
    "Observe the leg movement",
    "Record the reaction",
    "Explain reflex action",
  ];

  const tap = () => {
    setTapped(true);
    setStep(2);
    setSignal(0);
    const iv = setInterval(() => {
      setSignal(prev => {
        if (prev >= 4) { clearInterval(iv); return 4; }
        return prev + 1;
      });
    }, 400);
  };
  const reset = () => { setStep(0); setTapped(false); setSignal(0); };

  const pathLabels = ["Stimulus", "Receptor", "Sensory Neuron", "Spinal Cord", "Motor Neuron", "Muscle (kick)"];

  return (
    <SimulationLayout
      title="Lab: Reflex Action Demonstration"
      objective="Demonstrate and explain the knee-jerk reflex"
      theory="Reflex arc: stimulus → receptor → sensory neuron → spinal cord → motor neuron → effector."
      onReset={reset}
      equipment={
        <div className="space-y-2">
          <button onClick={tap} disabled={tapped} className={`w-full text-xs py-2 rounded font-bold ${tapped ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>
            {tapped ? "✓ Tapped" : "🔨 Tap Knee"}
          </button>
          {tapped && (
            <div className="space-y-1 mt-2">
              {pathLabels.map((label, i) => (
                <div key={i} className={`text-[10px] p-1.5 rounded transition-all ${i <= signal ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground"}`}>
                  {i <= signal ? "⚡" : "○"} {label}
                </div>
              ))}
            </div>
          )}
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-56">
          {/* Leg */}
          <line x1={150} y1={50} x2={150} y2={140} stroke="hsl(var(--muted-foreground))" strokeWidth={8} strokeLinecap="round" />
          <line x1={150} y1={140} x2={tapped && signal >= 4 ? 120 : 150} y2={tapped && signal >= 4 ? 210 : 220} stroke="hsl(var(--muted-foreground))" strokeWidth={8} strokeLinecap="round">
            {tapped && signal >= 4 && <animate attributeName="x2" values="150;120;150" dur="0.5s" fill="freeze" />}
          </line>
          {/* Knee */}
          <circle cx={150} cy={140} r={8} fill="hsl(var(--primary) / 0.3)" stroke="hsl(var(--primary))" strokeWidth={2} />
          {/* Hammer */}
          {!tapped && (
            <g>
              <line x1={190} y1={120} x2={165} y2={140} stroke="hsl(var(--foreground))" strokeWidth={3} />
              <circle cx={190} cy={118} r={8} fill="hsl(var(--destructive))" />
            </g>
          )}
          {tapped && signal >= 4 && <text x={100} y={200} className="text-[12px] fill-primary font-bold">KICK!</text>}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Stimulus" value={tapped ? "Tap applied" : "—"} />
          <DataRow label="Signal Path" value={tapped ? `${Math.min(signal + 1, 5)}/5` : "—"} />
          <DataRow label="Response" value={signal >= 4 ? "Leg kicks ✓" : "Waiting..."} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

/* ═══════════════════════════════════════════════════
   UNIT 10: Ecology
   ═══════════════════════════════════════════════════ */

export function QuadratSampling() {
  const [step, setStep] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);
  const steps = [
    "Place a quadrat on the ground",
    "Count the plants inside it",
    "Record the number",
    "Move quadrat to another area",
    "Repeat counting",
    "Calculate the average population",
  ];

  const addSample = () => {
    const count = 3 + Math.floor(Math.random() * 8);
    setSamples(s => [...s, count]);
    if (step < 4 && samples.length >= 1) setStep(4);
    else if (step < 2) setStep(2);
  };
  const avg = samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
  const reset = () => { setStep(0); setSamples([]); };

  return (
    <SimulationLayout
      title="Lab: Quadrat Sampling"
      objective="Estimate plant population using quadrat sampling"
      theory="Average count × total area / quadrat area = estimated population."
      onReset={reset}
      equipment={
        <div className="space-y-2">
          <button onClick={addSample} className="w-full text-xs py-1.5 rounded bg-muted hover:bg-muted/80">
            📐 Place Quadrat (Sample #{samples.length + 1})
          </button>
          {samples.length > 0 && (
            <div className="space-y-1">
              {samples.map((s, i) => (
                <div key={i} className="text-[10px] flex justify-between p-1 bg-muted rounded">
                  <span>Sample {i + 1}</span>
                  <span className="font-bold">{s} plants</span>
                </div>
              ))}
            </div>
          )}
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-56">
          {/* Ground */}
          <rect x={20} y={20} width={260} height={200} rx={5} fill="#22c55e11" stroke="hsl(var(--border))" strokeWidth={1} />
          {/* Random plants */}
          {Array.from({ length: 20 }, (_, i) => (
            <text key={i} x={40 + (i % 5) * 50 + Math.random() * 20} y={40 + Math.floor(i / 5) * 45 + Math.random() * 15} className="text-[14px]">🌿</text>
          ))}
          {/* Quadrat frame */}
          {samples.length > 0 && (
            <rect x={80} y={70} width={100} height={100} fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5,5" />
          )}
          <text x={150} y={245} textAnchor="middle" className="text-[9px] fill-muted-foreground">Field area (click to sample)</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Samples" value={samples.length} />
          <DataRow label="Average" value={avg > 0 ? avg.toFixed(1) : "—"} unit="plants" />
          <DataRow label="Est. Pop." value={avg > 0 ? `${Math.round(avg * 100)}` : "—"} unit="per 100m²" />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}
