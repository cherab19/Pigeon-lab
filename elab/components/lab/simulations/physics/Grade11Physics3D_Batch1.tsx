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

// Helper: 3D Arrow
function Arrow3D({ from, to, color, label }: { from: [number, number, number]; to: [number, number, number]; color: string; label?: string }) {
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = dir.length();
  if (len < 0.01) return null;
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  const normDir = dir.clone().normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normDir);
  return (
    <group>
      <mesh position={mid} quaternion={quat}><cylinderGeometry args={[0.01, 0.01, len, 8]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={to} quaternion={quat}><coneGeometry args={[0.02, 0.05, 8]} /><meshStandardMaterial color={color} /></mesh>
      {label && <Text position={[mid[0], mid[1] + 0.07, mid[2]]} fontSize={0.035} color={color} anchorX="center">{label}</Text>}
    </group>
  );
}

// ═══════════════════════════════════════════════════
// 1. BOILING POINT vs ALTITUDE — 3D
// ═══════════════════════════════════════════════════

function BoilingSetup({ temperature, altitude, boiling }: { temperature: number; altitude: number; boiling: boolean }) {
  return (
    <>
      <LabRoom />
      {/* Beaker */}
      <group position={[0, -0.35, 0]}>
        <mesh><cylinderGeometry args={[0.2, 0.18, 0.35, 32, 1, true]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.25} roughness={0.05} transmission={0.8} /></mesh>
        <mesh position={[0, -0.17, 0]}><circleGeometry args={[0.18, 32]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
        {/* Water */}
        <mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.19, 0.17, 0.3, 32]} /><meshStandardMaterial color="#4488ff" transparent opacity={0.5} /></mesh>
        {/* Bubbles when boiling */}
        {boiling && Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[(Math.random() - 0.5) * 0.12, -0.1 + Math.random() * 0.2, (Math.random() - 0.5) * 0.12]}>
            <sphereGeometry args={[0.008 + Math.random() * 0.01, 8, 8]} />
            <meshStandardMaterial color="#fff" transparent opacity={0.4} />
          </mesh>
        ))}
        {/* Steam */}
        {boiling && Array.from({ length: 6 }, (_, i) => (
          <mesh key={`s${i}`} position={[(Math.random() - 0.5) * 0.1, 0.2 + Math.random() * 0.15, (Math.random() - 0.5) * 0.1]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color="#ddd" transparent opacity={0.25} />
          </mesh>
        ))}
      </group>
      {/* Thermometer */}
      <group position={[0.3, -0.15, 0]}>
        <mesh><cylinderGeometry args={[0.012, 0.012, 0.4, 12]} /><meshPhysicalMaterial color="#cce" transparent opacity={0.3} /></mesh>
        <mesh position={[0, -0.2, 0]}><sphereGeometry args={[0.02, 12, 12]} /><meshStandardMaterial color="#e74c3c" /></mesh>
        <mesh position={[0, -0.2 + (temperature / 100) * 0.2, 0]}><cylinderGeometry args={[0.008, 0.008, (temperature / 100) * 0.4, 12]} /><meshStandardMaterial color="#e74c3c" /></mesh>
        <Text position={[0.05, 0.05, 0]} fontSize={0.03} color="#e74c3c" anchorX="left">{temperature.toFixed(1)}°C</Text>
      </group>
      {/* Altitude label */}
      <Text position={[0, 0.4, 0]} fontSize={0.04} color="#aaa" anchorX="center">Altitude: {altitude}m</Text>
    </>
  );
}

