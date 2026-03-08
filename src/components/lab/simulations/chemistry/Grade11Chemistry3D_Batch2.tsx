import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";

/* ==================== 6. Metallic Bonding 3D ==================== */

function MetallicBondingScene({ temperature, force }: { temperature: number; force: boolean }) {
  const electronsRef = useRef<THREE.Group>(null);
  const vibration = temperature / 500;

  useFrame(({ clock }) => {
    if (!electronsRef.current) return;
    const t = clock.elapsedTime;
    electronsRef.current.children.forEach((child, i) => {
      const speed = 0.5 + temperature / 100;
      const baseX = (i % 5 - 2) * 0.4;
      const baseZ = (Math.floor(i / 5) - 1) * 0.4;
      if (force) {
        child.position.x = baseX + ((t * speed + i * 0.7) % 4) - 2;
      } else {
        child.position.x = baseX + Math.sin(t * speed + i) * 0.3;
      }
      child.position.z = baseZ + Math.cos(t * speed * 0.7 + i * 1.3) * 0.2;
      child.position.y = Math.sin(t * speed * 0.5 + i * 0.9) * 0.15;
    });
  });

  const ions = [];
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      for (let y = -1; y <= 0; y++) {
        ions.push([x * 0.6, y * 0.5, z * 0.6] as [number, number, number]);
      }
    }
  }

  return (
    <group>
      <LabRoom />
      {/* Metal ion lattice */}
      {ions.map((pos, i) => (
        <group key={i}>
          <Sphere args={[0.12, 16, 16]} position={[pos[0] + Math.sin(Date.now() * 0.001 + i) * vibration * 0.1, pos[1], pos[2]]}>
            <meshStandardMaterial color="#6366f1" metalness={0.8} roughness={0.2} />
          </Sphere>
          <Text position={[pos[0], pos[1] - 0.18, pos[2]]} fontSize={0.04} color="white">+</Text>
        </group>
      ))}
      {/* Delocalized electrons */}
      <group ref={electronsRef}>
        {Array.from({ length: 15 }, (_, i) => (
          <Sphere key={i} args={[0.03, 8, 8]}>
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
          </Sphere>
        ))}
      </group>
      {/* Force arrow */}
      {force && <>
        <Line points={[[-2, 0.3, 0], [2, 0.3, 0]]} color="#22c55e" lineWidth={2} />
        <Text position={[0, 0.6, 0]} fontSize={0.1} color="#22c55e">e⁻ flow →</Text>
      </>}
      <Text position={[0, -1.3, 0]} fontSize={0.08} color="gray">Metallic Lattice — Electron Sea Model</Text>
    </group>
  );
}

export function MetallicBonding3D() {
  const [temperature, setTemperature] = useState(25);
  const [force, setForce] = useState(false);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const electronSpeed = 1 + temperature / 50;
  const conductivity = force ? "High (e⁻ flow)" : "Ready";
  const reset = () => { setTemperature(25); setForce(false); setStep(0); };
  const steps = ["Open metallic bonding sim", "Place metal ions in lattice", "Add delocalized electrons", "Increase temperature", "Observe electron mobility", "Apply electric force", "Observe electron flow", "Record conductivity"];

  return (
    <Simulation3DLayout
      title="Metallic Bonding (Electron Sea)"
      objective="Visualize delocalized electrons in a metallic lattice"
      theory="Metal atoms lose outer electrons to form a 'sea' of delocalized electrons enabling electrical and thermal conductivity."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Temperature: {temperature}°C</label>
            <Slider value={[temperature]} onValueChange={([v]) => { setTemperature(v); if (step < 3) setStep(3); sound.playClick(); }} min={0} max={500} step={10} /></div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={force} onChange={e => { setForce(e.target.checked); if (step < 5) setStep(5); sound.playClick(); }} className="rounded" />
            Apply Electric Force
          </label>
        </div>
      }
      canvas3D={<MetallicBondingScene temperature={temperature} force={force} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Temperature</span><span className="font-mono">{temperature}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">e⁻ Speed</span><span className="font-mono">{electronSpeed.toFixed(1)}×</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Conductivity</span><span className="font-mono">{conductivity}</span></div>
        </div>
      }
    />
  );
}

