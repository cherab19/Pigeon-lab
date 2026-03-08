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
// Helper: 3D Arrow
// ═══════════════════════════════════════════════════
function Arrow3D({ from, to, color, label }: {
  from: [number, number, number]; to: [number, number, number]; color: string; label?: string;
}) {
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = dir.length();
  if (len < 0.01) return null;
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  const normDir = dir.clone().normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normDir);

  return (
    <group>
      <mesh position={mid} quaternion={quat}>
        <cylinderGeometry args={[0.012, 0.012, len, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={to} quaternion={quat}>
        <coneGeometry args={[0.025, 0.06, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {label && (
        <Text position={[mid[0], mid[1] + 0.08, mid[2]]} fontSize={0.04} color={color} anchorX="center">
          {label}
        </Text>
      )}
    </group>
  );
}

// ═══════════════════════════════════════════════════
// 1. VECTOR ADDITION — 3D
// ═══════════════════════════════════════════════════

export function VectorAddition3D() {
  const [mag1, setMag1] = useState(5);
  const [ang1, setAng1] = useState(0);
  const [mag2, setMag2] = useState(5);
  const [ang2, setAng2] = useState(90);
  const [showComponents, setShowComponents] = useState(false);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const r1 = (ang1 * Math.PI) / 180, r2 = (ang2 * Math.PI) / 180;
  const ax = mag1 * Math.cos(r1), ay = mag1 * Math.sin(r1);
  const bx = mag2 * Math.cos(r2), by = mag2 * Math.sin(r2);
  const rx = ax + bx, ry = ay + by;
  const rMag = Math.sqrt(rx * rx + ry * ry);
  const rAng = (Math.atan2(ry, rx) * 180) / Math.PI;
  const sc = 0.12;

  const steps = ["Set Vector A magnitude & angle", "Set Vector B magnitude & angle", "Observe head-to-tail triangle method", "Check resultant magnitude & direction", "Toggle component view"];
  const reset = () => { setMag1(5); setAng1(0); setMag2(5); setAng2(90); setStep(0); setShowComponents(false); };

  return (
    <Simulation3DLayout
      title="3D Lab: Vector Addition (Triangle Method)"
      objective="Determine the resultant of two vectors using triangle/parallelogram method"
      theory="Rx = Ax+Bx, Ry = Ay+By. Triangle method places vectors head-to-tail."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">|A|: {mag1.toFixed(1)}</label>
            <Slider value={[mag1]} onValueChange={v => { setMag1(v[0]); setStep(Math.max(step, 1)); }} min={1} max={10} step={0.5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">θA: {ang1}°</label>
            <Slider value={[ang1]} onValueChange={v => setAng1(v[0])} min={0} max={360} step={5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">|B|: {mag2.toFixed(1)}</label>
            <Slider value={[mag2]} onValueChange={v => { setMag2(v[0]); setStep(Math.max(step, 2)); }} min={1} max={10} step={0.5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">θB: {ang2}°</label>
            <Slider value={[ang2]} onValueChange={v => setAng2(v[0])} min={0} max={360} step={5} />
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={showComponents} onChange={e => { setShowComponents(e.target.checked); playClick(); }} className="rounded" />
            <span className="text-muted-foreground">Show components</span>
          </label>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <gridHelper args={[4, 20, "#8a8070", "#8a8070"]} position={[0, -0.49, 0]} />
          {/* Vector A (blue) */}
          <Arrow3D from={[0, -0.48, 0]} to={[ax * sc, -0.48, -ay * sc]} color="#3498db" label={`A = ${mag1.toFixed(1)}`} />
          {/* Vector B from head of A (green) */}
          <Arrow3D from={[ax * sc, -0.48, -ay * sc]} to={[(ax + bx) * sc, -0.48, -(ay + by) * sc]} color="#2ecc71" label={`B = ${mag2.toFixed(1)}`} />
          {/* Resultant (red) */}
          <Arrow3D from={[0, -0.48, 0]} to={[rx * sc, -0.48, -ry * sc]} color="#e74c3c" label={`R = ${rMag.toFixed(2)}`} />
          {/* Components */}
          {showComponents && (
            <>
              <Arrow3D from={[0, -0.47, 0]} to={[rx * sc, -0.47, 0]} color="#f39c12" label="Rx" />
              <Arrow3D from={[rx * sc, -0.47, 0]} to={[rx * sc, -0.47, -ry * sc]} color="#9b59b6" label="Ry" />
            </>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between text-blue-400"><span>A</span><span>{mag1.toFixed(1)} @ {ang1}°</span></div>
          <div className="flex justify-between text-green-400"><span>B</span><span>{mag2.toFixed(1)} @ {ang2}°</span></div>
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
// 2. VECTOR RESOLUTION — 3D
// ═══════════════════════════════════════════════════

export function VectorResolution3D() {
  const [magnitude, setMagnitude] = useState(8);
  const [angle, setAngle] = useState(45);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const rad = (angle * Math.PI) / 180;
  const vx = magnitude * Math.cos(rad);
  const vy = magnitude * Math.sin(rad);
  const sc = 0.1;

  const steps = ["Set vector magnitude", "Set vector angle", "Observe horizontal component (Ax = A cosθ)", "Observe vertical component (Ay = A sinθ)", "Verify: A² = Ax² + Ay²"];
  const reset = () => { setMagnitude(8); setAngle(45); setStep(0); };

  return (
    <Simulation3DLayout
      title="3D Lab: Vector Resolution"
      objective="Resolve a vector into horizontal and vertical components"
      theory="Ax = A cosθ, Ay = A sinθ. The original vector is the hypotenuse."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">|A|: {magnitude.toFixed(1)}</label>
            <Slider value={[magnitude]} onValueChange={v => { setMagnitude(v[0]); setStep(Math.max(step, 1)); }} min={1} max={15} step={0.5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">θ: {angle}°</label>
            <Slider value={[angle]} onValueChange={v => { setAngle(v[0]); setStep(Math.max(step, 2)); }} min={0} max={360} step={1} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <gridHelper args={[4, 20, "#8a8070", "#8a8070"]} position={[0, -0.49, 0]} />
          {/* Original vector */}
          <Arrow3D from={[0, -0.48, 0]} to={[vx * sc, -0.48, -vy * sc]} color="#e74c3c" label={`A = ${magnitude.toFixed(1)}`} />
          {/* Horizontal component */}
          <Arrow3D from={[0, -0.47, 0]} to={[vx * sc, -0.47, 0]} color="#3498db" label={`Ax = ${vx.toFixed(2)}`} />
          {/* Vertical component */}
          <Arrow3D from={[vx * sc, -0.47, 0]} to={[vx * sc, -0.47, -vy * sc]} color="#2ecc71" label={`Ay = ${vy.toFixed(2)}`} />
          {/* Angle arc text */}
          <Text position={[0.15, -0.46, -0.05]} fontSize={0.04} color="#f39c12" anchorX="center">
            θ = {angle}°
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">|A|</span><span className="text-primary font-bold">{magnitude.toFixed(1)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">θ</span><span>{angle}°</span></div>
          <div className="flex justify-between text-blue-400"><span>Ax = Acosθ</span><span>{vx.toFixed(2)}</span></div>
          <div className="flex justify-between text-green-400"><span>Ay = Asinθ</span><span>{vy.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Ax²+Ay²</span><span>{(vx * vx + vy * vy).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">A²</span><span>{(magnitude * magnitude).toFixed(2)}</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 3. DISTANCE vs DISPLACEMENT (Grade 10) — 3D
// ═══════════════════════════════════════════════════

export function DistanceDisplacement10_3D() {
  const [points, setPoints] = useState<[number, number, number][]>([[0, -0.48, 0]]);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const moves = [
    { label: "→ East 3m", delta: [0.3, 0, 0] },
    { label: "↑ North 4m", delta: [0, 0, -0.4] },
    { label: "← West 2m", delta: [-0.2, 0, 0] },
    { label: "↓ South 1m", delta: [0, 0, 0.1] },
  ];

  const addMove = (d: number[]) => {
    const last = points[points.length - 1];
    setPoints([...points, [last[0] + d[0], last[1] + d[1], last[2] + d[2]]]);
    setStep(Math.max(step, 2)); playClick();
  };

  const totalDist = points.reduce((s, p, i) => {
    if (i === 0) return 0;
    const pr = points[i - 1];
    return s + Math.sqrt((p[0] - pr[0]) ** 2 + (p[2] - pr[2]) ** 2);
  }, 0);
  const disp = Math.sqrt((points[points.length - 1][0] - points[0][0]) ** 2 + (points[points.length - 1][2] - points[0][2]) ** 2);

  const pathGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    if (points.length > 1) g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(points.flat()), 3));
    return g;
  }, [points]);

  const reset = () => { setPoints([[0, -0.48, 0]]); setStep(0); };
  const steps = ["Start at origin", "Move in directions", "Trace total path (distance)", "Compare displacement (straight line)", "Distance ≥ Displacement always"];

  return (
    <Simulation3DLayout
      title="3D Lab: Distance vs Displacement"
      objective="Distinguish between scalar distance and vector displacement"
      theory="Distance = total path. Displacement = straight-line start→end."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-semibold">Move</span>
          {moves.map(m => (
            <Button key={m.label} variant="outline" size="sm" className="w-full text-xs" onClick={() => addMove(m.delta)}>{m.label}</Button>
          ))}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <gridHelper args={[4, 20, "#8a8070", "#8a8070"]} position={[0, -0.49, 0]} />
          {/* Path */}
          {points.length > 1 && (
            <line><bufferGeometry attach="geometry" {...pathGeo} /><lineBasicMaterial attach="material" color="#3498db" linewidth={2} /></line>
          )}
          {/* Displacement arrow */}
          {points.length > 1 && <Arrow3D from={points[0]} to={points[points.length - 1]} color="#e74c3c" label={`d=${(disp * 10).toFixed(1)}m`} />}
          {/* Walker */}
          <mesh position={points[points.length - 1]} castShadow>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>
          <mesh position={points[0]} castShadow>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color="#2ecc71" />
          </mesh>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Steps</span><span>{points.length - 1}</span></div>
          <div className="flex justify-between text-blue-400"><span>Distance</span><span>{(totalDist * 10).toFixed(1)} m</span></div>
          <div className="flex justify-between text-red-400"><span>Displacement</span><span>{(disp * 10).toFixed(1)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">d/D</span><span>{totalDist > 0 ? (disp / totalDist).toFixed(3) : "—"}</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 4. UNIFORM ACCELERATION — 3D
// ═══════════════════════════════════════════════════

export function AccelerationSim3D() {
  const [u, setU] = useState(0);
  const [a, setA] = useState(2);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [data, setData] = useState<{ t: number; v: number; s: number }[]>([]);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const v = u + a * time;
  const s = u * time + 0.5 * a * time * time;

  const startStop = useCallback(() => {
    if (running) { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); return; }
    setTime(0); setData([]); setRunning(true); setStep(Math.max(step, 2));
    const start = Date.now();
    intervalRef.current = window.setInterval(() => {
      const t = (Date.now() - start) / 1000;
      if (t > 8) { clearInterval(intervalRef.current!); setRunning(false); return; }
      setTime(t);
      setData(prev => [...prev.slice(-100), { t: +t.toFixed(2), v: +(u + a * t).toFixed(2), s: +(u * t + 0.5 * a * t * t).toFixed(2) }]);
    }, 50);
    playClick();
  }, [running, step, u, a, playClick]);

  const reset = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); setTime(0); setData([]); setStep(0); };
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const steps = ["Set initial velocity (u)", "Set acceleration (a)", "Start and observe motion", "Verify v = u + at", "Verify s = ut + ½at²"];

  return (
    <Simulation3DLayout
      title="3D Lab: Uniform Acceleration"
      objective="Verify kinematic equations: v = u+at, s = ut+½at²"
      theory="For constant acceleration: v = u+at, s = ut+½at², v² = u²+2as."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">u: {u.toFixed(1)} m/s</label>
            <Slider value={[u]} onValueChange={v => setU(v[0])} min={0} max={5} step={0.5} disabled={running} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">a: {a.toFixed(1)} m/s²</label>
            <Slider value={[a]} onValueChange={v => setA(v[0])} min={-3} max={5} step={0.1} disabled={running} />
          </div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop}>
            {running ? "⏹ Stop" : "▶ Start"}
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <mesh position={[0, -0.47, 0]}><boxGeometry args={[3.5, 0.01, 0.2]} /><meshStandardMaterial color="#555" /></mesh>
          {/* Car */}
          <group position={[Math.min(s * 0.1, 1.6) - 1.5, -0.38, 0]}>
            <mesh castShadow><boxGeometry args={[0.2, 0.06, 0.1]} /><meshStandardMaterial color="#3498db" metalness={0.3} /></mesh>
            <mesh position={[0, 0.05, 0]} castShadow><boxGeometry args={[0.1, 0.05, 0.08]} /><meshStandardMaterial color="#2980b9" /></mesh>
            {[[-0.07, -0.03, 0.06], [0.07, -0.03, 0.06], [-0.07, -0.03, -0.06], [0.07, -0.03, -0.06]].map((p, i) => (
              <mesh key={i} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.015, 12]} /><meshStandardMaterial color="#333" />
              </mesh>
            ))}
            <Text position={[0, 0.12, 0]} fontSize={0.03} color="#3498db" anchorX="center">v={v.toFixed(1)}m/s</Text>
          </group>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">t</span><span>{time.toFixed(2)} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">v = u+at</span><span className="text-primary font-bold">{v.toFixed(2)} m/s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">s = ut+½at²</span><span>{s.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">v²</span><span>{(v * v).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">u²+2as</span><span>{(u * u + 2 * a * s).toFixed(2)}</span></div>
        </div>
      }
      graphPanel={
        <div className="grid grid-cols-2 gap-4 h-[140px]">
          <div>
            <span className="text-[10px] text-muted-foreground">Position–Time</span>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="t" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} />
                <Line type="monotone" dataKey="s" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Velocity–Time</span>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="t" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} />
                <Line type="monotone" dataKey="v" stroke="#e74c3c" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 5. STRESS–STRAIN EXPERIMENT — 3D
// ═══════════════════════════════════════════════════

function Wire3D({ strain, material }: { strain: number; material: string }) {
  const cols: Record<string, string> = { steel: "#708090", copper: "#B87333", aluminum: "#C0C0C0", rubber: "#333" };
  const len = 1 + strain * 2;
  return (
    <group position={[0, 0.2, 0]}>
      {/* Support clamp */}
      <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.3, 0.03, 0.1]} /><meshStandardMaterial color="#555" metalness={0.8} /></mesh>
      {/* Wire */}
      <mesh position={[0, 0.3 - len / 2, 0]}>
        <cylinderGeometry args={[0.008, 0.008 * (1 - strain * 0.3), len, 12]} />
        <meshStandardMaterial color={cols[material] || "#888"} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Weight */}
      <mesh position={[0, 0.3 - len - 0.04, 0]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.4} />
      </mesh>
    </group>
  );
}

export function StressStrain3D() {
  const [material, setMaterial] = useState("steel");
  const [force, setForce] = useState(10);
  const [area, setArea] = useState(1e-6);
  const [origLen, setOrigLen] = useState(1);
  const [step, setStep] = useState(0);
  const [dataPoints, setDataPoints] = useState<{ stress: number; strain: number }[]>([]);
  const { playClick } = useSoundEffects();

  const youngsMod: Record<string, number> = { steel: 200e9, copper: 120e9, aluminum: 70e9, rubber: 0.01e9 };
  const E = youngsMod[material] || 200e9;
  const stress = force / area;
  const strain = stress / E;
  const extension = strain * origLen;

  const addPoint = () => {
    setDataPoints(prev => [...prev, { stress: +(stress / 1e6).toFixed(2), strain: +(strain * 1000).toFixed(4) }]);
    setStep(Math.max(step, 3)); playClick();
  };

  const reset = () => { setForce(10); setStep(0); setDataPoints([]); };
  const steps = ["Select material", "Set cross-section area", "Apply force gradually", "Record stress-strain points", "Plot & find Young's modulus"];

  return (
    <Simulation3DLayout
      title="3D Lab: Stress–Strain Experiment"
      objective="Determine stress-strain relationship and Young's modulus"
      theory="Stress = F/A, Strain = ΔL/L. Young's modulus E = Stress/Strain."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Material</span>
            {["steel", "copper", "aluminum", "rubber"].map(m => (
              <Button key={m} variant={material === m ? "default" : "outline"} size="sm" className="w-full capitalize text-xs"
                onClick={() => { setMaterial(m); setStep(Math.max(step, 1)); playClick(); }}>
                {m} (E={((youngsMod[m] || 0) / 1e9).toFixed(0)}GPa)
              </Button>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Force: {force} N</label>
            <Slider value={[force]} onValueChange={v => { setForce(v[0]); setStep(Math.max(step, 2)); }} min={1} max={500} step={5} />
          </div>
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={addPoint}>📌 Record Point</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <Wire3D strain={Math.min(strain * 500, 0.3)} material={material} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Force</span><span>{force} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Stress</span><span>{(stress / 1e6).toFixed(2)} MPa</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Strain</span><span>{(strain * 1000).toFixed(4)} ×10⁻³</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ΔL</span><span>{(extension * 1000).toFixed(4)} mm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">E</span><span className="text-primary font-bold">{(E / 1e9).toFixed(0)} GPa</span></div>
        </div>
      }
      graphPanel={dataPoints.length > 0 ? (
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="strain" tick={{ fontSize: 9 }} label={{ value: "Strain ×10⁻³", fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} label={{ value: "Stress (MPa)", fontSize: 9, angle: -90 }} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="stress" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : undefined}
    />
  );
}
