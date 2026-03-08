import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

// ============ b12-1: Recombinant DNA 3D ============

function DNAHelix({ position, cut, geneInserted }: { position: [number, number, number]; cut: boolean; geneInserted: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.3; });
  const points1: THREE.Vector3[] = [];
  const points2: THREE.Vector3[] = [];
  for (let i = 0; i < 40; i++) {
    const t = i * 0.15;
    points1.push(new THREE.Vector3(Math.sin(t) * 0.3, t * 0.1 - 1, Math.cos(t) * 0.3));
    points2.push(new THREE.Vector3(Math.sin(t + Math.PI) * 0.3, t * 0.1 - 1, Math.cos(t + Math.PI) * 0.3));
  }
  return (
    <group ref={ref} position={position}>
      {!cut ? (
        <>
          <mesh><tubeGeometry args={[new THREE.CatmullRomCurve3(points1), 40, 0.03, 8, false]} /><meshStandardMaterial color="#3b82f6" /></mesh>
          <mesh><tubeGeometry args={[new THREE.CatmullRomCurve3(points2), 40, 0.03, 8, false]} /><meshStandardMaterial color="#ef4444" /></mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 0.5, 0]}><tubeGeometry args={[new THREE.CatmullRomCurve3(points1.slice(0, 20)), 20, 0.03, 8, false]} /><meshStandardMaterial color="#3b82f6" /></mesh>
          <mesh position={[0.4, -0.3, 0]}><tubeGeometry args={[new THREE.CatmullRomCurve3(points1.slice(20)), 20, 0.03, 8, false]} /><meshStandardMaterial color="#3b82f6" /></mesh>
          {geneInserted && (
            <mesh position={[0.2, 0, 0]}>
              <boxGeometry args={[0.15, 0.3, 0.1]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

function Plasmid3D({ position, open, geneInserted, sealed }: { position: [number, number, number]; open: boolean; geneInserted: boolean; sealed: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * 0.5; });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <torusGeometry args={[0.4, 0.04, 16, open ? 28 : 32]} />
        <meshStandardMaterial color="#a855f7" />
      </mesh>
      {geneInserted && (
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.12, 0.2, 0.08]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.4} />
        </mesh>
      )}
      {sealed && <Text position={[0, -0.6, 0]} fontSize={0.1} color="#22c55e">Sealed ✓</Text>}
    </group>
  );
}

function PetriDish3D({ position, glowing }: { position: [number, number, number]; glowing: boolean }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.08, 32]} />
        <meshPhysicalMaterial color="#e8e0d4" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[Math.cos(i * 0.8) * 0.3, 0.06, Math.sin(i * 0.8) * 0.3]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={glowing ? "#22c55e" : "#888"} emissive={glowing ? "#22c55e" : "#000"} emissiveIntensity={glowing ? 0.8 : 0} />
        </mesh>
      ))}
    </group>
  );
}

function RecombinantDNAScene({ enzymeSelected, dnaCut, plasmidOpen, geneInserted, ligased, transformed, glowing }: any) {
  return (
    <>
      <LabRoom />
      <DNAHelix position={[-1, 0.2, 0]} cut={dnaCut} geneInserted={false} />
      <Plasmid3D position={[1, 0.2, 0]} open={plasmidOpen} geneInserted={geneInserted} sealed={ligased} />
      {transformed && <PetriDish3D position={[0, -0.4, 0.5]} glowing={glowing} />}
      {enzymeSelected && <Text position={[-1, 1.2, 0]} fontSize={0.1} color="#ef4444">🔪 Enzyme Selected</Text>}
    </>
  );
}