/* ==================== 7. Kinetic Molecular Theory 3D ==================== */

function KMTScene({ temperature }: { temperature: number }) {
  const particlesRef = useRef<THREE.Group>(null);
  const state = temperature < 0 ? "Solid" : temperature < 100 ? "Liquid" : "Gas";
  const speed = state === "Solid" ? 0.3 : state === "Liquid" ? 1.2 : 3;

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    const t = clock.elapsedTime;
    particlesRef.current.children.forEach((child, i) => {
      const range = state === "Solid" ? 0.03 : state === "Liquid" ? 0.15 : 0.5;
      const baseX = ((i % 4) - 1.5) * 0.25;
      const baseY = (Math.floor(i / 4) % 4 - 1.5) * 0.25;
      const baseZ = (Math.floor(i / 16) - 0.5) * 0.25;
      child.position.x = baseX + Math.sin(t * speed + i * 1.3) * range;
      child.position.y = baseY + Math.cos(t * speed * 0.8 + i * 0.7) * range;
      child.position.z = baseZ + Math.sin(t * speed * 1.1 + i * 2.1) * range;
    });
  });

  const color = state === "Solid" ? "#3b82f6" : state === "Liquid" ? "#06b6d4" : "#ef4444";

  return (
    <group>
      <LabRoom />
      {/* Container */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.1} transmission={0.9} roughness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* Particles */}
      <group ref={particlesRef}>
        {Array.from({ length: 32 }, (_, i) => (
          <Sphere key={i} args={[0.05, 8, 8]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </Sphere>
        ))}
      </group>
      <Text position={[0, -1.2, 0]} fontSize={0.1} color="white" fontWeight="bold">{state} — {temperature}°C</Text>
    </group>
  );
}

export function KineticMolecularTheory3D() {
  const [temperature, setTemperature] = useState(25);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const state = temperature < 0 ? "Solid" : temperature < 100 ? "Liquid" : "Gas";
  const speed = state === "Solid" ? 0.3 : state === "Liquid" ? 1.2 : 3;
  const avgKE = (1.5 * 1.38e-23 * (temperature + 273)).toExponential(2);

  const reset = () => { setTemperature(25); setStep(0); };
  const steps = ["Open KMT simulator", "Set initial temperature", "Increase temp slowly", "Observe solid vibrations", "Watch melting transition", "See liquid flow", "Observe gas expansion", "Record observations"];

  return (
    <Simulation3DLayout
      title="Kinetic Molecular Theory"
      objective="Observe particle motion in solid, liquid, and gas states"
      theory="Particles in solids vibrate in place, in liquids slide past each other, in gases move freely and rapidly."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Temperature: {temperature}°C</label>
            <Slider value={[temperature]} onValueChange={([v]) => { setTemperature(v); if (step < 2) setStep(2); sound.playClick(); }} min={-50} max={200} step={5} /></div>
          <div className={`text-xs font-bold px-2 py-1 rounded text-center ${state === "Solid" ? "bg-blue-500/20 text-blue-400" : state === "Liquid" ? "bg-cyan-500/20 text-cyan-400" : "bg-red-500/20 text-red-400"}`}>{state}</div>
        </div>
      }
      canvas3D={<KMTScene temperature={temperature} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">State</span><span className="font-mono">{state}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Speed</span><span className="font-mono">{speed.toFixed(1)} rel</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Avg KE</span><span className="font-mono">{avgKE} J</span></div>
        </div>
      }
    />
  );
}

/* ==================== 8. Boyle's Law 3D ==================== */

