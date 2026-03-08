import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ======================================================================
   SHARED: 3D Food Test Simulation
   ====================================================================== */
function FoodTestSim3D({ title, objective, theory, reagent, positiveColor, negativeColor, positiveLabel, negativeLabel, steps: stepsArr }: {
  title: string; objective: string; theory: string; reagent: string;
  positiveColor: string; negativeColor: string; positiveLabel: string; negativeLabel: string; steps: string[];
}) {
  const [step, setStep] = useState(0);
  const [samplePlaced, setSamplePlaced] = useState(false);
  const [reagentAdded, setReagentAdded] = useState(false);
  const [shaken, setShaken] = useState(false);

  const positive = samplePlaced && reagentAdded && shaken;
  const tubeRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (tubeRef.current && shaken) {
      tubeRef.current.rotation.z = Math.sin(Date.now() * 0.015) * 0.05;
    }
  });

  const reset = () => { setStep(0); setSamplePlaced(false); setReagentAdded(false); setShaken(false); };

  return (
    <Simulation3DLayout
      title={title} objective={objective} theory={theory}
      onReset={reset} steps={stepsArr} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          <Button size="sm" variant={samplePlaced ? "default" : "outline"} className="w-full text-xs"
            onClick={() => { setSamplePlaced(true); if (step < 1) setStep(1); }}>
            {samplePlaced ? "✓ Sample Added" : "Add Food Sample"}
          </Button>
          <Button size="sm" variant={reagentAdded ? "default" : "outline"} className="w-full text-xs"
            onClick={() => { if (samplePlaced) { setReagentAdded(true); if (step < 2) setStep(2); } }}
            disabled={!samplePlaced}>
            {reagentAdded ? `✓ ${reagent} Added` : `Add ${reagent}`}
          </Button>
          <Button size="sm" variant={shaken ? "default" : "outline"} className="w-full text-xs"
            onClick={() => { if (reagentAdded) { setShaken(true); if (step < 4) setStep(4); } }}
            disabled={!reagentAdded}>
            {shaken ? "✓ Observed" : "Shake / Observe"}
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <group ref={tubeRef} position={[0, 0, 0]}>
            {/* Test tube glass */}
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.07, 0.6, 16, 1, true]} />
              <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.2} transmission={0.7} roughness={0.05} />
            </mesh>
            <mesh position={[0, -0.3, 0]}>
              <sphereGeometry args={[0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.25} />
            </mesh>
            {/* Liquid */}
            {samplePlaced && (
              <mesh position={[0, -0.08, 0]}>
                <cylinderGeometry args={[0.075, 0.065, 0.4, 16]} />
                <meshStandardMaterial color={positive ? positiveColor : negativeColor} transparent opacity={0.6} />
              </mesh>
            )}
          </group>
          {/* Reagent bottle */}
          {!reagentAdded && (
            <group position={[0.6, -0.2, 0.3]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.05, 0.06, 0.2, 12]} />
                <meshStandardMaterial color={positiveColor} transparent opacity={0.7} />
              </mesh>
              <Text position={[0, -0.02, 0.07]} fontSize={0.03} color="#333" anchorX="center">{reagent}</Text>
            </group>
          )}
          {positive && (
            <Text position={[0, 0.8, 0]} fontSize={0.08} color={positiveColor} anchorX="center" fontWeight="bold">
              {positiveLabel}
            </Text>
          )}
          {shaken && !positive && (
            <Text position={[0, 0.8, 0]} fontSize={0.08} color="#888" anchorX="center">
              {negativeLabel}
            </Text>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Sample</span><span className="font-bold">{samplePlaced ? "Added" : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Reagent</span><span className="font-bold">{reagentAdded ? reagent : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Result</span><span className="font-bold">{positive ? positiveLabel : "Pending"}</span></div>
        </div>
      }
    />
  );
}

/* LAB 7 — STARCH TEST 3D */
export function StarchTestLab3D() {
  return <FoodTestSim3D
    title="Lab: Test for Starch (3D)"
    objective="Test the presence of starch in food samples"
    theory="Iodine turns blue-black with starch due to the amylose helix structure."
    reagent="Iodine"
    positiveColor="#1e3a5f"
    negativeColor="#b8860b"
    positiveLabel="Blue-Black → Starch ✓"
    negativeLabel="No change"
    steps={["Place food sample", "Add iodine solution", "Observe color change", "Blue-black = starch", "Record observation"]}
  />;
}

/* LAB 8 — PROTEIN TEST 3D */
export function ProteinTestLab3D() {
  return <FoodTestSim3D
    title="Lab: Test for Protein (3D)"
    objective="Test the presence of protein in food samples"
    theory="Biuret reagent turns purple with peptide bonds in proteins."
    reagent="Biuret Reagent"
    positiveColor="#7c3aed"
    negativeColor="#93c5fd"
    positiveLabel="Purple → Protein ✓"
    negativeLabel="Blue (no protein)"
    steps={["Place food sample", "Add Biuret reagent", "Shake gently", "Observe color change", "Purple = protein", "Record results"]}
  />;
}

/* LAB 9 — LIPID TEST 3D */
export function LipidTestLab3D() {
  return <FoodTestSim3D
    title="Lab: Test for Lipids (3D)"
    objective="Test the presence of lipids in food samples"
    theory="Sudan III stains lipids red/orange. A red oil layer indicates fat."
    reagent="Sudan III"
    positiveColor="#ef4444"
    negativeColor="#fcd34d"
    positiveLabel="Red Layer → Lipid ✓"
    negativeLabel="No red layer"
    steps={["Place food sample", "Add Sudan III", "Shake the tube", "Observe red oil layer", "Record results"]}
  />;
}

/* ======================================================================
   LAB 10 — CO2 PRODUCTION TEST 3D
   ====================================================================== */
export function CO2ProductionTest3D() {
  const [step, setStep] = useState(0);
  const [blown, setBlown] = useState(false);

  const reset = () => { setStep(0); setBlown(false); };
  const steps = [
    "Prepare limewater tubes", "Blow air into Tube A",
    "Leave Tube B as control", "Observe color change",
    "Record which turns milky", "Conclude CO₂ in exhaled air",
  ];

  return (
    <Simulation3DLayout
      title="Lab: CO₂ Production Test (3D)"
      objective="Demonstrate that exhaled air contains carbon dioxide"
      theory="CO₂ turns limewater milky: CO₂ + Ca(OH)₂ → CaCO₃ + H₂O"
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          <Button size="sm" variant={blown ? "default" : "outline"} className="w-full text-xs"
            onClick={() => { setBlown(true); setStep(4); }}>
            {blown ? "✓ Air Blown" : "💨 Blow Into Tube A"}
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Tube A */}
          <group position={[-0.4, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.06, 0.05, 0.5, 16, 1, true]} />
              <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.2} transmission={0.7} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.055, 0.045, 0.3, 16]} />
              <meshStandardMaterial color={blown ? "#d4d4d8" : "#bfdbfe"} transparent opacity={blown ? 0.8 : 0.3} />
            </mesh>
            <Text position={[0, -0.45, 0.08]} fontSize={0.06} color="#333" anchorX="center" fontWeight="bold">Tube A</Text>
            {blown && <Text position={[0, 0.1, 0.08]} fontSize={0.05} color="#666" anchorX="center">Milky ☁️</Text>}
          </group>
          {/* Tube B */}
          <group position={[0.4, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.06, 0.05, 0.5, 16, 1, true]} />
              <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.2} transmission={0.7} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.055, 0.045, 0.3, 16]} />
              <meshStandardMaterial color="#bfdbfe" transparent opacity={0.3} />
            </mesh>
            <Text position={[0, -0.45, 0.08]} fontSize={0.06} color="#333" anchorX="center" fontWeight="bold">Tube B</Text>
            <Text position={[0, 0.1, 0.08]} fontSize={0.05} color="#999" anchorX="center">Clear</Text>
          </group>
          {/* Straw */}
          {!blown && (
            <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, 0.1]}>
              <cylinderGeometry args={[0.01, 0.01, 0.5, 8]} />
              <meshStandardMaterial color="#f5f5f0" />
            </mesh>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Tube A</span><span className="font-bold">{blown ? "Milky (CO₂)" : "Clear"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tube B</span><span className="font-bold">Clear (control)</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Conclusion</span><span className="font-bold text-[10px]">{blown ? "CO₂ present" : "—"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 11 — BREATHING RATE INVESTIGATION 3D
   ====================================================================== */
export function BreathingRateInvestigation3D() {
  const [step, setStep] = useState(0);
  const [resting, setResting] = useState(16);
  const [exercising, setExercising] = useState(false);
  const [exerciseRate, setExerciseRate] = useState<number | null>(null);

  const doExercise = () => {
    setExercising(true); setStep(3);
    setTimeout(() => {
      setExerciseRate(resting + 10 + Math.floor(Math.random() * 8));
      setExercising(false); setStep(4);
    }, 2000);
  };
  const reset = () => { setStep(0); setResting(16); setExerciseRate(null); setExercising(false); };

  const steps = [
    "Sit quietly and measure breathing rate", "Record breaths",
    "Exercise for 2 minutes", "Measure breathing rate again",
    "Compare results", "Explain why rate increased",
  ];

  return (
    <Simulation3DLayout
      title="Lab: Breathing Rate Investigation (3D)"
      objective="Compare breathing rates at rest and after exercise"
      theory="Exercise increases O₂ demand, so the body increases breathing rate."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Resting Rate: {resting} br/min</p>
            <Slider value={[resting]} onValueChange={v => { setResting(v[0]); if (step < 1) setStep(1); }} min={10} max={25} step={1} />
          </div>
          <Button size="sm" variant={exerciseRate ? "default" : "outline"} className="w-full text-xs"
            onClick={doExercise} disabled={exercising}>
            {exercising ? "🏃 Exercising..." : exerciseRate ? "✓ Done" : "🏃 Start Exercise"}
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Rest bar */}
          <group position={[-0.5, -0.45, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.4, resting * 0.05, 0.3]} />
              <meshStandardMaterial color="#6366f1" transparent opacity={0.6} />
            </mesh>
            <Text position={[0, resting * 0.025 + 0.1, 0.2]} fontSize={0.08} color="#6366f1" anchorX="center" fontWeight="bold">{resting}</Text>
            <Text position={[0, -0.1, 0.2]} fontSize={0.06} color="#666" anchorX="center">Rest</Text>
          </group>
          {/* Exercise bar */}
          {exerciseRate && (
            <group position={[0.5, -0.45, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.4, exerciseRate * 0.05, 0.3]} />
                <meshStandardMaterial color="#ef4444" transparent opacity={0.6} />
              </mesh>
              <Text position={[0, exerciseRate * 0.025 + 0.1, 0.2]} fontSize={0.08} color="#ef4444" anchorX="center" fontWeight="bold">{exerciseRate}</Text>
              <Text position={[0, -0.1, 0.2]} fontSize={0.06} color="#666" anchorX="center">Exercise</Text>
            </group>
          )}
          {exercising && (
            <Text position={[0.5, 0.5, 0]} fontSize={0.1} color="#f59e0b" anchorX="center">🏃 ...</Text>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Resting</span><span className="font-bold">{resting} br/min</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Exercise</span><span className="font-bold">{exerciseRate ?? "—"}{exerciseRate ? " br/min" : ""}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Increase</span><span className="font-bold">{exerciseRate ? `+${exerciseRate - resting}` : "—"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 12 — TRANSPIRATION 3D
   ====================================================================== */
export function TranspirationLab3D() {
  const [step, setStep] = useState(0);
  const [time, setTime] = useState(0);

  const pinkness = Math.min(1, time / 20);
  const reset = () => { setStep(0); setTime(0); };

  const steps = [
    "Place cobalt chloride paper on leaf", "Observe paper color",
    "Wait for some time", "Paper changes blue to pink",
    "Record result", "Conclude water vapor released",
  ];

  return (
    <Simulation3DLayout
      title="Lab: Transpiration (3D)"
      objective="Demonstrate water loss from leaves using cobalt chloride paper"
      theory="Cobalt chloride paper turns from blue to pink when exposed to moisture from transpiration."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Time: {time} min</p>
            <Slider value={[time]} onValueChange={v => { setTime(v[0]); if (step < 2) setStep(2); }} min={0} max={30} step={1} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Leaf */}
          <mesh position={[0, 0.2, 0]} rotation={[0.3, 0, 0]} castShadow>
            <planeGeometry args={[0.8, 0.5]} />
            <meshStandardMaterial color="#22c55e" side={THREE.DoubleSide} />
          </mesh>
          {/* Leaf veins */}
          <mesh position={[0, 0.21, 0.01]} rotation={[0.3, 0, 0]}>
            <planeGeometry args={[0.02, 0.45]} />
            <meshStandardMaterial color="#15803d" side={THREE.DoubleSide} />
          </mesh>
          {/* Cobalt chloride paper */}
          <mesh position={[0, 0.22, 0.02]} rotation={[0.3, 0, 0]} castShadow>
            <planeGeometry args={[0.3, 0.15]} />
            <meshStandardMaterial
              color={pinkness > 0.5 ? "#ec4899" : "#3b82f6"}
              side={THREE.DoubleSide}
              transparent
              opacity={0.8}
            />
          </mesh>
          <Text position={[0, 0.22, 0.15]} rotation={[0.3, 0, 0]} fontSize={0.04} color="#333" anchorX="center">
            CoCl₂ paper
          </Text>
          <Text position={[0, -0.3, 0.5]} fontSize={0.07} color="#666" anchorX="center">
            {pinkness > 0.5 ? "Pink → Water vapor detected!" : pinkness > 0 ? "Changing..." : "Blue (dry)"}
          </Text>
          {/* Moisture particles */}
          {time > 5 && Array.from({ length: Math.min(10, Math.floor(time / 3)) }).map((_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 0.4,
              0.3 + Math.random() * 0.3,
              (Math.random() - 0.5) * 0.2
            ]}>
              <sphereGeometry args={[0.008, 6, 4]} />
              <meshStandardMaterial color="#93c5fd" transparent opacity={0.4} />
            </mesh>
          ))}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-bold">{time} min</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Paper Color</span><span className="font-bold">{pinkness > 0.5 ? "Pink" : pinkness > 0 ? "Changing" : "Blue"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Moisture</span><span className="font-bold">{pinkness > 0.5 ? "Detected ✓" : "—"}</span></div>
        </div>
      }
    />
  );
}
