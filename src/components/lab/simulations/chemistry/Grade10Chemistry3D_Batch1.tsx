import { useState, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom, Beaker3D } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ═══ c10-1 Combination Reaction (Fe+S→FeS) 3D ═══ */
function CombinationScene({ progress }: { progress: number }) {
  const glowRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (glowRef.current && progress > 0.3 && progress < 0.8) glowRef.current.intensity = 1 + Math.sin(clock.getElapsedTime() * 8) * 0.5;
  });
  const mixColor = progress < 0.3 ? "#999" : progress < 0.7 ? "#cc6600" : "#222";
  return (
    <group>
      <LabRoom />
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.6, 12, 1, true]} />
        <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.25, 12]} />
        <meshStandardMaterial color={mixColor} />
      </mesh>
      {progress > 0.3 && progress < 0.8 && <pointLight ref={glowRef} position={[0, 0.05, 0.1]} color="#ff6622" intensity={1} distance={0.8} />}
      {progress > 0.7 && <Text position={[0, 0.6, 0]} fontSize={0.08} color="#44ff44">Fe + S → FeS</Text>}
      <Text position={[0, -0.5, 0]} fontSize={0.06} color="#888">{progress < 0.3 ? "Fe(grey) + S(yellow)" : progress < 0.7 ? "Glowing..." : "FeS (black)"}</Text>
    </group>
  );
}

export function CombinationReaction3D() {
  const [heated, setHeated] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const progress = heated ? Math.min(time / 30, 1) : 0;
  const reset = () => { setHeated(false); setTime(0); setStep(0); };
  const steps = ["Measure iron filings", "Add sulphur powder", "Mix thoroughly", "Apply heat", "Observe glow", "Cool & observe product", "Record observations"];
  return (
    <Simulation3DLayout title="Combination Reaction (Fe+S)" objective="Observe combination reaction forming iron sulfide"
      theory="Fe + S → FeS. Exothermic combination reaction." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <Button size="sm" className="w-full text-xs" onClick={() => setHeated(true)} disabled={heated}>{heated ? "🔥 Heating" : "🔥 Heat"}</Button>
        {heated && <div><label className="text-xs text-muted-foreground">Time: {time}s</label><Slider value={[time]} onValueChange={v => setTime(v[0])} min={0} max={60} step={1} /></div>}
      </div>}
      canvas3D={<CombinationScene progress={progress} />}
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Progress</span><span>{(progress * 100).toFixed(0)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Color</span><span>{progress < 0.3 ? "Grey+Yellow" : progress < 0.7 ? "Red glow" : "Black"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span>{progress > 0.7 ? "FeS" : "—"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-2 Decomposition of CuCO₃ 3D ═══ */
function DecompositionScene({ progress }: { progress: number }) {
  const solidColor = `rgb(${34 + (1 - progress) * 100}, ${139 - progress * 100}, ${34 - progress * 34})`;
  return (
    <group>
      <LabRoom />
      {/* Test tube with solid */}
      <mesh position={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.5, 12, 1, true]} />
        <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.3, -0.1, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.15, 12]} />
        <meshStandardMaterial color={solidColor} />
      </mesh>
      {/* Delivery tube */}
      <mesh position={[0.1, 0.15, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>
      {/* Limewater test tube */}
      <mesh position={[0.5, -0.1, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.4, 12, 1, true]} />
        <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.5, -0.15, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.15, 12]} />
        <meshStandardMaterial color={progress > 0.4 ? "#ffffff" : "#cccccc"} transparent opacity={progress > 0.4 ? 0.8 : 0.3} />
      </mesh>
      <Text position={[0.5, -0.4, 0]} fontSize={0.05} color="#888">{progress > 0.4 ? "Milky!" : "Limewater"}</Text>
      {/* Gas bubbles */}
      {progress > 0.2 && Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[0.5, -0.05 + i * 0.03, (Math.random() - 0.5) * 0.04]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshStandardMaterial color="#ddd" transparent opacity={0.4} />
        </mesh>
      ))}
      {/* Burner flame */}
      {progress > 0 && <mesh position={[-0.3, -0.45, 0]}>
        <coneGeometry args={[0.03, 0.1, 8]} />
        <meshStandardMaterial color="#ff6622" emissive="#ff4400" emissiveIntensity={0.8} transparent opacity={0.8} />
      </mesh>}
      <Text position={[0, 0.6, 0]} fontSize={0.07} color="#888">CuCO₃ → CuO + CO₂</Text>
    </group>
  );
}

