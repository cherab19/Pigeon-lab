import { useState, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function Arrow3D({ from, to, color = "red", radius = 0.015 }: { from: [number, number, number]; to: [number, number, number]; color?: string; radius?: number }) {
  const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const len = dir.length();
  if (len < 0.001) return null;
  const mid = new THREE.Vector3(...from).add(dir.clone().multiplyScalar(0.5));
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <group>
      <mesh position={mid} quaternion={quaternion}><cylinderGeometry args={[radius, radius, len, 8]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={to} quaternion={quaternion}><coneGeometry args={[radius * 3, radius * 8, 8]} /><meshStandardMaterial color={color} /></mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   p12-6  Magnetic Field around Current-Carrying Wire 3D
   ════════════════════════════════════════════════════════════ */
function MagneticFieldWireScene({ current, reversed }: { current: number; reversed: boolean }) {
  const compassRef = useRef<THREE.Group>(null);
  const dir = reversed ? -1 : 1;

  useFrame(({ clock }) => {
    if (compassRef.current) {
      compassRef.current.rotation.y = clock.getElapsedTime() * dir * 0.5;
    }
  });

  return (
    <group>
      <LabRoom />
      {/* Wire (vertical) */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 3, 16]} />
        <meshStandardMaterial color="#cc6633" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Current direction indicator */}
      <Text position={[0, 1.6, 0.1]} fontSize={0.12} color={reversed ? "#ff4444" : "#44ff44"}>
        {reversed ? "↓ I" : "↑ I"}
      </Text>

      {/* Concentric field rings */}
      {[0.3, 0.5, 0.7, 0.9, 1.2].map((r, i) => {
        const opacity = Math.max(0.15, 1 - i * 0.18) * Math.min(current / 5, 1);
        return (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.008, 8, 48]} />
            <meshStandardMaterial color="#4488ff" transparent opacity={opacity} />
          </mesh>
        );
      })}

      {/* Field direction arrows on rings */}
      {[0.3, 0.6, 1.0].map((r, ri) => {
        const arrowCount = 4;
        return Array.from({ length: arrowCount }, (_, i) => {
          const angle = (i / arrowCount) * Math.PI * 2 * dir;
          const x = Math.cos(angle) * r;
          const z = Math.sin(angle) * r;
          const tx = Math.cos(angle + 0.3 * dir) * r;
          const tz = Math.sin(angle + 0.3 * dir) * r;
          return <Arrow3D key={`${ri}-${i}`} from={[x, 0, z]} to={[tx, 0, tz]} color="#4488ff" radius={0.01} />;
        });
      })}

      {/* Compass */}
      <group ref={compassRef} position={[0.8, -0.4, 0.8]}>
        <mesh><cylinderGeometry args={[0.12, 0.12, 0.02, 24]} /><meshStandardMaterial color="#eeddcc" /></mesh>
        <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.02, 0.1, 6]} />
          <meshStandardMaterial color="#ff2222" />
        </mesh>
      </group>
    </group>
  );
}

