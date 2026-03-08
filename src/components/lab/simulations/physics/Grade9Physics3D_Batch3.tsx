import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

// ═══════════════════════════════════════════════════
// 12. WAVE SIMULATION — 3D
// ═══════════════════════════════════════════════════

function WaveMesh({ amplitude, frequency, wavelength, time, running }: {
  amplitude: number; frequency: number; wavelength: number; time: number; running: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geoRef = useRef<THREE.PlaneGeometry>(null);

  useFrame(() => {
    if (!geoRef.current || !running) return;
    const pos = geoRef.current.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = amplitude * 0.1 * Math.sin(2 * Math.PI * (x / (wavelength * 0.3) - frequency * time));
      pos.setZ(i, y);
    }
    pos.needsUpdate = true;
    geoRef.current.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <planeGeometry ref={geoRef} args={[3, 1.5, 80, 40]} />
      <meshStandardMaterial color="#3498db" wireframe side={THREE.DoubleSide} transparent opacity={0.6} />
    </mesh>
  );
}

function WaveParticles({ amplitude, frequency, wavelength, time, running }: {
  amplitude: number; frequency: number; wavelength: number; time: number; running: boolean;
}) {
  const particles = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 30; i++) {
      pts.push([-1.5 + i * 0.1, (Math.random() - 0.5) * 0.5]);
    }
    return pts;
  }, []);

  return (
    <group>
      {particles.map(([x, z], i) => {
        const y = running
          ? amplitude * 0.1 * Math.sin(2 * Math.PI * (x / (wavelength * 0.3) - frequency * time))
          : 0;
        return (
          <mesh key={i} position={[x, y - 0.2, z]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
        );
      })}
    </group>
  );
}