export function RecombinantDNA3D() {
  const steps = ["Read Objective", "Select Restriction Enzyme", "Cut DNA", "Open Plasmid", "Insert Gene", "DNA Ligase", "Transform Bacteria", "Observe Results"];
  const [currentStep, setCurrentStep] = useState(0);
  const [enzymeSelected, setEnzymeSelected] = useState(false);
  const [dnaCut, setDnaCut] = useState(false);
  const [plasmidOpen, setPlasmidOpen] = useState(false);
  const [geneInserted, setGeneInserted] = useState(false);
  const [ligased, setLigased] = useState(false);
  const [transformed, setTransformed] = useState(false);
  const [glowing, setGlowing] = useState(false);

  const handleAction = (action: string) => {
    switch (action) {
      case "enzyme": setEnzymeSelected(true); setCurrentStep(Math.max(currentStep, 1)); break;
      case "cut": if (enzymeSelected) { setDnaCut(true); setCurrentStep(Math.max(currentStep, 2)); } break;
      case "open": if (dnaCut) { setPlasmidOpen(true); setCurrentStep(Math.max(currentStep, 3)); } break;
      case "insert": if (plasmidOpen) { setGeneInserted(true); setCurrentStep(Math.max(currentStep, 4)); } break;
      case "ligase": if (geneInserted) { setLigased(true); setCurrentStep(Math.max(currentStep, 5)); } break;
      case "transform": if (ligased) { setTransformed(true); setCurrentStep(Math.max(currentStep, 6)); setTimeout(() => { setGlowing(true); setCurrentStep(7); }, 1500); } break;
    }
  };

  const reset = () => { setCurrentStep(0); setEnzymeSelected(false); setDnaCut(false); setPlasmidOpen(false); setGeneInserted(false); setLigased(false); setTransformed(false); setGlowing(false); };

  return (
    <Simulation3DLayout
      title="Lab: Recombinant DNA / Genetic Engineering"
      objective="Create recombinant DNA by inserting a gene into a bacterial plasmid"
      theory="Restriction enzymes cut DNA at recognition sites. DNA ligase joins fragments. Transformed bacteria express the foreign gene."
      onReset={reset}
      steps={steps} currentStep={currentStep} onStepClick={setCurrentStep}
      controls={
        <div className="space-y-2">
          {[
            { label: "🔪 Restriction Enzyme", action: "enzyme", done: enzymeSelected, enabled: true },
            { label: "✂️ Cut DNA", action: "cut", done: dnaCut, enabled: enzymeSelected },
            { label: "🔓 Open Plasmid", action: "open", done: plasmidOpen, enabled: dnaCut },
            { label: "🧬 Insert Gene", action: "insert", done: geneInserted, enabled: plasmidOpen },
            { label: "🔗 DNA Ligase", action: "ligase", done: ligased, enabled: geneInserted },
            { label: "🦠 Transform", action: "transform", done: transformed, enabled: ligased },
          ].map(b => (
            <Button key={b.action} variant={b.done ? "default" : "outline"} size="sm" className="w-full text-xs" disabled={!b.enabled} onClick={() => handleAction(b.action)}>
              {b.label} {b.done && "✓"}
            </Button>
          ))}
        </div>
      }
      canvas3D={<RecombinantDNAScene {...{ enzymeSelected, dnaCut, plasmidOpen, geneInserted, ligased, transformed, glowing }} />}
      liveData={
        <div className="space-y-2 text-xs">
          {[["Enzyme", enzymeSelected], ["DNA Cut", dnaCut], ["Plasmid Open", plasmidOpen], ["Gene Inserted", geneInserted], ["Ligated", ligased], ["Transformed", transformed], ["Expression", glowing]].map(([l, v]) => (
            <div key={l as string} className="flex justify-between"><span className="text-muted-foreground">{l as string}</span><span className="font-mono">{v ? "✅" : "—"}</span></div>
          ))}
        </div>
      }
    />
  );
}

// ============ b12-2: Microorganism Observation 3D ============

function MicroscopeBody3D({ magnification }: { magnification: number }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.3, 0]}><boxGeometry args={[0.6, 0.05, 0.4]} /><meshStandardMaterial color="#333" metalness={0.7} /></mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.04, 0.04, 1.2, 12]} /><meshStandardMaterial color="#555" metalness={0.8} /></mesh>
      <mesh position={[0, 0.9, 0]}><boxGeometry args={[0.15, 0.1, 0.15]} /><meshStandardMaterial color="#444" metalness={0.6} /></mesh>
      <mesh position={[0, 0.6, 0.12]} rotation={[0.3, 0, 0]}><cylinderGeometry args={[0.06, 0.04, 0.3, 12]} /><meshStandardMaterial color="#666" metalness={0.7} /></mesh>
      <Text position={[0.2, 0.6, 0.2]} fontSize={0.06} color="#22c55e">{magnification}×</Text>
    </group>
  );
}

