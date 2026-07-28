import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ======================================================================
   LAB 1 — CELL STRUCTURE (MICROSCOPE) 3D
   ====================================================================== */
function CellModel3D({ cellType, zoom, showLabels }: { cellType: "plant" | "animal"; zoom: number; showLabels: boolean }) {
  const scale = zoom / 40;
  const isPlant = cellType === "plant";

  return (
    <group position={[0.7, 0.3, 0]} scale={scale}>
      {/* Cell membrane / wall */}
      {isPlant ? (
        <mesh><boxGeometry args={[1, 0.8, 0.05]} /><meshStandardMaterial color="#22c55e" transparent opacity={0.2} wireframe /></mesh>
      ) : (
        <mesh><sphereGeometry args={[0.45, 24, 16]} /><meshStandardMaterial color="#f97316" transparent opacity={0.15} wireframe /></mesh>
      )}
      {/* Cytoplasm */}
      <mesh><sphereGeometry args={[isPlant ? 0.35 : 0.4, 16, 12]} /><meshStandardMaterial color={isPlant ? "#22c55e" : "#f97316"} transparent opacity={0.08} /></mesh>
      {/* Nucleus */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.1, 12, 8]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.5} />
      </mesh>
      {showLabels && <Text position={[0.15, 0.05, 0.1]} fontSize={0.05} color="#3b82f6" anchorX="left">Nucleus</Text>}
      {/* Nucleolus */}
      <mesh position={[0.02, 0.02, 0.05]}><sphereGeometry args={[0.03, 8, 6]} /><meshStandardMaterial color="#1e40af" /></mesh>
      {/* Mitochondria */}
      {[-0.2, 0.15].map((x, i) => (
        <mesh key={`m${i}`} position={[x, -0.15 + i * 0.1, 0]} rotation={[0, 0, 0.3 * (i - 0.5)]}>
          <capsuleGeometry args={[0.02, 0.06, 4, 8]} />
          <meshStandardMaterial color="#ef4444" transparent opacity={0.5} />
        </mesh>
      ))}
      {showLabels && <Text position={[-0.2, -0.08, 0.1]} fontSize={0.04} color="#ef4444" anchorX="center">Mitochondria</Text>}
      {/* Plant-specific */}
      {isPlant && (
        <>
          {/* Large vacuole */}
          <mesh position={[0.1, 0.05, 0]}><sphereGeometry args={[0.15, 12, 8]} /><meshStandardMaterial color="#a855f7" transparent opacity={0.1} /></mesh>
          {showLabels && <Text position={[0.25, 0.1, 0.1]} fontSize={0.04} color="#a855f7" anchorX="left">Vacuole</Text>}
          {/* Chloroplasts */}
          {[[-0.15, 0.15], [0.2, -0.1], [-0.1, -0.2]].map(([x, y], i) => (
            <mesh key={`c${i}`} position={[x, y, 0]}><sphereGeometry args={[0.025, 8, 6]} /><meshStandardMaterial color="#22c55e" transparent opacity={0.6} /></mesh>
          ))}
          {showLabels && <Text position={[-0.15, 0.22, 0.1]} fontSize={0.04} color="#16a34a" anchorX="center">Chloroplast</Text>}
          {showLabels && <Text position={[0, 0.45, 0.1]} fontSize={0.04} color="#22c55e" anchorX="center">Cell Wall</Text>}
        </>
      )}
      {/* Animal-specific: centriole */}
      {!isPlant && (
        <>
          <mesh position={[0.2, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.06, 8]} />
            <meshStandardMaterial color="#6366f1" />
          </mesh>
          {showLabels && <Text position={[0.2, 0.2, 0.1]} fontSize={0.04} color="#6366f1" anchorX="center">Centriole</Text>}
        </>
      )}
      {showLabels && <Text position={[0, -0.3, 0.1]} fontSize={0.04} color={isPlant ? "#22c55e" : "#f97316"} anchorX="center">Cell Membrane</Text>}
    </group>
  );
}

