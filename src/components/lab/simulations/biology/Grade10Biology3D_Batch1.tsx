import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ======================================================================
   LAB 1 — CLASSIFICATION OF LIVING & NON-LIVING 3D
   ====================================================================== */
const OBJECTS = [
  { name: "Plant 🌱", living: true }, { name: "Stone 🪨", living: false },
  { name: "Bacteria 🦠", living: true }, { name: "Water 💧", living: false },
  { name: "Dog 🐕", living: true }, { name: "Chair 🪑", living: false },
  { name: "Mushroom 🍄", living: true }, { name: "Glass 🥛", living: false },
];

function ClassificationBox3D({ position, label, color, items }: {
  position: [number, number, number]; label: string; color: string; items: { name: string; correct: boolean }[];
}) {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[1.2, 0.05, 1]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.8, 1]} />
        <meshStandardMaterial color={color} transparent opacity={0.08} wireframe />
      </mesh>
      <Text position={[0, 0.85, 0]} fontSize={0.08} color={color} anchorX="center" fontWeight="bold">{label}</Text>
      {items.map((item, i) => (
        <group key={i} position={[(i % 2 - 0.5) * 0.4, 0.15 + Math.floor(i / 2) * 0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.35, 0.15, 0.08]} />
            <meshStandardMaterial color={item.correct ? "#22c55e" : "#ef4444"} transparent opacity={0.3} />
          </mesh>
          <Text position={[0, 0, 0.05]} fontSize={0.04} color="#333" anchorX="center">{item.name.split(" ")[0]}</Text>
        </group>
      ))}
    </group>
  );
}