function MicroorganismSlide3D({ sample, magnification, stained, focus }: { sample: string; magnification: number; stained: boolean; focus: number }) {
  const blurOk = Math.abs(focus - 50) < 15;
  const count = Math.min(20, Math.floor(magnification / 30));
  const color = stained ? (sample === "bacteria" ? "#7c3aed" : sample === "fungi" ? "#3b82f6" : "#f97316") : "#888";

  return (
    <group position={[0, -0.25, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.5, 32]} /><meshStandardMaterial color="#fefce8" transparent opacity={blurOk ? 0.9 : 0.4} /></mesh>
      {blurOk && Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[Math.cos(i * 1.2) * 0.3, -0.22, Math.sin(i * 1.2) * 0.3]}>
          {sample === "bacteria" ? <capsuleGeometry args={[0.015, 0.04, 4, 8]} /> : sample === "fungi" ? <sphereGeometry args={[0.03, 8, 8]} /> : <octahedronGeometry args={[0.015]} />}
          <meshStandardMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
      {!blurOk && <Text position={[0, -0.15, 0]} fontSize={0.08} color="#ef4444">Adjust Focus</Text>}
    </group>
  );
}

function MicroorganismScene({ sample, magnification, stained, focus }: any) {
  return (
    <>
      <LabRoom />
      <MicroscopeBody3D magnification={magnification} />
      <MicroorganismSlide3D sample={sample} magnification={magnification} stained={stained} focus={focus} />
    </>
  );
}

