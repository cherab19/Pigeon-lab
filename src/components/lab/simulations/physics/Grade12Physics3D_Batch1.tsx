import { useState, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* ─── Helper: 3D Arrow ─── */
function Arrow3D({ from, to, color = "red", radius = 0.015 }: { from: [number, number, number]; to: [number, number, number]; color?: string; radius?: number }) {
  const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const len = dir.length();
  const mid = new THREE.Vector3(...from).add(dir.clone().multiplyScalar(0.5));
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <group>
      <mesh position={mid} quaternion={quaternion}>
        <cylinderGeometry args={[radius, radius, len, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={to} quaternion={quaternion}>
        <coneGeometry args={[radius * 3, radius * 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   p12-1  MRI Simulation 3D
   ════════════════════════════════════════════════════════════ */
function MRIScene({ fieldStrength, tissue, pulseDuration }: { fieldStrength: number; tissue: string; pulseDuration: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const protonRefs = useRef<THREE.Mesh[]>([]);
  const tissues: Record<string, { t1: number; t2: number; color: string }> = {
    brain: { t1: 900, t2: 100, color: "#6688ff" },
    muscle: { t1: 1200, t2: 50, color: "#ff8866" },
    fat: { t1: 250, t2: 80, color: "#ffcc44" },
  };
  const t = tissues[tissue] || tissues.brain;
  const alignedFraction = Math.min(1, fieldStrength / 3);

  const protonPositions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 20; i++) {
      pts.push([(Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.4]);
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    protonRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const wobble = (1 - alignedFraction) * Math.sin(time * 3 + i) * 0.5;
      mesh.rotation.z = wobble;
      mesh.rotation.x = wobble * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {/* MRI bore - outer ring */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.5, 0.3, 16, 48]} />
        <meshStandardMaterial color="#aabbcc" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Inner bore */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.2, 1.2, 0.5, 32, 1, true]} />
        <meshStandardMaterial color="#ddeeff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Magnetic field arrows */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <Arrow3D key={i} from={[x, -1, 0]} to={[x, 1, 0]} color="#4488ff" radius={0.008 * fieldStrength} />
      ))}

      {/* Protons */}
      {protonPositions.map((pos, i) => (
        <mesh key={i} ref={el => { if (el) protonRefs.current[i] = el; }} position={pos}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color={t.color} emissive={t.color} emissiveIntensity={0.3} />
          {/* Spin arrow */}
          <mesh position={[0, 0.06, 0]}>
            <coneGeometry args={[0.015, 0.04, 6]} />
            <meshStandardMaterial color={t.color} />
          </mesh>
        </mesh>
      ))}

      {/* Signal indicator */}
      {(() => {
        const si = (1 - Math.exp(-pulseDuration / t.t1)) * Math.exp(-pulseDuration / t.t2);
        return (
          <mesh position={[2, -0.5 + si * 1.5, 0]}>
            <boxGeometry args={[0.15, si * 1.5 || 0.01, 0.15]} />
            <meshStandardMaterial color={t.color} emissive={t.color} emissiveIntensity={0.5} />
          </mesh>
        );
      })()}

      <Text position={[2, 1.2, 0]} fontSize={0.1} color="#888">Signal</Text>
    </group>
  );
}

export function MRISimulation3D() {
  const [fieldStrength, setFieldStrength] = useState(1.5);
  const [pulseDuration, setPulseDuration] = useState(50);
  const [tissue, setTissue] = useState("brain");
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const tissues: Record<string, { t1: number; t2: number }> = {
    brain: { t1: 900, t2: 100 }, muscle: { t1: 1200, t2: 50 }, fat: { t1: 250, t2: 80 },
  };
  const t = tissues[tissue];
  const signalIntensity = (1 - Math.exp(-pulseDuration / t.t1)) * Math.exp(-pulseDuration / t.t2);
  const contrast = (signalIntensity * fieldStrength / 3).toFixed(3);

  const reset = () => { setFieldStrength(1.5); setPulseDuration(50); setTissue("brain"); setStep(0); };

  const steps = ["Open the MRI Simulation", "Set magnetic field strength", "Select tissue type", "Observe proton alignment", "Adjust pulse duration", "Apply RF pulse", "Observe signal release", "View contrast values", "Compare tissue types", "Record observations"];

  return (
    <Simulation3DLayout
      title="MRI Simulation"
      objective="Understand magnetic resonance imaging by manipulating field strength and pulse parameters"
      theory="MRI uses strong magnetic fields to align proton spins. An RF pulse tips protons, and the signal emitted during relaxation (T1/T2) creates tissue contrast."
      onReset={reset}
      soundEnabled={enabled}
      onToggleSound={toggleSound}
      steps={steps}
      currentStep={step}
      onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Field Strength: {fieldStrength} T</label><Slider value={[fieldStrength]} onValueChange={v => setFieldStrength(v[0])} min={0.5} max={3} step={0.1} /></div>
          <div><label className="text-xs text-muted-foreground">Pulse Duration: {pulseDuration} ms</label><Slider value={[pulseDuration]} onValueChange={v => setPulseDuration(v[0])} min={10} max={200} step={5} /></div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Tissue</span>
            <div className="flex gap-1">{["brain", "muscle", "fat"].map(tt => (
              <Button key={tt} size="sm" variant={tissue === tt ? "default" : "outline"} className="text-[10px] h-6 px-2" onClick={() => setTissue(tt)}>{tt}</Button>
            ))}</div>
          </div>
        </div>
      }
      canvas3D={<MRIScene fieldStrength={fieldStrength} tissue={tissue} pulseDuration={pulseDuration} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">B₀</span><span>{fieldStrength} T</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Pulse</span><span>{pulseDuration} ms</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">T1</span><span>{t.t1} ms</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">T2</span><span>{t.t2} ms</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Signal</span><span>{signalIntensity.toFixed(3)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Contrast</span><span>{contrast}</span></div>
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   p12-2  Horizontal Projectile 3D
   ════════════════════════════════════════════════════════════ */
function HorizontalProjectileScene({ height, velocity, time, airRes }: { height: number; velocity: number; time: number; airRes: boolean }) {
  const g = 9.8;
  const tof = Math.sqrt((2 * height) / g);
  const currentT = Math.min(time, tof);

  const trail = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = (tof * i) / steps;
      const x = velocity * t * (airRes ? (1 - t / tof * 0.25) : 1);
      const y = height - 0.5 * g * t * t;
      if (y >= 0) pts.push(new THREE.Vector3(x * 0.3, y * 0.3, 0));
    }
    return pts;
  }, [height, velocity, tof, g, airRes]);

  const ballX = velocity * currentT * (airRes ? (1 - currentT / tof * 0.25) : 1) * 0.3;
  const ballY = Math.max(0, (height - 0.5 * g * currentT * currentT) * 0.3);

  return (
    <group>
      <LabRoom />
      {/* Table */}
      <mesh position={[-1.5, -0.5 + height * 0.15, 0]} castShadow>
        <boxGeometry args={[1, height * 0.3, 1]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      {/* Ball */}
      <mesh position={[-1 + ballX, -0.5 + ballY, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.3} />
      </mesh>
      {/* Trail */}
      {trail.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={trail.length} array={new Float32Array(trail.flatMap(p => [-1 + p.x, -0.5 + p.y, p.z]))} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="#ff8844" linewidth={2} />
        </line>
      )}
      {/* Ground marker */}
      <mesh position={[0, -1.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.1, 16]} />
        <meshStandardMaterial color="#44ff44" />
      </mesh>
      {/* Velocity arrow */}
      <Arrow3D from={[-1 + ballX, -0.5 + ballY, 0]} to={[-1 + ballX + 0.4, -0.5 + ballY, 0]} color="#4488ff" />
    </group>
  );
}

export function HorizontalProjectile3D() {
  const [height, setHeight] = useState(2);
  const [velocity, setVelocity] = useState(4);
  const [airRes, setAirRes] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const g = 9.8;
  const tof = Math.sqrt((2 * height) / g);
  const range = velocity * tof * (airRes ? 0.75 : 1);
  const vyFinal = g * tof;
  const vFinal = Math.sqrt(velocity * velocity + vyFinal * vyFinal);

  useFrame(() => { if (time < tof) setTime(t => Math.min(t + 0.016, tof)); });

  const reset = () => { setHeight(2); setVelocity(4); setAirRes(false); setTime(0); setStep(0); };
  const steps = ["Set table height", "Set initial velocity", "Launch projectile", "Observe parabolic path", "Record time of flight", "Measure range", "Toggle air resistance", "Compare results", "Plot Range vs Velocity", "Write conclusion"];

  return (
    <Simulation3DLayout
      title="Horizontal Projectile Motion"
      objective="Investigate range and time of flight of a horizontally projected object"
      theory="In horizontal projection, initial vy = 0. Time: t = √(2h/g). Range R = v₀ × t."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Height: {height} m</label><Slider value={[height]} onValueChange={v => setHeight(v[0])} min={0.5} max={5} step={0.1} /></div>
          <div><label className="text-xs text-muted-foreground">Velocity: {velocity} m/s</label><Slider value={[velocity]} onValueChange={v => setVelocity(v[0])} min={1} max={20} step={0.5} /></div>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={airRes} onChange={e => setAirRes(e.target.checked)} />Air Resistance</label>
          <Button size="sm" className="w-full text-xs" onClick={() => setTime(0)}>🚀 Launch</Button>
        </div>
      }
      canvas3D={<HorizontalProjectileScene height={height} velocity={velocity} time={time} airRes={airRes} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Height</span><span>{height} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">v₀</span><span>{velocity} m/s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ToF</span><span>{tof.toFixed(3)} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Range</span><span>{range.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">vy final</span><span>{vyFinal.toFixed(2)} m/s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">|v| final</span><span>{vFinal.toFixed(2)} m/s</span></div>
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   p12-3  Angled Projectile 3D
   ════════════════════════════════════════════════════════════ */
function AngledProjectileScene({ velocity, angle, time }: { velocity: number; angle: number; time: number }) {
  const g = 9.8;
  const rad = (angle * Math.PI) / 180;
  const tof = (2 * velocity * Math.sin(rad)) / g;
  const currentT = Math.min(time, tof);

  const trail = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = (tof * i) / 80;
      const x = velocity * Math.cos(rad) * t;
      const y = velocity * Math.sin(rad) * t - 0.5 * g * t * t;
      if (y >= 0) pts.push(new THREE.Vector3(x * 0.1, y * 0.1, 0));
    }
    return pts;
  }, [velocity, angle, tof, g, rad]);

  const bx = velocity * Math.cos(rad) * currentT * 0.1;
  const by = Math.max(0, (velocity * Math.sin(rad) * currentT - 0.5 * g * currentT * currentT) * 0.1);

  return (
    <group>
      <LabRoom />
      {/* Cannon */}
      <group position={[-1.5, -0.45, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.15, 0.15]} />
          <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.15 + 0.15 * Math.cos(rad), 0.15 * Math.sin(rad), 0]} rotation={[0, 0, rad]}>
          <cylinderGeometry args={[0.03, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
      </group>
      {/* Ball */}
      <mesh position={[-1.5 + bx, -0.45 + by, 0]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.3} />
      </mesh>
      {/* Trail */}
      {trail.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={trail.length} array={new Float32Array(trail.flatMap(p => [-1.5 + p.x, -0.45 + p.y, p.z]))} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="#ff8844" linewidth={2} />
        </line>
      )}
      {/* Ground */}
      <mesh position={[0, -1.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#7a9a5a" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export function AngledProjectile3D() {
  const [velocity, setVelocity] = useState(10);
  const [angle, setAngle] = useState(45);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const g = 9.8;
  const rad = (angle * Math.PI) / 180;
  const tof = (2 * velocity * Math.sin(rad)) / g;
  const range = (velocity * velocity * Math.sin(2 * rad)) / g;
  const maxH = (velocity * velocity * Math.sin(rad) * Math.sin(rad)) / (2 * g);

  useFrame(() => { if (time < tof) setTime(t => Math.min(t + 0.016, tof)); });

  const reset = () => { setVelocity(10); setAngle(45); setTime(0); setStep(0); };
  const steps = ["Set initial velocity", "Set launch angle", "Launch projectile", "Observe trajectory", "Record range", "Try angles: 15°, 30°, 45°, 60°, 75°", "Plot Range vs Angle", "Identify max range angle", "Verify complementary angles"];

  return (
    <Simulation3DLayout
      title="Projectile Motion at an Angle"
      objective="Investigate how angle of projection affects range"
      theory="R = v₀²sin(2θ)/g. Max range at 45°. Complementary angles yield same range."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Velocity: {velocity} m/s</label><Slider value={[velocity]} onValueChange={v => setVelocity(v[0])} min={5} max={30} step={0.5} /></div>
          <div><label className="text-xs text-muted-foreground">Angle: {angle}°</label><Slider value={[angle]} onValueChange={v => setAngle(v[0])} min={5} max={85} step={1} /></div>
          {angle === 45 && <div className="text-[10px] text-primary bg-primary/10 p-1.5 rounded">★ Maximum range angle!</div>}
          <Button size="sm" className="w-full text-xs" onClick={() => setTime(0)}>🚀 Launch</Button>
        </div>
      }
      canvas3D={<AngledProjectileScene velocity={velocity} angle={angle} time={time} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">v₀</span><span>{velocity} m/s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Angle</span><span>{angle}°</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Range</span><span>{range.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Max H</span><span>{maxH.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ToF</span><span>{tof.toFixed(3)} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Comp. ∠</span><span>{90 - angle}°</span></div>
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   p12-4  Fluid Pressure vs Depth 3D
   ════════════════════════════════════════════════════════════ */
function FluidPressureScene({ depth, density }: { depth: number; density: number }) {
  const sensorY = -0.5 + (1 - depth / 10) * 2;
  const fluidColor = density > 5000 ? "#999" : density > 2000 ? "#aaddaa" : "#4488ff";

  return (
    <group>
      <LabRoom />
      {/* Tank - glass walls */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 2.5, 1]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} side={THREE.DoubleSide} roughness={0.05} transmission={0.7} />
      </mesh>
      {/* Fluid */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[1.48, 2, 0.98]} />
        <meshStandardMaterial color={fluidColor} transparent opacity={0.4} />
      </mesh>
      {/* Surface ripple */}
      <mesh position={[0, 0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.48, 0.98]} />
        <meshStandardMaterial color={fluidColor} transparent opacity={0.6} />
      </mesh>
      {/* Pressure sensor */}
      <mesh position={[0, Math.max(sensorY, -1.2), 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ff6644" emissive="#ff4422" emissiveIntensity={0.5} />
      </mesh>
      {/* Wire to sensor */}
      <mesh position={[0, (0.75 + Math.max(sensorY, -1.2)) / 2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.75 - Math.max(sensorY, -1.2), 4]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      {/* Depth markers */}
      {[0, 2, 4, 6, 8, 10].map(d => {
        const y = -0.5 + (1 - d / 10) * 2;
        return y >= -1.3 ? (
          <Text key={d} position={[-0.9, y, 0.5]} fontSize={0.06} color="#888">{d}m</Text>
        ) : null;
      })}
    </group>
  );
}

export function FluidPressureLab3D() {
  const [depth, setDepth] = useState(2);
  const [density, setDensity] = useState(1000);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<{ d: number; p: number }[]>([]);
  const { enabled, toggleSound } = useSoundEffects();

  const g = 9.8;
  const patm = 101325;
  const pGauge = density * g * depth;
  const pAbs = patm + pGauge;

  const record = () => setData(prev => [...prev, { d: depth, p: pGauge / 1000 }]);
  const reset = () => { setDepth(2); setDensity(1000); setStep(0); setData([]); };

  const steps = ["Select fluid", "Place sensor at surface", "Record pressure at d=0", "Move sensor deeper", "Record pressure", "Repeat for various depths", "Plot P vs d", "Compare with P=ρgh", "Explain linear relationship"];

  return (
    <Simulation3DLayout
      title="Pressure vs Depth"
      objective="Investigate how pressure varies with depth in a fluid"
      theory="P = P₀ + ρgh. Pressure increases linearly with depth."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Depth: {depth} m</label><Slider value={[depth]} onValueChange={v => setDepth(v[0])} min={0} max={10} step={0.5} /></div>
          <div><label className="text-xs text-muted-foreground">Density: {density} kg/m³</label><Slider value={[density]} onValueChange={v => setDensity(v[0])} min={500} max={13600} step={100} /></div>
          <Button size="sm" className="w-full text-xs" onClick={record}>📝 Record</Button>
        </div>
      }
      canvas3D={<FluidPressureScene depth={depth} density={density} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Depth</span><span>{depth} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ρ</span><span>{density} kg/m³</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Gauge P</span><span>{(pGauge / 1000).toFixed(1)} kPa</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Abs P</span><span>{(pAbs / 1000).toFixed(1)} kPa</span></div>
        </div>
      }
      graphPanel={data.length > 0 ? (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="d" label={{ value: "Depth (m)", position: "bottom" }} tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="p" stroke="hsl(var(--primary))" name="P (kPa)" dot /></LineChart>
        </ResponsiveContainer>
      ) : undefined}
    />
  );
}

/* ════════════════════════════════════════════════════════════
   p12-5  Archimedes' Principle 3D
   ════════════════════════════════════════════════════════════ */
function ArchimedesScene({ objectDensity, volume, submerged }: { objectDensity: number; volume: number; submerged: boolean }) {
  const blockSize = Math.max(0.15, volume * 60);
  const blockY = submerged ? -0.3 : 0.8;

  return (
    <group>
      <LabRoom />
      {/* Beaker */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.6, 0.55, 1.2, 32, 1, true]} />
        <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} roughness={0.05} transmission={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Water */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.58, 0.53, 0.8, 32]} />
        <meshStandardMaterial color="#4488ff" transparent opacity={0.35} />
      </mesh>
      {/* Object */}
      <mesh position={[0, blockY, 0]} castShadow>
        <boxGeometry args={[blockSize, blockSize, blockSize]} />
        <meshStandardMaterial color={objectDensity > 5000 ? "#888" : objectDensity > 2000 ? "#cc8844" : "#ddaa66"} metalness={objectDensity > 5000 ? 0.7 : 0.2} roughness={0.4} />
      </mesh>
      {/* String */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0, 1.5, 0, 0, blockY + blockSize / 2, 0])} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#888" />
      </line>
      {/* Weight arrow */}
      <Arrow3D from={[0, blockY - blockSize / 2, 0]} to={[0, blockY - blockSize / 2 - 0.3, 0]} color="#ff4444" />
      {/* Buoyant force arrow */}
      {submerged && <Arrow3D from={[0.2, blockY + blockSize / 2, 0]} to={[0.2, blockY + blockSize / 2 + 0.2, 0]} color="#44aaff" />}
      {/* Scale */}
      <group position={[0, 1.6, 0]}>
        <mesh><boxGeometry args={[0.4, 0.05, 0.2]} /><meshStandardMaterial color="#333" metalness={0.7} /></mesh>
      </group>
    </group>
  );
}

