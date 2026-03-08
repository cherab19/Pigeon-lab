import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom, Beaker3D } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ════════════════════════════════════════════════════════════
   c9-6  Conservation of Mass 3D
   ════════════════════════════════════════════════════════════ */
function ConservationScene({ reacted, chamberOpen }: { reacted: boolean; chamberOpen: boolean }) {
  const gasRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    if (!chamberOpen || !reacted) return;
    gasRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.y += 0.005;
      if (mesh.position.y > 2) mesh.position.y = 0.5;
      mesh.material = mesh.material as THREE.MeshStandardMaterial;
      (mesh.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 0.5 - mesh.position.y * 0.2);
    });
  });

  return (
    <group>
      <LabRoom />
      {/* Reaction chamber */}
      <group position={[0, -0.1, 0]}>
        {/* Container walls */}
        <mesh>
          <boxGeometry args={[0.8, 0.6, 0.5]} />
          <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} side={THREE.DoubleSide} transmission={0.6} />
        </mesh>
        {/* Lid */}
        <mesh position={[0, chamberOpen ? 0.5 : 0.3, 0]}>
          <boxGeometry args={[0.82, 0.04, 0.52]} />
          <meshStandardMaterial color="#888" metalness={0.7} />
        </mesh>

        {/* Reactants / products */}
        {!reacted ? (
          <>
            <mesh position={[-0.15, -0.15, 0]}><sphereGeometry args={[0.08, 12, 12]} /><meshStandardMaterial color="#ff6644" /></mesh>
            <mesh position={[0.15, -0.15, 0]}><sphereGeometry args={[0.08, 12, 12]} /><meshStandardMaterial color="#4488ff" /></mesh>
          </>
        ) : (
          <>
            <mesh position={[0, -0.15, 0]}><sphereGeometry args={[0.1, 12, 12]} /><meshStandardMaterial color="#aa44ff" /></mesh>
            {/* Gas particles */}
            {chamberOpen && Array.from({ length: 6 }, (_, i) => (
              <mesh key={i} ref={el => { if (el) gasRefs.current[i] = el; }} position={[(Math.random() - 0.5) * 0.4, 0.3 + i * 0.1, (Math.random() - 0.5) * 0.2]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial color="#aabbcc" transparent opacity={0.4} />
              </mesh>
            ))}
          </>
        )}
      </group>

      {/* Digital balance */}
      <group position={[0, -0.6, 0]}>
        <mesh><boxGeometry args={[1, 0.05, 0.6]} /><meshStandardMaterial color="#ddd" /></mesh>
        <Text position={[0, 0.05, 0.2]} fontSize={0.08} color="#44ff44">
          {(150 - (chamberOpen && reacted ? 2.3 : 0)).toFixed(1)} g
        </Text>
      </group>

      <Text position={[0, 1, 0]} fontSize={0.08} color={chamberOpen && reacted ? "#ff4444" : "#44ff44"}>
        {chamberOpen && reacted ? "Mass decreased — gas escaped!" : reacted ? "Mass conserved ✅" : "Ready"}
      </Text>
    </group>
  );
}