export function MicroorganismObservation3D() {
  const steps = ["Select Sample", "Place Slide", "Adjust Magnification", "Adjust Focus", "Apply Stain", "Observe", "Compare", "Record"];
  const [currentStep, setCurrentStep] = useState(0);
  const [sample, setSample] = useState<"bacteria" | "fungi" | "virus">("bacteria");
  const [magnification, setMagnification] = useState(100);
  const [focus, setFocus] = useState(50);
  const [stained, setStained] = useState(false);

  const reset = () => { setCurrentStep(0); setSample("bacteria"); setMagnification(100); setFocus(50); setStained(false); };

  return (
    <Simulation3DLayout
      title="Lab: Virtual Microscope – Microorganism Observation"
      objective="Observe and compare bacteria, fungi, and viruses under a microscope"
      theory="Microorganisms differ in size, structure, and staining properties."
      onReset={reset} steps={steps} currentStep={currentStep} onStepClick={setCurrentStep}
      controls={
        <div className="space-y-3">
          <div><p className="text-xs font-semibold text-muted-foreground mb-1">Sample</p>
            {(["bacteria", "fungi", "virus"] as const).map(s => (
              <label key={s} className="flex items-center gap-2 text-xs capitalize"><input type="radio" checked={sample === s} onChange={() => { setSample(s); setCurrentStep(Math.max(currentStep, 1)); }} /> {s}</label>
            ))}
          </div>
          <div><p className="text-xs text-muted-foreground mb-1">Magnification: {magnification}×</p><Slider value={[magnification]} onValueChange={v => { setMagnification(v[0]); setCurrentStep(Math.max(currentStep, 2)); }} min={10} max={1000} step={10} /></div>
          <div><p className="text-xs text-muted-foreground mb-1">Focus: {focus}</p><Slider value={[focus]} onValueChange={v => { setFocus(v[0]); setCurrentStep(Math.max(currentStep, 3)); }} min={0} max={100} /></div>
          <Button variant={stained ? "default" : "outline"} size="sm" className="w-full text-xs" onClick={() => { setStained(!stained); setCurrentStep(Math.max(currentStep, 4)); }}>{stained ? "Stain Applied ✓" : "Apply Gram Stain"}</Button>
        </div>
      }
      canvas3D={<MicroorganismScene sample={sample} magnification={magnification} stained={stained} focus={focus} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Sample</span><span className="font-mono capitalize">{sample}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Magnification</span><span className="font-mono">{magnification}×</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Focus</span><span className="font-mono">{Math.abs(focus - 50) < 15 ? "Sharp" : "Blurry"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Stain</span><span className="font-mono">{stained ? "Applied" : "None"}</span></div>
        </div>
      }
    />
  );
}

// ============ b12-3: Ecosystem Simulation 3D ============

function EcosystemScene({ producers, herbivores, predators, ecosystem, running }: any) {
  const producerRefs = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (producerRefs.current && running) {
      producerRefs.current.children.forEach((c, i) => {
        c.position.y = -0.4 + Math.sin(Date.now() * 0.001 + i) * 0.02;
      });
    }
  });

  const pCount = Math.min(15, Math.round(producers / 4));
  const hCount = Math.min(8, Math.round(herbivores / 3));
  const prCount = Math.min(5, Math.round(predators));
  const groundColor = ecosystem === "aquatic" ? "#0ea5e9" : ecosystem === "forest" ? "#166534" : "#a16207";

  return (
    <>
      <LabRoom />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}><planeGeometry args={[3.5, 2.5]} /><meshStandardMaterial color={groundColor} transparent opacity={0.3} /></mesh>

      <group ref={producerRefs}>
        {Array.from({ length: pCount }, (_, i) => (
          <mesh key={`p${i}`} position={[(i % 5 - 2) * 0.35, -0.3, (Math.floor(i / 5) - 1) * 0.4]}>
            <coneGeometry args={[0.06, 0.2, 6]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        ))}
      </group>

      {Array.from({ length: hCount }, (_, i) => (
        <mesh key={`h${i}`} position={[(i % 4 - 1.5) * 0.5, -0.38, 0.6 + Math.floor(i / 4) * 0.3]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      ))}

      {Array.from({ length: prCount }, (_, i) => (
        <mesh key={`pr${i}`} position={[(i - prCount / 2) * 0.5, -0.35, -0.6]}>
          <coneGeometry args={[0.07, 0.15, 4]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      ))}

      <Text position={[0, 1, 0]} fontSize={0.1} color="#888">
        🟢{Math.round(producers)} 🔵{Math.round(herbivores)} 🔴{Math.round(predators)}
      </Text>
    </>
  );
}

export function EcosystemSimulation3D() {
  const steps = ["Choose Ecosystem", "Set Parameters", "Start Simulation", "Observe Changes", "Adjust Rainfall", "Observe Dynamics", "Record Data"];
  const [currentStep, setCurrentStep] = useState(0);
  const [ecosystem, setEcosystem] = useState<"grassland" | "forest" | "aquatic">("grassland");
  const [producers, setProducers] = useState(50);
  const [herbivores, setHerbivores] = useState(20);
  const [predators, setPredators] = useState(5);
  const [rainfall, setRainfall] = useState(50);
  const [generation, setGeneration] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setGeneration(g => g + 1);
      setProducers(p => Math.max(5, Math.min(100, p + (rainfall / 25) - (herbivores / 10) + Math.random() * 4 - 2)));
      setHerbivores(h => Math.max(2, Math.min(80, h + (producers / 30) - (predators / 3) + Math.random() * 3 - 1.5)));
      setPredators(pr => Math.max(1, Math.min(40, pr + (herbivores / 20) - 1 + Math.random() * 2 - 1)));
    }, 1000);
    return () => clearInterval(iv);
  }, [running, rainfall, producers, herbivores, predators]);

  const reset = () => { setCurrentStep(0); setProducers(50); setHerbivores(20); setPredators(5); setRainfall(50); setGeneration(0); setRunning(false); };

  return (
    <Simulation3DLayout
      title="Lab: Ecosystem Simulation"
      objective="Build an ecosystem and observe population dynamics"
      theory="Producers form the base of food chains. Predator-prey interactions create cyclic population patterns."
      onReset={reset} steps={steps} currentStep={currentStep} onStepClick={setCurrentStep}
      controls={
        <div className="space-y-3">
          <div><p className="text-xs font-semibold text-muted-foreground mb-1">Ecosystem</p>
            {(["grassland", "forest", "aquatic"] as const).map(e => (
              <label key={e} className="flex items-center gap-2 text-xs capitalize"><input type="radio" checked={ecosystem === e} onChange={() => setEcosystem(e)} /> {e}</label>
            ))}
          </div>
          <div><p className="text-xs text-muted-foreground mb-1">Rainfall: {rainfall}%</p><Slider value={[rainfall]} onValueChange={v => setRainfall(v[0])} min={0} max={100} /></div>
          <Button variant={running ? "destructive" : "default"} size="sm" className="w-full text-xs" onClick={() => { setRunning(!running); if (!running) setCurrentStep(Math.max(currentStep, 2)); }}>
            {running ? "⏸ Pause" : "▶ Start"}
          </Button>
        </div>
      }
      canvas3D={<EcosystemScene producers={producers} herbivores={herbivores} predators={predators} ecosystem={ecosystem} running={running} />}
      liveData={
        <div className="space-y-2 text-xs">
          {[["Ecosystem", ecosystem], ["Generation", generation], ["Producers", Math.round(producers)], ["Herbivores", Math.round(herbivores)], ["Predators", Math.round(predators)], ["Rainfall", `${rainfall}%`]].map(([l, v]) => (
            <div key={l as string} className="flex justify-between"><span className="text-muted-foreground">{l as string}</span><span className="font-mono">{v}</span></div>
          ))}
        </div>
      }
    />
  );
}