export function MagneticFieldWire3D() {
  const [current, setCurrent] = useState(2);
  const [reversed, setReversed] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const mu0 = 4 * Math.PI * 1e-7;
  const B2cm = (mu0 * current) / (2 * Math.PI * 0.02) * 1e4;
  const B5cm = (mu0 * current) / (2 * Math.PI * 0.05) * 1e4;

  const reset = () => { setCurrent(2); setReversed(false); setStep(0); };
  const steps = ["Set current to 2 A", "Observe field lines", "Increase current", "Note field density change", "Use compass for direction", "Apply Right Hand Rule", "Reverse current", "Record observations", "Draw field pattern"];

  return (
    <Simulation3DLayout
      title="Magnetic Field — Current Wire"
      objective="Observe magnetic field patterns around a current-carrying conductor"
      theory="B = μ₀I/(2πr). Concentric circles. Right-Hand Rule for direction."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Current: {current} A</label><Slider value={[current]} onValueChange={v => setCurrent(v[0])} min={0.5} max={10} step={0.5} /></div>
          <Button size="sm" variant={reversed ? "default" : "outline"} className="w-full text-xs" onClick={() => setReversed(!reversed)}>
            {reversed ? "🔄 Reversed" : "Reverse Current"}
          </Button>
        </div>
      }
      canvas3D={<MagneticFieldWireScene current={current} reversed={reversed} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">I</span><span>{current} A</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Dir</span><span>{reversed ? "Into" : "Out"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">B@2cm</span><span>{B2cm.toFixed(2)}×10⁻⁴ T</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">B@5cm</span><span>{B5cm.toFixed(2)}×10⁻⁴ T</span></div>
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   p12-7  Electromagnetic Induction 3D
   ════════════════════════════════════════════════════════════ */
function EMInductionScene({ magnetPos, coilTurns, speed }: { magnetPos: number; coilTurns: number; speed: number }) {
  const magnetX = -1.5 + (magnetPos / 100) * 2.5;
  const distance = Math.abs(magnetPos - 50);
  const flux = coilTurns * speed / (distance + 5);
  const emf = magnetPos < 50 ? flux * 0.1 : magnetPos > 50 ? -flux * 0.1 : 0;
  const needleAngle = emf * 8;

  return (
    <group>
      <LabRoom />
      {/* Coil */}
      <group position={[0.5, 0, 0]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[i * 0.03, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.3, 0.01, 8, 32]} />
            <meshStandardMaterial color="#cc8833" metalness={0.6} />
          </mesh>
        ))}
        <Text position={[0, -0.45, 0]} fontSize={0.08} color="#888">{coilTurns} turns</Text>
      </group>

      {/* Magnet */}
      <group position={[magnetX, 0, 0]}>
        {/* N pole */}
        <mesh position={[-0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.24, 0.15, 0.15]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
        <Text position={[-0.12, 0, 0.09]} fontSize={0.08} color="white">N</Text>
        {/* S pole */}
        <mesh position={[0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.24, 0.15, 0.15]} />
          <meshStandardMaterial color="#4444ff" />
        </mesh>
        <Text position={[0.12, 0, 0.09]} fontSize={0.08} color="white">S</Text>
      </group>

      {/* Galvanometer */}
      <group position={[0.5, 1, 0.5]}>
        <mesh><cylinderGeometry args={[0.2, 0.2, 0.05, 24]} /><meshStandardMaterial color="#eee" /></mesh>
        <Text position={[0, 0, 0.03]} fontSize={0.06} color="#666">G</Text>
        {/* Needle */}
        <mesh position={[0, 0, 0.04]} rotation={[0, 0, needleAngle]}>
          <boxGeometry args={[0.15, 0.008, 0.005]} />
          <meshStandardMaterial color="#ff2222" />
        </mesh>
      </group>

      {/* Wires from coil to galvanometer */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={3} array={new Float32Array([0.5, 0.3, 0, 0.5, 0.8, 0.3, 0.5, 0.95, 0.5])} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#888" />
      </line>
    </group>
  );
}

export function ElectromagneticInduction3D() {
  const [magnetPos, setMagnetPos] = useState(50);
  const [speed, setSpeed] = useState(5);
  const [coilTurns, setCoilTurns] = useState(100);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const distance = Math.abs(magnetPos - 50);
  const flux = coilTurns * speed / (distance + 5);
  const emf = magnetPos < 50 ? flux * 0.1 : magnetPos > 50 ? -flux * 0.1 : 0;

  const reset = () => { setMagnetPos(50); setSpeed(5); setCoilTurns(100); setStep(0); };
  const steps = ["Place coil + galvanometer", "Move magnet toward coil", "Observe deflection", "Stop magnet — no deflection", "Move away — opposite deflection", "Increase speed", "Record observations", "Increase coil turns", "Explain Faraday's Law"];

  return (
    <Simulation3DLayout
      title="Electromagnetic Induction"
      objective="Observe induced EMF from changing magnetic flux"
      theory="EMF = −N(dΦ/dt). Moving magnet changes flux → induces voltage."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Magnet Pos: {magnetPos}%</label><Slider value={[magnetPos]} onValueChange={v => setMagnetPos(v[0])} min={0} max={100} /></div>
          <div><label className="text-xs text-muted-foreground">Speed: {speed} m/s</label><Slider value={[speed]} onValueChange={v => setSpeed(v[0])} min={1} max={10} /></div>
          <div><label className="text-xs text-muted-foreground">Turns: {coilTurns}</label><Slider value={[coilTurns]} onValueChange={v => setCoilTurns(v[0])} min={10} max={500} step={10} /></div>
        </div>
      }
      canvas3D={<EMInductionScene magnetPos={magnetPos} coilTurns={coilTurns} speed={speed} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Position</span><span>{magnetPos}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Speed</span><span>{speed} m/s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Turns</span><span>{coilTurns}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">EMF</span><span>{(emf * 10).toFixed(2)} mV</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Flux Δ</span><span>{magnetPos === 50 ? "Zero" : magnetPos < 50 ? "↑ Inc" : "↓ Dec"}</span></div>
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   p12-8  PN Junction Diode 3D
   ════════════════════════════════════════════════════════════ */
function PNDiodeScene({ voltage, forwardBias }: { voltage: number; forwardBias: boolean }) {
  const vThreshold = 0.7;
  const current = forwardBias ? (voltage > vThreshold ? (voltage - vThreshold) * 100 : voltage > 0.3 ? (voltage - 0.3) * 2 : 0) : -0.01;
  const electronRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    if (!forwardBias || current <= 0.1) return;
    const t = clock.getElapsedTime();
    electronRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const speed = Math.min(current / 50, 1);
      mesh.position.x = ((t * speed + i * 0.4) % 2) - 1;
    });
  });

  return (
    <group>
      <LabRoom />
      {/* P-type semiconductor */}
      <mesh position={[-0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.4, 0.4]} />
        <meshStandardMaterial color="#ff6666" transparent opacity={0.8} />
      </mesh>
      <Text position={[-0.4, 0.3, 0.21]} fontSize={0.1} color="#cc2222">P</Text>

      {/* N-type semiconductor */}
      <mesh position={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.4, 0.4]} />
        <meshStandardMaterial color="#6666ff" transparent opacity={0.8} />
      </mesh>
      <Text position={[0.4, 0.3, 0.21]} fontSize={0.1} color="#2222cc">N</Text>

      {/* Depletion region */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[forwardBias && voltage > 0.3 ? 0.05 : 0.15, 0.42, 0.42]} />
        <meshStandardMaterial color="#ffff44" transparent opacity={0.4} />
      </mesh>

      {/* Electron flow particles */}
      {forwardBias && current > 0.1 && Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} ref={el => { if (el) electronRefs.current[i] = el; }} position={[0, (i % 3 - 1) * 0.1, (Math.floor(i / 3) - 0.5) * 0.15]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#44ffff" emissive="#44ffff" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Battery */}
      <group position={[0, -0.8, 0]}>
        <mesh><boxGeometry args={[0.5, 0.2, 0.15]} /><meshStandardMaterial color="#444" /></mesh>
        <Text position={[-0.2, 0.12, 0.08]} fontSize={0.06} color={forwardBias ? "#ff4444" : "#4444ff"}>+</Text>
        <Text position={[0.2, 0.12, 0.08]} fontSize={0.06} color={forwardBias ? "#4444ff" : "#ff4444"}>−</Text>
        <Text position={[0, -0.15, 0.08]} fontSize={0.05} color="#888">{voltage.toFixed(2)} V</Text>
      </group>

      {/* Wires */}
      <line><bufferGeometry><bufferAttribute attach="attributes-position" count={2} array={new Float32Array([-0.75, 0, 0, -0.75, -0.8, 0])} itemSize={3} /></bufferGeometry><lineBasicMaterial color="#cc6633" /></line>
      <line><bufferGeometry><bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0.75, 0, 0, 0.75, -0.8, 0])} itemSize={3} /></bufferGeometry><lineBasicMaterial color="#cc6633" /></line>
    </group>
  );
}

