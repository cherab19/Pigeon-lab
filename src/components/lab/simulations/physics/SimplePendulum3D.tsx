import { useRef, useState, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom, ClampStand } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { ControlGroup, DataRow } from "../../SimulationLayout";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── 3D Pendulum Scene ───
function PendulumScene({
  length, angle, running, gravity, damping, soundRef,
}: {
  length: number; angle: number; running: boolean; gravity: number; damping: number;
  soundRef: React.MutableRefObject<{ playSwing: () => void; enabled: boolean }>;
}) {
  const pivotRef = useRef<THREE.Group>(null);
  const angleRef = useRef(angle * Math.PI / 180);
  const velocityRef = useRef(0);
  const lastSoundTime = useRef(0);

  // Reset angle when not running or angle changes
  useEffect(() => {
    if (!running) {
      angleRef.current = angle * Math.PI / 180;
      velocityRef.current = 0;
    }
  }, [angle, running]);

  useFrame((_, delta) => {
    if (!pivotRef.current) return;

    if (running) {
      const dt = Math.min(delta, 0.033);
      // Realistic pendulum physics: θ'' = -(g/L)sin(θ) - b*θ'
      const acceleration = -(gravity / length) * Math.sin(angleRef.current) - damping * velocityRef.current;
      velocityRef.current += acceleration * dt;
      angleRef.current += velocityRef.current * dt;

      // Play sound at bottom of swing
      const now = performance.now();
      if (Math.abs(angleRef.current) < 0.05 && Math.abs(velocityRef.current) > 0.5 && now - lastSoundTime.current > 300) {
        soundRef.current.playSwing();
        lastSoundTime.current = now;
      }
    }

    pivotRef.current.rotation.z = angleRef.current;
  });

  const bobRadius = 0.12;

  return (
    <group position={[0, 1, 0]}>
      {/* Pivot point */}
      <mesh castShadow>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Swinging arm */}
      <group ref={pivotRef}>
        {/* String */}
        <mesh position={[0, -length / 2, 0]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, length, 8]} />
          <meshStandardMaterial color="#ccc" />
        </mesh>

        {/* Bob */}
        <mesh position={[0, -length, 0]} castShadow>
          <sphereGeometry args={[bobRadius, 32, 32]} />
          <meshStandardMaterial
            color="#cc4444"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Bob highlight */}
        <mesh position={[0, -length, 0]}>
          <sphereGeometry args={[bobRadius + 0.005, 32, 32]} />
          <meshStandardMaterial color="#ff6666" transparent opacity={0.15} />
        </mesh>

        {/* Angle indicator line (vertical reference) */}
        <mesh position={[0, -length / 2, 0.01]}>
          <planeGeometry args={[0.003, length]} />
          <meshBasicMaterial color="#4488ff" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Vertical reference line */}
      <mesh position={[0, -length / 2, -0.01]}>
        <planeGeometry args={[0.002, length]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>

      {/* Ruler markings on the side */}
      {Array.from({ length: Math.ceil(length * 10) + 1 }, (_, i) => {
        const y = -i * 0.1;
        const isMajor = i % 5 === 0;
        return (
          <group key={i} position={[0.3, y, 0]}>
            <mesh>
              <boxGeometry args={[isMajor ? 0.06 : 0.03, 0.003, 0.001]} />
              <meshBasicMaterial color={isMajor ? "#ffaa00" : "#888"} />
            </mesh>
            {isMajor && (
              <Text
                position={[0.06, 0, 0]}
                fontSize={0.04}
                color="#ffaa00"
                anchorX="left"
              >
                {(i / 10).toFixed(1)}m
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ─── Main Simulation Component ───
export function SimplePendulum3D() {
  const [length, setLength] = useState(1.0);
  const [angle, setAngle] = useState(30);
  const [gravity, setGravity] = useState(9.81);
  const [damping, setDamping] = useState(0.05);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [dataPoints, setDataPoints] = useState<{ time: number; period: number }[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [oscillations, setOscillations] = useState(0);
  const startTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const sound = useSoundEffects();
  const soundRef = useRef(sound);
  soundRef.current = sound;

  const theoreticalPeriod = 2 * Math.PI * Math.sqrt(length / gravity);
  const measuredPeriod = oscillations > 0 ? elapsedTime / oscillations : 0;
  const calcG = oscillations >= 1 && measuredPeriod > 0
    ? (4 * Math.PI * Math.PI * length) / (measuredPeriod * measuredPeriod)
    : 0;

  const handleStart = useCallback(() => {
    setRunning(true);
    setStep(Math.max(step, 4));
    sound.playClick();
    startTimeRef.current = performance.now();
    setOscillations(0);
    setElapsedTime(0);

    // Timer to track elapsed time
    timerRef.current = window.setInterval(() => {
      setElapsedTime((performance.now() - startTimeRef.current) / 1000);
    }, 100);
  }, [step, sound]);

  const handleStop = useCallback(() => {
    setRunning(false);
    sound.playClick();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStep(Math.max(step, 6));
  }, [step, sound]);

  const handleCountOscillation = useCallback(() => {
    setOscillations(prev => {
      const newCount = prev + 1;
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const period = elapsed / newCount;
      setDataPoints(dp => [...dp, { time: elapsed, period: +period.toFixed(3) }]);
      sound.playPop();
      return newCount;
    });
  }, [sound]);

  const handleReset = useCallback(() => {
    setRunning(false);
    setAngle(30);
    setLength(1.0);
    setGravity(9.81);
    setDamping(0.05);
    setStep(0);
    setDataPoints([]);
    setElapsedTime(0);
    setOscillations(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const steps = [
    "Observe the pendulum setup in the 3D workspace",
    "Adjust the string length using the slider",
    "Set the initial angle of displacement",
    "Click 'Start' to release the pendulum",
    "Watch the pendulum oscillate back and forth",
    "Click 'Count' each time the bob completes a full swing",
    "Stop the timer after 10 oscillations",
    "Record the period and calculate g",
    "Change the length and repeat the experiment",
    "Compare theoretical vs measured values",
  ];

  return (
    <Simulation3DLayout
      title="3D Lab: Simple Pendulum"
      objective="Determine acceleration due to gravity using T = 2π√(L/g)"
      theory="A simple pendulum's period depends on length and gravity, not mass. By measuring the period T for a known length L, we can calculate g = 4π²L/T². This is valid for small angles (<15°)."
      onReset={handleReset}
      soundEnabled={sound.enabled}
      onToggleSound={sound.toggleSound}
      steps={steps}
      currentStep={step}
      onStepClick={setStep}
      controls={
        <div className="space-y-4">
          <ControlGroup
            label="String Length"
            value={length}
            onChange={v => { setLength(v); setStep(Math.max(step, 1)); }}
            min={0.3}
            max={2.0}
            step={0.1}
            unit="m"
          />
          <ControlGroup
            label="Initial Angle"
            value={angle}
            onChange={v => { setAngle(v); setStep(Math.max(step, 2)); }}
            min={5}
            max={60}
            step={1}
            unit="°"
          />
          <ControlGroup
            label="Gravity"
            value={gravity}
            onChange={setGravity}
            min={1}
            max={20}
            step={0.1}
            unit="m/s²"
          />
          <ControlGroup
            label="Damping"
            value={damping}
            onChange={setDamping}
            min={0}
            max={0.5}
            step={0.01}
          />

          <div className="flex gap-2">
            {!running ? (
              <Button size="sm" className="flex-1" onClick={handleStart}>
                ▶ Start
              </Button>
            ) : (
              <Button size="sm" variant="destructive" className="flex-1" onClick={handleStop}>
                ⏹ Stop
              </Button>
            )}
          </div>

          {running && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleCountOscillation}
            >
              🔔 Count Oscillation ({oscillations})
            </Button>
          )}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <ClampStand position={[0, 0, 0]} height={2.5} />
          <PendulumScene
            length={length}
            angle={angle}
            running={running}
            gravity={gravity}
            damping={damping}
            soundRef={soundRef}
          />
        </>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Length (L)" value={length.toFixed(1)} unit="m" />
          <DataRow label="Angle (θ)" value={angle} unit="°" />
          <DataRow label="Gravity" value={gravity.toFixed(1)} unit="m/s²" />
          <DataRow label="Elapsed Time" value={elapsedTime.toFixed(1)} unit="s" />
          <DataRow label="Oscillations" value={oscillations} />
          <div className="my-2 border-t border-border" />
          <DataRow label="T (theory)" value={theoreticalPeriod.toFixed(3)} unit="s" />
          <DataRow label="T (measured)" value={measuredPeriod.toFixed(3)} unit="s" />
          <DataRow label="Calc. g" value={calcG > 0 ? calcG.toFixed(2) : "—"} unit="m/s²" />
          {calcG > 0 && (
            <DataRow
              label="Error"
              value={Math.abs(((calcG - gravity) / gravity) * 100).toFixed(1)}
              unit="%"
            />
          )}
        </div>
      }
      graphPanel={
        dataPoints.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" label={{ value: "Time (s)", position: "bottom" }} tick={{ fontSize: 10 }} />
                <YAxis domain={["auto", "auto"]} label={{ value: "Period (s)", angle: -90, position: "left" }} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="period"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  name="Measured Period"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Start the experiment and count oscillations to see the period graph.</p>
        )
      }
    />
  );
}