function BoylesLawScene({ volume }: { volume: number }) {
  const particlesRef = useRef<THREE.Group>(null);
  const pistonY = -0.5 + (volume / 20) * 1.5;

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    const t = clock.elapsedTime;
    particlesRef.current.children.forEach((child, i) => {
      const maxY = pistonY - 0.1;
      child.position.x = Math.sin(t * 2 + i * 1.7) * 0.3;
      child.position.y = -0.5 + ((Math.sin(t * 1.5 + i * 2.3) + 1) / 2) * (maxY + 0.5);
      child.position.z = Math.cos(t * 1.8 + i * 0.9) * 0.3;
    });
  });

  const pressure = 1000 / volume;

  return (
    <group>
      <LabRoom />
      {/* Cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 2, 32, 1, true]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -1, 0]} rotation={[Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
      {/* Piston */}
      <mesh position={[0, pistonY, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.08, 32]} />
        <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
      </mesh>
      <Text position={[0, pistonY + 0.15, 0.4]} fontSize={0.07} color="gray">Piston</Text>
      {/* Gas particles */}
      <group ref={particlesRef}>
        {Array.from({ length: 10 }, (_, i) => (
          <Sphere key={i} args={[0.04, 8, 8]}>
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
          </Sphere>
        ))}
      </group>
      {/* Pressure gauge */}
      <mesh position={[0.8, 0.5, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.15]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <Text position={[0.8, 0.58, 0.08]} fontSize={0.05} color="#22c55e">Pressure</Text>
      <Text position={[0.8, 0.45, 0.08]} fontSize={0.08} color="#22c55e" fontWeight="bold">{pressure.toFixed(0)} kPa</Text>
    </group>
  );
}

export function BoylesLaw3D() {
  const [volume, setVolume] = useState(10);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const pressure = 1000 / volume;
  const reset = () => { setVolume(10); setStep(0); };
  const steps = ["Open Boyle's Law sim", "Set fixed temperature", "Adjust piston volume", "Observe pressure change", "Record P and V", "Repeat for several V", "Plot P vs V graph", "Verify PV = k"];

  return (
    <Simulation3DLayout
      title="Boyle's Law (PV = k)"
      objective="Verify pressure is inversely proportional to volume at constant T"
      theory="Boyle's Law: PV = constant at constant temperature. Halving volume doubles pressure."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Volume: {volume} L</label>
            <Slider value={[volume]} onValueChange={([v]) => { setVolume(v); if (step < 2) setStep(2); sound.playClick(); }} min={2} max={20} step={1} /></div>
          <p className="text-xs text-muted-foreground">Temperature: 25°C (fixed)</p>
        </div>
      }
      canvas3D={<BoylesLawScene volume={volume} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Volume</span><span className="font-mono">{volume} L</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Pressure</span><span className="font-mono">{pressure.toFixed(1)} kPa</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">PV</span><span className="font-mono">{(pressure * volume).toFixed(0)} kPa·L</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span className="font-mono">25°C</span></div>
        </div>
      }
    />
  );
}

/* ==================== 9. Heating Curve 3D ==================== */

