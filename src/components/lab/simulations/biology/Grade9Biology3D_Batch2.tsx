import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom, Beaker3D } from "../../3d/LabEnvironment";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ======================================================================
   LAB 5 — OSMOSIS EXPERIMENT 3D
   ====================================================================== */
function PotatoStrip({ position, length, label, color }: {
  position: [number, number, number]; length: number; label: string; color: string;
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.08, length * 0.06, 0.08]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      <Text position={[0, -length * 0.035, 0.08]} fontSize={0.05} color="#666" anchorX="center">{length.toFixed(1)} cm</Text>
      <Text position={[0, length * 0.04 + 0.05, 0]} fontSize={0.04} color="#888" anchorX="center">{label}</Text>
    </group>
  );
}

function WaterParticles({ position, count, color }: { position: [number, number, number]; count: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const particles = useRef(
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 0.3,
      y: (Math.random() - 0.5) * 0.2,
      z: (Math.random() - 0.5) * 0.3,
      speed: 0.5 + Math.random() * 1,
    }))
  );

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      const p = particles.current[i];
      child.position.y += Math.sin(Date.now() * 0.003 * p.speed) * delta * 0.1;
    });
  });

  return (
    <group ref={ref} position={position}>
      {particles.current.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.01, 6, 4]} />
          <meshStandardMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export function OsmosisExperiment3D() {
  const [minutes, setMinutes] = useState(0);
  const [step, setStep] = useState(0);

  const stripA = 5 + Math.min(minutes / 60, 1) * 1.2;
  const stripB = 5 - Math.min(minutes / 60, 1) * 0.8;

  const reset = () => { setMinutes(0); setStep(0); };
  const steps = [
    "Cut two equal potato strips", "Measure initial length (5 cm each)",
    "Place Strip A in pure water", "Place Strip B in salt solution",
    "Leave for 30–60 minutes", "Remove the strips",
    "Measure length again", "Explain results using osmosis",
  ];

  return (
    <Simulation3DLayout
      title="Lab 5: Osmosis Experiment (3D)"
      objective="Demonstrate osmosis using potato strips"
      theory="Osmosis: water moves from dilute (hypotonic) to concentrated (hypertonic) solution through a semi-permeable membrane."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Time: {minutes} min</p>
            <Slider value={[minutes]} onValueChange={v => { setMinutes(v[0]); if (v[0] > 0 && step < 4) setStep(4); }} min={0} max={60} step={5} />
          </div>
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setMinutes(Math.min(minutes + 10, 60))}>▶ +10 min</Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Container A - Pure Water */}
          <group position={[-0.8, 0, 0]}>
            <Beaker3D position={[0, -0.2, 0]} liquidColor="#93c5fd" liquidLevel={0.7} scale={1.5} />
            <PotatoStrip position={[0, 0, 0]} length={stripA} label="Strip A" color="#eab308" />
            <Text position={[0, -0.7, 0.4]} fontSize={0.07} color="#3b82f6" anchorX="center" fontWeight="bold">Pure Water</Text>
            <WaterParticles position={[0, -0.15, 0]} count={8} color="#3b82f6" />
            {minutes > 0 && <Text position={[0.3, 0, 0]} fontSize={0.08} color="#3b82f6" anchorX="center">→</Text>}
          </group>
          {/* Container B - Salt Solution */}
          <group position={[0.8, 0, 0]}>
            <Beaker3D position={[0, -0.2, 0]} liquidColor="#fcd34d" liquidLevel={0.7} scale={1.5} />
            <PotatoStrip position={[0, 0, 0]} length={stripB} label="Strip B" color="#eab308" />
            <Text position={[0, -0.7, 0.4]} fontSize={0.07} color="#f59e0b" anchorX="center" fontWeight="bold">Salt Solution</Text>
            <WaterParticles position={[0, -0.15, 0]} count={5} color="#f59e0b" />
            {minutes > 0 && <Text position={[0.3, 0, 0]} fontSize={0.08} color="#ef4444" anchorX="center">←</Text>}
          </group>
          {minutes > 0 && (
            <Text position={[0, -0.9, 0.5]} fontSize={0.06} color="#666" anchorX="center">
              Water moves from low → high solute concentration
            </Text>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-bold">{minutes} min</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Strip A</span><span className="font-bold">{stripA.toFixed(1)} cm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Strip B</span><span className="font-bold">{stripB.toFixed(1)} cm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">A Change</span><span className="font-bold text-green-600">+{(stripA - 5).toFixed(1)} cm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">B Change</span><span className="font-bold text-red-600">{(stripB - 5).toFixed(1)} cm</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 6 — STARCH TEST / IODINE 3D
   ====================================================================== */
function TestPlate3D({ position, food, dropsAdded, resultColor }: {
  position: [number, number, number]; food: string; dropsAdded: number; resultColor: string;
}) {
  return (
    <group position={position}>
      {/* Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.4, 0.42, 0.03, 24]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>
      {/* Food sample */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshStandardMaterial color={food === "oil" ? "#fef08a" : "#d4a574"} />
      </mesh>
      <Text position={[0, 0.2, 0]} fontSize={0.06} color="#333" anchorX="center" fontWeight="bold">{food}</Text>
      {/* Iodine drops */}
      {Array.from({ length: dropsAdded }).map((_, i) => (
        <mesh key={i} position={[(i - 1) * 0.05, 0.06, 0.05]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshStandardMaterial color={resultColor} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function IodineBottle3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.2, 12]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.04, 8]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      <Text position={[0, -0.02, 0.07]} fontSize={0.03} color="#fff" anchorX="center">Iodine</Text>
    </group>
  );
}

export function StarchTestLab3D() {
  const [food, setFood] = useState<"bread" | "potato" | "rice" | "oil">("bread");
  const [dropsAdded, setDropsAdded] = useState(0);
  const [step, setStep] = useState(0);

  const hasStarch: Record<string, boolean> = { bread: true, potato: true, rice: true, oil: false };
  const resultColor = hasStarch[food] && dropsAdded >= 2 ? "#1e2d5f" : "#b8860b";

  const reset = () => { setFood("bread"); setDropsAdded(0); setStep(0); };
  const addDrop = () => { setDropsAdded(Math.min(dropsAdded + 1, 3)); if (step < 2) setStep(2); };

  const steps = [
    "Place food sample on a plate", "Select food to test",
    "Add 2–3 drops of iodine solution", "Observe the color change",
    "If blue-black → starch is present", "Record the result",
  ];

  return (
    <Simulation3DLayout
      title="Lab 6: Testing for Starch (3D)"
      objective="Test the presence of starch in food samples"
      theory="Iodine solution turns blue-black in presence of starch. Iodine molecules fit inside the coiled amylose structure."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Food Sample</p>
            {(["bread", "potato", "rice", "oil"] as const).map(f => (
              <label key={f} className="flex items-center gap-2 text-xs cursor-pointer capitalize">
                <input type="radio" checked={food === f} onChange={() => { setFood(f); setDropsAdded(0); setStep(1); }} className="accent-primary" />
                {f}
              </label>
            ))}
          </div>
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={addDrop} disabled={dropsAdded >= 3}>
            💧 Add Drop ({dropsAdded}/3)
          </Button>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <TestPlate3D position={[0, -0.4, 0]} food={food} dropsAdded={dropsAdded} resultColor={resultColor} />
          <IodineBottle3D position={[0.8, -0.2, 0.3]} />
          {dropsAdded >= 2 && (
            <Text position={[0, 0.5, 0]} fontSize={0.08} color={hasStarch[food] ? "#22c55e" : "#ef4444"} anchorX="center" fontWeight="bold">
              {hasStarch[food] ? "✅ Blue-black → Starch PRESENT" : "❌ Brown → No Starch"}
            </Text>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Food</span><span className="font-bold capitalize">{food}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Drops</span><span className="font-bold">{dropsAdded}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Color</span><span className="font-bold">{dropsAdded >= 2 ? (hasStarch[food] ? "Blue-black" : "Brown") : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Result</span><span className="font-bold">{dropsAdded >= 2 ? (hasStarch[food] ? "Positive" : "Negative") : "Pending"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 7 — PROTEIN TEST / BIURET 3D
   ====================================================================== */
function TestTube3D({ position, color, label, shaking }: {
  position: [number, number, number]; color: string; label: string; shaking: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current && shaking) {
      ref.current.rotation.z = Math.sin(Date.now() * 0.02) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Tube glass */}
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.5, 16, 1, true]} />
        <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.25} transmission={0.7} roughness={0.05} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -0.25, 0]}>
        <sphereGeometry args={[0.05, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.3} />
      </mesh>
      {/* Liquid */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.055, 0.045, 0.35, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      </mesh>
      {/* Label */}
      <Text position={[0, -0.4, 0.08]} fontSize={0.05} color="#666" anchorX="center">{label}</Text>
    </group>
  );
}

export function ProteinTestLab3D() {
  const [food, setFood] = useState<"milk" | "egg" | "bread" | "water">("milk");
  const [reagentAdded, setReagentAdded] = useState(false);
  const [shaken, setShaken] = useState(false);
  const [step, setStep] = useState(0);

  const hasProtein: Record<string, boolean> = { milk: true, egg: true, bread: false, water: false };
  const getColor = () => {
    if (!reagentAdded) return "#93c5fd";
    if (!shaken) return "#93c5fd";
    return hasProtein[food] ? "#7c3aed" : "#93c5fd";
  };

  const reset = () => { setFood("milk"); setReagentAdded(false); setShaken(false); setStep(0); };
  const steps = [
    "Put food sample in test tube", "Add Biuret reagent",
    "Shake gently", "Observe color change", "Purple = protein present",
  ];

  return (
    <Simulation3DLayout
      title="Lab 7: Testing for Protein (3D)"
      objective="Test the presence of protein in food samples"
      theory="Biuret reagent (Cu²⁺ ions) turns purple/violet when peptide bonds in proteins form a complex with the copper ions."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Food Sample</p>
            {(["milk", "egg", "bread", "water"] as const).map(f => (
              <label key={f} className="flex items-center gap-2 text-xs cursor-pointer capitalize">
                <input type="radio" checked={food === f} onChange={() => { setFood(f); setReagentAdded(false); setShaken(false); setStep(0); }} className="accent-primary" />
                {f}
              </label>
            ))}
          </div>
          <div className="border-t border-border pt-2 space-y-2">
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setReagentAdded(true); setStep(1); }} disabled={reagentAdded}>
              🧪 Add Biuret Reagent
            </Button>
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setShaken(true); setStep(3); }} disabled={!reagentAdded || shaken}>
              🫧 Shake Gently
            </Button>
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <TestTube3D position={[0, 0, 0]} color={getColor()} label={food} shaking={shaken && !hasProtein[food] ? false : shaken} />
          {/* Biuret reagent bottle */}
          {!reagentAdded && (
            <group position={[0.6, -0.2, 0.3]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.05, 0.06, 0.2, 12]} />
                <meshStandardMaterial color="#93c5fd" />
              </mesh>
              <Text position={[0, -0.02, 0.07]} fontSize={0.03} color="#1e40af" anchorX="center">Biuret</Text>
            </group>
          )}
          {shaken && (
            <Text position={[0, 0.8, 0]} fontSize={0.08} color={hasProtein[food] ? "#7c3aed" : "#3b82f6"} anchorX="center" fontWeight="bold">
              {hasProtein[food] ? "✅ Purple → Protein PRESENT" : "❌ Blue → No Protein"}
            </Text>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Food</span><span className="font-bold capitalize">{food}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Reagent</span><span className="font-bold">{reagentAdded ? "Added" : "Not added"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Color</span><span className="font-bold">{shaken ? (hasProtein[food] ? "Purple" : "Blue") : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Result</span><span className="font-bold">{shaken ? (hasProtein[food] ? "Positive" : "Negative") : "Pending"}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 8 — FOOD CHAIN BUILDER 3D
   ====================================================================== */
const organisms = [
  { id: "plant", name: "Grass", emoji: "🌿", level: "Producer", color: "#22c55e" },
  { id: "grasshopper", name: "Grasshopper", emoji: "🦗", level: "Primary Consumer", color: "#84cc16" },
  { id: "frog", name: "Frog", emoji: "🐸", level: "Secondary Consumer", color: "#06b6d4" },
  { id: "snake", name: "Snake", emoji: "🐍", level: "Tertiary Consumer", color: "#f59e0b" },
  { id: "hawk", name: "Hawk", emoji: "🦅", level: "Apex Predator", color: "#ef4444" },
];

function OrganismCard3D({ position, org, removed, onClick }: {
  position: [number, number, number]; org: typeof organisms[0]; removed: boolean; onClick?: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.scale.setScalar(removed ? 0.3 : 1);
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.6, 0.08]} />
        <meshStandardMaterial color={removed ? "#fee2e2" : "#fafafa"} />
      </mesh>
      <mesh position={[0, 0, 0.041]}>
        <boxGeometry args={[0.48, 0.58, 0.001]} />
        <meshStandardMaterial color={org.color} transparent opacity={removed ? 0.1 : 0.15} />
      </mesh>
      <Text position={[0, 0.1, 0.05]} fontSize={0.15} anchorX="center">{org.emoji}</Text>
      <Text position={[0, -0.1, 0.05]} fontSize={0.05} color="#333" anchorX="center" fontWeight="bold">{org.name}</Text>
      <Text position={[0, -0.2, 0.05]} fontSize={0.03} color="#888" anchorX="center">{org.level}</Text>
    </group>
  );
}

function Arrow3D({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const len = dir.length();
  const mid = new THREE.Vector3(...from).add(dir.multiplyScalar(0.5));

  return (
    <group position={mid.toArray() as [number, number, number]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, len * 0.6, 8]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      <mesh position={[len * 0.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.04, 0.08, 8]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
    </group>
  );
}

export function FoodChainBuilder3D() {
  const [chain, setChain] = useState<string[]>([]);
  const [removedId, setRemovedId] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const correctOrder = ["plant", "grasshopper", "frog", "snake", "hawk"];
  const isCorrect = chain.length === 5 && chain.every((id, i) => id === correctOrder[i]);

  const addToChain = (id: string) => {
    if (chain.includes(id)) return;
    setChain([...chain, id]);
    if (step < 3) setStep(3);
  };

  const simulateRemoval = (id: string) => {
    setRemovedId(removedId === id ? null : id);
    if (step < 6) setStep(6);
  };

  const reset = () => { setChain([]); setRemovedId(null); setStep(0); };
  const steps = [
    "Observe the organisms", "Identify the producer",
    "Arrange organisms (who eats whom)", "Form a food chain",
    "Draw arrows showing energy flow", "Label each trophic level",
    "Discuss removing one organism",
  ];

  const removalEffects: Record<string, string> = {
    plant: "Without producers, all consumers lose their energy source.",
    grasshopper: "Frogs lose food; grass overgrows.",
    frog: "Grasshopper population explodes; snakes lose food.",
    snake: "Frog population increases; hawks find other prey.",
    hawk: "Snake population increases without apex predator.",
  };

  return (
    <Simulation3DLayout
      title="Lab 8: Food Chain Builder (3D)"
      objective="Understand feeding relationships in ecosystems"
      theory="A food chain shows energy flow from producers → consumers. Arrows point in the direction of energy transfer."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Organism Cards</p>
          {organisms.map(org => {
            const inChain = chain.includes(org.id);
            return (
              <button key={org.id} onClick={() => addToChain(org.id)} disabled={inChain}
                className={`flex items-center gap-2 w-full text-left text-xs p-2 rounded border transition-all ${inChain ? "opacity-40 border-border" : "border-border hover:border-primary"}`}>
                <span className="text-lg">{org.emoji}</span>
                <div>
                  <div className="font-semibold">{org.name}</div>
                  <div className="text-muted-foreground text-[10px]">{org.level}</div>
                </div>
              </button>
            );
          })}
          {chain.length === 5 && (
            <div className="border-t border-border pt-2">
              <p className="text-xs text-muted-foreground font-medium mb-1">Remove Species</p>
              {organisms.map(org => (
                <button key={org.id} onClick={() => simulateRemoval(org.id)}
                  className={`text-xs py-1 px-2 w-full text-left rounded ${removedId === org.id ? "bg-destructive/10 text-destructive" : "hover:bg-muted"}`}>
                  ✕ Remove {org.name}
                </button>
              ))}
            </div>
          )}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {chain.map((id, i) => {
            const org = organisms.find(o => o.id === id)!;
            const x = (i - 2) * 0.9;
            return (
              <group key={id}>
                <OrganismCard3D
                  position={[x, 0.2, 0]}
                  org={org}
                  removed={removedId === id}
                />
                {i < chain.length - 1 && (
                  <Arrow3D from={[x + 0.3, 0.2, 0]} to={[x + 0.6, 0.2, 0]} />
                )}
              </group>
            );
          })}
          {chain.length === 0 && (
            <Text position={[0, 0.5, 0]} fontSize={0.08} color="#999" anchorX="center">
              Click organism cards to build your food chain
            </Text>
          )}
          {isCorrect && !removedId && (
            <Text position={[0, 1, 0]} fontSize={0.08} color="#22c55e" anchorX="center" fontWeight="bold">
              ✅ Correct food chain! Energy flows Producer → Apex Predator
            </Text>
          )}
          {removedId && (
            <Text position={[0, 1, 0]} fontSize={0.06} color="#ef4444" anchorX="center" maxWidth={3}>
              ⚠️ {removalEffects[removedId]}
            </Text>
          )}
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Chain</span><span className="font-bold">{chain.length}/5</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Order</span><span className="font-bold">{isCorrect ? "Correct ✓" : chain.length === 5 ? "Incorrect" : "Building..."}</span></div>
          {removedId && <div className="flex justify-between"><span className="text-muted-foreground">Removed</span><span className="font-bold text-destructive">{organisms.find(o => o.id === removedId)?.name}</span></div>}
        </div>
      }
    />
  );
}