export function DecompositionCuCO3_3D() {
  const [heating, setHeating] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const progress = heating ? Math.min(time / 40, 1) : 0;
  const reset = () => { setHeating(false); setTime(0); setStep(0); };
  const steps = ["Add CuCO₃ to test tube", "Connect delivery tube", "Heat strongly", "Observe color change", "Check limewater", "Record observations"];
  return (
    <Simulation3DLayout title="Decomposition of CuCO₃" objective="Observe thermal decomposition of copper carbonate"
      theory="CuCO₃ → CuO + CO₂. Green→black. CO₂ turns limewater milky." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <Button size="sm" className="w-full text-xs" onClick={() => setHeating(true)} disabled={heating}>{heating ? "🔥 Heating" : "🔥 Start"}</Button>
        {heating && <div><label className="text-xs text-muted-foreground">Time: {time}s</label><Slider value={[time]} onValueChange={v => setTime(v[0])} min={0} max={60} step={1} /></div>}
      </div>}
      canvas3D={<DecompositionScene progress={progress} />}
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Progress</span><span>{(progress * 100).toFixed(0)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Solid</span><span>{progress > 0.6 ? "Black (CuO)" : "Green"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Limewater</span><span>{progress > 0.4 ? "Milky ✓" : "Clear"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Gas</span><span>{progress > 0.2 ? "CO₂" : "—"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-3 Single Displacement (Fe+CuSO₄) 3D ═══ */
function SingleDisplacementScene({ progress }: { progress: number }) {
  const solutionColor = new THREE.Color().lerpColors(new THREE.Color("#3366ff"), new THREE.Color("#44aa44"), progress);
  return (
    <group>
      <LabRoom />
      <Beaker3D position={[0, -0.1, 0]} scale={1.8} liquidColor={`#${solutionColor.getHexString()}`} liquidLevel={0.7} />
      {/* Iron nail */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.03, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
      {/* Copper deposits on nail */}
      {progress > 0.1 && Array.from({ length: Math.floor(progress * 12) }, (_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 0.03, -0.1 + i * 0.03, (Math.random() - 0.5) * 0.03]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshStandardMaterial color="#b87333" metalness={0.9} />
        </mesh>
      ))}
      <Text position={[0, 0.7, 0]} fontSize={0.07} color="#888">{progress < 0.3 ? "Blue CuSO₄" : progress < 0.7 ? "Turning green..." : "Green FeSO₄"}</Text>
    </group>
  );
}

export function SingleDisplacement3D() {
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const progress = Math.min(time / 60, 1);
  const reset = () => { setTime(0); setStep(0); };
  const steps = ["Pour CuSO₄ solution", "Clean iron nail", "Immerse nail", "Wait 10-15 min", "Observe changes", "Remove nail", "Record observations"];
  return (
    <Simulation3DLayout title="Single Displacement (Fe+CuSO₄)" objective="Demonstrate displacement reaction"
      theory="Fe + CuSO₄ → FeSO₄ + Cu. Iron displaces copper." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <div><label className="text-xs text-muted-foreground">Time: {time}s</label><Slider value={[time]} onValueChange={v => setTime(v[0])} min={0} max={120} step={5} /></div>
      </div>}
      canvas3D={<SingleDisplacementScene progress={progress} />}
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{time}s</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Cu deposited</span><span>{(progress * 100).toFixed(0)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Solution</span><span>{progress < 0.3 ? "Blue" : progress < 0.7 ? "Blue-Green" : "Green"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-4 Double Displacement 3D ═══ */
function DoubleDisplacementScene({ mixed, settled }: { mixed: boolean; settled: boolean }) {
  const precipitateRef = useRef<THREE.Mesh[]>([]);
  useFrame(() => {
    if (mixed && !settled) {
      precipitateRef.current.forEach((m, i) => {
        if (m) m.position.y = Math.max(m.position.y - 0.001, -0.3);
      });
    }
  });
  return (
    <group>
      <LabRoom />
      {!mixed ? (
        <>
          <Beaker3D position={[-0.5, -0.2, 0]} scale={1.2} liquidColor="#6688ff" liquidLevel={0.5} />
          <Text position={[-0.5, -0.55, 0]} fontSize={0.05} color="#888">Na₂SO₄</Text>
          <Beaker3D position={[0.5, -0.2, 0]} scale={1.2} liquidColor="#88aacc" liquidLevel={0.5} />
          <Text position={[0.5, -0.55, 0]} fontSize={0.05} color="#888">Ba(NO₃)₂</Text>
        </>
      ) : (
        <>
          <Beaker3D position={[0, -0.1, 0]} scale={1.8} liquidColor="#aabbcc" liquidLevel={0.7} />
          {/* Precipitate particles */}
          {Array.from({ length: 12 }, (_, i) => (
            <mesh key={i} ref={el => { if (el) precipitateRef.current[i] = el; }}
              position={[(Math.random() - 0.5) * 0.2, settled ? -0.3 : -0.1 + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.2]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>
          ))}
          <Text position={[0, 0.6, 0]} fontSize={0.07} color="#888">{settled ? "White precipitate settled" : "Precipitate forming..."}</Text>
        </>
      )}
    </group>
  );
}

export function DoubleDisplacement3D() {
  const [mixed, setMixed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const reset = () => { setMixed(false); setSettled(false); setStep(0); };
  const steps = ["Prepare Na₂SO₄ solution", "Prepare Ba(NO₃)₂", "Mix solutions", "Observe precipitate", "Let settle", "Record observations"];
  return (
    <Simulation3DLayout title="Double Displacement Reaction" objective="Observe precipitate formation"
      theory="Na₂SO₄ + Ba(NO₃)₂ → BaSO₄↓ + 2NaNO₃" onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <Button size="sm" className="w-full text-xs" onClick={() => setMixed(true)} disabled={mixed}>{mixed ? "Mixed ✅" : "Mix Solutions"}</Button>
        {mixed && <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setSettled(true)} disabled={settled}>{settled ? "Settled ✅" : "Let Settle"}</Button>}
      </div>}
      canvas3D={<DoubleDisplacementScene mixed={mixed} settled={settled} />}
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{!mixed ? "Separate" : settled ? "Settled" : "Reacting"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Precipitate</span><span>{mixed ? "BaSO₄ (white)" : "—"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Filtrate</span><span>{mixed ? "NaNO₃" : "—"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-5 Standard Solution 3D ═══ */
export function StandardSolution3D() {
  const [measuredMass, setMeasuredMass] = useState(0);
  const [waterLevel, setWaterLevel] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const targetMass = 10;
  const concentration = waterLevel > 0 && measuredMass > 0 ? (measuredMass / 58.44) / (waterLevel / 1000) : 0;
  const reset = () => { setMeasuredMass(0); setWaterLevel(0); setStep(0); };
  const steps = ["Weigh solute", "Transfer to flask", "Add water", "Dissolve completely", "Fill to mark", "Label solution"];
  return (
    <Simulation3DLayout title="Standard Solution Preparation" objective="Prepare a solution of known concentration"
      theory="Concentration (mol/L) = moles / volume(L). Standard solution has precisely known concentration." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <div><label className="text-xs text-muted-foreground">Mass (NaCl): {measuredMass.toFixed(1)} g</label><Slider value={[measuredMass]} onValueChange={v => setMeasuredMass(v[0])} min={0} max={40} step={0.1} /></div>
        <div><label className="text-xs text-muted-foreground">Water: {waterLevel} mL</label><Slider value={[waterLevel]} onValueChange={v => setWaterLevel(v[0])} min={0} max={300} step={5} /></div>
        {Math.abs(measuredMass - targetMass) > 2 && measuredMass > 0 && <p className="text-[10px] text-destructive">⚠️ Mass off by {Math.abs(measuredMass - targetMass).toFixed(1)}g</p>}
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          {/* Volumetric flask shape */}
          <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.04, 0.04, 0.4, 12]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.2, 0]}><sphereGeometry args={[0.3, 24, 24]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
          {waterLevel > 0 && <mesh position={[0, -0.2, 0]}><sphereGeometry args={[0.28 * Math.min(waterLevel / 250, 1), 24, 24]} /><meshStandardMaterial color="#4488ff" transparent opacity={0.3} /></mesh>}
          {/* 250mL mark */}
          <mesh position={[0, 0.02, 0.31]} rotation={[0, 0, 0]}><planeGeometry args={[0.08, 0.003]} /><meshStandardMaterial color="#ff4444" /></mesh>
          <Text position={[0.2, 0.02, 0.3]} fontSize={0.04} color="#ff4444">250mL</Text>
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Mass</span><span>{measuredMass.toFixed(1)} g</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Volume</span><span>{waterLevel} mL</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Conc.</span><span>{isFinite(concentration) && concentration > 0 ? concentration.toFixed(4) : "—"} mol/L</span></div>
      </div>}
    />
  );
}

/* ═══ c10-6 Dilution 3D ═══ */
export function DilutionLab3D() {
  const [m1, setM1] = useState(1.0);
  const [v1, setV1] = useState(10);
  const [v2, setV2] = useState(100);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const m2 = (m1 * v1) / v2;
  const reset = () => { setM1(1.0); setV1(10); setV2(100); setStep(0); };
  const steps = ["Measure stock solution", "Transfer to flask", "Add distilled water", "Fill to mark", "Mix well", "Record concentration"];
  return (
    <Simulation3DLayout title="Dilution of a Solution" objective="Prepare dilute solution from concentrated one"
      theory="M₁V₁ = M₂V₂. Solute stays constant, concentration decreases." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <div><label className="text-xs text-muted-foreground">Stock M₁: {m1.toFixed(1)} M</label><Slider value={[m1]} onValueChange={v => setM1(v[0])} min={0.1} max={5} step={0.1} /></div>
        <div><label className="text-xs text-muted-foreground">V₁: {v1} mL</label><Slider value={[v1]} onValueChange={v => setV1(v[0])} min={1} max={50} step={1} /></div>
        <div><label className="text-xs text-muted-foreground">V₂: {v2} mL</label><Slider value={[v2]} onValueChange={v => setV2(v[0])} min={50} max={500} step={10} /></div>
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          {/* Stock bottle */}
          <group position={[-0.8, -0.2, 0]}>
            <mesh><cylinderGeometry args={[0.1, 0.12, 0.4, 12]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>
            <mesh position={[0, -0.05, 0]}><cylinderGeometry args={[0.09, 0.11, 0.25, 12]} /><meshStandardMaterial color="#4466ff" transparent opacity={0.6} /></mesh>
            <Text position={[0, -0.3, 0.13]} fontSize={0.05} color="#888">Stock {m1}M</Text>
          </group>
          {/* Arrow */}
          <Text position={[-0.3, 0, 0]} fontSize={0.15} color="#888">→</Text>
          {/* Diluted flask */}
          <group position={[0.4, -0.2, 0]}>
            <mesh><sphereGeometry args={[0.3, 24, 24]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
            <mesh><sphereGeometry args={[0.25, 24, 24]} /><meshStandardMaterial color="#4466ff" transparent opacity={Math.max(0.1, v1 / v2 * 0.6)} /></mesh>
            <Text position={[0, -0.4, 0.3]} fontSize={0.05} color="#888">Diluted {m2.toFixed(4)}M</Text>
          </group>
          <Text position={[0, 0.8, 0]} fontSize={0.1} color="#eee">M₁V₁ = M₂V₂</Text>
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">M₁</span><span>{m1.toFixed(2)} M</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">V₁</span><span>{v1} mL</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">V₂</span><span>{v2} mL</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">M₂</span><span>{m2.toFixed(4)} M</span></div>
      </div>}
    />
  );
}
