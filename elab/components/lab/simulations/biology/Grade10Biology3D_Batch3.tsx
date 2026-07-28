import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ======================================================================
   LAB 13 — WATER TRANSPORT (DYE) 3D
   ====================================================================== */
export function WaterTransportDye3D() {
  const [step, setStep] = useState(0);
  const [time, setTime] = useState(0);

  const dyeHeight = Math.min(1.2, time * 0.08);
  const reset = () => { setStep(0); setTime(0); };

  const steps = [
    "Place celery in red dye", "Observe for several hours",
    "Cut cross-section of stem", "Identify colored xylem",
    "Record observations", "Explain transpiration pull",
  ];

  return (
    <Simulation3DLayout
      title="Lab: Water Transport Using Dye (3D)"
      objective="Observe water transport through xylem vessels"
      theory="Xylem transports water from roots to leaves via transpiration pull. Colored dye makes the path visible."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Time: {time} hrs</p>
            <Slider value={[time]} onValueChange={v => { setTime(v[0]); if (step < 2) setStep(2); }} min={0} max={24} step={1} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Beaker with dye */}
          <mesh position={[0, -0.6, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.22, 0.4, 24, 1, true]} />
            <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} transmission={0.6} />
          </mesh>
          <mesh position={[0, -0.55, 0]}>
            <cylinderGeometry args={[0.23, 0.2, 0.25, 24]} />
            <meshStandardMaterial color="#ef4444" transparent opacity={0.4} />
          </mesh>
          {/* Celery stem */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 12]} />
            <meshStandardMaterial color="#86efac" />
          </mesh>
          {/* Dye rising in stem */}
          <mesh position={[0, -0.4 + dyeHeight / 2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, dyeHeight, 8]} />
            <meshStandardMaterial color="#ef4444" transparent opacity={0.6} />
          </mesh>
          {/* Leaves */}
          <mesh position={[-0.15, 0.7, 0]} rotation={[0, 0, 0.4]} castShadow>
            <planeGeometry args={[0.25, 0.1]} />
            <meshStandardMaterial color="#22c55e" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.15, 0.7, 0]} rotation={[0, 0, -0.4]} castShadow>
            <planeGeometry args={[0.25, 0.1]} />
            <meshStandardMaterial color="#22c55e" side={THREE.DoubleSide} />
          </mesh>
          <Text position={[0, -0.9, 0.3]} fontSize={0.06} color="#666" anchorX="center">
            Dye height: {(dyeHeight * 100).toFixed(0)}mm
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-bold">{time} hrs</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Dye Height</span><span className="font-bold">{(dyeHeight * 100).toFixed(0)} mm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Xylem</span><span className="font-bold">{dyeHeight > 0.4 ? "Visible (red)" : "Not yet"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 14 — FLOWER DISSECTION 3D
   ====================================================================== */
