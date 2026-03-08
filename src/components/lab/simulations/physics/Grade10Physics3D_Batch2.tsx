import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

// ═══════════════════════════════════════════════════
// 6. TORQUE & EQUILIBRIUM — 3D
// ═══════════════════════════════════════════════════

function TorqueBeam({ forces, pivotX }: { forces: { x: number; f: number }[]; pivotX: number }) {
  const beamRef = useRef<THREE.Group>(null);
  const totalTorque = forces.reduce((s, f) => s + f.f * (f.x - pivotX), 0);
  const tilt = Math.max(-12, Math.min(12, totalTorque * 0.3));

  useFrame(() => {
    if (beamRef.current) {
      const target = (tilt * Math.PI) / 180;
      beamRef.current.rotation.z += (target - beamRef.current.rotation.z) * 0.08;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      <mesh position={[pivotX * 0.2, -0.12, 0]} castShadow>
        <coneGeometry args={[0.05, 0.1, 3]} />
        <meshStandardMaterial color="#f39c12" metalness={0.5} />
      </mesh>
      <group ref={beamRef} position={[pivotX * 0.2, -0.06, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2, 0.025, 0.1]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </mesh>
        {forces.map((f, i) => (
          <group key={i} position={[(f.x - pivotX) * 0.2, -0.04, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.06, Math.abs(f.f) * 0.005 + 0.02, 0.06]} />
              <meshStandardMaterial color={f.f > 0 ? "#e74c3c" : "#3498db"} metalness={0.3} />
            </mesh>
            <Text position={[0, -0.06, 0]} fontSize={0.02} color={f.f > 0 ? "#e74c3c" : "#3498db"} anchorX="center">
              {f.f.toFixed(0)}N
            </Text>
          </group>
        ))}
      </group>
      {Math.abs(totalTorque) < 0.5 && (
        <Text position={[0, 0.15, 0]} fontSize={0.05} color="#2ecc71" anchorX="center">✓ EQUILIBRIUM</Text>
      )}
    </group>
  );
}

export function TorqueEquilibrium3D() {
  const [f1, setF1] = useState(10);
  const [x1, setX1] = useState(-3);
  const [f2, setF2] = useState(10);
  const [x2, setX2] = useState(3);
  const [pivotX, setPivotX] = useState(0);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const t1 = f1 * (x1 - pivotX), t2 = f2 * (x2 - pivotX);
  const netTorque = t1 + t2;
  const balanced = Math.abs(netTorque) < 0.5;

  const steps = ["Place Force 1 on the beam", "Place Force 2 on the beam", "Adjust forces to achieve equilibrium", "Verify: Σcw torques = Σccw torques"];
  const reset = () => { setF1(10); setX1(-3); setF2(10); setX2(3); setPivotX(0); setStep(0); };

  return (
    <Simulation3DLayout
      title="3D Lab: Torque & Equilibrium"
      objective="Verify the principle of moments for rotational equilibrium"
      theory="Torque = F × d. Equilibrium: ΣClockwise = ΣAnticlockwise."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">F₁: {f1}N @ x={x1}</label>
            <Slider value={[f1]} onValueChange={v => setF1(v[0])} min={1} max={30} step={1} />
            <Slider value={[x1]} onValueChange={v => setX1(v[0])} min={-5} max={5} step={0.5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">F₂: {f2}N @ x={x2}</label>
            <Slider value={[f2]} onValueChange={v => setF2(v[0])} min={1} max={30} step={1} />
            <Slider value={[x2]} onValueChange={v => setX2(v[0])} min={-5} max={5} step={0.5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Pivot: x={pivotX}</label>
            <Slider value={[pivotX]} onValueChange={v => setPivotX(v[0])} min={-4} max={4} step={0.5} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <TorqueBeam forces={[{ x: x1, f: f1 }, { x: x2, f: f2 }]} pivotX={pivotX} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">τ₁</span><span>{t1.toFixed(1)} N·m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">τ₂</span><span>{t2.toFixed(1)} N·m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Στ</span><span className={balanced ? "text-green-400 font-bold" : "text-red-400"}>{netTorque.toFixed(1)} N·m</span></div>
          {balanced && <div className="p-1.5 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-center text-[10px] font-bold">✅ Equilibrium!</div>}
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 7. OHM'S LAW — CIRCUIT BUILDER 3D
// ═══════════════════════════════════════════════════

function Battery3D({ voltage }: { voltage: number }) {
  return (
    <group position={[-0.8, -0.3, 0]}>
      <mesh castShadow><cylinderGeometry args={[0.04, 0.04, 0.15, 16]} /><meshStandardMaterial color="#333" metalness={0.5} /></mesh>
      <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.015, 0.015, 0.02, 12]} /><meshStandardMaterial color="#C0C0C0" metalness={0.9} /></mesh>
      <Text position={[0, -0.12, 0]} fontSize={0.03} color="#f39c12" anchorX="center">{voltage}V</Text>
    </group>
  );
}

function Resistor3D({ resistance, current }: { resistance: number; current: number }) {
  const glow = Math.min(1, current * 0.5);
  return (
    <group position={[0.3, -0.3, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.15, 0.05, 0.05]} />
        <meshStandardMaterial color="#8B4513" emissive="#ff4400" emissiveIntensity={glow * 0.5} />
      </mesh>
      {/* Color bands */}
      {[-0.04, -0.02, 0, 0.02].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.026]}>
          <boxGeometry args={[0.008, 0.04, 0.002]} />
          <meshStandardMaterial color={["#e74c3c", "#f39c12", "#2ecc71", "#f39c12"][i]} />
        </mesh>
      ))}
      <Text position={[0, 0.06, 0]} fontSize={0.025} color="#aaa" anchorX="center">{resistance}Ω</Text>
    </group>
  );
}

function CircuitWires({ voltage, resistance }: { voltage: number; resistance: number }) {
  const current = voltage / resistance;
  // Animated electrons
  const electrons = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  return (
    <group>
      {/* Wire path (simplified rectangle) */}
      {[
        [[-0.8, -0.22, 0], [0.3, -0.22, 0]],
        [[-0.8, -0.38, 0], [0.3, -0.38, 0]],
        [[-0.8, -0.22, 0], [-0.8, -0.38, 0]],
        [[0.3, -0.22, 0], [0.3, -0.38, 0]],
      ].map(([from, to], i) => {
        const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0];
        const len = Math.sqrt((to[0] - from[0]) ** 2 + (to[1] - from[1]) ** 2);
        const isHoriz = Math.abs(to[1] - from[1]) < 0.01;
        return (
          <mesh key={i} position={mid as [number, number, number]} rotation={isHoriz ? [0, 0, 0] : [0, 0, Math.PI / 2]}>
            <boxGeometry args={[len, 0.006, 0.006]} />
            <meshStandardMaterial color="#B87333" metalness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

export function CircuitBuilder3D() {
  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(10);
  const [step, setStep] = useState(0);
  const [dataPoints, setDataPoints] = useState<{ V: number; I: number }[]>([]);
  const { playClick } = useSoundEffects();

  const current = voltage / resistance;
  const power = voltage * current;

  const addPoint = () => {
    setDataPoints(prev => [...prev, { V: voltage, I: +current.toFixed(3) }]);
    setStep(Math.max(step, 3)); playClick();
  };

  const reset = () => { setVoltage(6); setResistance(10); setStep(0); setDataPoints([]); };
  const steps = ["Set battery voltage", "Set resistance value", "Read current (I = V/R)", "Record V-I data points", "Plot V-I graph (slope = R)"];

  return (
    <Simulation3DLayout
      title="3D Lab: Ohm's Law — Circuit Builder"
      objective="Build a circuit and verify V = IR"
      theory="Ohm's Law: V = IR. V–I graph for ohmic conductor is linear."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Voltage: {voltage}V</label>
            <Slider value={[voltage]} onValueChange={v => { setVoltage(v[0]); setStep(Math.max(step, 1)); }} min={1} max={24} step={0.5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Resistance: {resistance}Ω</label>
            <Slider value={[resistance]} onValueChange={v => { setResistance(v[0]); setStep(Math.max(step, 2)); }} min={1} max={100} step={1} />
          </div>
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={addPoint}>📌 Record Point</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <Battery3D voltage={voltage} />
          <Resistor3D resistance={resistance} current={current} />
          <CircuitWires voltage={voltage} resistance={resistance} />
          {/* Ammeter display */}
          <group position={[-0.25, -0.15, 0.2]}>
            <mesh><boxGeometry args={[0.12, 0.08, 0.02]} /><meshStandardMaterial color="#222" /></mesh>
            <Text position={[0, 0, 0.012]} fontSize={0.025} color="#2ecc71" anchorX="center">
              {current.toFixed(3)}A
            </Text>
          </group>
          {/* Voltmeter display */}
          <group position={[0.3, -0.15, 0.2]}>
            <mesh><boxGeometry args={[0.12, 0.08, 0.02]} /><meshStandardMaterial color="#222" /></mesh>
            <Text position={[0, 0, 0.012]} fontSize={0.025} color="#e74c3c" anchorX="center">
              {voltage.toFixed(1)}V
            </Text>
          </group>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">V</span><span>{voltage} V</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">R</span><span>{resistance} Ω</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">I = V/R</span><span className="text-primary font-bold">{current.toFixed(3)} A</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">P = VI</span><span>{power.toFixed(2)} W</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Points</span><span>{dataPoints.length}</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 8. MAGNETIC FIELD VISUALIZATION — 3D
// ═══════════════════════════════════════════════════

function BarMagnet3D() {
  return (
    <group position={[0, -0.3, 0]}>
      <mesh position={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 0.08, 0.06]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <Text position={[-0.15, 0.06, 0]} fontSize={0.03} color="#fff" anchorX="center">N</Text>
      <mesh position={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 0.08, 0.06]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <Text position={[0.15, 0.06, 0]} fontSize={0.03} color="#fff" anchorX="center">S</Text>
    </group>
  );
}

function FieldLines3D({ showCompass }: { showCompass: boolean }) {
  const lines = useMemo(() => {
    const result: THREE.Vector3[][] = [];
    for (let i = 0; i < 8; i++) {
      const pts: THREE.Vector3[] = [];
      const startAngle = (i / 8) * Math.PI * 2;
      for (let j = 0; j <= 30; j++) {
        const t = j / 30;
        const angle = startAngle + t * Math.PI;
        const r = 0.3 + Math.sin(t * Math.PI) * 0.3;
        pts.push(new THREE.Vector3(
          Math.cos(angle) * r,
          0,
          Math.sin(startAngle) * 0.15 * Math.sin(t * Math.PI)
        ));
      }
      result.push(pts);
    }
    return result;
  }, []);

  return (
    <group position={[0, -0.3, 0]}>
      {lines.map((pts, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <line key={i}>
            <bufferGeometry attach="geometry" {...geo} />
            <lineBasicMaterial attach="material" color="#f39c12" transparent opacity={0.6} />
          </line>
        );
      })}
      {/* Compass needles */}
      {showCompass && [[-0.5, 0], [0.5, 0], [0, 0.3], [0, -0.3], [-0.3, 0.2], [0.3, -0.2]].map(([x, z], i) => (
        <group key={i} position={[x, 0.01, z]}>
          <mesh rotation={[Math.PI / 2, 0, Math.atan2(-z, x)]}>
            <boxGeometry args={[0.04, 0.002, 0.008]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function MagneticField3D() {
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showCompass, setShowCompass] = useState(false);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const steps = ["Observe the bar magnet (N/S poles)", "Toggle field lines", "Add compass needles", "Note: lines go N→S externally", "Field is strongest near poles"];
  const reset = () => { setShowFieldLines(true); setShowCompass(false); setStep(0); };

  return (
    <Simulation3DLayout
      title="3D Lab: Magnetic Field Visualization"
      objective="Visualize magnetic field lines around a bar magnet"
      theory="Field lines emerge from N pole, enter S pole. Iron filings reveal the pattern."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={showFieldLines} onChange={e => { setShowFieldLines(e.target.checked); setStep(Math.max(step, 1)); playClick(); }} className="rounded" />
            <span className="text-muted-foreground">Show Field Lines</span>
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={showCompass} onChange={e => { setShowCompass(e.target.checked); setStep(Math.max(step, 2)); playClick(); }} className="rounded" />
            <span className="text-muted-foreground">Show Compasses</span>
          </label>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <BarMagnet3D />
          {showFieldLines && <FieldLines3D showCompass={showCompass} />}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Poles</span><span>N ↔ S</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Field Lines</span><span>{showFieldLines ? "Visible" : "Hidden"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Compasses</span><span>{showCompass ? "Active" : "Off"}</span></div>
          <div className="mt-2 p-1.5 rounded bg-muted text-[10px]">
            External field: N → S<br/>Internal field: S → N<br/>Strongest near poles
          </div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 9. REFLECTION OF LIGHT — 3D
// ═══════════════════════════════════════════════════

function Mirror3D() {
  return (
    <group position={[0, -0.3, -0.5]}>
      <mesh castShadow>
        <boxGeometry args={[1, 0.6, 0.02]} />
        <meshPhysicalMaterial color="#aaccee" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[1.05, 0.65, 0.01]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

function LightRay3D({ incidentAngle }: { incidentAngle: number }) {
  const rad = (incidentAngle * Math.PI) / 180;
  const rayLen = 1;
  // Incident ray
  const incEnd: [number, number, number] = [-Math.sin(rad) * rayLen, 0, Math.cos(rad) * rayLen - 0.5];
  const incStart: [number, number, number] = [0, -0.3, -0.5];
  // Reflected ray
  const refEnd: [number, number, number] = [Math.sin(rad) * rayLen, 0, Math.cos(rad) * rayLen - 0.5];

  return (
    <group>
      {/* Normal line */}
      <mesh position={[0, -0.3, -0.2]}>
        <boxGeometry args={[0.003, 0.003, 0.6]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <Text position={[0.05, -0.1, 0]} fontSize={0.025} color="#888" anchorX="left">Normal</Text>
      {/* Incident ray */}
      <mesh position={[
        (incStart[0] + (-Math.sin(rad) * rayLen)) / 2,
        -0.3,
        (-0.5 + (Math.cos(rad) * rayLen - 0.5)) / 2
      ]} rotation={[0, rad, 0]}>
        <boxGeometry args={[0.008, 0.008, rayLen]} />
        <meshStandardMaterial color="#f39c12" emissive="#f39c12" emissiveIntensity={0.5} />
      </mesh>
      {/* Reflected ray */}
      <mesh position={[
        Math.sin(rad) * rayLen / 2,
        -0.3,
        (Math.cos(rad) * rayLen / 2 - 0.5)
      ]} rotation={[0, -rad, 0]}>
        <boxGeometry args={[0.008, 0.008, rayLen]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.5} />
      </mesh>
      {/* Angle labels */}
      <Text position={[-0.15, -0.15, -0.2]} fontSize={0.03} color="#f39c12" anchorX="center">θi={incidentAngle}°</Text>
      <Text position={[0.15, -0.15, -0.2]} fontSize={0.03} color="#e74c3c" anchorX="center">θr={incidentAngle}°</Text>
    </group>
  );
}

export function Reflection3D() {
  const [angle, setAngle] = useState(30);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const steps = ["Observe the mirror surface", "Adjust angle of incidence", "Note θi = θr (Law of Reflection)", "Both measured from the normal"];
  const reset = () => { setAngle(30); setStep(0); };

  return (
    <Simulation3DLayout
      title="3D Lab: Reflection of Light"
      objective="Verify the law of reflection: θi = θr"
      theory="Law of Reflection: angle of incidence = angle of reflection, both from the normal."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Incident Angle: {angle}°</label>
            <Slider value={[angle]} onValueChange={v => { setAngle(v[0]); setStep(Math.max(step, 1)); playClick(); }} min={5} max={85} step={1} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <Mirror3D />
          <LightRay3D incidentAngle={angle} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">θ incident</span><span className="text-yellow-400">{angle}°</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">θ reflected</span><span className="text-red-400">{angle}°</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">θi = θr?</span><span className="text-green-400 font-bold">✓ Yes</span></div>
          <div className="mt-2 p-1.5 rounded bg-muted text-[10px]">
            Both angles measured from the normal (perpendicular to surface).
          </div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 10. REFRACTION — SNELL'S LAW — 3D
// ═══════════════════════════════════════════════════

function RefractionScene({ angle1, n1, n2 }: { angle1: number; n1: number; n2: number }) {
  const rad1 = (angle1 * Math.PI) / 180;
  const sinTheta2 = (n1 * Math.sin(rad1)) / n2;
  const totalReflection = sinTheta2 > 1;
  const angle2 = totalReflection ? 90 : (Math.asin(sinTheta2) * 180) / Math.PI;
  const rad2 = (angle2 * Math.PI) / 180;
  const rayLen = 0.8;

  return (
    <group>
      {/* Medium 1 (top - air) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.01, 1.5]} />
        <meshStandardMaterial color="#3498db" transparent opacity={0.1} />
      </mesh>
      {/* Medium 2 (bottom - glass/water) */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[2, 0.6, 1.5]} />
        <meshStandardMaterial color="#3498db" transparent opacity={0.25} />
      </mesh>
      {/* Interface line */}
      <mesh position={[0, -0.005, 0]}>
        <boxGeometry args={[2, 0.005, 1.5]} />
        <meshStandardMaterial color="#2980b9" transparent opacity={0.5} />
      </mesh>
      {/* Normal */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.003, 1.2, 0.003]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      {/* Incident ray */}
      <mesh position={[-Math.sin(rad1) * rayLen / 2, rayLen / 2 * Math.cos(rad1), 0]} rotation={[0, 0, rad1]}>
        <boxGeometry args={[0.008, rayLen, 0.008]} />
        <meshStandardMaterial color="#f39c12" emissive="#f39c12" emissiveIntensity={0.5} />
      </mesh>
      {/* Refracted ray */}
      {!totalReflection && (
        <mesh position={[Math.sin(rad2) * rayLen / 2, -rayLen / 2 * Math.cos(rad2), 0]} rotation={[0, 0, -rad2]}>
          <boxGeometry args={[0.008, rayLen, 0.008]} />
          <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.5} />
        </mesh>
      )}
      {/* Labels */}
      <Text position={[-0.4, 0.3, 0]} fontSize={0.04} color="#aaa" anchorX="center">n₁ = {n1.toFixed(2)}</Text>
      <Text position={[-0.4, -0.3, 0]} fontSize={0.04} color="#6cf" anchorX="center">n₂ = {n2.toFixed(2)}</Text>
      <Text position={[-0.3, 0.15, 0]} fontSize={0.03} color="#f39c12" anchorX="center">θ₁={angle1}°</Text>
      {!totalReflection && <Text position={[0.3, -0.15, 0]} fontSize={0.03} color="#e74c3c" anchorX="center">θ₂={angle2.toFixed(1)}°</Text>}
      {totalReflection && <Text position={[0, -0.5, 0]} fontSize={0.05} color="#e74c3c" anchorX="center">TOTAL INTERNAL REFLECTION</Text>}
    </group>
  );
}

export function ReflectionRefraction3D() {
  const [angle1, setAngle1] = useState(30);
  const [n1, setN1] = useState(1.0);
  const [n2, setN2] = useState(1.5);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const rad1 = (angle1 * Math.PI) / 180;
  const sinTheta2 = (n1 * Math.sin(rad1)) / n2;
  const totalReflection = sinTheta2 > 1;
  const angle2 = totalReflection ? 90 : (Math.asin(sinTheta2) * 180) / Math.PI;
  const criticalAngle = n1 < n2 ? "N/A" : ((Math.asin(n2 / n1) * 180) / Math.PI).toFixed(1);

  const steps = ["Set refractive indices", "Adjust angle of incidence", "Observe refracted ray bending", "Verify Snell's Law: n₁sinθ₁ = n₂sinθ₂", "Find critical angle for total internal reflection"];
  const reset = () => { setAngle1(30); setN1(1.0); setN2(1.5); setStep(0); };

  return (
    <Simulation3DLayout
      title="3D Lab: Refraction — Snell's Law"
      objective="Investigate n₁sinθ₁ = n₂sinθ₂"
      theory="Light bends at media boundaries. At critical angle → total internal reflection."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">θ₁: {angle1}°</label>
            <Slider value={[angle1]} onValueChange={v => { setAngle1(v[0]); setStep(Math.max(step, 1)); }} min={0} max={89} step={1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">n₁: {n1.toFixed(2)}</label>
            <Slider value={[n1]} onValueChange={v => setN1(v[0])} min={1} max={2.5} step={0.05} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">n₂: {n2.toFixed(2)}</label>
            <Slider value={[n2]} onValueChange={v => setN2(v[0])} min={1} max={2.5} step={0.05} />
          </div>
          <div className="text-[10px] text-muted-foreground space-y-1">
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setN1(1); setN2(1.33); playClick(); }}>Air → Water</Button>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setN1(1); setN2(1.52); playClick(); }}>Air → Glass</Button>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setN1(1.52); setN2(1); playClick(); }}>Glass → Air</Button>
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <RefractionScene angle1={angle1} n1={n1} n2={n2} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">n₁</span><span>{n1.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">n₂</span><span>{n2.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">θ₁</span><span>{angle1}°</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">θ₂</span><span className="text-primary font-bold">{totalReflection ? "TIR" : angle2.toFixed(1) + "°"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">n₁sinθ₁</span><span>{(n1 * Math.sin(rad1)).toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">n₂sinθ₂</span><span>{totalReflection ? "—" : (n2 * Math.sin((angle2 * Math.PI) / 180)).toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Critical∠</span><span>{criticalAngle}°</span></div>
        </div>
      }
    />
  );
}