export function PNJunctionDiode3D() {
  const [voltage, setVoltage] = useState(0.5);
  const [forwardBias, setForwardBias] = useState(true);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<{ v: number; i: number }[]>([]);
  const { enabled, toggleSound } = useSoundEffects();

  const vThreshold = 0.7;
  const current = forwardBias ? (voltage > vThreshold ? (voltage - vThreshold) * 100 : voltage > 0.3 ? (voltage - 0.3) * 2 : 0) : -0.01;

  const record = () => setData(prev => [...prev, { v: Number(voltage.toFixed(2)), i: Number(current.toFixed(2)) }]);
  const reset = () => { setVoltage(0.5); setForwardBias(true); setStep(0); setData([]); };
  const steps = ["Connect forward bias", "Increase voltage gradually", "Record current at each V", "Plot I-V curve", "Switch to reverse bias", "Repeat measurements", "Compare characteristics", "Find threshold voltage"];

  return (
    <Simulation3DLayout
      title="PN Junction Diode I-V"
      objective="Study I-V characteristics in forward and reverse bias"
      theory="Silicon diode threshold ~0.7V. Forward: exponential rise. Reverse: tiny leakage."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Voltage: {voltage.toFixed(2)} V</label><Slider value={[voltage]} onValueChange={v => setVoltage(v[0])} min={0} max={2} step={0.05} /></div>
          <Button size="sm" variant={forwardBias ? "default" : "outline"} className="w-full text-xs" onClick={() => setForwardBias(!forwardBias)}>
            {forwardBias ? "⚡ Forward Bias" : "Reverse Bias"}
          </Button>
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={record}>📝 Record</Button>
        </div>
      }
      canvas3D={<PNDiodeScene voltage={voltage} forwardBias={forwardBias} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">V</span><span>{voltage.toFixed(2)} V</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Bias</span><span>{forwardBias ? "Forward" : "Reverse"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">I</span><span>{current.toFixed(2)} mA</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Vth</span><span>{vThreshold} V</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Conducting</span><span>{forwardBias && voltage > vThreshold ? "Yes" : "No"}</span></div>
        </div>
      }
      graphPanel={data.length > 0 ? (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="v" label={{ value: "V", position: "bottom" }} tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="i" stroke="hsl(var(--primary))" name="I (mA)" dot /></LineChart>
        </ResponsiveContainer>
      ) : undefined}
    />
  );
}