export function FlowerDissection3D() {
  const [step, setStep] = useState(0);
  const [layer, setLayer] = useState(0);
  const parts = ["Complete Flower", "Remove Sepals", "Remove Petals", "Remove Stamens", "Pistil Only"];

  const reset = () => { setStep(0); setLayer(0); };
  const steps = [
    "Obtain a fresh flower", "Observe external parts",
    "Remove petals carefully", "Identify sepals, stamens, pistil",
    "Examine anther and stigma", "Draw and label parts",
  ];

  return (
    <Simulation3DLayout
      title="Lab: Virtual Flower Dissection (3D)"
      objective="Dissect a flower and identify its reproductive parts"
      theory="Sepals→Petals→Stamens (male)→Pistil (female: stigma, style, ovary)"
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Layer: {parts[layer]}</p>
            <Slider value={[layer]} onValueChange={v => { setLayer(v[0]); setStep(Math.min(v[0] + 1, 5)); }} min={0} max={4} step={1} />
          </div>
          <div className="text-xs text-muted-foreground">
            {layer === 0 && "All parts visible"}
            {layer === 1 && "Sepals removed — exposing petals"}
            {layer === 2 && "Petals removed — stamens visible"}
            {layer === 3 && "Stamens removed — pistil exposed"}
            {layer === 4 && "Only pistil remains (stigma, style, ovary)"}
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Sepals */}
          {layer < 1 && [0, 1, 2, 3, 4].map(i => {
            const angle = (i / 5) * Math.PI * 2;
            return (
              <mesh key={`s${i}`} position={[Math.cos(angle) * 0.35, -0.1, Math.sin(angle) * 0.35]} rotation={[0.5, angle, 0]} castShadow>
                <planeGeometry args={[0.15, 0.08]} />
                <meshStandardMaterial color="#22c55e" side={THREE.DoubleSide} />
              </mesh>
            );
          })}
          {/* Petals */}
          {layer < 2 && [0, 1, 2, 3, 4].map(i => {
            const angle = (i / 5) * Math.PI * 2 + 0.3;
            return (
              <mesh key={`p${i}`} position={[Math.cos(angle) * 0.25, 0.05, Math.sin(angle) * 0.25]} rotation={[0.4, angle, 0]} castShadow>
                <planeGeometry args={[0.18, 0.1]} />
                <meshStandardMaterial color="#ec4899" side={THREE.DoubleSide} transparent opacity={0.8} />
              </mesh>
            );
          })}
          {/* Stamens */}
          {layer < 3 && [0, 1, 2, 3].map(i => {
            const angle = (i / 4) * Math.PI * 2;
            return (
              <group key={`st${i}`}>
                <mesh position={[Math.cos(angle) * 0.1, 0.15, Math.sin(angle) * 0.1]} castShadow>
                  <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
                  <meshStandardMaterial color="#fbbf24" />
                </mesh>
                <mesh position={[Math.cos(angle) * 0.1, 0.28, Math.sin(angle) * 0.1]} castShadow>
                  <sphereGeometry args={[0.025, 8, 6]} />
                  <meshStandardMaterial color="#eab308" />
                </mesh>
              </group>
            );
          })}
          {/* Pistil - always visible */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
          {/* Stigma */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <sphereGeometry args={[0.03, 8, 6]} />
            <meshStandardMaterial color="#15803d" />
          </mesh>
          {/* Ovary */}
          <mesh position={[0, -0.05, 0]} castShadow>
            <sphereGeometry args={[0.06, 12, 8]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
          <Text position={[0, -0.4, 0.5]} fontSize={0.07} color="#333" anchorX="center" fontWeight="bold">{parts[layer]}</Text>
          {/* Labels for visible parts */}
          {layer >= 2 && (
            <>
              <Text position={[0.2, 0.25, 0.1]} fontSize={0.04} color="#15803d" anchorX="left">← Stigma</Text>
              <Text position={[0.15, 0.1, 0.1]} fontSize={0.04} color="#16a34a" anchorX="left">← Style</Text>
              <Text position={[0.15, -0.05, 0.1]} fontSize={0.04} color="#166534" anchorX="left">← Ovary</Text>
            </>
          )}
          {layer < 3 && layer >= 1 && (
            <Text position={[0.2, 0.28, 0.1]} fontSize={0.04} color="#eab308" anchorX="left">← Anther</Text>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Layer</span><span className="font-bold">{parts[layer]}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Visible</span><span className="font-bold">{layer === 0 ? "All" : layer === 4 ? "Pistil only" : `${4 - layer} left`}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 15 — IDENTIFYING BONES 3D
   ====================================================================== */
const BONES = [
  { name: "Skull", pos: [0, 1.4, 0] as [number, number, number], desc: "Protects the brain", size: 0.15 },
  { name: "Clavicle", pos: [-0.15, 1.1, 0] as [number, number, number], desc: "Connects arm to body", size: 0.08 },
  { name: "Ribs", pos: [0, 0.9, 0] as [number, number, number], desc: "Protect heart and lungs", size: 0.12 },
  { name: "Spine", pos: [0, 0.7, 0] as [number, number, number], desc: "Supports body, protects spinal cord", size: 0.06 },
  { name: "Pelvis", pos: [0, 0.4, 0] as [number, number, number], desc: "Supports organs, connects legs", size: 0.12 },
  { name: "Femur", pos: [-0.08, 0.1, 0] as [number, number, number], desc: "Longest & strongest bone", size: 0.06 },
];

export function IdentifyingBones3D() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const reset = () => { setStep(0); setSelected(null); };
  const steps = [
    "Open skeleton model", "Rotate the skeleton",
    "Click individual bones", "Identify their names", "Match to functions",
  ];

  return (
    <Simulation3DLayout
      title="Lab: Identifying Bones (3D)"
      objective="Identify major bones and their functions"
      theory="The human skeleton has 206 bones providing support, protection, and movement."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Click bones on 3D skeleton:</p>
          {BONES.map(b => (
            <button key={b.name} onClick={() => { setSelected(b.name); if (step < 3) setStep(3); }}
              className={`block w-full text-left text-[10px] p-1.5 rounded border ${selected === b.name ? "bg-primary/10 border-primary font-bold" : "border-border hover:border-primary"}`}>
              {b.name}
            </button>
          ))}
          {selected && (
            <div className="p-2 rounded bg-primary/10 border border-primary text-xs">
              <p className="font-bold">{selected}</p>
              <p className="text-muted-foreground">{BONES.find(b => b.name === selected)?.desc}</p>
            </div>
          )}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Skeleton wireframe */}
          <group position={[0, -0.9, 0]}>
            {/* Skull */}
            <mesh position={[0, 1.4, 0]} castShadow>
              <sphereGeometry args={[0.12, 12, 8]} />
              <meshStandardMaterial color="#f5f0e8" />
            </mesh>
            {/* Spine */}
            <mesh position={[0, 0.85, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.03, 0.9, 8]} />
              <meshStandardMaterial color="#ebe5d8" />
            </mesh>
            {/* Clavicles */}
            <mesh position={[0, 1.15, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
              <meshStandardMaterial color="#e8e0d0" />
            </mesh>
            {/* Ribs */}
            <mesh position={[0, 0.9, 0]} castShadow>
              <torusGeometry args={[0.15, 0.02, 6, 12, Math.PI]} />
              <meshStandardMaterial color="#ebe5d8" />
            </mesh>
            {/* Pelvis */}
            <mesh position={[0, 0.4, 0]} castShadow>
              <torusGeometry args={[0.12, 0.025, 6, 12, Math.PI]} />
              <meshStandardMaterial color="#e0d8c8" />
            </mesh>
            {/* Femurs */}
            {[-0.08, 0.08].map((x, i) => (
              <mesh key={i} position={[x, 0.15, 0]} castShadow>
                <cylinderGeometry args={[0.025, 0.02, 0.45, 8]} />
                <meshStandardMaterial color="#ebe5d8" />
              </mesh>
            ))}
            {/* Arms */}
            {[-0.28, 0.28].map((x, i) => (
              <mesh key={`a${i}`} position={[x, 0.85, 0]} castShadow>
                <cylinderGeometry args={[0.015, 0.012, 0.55, 6]} />
                <meshStandardMaterial color="#e8e0d0" />
              </mesh>
            ))}
            {/* Highlight selected */}
            {selected && (() => {
              const bone = BONES.find(b => b.name === selected);
              if (!bone) return null;
              return (
                <group position={bone.pos}>
                  <mesh>
                    <sphereGeometry args={[bone.size + 0.03, 12, 8]} />
                    <meshStandardMaterial color="#6366f1" transparent opacity={0.3} />
                  </mesh>
                  <Text position={[0.25, 0, 0]} fontSize={0.06} color="#6366f1" anchorX="left" fontWeight="bold">← {bone.name}</Text>
                </group>
              );
            })()}
          </group>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Selected</span><span className="font-bold">{selected || "None"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Function</span><span className="font-bold text-[10px]">{selected ? (BONES.find(b => b.name === selected)?.desc ?? "") : "—"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 16 — MEASURING PULSE RATE 3D
   ====================================================================== */
export function MeasuringPulseRate3D() {
  const [step, setStep] = useState(0);
  const [restRate, setRestRate] = useState(72);
  const [exercising, setExercising] = useState(false);
  const [exerciseRate, setExerciseRate] = useState<number | null>(null);

  const doExercise = () => {
    setExercising(true); setStep(4);
    setTimeout(() => {
      setExerciseRate(restRate + 30 + Math.floor(Math.random() * 20));
      setExercising(false); setStep(5);
    }, 2000);
  };
  const reset = () => { setStep(0); setRestRate(72); setExerciseRate(null); setExercising(false); };

  const steps = [
    "Place fingers on wrist", "Count pulse for 60 seconds",
    "Record pulse rate", "Perform exercise",
    "Measure pulse again", "Compare results",
  ];

  // Heart animation
  const heartRef = useRef<THREE.Mesh>(null);
  const currentRate = exerciseRate || restRate;
  useFrame(() => {
    if (heartRef.current) {
      const beat = Math.sin(Date.now() * 0.001 * (currentRate / 30)) * 0.1 + 1;
      heartRef.current.scale.setScalar(beat);
    }
  });

  return (
    <Simulation3DLayout
      title="Lab: Measuring Pulse Rate (3D)"
      objective="Measure pulse rate at rest and after exercise"
      theory="Normal resting heart rate: 60-100 bpm. Exercise increases heart rate for greater O₂ delivery."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Resting Pulse: {restRate} bpm</p>
            <Slider value={[restRate]} onValueChange={v => { setRestRate(v[0]); if (step < 2) setStep(2); }} min={50} max={100} step={1} />
          </div>
          <Button size="sm" variant={exerciseRate ? "default" : "outline"} className="w-full text-xs"
            onClick={doExercise} disabled={exercising}>
            {exercising ? "🏃 Exercising..." : exerciseRate ? "✓ Done" : "🏃 Exercise"}
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Heart */}
          <mesh ref={heartRef} position={[0, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <Text position={[0, 0.7, 0]} fontSize={0.12} color="#ef4444" anchorX="center" fontWeight="bold">
            ❤️ {exercising ? "..." : currentRate} bpm
          </Text>
          {/* Comparison bars */}
          <group position={[-0.5, -0.45, 0.5]}>
            <mesh castShadow>
              <boxGeometry args={[0.3, restRate * 0.01, 0.2]} />
              <meshStandardMaterial color="#6366f1" transparent opacity={0.6} />
            </mesh>
            <Text position={[0, restRate * 0.005 + 0.08, 0.15]} fontSize={0.05} color="#6366f1" anchorX="center">{restRate}</Text>
            <Text position={[0, -0.08, 0.15]} fontSize={0.04} color="#666" anchorX="center">Rest</Text>
          </group>
          {exerciseRate && (
            <group position={[0.5, -0.45, 0.5]}>
              <mesh castShadow>
                <boxGeometry args={[0.3, exerciseRate * 0.01, 0.2]} />
                <meshStandardMaterial color="#ef4444" transparent opacity={0.6} />
              </mesh>
              <Text position={[0, exerciseRate * 0.005 + 0.08, 0.15]} fontSize={0.05} color="#ef4444" anchorX="center">{exerciseRate}</Text>
              <Text position={[0, -0.08, 0.15]} fontSize={0.04} color="#666" anchorX="center">Exercise</Text>
            </group>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Resting</span><span className="font-bold">{restRate} bpm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">After Exercise</span><span className="font-bold">{exerciseRate ?? "—"}{exerciseRate ? " bpm" : ""}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Increase</span><span className="font-bold">{exerciseRate ? `+${exerciseRate - restRate}` : "—"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 17 — REFLEX ACTION 3D
   ====================================================================== */
export function ReflexActionDemo3D() {
  const [step, setStep] = useState(0);
  const [tapped, setTapped] = useState(false);
  const [signal, setSignal] = useState(0);

  const pathLabels = ["Stimulus", "Receptor", "Sensory Neuron", "Spinal Cord", "Motor Neuron", "Muscle (kick)"];

  const tap = () => {
    setTapped(true); setStep(2); setSignal(0);
    const iv = setInterval(() => {
      setSignal(prev => { if (prev >= 5) { clearInterval(iv); return 5; } return prev + 1; });
    }, 400);
  };
  const reset = () => { setStep(0); setTapped(false); setSignal(0); };

  const steps = [
    "Sit with legs hanging", "Tap knee with hammer",
    "Observe leg movement", "Record the reaction", "Explain reflex action",
  ];

  const legAngle = tapped && signal >= 5 ? -0.5 : 0;

  return (
    <Simulation3DLayout
      title="Lab: Reflex Action (3D)"
      objective="Demonstrate and explain the knee-jerk reflex"
      theory="Reflex arc: stimulus → receptor → sensory neuron → spinal cord → motor neuron → effector."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          <Button size="sm" variant={tapped ? "default" : "outline"} className="w-full text-xs"
            onClick={tap} disabled={tapped}>
            {tapped ? "✓ Tapped" : "🔨 Tap Knee"}
          </Button>
          {tapped && (
            <div className="space-y-1 mt-2">
              {pathLabels.map((label, i) => (
                <div key={i} className={`text-[10px] p-1 rounded ${i <= signal ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground"}`}>
                  {i <= signal ? "⚡" : "○"} {label}
                </div>
              ))}
            </div>
          )}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Upper leg */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.6, 12]} />
            <meshStandardMaterial color="#d4a574" />
          </mesh>
          {/* Knee joint */}
          <mesh position={[0, -0.35, 0]} castShadow>
            <sphereGeometry args={[0.07, 12, 8]} />
            <meshStandardMaterial color="#c9956a" />
          </mesh>
          {/* Lower leg - kicks */}
          <group position={[0, -0.35, 0]} rotation={[legAngle, 0, 0]}>
            <mesh position={[0, -0.35, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.04, 0.6, 12]} />
              <meshStandardMaterial color="#d4a574" />
            </mesh>
            {/* Foot */}
            <mesh position={[0, -0.7, 0.06]} castShadow>
              <boxGeometry args={[0.08, 0.04, 0.15]} />
              <meshStandardMaterial color="#c9956a" />
            </mesh>
          </group>
          {/* Reflex hammer */}
          {!tapped && (
            <group position={[0.3, -0.3, 0.15]} rotation={[0, 0, -0.3]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.01, 0.01, 0.25, 6]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 0.15, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.06, 8]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
            </group>
          )}
          {tapped && signal >= 5 && (
            <Text position={[0.5, -0.5, 0]} fontSize={0.1} color="#22c55e" anchorX="center" fontWeight="bold">KICK!</Text>
          )}
          {/* Signal path visualization */}
          {tapped && signal < 5 && (
            <Text position={[0.5, 0.3, 0]} fontSize={0.06} color="#f59e0b" anchorX="center">
              ⚡ Signal: {pathLabels[Math.min(signal, 5)]}
            </Text>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Stimulus</span><span className="font-bold">{tapped ? "Applied" : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Signal</span><span className="font-bold">{tapped ? `${Math.min(signal + 1, 6)}/6` : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Response</span><span className="font-bold">{signal >= 5 ? "Leg kicks ✓" : "Waiting..."}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 18 — QUADRAT SAMPLING 3D
   ====================================================================== */
function RandomPlants3D() {
  // Static random positions for plants
  const plants = useRef(
    Array.from({ length: 25 }, () => ({
      x: (Math.random() - 0.5) * 3,
      z: (Math.random() - 0.5) * 3,
      scale: 0.3 + Math.random() * 0.3,
    }))
  );

  return (
    <group position={[0, -0.45, 0]}>
      {plants.current.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.005, 0.008, 0.1 * p.scale, 4]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
          <mesh position={[0, 0.06 * p.scale, 0]} castShadow>
            <sphereGeometry args={[0.03 * p.scale, 6, 4]} />
            <meshStandardMaterial color="#4ade80" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function QuadratSampling3D() {
  const [step, setStep] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);

  const addSample = () => {
    const count = 3 + Math.floor(Math.random() * 8);
    setSamples(s => [...s, count]);
    if (step < 4 && samples.length >= 1) setStep(4);
    else if (step < 2) setStep(2);
  };
  const avg = samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
  const reset = () => { setStep(0); setSamples([]); };

  const steps = [
    "Place quadrat on ground", "Count plants inside",
    "Record the number", "Move quadrat to another area",
    "Repeat counting", "Calculate average population",
  ];

  return (
    <Simulation3DLayout
      title="Lab: Quadrat Sampling (3D)"
      objective="Estimate plant population using quadrat sampling"
      theory="Average count × total area / quadrat area = estimated population."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={addSample}>
            📐 Sample #{samples.length + 1}
          </Button>
          {samples.map((s, i) => (
            <div key={i} className="text-[10px] flex justify-between p-1 bg-muted rounded">
              <span>Sample {i + 1}</span>
              <span className="font-bold">{s} plants</span>
            </div>
          ))}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Ground */}
          <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[4, 4]} />
            <meshStandardMaterial color="#7cc47c" transparent opacity={0.3} />
          </mesh>
          <RandomPlants3D />
          {/* Quadrat frame */}
          {samples.length > 0 && (
            <group position={[(Math.random() - 0.5) * 0.5, -0.44, (Math.random() - 0.5) * 0.5]}>
              <mesh>
                <boxGeometry args={[0.8, 0.02, 0.8]} />
                <meshStandardMaterial color="#6366f1" transparent opacity={0.15} />
              </mesh>
              <mesh>
                <boxGeometry args={[0.8, 0.02, 0.8]} />
                <meshStandardMaterial color="#6366f1" wireframe />
              </mesh>
            </group>
          )}
          <Text position={[0, 0.8, 0]} fontSize={0.07} color="#333" anchorX="center">
            {samples.length > 0 ? `Avg: ${avg.toFixed(1)} plants — Est: ${Math.round(avg * 100)}/100m²` : "Click to place quadrat"}
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Samples</span><span className="font-bold">{samples.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Average</span><span className="font-bold">{avg > 0 ? avg.toFixed(1) : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Est. Pop.</span><span className="font-bold">{avg > 0 ? `${Math.round(avg * 100)}/100m²` : "—"}</span></div>
        </div>
      }
    />
  );
}
