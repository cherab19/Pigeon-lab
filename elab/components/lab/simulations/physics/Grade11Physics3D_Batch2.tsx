import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ═══════════════════════════════════════════════════
// 8. FRICTION EXPERIMENT — 3D
// ═══════════════════════════════════════════════════

export function FrictionExperiment3D() {
  const [mass, setMass] = useState(2);
  const [surface, setSurface] = useState<"wood" | "metal" | "rubber" | "ice">("wood");
  const [appliedF, setAppliedF] = useState(0);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const muS: Record<string, number> = { wood: 0.4, metal: 0.3, rubber: 0.7, ice: 0.05 };
  const muK: Record<string, number> = { wood: 0.3, metal: 0.2, rubber: 0.5, ice: 0.03 };
  const g = 9.8;
  const normal = mass * g;
  const staticF = muS[surface] * normal;
  const kineticF = muK[surface] * normal;
  const moving = appliedF > staticF;
  const netF = moving ? appliedF - kineticF : 0;
  const accel = moving ? netF / mass : 0;

  const surfColors: Record<string, string> = { wood: "#8B4513", metal: "#708090", rubber: "#333", ice: "#aaddff" };
  const reset = () => { setAppliedF(0); setStep(0); };
  const steps = ["Select surface material", "Set block mass", "Gradually increase applied force", "Note when block starts moving", "Compare static vs kinetic friction"];

  return (
    <Simulation3DLayout title="3D Lab: Friction Experiment" objective="Investigate static and kinetic friction" theory="f_s = μ_s·N (max), f_k = μ_k·N. Static > Kinetic." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Surface</span>
            {(["wood", "metal", "rubber", "ice"] as const).map(s => (
              <Button key={s} variant={surface === s ? "default" : "outline"} size="sm" className="w-full capitalize text-xs"
                onClick={() => { setSurface(s); setStep(Math.max(step, 1)); playClick(); }}>
                {s} (μs={muS[s]}, μk={muK[s]})
              </Button>
            ))}
          </div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">Mass: {mass}kg</label><Slider value={[mass]} onValueChange={v => setMass(v[0])} min={0.5} max={10} step={0.5} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">F: {appliedF.toFixed(1)}N</label><Slider value={[appliedF]} onValueChange={v => { setAppliedF(v[0]); setStep(Math.max(step, 3)); }} min={0} max={80} step={0.5} /></div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <mesh position={[0, -0.47, 0]} receiveShadow><boxGeometry args={[3, 0.02, 0.8]} /><meshStandardMaterial color={surfColors[surface]} roughness={0.8} /></mesh>
          <group position={[moving ? Math.min(accel * 0.05, 0.8) - 0.5 : -0.5, -0.38, 0]}>
            <mesh castShadow><boxGeometry args={[0.15, 0.08, 0.1]} /><meshStandardMaterial color="#3498db" metalness={0.3} /></mesh>
            <Text position={[0, 0.08, 0]} fontSize={0.025} color="#3498db" anchorX="center">{mass}kg</Text>
          </group>
          {appliedF > 0 && <Text position={[0, -0.2, 0.5]} fontSize={0.04} color={moving ? "#e74c3c" : "#f39c12"} anchorX="center">{moving ? "MOVING →" : "STATIC"}</Text>}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">N</span><span>{normal.toFixed(1)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">f_s(max)</span><span>{staticF.toFixed(1)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">f_k</span><span>{kineticF.toFixed(1)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">F_applied</span><span>{appliedF.toFixed(1)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">F_net</span><span className="text-primary font-bold">{netF.toFixed(1)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">a</span><span>{accel.toFixed(2)} m/s²</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={moving ? "text-red-400" : "text-green-400"}>{moving ? "Kinetic" : "Static"}</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 9. INCLINED PLANE (Grade 11) — 3D
// ═══════════════════════════════════════════════════

export function InclinedPlane11_3D() {
  const [angle, setAngle] = useState(30);
  const [mass, setMass] = useState(3);
  const [mu, setMu] = useState(0.2);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const g = 9.8; const rad = (angle * Math.PI) / 180;
  const parallel = mass * g * Math.sin(rad);
  const normal = mass * g * Math.cos(rad);
  const friction = mu * normal;
  const netF = parallel - friction;
  const slides = netF > 0;
  const accel = slides ? netF / mass : 0;
  const pos = 0.5 * accel * time * time;

  const startStop = useCallback(() => {
    if (running) { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); return; }
    if (!slides) return;
    setTime(0); setRunning(true); setStep(Math.max(step, 3));
    const start = Date.now();
    intervalRef.current = window.setInterval(() => {
      const t = (Date.now() - start) / 1000;
      if (t > 5) { clearInterval(intervalRef.current!); setRunning(false); return; }
      setTime(t);
    }, 16); playClick();
  }, [running, slides, step, playClick]);

  const reset = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); setTime(0); setStep(0); };
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);
  const steps = ["Set angle", "Set mass & friction", "Check if block slides", "Release block", "Analyze forces"];

  return (
    <Simulation3DLayout title="3D Lab: Inclined Plane" objective="Analyze forces on an inclined plane with friction" theory="F∥ = mgsinθ, N = mgcosθ, f = μN." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1"><label className="text-xs text-muted-foreground">θ: {angle}°</label><Slider value={[angle]} onValueChange={v => setAngle(v[0])} min={5} max={60} step={1} disabled={running} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">m: {mass}kg</label><Slider value={[mass]} onValueChange={v => setMass(v[0])} min={0.5} max={10} step={0.5} disabled={running} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">μ: {mu.toFixed(2)}</label><Slider value={[mu]} onValueChange={v => setMu(v[0])} min={0} max={1} step={0.05} disabled={running} /></div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop} disabled={!slides && !running}>{running ? "⏹ Stop" : slides ? "▶ Release" : "🔒 Static"}</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <group position={[0, -0.45, 0]} rotation={[0, 0, rad * 0.5]}>
            <mesh castShadow><boxGeometry args={[2, 0.03, 0.4]} /><meshStandardMaterial color="#8B7355" roughness={0.7} /></mesh>
            <group position={[pos * 0.06 - 0.5, 0.05, 0]}>
              <mesh castShadow><boxGeometry args={[0.1, 0.07, 0.08]} /><meshStandardMaterial color="#3498db" metalness={0.3} /></mesh>
            </group>
          </group>
          <Text position={[0.5, -0.2, 0.3]} fontSize={0.04} color="#f39c12" anchorX="center">θ={angle}°</Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">F∥</span><span>{parallel.toFixed(2)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">N</span><span>{normal.toFixed(2)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">f</span><span>{friction.toFixed(2)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">F_net</span><span className={slides ? "text-red-400" : "text-green-400"}>{netF.toFixed(2)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">a</span><span className="text-primary font-bold">{accel.toFixed(2)} m/s²</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 10. HEAT CONDUCTION — 3D
// ═══════════════════════════════════════════════════

export function HeatConduction3D() {
  const [material, setMaterial] = useState("copper");
  const [hotTemp, setHotTemp] = useState(100);
  const [coldTemp, setColdTemp] = useState(20);
  const [length, setLength] = useState(0.5);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const k: Record<string, number> = { copper: 385, aluminum: 205, steel: 50, glass: 0.8 };
  const area = 0.001;
  const heatRate = k[material] * area * (hotTemp - coldTemp) / length;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTime(prev => {
        if (prev > 30) { setRunning(false); return prev; }
        return prev + 0.1;
      });
      setColdTemp(prev => {
        const rise = (heatRate * 0.001) / 4.186;
        return Math.min(hotTemp, prev + rise * 0.01);
      });
    }, 50);
    return () => clearInterval(id);
  }, [running, heatRate, hotTemp]);

  const reset = () => { setRunning(false); setTime(0); setColdTemp(20); setStep(0); };
  const steps = ["Select material", "Set hot & cold temperatures", "Start conduction", "Observe heat transfer rate", "Compare materials"];

  const matColors: Record<string, string> = { copper: "#B87333", aluminum: "#C0C0C0", steel: "#708090", glass: "#aaccee" };
  const glowIntensity = Math.min(1, (hotTemp - 20) / 200);

  return (
    <Simulation3DLayout title="3D Lab: Heat Conduction" objective="Compare heat conduction through different materials" theory="Q/t = kA(T_hot−T_cold)/L. k = thermal conductivity." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Material</span>
            {(["copper", "aluminum", "steel", "glass"] as const).map(m => (
              <Button key={m} variant={material === m ? "default" : "outline"} size="sm" className="w-full capitalize text-xs"
                onClick={() => { setMaterial(m); setStep(Math.max(step, 1)); playClick(); }}>
                {m} (k={k[m]})
              </Button>
            ))}
          </div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">T_hot: {hotTemp}°C</label><Slider value={[hotTemp]} onValueChange={v => setHotTemp(v[0])} min={50} max={300} step={10} /></div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={() => { setRunning(!running); setStep(Math.max(step, 3)); playClick(); }}>{running ? "⏹ Stop" : "🔥 Start"}</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Rod */}
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[1.5, 0.04, 0.04]} />
            <meshStandardMaterial color={matColors[material]} metalness={0.7} roughness={0.3}
              emissive={new THREE.Color(1, 0.2, 0)} emissiveIntensity={running ? glowIntensity * 0.3 : 0} />
          </mesh>
          {/* Hot end */}
          <mesh position={[-0.8, -0.3, 0]}><boxGeometry args={[0.1, 0.08, 0.08]} /><meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.5} /></mesh>
          <Text position={[-0.8, -0.2, 0]} fontSize={0.025} color="#e74c3c" anchorX="center">{hotTemp}°C</Text>
          {/* Cold end */}
          <mesh position={[0.8, -0.3, 0]}><boxGeometry args={[0.1, 0.08, 0.08]} /><meshStandardMaterial color="#3498db" /></mesh>
          <Text position={[0.8, -0.2, 0]} fontSize={0.025} color="#3498db" anchorX="center">{coldTemp.toFixed(1)}°C</Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">k</span><span>{k[material]} W/m·K</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">T_hot</span><span>{hotTemp}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">T_cold</span><span className="text-primary font-bold">{coldTemp.toFixed(1)}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ΔT</span><span>{(hotTemp - coldTemp).toFixed(1)}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Q/t</span><span>{heatRate.toFixed(2)} W</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{time.toFixed(1)} s</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 11. CALORIMETRY — 3D
