import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom, Beaker3D } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ==================== 11. Catalyst Simulation 3D ==================== */

function CatalystScene({ catalyst, temp }: { catalyst: boolean; temp: number }) {
  const activationE = catalyst ? 40 : 75;

  // Energy profile as 3D curve
  const curvePoints: [number, number, number][] = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const x = -1.5 + t * 3;
    const baseY = -0.5;
    const peak = activationE / 50;
    const y = baseY + peak * Math.exp(-(((t - 0.45) * 5) ** 2));
    if (t > 0.7) {
      const productDrop = (t - 0.7) * 0.5;
      curvePoints.push([x, y - productDrop, 0]);
    } else {
      curvePoints.push([x, y, 0]);
    }
  }

  // Uncatalyzed curve (always show dashed via separate line)
  const uncatPoints: [number, number, number][] = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const x = -1.5 + t * 3;
    const baseY = -0.5;
    const peak = 75 / 50;
    const y = baseY + peak * Math.exp(-(((t - 0.45) * 5) ** 2));
    if (t > 0.7) {
      uncatPoints.push([x, y - (t - 0.7) * 0.5, 0]);
    } else {
      uncatPoints.push([x, y, 0]);
    }
  }

  return (
    <group>
      <LabRoom />
      {/* Energy profile - uncatalyzed (dashed reference) */}
      <Line points={uncatPoints} color="gray" lineWidth={1} dashed dashSize={0.05} gapSize={0.05} />
      <Text position={[0, 1.2, 0]} fontSize={0.07} color="gray">Without catalyst</Text>
      {/* Active curve */}
      <Line points={curvePoints} color={catalyst ? "#22c55e" : "#3b82f6"} lineWidth={3} />
      {/* Labels */}
      <Text position={[-1.5, -0.7, 0]} fontSize={0.08} color="#3b82f6">Reactants</Text>
      <Text position={[1.5, -0.8, 0]} fontSize={0.08} color="#f97316">Products</Text>
      <Text position={[0, curvePoints[14]?.[1] ? curvePoints[14][1] + 0.2 : 0.5, 0]} fontSize={0.09} color="white" fontWeight="bold">
        Ea = {activationE} kJ/mol
      </Text>
      {/* Catalyst indicator */}
      {catalyst && (
        <group position={[-0.8, -1, 0]}>
          <Sphere args={[0.1, 16, 16]}>
            <meshStandardMaterial color="#22c55e" />
          </Sphere>
          <Text position={[0, -0.18, 0]} fontSize={0.06} color="#22c55e">MnO₂</Text>
        </group>
      )}
      {/* Axes */}
      <Line points={[[-1.8, -1, 0], [1.8, -1, 0]]} color="white" lineWidth={1} />
      <Line points={[[-1.8, -1, 0], [-1.8, 1.5, 0]]} color="white" lineWidth={1} />
      <Text position={[0, -1.2, 0]} fontSize={0.06} color="gray">Reaction Progress →</Text>
      <Text position={[-2, 0.2, 0]} fontSize={0.06} color="gray" rotation={[0, 0, Math.PI / 2]}>Energy →</Text>
    </group>
  );
}

export function CatalystSimulation3D() {
  const [catalyst, setCatalyst] = useState(false);
  const [temp, setTemp] = useState(25);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const tempFactor = Math.pow(2, (temp - 25) / 10);
  const catalystFactor = catalyst ? 3 : 1;
  const rate = tempFactor * catalystFactor;
  const activationE = catalyst ? 40 : 75;

  const reset = () => { setCatalyst(false); setTemp(25); setStep(0); };
  const steps = ["Start catalyst sim", "Run without catalyst", "Measure reaction time", "Reset experiment", "Add MnO₂ catalyst", "Start reaction again", "Observe faster progress", "Compare Ea diagrams", "Record conclusions"];

  return (
    <Simulation3DLayout
      title="Catalyst & Activation Energy"
      objective="Compare reaction rates with and without a catalyst"
      theory="Catalysts lower activation energy by providing an alternative pathway, increasing the fraction of molecules with sufficient energy to react."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Temperature: {temp}°C</label>
            <Slider value={[temp]} onValueChange={([v]) => { setTemp(v); if (step < 2) setStep(2); sound.playClick(); }} min={0} max={100} step={5} /></div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={catalyst} onChange={e => { setCatalyst(e.target.checked); if (e.target.checked && step < 4) setStep(4); sound.playClick(); }} className="rounded" />
            Add Catalyst (MnO₂)
          </label>
        </div>
      }
      canvas3D={<CatalystScene catalyst={catalyst} temp={temp} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Catalyst</span><span className="font-mono">{catalyst ? "MnO₂ ✅" : "None"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Activation E</span><span className="font-mono">{activationE} kJ/mol</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Rate Factor</span><span className="font-mono">{rate.toFixed(2)}×</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Temperature</span><span className="font-mono">{temp}°C</span></div>
        </div>
      }
    />
  );
}