export function ConservationOfMass3D() {
  const [chamberOpen, setChamberOpen] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const massBefore = 150.0;
  const gasLoss = chamberOpen && reacted ? 2.3 : 0;
  const massAfter = massBefore - gasLoss;

  const reset = () => { setChamberOpen(false); setReacted(false); setStep(0); };
  const steps = ["Place reactants in chamber", "Record initial mass", "Seal the chamber", "Start reaction", "Record final mass", "Compare masses", "Open chamber lid", "Observe gas escape", "Record mass change"];

  return (
    <Simulation3DLayout
      title="Conservation of Mass"
      objective="Verify that mass is conserved in closed systems"
      theory="Closed system: mass before = mass after. Open system: gas escape → apparent mass loss."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <Button size="sm" className="w-full text-xs" onClick={() => setReacted(true)} disabled={reacted}>
            {reacted ? "Reacted ✅" : "Start Reaction"}
          </Button>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={chamberOpen} onChange={e => setChamberOpen(e.target.checked)} disabled={!reacted} />
            Open Chamber Lid
          </label>
          <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            <p className="font-semibold">Closed: mass conserved</p>
            <p>Open: gas escapes → mass ↓</p>
          </div>
        </div>
      }
      canvas3D={<ConservationScene reacted={reacted} chamberOpen={chamberOpen} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Before</span><span>{massBefore.toFixed(1)} g</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">After</span><span>{massAfter.toFixed(1)} g</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Chamber</span><span>{chamberOpen ? "Open" : "Sealed"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Gas Lost</span><span>{gasLoss.toFixed(1)} g</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Conserved?</span><span>{!chamberOpen || !reacted ? "Yes ✅" : "No ⚠️"}</span></div>
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   c9-7  Solutions & Dissolving 3D
   ════════════════════════════════════════════════════════════ */
function SolutionsScene({ soluteAmount, temperature, stirring, maxSolubility }: {
  soluteAmount: number; temperature: number; stirring: boolean; maxSolubility: number;
}) {
  const stirRef = useRef<THREE.Mesh>(null);
  const dissolvedAmount = Math.min(soluteAmount, maxSolubility);
  const undissolved = Math.max(0, soluteAmount - maxSolubility);

  useFrame(({ clock }) => {
    if (stirRef.current && stirring) {
      stirRef.current.rotation.y = clock.getElapsedTime() * 5;
    }
  });

  const concentration = Math.min(dissolvedAmount / maxSolubility, 1);

  return (
    <group>
      <LabRoom />
      {/* Beaker */}
      <Beaker3D position={[0, -0.1, 0]} scale={1.8} liquidColor={`rgb(${53 + concentration * 100}, ${130 - concentration * 50}, ${246 - concentration * 100})`} liquidLevel={0.7} />

      {/* Dissolved particles */}
      {dissolvedAmount > 0 && Array.from({ length: Math.min(Math.floor(dissolvedAmount / 3), 20) }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const r = 0.1 + (i % 5) * 0.04;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, -0.2 + (i % 4) * 0.08, Math.sin(angle) * r]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
        );
      })}

      {/* Undissolved at bottom */}
      {undissolved > 0 && (
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[Math.min(undissolved * 0.003, 0.15), Math.min(undissolved * 0.003, 0.15), 0.05, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
      )}

      {/* Stirring rod */}
      {stirring && (
        <mesh ref={stirRef} position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
          <meshStandardMaterial color="#aaa" metalness={0.7} />
        </mesh>
      )}

      {/* Thermometer */}
      <group position={[0.3, 0.1, 0.15]}>
        <mesh><cylinderGeometry args={[0.01, 0.01, 0.5, 8]} /><meshStandardMaterial color="#ddd" /></mesh>
        <Text position={[0, 0.3, 0.02]} fontSize={0.05} color="#ff4444">{temperature}°C</Text>
      </group>
    </group>
  );
}