// ═══════════════════════════════════════════════════

export function Calorimetry3D() {
  const [massWater, setMassWater] = useState(0.2);
  const [massObject, setMassObject] = useState(0.05);
  const [tempWater, setTempWater] = useState(25);
  const [tempObject, setTempObject] = useState(100);
  const [mixed, setMixed] = useState(false);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const cWater = 4186;
  const equilibriumTemp = (massWater * cWater * tempWater + massObject * 900 * tempObject) / (massWater * cWater + massObject * 900);
  const qLost = massObject * 900 * (tempObject - equilibriumTemp);
  const qGained = massWater * cWater * (equilibriumTemp - tempWater);

  const reset = () => { setMixed(false); setStep(0); setTempWater(25); setTempObject(100); };
  const steps = ["Set water mass & temperature", "Set object mass & temperature", "Mix (drop object into water)", "Read equilibrium temperature", "Verify Q_lost = Q_gained"];

  return (
    <Simulation3DLayout title="3D Lab: Calorimetry" objective="Determine specific heat using Q = mcΔT" theory="Conservation of energy: Q_lost = Q_gained. mc₁ΔT₁ = mc₂ΔT₂." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1"><label className="text-xs text-muted-foreground">Water: {massWater}kg @ {tempWater}°C</label><Slider value={[massWater]} onValueChange={v => setMassWater(v[0])} min={0.05} max={1} step={0.05} disabled={mixed} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">Object: {massObject}kg @ {tempObject}°C</label><Slider value={[tempObject]} onValueChange={v => setTempObject(v[0])} min={50} max={200} step={5} disabled={mixed} /></div>
          <Button size="sm" className="w-full" onClick={() => { setMixed(true); setStep(Math.max(step, 3)); playClick(); }} disabled={mixed}>🫗 Mix</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Calorimeter */}
          <group position={[0, -0.35, 0]}>
            <mesh><cylinderGeometry args={[0.2, 0.18, 0.3, 32, 1, true]} /><meshPhysicalMaterial color="#cce" transparent opacity={0.2} transmission={0.8} /></mesh>
            <mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.19, 0.17, 0.25, 32]} /><meshStandardMaterial color={mixed ? "#88aa44" : "#4488ff"} transparent opacity={0.5} /></mesh>
          </group>
          {/* Object (above or in water) */}
          <mesh position={[0, mixed ? -0.35 : 0, 0]} castShadow>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={mixed ? 0 : 0.5} />
          </mesh>
          {mixed && <Text position={[0, 0, 0]} fontSize={0.05} color="#2ecc71" anchorX="center">T_eq = {equilibriumTemp.toFixed(1)}°C</Text>}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">T_water</span><span>{mixed ? equilibriumTemp.toFixed(1) : tempWater}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">T_object</span><span>{mixed ? equilibriumTemp.toFixed(1) : tempObject}°C</span></div>
          {mixed && <>
            <div className="flex justify-between"><span className="text-muted-foreground">T_eq</span><span className="text-primary font-bold">{equilibriumTemp.toFixed(1)}°C</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Q_lost</span><span>{qLost.toFixed(1)} J</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Q_gained</span><span>{qGained.toFixed(1)} J</span></div>
          </>}
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 12. COULOMB'S LAW — 3D
// ═══════════════════════════════════════════════════