/* ==================== 12. Reversible Reaction 3D ==================== */

function ReversibleScene({ reactantConc }: { reactantConc: number }) {
  const productConc = 100 - reactantConc;
  const atEquilibrium = Math.abs(reactantConc - 50) < 10;

  return (
    <group>
      <LabRoom />
      {/* Reaction chamber */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1, 1]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.1} transmission={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Reactant particles (left, blue) */}
      {Array.from({ length: Math.floor(reactantConc / 8) }, (_, i) => (
        <Sphere key={`r${i}`} args={[0.05, 8, 8]} position={[-0.7 + (i % 4) * 0.15, -0.3 + Math.floor(i / 4) * 0.15, (i % 3 - 1) * 0.15]}>
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
        </Sphere>
      ))}
      {/* Product particles (right, orange) */}
      {Array.from({ length: Math.floor(productConc / 8) }, (_, i) => (
        <Sphere key={`p${i}`} args={[0.05, 8, 8]} position={[0.3 + (i % 4) * 0.15, -0.3 + Math.floor(i / 4) * 0.15, (i % 3 - 1) * 0.15]}>
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.3} />
        </Sphere>
      ))}
      {/* Arrows */}
      <Line points={[[-0.1, 0.15, 0], [0.1, 0.15, 0]]} color="#3b82f6" lineWidth={2} />
      <Line points={[[0.1, -0.15, 0], [-0.1, -0.15, 0]]} color="#f97316" lineWidth={2} />
      <Text position={[0, 0.35, 0]} fontSize={0.06} color="#3b82f6">Forward →</Text>
      <Text position={[0, -0.35, 0]} fontSize={0.06} color="#f97316">← Reverse</Text>
      {/* Equilibrium indicator */}
      {atEquilibrium && <Text position={[0, -0.7, 0]} fontSize={0.1} color="#22c55e" fontWeight="bold">⟷ At Equilibrium</Text>}
      {!atEquilibrium && <Text position={[0, -0.7, 0]} fontSize={0.08} color="gray">Approaching equilibrium...</Text>}
      <Text position={[-0.7, 0.6, 0]} fontSize={0.08} color="#3b82f6">Reactants</Text>
      <Text position={[0.7, 0.6, 0]} fontSize={0.08} color="#f97316">Products</Text>
    </group>
  );
}

