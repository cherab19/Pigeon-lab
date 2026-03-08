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
// 6. NEWTON'S SECOND LAW (F = ma) — 3D
// ═══════════════════════════════════════════════════

function CartOnTrack({ position, mass, force }: { position: number; mass: number; force: number }) {
  const scale = 0.5 + mass / 10;
  return (
    <group position={[position * 0.12 - 1.2, -0.38, 0]}>
      {/* Cart body */}
      <mesh castShadow>
        <boxGeometry args={[0.22 * scale, 0.08 * scale, 0.12]} />
        <meshStandardMaterial color="#3498db" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Mass label */}
      <Text position={[0, 0.08, 0]} fontSize={0.03} color="#3498db" anchorX="center">
        {mass.toFixed(1)} kg
      </Text>
      {/* Wheels */}
      {[[-0.08 * scale, -0.05 * scale, 0.07], [0.08 * scale, -0.05 * scale, 0.07],
        [-0.08 * scale, -0.05 * scale, -0.07], [0.08 * scale, -0.05 * scale, -0.07]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.015, 12]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
      {/* Force arrow */}
      {force > 0 && (
        <group position={[0.15 * scale, 0, 0]}>
          <mesh>
            <boxGeometry args={[force * 0.02, 0.01, 0.01]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <mesh position={[force * 0.01, 0, 0]}>
            <coneGeometry args={[0.015, 0.03, 8]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <Text position={[force * 0.01, 0.04, 0]} fontSize={0.025} color="#e74c3c" anchorX="center">
            F = {force.toFixed(1)}N
          </Text>
        </group>
      )}
    </group>
  );
}

export function NewtonsSecondLaw3D() {
  const [mass, setMass] = useState(2);
  const [force, setForce] = useState(5);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [data, setData] = useState<{ t: number; a: number; v: number; x: number }[]>([]);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const accel = force / mass;
  const currentV = accel * time;
  const currentX = 0.5 * accel * time * time;

  const startStop = useCallback(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      playClick();
    } else {
      setTime(0); setData([]);
      setRunning(true); setStep(Math.max(step, 2));
      const start = Date.now();
      intervalRef.current = window.setInterval(() => {
        const t = (Date.now() - start) / 1000;
        if (t > 6) { clearInterval(intervalRef.current!); setRunning(false); return; }
        setTime(t);
        const a = force / mass;
        setData(prev => [...prev.slice(-100), { t: +t.toFixed(2), a: +a.toFixed(2), v: +(a * t).toFixed(2), x: +(0.5 * a * t * t).toFixed(2) }]);
      }, 50);
      playClick();
    }
  }, [running, step, force, mass, playClick]);

  const reset = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); setTime(0); setData([]); setStep(0); };
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const steps = ["Set mass and applied force", "Press Start to apply force", "Observe acceleration = F/m", "Analyze velocity-time graph", "Verify F = ma relationship"];

  return (
    <Simulation3DLayout
      title="3D Lab: Newton's Second Law (F = ma)"
      objective="Verify that acceleration is proportional to force and inversely proportional to mass"
      theory="F_net = ma. Acceleration ∝ Force, Acceleration ∝ 1/mass."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Mass: {mass.toFixed(1)} kg</label>
            <Slider value={[mass]} onValueChange={v => setMass(v[0])} min={0.5} max={10} step={0.5} disabled={running} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Force: {force.toFixed(1)} N</label>
            <Slider value={[force]} onValueChange={v => setForce(v[0])} min={1} max={20} step={0.5} disabled={running} />
          </div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop}>
            {running ? "⏹ Stop" : "▶ Apply Force"}
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <mesh position={[0, -0.47, 0]} receiveShadow>
            <boxGeometry args={[3.5, 0.01, 0.2]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          <CartOnTrack position={Math.min(currentX, 20)} mass={mass} force={running ? force : 0} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">F</span><span>{force.toFixed(1)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">m</span><span>{mass.toFixed(1)} kg</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">a = F/m</span><span className="text-primary font-bold">{accel.toFixed(2)} m/s²</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">v</span><span>{currentV.toFixed(2)} m/s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">x</span><span>{currentX.toFixed(2)} m</span></div>
        </div>
      }
      graphPanel={
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="t" tick={{ fontSize: 9 }} label={{ value: "t (s)", fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} name="v (m/s)" />
              <Line type="monotone" dataKey="x" stroke="#e74c3c" dot={false} strokeWidth={2} name="x (m)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 7. WORK & ENERGY TRANSFORMATION — 3D
// ═══════════════════════════════════════════════════

function EnergyBall({ height, maxHeight }: { height: number; maxHeight: number }) {
  const mass = 1;
  const g = 9.8;
  const pe = mass * g * height;
  const ke = mass * g * (maxHeight - height);
  const peRatio = pe / (mass * g * maxHeight);
  const keRatio = ke / (mass * g * maxHeight);

  return (
    <group position={[0, -0.45 + height * 0.15, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.06, 20, 20]} />
        <meshStandardMaterial color={`hsl(${peRatio * 240}, 80%, 50%)`} metalness={0.3} />
      </mesh>
      {/* PE bar */}
      <mesh position={[-0.15, 0, 0]}>
        <boxGeometry args={[0.03, peRatio * 0.3, 0.03]} />
        <meshStandardMaterial color="#3498db" transparent opacity={0.8} />
      </mesh>
      {/* KE bar */}
      <mesh position={[0.15, 0, 0]}>
        <boxGeometry args={[0.03, keRatio * 0.3, 0.03]} />
        <meshStandardMaterial color="#e74c3c" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

export function WorkEnergy3D() {
  const [maxHeight, setMaxHeight] = useState(5);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const g = 9.8;
  const mass = 1;
  const height = Math.max(0, maxHeight - 0.5 * g * time * time);
  const velocity = Math.sqrt(2 * g * (maxHeight - height));
  const pe = mass * g * height;
  const ke = 0.5 * mass * velocity * velocity;
  const totalE = mass * g * maxHeight;

  const startDrop = useCallback(() => {
    if (running) { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); return; }
    setTime(0); setRunning(true); setStep(Math.max(step, 2));
    const start = Date.now();
    intervalRef.current = window.setInterval(() => {
      const t = (Date.now() - start) / 1000;
      const h = maxHeight - 0.5 * g * t * t;
      if (h <= 0) { clearInterval(intervalRef.current!); setRunning(false); setTime(Math.sqrt(2 * maxHeight / g)); playClick(); return; }
      setTime(t);
    }, 16);
  }, [running, step, maxHeight, playClick]);

  const reset = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); setTime(0); setStep(0); };
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const steps = ["Set drop height", "Press Drop to release the ball", "Watch PE convert to KE", "Observe total energy conservation", "Note: PE + KE = constant"];

  return (
    <Simulation3DLayout
      title="3D Lab: Work & Energy Transformation"
      objective="Observe PE → KE conversion and verify energy conservation"
      theory="PE = mgh, KE = ½mv². Total energy is conserved: PE + KE = constant."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Height: {maxHeight.toFixed(1)} m</label>
            <Slider value={[maxHeight]} onValueChange={v => setMaxHeight(v[0])} min={1} max={10} step={0.5} disabled={running} />
          </div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startDrop}>
            {running ? "⏹ Stop" : "🔽 Drop"}
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Height scale */}
          <mesh position={[-1, -0.45 + maxHeight * 0.075, 0]}>
            <boxGeometry args={[0.01, maxHeight * 0.15, 0.01]} />
            <meshStandardMaterial color="#888" />
          </mesh>
          <EnergyBall height={height} maxHeight={maxHeight} />
          {/* Ground marker */}
          <mesh position={[0, -0.47, 0]} receiveShadow>
            <boxGeometry args={[1, 0.02, 1]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Height</span><span>{height.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Velocity</span><span>{velocity.toFixed(2)} m/s</span></div>
          <div className="flex justify-between text-blue-400"><span>PE</span><span>{pe.toFixed(2)} J</span></div>
          <div className="flex justify-between text-red-400"><span>KE</span><span>{ke.toFixed(2)} J</span></div>
          <div className="flex justify-between font-bold"><span className="text-muted-foreground">Total</span><span className="text-primary">{(pe + ke).toFixed(2)} J</span></div>
          <div className="mt-2 p-1.5 rounded bg-muted text-[10px]">
            Conservation: {((pe + ke) / totalE * 100).toFixed(1)}%
          </div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 8. HOOKE'S LAW (Spring) — 3D
// ═══════════════════════════════════════════════════

function Spring3D({ extension, springK }: { extension: number; springK: number }) {
  const coils = 10;
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const len = 0.4 + extension * 0.05;
    for (let i = 0; i <= coils * 20; i++) {
      const t = i / (coils * 20);
      const angle = t * coils * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * 0.03, -t * len, Math.sin(angle) * 0.03));
    }
    return pts;
  }, [extension]);

  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <group position={[0, 0.3, 0]}>
      {/* Support bar */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.4, 0.03, 0.1]} />
        <meshStandardMaterial color="#666" metalness={0.8} />
      </mesh>
      {/* Spring coil */}
      <line>
        <bufferGeometry attach="geometry" {...geo} />
        <lineBasicMaterial attach="material" color="#888" linewidth={2} />
      </line>
      {/* Hanging mass */}
      <mesh position={[0, -(0.4 + extension * 0.05), 0]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Extension indicator */}
      <Text position={[0.12, -(0.2 + extension * 0.025), 0]} fontSize={0.03} color="#e74c3c" anchorX="left">
        Δx = {extension.toFixed(2)} m
      </Text>
    </group>
  );
}

