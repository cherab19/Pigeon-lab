import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom, ClampStand } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ═══════════════════════════════════════════════════
// 1. MEASURING LENGTH — 3D
// ═══════════════════════════════════════════════════

function RulerMesh({ position, tool }: { position: [number, number, number]; tool: string }) {
  const tickCount = tool === "ruler" ? 20 : tool === "vernier" ? 30 : 40;
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[2.5, 0.02, 0.3]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.4} />
      </mesh>
      {Array.from({ length: tickCount + 1 }, (_, i) => {
        const x = -1.25 + (i / tickCount) * 2.5;
        const h = i % 5 === 0 ? 0.08 : 0.04;
        return (
          <mesh key={i} position={[x, 0.01, -0.12]}>
            <boxGeometry args={[0.003, h, 0.002]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        );
      })}
      {Array.from({ length: Math.floor(tickCount / 5) + 1 }, (_, i) => {
        const x = -1.25 + (i * 5 / tickCount) * 2.5;
        return (
          <Text key={i} position={[x, 0.015, -0.05]} fontSize={0.04} color="#333" anchorX="center">
            {(i * 5 / 10).toFixed(tool === "micrometer" ? 2 : 1)}
          </Text>
        );
      })}
    </group>
  );
}

function ObjectToMeasure({ length }: { length: number }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[length * 0.25, 0.06, 0.15]} />
        <meshStandardMaterial color="#4488ff" metalness={0.3} roughness={0.5} />
      </mesh>
      <Text position={[0, 0.06, 0]} fontSize={0.04} color="#4488ff" anchorX="center">
        Object
      </Text>
    </group>
  );
}

function MeasuringLength3DScene({ objectLen, tool, rulerPos }: { objectLen: number; tool: string; rulerPos: number }) {
  return (
    <>
      <LabRoom />
      <group position={[0, -0.4, 0]}>
        <ObjectToMeasure length={objectLen} />
        <RulerMesh position={[rulerPos * 0.25 - 0.5, -0.04, 0.25]} tool={tool} />
      </group>
    </>
  );
}

