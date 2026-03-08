import { useState, useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ======================================================================
   LAB 1 — MICROSCOPE SIMULATION 3D
   ====================================================================== */
function MicroscopeBody({ objective, light, clarity }: { objective: number; light: number; clarity: number }) {
  const eyepieceRef = useRef<THREE.Mesh>(null);

  return (
    <group position={[0, -0.45, 0]}>
      {/* Base */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[0.6, 0.08, 0.4]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Arm */}
      <mesh position={[-0.15, 0.5, 0]} castShadow>
        <boxGeometry args={[0.08, 0.9, 0.06]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Stage */}
      <mesh position={[0.1, 0.35, 0]} castShadow>
        <boxGeometry args={[0.5, 0.03, 0.4]} />
        <meshStandardMaterial color="#444" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Stage clips */}
      {[-0.12, 0.12].map((z, i) => (
        <mesh key={i} position={[0.3, 0.37, z]} castShadow>
          <boxGeometry args={[0.08, 0.02, 0.03]} />
          <meshStandardMaterial color="#888" metalness={0.8} />
        </mesh>
      ))}
      {/* Slide on stage */}
      <mesh position={[0.1, 0.375, 0]}>
        <boxGeometry args={[0.3, 0.005, 0.1]} />
        <meshPhysicalMaterial color="#eef" transparent opacity={0.5} transmission={0.6} />
      </mesh>
      {/* Objective turret */}
      <mesh position={[0.1, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
      {/* Objective lenses */}
      {[
        { angle: -0.3, len: 0.08, active: objective === 4 },
        { angle: 0, len: 0.12, active: objective === 10 },
        { angle: 0.3, len: 0.16, active: objective === 40 },
      ].map((obj, i) => (
        <mesh key={i} position={[0.1 + Math.sin(obj.angle) * 0.05, 0.5 - obj.len / 2, Math.cos(obj.angle) * 0.05]} castShadow>
          <cylinderGeometry args={[0.015, 0.02, obj.len, 12]} />
          <meshStandardMaterial color={obj.active ? "#f59e0b" : "#666"} metalness={0.6} />
        </mesh>
      ))}
      {/* Eyepiece tube */}
      <mesh ref={eyepieceRef} position={[-0.05, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.025, 0.2, 16]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      {/* Light source */}
      <pointLight position={[0.1, 0.15, 0]} intensity={light / 100 * 2} color="#ffffee" distance={1} />
      <mesh position={[0.1, 0.12, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.04, 12]} />
        <meshStandardMaterial color={light > 0 ? "#fff8e0" : "#555"} emissive={light > 0 ? "#ffee88" : "#000"} emissiveIntensity={light / 100} />
      </mesh>
      {/* Focus knobs */}
      {[0.4, 0.55].map((y, i) => (
        <mesh key={i} position={[-0.22, y, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 12]} />
          <meshStandardMaterial color="#666" metalness={0.8} />
        </mesh>
      ))}
      {/* FOV display floating above */}
      <mesh position={[0.8, 0.7, 0]} rotation={[0, -0.3, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[0.8, 0.7, 0.005]} rotation={[0, -0.3, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color={`rgb(${Math.floor(light * 2.55)},${Math.floor(light * 2.55)},${Math.floor(light * 2.4)})`} />
      </mesh>
      {/* Cell grid visible in FOV at higher zoom */}
      {objective >= 10 && clarity > 30 && (
        <group position={[0.8, 0.7, 0.01]} rotation={[0, -0.3, 0]}>
          {Array.from({ length: 6 }).map((_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            return (
              <mesh key={i} position={[(col - 1) * 0.15, (row - 0.5) * 0.18, 0]}>
                <planeGeometry args={[0.12, 0.15]} />
                <meshBasicMaterial color="#22c55e" transparent opacity={clarity / 200} wireframe />
              </mesh>
            );
          })}
          {objective >= 40 && Array.from({ length: 6 }).map((_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            return (
              <mesh key={`n${i}`} position={[(col - 1) * 0.15, (row - 0.5) * 0.18, 0.005]}>
                <circleGeometry args={[0.025, 12]} />
                <meshBasicMaterial color="#15803d" transparent opacity={clarity / 150} />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}

export function MicroscopeSimulation3D() {
  const [objective, setObjective] = useState(4);
  const [coarseFocus, setCoarseFocus] = useState(50);
  const [fineFocus, setFineFocus] = useState(50);
  const [light, setLight] = useState(0);
  const [step, setStep] = useState(0);

  const magnification = 10 * objective;
  const clarity = Math.max(0, Math.min(100, 100 - Math.abs(coarseFocus - 50) * 1.5 - Math.abs(fineFocus - 50) * 0.5));

  useEffect(() => { if (step === 0 && light > 0) setStep(1); }, [light, step]);
  useEffect(() => { if (step === 2 && objective === 4) setStep(3); }, [objective, step]);
  useEffect(() => { if (step === 3 && coarseFocus !== 50) setStep(4); }, [coarseFocus, step]);
  useEffect(() => { if (step === 4 && fineFocus !== 50) setStep(5); }, [fineFocus, step]);

  const reset = () => { setObjective(4); setCoarseFocus(50); setFineFocus(50); setLight(0); setStep(0); };

  const steps = [
    "Turn on the microscope light", "Place the slide on the stage",
    "Rotate to lowest magnification (4×)", "Adjust the coarse adjustment knob",
    "Use fine adjustment to sharpen image", "Move slide to observe different parts",
    "Rotate to higher magnification", "Observe the inverted, larger image", "Record observations",
  ];

  return (
    <Simulation3DLayout
      title="Lab 1: Using a Microscope (3D)"
      objective="Learn to properly use a microscope and observe objects"
      theory="A compound microscope uses two lens systems. Total magnification = eyepiece (10×) × objective lens. The image appears inverted."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Objective Lens</p>
            {[4, 10, 40].map(o => (
              <label key={o} className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="radio" checked={objective === o} onChange={() => setObjective(o)} className="accent-primary" />
                {o}× {o === 4 ? "(Low)" : o === 10 ? "(Med)" : "(High)"}
              </label>
            ))}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Coarse Focus</p>
            <Slider value={[coarseFocus]} onValueChange={v => setCoarseFocus(v[0])} min={0} max={100} step={1} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Fine Focus</p>
            <Slider value={[fineFocus]} onValueChange={v => setFineFocus(v[0])} min={0} max={100} step={1} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Light: {light}%</p>
            <Slider value={[light]} onValueChange={v => setLight(v[0])} min={0} max={100} step={1} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <MicroscopeBody objective={objective} light={light} clarity={clarity} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Magnification</span><span className="font-bold">{magnification}×</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Clarity</span><span className="font-bold">{Math.round(clarity)}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Light</span><span className="font-bold">{light > 0 ? "ON" : "OFF"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Image</span><span className="font-bold">{objective >= 10 ? "Inverted" : "—"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 2 — SEED GERMINATION 3D
   ====================================================================== */
function SeedContainer({ position, label, growth, hasWater, icon }: {
  position: [number, number, number]; label: string; growth: number; hasWater: boolean; icon: string;
}) {
  const sproutRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (sproutRef.current && growth > 0) {
      sproutRef.current.rotation.z = Math.sin(Date.now() * 0.002) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Container */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.4, 0.4]} />
        <meshPhysicalMaterial color="#ccc" transparent opacity={0.3} transmission={0.5} roughness={0.1} />
      </mesh>
      {/* Cotton bed */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.44, 0.08, 0.34]} />
        <meshStandardMaterial color={hasWater ? "#c8e6c8" : "#ddd"} />
      </mesh>
      {/* Water */}
      {hasWater && (
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.44, 0.04, 0.34]} />
          <meshStandardMaterial color="#93c5fd" transparent opacity={0.4} />
        </mesh>
      )}
      {/* Seed */}
      <mesh position={[0, -0.02, 0]} castShadow>
        <sphereGeometry args={[0.04, 12, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Sprout */}
      {growth > 0 && (
        <group ref={sproutRef as any} position={[0, 0, 0]}>
          <mesh position={[0, growth * 0.015, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.01, growth * 0.03, 8]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
          {growth > 5 && (
            <>
              <mesh position={[-0.03, growth * 0.025, 0]} rotation={[0, 0, 0.5]} castShadow>
                <sphereGeometry args={[0.025, 8, 6]} />
                <meshStandardMaterial color="#4ade80" />
              </mesh>
              <mesh position={[0.03, growth * 0.025, 0]} rotation={[0, 0, -0.5]} castShadow>
                <sphereGeometry args={[0.025, 8, 6]} />
                <meshStandardMaterial color="#4ade80" />
              </mesh>
            </>
          )}
        </group>
      )}
      {/* Label */}
      <Text position={[0, -0.3, 0.25]} fontSize={0.06} color="#666" anchorX="center">{label}</Text>
      <Text position={[0, 0.35, 0]} fontSize={0.12} anchorX="center">{icon}</Text>
      <Text position={[0, -0.38, 0.25]} fontSize={0.04} color="#888" anchorX="center">{growth.toFixed(1)} mm</Text>
    </group>
  );
}

export function SeedGerminationLab3D() {
  const [day, setDay] = useState(0);
  const [step, setStep] = useState(0);

  const getGrowth = (temp: string, water: boolean, d: number) => {
    if (!water) return 0;
    if (temp === "cold") return Math.max(0, (d - 3) * 1.5);
    return Math.min(d * 4, 30);
  };

  const containers = [
    { label: "A: Warm+Water", temp: "warm", water: true, icon: "☀️" },
    { label: "B: Cold+Water", temp: "cold", water: true, icon: "❄️" },
    { label: "C: Warm+Dry", temp: "warm", water: false, icon: "🏜️" },
  ];

  const reset = () => { setDay(0); setStep(0); };
  const steps = [
    "Place cotton in three containers", "Add bean seeds to each",
    "Moisten cotton (A & B only)", "Place in different conditions",
    "Observe seeds daily", "Measure sprout length",
    "Record results", "Compare germination conditions",
  ];

  return (
    <Simulation3DLayout
      title="Lab 2: Seed Germination (3D)"
      objective="Investigate factors affecting seed germination"
      theory="Seeds need water, warmth, and air to germinate. The embryo breaks through the seed coat when optimal conditions are met."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Day: {day}/10</p>
            <Slider value={[day]} onValueChange={v => { setDay(v[0]); if (v[0] > 0 && step < 4) setStep(4); }} min={0} max={10} step={1} />
          </div>
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setDay(Math.min(day + 1, 10))}>▶ Next Day</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {containers.map((c, i) => (
            <SeedContainer
              key={i}
              position={[(i - 1) * 1.2, 0, 0]}
              label={c.label}
              growth={getGrowth(c.temp, c.water, day)}
              hasWater={c.water}
              icon={c.icon}
            />
          ))}
          <Text position={[0, 1.2, 0]} fontSize={0.12} color="#333" anchorX="center" fontWeight="bold">
            Day {day} of 10
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Day</span><span className="font-bold">{day}</span></div>
          {containers.map((c, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-muted-foreground">{String.fromCharCode(65 + i)} Growth</span>
              <span className="font-bold">{getGrowth(c.temp, c.water, day).toFixed(1)} mm</span>
            </div>
          ))}
          <div className="flex justify-between"><span className="text-muted-foreground">Best</span><span className="font-bold">{day > 0 ? "Warm+Water" : "—"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 3 — DICHOTOMOUS KEY 3D
   ====================================================================== */
interface KeyNode { question: string; yes: string | KeyNode; no: string | KeyNode; }

const dichotomousTree: KeyNode = {
  question: "Does the organism have a backbone?",
  yes: {
    question: "Does it have feathers?",
    yes: "Bird (Aves) 🐦",
    no: { question: "Does it have fur or hair?", yes: "Mammal 🦁", no: "Reptile / Fish 🐊" },
  },
  no: {
    question: "Does it have legs?",
    yes: { question: "Does it have more than 6 legs?", yes: "Arachnid 🕷️", no: "Insect 🦗" },
    no: "Worm / Mollusk 🐛",
  },
};

function TreeNode3D({ position, label, color, scale = 1 }: {
  position: [number, number, number]; label: string; color: string; scale?: number;
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.15 * scale, 16, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text position={[0, 0.25 * scale, 0]} fontSize={0.06 * scale} color="#333" anchorX="center" maxWidth={0.8}>{label}</Text>
    </group>
  );
}

export function DichotomousKeyLab3D() {
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

  const choose = (choice: "yes" | "no") => {
    setPath([...path, choice]);
    setStep(Math.min(step + 1, 6));
  };

  const reset = () => { setPath([]); setStep(0); };
  const steps = [
    "Observe the organism", "Read the first pair of statements",
    "Choose the best description", "Follow the direction",
    "Continue until identified", "Write the organism name", "Repeat for others",
  ];

  return (
    <Simulation3DLayout
      title="Lab 3: Dichotomous Key (3D)"
      objective="Identify organisms using a dichotomous key"
      theory="A dichotomous key uses pairs of contrasting characteristics to narrow down identification step by step."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Path History</p>
          {path.length === 0 && <p className="text-xs text-muted-foreground italic">No choices yet</p>}
          {path.map((p, i) => (
            <div key={i} className="text-xs py-1 px-2 rounded bg-muted">Step {i + 1}: {p.toUpperCase()}</div>
          ))}
          {!isResult && (
            <div className="space-y-2 border-t border-border pt-2">
              <p className="text-xs font-medium">{typeof current !== "string" ? current.question : ""}</p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 text-xs" onClick={() => choose("yes")}>Yes</Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => choose("no")}>No</Button>
              </div>
            </div>
          )}
          {path.length > 0 && (
            <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => setPath(path.slice(0, -1))}>← Go Back</Button>
          )}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Decision path as 3D nodes */}
          {path.map((choice, i) => (
            <group key={i}>
              <TreeNode3D
                position={[(i - path.length / 2) * 0.8, 0.5, 0]}
                label={choice === "yes" ? "YES" : "NO"}
                color={choice === "yes" ? "#22c55e" : "#ef4444"}
              />
              {i < path.length - 1 && (
                <mesh position={[(i - path.length / 2) * 0.8 + 0.4, 0.5, 0]}>
                  <boxGeometry args={[0.3, 0.02, 0.02]} />
                  <meshStandardMaterial color="#888" />
                </mesh>
              )}
            </group>
          ))}
          {/* Result or current question */}
          {isResult ? (
            <group position={[0, 1, 0]}>
              <mesh castShadow>
                <boxGeometry args={[1.5, 0.5, 0.1]} />
                <meshStandardMaterial color="#22c55e" transparent opacity={0.2} />
              </mesh>
              <Text position={[0, 0.1, 0.06]} fontSize={0.08} color="#15803d" anchorX="center" fontWeight="bold">Identified!</Text>
              <Text position={[0, -0.08, 0.06]} fontSize={0.1} color="#333" anchorX="center" maxWidth={1.3}>{String(current)}</Text>
            </group>
          ) : (
            <group position={[0, 1, 0]}>
              <mesh>
                <boxGeometry args={[1.8, 0.4, 0.05]} />
                <meshStandardMaterial color="#f5f5f0" />
              </mesh>
              <Text position={[0, 0, 0.03]} fontSize={0.07} color="#333" anchorX="center" maxWidth={1.6}>
                {typeof current !== "string" ? current.question : ""}
              </Text>
            </group>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Choices</span><span className="font-bold">{path.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-bold">{isResult ? "Identified!" : "In Progress"}</span></div>
          {isResult && <div className="flex justify-between"><span className="text-muted-foreground">Result</span><span className="font-bold text-primary">{String(current)}</span></div>}
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 4 — ONION CELL OBSERVATION 3D
   ====================================================================== */
function CellGrid3D({ zoom, clarity, slide }: { zoom: number; clarity: number; slide: string }) {
  const colors: Record<string, { cell: string; nucleus: string }> = {
    onion: { cell: "#22c55e", nucleus: "#15803d" },
    cheek: { cell: "#f97316", nucleus: "#ea580c" },
    bacteria: { cell: "#8b5cf6", nucleus: "#6d28d9" },
  };
  const c = colors[slide];

  return (
    <group position={[0.8, 0.7, 0.01]} rotation={[0, -0.3, 0]}>
      {Array.from({ length: 9 }).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = (col - 1) * 0.18;
        const y = (row - 1) * 0.2;
        return (
          <group key={i} position={[x, y, 0]}>
            {/* Cell wall/membrane */}
            <mesh>
              <planeGeometry args={slide === "onion" ? [0.14, 0.17] : [0.13, 0.15]} />
              <meshBasicMaterial color={c.cell} transparent opacity={clarity / 200} wireframe={zoom < 15} />
            </mesh>
            {/* Nucleus */}
            {zoom >= 10 && (
              <mesh position={[-0.02, -0.02, 0.005]}>
                <circleGeometry args={[0.025, 12]} />
                <meshBasicMaterial color={c.nucleus} transparent opacity={clarity / 150} />
              </mesh>
            )}
            {/* Vacuole */}
            {zoom >= 20 && slide === "onion" && (
              <mesh position={[0.02, 0.02, 0.003]}>
                <circleGeometry args={[0.035, 12]} />
                <meshBasicMaterial color={c.cell} transparent opacity={clarity / 400} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function OnionCellObservation3D() {
  const [slide, setSlide] = useState<"onion" | "cheek" | "bacteria">("onion");
  const [zoom, setZoom] = useState(4);
  const [focus, setFocus] = useState(50);
  const [step, setStep] = useState(0);
  const [labels, setLabels] = useState<Record<string, boolean>>({
    "Cell Wall": false, Nucleus: false, Cytoplasm: false, Vacuole: false, "Cell Membrane": false,
  });

  const clarity = Math.max(0, 100 - Math.abs(focus - 50) * 2);
  const toggleLabel = (l: string) => { setLabels({ ...labels, [l]: !labels[l] }); if (step < 8) setStep(8); };
  const reset = () => {
    setSlide("onion"); setZoom(4); setFocus(50); setStep(0);
    setLabels(Object.fromEntries(Object.keys(labels).map(k => [k, false])));
  };

  const steps = [
    "Peel a thin layer of onion epidermis", "Place peel on a glass slide",
    "Add one drop of water", "Place a cover slip on top",
    "Put slide on microscope stage", "Observe at low magnification",
    "Adjust focus knobs", "Observe cell wall, cytoplasm, nucleus", "Draw and label cell parts",
  ];

  return (
    <Simulation3DLayout
      title="Lab 4: Observing Onion Cells (3D)"
      objective="Observe plant cells under a microscope and label parts"
      theory="Plant cells have cell walls, cell membrane, cytoplasm, nucleus, and large vacuole."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Slide</p>
            {(["onion", "cheek", "bacteria"] as const).map(s => (
              <label key={s} className="flex items-center gap-2 text-xs cursor-pointer capitalize">
                <input type="radio" checked={slide === s} onChange={() => setSlide(s)} className="accent-primary" />
                {s === "onion" ? "Onion Epidermis" : s === "cheek" ? "Cheek Cells" : "Bacteria"}
              </label>
            ))}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Zoom: {zoom}×</p>
            <Slider value={[zoom]} onValueChange={v => setZoom(v[0])} min={4} max={40} step={1} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Focus</p>
            <Slider value={[focus]} onValueChange={v => setFocus(v[0])} min={0} max={100} step={1} />
          </div>
          <div className="border-t border-border pt-2">
            <p className="text-xs text-muted-foreground font-medium mb-1">Labels</p>
            {Object.entries(labels).map(([label, placed]) => (
              <button key={label} onClick={() => toggleLabel(label)}
                className={`block w-full text-left text-xs py-1 px-2 mb-1 rounded border transition-all ${placed ? "bg-primary/10 border-primary text-primary" : "border-border hover:border-primary"}`}>
                {placed ? "✓ " : "○ "}{label}
              </button>
            ))}
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <MicroscopeBody objective={zoom > 20 ? 40 : zoom > 8 ? 10 : 4} light={80} clarity={clarity} />
          <CellGrid3D zoom={zoom} clarity={clarity} slide={slide} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Slide</span><span className="font-bold capitalize">{slide}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Magnification</span><span className="font-bold">{zoom * 10}×</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Clarity</span><span className="font-bold">{Math.round(clarity)}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Labels</span><span className="font-bold">{Object.values(labels).filter(Boolean).length}/5</span></div>
        </div>
      }
    />
  );
}
