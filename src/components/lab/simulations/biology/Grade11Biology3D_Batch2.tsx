import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ======================================================================
   LAB 5 — PHOTOSYNTHESIS 3D
   ====================================================================== */
function Bubble3D({ startY, speed }: { startY: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y += speed * 0.005;
      if (ref.current.position.y > 1.2) ref.current.position.y = startY;
    }
  });
  return (
    <mesh ref={ref} position={[(Math.random() - 0.5) * 0.1, startY, (Math.random() - 0.5) * 0.1]}>
      <sphereGeometry args={[0.015, 6, 4]} />
      <meshStandardMaterial color="#93c5fd" transparent opacity={0.6} />
    </mesh>
  );
}

export function Photosynthesis3D() {
  const [light, setLight] = useState(50);
  const [co2, setCo2] = useState(50);
  const [temp, setTemp] = useState(25);
  const [step, setStep] = useState(0);

  const tempOk = temp > 10 && temp < 40;
  const limitingFactor = Math.min(light, co2, tempOk ? 100 : 20);
  const bubbleRate = limitingFactor * 0.6;
  const bubbleCount = Math.min(12, Math.floor(bubbleRate / 5));

  const reset = () => { setLight(50); setCo2(50); setTemp(25); setStep(0); };
  const steps = [
    "Place aquatic plant in beaker", "Position light source",
    "Turn on light", "Observe O₂ bubbles", "Count bubbles/min",
    "Record results", "Increase light", "Repeat measurement",
    "Record", "Change CO₂", "Observe effect", "Record", "Plot graph",
  ];

  return (
    <Simulation3DLayout
      title="Lab 5: Photosynthesis (3D)"
      objective="Investigate factors affecting photosynthesis rate"
      theory="6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Rate limited by light, CO₂, or temperature."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Light: {light}%</p>
            <Slider value={[light]} onValueChange={v => setLight(v[0])} min={0} max={100} step={5} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">CO₂: {co2}%</p>
            <Slider value={[co2]} onValueChange={v => setCo2(v[0])} min={0} max={100} step={5} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Temp: {temp}°C</p>
            <Slider value={[temp]} onValueChange={v => setTemp(v[0])} min={0} max={50} step={1} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Beaker */}
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.25, 0.6, 24, 1, true]} />
            <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} transmission={0.6} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.28, 0.23, 0.4, 24]} />
            <meshStandardMaterial color="#bfdbfe" transparent opacity={0.2} />
          </mesh>
          {/* Aquatic plant (Elodea) */}
          <mesh position={[0, -0.15, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.35, 8]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
          {/* Leaves */}
          {[-0.15, -0.05, 0.05, 0.15].map((y, i) => (
            <mesh key={i} position={[(i % 2 === 0 ? -1 : 1) * 0.08, y, 0]} rotation={[0, 0, (i % 2 === 0 ? 0.5 : -0.5)]}>
              <planeGeometry args={[0.1, 0.03]} />
              <meshStandardMaterial color="#4ade80" side={THREE.DoubleSide} />
            </mesh>
          ))}
          {/* Bubbles */}
          {bubbleRate > 5 && Array.from({ length: bubbleCount }).map((_, i) => (
            <Bubble3D key={i} startY={0.05 + (i * 0.08)} speed={0.5 + Math.random() * 0.5} />
          ))}
          {/* Light source */}
          <mesh position={[-0.8, 0.3, 0]}>
            <sphereGeometry args={[0.12, 12, 8]} />
            <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={light / 200} />
          </mesh>
          <pointLight position={[-0.8, 0.3, 0]} intensity={light / 50} color="#fff8e0" distance={3} />
          <Text position={[0, -0.7, 0.4]} fontSize={0.06} color="#333" anchorX="center" fontWeight="bold">
            Bubbles: {bubbleRate.toFixed(0)}/min
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">O₂ Bubbles</span><span className="font-bold">{bubbleRate.toFixed(0)}/min</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Limiting</span><span className="font-bold">{light <= co2 && light <= (tempOk ? 100 : 20) ? "Light" : co2 <= light ? "CO₂" : "Temp"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Light</span><span className="font-bold">{light}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">CO₂</span><span className="font-bold">{co2}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span className="font-bold">{temp}°C</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 6 — RESPIRATION 3D
   ====================================================================== */
export function Respiration3D() {
  const [mode, setMode] = useState<"yeast" | "human">("yeast");
  const [oxygenPresent, setOxygenPresent] = useState(true);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setTime(t => t + 1), 200);
    return () => clearInterval(iv);
  }, [running]);

  const co2Rate = mode === "yeast" ? (oxygenPresent ? 30 : 15) : (oxygenPresent ? 25 : 5);
  const limewaterMilky = time > 10;
  const balloonSize = mode === "yeast" && !oxygenPresent ? Math.min(0.3, time * 0.01) : 0;

  const reset = () => { setMode("yeast"); setOxygenPresent(true); setRunning(false); setTime(0); setStep(0); };
  const steps = [
    "Place yeast+sugar in flask", "Connect delivery tube",
    "Insert into limewater", "Start experiment",
    "Observe limewater", "Record milky change",
    "Repeat with O₂", "Compare aerobic/anaerobic",
  ];

  return (
    <Simulation3DLayout
      title="Lab 6: Respiration (3D)"
      objective="Detect CO₂ produced during respiration"
      theory="Aerobic: glucose + O₂ → CO₂ + H₂O. Anaerobic (yeast): glucose → ethanol + CO₂."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Model</p>
            {(["yeast", "human"] as const).map(m => (
              <label key={m} className="flex items-center gap-2 text-xs capitalize">
                <input type="radio" checked={mode === m} onChange={() => setMode(m)} className="accent-primary" /> {m}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={oxygenPresent} onChange={e => setOxygenPresent(e.target.checked)} className="accent-primary" /> Oxygen Present
          </label>
          <Button size="sm" className="w-full text-xs" onClick={() => { setRunning(!running); if (!running) setTime(0); }}>
            {running ? "⏸ Stop" : "▶ Start"}
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Flask */}
          <group position={[-0.5, -0.3, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.2, 16, 12]} />
              <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.2} transmission={0.6} />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.06, 0.15, 12]} />
              <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.2} />
            </mesh>
            <mesh position={[0, -0.05, 0]}>
              <sphereGeometry args={[0.15, 12, 8]} />
              <meshStandardMaterial color="#eab308" transparent opacity={0.3} />
            </mesh>
            <Text position={[0, -0.35, 0.15]} fontSize={0.05} color="#666" anchorX="center">
              {mode === "yeast" ? "Yeast+Sugar" : "Model"}
            </Text>
            {/* Balloon for anaerobic */}
            {balloonSize > 0 && (
              <mesh position={[0, 0.35 + balloonSize / 2, 0]}>
                <sphereGeometry args={[balloonSize, 12, 8]} />
                <meshStandardMaterial color="#f97316" transparent opacity={0.4} />
              </mesh>
            )}
          </group>
          {/* Delivery tube */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, 0.6, 6]} />
            <meshStandardMaterial color="#888" />
          </mesh>
          {/* Limewater tube */}
          <group position={[0.5, -0.3, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.06, 0.05, 0.4, 16, 1, true]} />
              <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.2} transmission={0.6} />
            </mesh>
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.055, 0.045, 0.25, 16]} />
              <meshStandardMaterial color={limewaterMilky ? "#e5e7eb" : "#f0fdf4"} transparent opacity={0.6} />
            </mesh>
            <Text position={[0, -0.35, 0.1]} fontSize={0.05} color="#666" anchorX="center">
              {limewaterMilky ? "Milky ✅" : "Clear"}
            </Text>
          </group>
          {/* CO2 bubbles in limewater */}
          {running && Array.from({ length: 3 }).map((_, i) => (
            <Bubble3D key={i} startY={-0.35} speed={0.3} />
          ))}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-bold capitalize">{mode}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Oxygen</span><span className="font-bold">{oxygenPresent ? "Present" : "Absent"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">CO₂ Rate</span><span className="font-bold">{co2Rate} ml/min</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Limewater</span><span className="font-bold">{limewaterMilky ? "Milky" : "Clear"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-bold">{oxygenPresent ? "Aerobic" : "Anaerobic"}</span></div>
        </div>
      }
    />
  );
}