function HeatingCurveScene({ heat }: { heat: number }) {
  const particlesRef = useRef<THREE.Group>(null);
  const getTemp = (h: number) => {
    if (h < 20) return -20 + h * 1;
    if (h < 40) return 0;
    if (h < 70) return (h - 40) * 3.33;
    if (h < 90) return 100;
    return 100 + (h - 90) * 5;
  };
  const temp = getTemp(heat);
  const phase = temp < 0 ? "Solid" : heat < 40 && temp === 0 ? "Melting" : temp < 100 ? "Liquid" : heat < 90 ? "Boiling" : "Gas";

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    const t = clock.elapsedTime;
    const range = phase === "Solid" ? 0.02 : phase === "Melting" ? 0.06 : phase === "Liquid" ? 0.15 : phase === "Boiling" ? 0.25 : 0.5;
    const speed = phase === "Solid" ? 0.5 : phase === "Liquid" ? 1.5 : 3;
    particlesRef.current.children.forEach((child, i) => {
      child.position.x = ((i % 3) - 1) * 0.15 + Math.sin(t * speed + i) * range;
      child.position.y = (Math.floor(i / 3) % 3 - 1) * 0.15 + Math.cos(t * speed * 0.7 + i * 1.5) * range;
      child.position.z = (Math.floor(i / 9) - 0.5) * 0.15 + Math.sin(t * speed * 1.2 + i * 0.8) * range;
    });
  });

  const color = phase === "Solid" ? "#3b82f6" : phase === "Melting" ? "#06b6d4" : phase === "Liquid" ? "#0ea5e9" : phase === "Boiling" ? "#f97316" : "#ef4444";

  return (
    <group>
      <LabRoom />
      {/* Beaker */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.4, 0.35, 0.8, 32, 1, true]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Particles */}
      <group ref={particlesRef} position={[0, -0.2, 0]}>
        {Array.from({ length: 18 }, (_, i) => (
          <Sphere key={i} args={[0.04, 8, 8]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </Sphere>
        ))}
      </group>
      {/* Steam bubbles for boiling */}
      {(phase === "Boiling" || phase === "Gas") && Array.from({ length: 5 }, (_, i) => (
        <Sphere key={`steam${i}`} args={[0.03, 8, 8]} position={[Math.sin(i) * 0.15, 0.3 + i * 0.1, Math.cos(i) * 0.15]}>
          <meshStandardMaterial color="white" transparent opacity={0.4} />
        </Sphere>
      ))}
      {/* Bunsen burner */}
      <mesh position={[0, -0.7, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.15, 16]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
      {heat > 0 && (
        <pointLight position={[0, -0.55, 0]} color="#ff6600" intensity={heat / 50} distance={1.5} />
      )}
      {/* Thermometer */}
      <mesh position={[0.5, 0.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <Text position={[0.5, 0.7, 0]} fontSize={0.08} color="white" fontWeight="bold">{temp.toFixed(0)}°C</Text>
      <Text position={[0, -1.2, 0]} fontSize={0.1} color="white" fontWeight="bold">{phase}</Text>
    </group>
  );
}

export function HeatingCurve3D() {
  const [heat, setHeat] = useState(0);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const getTemp = (h: number) => {
    if (h < 20) return -20 + h * 1;
    if (h < 40) return 0;
    if (h < 70) return (h - 40) * 3.33;
    if (h < 90) return 100;
    return 100 + (h - 90) * 5;
  };
  const temp = getTemp(heat);
  const phase = temp < 0 ? "Solid" : heat < 40 && temp === 0 ? "Melting" : temp < 100 ? "Liquid" : heat < 90 ? "Boiling" : "Gas";

  const reset = () => { setHeat(0); setStep(0); };
  const steps = ["Place sample in beaker", "Turn on heater", "Measure temperature", "Observe solid heating", "Watch melting plateau", "Continue to boiling", "Observe boiling plateau", "Record data", "Plot heating curve"];

  return (
    <Simulation3DLayout
      title="Heating Curve of Water"
      objective="Observe temperature plateaus during phase changes"
      theory="During phase changes, temperature remains constant as energy breaks intermolecular bonds rather than increasing KE."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Heat Added: {heat} kJ</label>
            <Slider value={[heat]} onValueChange={([v]) => { setHeat(v); if (step < 1) setStep(Math.min(8, Math.floor(v / 12))); sound.playClick(); }} min={0} max={100} step={1} /></div>
          <div className={`text-xs font-bold px-2 py-1 rounded text-center ${phase === "Solid" ? "bg-blue-500/20 text-blue-400" : phase === "Melting" ? "bg-cyan-500/20 text-cyan-400" : phase === "Liquid" ? "bg-sky-500/20 text-sky-400" : phase === "Boiling" ? "bg-orange-500/20 text-orange-400" : "bg-red-500/20 text-red-400"}`}>{phase}</div>
        </div>
      }
      canvas3D={<HeatingCurveScene heat={heat} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Temperature</span><span className="font-mono">{temp.toFixed(1)}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Phase</span><span className="font-mono">{phase}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Heat</span><span className="font-mono">{heat} kJ</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Melting Pt</span><span className="font-mono">0°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Boiling Pt</span><span className="font-mono">100°C</span></div>
        </div>
      }
    />
  );
}

/* ==================== 10. Reaction Rate 3D ==================== */

function ReactionRateScene({ concentration, temp }: { concentration: number; temp: number }) {
  const particlesRef = useRef<THREE.Group>(null);
  const baseRate = concentration * 0.5;
  const tempFactor = Math.pow(2, (temp - 25) / 10);
  const rate = baseRate * tempFactor;

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    const t = clock.elapsedTime;
    const speed = 0.5 + rate * 0.3;
    particlesRef.current.children.forEach((child, i) => {
      child.position.x = Math.sin(t * speed + i * 2.1) * 0.3;
      child.position.y = -0.1 + ((t * speed * 0.5 + i * 0.5) % 1) * 0.6;
      child.position.z = Math.cos(t * speed * 0.8 + i * 1.7) * 0.3;
    });
  });

  const reactionProgress = Math.min(100, rate * 20);

  return (
    <group>
      <LabRoom />
      {/* Flask */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.35, 0.8, 32, 1, true]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Liquid */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.19, 0.33, 0.4, 32]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.2 + concentration * 0.2} />
      </mesh>
      {/* Reaction particles / bubbles */}
      <group ref={particlesRef}>
        {Array.from({ length: Math.min(12, Math.floor(rate * 3)) }, (_, i) => (
          <Sphere key={i} args={[0.02, 8, 8]}>
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
          </Sphere>
        ))}
      </group>
      {/* Progress bar */}
      <mesh position={[0.8, -0.5 + reactionProgress * 0.008, 0]}>
        <boxGeometry args={[0.1, reactionProgress * 0.016, 0.1]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0.8, -0.1, 0]}>
        <boxGeometry args={[0.12, 0.82, 0.12]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.1} />
      </mesh>
      <Text position={[0.8, 0.5, 0]} fontSize={0.06} color="gray">{reactionProgress.toFixed(0)}%</Text>
      {/* Heat */}
      {temp > 30 && <pointLight position={[0, -0.7, 0]} color="#ff6600" intensity={temp / 100} distance={1} />}
    </group>
  );
}