export function CellStructureMicroscope3D() {
  const [cellType, setCellType] = useState<"plant" | "animal">("plant");
  const [zoom, setZoom] = useState(10);
  const [focus, setFocus] = useState(50);
  const [showLabels, setShowLabels] = useState(false);
  const [step, setStep] = useState(0);

  const clarity = Math.max(0, 1 - Math.abs(focus - 50) / 50);
  const reset = () => { setCellType("plant"); setZoom(10); setFocus(50); setShowLabels(false); setStep(0); };

  const steps = [
    "Open virtual microscope", "Select plant cell slide", "Place slide on stage",
    "Turn on light", "Adjust coarse focus", "Fine focus for clarity",
    "Adjust magnification", "Observe structures", "Identify organelles",
    "Record observations", "Repeat with animal cell", "Compare cells",
  ];

  return (
    <Simulation3DLayout
      title="Lab 1: Cell Structure (3D)"
      objective="Observe and identify plant and animal cell structures"
      theory="Plant cells have cell wall, large vacuole, chloroplasts. Animal cells have centrioles but lack cell wall."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Cell Type</p>
            {(["plant", "animal"] as const).map(t => (
              <label key={t} className="flex items-center gap-2 text-xs capitalize">
                <input type="radio" checked={cellType === t} onChange={() => setCellType(t)} className="accent-primary" /> {t}
              </label>
            ))}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Magnification: {zoom}×</p>
            <Slider value={[zoom]} onValueChange={v => setZoom(v[0])} min={10} max={100} step={10} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Focus</p>
            <Slider value={[focus]} onValueChange={v => setFocus(v[0])} min={0} max={100} step={1} />
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowLabels(!showLabels)}>
            {showLabels ? "Hide" : "Show"} Labels
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Microscope body */}
          <group position={[-0.5, -0.45, 0]}>
            <mesh castShadow><boxGeometry args={[0.5, 0.06, 0.35]} /><meshStandardMaterial color="#2a2a2a" metalness={0.7} /></mesh>
            <mesh position={[-0.1, 0.45, 0]} castShadow><boxGeometry args={[0.06, 0.8, 0.05]} /><meshStandardMaterial color="#333" metalness={0.6} /></mesh>
            <mesh position={[0.05, 0.85, 0]} castShadow><cylinderGeometry args={[0.025, 0.02, 0.15, 12]} /><meshStandardMaterial color="#333" metalness={0.7} /></mesh>
          </group>
          {/* Cell model */}
          <group>
            {/* FOV background */}
            <mesh position={[0.7, 0.3, -0.02]} rotation={[0, -0.1, 0]}>
              <circleGeometry args={[0.6, 32]} />
              <meshBasicMaterial color="#fafafa" transparent opacity={clarity} />
            </mesh>
            <group>
              <CellModel3D cellType={cellType} zoom={zoom} showLabels={showLabels} />
            </group>
          </group>
          <Text position={[0.7, -0.35, 0.3]} fontSize={0.06} color="#666" anchorX="center">
            {cellType === "plant" ? "Plant" : "Animal"} Cell — {zoom}× — Clarity: {(clarity * 100).toFixed(0)}%
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Cell Type</span><span className="font-bold capitalize">{cellType}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Magnification</span><span className="font-bold">{zoom}×</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Clarity</span><span className="font-bold">{(clarity * 100).toFixed(0)}%</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 2 — OSMOSIS & DIFFUSION 3D
   ====================================================================== */