export function WaveSimulation3D() {
  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(1);
  const [wavelength, setWavelength] = useState(2);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { playClick } = useSoundEffects();

  const speed = frequency * wavelength;

  const startStop = useCallback(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true); setStep(Math.max(step, 2));
      const start = Date.now();
      intervalRef.current = window.setInterval(() => {
        setTime((Date.now() - start) / 1000);
      }, 16);
    }
    playClick();
  }, [running, step, playClick]);

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false); setTime(0); setStep(0);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const steps = ["Set amplitude (height of wave)", "Set frequency (oscillations per second)", "Set wavelength", "Start wave and observe", "Verify: v = f × λ"];

  return (
    <Simulation3DLayout
      title="3D Lab: Transverse Wave Simulation"
      objective="Explore wave properties: v = fλ"
      theory="A wave transports energy without transporting matter. Speed = frequency × wavelength."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Amplitude: {amplitude.toFixed(1)} m</label>
            <Slider value={[amplitude]} onValueChange={v => setAmplitude(v[0])} min={0.1} max={3} step={0.1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Frequency: {frequency.toFixed(1)} Hz</label>
            <Slider value={[frequency]} onValueChange={v => setFrequency(v[0])} min={0.1} max={5} step={0.1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Wavelength: {wavelength.toFixed(1)} m</label>
            <Slider value={[wavelength]} onValueChange={v => setWavelength(v[0])} min={0.5} max={5} step={0.1} />
          </div>
          <Button size="sm" className="w-full" variant={running ? "destructive" : "default"} onClick={startStop}>
            {running ? "⏹ Stop" : "▶ Start Wave"}
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <WaveMesh amplitude={amplitude} frequency={frequency} wavelength={wavelength} time={time} running={running} />
          <WaveParticles amplitude={amplitude} frequency={frequency} wavelength={wavelength} time={time} running={running} />
          {/* Wavelength indicator */}
          <Text position={[0, 0.3, -0.5]} fontSize={0.05} color="#f39c12" anchorX="center">
            λ = {wavelength.toFixed(1)}m | f = {frequency.toFixed(1)}Hz | v = {speed.toFixed(1)}m/s
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Amplitude</span><span>{amplitude.toFixed(1)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Frequency</span><span>{frequency.toFixed(1)} Hz</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Wavelength</span><span>{wavelength.toFixed(1)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Speed (fλ)</span><span className="text-primary font-bold">{speed.toFixed(2)} m/s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Period</span><span>{(1 / frequency).toFixed(3)} s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{time.toFixed(2)} s</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 13. THERMAL EXPANSION — 3D
// ═══════════════════════════════════════════════════

function MetalRod3D({ length, temperature, material }: {
  length: number; temperature: number; material: string;
}) {
  const colors: Record<string, string> = { aluminum: "#C0C0C0", copper: "#B87333", steel: "#708090", brass: "#B5A642" };
  const col = colors[material] || "#888";
  // Glow effect based on temperature
  const glowIntensity = Math.min(1, temperature / 500);

  return (
    <group position={[0, -0.2, 0]}>
      {/* Rod */}
      <mesh castShadow>
        <boxGeometry args={[length * 0.12, 0.04, 0.04]} />
        <meshStandardMaterial
          color={col}
          metalness={0.8}
          roughness={0.2}
          emissive={new THREE.Color(1, 0.2, 0)}
          emissiveIntensity={glowIntensity * 0.5}
        />
      </mesh>
      {/* Clamps */}
      {[-length * 0.06 + 0.02, length * 0.06 - 0.02].map((x, i) => (
        <mesh key={i} position={[x, 0.03, 0]} castShadow>
          <boxGeometry args={[0.02, 0.03, 0.06]} />
          <meshStandardMaterial color="#444" metalness={0.9} />
        </mesh>
      ))}
      {/* Length markers */}
      <Text position={[0, -0.05, 0]} fontSize={0.03} color="#aaa" anchorX="center">
        L = {length.toFixed(4)} m
      </Text>
      {/* Temperature glow particles */}
      {temperature > 100 && Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * length * 0.1, 0.04 + Math.random() * 0.05, (Math.random() - 0.5) * 0.03]}>
          <sphereGeometry args={[0.005, 6, 6]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function BunsenBurner3D({ on }: { on: boolean }) {
  return (
    <group position={[0, -0.45, 0.3]}>
      {/* Base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.04, 16]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      {/* Tube */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, 0.16, 12]} />
        <meshStandardMaterial color="#555" metalness={0.8} />
      </mesh>
      {/* Flame */}
      {on && (
        <group position={[0, 0.2, 0]}>
          <mesh>
            <coneGeometry args={[0.02, 0.08, 12]} />
            <meshStandardMaterial color="#3388ff" emissive="#3388ff" emissiveIntensity={2} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <coneGeometry args={[0.012, 0.06, 12]} />
            <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={3} transparent opacity={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function ThermalExpansion3D() {
  const [material, setMaterial] = useState("aluminum");
  const [initialLength, setInitialLength] = useState(1);
  const [temperature, setTemperature] = useState(20);
  const [heating, setHeating] = useState(false);
  const [step, setStep] = useState(0);
  const { playClick } = useSoundEffects();

  const alphas: Record<string, number> = { aluminum: 23e-6, copper: 17e-6, steel: 12e-6, brass: 19e-6 };
  const alpha = alphas[material] || 23e-6;
  const deltaT = temperature - 20;
  const deltaL = initialLength * alpha * deltaT;
  const finalLength = initialLength + deltaL;

  useEffect(() => {
    if (!heating) return;
    const id = setInterval(() => {
      setTemperature(prev => {
        if (prev >= 500) { setHeating(false); return 500; }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(id);
  }, [heating]);

  const reset = () => { setTemperature(20); setHeating(false); setStep(0); };

  const steps = ["Select material type", "Set initial rod length", "Heat the rod (increase temperature)", "Observe expansion", "Record ΔL = L₀αΔT"];

  return (
    <Simulation3DLayout
      title="3D Lab: Thermal Expansion"
      objective="Observe how temperature affects metal rod length"
      theory="Linear expansion: ΔL = L₀αΔT. Different materials have different α values."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Material</span>
            {["aluminum", "copper", "steel", "brass"].map(m => (
              <Button key={m} variant={material === m ? "default" : "outline"} size="sm" className="w-full capitalize text-xs"
                onClick={() => { setMaterial(m); setStep(Math.max(step, 1)); playClick(); }}>
                {m} (α = {(alphas[m] * 1e6).toFixed(0)}×10⁻⁶)
              </Button>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">L₀: {initialLength.toFixed(1)} m</label>
            <Slider value={[initialLength]} onValueChange={v => setInitialLength(v[0])} min={0.5} max={3} step={0.1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">T: {temperature}°C</label>
            <Slider value={[temperature]} onValueChange={v => setTemperature(v[0])} min={20} max={500} step={5} />
          </div>
          <Button size="sm" className="w-full" variant={heating ? "destructive" : "default"}
            onClick={() => { setHeating(!heating); setStep(Math.max(step, 2)); playClick(); }}>
            {heating ? "🔥 Stop Heating" : "🔥 Heat"}
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <MetalRod3D length={finalLength} temperature={temperature} material={material} />
          <BunsenBurner3D on={heating} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Material</span><span className="capitalize">{material}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">α</span><span>{(alpha * 1e6).toFixed(0)}×10⁻⁶ /°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">L₀</span><span>{initialLength.toFixed(2)} m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">T</span><span>{temperature}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ΔT</span><span>{deltaT}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ΔL</span><span className="text-primary font-bold">{(deltaL * 1000).toFixed(4)} mm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">L_final</span><span>{finalLength.toFixed(6)} m</span></div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════
// 14. TEMPERATURE MEASUREMENT — 3D
// ═══════════════════════════════════════════════════

function Thermometer3D({ temperature }: { temperature: number }) {
  const bulbFill = Math.min(1, Math.max(0, (temperature + 10) / 120));

  return (
    <group position={[0.5, -0.1, 0]}>
      {/* Glass tube */}
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 12, 1, true]} />
        <meshPhysicalMaterial color="#cceeff" transparent opacity={0.3} roughness={0.05} transmission={0.8} />
      </mesh>
      {/* Mercury/alcohol column */}
      <mesh position={[0, -0.25 + bulbFill * 0.25, 0]}>
        <cylinderGeometry args={[0.01, 0.01, bulbFill * 0.5, 12]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      {/* Bulb */}
      <mesh position={[0, -0.27, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      {/* Scale markings */}
      {Array.from({ length: 11 }, (_, i) => (
        <group key={i}>
          <mesh position={[0.02, -0.2 + i * 0.04, 0]}>
            <boxGeometry args={[0.01, 0.001, 0.001]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <Text position={[0.04, -0.2 + i * 0.04, 0]} fontSize={0.015} color="#333" anchorX="left">
            {(i * 10).toString()}
          </Text>
        </group>
      ))}
      {/* Reading */}
      <Text position={[0, 0.3, 0]} fontSize={0.04} color="#e74c3c" anchorX="center">
        {temperature.toFixed(1)}°C
      </Text>
    </group>
  );
}

function WaterContainer3D({ temperature }: { temperature: number }) {
  const col = temperature < 30 ? "#4488ff" : temperature < 60 ? "#88aa44" : temperature < 80 ? "#cc8800" : "#cc3300";

  return (
    <group position={[-0.3, -0.35, 0]}>
      {/* Container */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.18, 0.3, 32, 1, true]} />
        <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} roughness={0.05} transmission={0.8} />
      </mesh>
      {/* Water */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.19, 0.17, 0.25, 32]} />
        <meshStandardMaterial color={col} transparent opacity={0.6} />
      </mesh>
      {/* Steam particles when hot */}
      {temperature > 80 && Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 0.15, 0.15 + Math.random() * 0.15, (Math.random() - 0.5) * 0.15]}>
          <sphereGeometry args={[0.01 + Math.random() * 0.01, 6, 6]} />
          <meshStandardMaterial color="#fff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function TemperatureMeasurement3D() {
  const [sample, setSample] = useState<"cold" | "room" | "warm" | "hot">("room");
  const [step, setStep] = useState(0);
  const [measuring, setMeasuring] = useState(false);
  const [displayTemp, setDisplayTemp] = useState(25);
  const { playClick } = useSoundEffects();

  const sampleTemps: Record<string, number> = { cold: 5, room: 25, warm: 50, hot: 90 };
  const targetTemp = sampleTemps[sample];

  useEffect(() => {
    if (!measuring) return;
    const id = setInterval(() => {
      setDisplayTemp(prev => {
        const diff = targetTemp - prev;
        if (Math.abs(diff) < 0.2) { setMeasuring(false); return targetTemp; }
        return prev + diff * 0.05;
      });
    }, 50);
    return () => clearInterval(id);
  }, [measuring, targetTemp]);

  const startMeasure = () => {
    setMeasuring(true);
    setStep(Math.max(step, 2));
    playClick();
  };

  const reset = () => { setSample("room"); setDisplayTemp(25); setMeasuring(false); setStep(0); };

  const steps = ["Select a water sample", "Insert thermometer (press Measure)", "Wait for reading to stabilize", "Record the temperature", "Compare different samples"];

  return (
    <Simulation3DLayout
      title="3D Lab: Temperature Measurement"
      objective="Measure water temperature using a virtual thermometer"
      theory="Temperature measures average kinetic energy. Celsius: 0°C (freezing), 100°C (boiling)."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <span className="text-xs text-muted-foreground font-semibold">Water Sample</span>
          {(["cold", "room", "warm", "hot"] as const).map(s => (
            <Button key={s} variant={sample === s ? "default" : "outline"} size="sm" className="w-full capitalize text-xs"
              onClick={() => { setSample(s); setStep(Math.max(step, 1)); playClick(); }}>
              {s} (~{sampleTemps[s]}°C)
            </Button>
          ))}
          <Button size="sm" className="w-full" variant="default" onClick={startMeasure} disabled={measuring}>
            🌡️ Measure
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <WaterContainer3D temperature={displayTemp} />
          <Thermometer3D temperature={displayTemp} />
        </>
      }
      liveData={
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">Sample</span><span className="capitalize">{sample}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Target</span><span>{targetTemp}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Reading</span><span className="text-primary font-bold">{displayTemp.toFixed(1)}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
            <span className={measuring ? "text-yellow-400" : "text-green-400"}>{measuring ? "Stabilizing..." : "Ready"}</span>
          </div>
          <div className="mt-2 p-1.5 rounded bg-muted text-[10px]">
            Fahrenheit: {(displayTemp * 9 / 5 + 32).toFixed(1)}°F<br />
            Kelvin: {(displayTemp + 273.15).toFixed(1)} K
          </div>
        </div>
      }
    />
  );
}