export function BoilingPointAltitude3D() {
  const [altitude, setAltitude] = useState(0);
  const [heating, setHeating] = useState(false);
  const [temperature, setTemperature] = useState(25);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const boilingPoint = 100 - altitude * 0.0034;

  useEffect(() => {
    if (!heating) return;
    const id = setInterval(() => {
      setTemperature(prev => {
        if (prev >= boilingPoint) return boilingPoint;
        return prev + 0.5;
      });
    }, 50);
    return () => clearInterval(id);
  }, [heating, boilingPoint]);

  const boiling = temperature >= boilingPoint - 0.5;
  const reset = () => { setAltitude(0); setTemperature(25); setHeating(false); setStep(0); };
  const steps = ["Set altitude level", "Heat the water", "Observe boiling point change", "Record: BP decreases ~0.34°C per 100m", "Compare sea level vs mountain top"];

  return (
    <Simulation3DLayout
      title="3D Lab: Boiling Point vs Altitude"
      objective="Investigate how altitude affects boiling point"
      theory="At higher altitudes, lower pressure reduces boiling point by ~0.34°C per 100m."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Altitude: {altitude}m</label>
            <Slider value={[altitude]} onValueChange={v => { setAltitude(v[0]); setTemperature(25); setStep(Math.max(step, 1)); }} min={0} max={5000} step={100} />
          </div>
          <Button size="sm" className="w-full" variant={heating ? "destructive" : "default"} onClick={() => { setHeating(!heating); setStep(Math.max(step, 2)); playClick(); }}>
            {heating ? "🔥 Stop" : "🔥 Heat"}
          </Button>
        </div>
      }
      canvas3D={<BoilingSetup temperature={temperature} altitude={altitude} boiling={boiling} />}
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Altitude</span><span>{altitude} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">BP (theory)</span><span>{boilingPoint.toFixed(1)}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Current T</span><span className="text-primary font-bold">{temperature.toFixed(1)}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={boiling ? "text-red-400" : "text-blue-400"}>{boiling ? "BOILING" : "Heating..."}</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 2. VECTOR ADDITION (Grade 11) — 3D
// ═══════════════════════════════════════════════════

export function VectorAddition11_3D() {
  const [mag1, setMag1] = useState(6);
  const [ang1, setAng1] = useState(30);
  const [mag2, setMag2] = useState(4);
  const [ang2, setAng2] = useState(120);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const r1 = (ang1 * Math.PI) / 180, r2 = (ang2 * Math.PI) / 180;
  const ax = mag1 * Math.cos(r1), ay = mag1 * Math.sin(r1);
  const bx = mag2 * Math.cos(r2), by = mag2 * Math.sin(r2);
  const rx = ax + bx, ry = ay + by;
  const rMag = Math.sqrt(rx * rx + ry * ry);
  const rAng = (Math.atan2(ry, rx) * 180) / Math.PI;
  const sc = 0.1;

  const steps = ["Set Vector A", "Set Vector B", "Observe resultant R", "Verify component method", "Compare |R| with calculation"];
  const reset = () => { setMag1(6); setAng1(30); setMag2(4); setAng2(120); setStep(0); };

  return (
    <Simulation3DLayout title="3D Lab: Vector Addition" objective="Determine resultant using triangle/parallelogram method" theory="Rx = Ax+Bx, Ry = Ay+By. |R| = √(Rx²+Ry²)." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1"><label className="text-xs text-muted-foreground">|A|={mag1}</label><Slider value={[mag1]} onValueChange={v => setMag1(v[0])} min={1} max={10} step={0.5} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">θA={ang1}°</label><Slider value={[ang1]} onValueChange={v => setAng1(v[0])} min={0} max={360} step={5} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">|B|={mag2}</label><Slider value={[mag2]} onValueChange={v => setMag2(v[0])} min={1} max={10} step={0.5} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">θB={ang2}°</label><Slider value={[ang2]} onValueChange={v => setAng2(v[0])} min={0} max={360} step={5} /></div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom /><gridHelper args={[4, 20, "#8a8070", "#8a8070"]} position={[0, -0.49, 0]} />
          <Arrow3D from={[0, -0.48, 0]} to={[ax * sc, -0.48, -ay * sc]} color="#3498db" label={`A=${mag1}`} />
          <Arrow3D from={[ax * sc, -0.48, -ay * sc]} to={[(ax + bx) * sc, -0.48, -(ay + by) * sc]} color="#2ecc71" label={`B=${mag2}`} />
          <Arrow3D from={[0, -0.48, 0]} to={[rx * sc, -0.48, -ry * sc]} color="#e74c3c" label={`R=${rMag.toFixed(1)}`} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between text-blue-400"><span>A</span><span>{mag1} @ {ang1}°</span></div>
          <div className="flex justify-between text-green-400"><span>B</span><span>{mag2} @ {ang2}°</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Rx</span><span>{rx.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Ry</span><span>{ry.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold"><span className="text-muted-foreground">|R|</span><span className="text-primary">{rMag.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">θR</span><span>{rAng.toFixed(1)}°</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 3. FIELD DISPLACEMENT — 3D
// ═══════════════════════════════════════════════════

export function FieldDisplacement3D() {
  const [points, setPoints] = useState<[number, number, number][]>([[0, -0.48, 0]]);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const moves = [
    { label: "N 5m", d: [0, 0, -0.5] }, { label: "E 3m", d: [0.3, 0, 0] },
    { label: "S 2m", d: [0, 0, 0.2] }, { label: "W 4m", d: [-0.4, 0, 0] },
    { label: "NE 3m", d: [0.21, 0, -0.21] }, { label: "SW 2m", d: [-0.14, 0, 0.14] },
  ];

  const addMove = (d: number[]) => { const l = points[points.length - 1]; setPoints([...points, [l[0] + d[0], l[1] + d[1], l[2] + d[2]]]); setStep(Math.max(step, 2)); playClick(); };
  const totalDist = points.reduce((s, p, i) => i === 0 ? 0 : s + Math.sqrt((p[0] - points[i - 1][0]) ** 2 + (p[2] - points[i - 1][2]) ** 2), 0);
  const disp = Math.sqrt((points[points.length - 1][0] - points[0][0]) ** 2 + (points[points.length - 1][2] - points[0][2]) ** 2);
  const pathGeo = useMemo(() => { const g = new THREE.BufferGeometry(); if (points.length > 1) g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(points.flat()), 3)); return g; }, [points]);

  const reset = () => { setPoints([[0, -0.48, 0]]); setStep(0); };
  const steps = ["Start at origin", "Walk in field directions", "Trace path (distance)", "Measure displacement", "Compare distance vs displacement"];

  return (
    <Simulation3DLayout title="3D Lab: Field Displacement" objective="Distinguish distance traveled from displacement vector" theory="Distance = total path length. Displacement = straight-line start→end." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-semibold">Walk</span>
          {moves.map(m => <Button key={m.label} variant="outline" size="sm" className="w-full text-xs" onClick={() => addMove(m.d)}>{m.label}</Button>)}
        </div>
      }
      canvas3D={
        <>
          <LabRoom /><gridHelper args={[4, 20, "#8a8070", "#8a8070"]} position={[0, -0.49, 0]} />
          {points.length > 1 && <line><bufferGeometry attach="geometry" {...pathGeo} /><lineBasicMaterial attach="material" color="#3498db" /></line>}
          {points.length > 1 && <Arrow3D from={points[0]} to={points[points.length - 1]} color="#e74c3c" label={`d=${(disp * 10).toFixed(1)}m`} />}
          <mesh position={points[points.length - 1]}><sphereGeometry args={[0.04, 12, 12]} /><meshStandardMaterial color="#f39c12" /></mesh>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Steps</span><span>{points.length - 1}</span></div>
          <div className="flex justify-between text-blue-400"><span>Distance</span><span>{(totalDist * 10).toFixed(1)} m</span></div>
          <div className="flex justify-between text-red-400"><span>Displacement</span><span>{(disp * 10).toFixed(1)} m</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 4. UNIFORM MOTION — 3D
// ═══════════════════════════════════════════════════

export function UniformMotion3D() {
  const [velocity, setVelocity] = useState(3);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [data, setData] = useState<{ t: number; d: number }[]>([]);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const dist = velocity * time;

  const startStop = useCallback(() => {
    if (running) { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); return; }
    setTime(0); setData([]); setRunning(true); setStep(Math.max(step, 2));
    const start = Date.now();
    intervalRef.current = window.setInterval(() => {
      const t = (Date.now() - start) / 1000;
      if (t > 8) { clearInterval(intervalRef.current!); setRunning(false); return; }
      setTime(t); setData(prev => [...prev.slice(-100), { t: +t.toFixed(2), d: +(velocity * t).toFixed(2) }]);
    }, 50); playClick();
  }, [running, step, velocity, playClick]);

  const reset = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); setTime(0); setData([]); setStep(0); };
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);
  const steps = ["Set constant velocity", "Start the motion", "Observe linear d-t graph", "Verify d = vt", "Slope of d-t = velocity"];

  return (
    <Simulation3DLayout title="3D Lab: Uniform Motion" objective="Observe constant velocity and plot distance-time graph" theory="d = vt. Distance-time graph is linear through origin." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1"><label className="text-xs text-muted-foreground">v: {velocity.toFixed(1)} m/s</label><Slider value={[velocity]} onValueChange={v => setVelocity(v[0])} min={0.5} max={8} step={0.5} disabled={running} /></div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop}>{running ? "⏹ Stop" : "▶ Start"}</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <mesh position={[0, -0.47, 0]}><boxGeometry args={[3.5, 0.01, 0.2]} /><meshStandardMaterial color="#555" /></mesh>
          <group position={[Math.min(dist * 0.12, 1.5) - 1.5, -0.38, 0]}>
            <mesh castShadow><boxGeometry args={[0.18, 0.06, 0.1]} /><meshStandardMaterial color="#2ecc71" metalness={0.3} /></mesh>
            <Text position={[0, 0.08, 0]} fontSize={0.03} color="#2ecc71" anchorX="center">v={velocity}m/s</Text>
          </group>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">v</span><span>{velocity.toFixed(1)} m/s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">t</span><span>{time.toFixed(2)} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">d = vt</span><span className="text-primary font-bold">{dist.toFixed(2)} m</span></div>
        </div>
      }
      graphPanel={
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="t" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} /><Line type="monotone" dataKey="d" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} /></LineChart>
          </ResponsiveContainer>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 5. FREE FALL — 3D
// ═══════════════════════════════════════════════════

export function FreeFall3D() {
  const [height, setHeight] = useState(20);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [data, setData] = useState<{ t: number; h: number; v: number }[]>([]);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const g = 9.8;
  const h = Math.max(0, height - 0.5 * g * time * time);
  const v = g * time;
  const tTotal = Math.sqrt(2 * height / g);

  const startStop = useCallback(() => {
    if (running) { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); return; }
    setTime(0); setData([]); setRunning(true); setStep(Math.max(step, 2));
    const start = Date.now();
    intervalRef.current = window.setInterval(() => {
      const t = (Date.now() - start) / 1000;
      const hh = height - 0.5 * g * t * t;
      if (hh <= 0) { clearInterval(intervalRef.current!); setRunning(false); setTime(Math.sqrt(2 * height / g)); playClick(); return; }
      setTime(t); setData(prev => [...prev.slice(-100), { t: +t.toFixed(2), h: +Math.max(0, hh).toFixed(2), v: +(g * t).toFixed(2) }]);
    }, 30); playClick();
  }, [running, step, height, playClick]);

  const reset = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); setTime(0); setData([]); setStep(0); };
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);
  const steps = ["Set drop height", "Release the ball", "Observe free fall", "Verify v = gt", "Verify h = ½gt²"];

  return (
    <Simulation3DLayout title="3D Lab: Free Fall" objective="Observe free fall and determine g" theory="v = gt, h = ½gt², v² = 2gh. g ≈ 9.8 m/s²." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1"><label className="text-xs text-muted-foreground">Height: {height}m</label><Slider value={[height]} onValueChange={v => setHeight(v[0])} min={5} max={50} step={1} disabled={running} /></div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop}>{running ? "⏹ Stop" : "🔽 Drop"}</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <mesh position={[-0.8, -0.45 + height * 0.015, 0]}><boxGeometry args={[0.02, height * 0.03, 0.02]} /><meshStandardMaterial color="#666" metalness={0.7} /></mesh>
          <mesh position={[0, -0.45 + Math.max(0, h) * 0.03, 0]} castShadow><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#e74c3c" metalness={0.3} /></mesh>
          <mesh position={[0, -0.47, 0]} receiveShadow><boxGeometry args={[1, 0.02, 1]} /><meshStandardMaterial color="#8B4513" /></mesh>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">h₀</span><span>{height} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">h</span><span>{h.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">v = gt</span><span className="text-primary font-bold">{v.toFixed(2)} m/s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">t</span><span>{time.toFixed(3)} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">t_total</span><span>{tTotal.toFixed(3)} s</span></div>
        </div>
      }
      graphPanel={
        <div className="grid grid-cols-2 gap-4 h-[140px]">
          <div><span className="text-[10px] text-muted-foreground">Height–Time</span>
            <ResponsiveContainer width="100%" height={130}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="t" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} /><Line type="monotone" dataKey="h" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} /></LineChart></ResponsiveContainer>
          </div>
          <div><span className="text-[10px] text-muted-foreground">Velocity–Time</span>
            <ResponsiveContainer width="100%" height={130}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="t" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} /><Line type="monotone" dataKey="v" stroke="#e74c3c" dot={false} strokeWidth={2} /></LineChart></ResponsiveContainer>
          </div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 6. PROJECTILE MOTION — 3D