export function OsmosisDiffusion3D() {
  const [concentration, setConcentration] = useState(5);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);

  const initialLength = 50;
  const change = concentration > 5 ? -(concentration - 5) * 0.8 : (5 - concentration) * 0.6;
  const currentLength = initialLength + change * Math.min(time / 30, 1);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setTime(t => { if (t >= 60) { setRunning(false); return 60; } return t + 1; }), 100);
    return () => clearInterval(iv);
  }, [running]);

  const reset = () => { setConcentration(5); setRunning(false); setTime(0); setStep(0); };
  const steps = [
    "Select potato strip", "Measure initial length", "Place in distilled water",
    "Start timer", "Observe strip", "Remove from solution",
    "Measure final length", "Record change", "Repeat with salt", "Compare results", "Explain osmosis",
  ];

  const solutionType = concentration > 5 ? "Hypertonic" : concentration < 5 ? "Hypotonic" : "Isotonic";

  return (
    <Simulation3DLayout
      title="Lab 2: Osmosis & Diffusion (3D)"
      objective="Investigate water movement through a semi-permeable membrane"
      theory="Water moves from dilute to concentrated solution through a semi-permeable membrane."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Salt: {concentration}%</p>
            <Slider value={[concentration]} onValueChange={v => setConcentration(v[0])} min={0} max={20} step={1} />
          </div>
          <Button size="sm" className="w-full text-xs" onClick={() => { setRunning(!running); if (!running && time >= 60) setTime(0); }}>
            {running ? "⏸ Pause" : time > 0 && time < 60 ? "▶ Resume" : "▶ Start"}
          </Button>
          <p className="text-[10px] text-muted-foreground">Time: {time}s / 60s</p>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Beaker */}
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.3, 0.6, 24, 1, true]} />
            <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} transmission={0.6} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.33, 0.28, 0.4, 24]} />
            <meshStandardMaterial color={concentration > 5 ? "#fcd34d" : "#93c5fd"} transparent opacity={0.25} />
          </mesh>
          {/* Potato strip */}
          <mesh position={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.08, currentLength * 0.008, 0.08]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          {/* Water arrows */}
          {time > 0 && concentration < 5 && (
            <Text position={[-0.25, 0, 0]} fontSize={0.12} color="#3b82f6" anchorX="center">→</Text>
          )}
          {time > 0 && concentration > 5 && (
            <Text position={[0.25, 0, 0]} fontSize={0.12} color="#ef4444" anchorX="center">→</Text>
          )}
          <Text position={[0, 0.5, 0]} fontSize={0.07} color="#333" anchorX="center" fontWeight="bold">
            {solutionType} ({concentration}%)
          </Text>
          <Text position={[0, -0.7, 0.4]} fontSize={0.06} color="#666" anchorX="center">
            Length: {currentLength.toFixed(1)}mm (Initial: {initialLength}mm)
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Initial</span><span className="font-bold">{initialLength} mm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Current</span><span className="font-bold">{currentLength.toFixed(1)} mm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Change</span><span className="font-bold">{(currentLength - initialLength).toFixed(1)} mm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Solution</span><span className="font-bold">{solutionType}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-bold">{time}s</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 3 — FOOD TESTS 3D
   ====================================================================== */