export function ReversibleReaction3D() {
  const [reactantConc, setReactantConc] = useState(80);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const productConc = 100 - reactantConc;
  const forwardRate = reactantConc * 0.05;
  const reverseRate = productConc * 0.05;
  const atEquilibrium = Math.abs(forwardRate - reverseRate) < 1;
  const keq = productConc > 0 ? (productConc / reactantConc).toFixed(2) : "—";

  const reset = () => { setReactantConc(80); setStep(0); };
  const steps = ["Open reversible reaction sim", "Add reactants", "Start the reaction", "Watch forward reaction", "Observe reverse reaction starting", "Reach dynamic equilibrium", "Measure Keq", "Record observations"];

  return (
    <Simulation3DLayout
      title="Reversible Reaction & Equilibrium"
      objective="Observe dynamic equilibrium in a reversible reaction"
      theory="At equilibrium, forward and reverse rates are equal. Concentrations remain constant but reactions continue."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">[Reactant]: {reactantConc}%</label>
            <Slider value={[reactantConc]} onValueChange={([v]) => { setReactantConc(v); if (step < 2) setStep(2); sound.playClick(); }} min={10} max={90} step={5} /></div>
        </div>
      }
      canvas3D={<ReversibleScene reactantConc={reactantConc} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">[Reactant]</span><span className="font-mono">{reactantConc}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">[Product]</span><span className="font-mono">{productConc}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Forward Rate</span><span className="font-mono">{forwardRate.toFixed(1)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Reverse Rate</span><span className="font-mono">{reverseRate.toFixed(1)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Keq</span><span className="font-mono">{keq}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Equilibrium?</span><span className="font-mono">{atEquilibrium ? "Yes ✅" : "No"}</span></div>
        </div>
      }
    />
  );
}

/* ==================== 13. Le Chatelier's Principle 3D ==================== */

function LeChatelierScene({ shift }: { shift: number }) {
  const reactantWidth = Math.max(0.2, 1 - shift * 0.3);
  const productWidth = Math.max(0.2, 1 + shift * 0.3);

  return (
    <group>
      <LabRoom />
      {/* Reaction chamber */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 1, 1]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.1} transmission={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Reactant bar */}
      <mesh position={[-0.8, 0, 0]}>
        <boxGeometry args={[reactantWidth, 0.6, 0.6]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
      </mesh>
      <Text position={[-0.8, 0.5, 0]} fontSize={0.08} color="#3b82f6">Reactants</Text>
      {/* Product bar */}
      <mesh position={[0.8, 0, 0]}>
        <boxGeometry args={[productWidth, 0.6, 0.6]} />
        <meshStandardMaterial color="#f97316" transparent opacity={0.7} />
      </mesh>
      <Text position={[0.8, 0.5, 0]} fontSize={0.08} color="#f97316">Products</Text>
      {/* Shift arrow */}
      {shift > 1 && <Text position={[0, -0.7, 0]} fontSize={0.12} color="#22c55e" fontWeight="bold">⟶ Shift Right</Text>}
      {shift < -1 && <Text position={[0, -0.7, 0]} fontSize={0.12} color="#ef4444" fontWeight="bold">⟵ Shift Left</Text>}
      {Math.abs(shift) <= 1 && <Text position={[0, -0.7, 0]} fontSize={0.12} color="white" fontWeight="bold">⟷ Equilibrium</Text>}
    </group>
  );
}

export function LeChatelierPrinciple3D() {
  const [reactantAdded, setReactantAdded] = useState(0);
  const [temperature, setTemperature] = useState(25);
  const [pressure, setPressure] = useState(50);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const shift = (reactantAdded * 0.5) + ((temperature - 25) * 0.05) + ((pressure - 50) * 0.02);
  const direction = shift > 1 ? "Right (→ Products)" : shift < -1 ? "Left (→ Reactants)" : "Balanced";
  const reactantConc = Math.max(10, 50 - shift * 5);
  const productConc = Math.max(10, 50 + shift * 5);

  const reset = () => { setReactantAdded(0); setTemperature(25); setPressure(50); setStep(0); };
  const steps = ["Open Le Chatelier sim", "Set initial equilibrium", "Add more reactant", "Observe shift direction", "Change temperature", "Observe new equilibrium", "Adjust pressure", "Record all observations"];

  return (
    <Simulation3DLayout
      title="Le Chatelier's Principle"
      objective="Observe equilibrium shifts when conditions change"
      theory="A system at equilibrium shifts to counteract any imposed change in concentration, temperature, or pressure."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Add Reactant: {reactantAdded} mol</label>
            <Slider value={[reactantAdded]} onValueChange={([v]) => { setReactantAdded(v); if (step < 2) setStep(2); sound.playClick(); }} min={0} max={20} step={1} /></div>
          <div><label className="text-xs text-muted-foreground">Temperature: {temperature}°C</label>
            <Slider value={[temperature]} onValueChange={([v]) => { setTemperature(v); if (step < 4) setStep(4); sound.playClick(); }} min={0} max={100} step={5} /></div>
          <div><label className="text-xs text-muted-foreground">Pressure: {pressure} atm</label>
            <Slider value={[pressure]} onValueChange={([v]) => { setPressure(v); if (step < 6) setStep(6); sound.playClick(); }} min={10} max={100} step={5} /></div>
        </div>
      }
      canvas3D={<LeChatelierScene shift={shift} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Shift</span><span className="font-mono">{direction}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">[Reactants]</span><span className="font-mono">{reactantConc.toFixed(1)}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">[Products]</span><span className="font-mono">{productConc.toFixed(1)}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Temperature</span><span className="font-mono">{temperature}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Pressure</span><span className="font-mono">{pressure} atm</span></div>
        </div>
      }
    />
  );
}