// ═══════════════════════════════════════════════════

export function ProjectileMotion3D() {
  const [v0, setV0] = useState(20);
  const [angle, setAngle] = useState(45);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [trail, setTrail] = useState<[number, number, number][]>([]);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const g = 9.8;
  const rad = (angle * Math.PI) / 180;
  const vx = v0 * Math.cos(rad), vy0 = v0 * Math.sin(rad);
  const tFlight = (2 * vy0) / g;
  const range = v0 * v0 * Math.sin(2 * rad) / g;
  const maxH = vy0 * vy0 / (2 * g);

  const x = vx * time;
  const y = vy0 * time - 0.5 * g * time * time;
  const sc = 0.015;

  const startStop = useCallback(() => {
    if (running) { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); return; }
    setTime(0); setTrail([]); setRunning(true); setStep(Math.max(step, 2));
    const start = Date.now();
    intervalRef.current = window.setInterval(() => {
      const t = (Date.now() - start) / 1000;
      const yy = vy0 * t - 0.5 * g * t * t;
      if (yy < 0 && t > 0.1) { clearInterval(intervalRef.current!); setRunning(false); return; }
      setTime(t);
      setTrail(prev => [...prev.slice(-200), [vx * t * sc, Math.max(0, yy * sc) - 0.48, 0]]);
    }, 20); playClick();
  }, [running, step, vx, vy0, playClick]);

  const reset = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); setTime(0); setTrail([]); setStep(0); };
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const trailGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    if (trail.length > 1) g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(trail.flat()), 3));
    return g;
  }, [trail]);

  const steps = ["Set launch velocity", "Set launch angle", "Fire projectile", "Observe parabolic trajectory", "Verify range & max height"];

  return (
    <Simulation3DLayout title="3D Lab: Projectile Motion" objective="Observe parabolic trajectory and verify kinematic equations" theory="x = v₀cosθ·t, y = v₀sinθ·t − ½gt². Range = v₀²sin2θ/g." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1"><label className="text-xs text-muted-foreground">v₀: {v0} m/s</label><Slider value={[v0]} onValueChange={v => setV0(v[0])} min={5} max={40} step={1} disabled={running} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">θ: {angle}°</label><Slider value={[angle]} onValueChange={v => setAngle(v[0])} min={5} max={85} step={1} disabled={running} /></div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop}>{running ? "⏹ Stop" : "🚀 Launch"}</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Ground */}
          <mesh position={[0, -0.49, 0]}><boxGeometry args={[4, 0.01, 1]} /><meshStandardMaterial color="#4a3" /></mesh>
          {/* Cannon */}
          <group position={[-1.5, -0.45, 0]} rotation={[0, 0, rad]}>
            <mesh><cylinderGeometry args={[0.03, 0.04, 0.2, 12]} /><meshStandardMaterial color="#555" metalness={0.8} /></mesh>
          </group>
          {/* Trail */}
          {trail.length > 1 && <line><bufferGeometry attach="geometry" {...trailGeo} /><lineBasicMaterial attach="material" color="#f39c12" /></line>}
          {/* Ball */}
          <mesh position={[x * sc - 1.5, Math.max(0, y * sc) - 0.48, 0]} castShadow>
            <sphereGeometry args={[0.03, 12, 12]} /><meshStandardMaterial color="#e74c3c" />
          </mesh>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">t</span><span>{time.toFixed(2)} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">x</span><span>{x.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">y</span><span>{Math.max(0, y).toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Range</span><span className="text-primary font-bold">{range.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Max H</span><span>{maxH.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">T flight</span><span>{tFlight.toFixed(2)} s</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 7. NEWTON'S SECOND LAW (Grade 11) — 3D
// ═══════════════════════════════════════════════════

export function NewtonsSecondLaw11_3D() {
  const [mass, setMass] = useState(3);
  const [force, setForce] = useState(10);
  const [friction, setFriction] = useState(0.1);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [data, setData] = useState<{ t: number; v: number; a: number }[]>([]);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const g = 9.8;
  const frictionF = friction * mass * g;
  const netForce = Math.max(0, force - frictionF);
  const accel = netForce / mass;
  const vel = accel * time;
  const pos = 0.5 * accel * time * time;

  const startStop = useCallback(() => {
    if (running) { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); return; }
    setTime(0); setData([]); setRunning(true); setStep(Math.max(step, 3));
    const start = Date.now();
    intervalRef.current = window.setInterval(() => {
      const t = (Date.now() - start) / 1000;
      if (t > 6) { clearInterval(intervalRef.current!); setRunning(false); return; }
      setTime(t);
      const a = Math.max(0, force - friction * mass * g) / mass;
      setData(prev => [...prev.slice(-100), { t: +t.toFixed(2), v: +(a * t).toFixed(2), a: +a.toFixed(2) }]);
    }, 50); playClick();
  }, [running, step, force, mass, friction, playClick]);

  const reset = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); setTime(0); setData([]); setStep(0); };
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);
  const steps = ["Set mass", "Set applied force", "Set friction coefficient", "Apply force", "Verify F_net = ma"];

  return (
    <Simulation3DLayout title="3D Lab: Newton's Second Law" objective="Verify F_net = ma with friction" theory="F_net = F_applied − f_friction = ma. f = μmg." onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1"><label className="text-xs text-muted-foreground">m: {mass}kg</label><Slider value={[mass]} onValueChange={v => setMass(v[0])} min={0.5} max={10} step={0.5} disabled={running} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">F: {force}N</label><Slider value={[force]} onValueChange={v => setForce(v[0])} min={1} max={50} step={1} disabled={running} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">μ: {friction.toFixed(2)}</label><Slider value={[friction]} onValueChange={v => setFriction(v[0])} min={0} max={0.8} step={0.05} disabled={running} /></div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop}>{running ? "⏹ Stop" : "▶ Apply"}</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <mesh position={[0, -0.47, 0]}><boxGeometry args={[3.5, 0.01, 0.2]} /><meshStandardMaterial color="#555" /></mesh>
          <group position={[Math.min(pos * 0.08, 1.5) - 1.5, -0.38, 0]}>
            <mesh castShadow><boxGeometry args={[0.15 + mass * 0.015, 0.08, 0.1]} /><meshStandardMaterial color="#9b59b6" metalness={0.3} /></mesh>
            <Text position={[0, 0.1, 0]} fontSize={0.025} color="#9b59b6" anchorX="center">{mass}kg</Text>
          </group>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">F_applied</span><span>{force} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">f_friction</span><span>{frictionF.toFixed(1)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">F_net</span><span>{netForce.toFixed(1)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">a</span><span className="text-primary font-bold">{accel.toFixed(2)} m/s²</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">v</span><span>{vel.toFixed(2)} m/s</span></div>
        </div>
      }
      graphPanel={
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="t" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} /><Tooltip contentStyle={{ fontSize: 10 }} /><Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} name="v" /></LineChart>
          </ResponsiveContainer>
        </div>
      }
    />
  );
}