export function SolutionsLab3D() {
  const [soluteAmount, setSoluteAmount] = useState(0);
  const [temperature, setTemperature] = useState(25);
  const [stirring, setStirring] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const maxSolubility = 36 + (temperature - 25) * 0.5;
  const dissolvedAmount = Math.min(soluteAmount, maxSolubility);
  const undissolved = Math.max(0, soluteAmount - maxSolubility);
  const concentration = soluteAmount;
  const saturationPct = Math.min((soluteAmount / maxSolubility) * 100, 100);
  const isSaturated = soluteAmount >= maxSolubility;

  const reset = () => { setSoluteAmount(0); setTemperature(25); setStirring(false); setStep(0); };
  const steps = ["Add water to beaker", "Add solute powder", "Stir mixture", "Observe dissolving", "Add more solute", "Watch saturation", "Increase temperature", "Record concentration"];

  return (
    <Simulation3DLayout
      title="Solutions & Dissolving"
      objective="Understand dissolving, concentration, and saturation"
      theory="Solubility increases with temperature for most solids. Concentration = mass solute / volume solvent."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Solute: {soluteAmount} g</label><Slider value={[soluteAmount]} onValueChange={v => setSoluteAmount(v[0])} min={0} max={80} step={1} /></div>
          <div><label className="text-xs text-muted-foreground">Temp: {temperature}°C</label><Slider value={[temperature]} onValueChange={v => setTemperature(v[0])} min={10} max={90} step={1} /></div>
          <Button size="sm" className="w-full text-xs" variant={stirring ? "default" : "outline"} onClick={() => setStirring(!stirring)}>
            {stirring ? "⏸ Stop Stirring" : "🥄 Stir"}
          </Button>
          <div className="p-2 bg-muted/50 rounded text-xs">
            <p className="text-muted-foreground font-semibold">Saturation</p>
            <div className="w-full h-1.5 bg-muted rounded-full mt-1">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${saturationPct}%`, backgroundColor: isSaturated ? "hsl(var(--destructive))" : "hsl(var(--primary))" }} />
            </div>
            <p className="mt-1">{isSaturated ? "Saturated! ⚠️" : `${saturationPct.toFixed(0)}%`}</p>
          </div>
        </div>
      }
      canvas3D={<SolutionsScene soluteAmount={soluteAmount} temperature={temperature} stirring={stirring} maxSolubility={maxSolubility} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Added</span><span>{soluteAmount} g</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Dissolved</span><span>{dissolvedAmount.toFixed(1)} g</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Undissolved</span><span>{undissolved.toFixed(1)} g</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Conc.</span><span>{concentration.toFixed(1)} g/L</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Max Sol.</span><span>{maxSolubility.toFixed(1)} g</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Saturated</span><span>{isSaturated ? "Yes ⚠️" : "No"}</span></div>
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   c9-8  Acids, Bases & Salts 3D
   ════════════════════════════════════════════════════════════ */
function AcidsBasesScene({ solution, mixed, ph }: { solution: string; mixed: boolean; ph: number }) {
  const litmusColor = ph < 7 ? "#ff4444" : ph > 7 ? "#4444ff" : "#44cc44";
  const liquidColor = ph < 7 ? "#ff666640" : ph > 7 ? "#4466ff40" : "#44cc4440";

  return (
    <group>
      <LabRoom />
      {/* Test tubes in rack */}
      <group position={[-0.4, -0.2, 0]}>
        {/* Rack */}
        <mesh position={[0, -0.25, 0]}><boxGeometry args={[0.8, 0.04, 0.15]} /><meshStandardMaterial color="#8B7355" /></mesh>

        {/* Acid tube */}
        <group position={[-0.2, 0, 0]}>
          <mesh><cylinderGeometry args={[0.04, 0.035, 0.4, 12, 1, true]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.08, 0]}><cylinderGeometry args={[0.035, 0.035, 0.2, 12]} /><meshStandardMaterial color="#ff4444" transparent opacity={0.3} /></mesh>
          <Text position={[0, -0.3, 0.05]} fontSize={0.04} color="#ff4444">HCl</Text>
        </group>

        {/* Base tube */}
        <group position={[0.2, 0, 0]}>
          <mesh><cylinderGeometry args={[0.04, 0.035, 0.4, 12, 1, true]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.08, 0]}><cylinderGeometry args={[0.035, 0.035, 0.2, 12]} /><meshStandardMaterial color="#4444ff" transparent opacity={0.3} /></mesh>
          <Text position={[0, -0.3, 0.05]} fontSize={0.04} color="#4444ff">NaOH</Text>
        </group>

        {/* Mixed tube */}
        {mixed && (
          <group position={[0.5, 0, 0]}>
            <mesh><cylinderGeometry args={[0.04, 0.035, 0.4, 12, 1, true]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>
            <mesh position={[0, -0.08, 0]}><cylinderGeometry args={[0.035, 0.035, 0.2, 12]} /><meshStandardMaterial color="#44cc44" transparent opacity={0.3} /></mesh>
            <Text position={[0, -0.3, 0.05]} fontSize={0.04} color="#44cc44">NaCl</Text>
          </group>
        )}
      </group>

      {/* Litmus paper */}
      <group position={[0.8, 0, 0]}>
        <mesh><boxGeometry args={[0.04, 0.25, 0.01]} /><meshStandardMaterial color={litmusColor} /></mesh>
        <Text position={[0, -0.18, 0.02]} fontSize={0.04} color="#888">Litmus</Text>
      </group>

      {/* pH meter display */}
      <group position={[1.2, 0.3, 0]}>
        <mesh><boxGeometry args={[0.3, 0.4, 0.05]} /><meshStandardMaterial color="#333" /></mesh>
        <Text position={[0, 0.05, 0.03]} fontSize={0.1} color="#44ff44">{ph.toFixed(1)}</Text>
        <Text position={[0, -0.12, 0.03]} fontSize={0.04} color="#888">pH</Text>
      </group>

      <Text position={[0, 1, 0]} fontSize={0.08} color={litmusColor}>
        {ph < 7 ? "Acidic" : ph > 7 ? "Basic" : "Neutral"}
      </Text>
    </group>
  );
}

export function AcidsBasesLab3D() {
  const [solution, setSolution] = useState<"acid" | "base" | "neutral">("acid");
  const [mixed, setMixed] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const phValues = { acid: 2.5, base: 12.0, neutral: 7.0 };
  const ph = mixed ? 7.2 : phValues[solution];

  const reset = () => { setSolution("acid"); setMixed(false); setStep(0); };
  const steps = ["Select acid solution", "Dip litmus paper", "Read pH meter", "Select base solution", "Observe color change", "Mix acid + base", "Observe neutralization", "Record pH values"];

  return (
    <Simulation3DLayout
      title="Acids, Bases & Salts"
      objective="Identify acids and bases using indicators and pH meter"
      theory="Acids: pH<7, red litmus. Bases: pH>7, blue litmus. Neutralization: Acid+Base → Salt+Water."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Solution</p>
          {(["acid", "base", "neutral"] as const).map(s => (
            <label key={s} className="flex items-center gap-2 text-xs">
              <input type="radio" name="sol" checked={solution === s && !mixed} onChange={() => { setSolution(s); setMixed(false); }} />
              {s === "acid" ? "HCl" : s === "base" ? "NaOH" : "Water"}
            </label>
          ))}
          <Button size="sm" className="w-full text-xs" onClick={() => setMixed(true)} disabled={mixed}>
            {mixed ? "Neutralized ✅" : "Mix Acid + Base"}
          </Button>
        </div>
      }
      canvas3D={<AcidsBasesScene solution={solution} mixed={mixed} ph={ph} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Solution</span><span>{mixed ? "Mixture" : solution}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">pH</span><span>{ph.toFixed(1)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Nature</span><span>{ph < 7 ? "Acidic" : ph > 7 ? "Basic" : "Neutral"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Litmus</span><span>{ph < 7 ? "Red" : ph > 7 ? "Blue" : "Green"}</span></div>
          {mixed && <div className="flex justify-between"><span className="text-muted-foreground">Eqn</span><span className="text-[9px]">HCl+NaOH→NaCl+H₂O</span></div>}
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   c9-9  Metals & Non-Metals 3D
   ════════════════════════════════════════════════════════════ */
function MetalsScene({ metal, dropped, gasCollected, splintTest }: {
  metal: string; dropped: boolean; gasCollected: number; splintTest: boolean;
}) {
  const reactivity: Record<string, number> = { Mg: 4, Zn: 3, Fe: 2, Cu: 0 };
  const rate = reactivity[metal] || 0;
  const reacts = rate > 0;
  const bubblesRef = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    if (!dropped || !reacts || gasCollected >= 100) return;
    bubblesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.y += 0.008 * rate;
      if (mesh.position.y > 0.5) mesh.position.y = -0.2;
      (mesh.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 0.6 - mesh.position.y * 0.5);
    });
  });

  const metalColor = metal === "Cu" ? "#b87333" : metal === "Mg" ? "#cccccc" : "#888888";

  return (
    <group>
      <LabRoom />
      {/* Beaker with HCl */}
      <Beaker3D position={[0, -0.1, 0]} scale={1.8} liquidColor="#aaffaa" liquidLevel={0.7} />

      {/* Metal strip */}
      {dropped && (
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.05, 0.3, 0.02]} />
          <meshStandardMaterial color={metalColor} metalness={0.8} roughness={0.2} />
        </mesh>
      )}

      {/* Bubbles */}
      {dropped && reacts && gasCollected < 100 && Array.from({ length: rate * 3 }, (_, i) => (
        <mesh key={i} ref={el => { if (el) bubblesRef.current[i] = el; }} position={[(Math.random() - 0.5) * 0.1, -0.2 + i * 0.05, (Math.random() - 0.5) * 0.1]}>
          <sphereGeometry args={[0.012 + Math.random() * 0.008, 8, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Gas collection tube */}
      <group position={[0.6, 0.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 12, 1, true]} />
          <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
        {gasCollected > 0 && (
          <mesh position={[0, 0.2 - (gasCollected / 100) * 0.2, 0]}>
            <cylinderGeometry args={[0.055, 0.055, (gasCollected / 100) * 0.4, 12]} />
            <meshStandardMaterial color="#ddeeff" transparent opacity={0.2} />
          </mesh>
        )}
        <Text position={[0, -0.25, 0.07]} fontSize={0.04} color="#888">{gasCollected.toFixed(0)}% H₂</Text>
      </group>

      {/* Splint test */}
      {splintTest && reacts && (
        <group position={[0.6, 0.5, 0]}>
          <mesh><boxGeometry args={[0.01, 0.15, 0.01]} /><meshStandardMaterial color="#8B4513" /></mesh>
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#ff6622" emissive="#ff4400" emissiveIntensity={1} />
          </mesh>
          <Text position={[0, 0.15, 0]} fontSize={0.05} color="#ff6622">Pop! 💥</Text>
        </group>
      )}

      {!reacts && dropped && <Text position={[0, 0.8, 0]} fontSize={0.08} color="#ff4444">Cu does not react with HCl</Text>}

      <Text position={[-0.8, -0.3, 0.4]} fontSize={0.06} color="#888">HCl (aq)</Text>
    </group>
  );
}

export function MetalsNonMetals3D() {
  const [metal, setMetal] = useState<"Mg" | "Zn" | "Fe" | "Cu">("Zn");
  const [dropped, setDropped] = useState(false);
  const [gasCollected, setGasCollected] = useState(0);
  const [splintTest, setSplintTest] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound, playPop } = useSoundEffects();

  const reactivity: Record<string, number> = { Mg: 4, Zn: 3, Fe: 2, Cu: 0 };
  const rate = reactivity[metal];
  const reacts = rate > 0;

  useEffect(() => {
    if (!dropped || !reacts) return;
    const interval = setInterval(() => {
      setGasCollected(g => { if (g >= 100) return 100; return g + rate * 2; });
    }, 200);
    return () => clearInterval(interval);
  }, [dropped, reacts, rate]);

  const reset = () => { setMetal("Zn"); setDropped(false); setGasCollected(0); setSplintTest(false); setStep(0); };
  const steps = ["Select metal", "Drop into HCl", "Observe bubbles", "Collect gas", "Burning splint test", "Observe pop (H₂)", "Try different metals", "Compare reactivity"];

  const handleSplint = () => { setSplintTest(true); playPop(); };

  return (
    <Simulation3DLayout
      title="Metals & Non-Metals"
      objective="Observe reactions of metals with acids"
      theory="Metal + HCl → Metal Chloride + H₂. Reactivity: Mg > Zn > Fe > Cu (no reaction)."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Metal</p>
          {(["Mg", "Zn", "Fe", "Cu"] as const).map(m => (
            <label key={m} className="flex items-center gap-2 text-xs">
              <input type="radio" name="metal" checked={metal === m} onChange={() => { setMetal(m); setDropped(false); setGasCollected(0); setSplintTest(false); }} />
              {m}
            </label>
          ))}
          <Button size="sm" className="w-full text-xs" onClick={() => setDropped(true)} disabled={dropped}>
            {dropped ? "Added ✅" : `Drop ${metal}`}
          </Button>
          {gasCollected >= 50 && reacts && (
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={handleSplint} disabled={splintTest}>
              {splintTest ? "Pop! 💥" : "🔥 Splint Test"}
            </Button>
          )}
          <div className="p-2 bg-muted/50 rounded text-xs space-y-0.5">
            <p className="font-semibold text-muted-foreground">Reactivity</p>
            {["Mg", "Zn", "Fe", "Cu"].map(m => (
              <div key={m} className="flex items-center gap-1">
                <div className="h-1 rounded-full" style={{ width: `${reactivity[m] * 25}%`, backgroundColor: metal === m ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", opacity: metal === m ? 1 : 0.3 }} />
                <span className={`text-[10px] ${metal === m ? "font-bold text-primary" : "text-muted-foreground"}`}>{m}</span>
              </div>
            ))}
          </div>
        </div>
      }
      canvas3D={<MetalsScene metal={metal} dropped={dropped} gasCollected={gasCollected} splintTest={splintTest} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Metal</span><span>{metal}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Reacts?</span><span>{reacts ? "Yes" : "No"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Gas</span><span>{gasCollected.toFixed(0)}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span>{reacts ? `${metal}Cl₂` : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">H₂ Test</span><span>{splintTest && reacts ? "Pop! ✅" : "—"}</span></div>
        </div>
      }
    />
  );
}