/* ════════════════════════════════════════════════════════════
   p12-9  Half-Wave Rectifier 3D
   ════════════════════════════════════════════════════════════ */
function HalfWaveScene({ acVoltage, freq }: { acVoltage: number; freq: number }) {
  const waveRef = useRef<THREE.Group>(null);
  const vDrop = 0.7;

  useFrame(({ clock }) => {
    if (waveRef.current) {
      waveRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={waveRef}>
      <LabRoom />
      {/* AC Source */}
      <group position={[-1.2, 0, 0]}>
        <mesh><cylinderGeometry args={[0.15, 0.15, 0.3, 16]} /><meshStandardMaterial color="#666" metalness={0.6} /></mesh>
        <Text position={[0, 0.25, 0]} fontSize={0.08} color="#888">AC ~{acVoltage}V</Text>
      </group>

      {/* Diode */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.1, 0.2, 3]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[0.1, 0, 0]}><boxGeometry args={[0.02, 0.2, 0.2]} /><meshStandardMaterial color="#333" /></mesh>
        <Text position={[0, -0.2, 0]} fontSize={0.06} color="#888">Diode</Text>
      </group>

      {/* Resistor (load) */}
      <group position={[1, 0, 0]}>
        <mesh><boxGeometry args={[0.3, 0.12, 0.12]} /><meshStandardMaterial color="#886644" /></mesh>
        <Text position={[0, -0.15, 0]} fontSize={0.06} color="#888">Load</Text>
      </group>

      {/* Input waveform (3D ribbon) */}
      {(() => {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 100; i++) {
          const x = (i / 100) * 2 - 1;
          const v = Math.sin((i / 100) * 4 * Math.PI);
          pts.push(new THREE.Vector3(x, 1 + v * 0.3, -0.5));
        }
        return pts.length > 1 ? (
          <line>
            <bufferGeometry><bufferAttribute attach="attributes-position" count={pts.length} array={new Float32Array(pts.flatMap(p => [p.x, p.y, p.z]))} itemSize={3} /></bufferGeometry>
            <lineBasicMaterial color="#888888" linewidth={2} />
          </line>
        ) : null;
      })()}
      <Text position={[0, 1.6, -0.5]} fontSize={0.07} color="#888">Input AC</Text>

      {/* Output waveform (rectified) */}
      {(() => {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 100; i++) {
          const x = (i / 100) * 2 - 1;
          const v = Math.sin((i / 100) * 4 * Math.PI);
          const vOut = v > vDrop / acVoltage ? (v - vDrop / acVoltage) : 0;
          pts.push(new THREE.Vector3(x, -0.8 + vOut * 0.3, -0.5));
        }
        return pts.length > 1 ? (
          <line>
            <bufferGeometry><bufferAttribute attach="attributes-position" count={pts.length} array={new Float32Array(pts.flatMap(p => [p.x, p.y, p.z]))} itemSize={3} /></bufferGeometry>
            <lineBasicMaterial color="#44aaff" linewidth={2} />
          </line>
        ) : null;
      })()}
      <Text position={[0, -0.4, -0.5]} fontSize={0.07} color="#4488ff">Output DC</Text>

      {/* Wires */}
      <line><bufferGeometry><bufferAttribute attach="attributes-position" count={2} array={new Float32Array([-1.05, 0, 0, -0.15, 0, 0])} itemSize={3} /></bufferGeometry><lineBasicMaterial color="#cc6633" /></line>
      <line><bufferGeometry><bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0.15, 0, 0, 0.85, 0, 0])} itemSize={3} /></bufferGeometry><lineBasicMaterial color="#cc6633" /></line>
    </group>
  );
}