export function HookesLaw3D() {
  const [springK, setSpringK] = useState(20);
  const [mass, setMass] = useState(1);
  const [step, setStep] = useState(0);
  const [dataPoints, setDataPoints] = useState<{ F: number; x: number }[]>([]);
  const { playClick } = useSoundEffects();

  const g = 9.8;
  const force = mass * g;
  const extension = force / springK;

  const addDataPoint = () => {
    setDataPoints(prev => [...prev, { F: +force.toFixed(2), x: +extension.toFixed(4) }]);
    setStep(Math.max(step, 3));
    playClick();
  };

  const reset = () => { setMass(1); setSpringK(20); setStep(0); setDataPoints([]); };

  const steps = ["Set spring constant (k)", "Hang a mass on the spring", "Record extension for each mass", "Plot Force vs Extension graph", "Verify F = kx (linear relationship)"];

  return (
    <Simulation3DLayout
      title="3D Lab: Hooke's Law (F = kx)"
      objective="Verify Hooke's Law by measuring spring extension vs force"
      theory="Hooke's Law: F = kx. Extension is proportional to force in the elastic region."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Spring k: {springK} N/m</label>
            <Slider value={[springK]} onValueChange={v => setSpringK(v[0])} min={5} max={100} step={5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Mass: {mass.toFixed(1)} kg</label>
            <Slider value={[mass]} onValueChange={v => { setMass(v[0]); setStep(Math.max(step, 1)); }} min={0.1} max={5} step={0.1} />
          </div>
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={addDataPoint}>
            📌 Record Data Point
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <Spring3D extension={extension} springK={springK} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Mass</span><span>{mass.toFixed(1)} kg</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Force (mg)</span><span>{force.toFixed(2)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">k</span><span>{springK} N/m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Extension</span><span className="text-primary font-bold">{extension.toFixed(4)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Points</span><span>{dataPoints.length}</span></div>
        </div>
      }
      graphPanel={dataPoints.length > 0 ? (
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="x" tick={{ fontSize: 9 }} label={{ value: "x (m)", fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} label={{ value: "F (N)", fontSize: 9, angle: -90 }} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="F" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : undefined}
    />
  );
}

// ═══════════════════════════════════════════════════
// 9. LEVER LAB — 3D
// ═══════════════════════════════════════════════════

function Lever3DScene({ pivotPos, loadDist, loadMass, effortDist, effortForce, balanced }: {
  pivotPos: number; loadDist: number; loadMass: number; effortDist: number; effortForce: number; balanced: boolean;
}) {
  const beamRef = useRef<THREE.Group>(null);
  const loadTorque = loadMass * 9.8 * loadDist;
  const effortTorque = effortForce * effortDist;
  const tiltAngle = Math.max(-15, Math.min(15, (loadTorque - effortTorque) * 0.02));

  useFrame(() => {
    if (beamRef.current) {
      const target = (tiltAngle * Math.PI) / 180;
      beamRef.current.rotation.z += (target - beamRef.current.rotation.z) * 0.08;
    }
  });

  return (
    <>
      <LabRoom />
      <group position={[0, -0.25, 0]}>
        {/* Fulcrum (triangle) */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <coneGeometry args={[0.06, 0.12, 3]} />
          <meshStandardMaterial color="#f39c12" metalness={0.5} />
        </mesh>
        {/* Beam */}
        <group ref={beamRef} position={[0, -0.08, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.2, 0.03, 0.1]} />
            <meshStandardMaterial color="#8B4513" roughness={0.6} />
          </mesh>
          {/* Load */}
          <group position={[-loadDist * 0.35, -0.06, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.1, 0.08, 0.1]} />
              <meshStandardMaterial color="#e74c3c" metalness={0.3} />
            </mesh>
            <Text position={[0, -0.08, 0]} fontSize={0.025} color="#e74c3c" anchorX="center">
              {loadMass}kg
            </Text>
          </group>
          {/* Effort arrow */}
          <group position={[effortDist * 0.35, 0, 0]}>
            <mesh position={[0, -0.08, 0]}>
              <coneGeometry args={[0.015, 0.06, 8]} />
              <meshStandardMaterial color="#2ecc71" />
            </mesh>
            <Text position={[0, -0.16, 0]} fontSize={0.025} color="#2ecc71" anchorX="center">
              {effortForce.toFixed(1)}N
            </Text>
          </group>
          {/* Distance markers */}
          {Array.from({ length: 11 }, (_, i) => (
            <mesh key={i} position={[-1.1 + i * 0.22, -0.015, 0.06]}>
              <boxGeometry args={[0.003, 0.015, 0.005]} />
              <meshStandardMaterial color="#666" />
            </mesh>
          ))}
        </group>
        {balanced && (
          <Text position={[0, 0.15, 0]} fontSize={0.05} color="#2ecc71" anchorX="center">
            ✓ BALANCED
          </Text>
        )}
      </group>
    </>
  );
}

export function Lever3D() {
  const [loadMass, setLoadMass] = useState(5);
  const [loadDist, setLoadDist] = useState(2);
  const [effortDist, setEffortDist] = useState(3);
  const [effortForce, setEffortForce] = useState(10);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const loadForce = loadMass * 9.8;
  const loadTorque = loadForce * loadDist;
  const effortTorque = effortForce * effortDist;
  const balanced = Math.abs(loadTorque - effortTorque) < 2;
  const ma = loadForce / effortForce;

  const steps = ["Place a load on one side", "Set distances from pivot", "Adjust effort force", "Balance the lever", "Calculate MA = Load/Effort"];

  const reset = () => { setLoadMass(5); setLoadDist(2); setEffortDist(3); setEffortForce(10); setStep(0); };

  return (
    <Simulation3DLayout
      title="3D Lab: Lever (Principle of Moments)"
      objective="Verify: Effort × Effort Arm = Load × Load Arm"
      theory="MA = Load/Effort. For equilibrium: ΣClockwise moments = ΣAnticlockwise moments."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Load: {loadMass} kg</label>
            <Slider value={[loadMass]} onValueChange={v => { setLoadMass(v[0]); setStep(Math.max(step, 1)); playClick(); }} min={1} max={20} step={1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Load dist: {loadDist.toFixed(1)} m</label>
            <Slider value={[loadDist]} onValueChange={v => setLoadDist(v[0])} min={0.5} max={3} step={0.1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Effort dist: {effortDist.toFixed(1)} m</label>
            <Slider value={[effortDist]} onValueChange={v => setEffortDist(v[0])} min={0.5} max={3} step={0.1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Effort: {effortForce.toFixed(1)} N</label>
            <Slider value={[effortForce]} onValueChange={v => { setEffortForce(v[0]); setStep(Math.max(step, 3)); }} min={1} max={100} step={0.5} />
          </div>
        </div>
      }
      canvas3D={<Lever3DScene pivotPos={0} loadDist={loadDist} loadMass={loadMass} effortDist={effortDist} effortForce={effortForce} balanced={balanced} />}
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Load</span><span>{loadForce.toFixed(1)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Load τ</span><span>{loadTorque.toFixed(1)} N·m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Effort τ</span><span>{effortTorque.toFixed(1)} N·m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">MA</span><span className="text-primary font-bold">{ma.toFixed(2)}</span></div>
          {balanced && <div className="p-1.5 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-center text-[10px] font-bold">✅ Balanced!</div>}
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 10. INCLINED PLANE — 3D
// ═══════════════════════════════════════════════════

function InclinedPlane3DScene({ angle, mass, friction, position: objPos, sliding }: {
  angle: number; mass: number; friction: number; position: number; sliding: boolean;
}) {
  const rampRef = useRef<THREE.Group>(null);
  const rad = (angle * Math.PI) / 180;
  const rampLen = 2;

  return (
    <>
      <LabRoom />
      <group position={[0, -0.45, 0]}>
        {/* Ramp */}
        <group rotation={[0, 0, rad]}>
          <mesh position={[rampLen / 2 * Math.cos(rad) * 0.5, rampLen / 2 * Math.sin(rad) * 0.5, 0]} rotation={[0, 0, 0]} castShadow>
            <boxGeometry args={[rampLen, 0.03, 0.4]} />
            <meshStandardMaterial color="#8B7355" roughness={0.7} />
          </mesh>
          {/* Block on ramp */}
          <group position={[objPos * 0.08, 0.05, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.1, 0.08, 0.08]} />
              <meshStandardMaterial color="#3498db" metalness={0.3} />
            </mesh>
            <Text position={[0, 0.07, 0]} fontSize={0.025} color="#3498db" anchorX="center">
              {mass}kg
            </Text>
          </group>
        </group>
        {/* Angle arc */}
        <Text position={[0.3, 0.05, 0.3]} fontSize={0.04} color="#f39c12" anchorX="center">
          θ = {angle}°
        </Text>
        {/* Force arrows */}
        {sliding && (
          <Text position={[0, 0.3, 0]} fontSize={0.03} color="#e74c3c" anchorX="center">
            Sliding ↓
          </Text>
        )}
      </group>
    </>
  );
}

export function InclinedPlane3D() {
  const [angle, setAngle] = useState(30);
  const [mass, setMass] = useState(2);
  const [frictionCoeff, setFrictionCoeff] = useState(0.3);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const g = 9.8;
  const rad = (angle * Math.PI) / 180;
  const parallel = mass * g * Math.sin(rad);
  const normal = mass * g * Math.cos(rad);
  const frictionForce = frictionCoeff * normal;
  const netForce = parallel - frictionForce;
  const sliding = netForce > 0;
  const accel = sliding ? netForce / mass : 0;
  const objPos = 0.5 * accel * time * time;
  const velocity = accel * time;
  const efficiency = parallel > 0 ? (mass * g * Math.sin(rad) * 1) / (parallel * 1) * 100 : 0;

  const startStop = useCallback(() => {
    if (running) { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); return; }
    if (!sliding) return;
    setTime(0); setRunning(true); setStep(Math.max(step, 3));
    const start = Date.now();
    intervalRef.current = window.setInterval(() => {
      const t = (Date.now() - start) / 1000;
      if (t > 5) { clearInterval(intervalRef.current!); setRunning(false); return; }
      setTime(t);
    }, 16);
    playClick();
  }, [running, sliding, step, playClick]);

  const reset = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); setTime(0); setStep(0); };
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const steps = ["Set ramp angle", "Set mass and friction", "Check if block will slide", "Press Start to release", "Analyze forces and acceleration"];

  return (
    <Simulation3DLayout
      title="3D Lab: Inclined Plane"
      objective="Analyze forces on an inclined plane and calculate efficiency"
      theory="F_parallel = mg·sinθ, F_normal = mg·cosθ, F_friction = μ·N."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Angle: {angle}°</label>
            <Slider value={[angle]} onValueChange={v => setAngle(v[0])} min={5} max={60} step={1} disabled={running} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Mass: {mass} kg</label>
            <Slider value={[mass]} onValueChange={v => setMass(v[0])} min={0.5} max={10} step={0.5} disabled={running} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">μ: {frictionCoeff.toFixed(2)}</label>
            <Slider value={[frictionCoeff]} onValueChange={v => setFrictionCoeff(v[0])} min={0} max={1} step={0.05} disabled={running} />
          </div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop} disabled={!sliding && !running}>
            {running ? "⏹ Stop" : sliding ? "▶ Release" : "🔒 Static"}
          </Button>
        </div>
      }
      canvas3D={<InclinedPlane3DScene angle={angle} mass={mass} friction={frictionCoeff} position={objPos} sliding={sliding} />}
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">F∥</span><span>{parallel.toFixed(2)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">F⊥</span><span>{normal.toFixed(2)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Friction</span><span>{frictionForce.toFixed(2)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">F_net</span><span className={sliding ? "text-red-400" : "text-green-400"}>{netForce.toFixed(2)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">a</span><span className="text-primary font-bold">{accel.toFixed(2)} m/s²</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">v</span><span>{velocity.toFixed(2)} m/s</span></div>
        </div>
      }
    />
  );
}