export function ArchimedesPrinciple3D() {
  const [objectDensity, setObjectDensity] = useState(7800);
  const [volume, setVolume] = useState(0.001);
  const [submerged, setSubmerged] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const g = 9.8;
  const fluidDensity = 1000;
  const weightAir = objectDensity * volume * g;
  const buoyantForce = fluidDensity * volume * g;
  const apparentWeight = weightAir - buoyantForce;

  const reset = () => { setObjectDensity(7800); setVolume(0.001); setSubmerged(false); setStep(0); };
  const steps = ["Select object material", "Measure weight in air", "Submerge in water", "Measure apparent weight", "Calculate buoyant force", "Measure displaced volume", "Calculate ρVg", "Compare values", "Write conclusion"];

  return (
    <Simulation3DLayout
      title="Archimedes' Principle"
      objective="Verify buoyant force equals weight of displaced fluid"
      theory="Fb = ρ_fluid × V × g. Apparent weight = actual weight − buoyant force."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">ρ object: {objectDensity} kg/m³</label><Slider value={[objectDensity]} onValueChange={v => setObjectDensity(v[0])} min={500} max={11000} step={100} /></div>
          <div><label className="text-xs text-muted-foreground">Volume: {(volume * 1e6).toFixed(0)} cm³</label><Slider value={[volume]} onValueChange={v => setVolume(v[0])} min={0.0005} max={0.005} step={0.0005} /></div>
          <Button size="sm" className="w-full text-xs" variant={submerged ? "default" : "outline"} onClick={() => setSubmerged(!submerged)}>
            {submerged ? "🌊 Submerged" : "Submerge"}
          </Button>
        </div>
      }
      canvas3D={<ArchimedesScene objectDensity={objectDensity} volume={volume} submerged={submerged} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">W (air)</span><span>{weightAir.toFixed(2)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Fb</span><span>{submerged ? buoyantForce.toFixed(2) : "—"} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">W (app)</span><span>{submerged ? apparentWeight.toFixed(2) : "—"} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ρVg</span><span>{buoyantForce.toFixed(2)} N</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Vol</span><span>{(volume * 1e6).toFixed(0)} cm³</span></div>
        </div>
      }
    />
  );
}