/* ==================== 14. Esterification 3D ==================== */

function EsterificationScene({ acid, alcohol, heat, catalystAdded }: { acid: string; alcohol: string; heat: number; catalystAdded: boolean }) {
  const bubblesRef = useRef<THREE.Group>(null);
  const reactionProgress = catalystAdded ? Math.min(100, heat * 1.5) : Math.min(60, heat * 0.8);
  const esterFormed = reactionProgress > 50;

  useFrame(({ clock }) => {
    if (!bubblesRef.current) return;
    const t = clock.elapsedTime;
    bubblesRef.current.children.forEach((child, i) => {
      if (reactionProgress > 30) {
        child.visible = true;
        child.position.y = -0.2 + ((t * 0.5 + i * 0.3) % 1) * 0.6;
        child.position.x = Math.sin(t + i * 2) * 0.15;
      } else {
        child.visible = false;
      }
    });
  });

  const liquidColor = esterFormed ? "#a855f7" : "#eab308";

  return (
    <group>
      <LabRoom />
      {/* Round-bottom flask */}
      <Sphere args={[0.35, 32, 32]} position={[0, -0.2, 0]}>
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
      </Sphere>
      {/* Flask neck */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.4, 16]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Liquid */}
      <Sphere args={[0.3, 32, 16]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color={liquidColor} transparent opacity={0.5} />
      </Sphere>
      {/* Bubbles */}
      <group ref={bubblesRef}>
        {Array.from({ length: 6 }, (_, i) => (
          <Sphere key={i} args={[0.02, 8, 8]}>
            <meshStandardMaterial color="white" transparent opacity={0.4} />
          </Sphere>
        ))}
      </group>
      {/* Bunsen burner */}
      {heat > 0 && <>
        <mesh position={[0, -0.65, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.15, 16]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        <pointLight position={[0, -0.5, 0]} color="#ff6600" intensity={heat / 60} distance={1.5} />
      </>}
      {/* Catalyst */}
      {catalystAdded && (
        <group position={[0.7, -0.3, 0]}>
          <mesh><boxGeometry args={[0.15, 0.2, 0.1]} /><meshStandardMaterial color="#888" /></mesh>
          <Text position={[0, -0.18, 0]} fontSize={0.06} color="gray">H₂SO₄</Text>
        </group>
      )}
      {/* Equation */}
      <Text position={[0, 0.8, 0]} fontSize={0.06} color="gray">
        {acid === "ethanoic" ? "CH₃COOH" : "HCOOH"} + {alcohol === "ethanol" ? "C₂H₅OH" : "CH₃OH"}
      </Text>
      {esterFormed && <>
        <Text position={[0, 1, 0]} fontSize={0.08} color="#a855f7" fontWeight="bold">→ Ester + H₂O</Text>
        <Text position={[1.2, 0.2, 0]} fontSize={0.15}>🍎</Text>
      </>}
    </group>
  );
}

export function Esterification3D() {
  const [acid, setAcid] = useState<"ethanoic"|"methanoic">("ethanoic");
  const [alcohol, setAlcohol] = useState<"ethanol"|"methanol">("ethanol");
  const [heat, setHeat] = useState(0);
  const [catalystAdded, setCatalystAdded] = useState(false);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const reactionProgress = catalystAdded ? Math.min(100, heat * 1.5) : Math.min(60, heat * 0.8);
  const esterFormed = reactionProgress > 50;
  const esterName = acid === "ethanoic" && alcohol === "ethanol" ? "Ethyl ethanoate" : acid === "ethanoic" ? "Methyl ethanoate" : alcohol === "ethanol" ? "Ethyl methanoate" : "Methyl methanoate";
  const smellDetected = reactionProgress > 70;

  const reset = () => { setAcid("ethanoic"); setAlcohol("ethanol"); setHeat(0); setCatalystAdded(false); setStep(0); };
  const steps = ["Add carboxylic acid", "Add alcohol", "Add acid catalyst", "Heat gently", "Observe ester formation", "Detect fruity smell", "Record products"];

  return (
    <Simulation3DLayout
      title="Esterification Reaction"
      objective="Form an ester from a carboxylic acid and an alcohol"
      theory="Esterification: Acid + Alcohol → Ester + Water (condensation). H₂SO₄ catalyst speeds up the reaction."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><span className="text-xs text-muted-foreground">Acid</span>
            <div className="flex gap-1 mt-1">
              {(["ethanoic","methanoic"] as const).map(a => (
                <Button key={a} size="sm" variant={acid === a ? "default" : "outline"} className="text-xs h-7 capitalize" onClick={() => { setAcid(a); sound.playClick(); }}>{a}</Button>
              ))}
            </div>
          </div>
          <div><span className="text-xs text-muted-foreground">Alcohol</span>
            <div className="flex gap-1 mt-1">
              {(["ethanol","methanol"] as const).map(a => (
                <Button key={a} size="sm" variant={alcohol === a ? "default" : "outline"} className="text-xs h-7 capitalize" onClick={() => { setAlcohol(a); sound.playClick(); }}>{a}</Button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={catalystAdded} onChange={e => { setCatalystAdded(e.target.checked); if (step < 2) setStep(2); sound.playClick(); }} className="rounded" />
            Add H₂SO₄
          </label>
          <div><label className="text-xs text-muted-foreground">Heat: {heat}°C</label>
            <Slider value={[heat]} onValueChange={([v]) => { setHeat(v); if (step < 3) setStep(3); sound.playClick(); }} min={0} max={100} step={5} /></div>
        </div>
      }
      canvas3D={<EsterificationScene acid={acid} alcohol={alcohol} heat={heat} catalystAdded={catalystAdded} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Acid</span><span className="font-mono capitalize">{acid}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Alcohol</span><span className="font-mono capitalize">{alcohol}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Catalyst</span><span className="font-mono">{catalystAdded ? "H₂SO₄ ✅" : "None"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Ester</span><span className="font-mono">{esterFormed ? esterName : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Smell</span><span className="font-mono">{smellDetected ? "Fruity 🍎" : "None"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Progress</span><span className="font-mono">{reactionProgress.toFixed(0)}%</span></div>
        </div>
      }
    />
  );
}

/* ==================== 15. Saponification 3D ==================== */

function SaponificationScene({ heat, stirring, saltAdded }: { heat: number; stirring: boolean; saltAdded: boolean }) {
  const stirRef = useRef<THREE.Mesh>(null);
  const reactionProgress = Math.min(100, (heat * 0.8) * (stirring ? 1.5 : 0.7));
  const soapFormed = reactionProgress > 60;
  const separated = soapFormed && saltAdded;

  useFrame(({ clock }) => {
    if (stirRef.current && stirring) {
      stirRef.current.rotation.y = clock.elapsedTime * 3;
    }
  });

  return (
    <group>
      <LabRoom />
      {/* Beaker */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.4, 0.35, 0.8, 32, 1, true]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.2} />
      </mesh>
      {!separated ? (
        <>
          {/* Oil layer */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.38, 0.36, 0.2, 32]} />
            <meshStandardMaterial color={soapFormed ? "#d4a574" : "#eab308"} transparent opacity={soapFormed ? 0.6 : 0.7} />
          </mesh>
          {/* NaOH layer */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.36, 0.34, 0.3, 32]} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.4} />
          </mesh>
          {soapFormed && <Text position={[0, 0.1, 0.4]} fontSize={0.08} color="white" fontWeight="bold">Soap mixture</Text>}
        </>
      ) : (
        <>
          {/* Separated soap (top) */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.38, 0.37, 0.25, 32]} />
            <meshStandardMaterial color="#d4a574" transparent opacity={0.8} />
          </mesh>
          <Text position={[0, 0.1, 0.4]} fontSize={0.07} color="white" fontWeight="bold">Soap (solid)</Text>
          {/* Glycerol + salt water (bottom) */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.37, 0.34, 0.25, 32]} />
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.4} />
          </mesh>
          <Text position={[0, -0.2, 0.4]} fontSize={0.06} color="gray">Glycerol</Text>
        </>
      )}
      {/* Stirring rod */}
      <mesh ref={stirRef} position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
        <meshStandardMaterial color="#888" metalness={0.7} />
      </mesh>
      {/* Bunsen burner */}
      {heat > 0 && <>
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.15, 16]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        <pointLight position={[0, -0.45, 0]} color="#ff6600" intensity={heat / 60} distance={1.5} />
      </>}
      {/* Micelle visualization */}
      {soapFormed && (
        <group position={[1, 0.2, 0]}>
          <Sphere args={[0.12, 16, 16]}>
            <meshStandardMaterial color="#eab308" transparent opacity={0.4} />
          </Sphere>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <Line key={i} points={[[Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0], [Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0]]} color="#d4a574" lineWidth={2} />
            );
          })}
          <Text position={[0, -0.25, 0]} fontSize={0.05} color="gray">Micelle</Text>
        </group>
      )}
      <Text position={[0, -1, 0]} fontSize={0.06} color="gray">Oil + NaOH → Soap + Glycerol</Text>
    </group>
  );
}