export function FoodTests3D() {
  const [sample, setSample] = useState("starch");
  const [reagent, setReagent] = useState<string | null>(null);
  const [heated, setHeated] = useState(false);
  const [step, setStep] = useState(0);

  const samples: Record<string, Record<string, { color: string; result: string; needsHeat?: boolean }>> = {
    starch: { iodine: { color: "#1a1a6e", result: "Blue-black → Starch ✅" }, benedicts: { color: "#3b82f6", result: "Blue → No sugar", needsHeat: true }, biuret: { color: "#3b82f6", result: "Blue → No protein" }, ethanol: { color: "#f5f5f5", result: "Clear → No lipid" } },
    glucose: { iodine: { color: "#b45309", result: "Brown → No starch" }, benedicts: { color: "#f97316", result: "Orange → Sugar ✅", needsHeat: true }, biuret: { color: "#3b82f6", result: "Blue → No protein" }, ethanol: { color: "#f5f5f5", result: "Clear → No lipid" } },
    protein: { iodine: { color: "#b45309", result: "Brown → No starch" }, benedicts: { color: "#3b82f6", result: "Blue → No sugar", needsHeat: true }, biuret: { color: "#7c3aed", result: "Purple → Protein ✅" }, ethanol: { color: "#f5f5f5", result: "Clear → No lipid" } },
    oil: { iodine: { color: "#b45309", result: "Brown → No starch" }, benedicts: { color: "#3b82f6", result: "Blue → No sugar", needsHeat: true }, biuret: { color: "#3b82f6", result: "Blue → No protein" }, ethanol: { color: "#fef3c7", result: "Milky → Lipid ✅" } },
  };

  const currentTest = reagent ? samples[sample]?.[reagent] : null;
  const showResult = currentTest && (!currentTest.needsHeat || heated);

  const reset = () => { setSample("starch"); setReagent(null); setHeated(false); setStep(0); };
  const steps = [
    "Select food sample", "Pour into test tube", "Add iodine for starch",
    "Observe color", "Record result", "Add Benedict's for sugars",
    "Heat test tube", "Observe color", "Record", "Add Biuret for protein",
    "Mix and observe", "Record", "Add ethanol for lipids", "Shake and add water", "Observe milky layer",
  ];

  const tubeRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (tubeRef.current && heated && currentTest?.needsHeat) {
      tubeRef.current.rotation.z = Math.sin(Date.now() * 0.01) * 0.03;
    }
  });

  return (
    <Simulation3DLayout
      title="Lab 3: Food Tests (3D)"
      objective="Test for biological molecules in food samples"
      theory="Iodine→starch, Benedict's→sugars, Biuret→protein, Ethanol→lipids."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Sample</p>
            {Object.keys(samples).map(s => (
              <label key={s} className="flex items-center gap-2 text-xs capitalize">
                <input type="radio" checked={sample === s} onChange={() => { setSample(s); setReagent(null); setHeated(false); }} className="accent-primary" /> {s}
              </label>
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Reagent</p>
            {["iodine", "benedicts", "biuret", "ethanol"].map(r => (
              <label key={r} className="flex items-center gap-2 text-xs capitalize">
                <input type="radio" checked={reagent === r} onChange={() => { setReagent(r); setHeated(false); }} className="accent-primary" />
                {r === "benedicts" ? "Benedict's" : r}
              </label>
            ))}
          </div>
          {currentTest?.needsHeat && (
            <Button size="sm" variant={heated ? "default" : "outline"} className="w-full text-xs" onClick={() => setHeated(true)}>
              🔥 Heat Test Tube
            </Button>
          )}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <group ref={tubeRef} position={[0, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.07, 0.6, 16, 1, true]} />
              <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.2} transmission={0.7} />
            </mesh>
            <mesh position={[0, -0.3, 0]}>
              <sphereGeometry args={[0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.25} />
            </mesh>
            {reagent && (
              <mesh position={[0, -0.08, 0]}>
                <cylinderGeometry args={[0.075, 0.065, 0.4, 16]} />
                <meshStandardMaterial color={showResult ? currentTest!.color : "#d4d4d8"} transparent opacity={0.6} />
              </mesh>
            )}
          </group>
          {heated && <Text position={[0, -0.55, 0.15]} fontSize={0.08} color="#ef4444" anchorX="center">🔥</Text>}
          {showResult && (
            <Text position={[0, 0.7, 0]} fontSize={0.07} color="#333" anchorX="center" fontWeight="bold" maxWidth={2}>
              {currentTest!.result}
            </Text>
          )}
          {!reagent && <Text position={[0, 0.5, 0]} fontSize={0.07} color="#999" anchorX="center">Select a reagent</Text>}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Sample</span><span className="font-bold capitalize">{sample}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Reagent</span><span className="font-bold capitalize">{reagent || "None"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Heated</span><span className="font-bold">{heated ? "Yes" : "No"}</span></div>
          {showResult && <div className="flex justify-between"><span className="text-muted-foreground">Result</span><span className="font-bold text-[10px]">{currentTest!.result}</span></div>}
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 4 — ENZYME ACTIVITY 3D
   ====================================================================== */
export function EnzymeActivity3D() {
  const [temp, setTemp] = useState(37);
  const [pH, setPH] = useState(7);
  const [substrate, setSubstrate] = useState(50);
  const [step, setStep] = useState(0);

  const tempFactor = Math.max(0, 1 - Math.pow((temp - 37) / 20, 2));
  const pHFactor = Math.max(0, 1 - Math.pow((pH - 7) / 4, 2));
  const substrateFactor = substrate / (substrate + 20);
  const rate = tempFactor * pHFactor * substrateFactor * 100;
  const denatured = temp > 60 || pH < 2 || pH > 12;

  const reset = () => { setTemp(37); setPH(7); setSubstrate(50); setStep(0); };
  const steps = [
    "Open enzyme simulation", "Set temperature to 20°C", "Add enzyme and substrate",
    "Start timer", "Observe reaction rate", "Record product formed",
    "Increase temperature", "Observe changes", "Record results",
    "Reset", "Adjust pH", "Observe activity", "Record results", "Plot graph",
  ];

  // Generate curve points
  const curvePoints: [number, number][] = [];
  for (let t = 0; t <= 80; t++) {
    const f = Math.max(0, 1 - Math.pow((t - 37) / 20, 2));
    curvePoints.push([t, f]);
  }

  return (
    <Simulation3DLayout
      title="Lab 4: Enzyme Activity (3D)"
      objective="Investigate factors affecting enzyme activity"
      theory="Enzymes have optimal temp (~37°C) and pH (~7). Beyond these, denaturation reduces activity."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Temperature: {temp}°C</p>
            <Slider value={[temp]} onValueChange={v => setTemp(v[0])} min={0} max={80} step={1} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">pH: {pH}</p>
            <Slider value={[pH]} onValueChange={v => setPH(v[0])} min={1} max={14} step={0.5} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Substrate: {substrate}%</p>
            <Slider value={[substrate]} onValueChange={v => setSubstrate(v[0])} min={0} max={100} step={5} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* 3D bar representing rate */}
          <group position={[0, -0.45, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.4, Math.max(0.02, rate * 0.015), 0.3]} />
              <meshStandardMaterial color={denatured ? "#ef4444" : "#22c55e"} transparent opacity={0.7} />
            </mesh>
            <Text position={[0, Math.max(0.02, rate * 0.015) / 2 + 0.1, 0.2]} fontSize={0.1} color={denatured ? "#ef4444" : "#22c55e"} anchorX="center" fontWeight="bold">
              {denatured ? "⚠️ DENATURED" : `${rate.toFixed(0)}%`}
            </Text>
          </group>
          {/* Temperature curve as 3D line */}
          <group position={[-1.2, -0.45, 0.5]}>
            {curvePoints.map(([t, f], i) => {
              if (i === 0) return null;
              const [pt, pf] = curvePoints[i - 1];
              return (
                <mesh key={i} position={[(t + pt) / 2 / 40, (f + pf) / 2 * 0.8, 0]}>
                  <boxGeometry args={[1 / 40, 0.01, 0.01]} />
                  <meshStandardMaterial color="#6366f1" transparent opacity={0.5} />
                </mesh>
              );
            })}
            {/* Current position marker */}
            <mesh position={[temp / 40, tempFactor * 0.8, 0]}>
              <sphereGeometry args={[0.03, 8, 6]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </group>
          {/* Enzyme-substrate visualization */}
          <group position={[0.8, 0.3, 0]}>
            {/* Enzyme */}
            <mesh castShadow>
              <torusGeometry args={[0.1, 0.04, 8, 16, denatured ? Math.PI * 2 : Math.PI * 1.5]} />
              <meshStandardMaterial color={denatured ? "#ef4444" : "#6366f1"} />
            </mesh>
            {/* Substrate */}
            {!denatured && (
              <mesh position={[0, 0.12, 0]} castShadow>
                <sphereGeometry args={[0.04, 8, 6]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
            )}
            <Text position={[0, -0.2, 0]} fontSize={0.04} color="#666" anchorX="center">
              {denatured ? "Shape lost" : "Active site"}
            </Text>
          </group>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span className="font-bold">{rate.toFixed(1)}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span className="font-bold">{temp}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">pH</span><span className="font-bold">{pH}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Substrate</span><span className="font-bold">{substrate}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`font-bold ${denatured ? "text-destructive" : ""}`}>{denatured ? "Denatured ⚠️" : "Active ✅"}</span></div>
        </div>
      }
    />
  );
}