// ============ b12-4: Natural Selection 3D ============

function NaturalSelectionScene({ lightAlleleFreq, bgColor, predatorDensity, generations }: any) {
  const bgValue = bgColor === "light" ? "#d1d5db" : "#374151";
  return (
    <>
      <LabRoom />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}><planeGeometry args={[3, 2]} /><meshStandardMaterial color={bgValue} /></mesh>

      {Array.from({ length: 20 }, (_, i) => {
        const isLight = i < Math.floor(lightAlleleFreq / 5);
        return (
          <mesh key={i} position={[(i % 5 - 2) * 0.35, -0.35, (Math.floor(i / 5) - 1.5) * 0.3]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={isLight ? "#d1d5db" : "#1f2937"} />
          </mesh>
        );
      })}

      {Array.from({ length: Math.min(4, predatorDensity) }, (_, i) => (
        <mesh key={`pred${i}`} position={[1.2, -0.2 + i * 0.25, 0]}>
          <coneGeometry args={[0.06, 0.12, 4]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      ))}

      <Text position={[0, 1, 0]} fontSize={0.09} color="#888">
        Gen {generations} — Light {lightAlleleFreq}% | Dark {100 - lightAlleleFreq}%
      </Text>
    </>
  );
}

export function NaturalSelection3D() {
  const steps = ["Choose Trait", "Set Environment", "Set Predators", "Run Generations", "Observe Allele Change", "Analyze", "Record"];
  const [currentStep, setCurrentStep] = useState(0);
  const [bgColor, setBgColor] = useState<"light" | "dark">("light");
  const [predatorDensity, setPredatorDensity] = useState(3);
  const [generations, setGenerations] = useState(0);

  const lightAlleleFreq = (() => {
    if (predatorDensity === 0) return 50;
    const pressure = predatorDensity * generations * 3;
    return bgColor === "light" ? Math.min(90, Math.max(10, 50 + Math.min(40, pressure))) : Math.max(10, 50 - Math.min(40, pressure));
  })();

  const reset = () => { setCurrentStep(0); setBgColor("light"); setPredatorDensity(3); setGenerations(0); };

  return (
    <Simulation3DLayout
      title="Lab: Natural Selection Simulation"
      objective="Observe how environmental pressures drive allele frequency changes"
      theory="Organisms with traits better suited to the environment survive and reproduce more."
      onReset={reset} steps={steps} currentStep={currentStep} onStepClick={setCurrentStep}
      controls={
        <div className="space-y-3">
          <div><p className="text-xs font-semibold text-muted-foreground mb-1">Environment</p>
            {(["light", "dark"] as const).map(c => (
              <label key={c} className="flex items-center gap-2 text-xs capitalize"><input type="radio" checked={bgColor === c} onChange={() => { setBgColor(c); setCurrentStep(Math.max(currentStep, 1)); }} /> {c} Background</label>
            ))}
          </div>
          <div><p className="text-xs text-muted-foreground mb-1">Predators: {predatorDensity}</p><Slider value={[predatorDensity]} onValueChange={v => { setPredatorDensity(v[0]); setCurrentStep(Math.max(currentStep, 2)); }} min={0} max={10} /></div>
          <div><p className="text-xs text-muted-foreground mb-1">Generations: {generations}</p><Slider value={[generations]} onValueChange={v => { setGenerations(v[0]); setCurrentStep(Math.max(currentStep, 3)); }} min={0} max={20} /></div>
        </div>
      }
      canvas3D={<NaturalSelectionScene lightAlleleFreq={lightAlleleFreq} bgColor={bgColor} predatorDensity={predatorDensity} generations={generations} />}
      liveData={
        <div className="space-y-2 text-xs">
          {[["Light Allele", `${lightAlleleFreq}%`], ["Dark Allele", `${100 - lightAlleleFreq}%`], ["Predators", predatorDensity], ["Generation", generations], ["Selection", predatorDensity > 0 ? (bgColor === "light" ? "Light favored" : "Dark favored") : "None"]].map(([l, v]) => (
            <div key={l as string} className="flex justify-between"><span className="text-muted-foreground">{l as string}</span><span className="font-mono">{v}</span></div>
          ))}
        </div>
      }
    />
  );
}