export function ReactionRate3D() {
  const [concentration, setConcentration] = useState(1);
  const [temp, setTemp] = useState(25);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const baseRate = concentration * 0.5;
  const tempFactor = Math.pow(2, (temp - 25) / 10);
  const rate = baseRate * tempFactor;
  const reactionProgress = Math.min(100, rate * 20);

  const reset = () => { setConcentration(1); setTemp(25); setStep(0); };
  const steps = ["Open reaction rate sim", "Select reactants", "Set concentration", "Start timer", "Observe product formation", "Record time", "Repeat with diff conc.", "Compare rates", "Plot conc vs time"];

  return (
    <Simulation3DLayout
      title="Reaction Rate Experiment"
      objective="Study how concentration and temperature affect reaction rate"
      theory="Increasing concentration increases collision frequency. Increasing temperature increases particle energy and collision rate."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Concentration: {concentration.toFixed(1)} M</label>
            <Slider value={[concentration]} onValueChange={([v]) => { setConcentration(v); if (step < 2) setStep(2); sound.playClick(); }} min={0.1} max={3} step={0.1} /></div>
          <div><label className="text-xs text-muted-foreground">Temperature: {temp}°C</label>
            <Slider value={[temp]} onValueChange={([v]) => { setTemp(v); if (step < 4) setStep(4); sound.playClick(); }} min={0} max={100} step={5} /></div>
        </div>
      }
      canvas3D={<ReactionRateScene concentration={concentration} temp={temp} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Concentration</span><span className="font-mono">{concentration.toFixed(1)} M</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Temperature</span><span className="font-mono">{temp}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span className="font-mono">{rate.toFixed(2)} mol/s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Temp Factor</span><span className="font-mono">{tempFactor.toFixed(1)}×</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Progress</span><span className="font-mono">{reactionProgress.toFixed(0)}%</span></div>
        </div>
      }
    />
  );
}