export function Saponification3D() {
  const [heat, setHeat] = useState(0);
  const [stirring, setStirring] = useState(false);
  const [saltAdded, setSaltAdded] = useState(false);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const reactionProgress = Math.min(100, (heat * 0.8) * (stirring ? 1.5 : 0.7));
  const soapFormed = reactionProgress > 60;
  const separated = soapFormed && saltAdded;

  const reset = () => { setHeat(0); setStirring(false); setSaltAdded(false); setStep(0); };
  const steps = ["Add vegetable oil", "Add NaOH solution", "Heat slowly", "Stir continuously", "Observe soap formation", "Add salt to separate", "Collect soap product", "Record results"];

  return (
    <Simulation3DLayout
      title="Saponification (Soap Making)"
      objective="Produce soap by reacting oil with NaOH"
      theory="Fat/Oil + NaOH → Soap + Glycerol. The process breaks ester bonds in triglycerides."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Heat: {heat}°C</label>
            <Slider value={[heat]} onValueChange={([v]) => { setHeat(v); if (step < 2) setStep(2); sound.playClick(); }} min={0} max={100} step={5} /></div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={stirring} onChange={e => { setStirring(e.target.checked); if (step < 3) setStep(3); sound.playClick(); }} className="rounded" />
            Stir Continuously
          </label>
          {soapFormed && (
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={saltAdded} onChange={e => { setSaltAdded(e.target.checked); if (step < 5) setStep(5); sound.playClick(); }} className="rounded" />
              Add Salt (NaCl)
            </label>
          )}
        </div>
      }
      canvas3D={<SaponificationScene heat={heat} stirring={stirring} saltAdded={saltAdded} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Heat</span><span className="font-mono">{heat}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Stirring</span><span className="font-mono">{stirring ? "Yes 🔄" : "No"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Progress</span><span className="font-mono">{reactionProgress.toFixed(0)}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Soap</span><span className="font-mono">{soapFormed ? "Yes ✅" : "No"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Separated</span><span className="font-mono">{separated ? "Yes ✅" : "No"}</span></div>
        </div>
      }
    />
  );
}