function Bubble3D_inner({ startY, speed }: { startY: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => { if (ref.current) { ref.current.position.y += speed * 0.003; if (ref.current.position.y > 0.5) ref.current.position.y = startY; } });
  return <mesh ref={ref} position={[(Math.random() - 0.5) * 0.05, startY, 0]}><sphereGeometry args={[0.008, 6, 4]} /><meshStandardMaterial color="#94a3b8" transparent opacity={0.5} /></mesh>;
}

/* ======================================================================
   LAB 7 — PLANT TISSUES 3D
   ====================================================================== */
export function PlantTissues3D() {
  const [tissue, setTissue] = useState("epidermis");
  const [zoom, setZoom] = useState(10);
  const [showLabels, setShowLabels] = useState(false);
  const [step, setStep] = useState(0);

  const tissues: Record<string, { desc: string; color: string; cells: string }> = {
    epidermis: { desc: "Outer protective layer", color: "#22c55e", cells: "Flat, tightly packed" },
    cortex: { desc: "Storage tissue", color: "#86efac", cells: "Large, round" },
    xylem: { desc: "Transports water upward", color: "#ef4444", cells: "Thick-walled tubes" },
    phloem: { desc: "Transports sugars", color: "#f97316", cells: "Sieve tubes" },
  };

  const reset = () => { setTissue("epidermis"); setZoom(10); setShowLabels(false); setStep(0); };
  const steps = [
    "Open microscope viewer", "Select stem cross-section",
    "Observe under low mag", "Increase magnification",
    "Identify epidermis", "Identify cortex", "Identify xylem",
    "Identify phloem", "Label each tissue", "Record observations",
  ];

  return (
    <Simulation3DLayout
      title="Lab 7: Plant Tissues (3D)"
      objective="Observe and identify plant tissues in a stem cross-section"
      theory="Stem contains epidermis, cortex, xylem, and phloem tissues."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Tissue</p>
            {Object.keys(tissues).map(t => (
              <label key={t} className="flex items-center gap-2 text-xs capitalize">
                <input type="radio" checked={tissue === t} onChange={() => setTissue(t)} className="accent-primary" /> {t}
              </label>
            ))}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Zoom: {zoom}×</p>
            <Slider value={[zoom]} onValueChange={v => setZoom(v[0])} min={4} max={40} step={4} />
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowLabels(!showLabels)}>
            {showLabels ? "Hide" : "Show"} Labels
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Stem cross-section as 3D rings */}
          <group position={[0, 0, 0]} rotation={[0.3, 0, 0]}>
            {/* Epidermis */}
            <mesh>
              <torusGeometry args={[0.6, 0.03, 8, 32]} />
              <meshStandardMaterial color="#22c55e" transparent opacity={tissue === "epidermis" ? 0.9 : 0.3} />
            </mesh>
            {showLabels && <Text position={[0, 0.7, 0]} fontSize={0.06} color="#22c55e" anchorX="center">Epidermis</Text>}
            {/* Cortex */}
            <mesh>
              <torusGeometry args={[0.45, 0.08, 8, 32]} />
              <meshStandardMaterial color="#86efac" transparent opacity={tissue === "cortex" ? 0.6 : 0.15} />
            </mesh>
            {showLabels && <Text position={[0, 0.55, 0]} fontSize={0.05} color="#86efac" anchorX="center">Cortex</Text>}
            {/* Vascular bundles */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const x = Math.cos(angle) * 0.3;
              const y = Math.sin(angle) * 0.3;
              return (
                <group key={i} position={[x, y, 0]}>
                  {/* Xylem */}
                  <mesh>
                    <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
                    <meshStandardMaterial color="#ef4444" transparent opacity={tissue === "xylem" ? 0.8 : 0.2} />
                  </mesh>
                  {/* Phloem */}
                  <mesh position={[0.06, 0, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.05, 8]} />
                    <meshStandardMaterial color="#f97316" transparent opacity={tissue === "phloem" ? 0.8 : 0.2} />
                  </mesh>
                </group>
              );
            })}
            {showLabels && tissue === "xylem" && <Text position={[0.35, 0, 0.1]} fontSize={0.05} color="#ef4444" anchorX="left">Xylem</Text>}
            {showLabels && tissue === "phloem" && <Text position={[0.4, 0, 0.1]} fontSize={0.05} color="#f97316" anchorX="left">Phloem</Text>}
          </group>
          <Text position={[0, -0.7, 0.5]} fontSize={0.06} color="#666" anchorX="center">
            {tissue}: {tissues[tissue].desc}
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Tissue</span><span className="font-bold capitalize">{tissue}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Description</span><span className="font-bold text-[10px]">{tissues[tissue].desc}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Cells</span><span className="font-bold text-[10px]">{tissues[tissue].cells}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 8 — TRANSPIRATION 3D
   ====================================================================== */