export function ClassificationLab3D() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "living" | "nonliving" | null>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean | null>>({});

  const classify = (name: string, choice: "living" | "nonliving") => {
    const obj = OBJECTS.find(o => o.name === name)!;
    const correct = (choice === "living") === obj.living;
    setAnswers(a => ({ ...a, [name]: choice }));
    setFeedback(f => ({ ...f, [name]: correct }));
    if (step < 3) setStep(3);
  };

  const answered = Object.keys(answers).length;
  const correct = Object.values(feedback).filter(Boolean).length;
  const reset = () => { setStep(0); setAnswers({}); setFeedback({}); };

  const steps = [
    "Open the classification workspace", "Observe the objects",
    "Classify each object", "Compare characteristics",
    "Record living features", "Submit results",
  ];

  const livingItems = OBJECTS.filter(o => answers[o.name] === "living").map(o => ({ name: o.name, correct: o.living }));
  const nonlivingItems = OBJECTS.filter(o => answers[o.name] === "nonliving").map(o => ({ name: o.name, correct: !o.living }));

  return (
    <Simulation3DLayout
      title="Lab: Classification of Living & Non-Living (3D)"
      objective="Classify objects into living and non-living categories"
      theory="Living things exhibit growth, reproduction, respiration, excretion, irritability, nutrition, and movement."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Click to classify:</p>
          {OBJECTS.map(obj => {
            const fb = feedback[obj.name];
            return (
              <div key={obj.name} className={`p-1.5 rounded border text-xs flex items-center justify-between ${fb === true ? "border-primary bg-primary/10" : fb === false ? "border-destructive bg-destructive/10" : "border-border"}`}>
                <span className="text-[10px]">{obj.name}</span>
                {!answers[obj.name] ? (
                  <div className="flex gap-1">
                    <button onClick={() => classify(obj.name, "living")} className="px-1.5 py-0.5 rounded bg-primary/20 hover:bg-primary/40 text-[9px]">L</button>
                    <button onClick={() => classify(obj.name, "nonliving")} className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-[9px]">NL</button>
                  </div>
                ) : (
                  <span className={`text-[10px] font-bold ${fb ? "text-primary" : "text-destructive"}`}>{fb ? "✓" : "✗"}</span>
                )}
              </div>
            );
          })}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <ClassificationBox3D position={[-0.8, -0.2, 0]} label="🌿 Living" color="#22c55e" items={livingItems} />
          <ClassificationBox3D position={[0.8, -0.2, 0]} label="🪨 Non-Living" color="#888888" items={nonlivingItems} />
          <Text position={[0, 1, 0]} fontSize={0.08} color="#333" anchorX="center" fontWeight="bold">
            {answered}/{OBJECTS.length} classified — {correct} correct
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Answered</span><span className="font-bold">{answered}/{OBJECTS.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Correct</span><span className="font-bold">{correct}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Score</span><span className="font-bold">{answered > 0 ? `${Math.round(correct / answered * 100)}%` : "—"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 2 — SCIENTIFIC METHOD 3D
   ====================================================================== */
export function ScientificMethodSim3D() {
  const [step, setStep] = useState(0);
  const [hypothesis, setHypothesis] = useState<number | null>(null);
  const [indepVar, setIndepVar] = useState<number | null>(null);
  const [depVar, setDepVar] = useState<number | null>(null);
  const [ran, setRan] = useState(false);

  const hypotheses = ["More sunlight → taller plants", "More water → taller plants", "More fertilizer → taller plants"];
  const indepVars = ["Sunlight hours", "Water amount", "Fertilizer amount"];
  const depVars = ["Plant height", "Number of leaves", "Stem thickness"];

  const runExperiment = () => { setRan(true); setStep(7); };
  const reset = () => { setStep(0); setHypothesis(null); setIndepVar(null); setDepVar(null); setRan(false); };

  const steps = [
    "Read the problem", "Identify research question", "Propose a hypothesis",
    "Select independent variable", "Select dependent variable",
    "Set up experiment", "Run the experiment", "Observe results", "Record data", "Conclude",
  ];

  // Bar data for results
  const barHeights = [0.3, 0.5, 0.7, 0.85, 1.1];

  return (
    <Simulation3DLayout
      title="Lab: Scientific Method (3D)"
      objective="Design and run an experiment following the scientific method"
      theory="Scientific method: observation → question → hypothesis → experiment → data → conclusion."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground mb-1">Hypothesis</p>
            {hypotheses.map((h, i) => (
              <button key={i} onClick={() => { setHypothesis(i); if (step < 3) setStep(3); }}
                className={`block w-full text-left text-[10px] p-1 rounded mb-1 ${hypothesis === i ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>{h}</button>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground mb-1">Independent Var</p>
            {indepVars.map((v, i) => (
              <button key={i} onClick={() => { setIndepVar(i); if (step < 4) setStep(4); }}
                className={`block w-full text-left text-[10px] p-1 rounded mb-1 ${indepVar === i ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>{v}</button>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground mb-1">Dependent Var</p>
            {depVars.map((v, i) => (
              <button key={i} onClick={() => { setDepVar(i); if (step < 5) setStep(5); }}
                className={`block w-full text-left text-[10px] p-1 rounded mb-1 ${depVar === i ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80"}`}>{v}</button>
            ))}
          </div>
          {hypothesis !== null && indepVar !== null && depVar !== null && !ran && (
            <Button size="sm" className="w-full text-xs" onClick={runExperiment}>▶ Run Experiment</Button>
          )}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {!ran ? (
            <Text position={[0, 0.5, 0]} fontSize={0.1} color="#999" anchorX="center">
              🔬 Select hypothesis & variables, then run
            </Text>
          ) : (
            <group position={[-1, -0.45, 0]}>
              {barHeights.map((h, i) => (
                <group key={i} position={[i * 0.5, h / 2, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.3, h, 0.3]} />
                    <meshStandardMaterial color="#6366f1" transparent opacity={0.6 + i * 0.08} />
                  </mesh>
                  <Text position={[0, h / 2 + 0.1, 0]} fontSize={0.06} color="#333" anchorX="center">G{i + 1}</Text>
                </group>
              ))}
              <Text position={[1, -0.15, 0.5]} fontSize={0.06} color="#666" anchorX="center">
                {indepVars[indepVar!]} vs {depVars[depVar!]}
              </Text>
            </group>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Hypothesis</span><span className="font-bold">{hypothesis !== null ? `H${hypothesis + 1}` : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Indep. Var</span><span className="font-bold text-[10px]">{indepVar !== null ? indepVars[indepVar] : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Dep. Var</span><span className="font-bold text-[10px]">{depVar !== null ? depVars[depVar] : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-bold">{ran ? "Complete ✓" : "Pending"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 3 — MICROSCOPE PARTS 3D
   ====================================================================== */
const MICRO_PARTS = [
  { name: "Eyepiece", pos: [0, 0.95, 0] as [number, number, number], desc: "Lens you look through (10×)" },
  { name: "Objective", pos: [0.1, 0.5, 0.05] as [number, number, number], desc: "Magnifies specimen (4×, 10×, 40×)" },
  { name: "Stage", pos: [0.1, 0.35, 0] as [number, number, number], desc: "Platform to hold the slide" },
  { name: "Coarse Knob", pos: [-0.22, 0.55, 0] as [number, number, number], desc: "Moves stage for rough focus" },
  { name: "Fine Knob", pos: [-0.22, 0.4, 0] as [number, number, number], desc: "Fine-tunes focus" },
  { name: "Light", pos: [0.1, 0.12, 0] as [number, number, number], desc: "Illuminates specimen from below" },
  { name: "Base", pos: [0, 0.04, 0] as [number, number, number], desc: "Supports the microscope" },
];

export function MicroscopePartsLab3D() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const steps = [
    "Open the microscope model", "Rotate to view all parts",
    "Click each part to learn", "Read function description",
    "Match part name to location", "Complete labeling",
  ];
  const reset = () => { setStep(0); setSelected(null); };

  return (
    <Simulation3DLayout
      title="Lab: Identifying Microscope Parts (3D)"
      objective="Identify and learn the function of each microscope part"
      theory="A compound microscope magnifies using eyepiece and objective lenses."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Click parts in 3D view:</p>
          {MICRO_PARTS.map(p => (
            <button key={p.name} onClick={() => { setSelected(p.name); if (step < 3) setStep(3); }}
              className={`block w-full text-left text-[10px] p-1.5 rounded border ${selected === p.name ? "bg-primary/10 border-primary" : "border-border hover:border-primary"}`}>
              {selected === p.name ? "✓ " : "○ "}{p.name}
            </button>
          ))}
          {selected && (
            <div className="p-2 rounded bg-primary/10 border border-primary text-xs">
              <p className="font-bold">{selected}</p>
              <p className="text-muted-foreground">{MICRO_PARTS.find(p => p.name === selected)?.desc}</p>
            </div>
          )}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Microscope body */}
          <group position={[0, -0.45, 0]}>
            {/* Base */}
            <mesh castShadow><boxGeometry args={[0.6, 0.08, 0.4]} /><meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} /></mesh>
            {/* Arm */}
            <mesh position={[-0.15, 0.5, 0]} castShadow><boxGeometry args={[0.08, 0.9, 0.06]} /><meshStandardMaterial color="#333" metalness={0.6} /></mesh>
            {/* Stage */}
            <mesh position={[0.1, 0.35, 0]} castShadow><boxGeometry args={[0.5, 0.03, 0.4]} /><meshStandardMaterial color="#444" metalness={0.5} /></mesh>
            {/* Objectives */}
            <mesh position={[0.1, 0.5, 0.05]} castShadow><cylinderGeometry args={[0.015, 0.02, 0.12, 12]} /><meshStandardMaterial color="#f59e0b" metalness={0.6} /></mesh>
            {/* Eyepiece */}
            <mesh position={[-0.05, 0.95, 0]} castShadow><cylinderGeometry args={[0.03, 0.025, 0.2, 16]} /><meshStandardMaterial color="#333" metalness={0.7} /></mesh>
            {/* Focus knobs */}
            <mesh position={[-0.22, 0.55, 0]} castShadow><cylinderGeometry args={[0.03, 0.03, 0.04, 12]} /><meshStandardMaterial color="#666" metalness={0.8} /></mesh>
            <mesh position={[-0.22, 0.4, 0]} castShadow><cylinderGeometry args={[0.025, 0.025, 0.03, 12]} /><meshStandardMaterial color="#777" metalness={0.8} /></mesh>
            {/* Light */}
            <mesh position={[0.1, 0.12, 0]}><cylinderGeometry args={[0.04, 0.04, 0.04, 12]} /><meshStandardMaterial color="#fff8e0" emissive="#ffee88" emissiveIntensity={0.5} /></mesh>
          </group>
          {/* Highlight selected part */}
          {selected && (() => {
            const part = MICRO_PARTS.find(p => p.name === selected);
            if (!part) return null;
            return (
              <group position={[part.pos[0], part.pos[1] - 0.45, part.pos[2]]}>
                <mesh>
                  <sphereGeometry args={[0.06, 16, 12]} />
                  <meshStandardMaterial color="#6366f1" transparent opacity={0.4} />
                </mesh>
                <Text position={[0.2, 0.05, 0]} fontSize={0.06} color="#6366f1" anchorX="left" fontWeight="bold">{selected}</Text>
              </group>
            );
          })()}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Selected</span><span className="font-bold">{selected || "None"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 4 — ONION EPIDERMIS SLIDE PREP 3D
   ====================================================================== */
export function OnionEpidermisSlideLab3D() {
  const [step, setStep] = useState(0);
  const [stained, setStained] = useState(false);
  const [coverSlip, setCoverSlip] = useState(false);
  const [magnification, setMagnification] = useState(4);
  const [focus, setFocus] = useState(50);

  const clarity = Math.max(0, 1 - Math.abs(focus - 50) / 50);
  const reset = () => { setStep(0); setStained(false); setCoverSlip(false); setMagnification(4); setFocus(50); };

  const steps = [
    "Select an onion sample", "Peel thin epidermis",
    "Place on slide", "Add iodine stain", "Place cover slip",
    "Put slide on stage", "Adjust focus", "Observe cells", "Record observations",
  ];

  return (
    <Simulation3DLayout
      title="Lab: Preparing Onion Epidermis Slide (3D)"
      objective="Prepare and observe onion cells under a microscope"
      theory="Onion epidermal cells show visible cell wall, nucleus, and cytoplasm when stained with iodine."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <Button size="sm" variant={stained ? "default" : "outline"} className="w-full text-xs"
            onClick={() => { setStained(true); if (step < 4) setStep(4); }}>
            {stained ? "✓ Iodine Added" : "Add Iodine Stain"}
          </Button>
          <Button size="sm" variant={coverSlip ? "default" : "outline"} className="w-full text-xs"
            onClick={() => { setCoverSlip(true); if (step < 5) setStep(5); }}>
            {coverSlip ? "✓ Cover Slip" : "Place Cover Slip"}
          </Button>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Objective: {magnification}×</p>
            <div className="flex gap-1">
              {[4, 10, 40].map(m => (
                <Button key={m} size="sm" variant={magnification === m ? "default" : "outline"} className="flex-1 text-[10px]"
                  onClick={() => { setMagnification(m); if (step < 7) setStep(7); }}>{m}×</Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Focus</p>
            <Slider value={[focus]} onValueChange={v => { setFocus(v[0]); if (step < 7) setStep(7); }} min={0} max={100} step={1} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Microscope simplified */}
          <group position={[-0.5, -0.45, 0]}>
            <mesh castShadow><boxGeometry args={[0.5, 0.06, 0.35]} /><meshStandardMaterial color="#2a2a2a" metalness={0.7} /></mesh>
            <mesh position={[-0.1, 0.45, 0]} castShadow><boxGeometry args={[0.06, 0.8, 0.05]} /><meshStandardMaterial color="#333" metalness={0.6} /></mesh>
            <mesh position={[0.05, 0.85, 0]} castShadow><cylinderGeometry args={[0.025, 0.02, 0.15, 12]} /><meshStandardMaterial color="#333" metalness={0.7} /></mesh>
          </group>
          {/* FOV display */}
          <group position={[0.7, 0.3, 0]} rotation={[0, -0.2, 0]}>
            <mesh><circleGeometry args={[0.5, 32]} /><meshBasicMaterial color="#000" /></mesh>
            <mesh position={[0, 0, 0.005]}><circleGeometry args={[0.45, 32]} /><meshBasicMaterial color={stained ? "#fef3c7" : "#f8f8f8"} /></mesh>
            {/* Cells */}
            {coverSlip && stained && Array.from({ length: Math.floor(magnification / 2) * Math.floor(magnification / 2) }).map((_, i) => {
              const cols = Math.floor(magnification / 2);
              const row = Math.floor(i / cols);
              const col = i % cols;
              const cx = (col - cols / 2 + 0.5) * (0.8 / cols);
              const cy = (row - cols / 2 + 0.5) * (0.6 / cols);
              const dist = Math.sqrt(cx * cx + cy * cy);
              if (dist > 0.4) return null;
              return (
                <group key={i} position={[cx, cy, 0.01]}>
                  <mesh><planeGeometry args={[0.7 / cols, 0.5 / cols]} /><meshBasicMaterial color="#a16207" transparent opacity={clarity * 0.5} wireframe /></mesh>
                  {magnification >= 10 && <mesh position={[0, 0, 0.005]}><circleGeometry args={[0.05 / cols * 2, 8]} /><meshBasicMaterial color="#92400e" transparent opacity={clarity * 0.7} /></mesh>}
                </group>
              );
            })}
          </group>
          <Text position={[0.7, -0.35, 0.3]} fontSize={0.06} color="#666" anchorX="center">{magnification * 10}× Magnification</Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Magnification</span><span className="font-bold">{magnification * 10}×</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Stained</span><span className="font-bold">{stained ? "Yes" : "No"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Cover Slip</span><span className="font-bold">{coverSlip ? "Yes" : "No"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Clarity</span><span className="font-bold">{Math.round(clarity * 100)}%</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 5 — DIFFUSION DEMO 3D
   ====================================================================== */
function DiffusionParticles({ spread, dropped }: { spread: number; dropped: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const particles = useRef(
    Array.from({ length: 40 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random(),
      y: (Math.random() - 0.5) * 0.3,
      speed: 0.5 + Math.random(),
    }))
  );

  useFrame(() => {
    if (!ref.current || !dropped) return;
    ref.current.children.forEach((child, i) => {
      const p = particles.current[i];
      const maxDist = spread / 120;
      const d = p.dist * maxDist;
      child.position.x = Math.cos(p.angle + Date.now() * 0.0005 * p.speed) * d;
      child.position.z = Math.sin(p.angle + Date.now() * 0.0005 * p.speed) * d;
      child.position.y = p.y + Math.sin(Date.now() * 0.002 * p.speed) * 0.02;
    });
  });

  if (!dropped) return null;

  return (
    <group ref={ref} position={[0, -0.1, 0]}>
      {particles.current.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.012, 6, 4]} />
          <meshStandardMaterial color="#7c3aed" transparent opacity={Math.max(0.1, 0.6 - spread * 0.004)} />
        </mesh>
      ))}
    </group>
  );
}

export function DiffusionDemo3D() {
  const [step, setStep] = useState(0);
  const [dropped, setDropped] = useState(false);
  const [time, setTime] = useState(0);

  const spread = Math.min(120, time * 4);
  const reset = () => { setStep(0); setDropped(false); setTime(0); };

  const steps = [
    "Fill beaker with water", "Add KMnO₄ crystal",
    "Observe color spreading", "Record particle movement",
    "Measure spread time", "Explain diffusion",
  ];

  return (
    <Simulation3DLayout
      title="Lab: Diffusion Demonstration (3D)"
      objective="Observe diffusion of potassium permanganate in water"
      theory="Diffusion is the net movement of particles from high to low concentration."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <Button size="sm" variant={dropped ? "default" : "outline"} className="w-full text-xs"
            onClick={() => { setDropped(true); setStep(2); }}>
            {dropped ? "✓ Crystal Added" : "Drop KMnO₄ Crystal"}
          </Button>
          {dropped && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Time: {time} min</p>
              <Slider value={[time]} onValueChange={v => { setTime(v[0]); if (step < 4) setStep(4); }} min={0} max={30} step={1} />
            </div>
          )}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Beaker */}
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.35, 0.6, 32, 1, true]} />
            <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} transmission={0.7} roughness={0.05} />
          </mesh>
          {/* Water */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.38, 0.33, 0.4, 32]} />
            <meshStandardMaterial color="#bfdbfe" transparent opacity={0.3} />
          </mesh>
          {/* KMnO4 crystal */}
          {dropped && (
            <mesh position={[0, -0.25, 0]}>
              <sphereGeometry args={[0.03, 8, 6]} />
              <meshStandardMaterial color="#7c3aed" />
            </mesh>
          )}
          <DiffusionParticles spread={spread} dropped={dropped} />
          <Text position={[0, 0.5, 0.5]} fontSize={0.06} color="#666" anchorX="center">
            {dropped ? `Spread: ${spread.toFixed(0)}mm — ${time} min` : "Add crystal to start"}
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Crystal</span><span className="font-bold">{dropped ? "Added" : "Not added"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-bold">{time} min</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Spread</span><span className="font-bold">{spread.toFixed(0)} mm</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 6 — OSMOSIS SIMULATION 3D
   ====================================================================== */
export function OsmosisSimulation3D() {
  const [step, setStep] = useState(0);
  const [concentration, setConcentration] = useState(0);
  const [time, setTime] = useState(0);

  const waterChange = time * 0.3;
  const saltChange = -concentration * time * 0.02;
  const waterLen = 50 + waterChange;
  const saltLen = 50 + saltChange;
  const reset = () => { setStep(0); setConcentration(0); setTime(0); };

  const steps = [
    "Cut two potato strips", "Measure initial length",
    "Place one in salt solution", "Place other in water",
    "Wait", "Remove strips", "Measure final length", "Compare results", "Identify swelling/shrinking",
  ];

  return (
    <Simulation3DLayout
      title="Lab: Osmosis Experiment (3D)"
      objective="Demonstrate osmosis using potato strips in different solutions"
      theory="Osmosis moves water across a semi-permeable membrane from dilute to concentrated solution."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Salt Concentration: {concentration}%</p>
            <Slider value={[concentration]} onValueChange={v => { setConcentration(v[0]); if (step < 3) setStep(3); }} min={0} max={20} step={1} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Time: {time} min</p>
            <Slider value={[time]} onValueChange={v => { setTime(v[0]); if (step < 5) setStep(5); }} min={0} max={60} step={5} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Water beaker */}
          <group position={[-0.7, -0.2, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.25, 0.22, 0.5, 24, 1, true]} />
              <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} transmission={0.7} />
            </mesh>
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.23, 0.2, 0.35, 24]} />
              <meshStandardMaterial color="#93c5fd" transparent opacity={0.3} />
            </mesh>
            {/* Potato strip */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.06, waterLen * 0.006, 0.06]} />
              <meshStandardMaterial color="#eab308" />
            </mesh>
            <Text position={[0, -0.4, 0.3]} fontSize={0.06} color="#3b82f6" anchorX="center" fontWeight="bold">Pure Water</Text>
            <Text position={[0, -0.5, 0.3]} fontSize={0.05} color="#666" anchorX="center">{waterLen.toFixed(1)}mm</Text>
          </group>
          {/* Salt beaker */}
          <group position={[0.7, -0.2, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.25, 0.22, 0.5, 24, 1, true]} />
              <meshPhysicalMaterial color="#fef3c7" transparent opacity={0.2} />
            </mesh>
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.23, 0.2, 0.35, 24]} />
              <meshStandardMaterial color="#fcd34d" transparent opacity={0.3} />
            </mesh>
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.06, Math.max(0.05, saltLen * 0.006), 0.06]} />
              <meshStandardMaterial color="#eab308" />
            </mesh>
            <Text position={[0, -0.4, 0.3]} fontSize={0.06} color="#f59e0b" anchorX="center" fontWeight="bold">Salt ({concentration}%)</Text>
            <Text position={[0, -0.5, 0.3]} fontSize={0.05} color="#666" anchorX="center">{saltLen.toFixed(1)}mm</Text>
          </group>
          {time > 0 && (
            <>
              <Text position={[-0.3, 0.3, 0]} fontSize={0.1} color="#3b82f6" anchorX="center">→</Text>
              <Text position={[0.3, 0.3, 0]} fontSize={0.1} color="#ef4444" anchorX="center">←</Text>
            </>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Initial</span><span className="font-bold">50.0 mm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Water Strip</span><span className="font-bold">{waterLen.toFixed(1)} mm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Salt Strip</span><span className="font-bold">{saltLen.toFixed(1)} mm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Water Δ</span><span className="font-bold text-green-600">+{waterChange.toFixed(1)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Salt Δ</span><span className="font-bold text-red-600">{saltChange.toFixed(1)}</span></div>
        </div>
      }
    />
  );
}