export function HalfWaveRectifier3D() {
  const [acVoltage, setAcVoltage] = useState(5);
  const [freq, setFreq] = useState(50);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const vDrop = 0.7;
  const peakOut = Math.max(0, acVoltage - vDrop);

  const reset = () => { setAcVoltage(5); setFreq(50); setStep(0); };
  const steps = ["Set AC voltage", "Observe input waveform", "Observe rectified output", "Note diode drop (0.7V)", "Change frequency", "Record peak output", "Calculate avg DC", "Compare waveforms"];

  return (
    <Simulation3DLayout
      title="Half-Wave Rectifier"
      objective="Study half-wave rectification using a diode"
      theory="Diode conducts above ~0.7V. Passes only positive half-cycles. Avg DC = V_peak/π."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">AC Peak: {acVoltage} V</label><Slider value={[acVoltage]} onValueChange={v => setAcVoltage(v[0])} min={1} max={20} step={0.5} /></div>
          <div><label className="text-xs text-muted-foreground">Freq: {freq} Hz</label><Slider value={[freq]} onValueChange={v => setFreq(v[0])} min={10} max={200} step={10} /></div>
        </div>
      }
      canvas3D={<HalfWaveScene acVoltage={acVoltage} freq={freq} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">AC Peak</span><span>{acVoltage} V</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">V drop</span><span>{vDrop} V</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">DC Peak</span><span>{peakOut.toFixed(1)} V</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Freq</span><span>{freq} Hz</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Avg DC</span><span>{(peakOut / Math.PI).toFixed(2)} V</span></div>
        </div>
      }
    />
  );
}