export function CoulombsLaw3D() {
  const [q1, setQ1] = useState(2);
  const [q2, setQ2] = useState(3);
  const [dist, setDist] = useState(0.5);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const k = 8.99e9;
  const force = k * (q1 * 1e-6) * (q2 * 1e-6) / (dist * dist);
  const attractive = (q1 > 0 && q2 < 0) || (q1 < 0 && q2 > 0);

  const reset = () => { setQ1(2); setQ2(3); setDist(0.5); setStep(0); };
  const steps = ["Set charge q₁", "Set charge q₂", "Adjust distance r", "Read Coulomb force", "Verify F = kq₁q₂/r²"];

  return (
    <Simulation3DLayout title="3D Lab: Coulomb's Law" objective="Investigate force between charges: F = kq₁q₂/r²" theory="F = kq₁q₂/r². Like charges repel, unlike attract." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1"><label className="text-xs text-muted-foreground">q₁: {q1}μC</label><Slider value={[q1]} onValueChange={v => setQ1(v[0])} min={-10} max={10} step={0.5} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">q₂: {q2}μC</label><Slider value={[q2]} onValueChange={v => setQ2(v[0])} min={-10} max={10} step={0.5} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">r: {dist.toFixed(2)}m</label><Slider value={[dist]} onValueChange={v => { setDist(v[0]); setStep(Math.max(step, 3)); }} min={0.1} max={2} step={0.05} /></div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Charge 1 */}
          <mesh position={[-dist * 0.5, -0.3, 0]} castShadow>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={q1 >= 0 ? "#e74c3c" : "#3498db"} emissive={q1 >= 0 ? "#e74c3c" : "#3498db"} emissiveIntensity={0.3} />
          </mesh>
          <Text position={[-dist * 0.5, -0.18, 0]} fontSize={0.03} color={q1 >= 0 ? "#e74c3c" : "#3498db"} anchorX="center">{q1 >= 0 ? "+" : ""}{q1}μC</Text>
          {/* Charge 2 */}
          <mesh position={[dist * 0.5, -0.3, 0]} castShadow>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={q2 >= 0 ? "#e74c3c" : "#3498db"} emissive={q2 >= 0 ? "#e74c3c" : "#3498db"} emissiveIntensity={0.3} />
          </mesh>
          <Text position={[dist * 0.5, -0.18, 0]} fontSize={0.03} color={q2 >= 0 ? "#e74c3c" : "#3498db"} anchorX="center">{q2 >= 0 ? "+" : ""}{q2}μC</Text>
          {/* Force arrows */}
          <Text position={[0, -0.4, 0]} fontSize={0.035} color="#f39c12" anchorX="center">{attractive ? "← Attract →" : "→ Repel ←"}</Text>
          <Text position={[0, -0.1, 0]} fontSize={0.04} color="#f39c12" anchorX="center">F = {force.toFixed(4)} N</Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">q₁</span><span>{q1} μC</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">q₂</span><span>{q2} μC</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">r</span><span>{dist.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">F</span><span className="text-primary font-bold">{force.toFixed(4)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className={attractive ? "text-green-400" : "text-red-400"}>{attractive ? "Attractive" : "Repulsive"}</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 13. ELECTRIC CIRCUIT — 3D
// ═══════════════════════════════════════════════════

export function ElectricCircuit3D() {
  const [voltage, setVoltage] = useState(9);
  const [r1, setR1] = useState(10);
  const [r2, setR2] = useState(20);
  const [config, setConfig] = useState<"series" | "parallel">("series");
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const rTotal = config === "series" ? r1 + r2 : (r1 * r2) / (r1 + r2);
  const iTotal = voltage / rTotal;
  const p = voltage * iTotal;

  const reset = () => { setVoltage(9); setR1(10); setR2(20); setStep(0); };
  const steps = ["Set voltage", "Set R₁ and R₂", "Choose series or parallel", "Read total current", "Compare configurations"];

  return (
    <Simulation3DLayout title="3D Lab: Electric Circuit" objective="Analyze series and parallel circuits" theory="Series: R_T = R₁+R₂. Parallel: 1/R_T = 1/R₁+1/R₂." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1"><label className="text-xs text-muted-foreground">V: {voltage}V</label><Slider value={[voltage]} onValueChange={v => setVoltage(v[0])} min={1} max={24} step={0.5} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">R₁: {r1}Ω</label><Slider value={[r1]} onValueChange={v => setR1(v[0])} min={1} max={100} step={1} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">R₂: {r2}Ω</label><Slider value={[r2]} onValueChange={v => setR2(v[0])} min={1} max={100} step={1} /></div>
          <div className="flex gap-1">
            {(["series", "parallel"] as const).map(c => (
              <Button key={c} variant={config === c ? "default" : "outline"} size="sm" className="flex-1 capitalize text-xs"
                onClick={() => { setConfig(c); setStep(Math.max(step, 3)); playClick(); }}>{c}</Button>
            ))}
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Battery */}
          <group position={[-0.8, -0.3, 0]}>
            <mesh><cylinderGeometry args={[0.04, 0.04, 0.12, 16]} /><meshStandardMaterial color="#333" metalness={0.5} /></mesh>
            <Text position={[0, -0.1, 0]} fontSize={0.025} color="#f39c12" anchorX="center">{voltage}V</Text>
          </group>
          {/* R1 */}
          <group position={[config === "series" ? 0 : 0.3, config === "series" ? -0.3 : -0.2, 0]}>
            <mesh><boxGeometry args={[0.12, 0.04, 0.04]} /><meshStandardMaterial color="#8B4513" /></mesh>
            <Text position={[0, 0.05, 0]} fontSize={0.02} color="#aaa" anchorX="center">R₁={r1}Ω</Text>
          </group>
          {/* R2 */}
          <group position={[config === "series" ? 0.5 : 0.3, config === "series" ? -0.3 : -0.4, 0]}>
            <mesh><boxGeometry args={[0.12, 0.04, 0.04]} /><meshStandardMaterial color="#654321" /></mesh>
            <Text position={[0, 0.05, 0]} fontSize={0.02} color="#aaa" anchorX="center">R₂={r2}Ω</Text>
          </group>
          <Text position={[0, 0, 0]} fontSize={0.04} color="#2ecc71" anchorX="center">I = {iTotal.toFixed(3)}A</Text>
          <Text position={[0, -0.08, 0]} fontSize={0.03} color="#aaa" anchorX="center">{config.toUpperCase()}</Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Config</span><span className="capitalize">{config}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">R_total</span><span>{rTotal.toFixed(2)} Ω</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">I</span><span className="text-primary font-bold">{iTotal.toFixed(3)} A</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">P</span><span>{p.toFixed(2)} W</span></div>
          {config === "series" && <>
            <div className="flex justify-between"><span className="text-muted-foreground">V₁</span><span>{(iTotal * r1).toFixed(2)} V</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">V₂</span><span>{(iTotal * r2).toFixed(2)} V</span></div>
          </>}
          {config === "parallel" && <>
            <div className="flex justify-between"><span className="text-muted-foreground">I₁</span><span>{(voltage / r1).toFixed(3)} A</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">I₂</span><span>{(voltage / r2).toFixed(3)} A</span></div>
          </>}
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 14. RADIOACTIVE DECAY — 3D
// ═══════════════════════════════════════════════════

function DecayParticles({ count, total }: { count: number; total: number }) {
  const particles = useMemo(() => {
    return Array.from({ length: total }, (_, i) => ({
      pos: [(Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6] as [number, number, number],
      decayed: i >= count,
    }));
  }, [total, count]);

  return (
    <group position={[0, -0.2, 0]}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color={p.decayed ? "#888" : "#e74c3c"} transparent opacity={p.decayed ? 0.3 : 0.8}
            emissive={p.decayed ? "#000" : "#e74c3c"} emissiveIntensity={p.decayed ? 0 : 0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function RadioactiveDecay3D() {
  const [halfLife, setHalfLife] = useState(5);
  const [initial, setInitial] = useState(100);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [data, setData] = useState<{ t: number; N: number }[]>([]);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const remaining = Math.round(initial * Math.pow(0.5, time / halfLife));
  const activity = (0.693 / halfLife) * remaining;

  const startStop = useCallback(() => {
    if (running) { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); return; }
    setTime(0); setData([]); setRunning(true); setStep(Math.max(step, 2));
    const start = Date.now();
    intervalRef.current = window.setInterval(() => {
      const t = (Date.now() - start) / 1000;
      if (t > halfLife * 6) { clearInterval(intervalRef.current!); setRunning(false); return; }
      setTime(t);
      const n = Math.round(initial * Math.pow(0.5, t / halfLife));
      setData(prev => [...prev.slice(-100), { t: +t.toFixed(1), N: n }]);
    }, 100); playClick();
  }, [running, step, halfLife, initial, playClick]);

  const reset = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); setTime(0); setData([]); setStep(0); };
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);
  const steps = ["Set half-life", "Set initial nuclei count", "Start decay", "Observe exponential decay", "Verify N = N₀(½)^(t/t½)"];

  return (
    <Simulation3DLayout title="3D Lab: Radioactive Decay" objective="Observe exponential decay: N = N₀(½)^(t/t½)" theory="Half-life t½: time for half the nuclei to decay. Activity A = λN." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1"><label className="text-xs text-muted-foreground">t½: {halfLife}s</label><Slider value={[halfLife]} onValueChange={v => setHalfLife(v[0])} min={1} max={20} step={1} disabled={running} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">N₀: {initial}</label><Slider value={[initial]} onValueChange={v => setInitial(v[0])} min={20} max={200} step={10} disabled={running} /></div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop}>{running ? "⏹ Stop" : "☢️ Start Decay"}</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <DecayParticles count={remaining} total={initial} />
          <Text position={[0, 0.3, 0]} fontSize={0.05} color="#e74c3c" anchorX="center">N = {remaining}/{initial}</Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">t½</span><span>{halfLife} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{time.toFixed(1)} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">N₀</span><span>{initial}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">N</span><span className="text-primary font-bold">{remaining}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Decayed</span><span>{initial - remaining}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Activity</span><span>{activity.toFixed(2)} /s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Half-lives</span><span>{(time / halfLife).toFixed(2)}</span></div>
        </div>
      }
      graphPanel={
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="t" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} /><Tooltip contentStyle={{ fontSize: 10 }} /><Line type="monotone" dataKey="N" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} /></LineChart>
          </ResponsiveContainer>
        </div>
      }
    />
  );
}