export function Transpiration3D() {
  const [temp, setTemp] = useState(25);
  const [wind, setWind] = useState(50);
  const [humidity, setHumidity] = useState(50);
  const [lightIntensity, setLightIntensity] = useState(50);
  const [step, setStep] = useState(0);

  const tempFactor = Math.min(1, temp / 40);
  const windFactor = wind / 100;
  const humidityFactor = 1 - humidity / 100;
  const lightFactor = lightIntensity / 100;
  const transpRate = (tempFactor * 0.3 + windFactor * 0.25 + humidityFactor * 0.25 + lightFactor * 0.2) * 100;

  const reset = () => { setTemp(25); setWind(50); setHumidity(50); setLightIntensity(50); setStep(0); };
  const steps = [
    "Open transpiration simulation", "Set conditions", "Set temperature",
    "Set wind speed", "Set humidity", "Start experiment",
    "Observe water loss rate", "Record results", "Change one factor", "Repeat", "Compare",
  ];

  const vaporCount = Math.min(10, Math.floor(transpRate / 10));

  return (
    <Simulation3DLayout
      title="Lab 8: Transpiration (3D)"
      objective="Investigate factors affecting transpiration rate"
      theory="Transpiration is water loss from leaves through stomata. Rate depends on temperature, wind, humidity, and light."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Temp: {temp}°C</p>
            <Slider value={[temp]} onValueChange={v => setTemp(v[0])} min={0} max={50} step={1} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Wind: {wind}%</p>
            <Slider value={[wind]} onValueChange={v => setWind(v[0])} min={0} max={100} step={5} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Humidity: {humidity}%</p>
            <Slider value={[humidity]} onValueChange={v => setHumidity(v[0])} min={0} max={100} step={5} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Light: {lightIntensity}%</p>
            <Slider value={[lightIntensity]} onValueChange={v => setLightIntensity(v[0])} min={0} max={100} step={5} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Stem */}
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.8, 8]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
          {/* Leaves */}
          {[[-0.2, 0.3, -0.4], [0.2, 0.3, 0.4], [0, 0.4, 0]].map(([x, y, rot], i) => (
            <mesh key={i} position={[x, y, 0]} rotation={[0, 0, rot]} castShadow>
              <planeGeometry args={[0.3, 0.15]} />
              <meshStandardMaterial color="#22c55e" side={THREE.DoubleSide} />
            </mesh>
          ))}
          {/* Stomata */}
          {transpRate > 30 && (
            <>
              <mesh position={[-0.1, 0.28, 0.01]}>
                <torusGeometry args={[0.015, 0.004, 4, 12]} />
                <meshStandardMaterial color="#16a34a" />
              </mesh>
              <mesh position={[0.1, 0.28, 0.01]}>
                <torusGeometry args={[0.015, 0.004, 4, 12]} />
                <meshStandardMaterial color="#16a34a" />
              </mesh>
            </>
          )}
          {/* Water vapor particles */}
          {Array.from({ length: vaporCount }).map((_, i) => (
            <VaporParticle key={i} baseY={0.4 + i * 0.05} />
          ))}
          {/* Pot */}
          <mesh position={[0, -0.55, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.12, 0.15, 12]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
          <Text position={[0, -0.8, 0.3]} fontSize={0.07} color="#333" anchorX="center" fontWeight="bold">
            Water Loss: {transpRate.toFixed(0)}%
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span className="font-bold">{transpRate.toFixed(1)}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Stomata</span><span className="font-bold">{transpRate > 30 ? "Open" : "Closed"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span className="font-bold">{temp}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Wind</span><span className="font-bold">{wind}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Humidity</span><span className="font-bold">{humidity}%</span></div>
        </div>
      }
    />
  );
}

function VaporParticle({ baseY }: { baseY: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const x = useRef((Math.random() - 0.5) * 0.3);
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y += 0.003;
      ref.current.material = ref.current.material as THREE.MeshStandardMaterial;
      (ref.current.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 0.5 - (ref.current.position.y - baseY) * 0.5);
      if (ref.current.position.y > baseY + 1) ref.current.position.y = baseY;
    }
  });
  return (
    <mesh ref={ref} position={[x.current, baseY, (Math.random() - 0.5) * 0.1]}>
      <sphereGeometry args={[0.01, 6, 4]} />
      <meshStandardMaterial color="#93c5fd" transparent opacity={0.5} />
    </mesh>
  );
}