export function MeasuringLength3D() {
  const [objectLen] = useState(() => +(Math.random() * 8 + 2).toFixed(2));
  const [tool, setTool] = useState<"ruler" | "vernier" | "micrometer">("ruler");
  const [rulerPos, setRulerPos] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const precision = tool === "ruler" ? 0.1 : tool === "vernier" ? 0.01 : 0.001;
  const measured = Math.abs(objectLen - rulerPos);
  const roundedMeasured = +measured.toFixed(tool === "ruler" ? 1 : tool === "vernier" ? 2 : 3);
  const errorPct = studentAnswer ? Math.abs((+studentAnswer - objectLen) / objectLen * 100).toFixed(1) : "—";

  const steps = [
    "Select a measuring tool",
    "Observe the 3D object on the table",
    "Adjust ruler position with slider",
    "Read the measurement",
    "Note estimated digit & precision",
    "Enter your measured value",
    "Compare error percentage",
  ];

  const reset = () => { setRulerPos(0); setStudentAnswer(""); setStep(0); setTool("ruler"); };

  return (
    <Simulation3DLayout
      title="3D Lab: Measuring Length & Area"
      objective="Measure object length using virtual instruments in 3D"
      theory="Measurement precision: Ruler ±0.1cm, Vernier ±0.01cm, Micrometer ±0.001cm."
      onReset={reset}
      steps={steps}
      currentStep={step}
      onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Tool</span>
            {(["ruler", "vernier", "micrometer"] as const).map(t => (
              <Button key={t} variant={tool === t ? "default" : "outline"} size="sm" className="w-full capitalize text-xs"
                onClick={() => { setTool(t); setStep(Math.max(step, 1)); playClick(); }}>
                {t}
              </Button>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Position: {rulerPos.toFixed(2)} cm</label>
            <Slider value={[rulerPos]} onValueChange={v => { setRulerPos(v[0]); setStep(Math.max(step, 3)); }} min={0} max={10} step={precision} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Your Answer (cm)</label>
            <input type="number" step={precision} value={studentAnswer}
              onChange={e => { setStudentAnswer(e.target.value); setStep(Math.max(step, 5)); }}
              className="w-full rounded border border-border bg-background px-2 py-1 text-xs font-mono" />
          </div>
        </div>
      }
      canvas3D={<MeasuringLength3DScene objectLen={objectLen} tool={tool} rulerPos={rulerPos} />}
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Object</span><span>{objectLen.toFixed(2)} cm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Measured</span><span className="text-primary font-bold">{roundedMeasured} cm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Precision</span><span>±{precision} cm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Your Answer</span><span>{studentAnswer || "—"} cm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Error</span><span className={+errorPct < 5 ? "text-green-500" : "text-red-500"}>{errorPct}%</span></div>
          <div className="mt-2 p-2 rounded bg-muted text-[10px]">
            Area = {objectLen.toFixed(2)} × {(objectLen * 0.4).toFixed(2)} = {(objectLen * objectLen * 0.4).toFixed(2)} cm²
          </div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 2. BEAM BALANCE — 3D
// ═══════════════════════════════════════════════════

function BeamBalance3DScene({ needleAngle, weights, unknownMass }: {
  needleAngle: number; weights: number[]; unknownMass: number;
}) {
  const beamRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (beamRef.current) {
      const target = (needleAngle * Math.PI) / 180;
      beamRef.current.rotation.z += (target - beamRef.current.rotation.z) * 0.08;
    }
  });

  const totalWeights = weights.reduce((a, b) => a + b, 0);

  return (
    <>
      <LabRoom />
      <group position={[0, -0.2, 0]}>
        {/* Pivot stand */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.06, 0.6, 16]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Pivot point */}
        <mesh position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#666" metalness={0.9} />
        </mesh>
        {/* Beam */}
        <group ref={beamRef} position={[0, 0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2, 0.03, 0.08]} />
            <meshStandardMaterial color="#b8860b" roughness={0.5} />
          </mesh>
          {/* Left pan (unknown mass) */}
          <group position={[-0.85, -0.2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.15, 0.01, 24]} />
              <meshStandardMaterial color="#aaa" metalness={0.7} />
            </mesh>
            {/* Strings */}
            {[-0.1, 0, 0.1].map((z, i) => (
              <mesh key={i} position={[0, 0.1, z]}>
                <cylinderGeometry args={[0.003, 0.003, 0.2, 4]} />
                <meshStandardMaterial color="#666" />
              </mesh>
            ))}
            {/* Unknown mass block */}
            <mesh position={[0, 0.02, 0]} castShadow>
              <boxGeometry args={[0.12, 0.08, 0.12]} />
              <meshStandardMaterial color="#e74c3c" roughness={0.4} />
            </mesh>
            <Text position={[0, 0.1, 0]} fontSize={0.04} color="#e74c3c" anchorX="center">?</Text>
          </group>
          {/* Right pan (standard weights) */}
          <group position={[0.85, -0.2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.15, 0.01, 24]} />
              <meshStandardMaterial color="#aaa" metalness={0.7} />
            </mesh>
            {[-0.1, 0, 0.1].map((z, i) => (
              <mesh key={i} position={[0, 0.1, z]}>
                <cylinderGeometry args={[0.003, 0.003, 0.2, 4]} />
                <meshStandardMaterial color="#666" />
              </mesh>
            ))}
            {/* Stacked weights */}
            {weights.map((w, i) => (
              <mesh key={i} position={[0, 0.02 + i * 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.04 + w / 5000, 0.04 + w / 5000, 0.025, 16]} />
                <meshStandardMaterial color="#f39c12" metalness={0.6} roughness={0.3} />
              </mesh>
            ))}
          </group>
          {/* Needle */}
          <mesh position={[0, -0.15, 0.05]}>
            <boxGeometry args={[0.005, 0.25, 0.005]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
        </group>
      </group>
    </>
  );
}

export function BeamBalance3D() {
  const [unknownMass] = useState(() => Math.round(Math.random() * 900 + 100));
  const [weights, setWeights] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const totalWeights = weights.reduce((a, b) => a + b, 0);
  const diff = unknownMass - totalWeights;
  const balanced = Math.abs(diff) < 5;
  const needleAngle = Math.max(-15, Math.min(15, diff * 0.05));
  const available = [500, 200, 100, 50, 20, 10, 5];

  const addWeight = (w: number) => { setWeights([...weights, w]); setStep(Math.max(step, 2)); playClick(); };
  const removeWeight = (i: number) => { setWeights(weights.filter((_, j) => j !== i)); playClick(); };
  const reset = () => { setWeights([]); setStep(0); };

  const steps = [
    "Observe the unknown mass on the left pan",
    "Add standard masses to the right pan",
    "Adjust until the beam balances",
    "Record the total standard mass",
    "The unknown mass equals the total standard masses",
  ];

  return (
    <Simulation3DLayout
      title="3D Lab: Beam Balance (Mass Measurement)"
      objective="Determine the unknown mass by balancing with standard masses"
      theory="When balanced, the unknown mass equals the sum of standard masses on the opposite pan."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-semibold">Add Masses (g)</span>
          <div className="grid grid-cols-2 gap-1">
            {available.map(w => (
              <Button key={w} variant="outline" size="sm" className="text-xs h-7" onClick={() => addWeight(w)}>
                +{w}g
              </Button>
            ))}
          </div>
          {weights.length > 0 && (
            <div className="space-y-1 mt-2">
              <span className="text-xs text-muted-foreground">On pan (click to remove):</span>
              <div className="flex flex-wrap gap-1">
                {weights.map((w, i) => (
                  <button key={i} onClick={() => removeWeight(i)} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 hover:bg-destructive/20 text-primary">
                    {w}g ×
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      }
      canvas3D={<BeamBalance3DScene needleAngle={needleAngle} weights={weights} unknownMass={unknownMass} />}
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Unknown</span><span>??? g</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Standard</span><span>{totalWeights} g</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Difference</span><span>{Math.abs(diff)} g</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tilt</span><span>{needleAngle.toFixed(1)}°</span></div>
          {balanced && (
            <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-center font-bold">
              ✅ BALANCED! Mass ≈ {totalWeights}g
            </div>
          )}
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 3. TIME MEASUREMENT — 3D
// ═══════════════════════════════════════════════════

function Stopwatch3D({ time, running }: { time: number; running: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current && running) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={ref} position={[0, 0.2, 0]}>
      {/* Watch body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Watch face */}
      <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.23, 32]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      {/* Second hand */}
      <group position={[0, 0.03, 0]} rotation={[0, 0, -(time % 60) * (Math.PI / 30)]}>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[0.005, 0.003, 0.16]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      </group>
      {/* Crown */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 12]} />
        <meshStandardMaterial color="#888" metalness={0.9} />
      </mesh>
      {/* Time display */}
      <Text position={[0, 0.15, 0.28]} fontSize={0.06} color="#333" anchorX="center">
        {time.toFixed(2)}s
      </Text>
    </group>
  );
}

function FallingBall3D({ time, running, height }: { time: number; running: boolean; height: number }) {
  const y = Math.max(0, height - 0.5 * 9.8 * time * time);
  return (
    <group position={[0.8, -0.45, 0]}>
      {/* Drop tower */}
      <mesh position={[0, height * 0.15 + 0.05, 0]}>
        <boxGeometry args={[0.02, height * 0.3 + 0.1, 0.02]} />
        <meshStandardMaterial color="#666" metalness={0.7} />
      </mesh>
      {/* Ball */}
      <mesh position={[0, Math.max(0.05, y * 0.3), 0]} castShadow>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function TimeMeasurement3D() {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [trials, setTrials] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [dropHeight, setDropHeight] = useState(2);
  const { playClick } = useSoundEffects();
  const intervalRef = useRef<number | null>(null);

  const expectedTime = Math.sqrt((2 * dropHeight) / 9.8);
  const avgTime = trials.length > 0 ? trials.reduce((a, b) => a + b, 0) / trials.length : 0;
  const stdDev = trials.length > 1
    ? Math.sqrt(trials.reduce((sum, t) => sum + (t - avgTime) ** 2, 0) / (trials.length - 1))
    : 0;

  const startStop = useCallback(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      setTrials(prev => [...prev, time]);
      setStep(Math.max(step, 3));
      playClick();
    } else {
      setTime(0);
      setRunning(true);
      setStep(Math.max(step, 1));
      const start = Date.now();
      intervalRef.current = window.setInterval(() => {
        setTime((Date.now() - start) / 1000);
      }, 16);
      playClick();
    }
  }, [running, time, step, playClick]);

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false); setTime(0); setTrials([]); setStep(0);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const steps = [
    "Set the drop height",
    "Press Start to begin timing",
    "Press Stop when the ball hits the ground",
    "Record the trial time",
    "Repeat for multiple trials",
    "Calculate average and compare",
  ];

  return (
    <Simulation3DLayout
      title="3D Lab: Time Measurement"
      objective="Measure free-fall time and calculate average from multiple trials"
      theory="Repeated trials reduce random error. Expected time: t = √(2h/g)"
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Drop Height: {dropHeight.toFixed(1)} m</label>
            <Slider value={[dropHeight]} onValueChange={v => setDropHeight(v[0])} min={0.5} max={5} step={0.1} />
          </div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop}>
            {running ? "⏹ Stop" : "▶ Start"}
          </Button>
          <div className="text-center font-mono text-lg text-primary">{time.toFixed(3)}s</div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <Stopwatch3D time={time} running={running} />
          <FallingBall3D time={running ? time : 0} running={running} height={dropHeight} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Height</span><span>{dropHeight.toFixed(1)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Expected</span><span>{expectedTime.toFixed(3)} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Trials</span><span>{trials.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Average</span><span className="text-primary font-bold">{avgTime.toFixed(3)} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Std Dev</span><span>{stdDev.toFixed(4)} s</span></div>
          {trials.length > 0 && (
            <div className="mt-2 space-y-0.5">
              <span className="text-muted-foreground">Trials:</span>
              {trials.map((t, i) => (
                <div key={i} className="flex justify-between pl-2">
                  <span>#{i + 1}</span><span>{t.toFixed(3)}s</span>
                </div>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 4. DISTANCE vs DISPLACEMENT — 3D
// ═══════════════════════════════════════════════════

function PathTracer({ points }: { points: [number, number, number][] }) {
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    if (points.length > 1) {
      const verts = new Float32Array(points.flat());
      geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    }
    return geo;
  }, [points]);

  if (points.length < 2) return null;

  return (
    <line>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <lineBasicMaterial attach="material" color="#4488ff" linewidth={2} />
    </line>
  );
}

function DisplacementArrow({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const dir = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
  const len = dir.length();
  if (len < 0.01) return null;
  const mid: [number, number, number] = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2];

  return (
    <group>
      <mesh position={mid} castShadow>
        <cylinderGeometry args={[0.008, 0.008, len, 8]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <Text position={[mid[0], mid[1] + 0.08, mid[2]]} fontSize={0.05} color="#e74c3c" anchorX="center">
        d = {len.toFixed(2)}m
      </Text>
    </group>
  );
}

function WalkerFigure({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Head */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <capsuleGeometry args={[0.025, 0.1, 8, 8]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
    </group>
  );
}

export function DistanceDisplacement3D() {
  const [points, setPoints] = useState<[number, number, number][]>([[0, -0.44, 0]]);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const directions = [
    { label: "North (+Z)", delta: [0, 0, -0.3] },
    { label: "South (-Z)", delta: [0, 0, 0.3] },
    { label: "East (+X)", delta: [0.3, 0, 0] },
    { label: "West (-X)", delta: [-0.3, 0, 0] },
  ];

  const addMove = (delta: number[]) => {
    const last = points[points.length - 1];
    const next: [number, number, number] = [last[0] + delta[0], last[1] + delta[1], last[2] + delta[2]];
    setPoints([...points, next]);
    setStep(Math.max(step, 2));
    playClick();
  };

  const totalDistance = points.reduce((sum, p, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    return sum + Math.sqrt((p[0] - prev[0]) ** 2 + (p[2] - prev[2]) ** 2);
  }, 0);

  const displacement = Math.sqrt(
    (points[points.length - 1][0] - points[0][0]) ** 2 +
    (points[points.length - 1][2] - points[0][2]) ** 2
  );

  const reset = () => { setPoints([[0, -0.44, 0]]); setStep(0); };

  const steps = [
    "Start at the origin point",
    "Move in different directions using buttons",
    "Observe the path traced (blue line)",
    "Compare total distance vs displacement (red arrow)",
    "Note: distance ≥ displacement always",
  ];

  return (
    <Simulation3DLayout
      title="3D Lab: Distance vs Displacement"
      objective="Distinguish between distance (scalar) and displacement (vector)"
      theory="Distance is total path length. Displacement is the straight-line vector from start to finish."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-semibold">Move Direction</span>
          {directions.map(d => (
            <Button key={d.label} variant="outline" size="sm" className="w-full text-xs" onClick={() => addMove(d.delta)}>
              {d.label}
            </Button>
          ))}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Grid on floor */}
          <gridHelper args={[4, 20, "#8a8070", "#8a8070"]} position={[0, -1.49, 0]} />
          {/* Start marker */}
          <mesh position={points[0]} castShadow>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color="#2ecc71" />
          </mesh>
          <Text position={[points[0][0], points[0][1] + 0.08, points[0][2]]} fontSize={0.04} color="#2ecc71">Start</Text>
          {/* Path */}
          <PathTracer points={points} />
          {/* Walker */}
          <WalkerFigure position={points[points.length - 1]} />
          {/* Displacement arrow */}
          {points.length > 1 && <DisplacementArrow start={points[0]} end={points[points.length - 1]} />}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Steps</span><span>{points.length - 1}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Distance</span><span className="text-blue-400">{totalDistance.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Displacement</span><span className="text-red-400">{displacement.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Ratio d/D</span><span>{totalDistance > 0 ? (displacement / totalDistance).toFixed(3) : "—"}</span></div>
          <div className="mt-2 p-2 rounded bg-muted text-[10px]">
            Distance is always ≥ Displacement. They're equal only for straight-line motion.
          </div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 5. GRAPHICAL MOTION ANALYSIS — 3D
// ═══════════════════════════════════════════════════

function MovingCar({ position, velocity }: { position: number; velocity: number }) {
  return (
    <group position={[position * 0.15 - 1.5, -0.4, 0]}>
      {/* Car body */}
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.06, 0.1]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.1, 0.05, 0.08]} />
        <meshStandardMaterial color="#c0392b" metalness={0.3} />
      </mesh>
      {/* Wheels */}
      {[[-0.07, -0.03, 0.06], [0.07, -0.03, 0.06], [-0.07, -0.03, -0.06], [0.07, -0.03, -0.06]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 12]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
      {/* Velocity indicator */}
      <Text position={[0, 0.12, 0]} fontSize={0.035} color="#e74c3c" anchorX="center">
        v = {velocity.toFixed(1)} m/s
      </Text>
    </group>
  );
}

export function GraphicalMotion3D() {
  const [velocity, setVelocity] = useState(2);
  const [acceleration, setAcceleration] = useState(0);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [posData, setPosData] = useState<{ t: number; x: number; v: number }[]>([]);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const currentV = velocity + acceleration * time;
  const currentX = velocity * time + 0.5 * acceleration * time * time;

  const startStop = useCallback(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      playClick();
    } else {
      setRunning(true);
      setStep(Math.max(step, 2));
      const start = Date.now();
      const initTime = time;
      intervalRef.current = window.setInterval(() => {
        const elapsed = initTime + (Date.now() - start) / 1000;
        if (elapsed > 10) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          return;
        }
        setTime(elapsed);
        const v = velocity + acceleration * elapsed;
        const x = velocity * elapsed + 0.5 * acceleration * elapsed * elapsed;
        setPosData(prev => [...prev.slice(-80), { t: +elapsed.toFixed(2), x: +x.toFixed(2), v: +v.toFixed(2) }]);
      }, 50);
      playClick();
    }
  }, [running, time, velocity, acceleration, step, playClick]);

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false); setTime(0); setPosData([]); setStep(0);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const steps = [
    "Set initial velocity and acceleration",
    "Press Start to begin the motion",
    "Observe the car moving on the 3D track",
    "Analyze position-time graph below",
    "Analyze velocity-time graph below",
    "Note: slope of x-t = velocity, slope of v-t = acceleration",
  ];

  return (
    <Simulation3DLayout
      title="3D Lab: Graphical Motion Analysis"
      objective="Plot and interpret position-time and velocity-time graphs"
      theory="Slope of x-t = velocity. Slope of v-t = acceleration. Area under v-t = displacement."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Initial v: {velocity.toFixed(1)} m/s</label>
            <Slider value={[velocity]} onValueChange={v => { setVelocity(v[0]); }} min={0} max={5} step={0.1} disabled={running} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Accel: {acceleration.toFixed(1)} m/s²</label>
            <Slider value={[acceleration]} onValueChange={v => { setAcceleration(v[0]); }} min={-2} max={3} step={0.1} disabled={running} />
          </div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop}>
            {running ? "⏹ Stop" : "▶ Start"}
          </Button>
          <div className="text-center font-mono text-sm text-primary">t = {time.toFixed(2)}s</div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Track */}
          <mesh position={[0, -0.47, 0]} receiveShadow>
            <boxGeometry args={[3.5, 0.01, 0.2]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          {/* Track markings */}
          {Array.from({ length: 20 }, (_, i) => (
            <mesh key={i} position={[-1.5 + i * 0.175, -0.46, 0.12]}>
              <boxGeometry args={[0.003, 0.005, 0.02]} />
              <meshStandardMaterial color="#aaa" />
            </mesh>
          ))}
          <MovingCar position={Math.min(currentX, 18)} velocity={currentV} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{time.toFixed(2)} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Position</span><span className="text-primary">{currentX.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Velocity</span><span>{currentV.toFixed(2)} m/s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Accel</span><span>{acceleration.toFixed(1)} m/s²</span></div>
        </div>
      }
      graphPanel={
        <div className="grid grid-cols-2 gap-4 h-[160px]">
          <div>
            <span className="text-[10px] text-muted-foreground">Position–Time</span>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={posData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="t" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="x" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Velocity–Time</span>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={posData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="t" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="v" stroke="#e74c3c" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      }
    />
  );
}
