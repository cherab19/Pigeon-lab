import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom, Beaker3D } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ==================== 1. Indicators Lab 3D ==================== */

function IndicatorsScene({ solutions, results }: { solutions: { name: string; type: string; pH: number }[]; results: Record<string, Record<string, string>> }) {
  return (
    <group>
      <LabRoom />
      {solutions.map((sol, i) => {
        const x = (i - 1.5) * 0.8;
        const resultColors = results[sol.name] || {};
        const lastColor = Object.values(resultColors).pop() || "#aaddff";
        return (
          <group key={i} position={[x, -0.3, 0]}>
            {/* Beaker */}
            <mesh>
              <cylinderGeometry args={[0.15, 0.13, 0.4, 32, 1, true]} />
              <meshPhysicalMaterial color="#aaddff" transparent opacity={0.2} transmission={0.8} side={THREE.DoubleSide} />
            </mesh>
            {/* Liquid */}
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.14, 0.12, 0.25, 32]} />
              <meshStandardMaterial color={lastColor} transparent opacity={0.7} />
            </mesh>
            <Text position={[0, 0.3, 0]} fontSize={0.07} color="white" fontWeight="bold">{sol.name}</Text>
            <Text position={[0, -0.3, 0]} fontSize={0.05} color="gray">pH {sol.pH}</Text>
          </group>
        );
      })}
      <Text position={[0, 0.8, 0]} fontSize={0.08} color="white">Indicator & Acid-Base Lab</Text>
    </group>
  );
}

export function IndicatorsLab3D() {
  const [selectedBeaker, setSelectedBeaker] = useState<number | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, Record<string, string>>>({});
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const solutions = [
    { name: "HCl", type: "Strong Acid", pH: 1 },
    { name: "CH₃COOH", type: "Weak Acid", pH: 4.7 },
    { name: "NaCl", type: "Neutral Salt", pH: 7 },
    { name: "NH₃", type: "Weak Base", pH: 11.6 },
  ];
  const indicators = ["Red Litmus", "Blue Litmus", "Phenolphthalein", "Methyl Orange"];
  const indicatorColors: Record<string, Record<string, string>> = {
    "Red Litmus": { "Strong Acid": "#e53e3e", "Weak Acid": "#e53e3e", "Neutral Salt": "#e53e3e", "Weak Base": "#3b82f6" },
    "Blue Litmus": { "Strong Acid": "#e53e3e", "Weak Acid": "#e53e3e", "Neutral Salt": "#3b82f6", "Weak Base": "#3b82f6" },
    "Phenolphthalein": { "Strong Acid": "#aaddff", "Weak Acid": "#aaddff", "Neutral Salt": "#aaddff", "Weak Base": "#ec4899" },
    "Methyl Orange": { "Strong Acid": "#ef4444", "Weak Acid": "#f97316", "Neutral Salt": "#eab308", "Weak Base": "#eab308" },
  };

  const applyIndicator = (beakerIdx: number) => {
    if (!selectedIndicator) return;
    const sol = solutions[beakerIdx];
    const color = indicatorColors[selectedIndicator]?.[sol.type] || "#aaddff";
    setResults(prev => ({ ...prev, [sol.name]: { ...prev[sol.name], [selectedIndicator]: color } }));
    setStep(s => Math.min(s + 1, 5));
    sound.playBubble();
  };

  const reset = () => { setSelectedBeaker(null); setSelectedIndicator(null); setResults({}); setStep(0); };
  const steps = ["Take samples of each solution", "Select an indicator", "Click beaker to apply", "Observe color change", "Repeat with all indicators", "Record observations"];

  return (
    <Simulation3DLayout
      title="Indicators & Acid-Base Properties"
      objective="Identify acids, bases, and neutral solutions using indicators"
      theory="Indicators change color at specific pH ranges. Litmus, phenolphthalein, and methyl orange each respond differently."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <span className="text-xs text-muted-foreground font-semibold">Indicator Rack</span>
          {indicators.map(ind => (
            <Button key={ind} size="sm" variant={selectedIndicator === ind ? "default" : "outline"} className="w-full text-xs h-7 justify-start" onClick={() => { setSelectedIndicator(ind); sound.playClick(); }}>{ind}</Button>
          ))}
          <div className="border-t border-border pt-2 mt-2">
            <span className="text-xs text-muted-foreground font-semibold">Apply to Beaker</span>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {solutions.map((sol, i) => (
                <Button key={i} size="sm" variant="outline" className="text-xs h-7" onClick={() => applyIndicator(i)} disabled={!selectedIndicator}>{sol.name}</Button>
              ))}
            </div>
          </div>
        </div>
      }
      canvas3D={<IndicatorsScene solutions={solutions} results={results} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Indicator</span><span className="font-mono">{selectedIndicator || "None"}</span></div>
          {solutions.map(sol => (
            <div key={sol.name} className="flex justify-between"><span className="text-muted-foreground">{sol.name}</span><span className="font-mono">{sol.type}</span></div>
          ))}
        </div>
      }
    />
  );
}

/* ==================== 2. pH Meter Simulation 3D ==================== */

function PHMeterScene({ pH }: { pH: number }) {
  const phColor = pH < 3 ? "#ef4444" : pH < 6 ? "#f97316" : pH < 8 ? "#22c55e" : pH < 11 ? "#3b82f6" : "#8b5cf6";

  return (
    <group>
      <LabRoom />
      {/* Beaker */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.35, 0.3, 0.7, 32, 1, true]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Liquid */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.33, 0.28, 0.4, 32]} />
        <meshStandardMaterial color={phColor} transparent opacity={0.4} />
      </mesh>
      {/* pH probe */}
      <mesh position={[0.1, 0.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      <Sphere args={[0.025, 8, 8]} position={[0.1, -0.2, 0]}>
        <meshStandardMaterial color={phColor} emissive={phColor} emissiveIntensity={0.5} />
      </Sphere>
      {/* Digital display */}
      <mesh position={[0.8, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.35, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <Text position={[0.8, 0.38, 0.06]} fontSize={0.06} color="#22c55e">pH Meter</Text>
      <Text position={[0.8, 0.25, 0.06]} fontSize={0.12} color="#22c55e" fontWeight="bold">{pH.toFixed(1)}</Text>
      {/* pH scale bar on table */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(v => (
        <mesh key={v} position={[-1.2 + v * 0.17, -0.44, 0.8]}>
          <boxGeometry args={[0.15, 0.02, 0.1]} />
          <meshStandardMaterial color={v < 3 ? "#ef4444" : v < 6 ? "#f97316" : v < 8 ? "#22c55e" : v < 11 ? "#3b82f6" : "#8b5cf6"} />
        </mesh>
      ))}
      <Text position={[0, -0.7, 0]} fontSize={0.06} color="gray">{pH < 6.5 ? "Acidic" : pH > 7.5 ? "Basic" : "Neutral"}</Text>
    </group>
  );
}

export function PHMeterSim3D() {
  const [acidAdded, setAcidAdded] = useState(0);
  const [baseAdded, setBaseAdded] = useState(0);
  const [dilution, setDilution] = useState(0);
  const sound = useSoundEffects();

  const pH = Math.max(0, Math.min(14, 7 - acidAdded * 0.7 + baseAdded * 0.7 + dilution * 0.1));
  const reset = () => { setAcidAdded(0); setBaseAdded(0); setDilution(0); };
  const steps = ["Place beaker with water", "Insert pH probe", "Observe initial pH", "Add HCl drops", "Observe pH decrease", "Add NaOH drops", "Observe pH increase", "Dilute solution", "Record changes"];

  return (
    <Simulation3DLayout
      title="pH Meter Simulation"
      objective="Measure pH and observe changes with acid/base additions"
      theory="pH = -log[H⁺]. pH < 7 acidic, pH = 7 neutral, pH > 7 basic."
      onReset={reset} steps={steps} currentStep={acidAdded + baseAdded > 0 ? 4 : 0}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">HCl: {acidAdded} mL</label>
            <Slider value={[acidAdded]} onValueChange={([v]) => { setAcidAdded(v); sound.playBubble(); }} min={0} max={10} step={0.5} /></div>
          <div><label className="text-xs text-muted-foreground">NaOH: {baseAdded} mL</label>
            <Slider value={[baseAdded]} onValueChange={([v]) => { setBaseAdded(v); sound.playBubble(); }} min={0} max={10} step={0.5} /></div>
          <div><label className="text-xs text-muted-foreground">Dilution: {dilution} mL</label>
            <Slider value={[dilution]} onValueChange={([v]) => { setDilution(v); sound.playClick(); }} min={0} max={10} step={1} /></div>
        </div>
      }
      canvas3D={<PHMeterScene pH={pH} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">pH</span><span className="font-mono font-bold">{pH.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Nature</span><span className="font-mono">{pH < 6.5 ? "Acidic" : pH > 7.5 ? "Basic" : "Neutral"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">[H⁺]</span><span className="font-mono">{(Math.pow(10, -pH)).toExponential(2)} M</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">HCl</span><span className="font-mono">{acidAdded} mL</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">NaOH</span><span className="font-mono">{baseAdded} mL</span></div>
        </div>
      }
    />
  );
}

/* ==================== 3. Weak Acid Ionization 3D ==================== */

function WeakAcidScene({ concInit, percentIon }: { concInit: number; percentIon: number }) {
  const particlesRef = useRef<THREE.Group>(null);
  const numHA = Math.floor((1 - percentIon / 100) * 20);
  const numIons = Math.floor((percentIon / 100) * 20);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    const t = clock.elapsedTime;
    particlesRef.current.children.forEach((child, i) => {
      child.position.x = ((i % 5) - 2) * 0.15 + Math.sin(t * 0.5 + i) * 0.05;
      child.position.z = (Math.floor(i / 5) - 2) * 0.15 + Math.cos(t * 0.4 + i * 1.3) * 0.05;
    });
  });

  return (
    <group>
      <LabRoom />
      {/* Beaker */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.4, 0.35, 0.8, 32, 1, true]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* HA molecules (undissociated) */}
      <group ref={particlesRef} position={[0, -0.2, 0]}>
        {Array.from({ length: numHA }, (_, i) => (
          <Sphere key={`ha${i}`} args={[0.04, 8, 8]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#f97316" />
          </Sphere>
        ))}
        {Array.from({ length: numIons }, (_, i) => (
          <group key={`ion${i}`}>
            <Sphere args={[0.03, 8, 8]} position={[((i % 3) - 1) * 0.2, 0.1, ((Math.floor(i / 3)) - 1) * 0.2]}>
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
            </Sphere>
            <Sphere args={[0.03, 8, 8]} position={[((i % 3) - 1) * 0.2 + 0.06, 0.1, ((Math.floor(i / 3)) - 1) * 0.2]}>
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
            </Sphere>
          </group>
        ))}
      </group>
      {/* ICE table display */}
      <mesh position={[0, 0.8, -0.5]}>
        <planeGeometry args={[1.5, 0.6]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <Text position={[0, 1, -0.49]} fontSize={0.06} color="#22c55e">CH₃COOH ⇌ H⁺ + CH₃COO⁻</Text>
      <Text position={[0, 0.85, -0.49]} fontSize={0.05} color="white">% Ionization: {percentIon.toFixed(1)}%</Text>
      {/* Legend */}
      <Text position={[-0.5, -0.7, 0.5]} fontSize={0.05} color="#f97316">● HA molecules</Text>
      <Text position={[0.5, -0.7, 0.5]} fontSize={0.05} color="#ef4444">● H⁺ + A⁻ ions</Text>
    </group>
  );
}

export function WeakAcidIonization3D() {
  const [concInit, setConcInit] = useState(0.1);
  const [temp, setTemp] = useState(25);
  const sound = useSoundEffects();

  const Ka = 1.8e-5 * (1 + (temp - 25) * 0.02);
  const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * concInit)) / 2;
  const pH = -Math.log10(x);
  const percentIon = (x / concInit) * 100;

  const reset = () => { setConcInit(0.1); setTemp(25); };
  const steps = ["Open Ka simulation", "Set initial [HA]", "Adjust temperature", "Observe ICE table", "Read Ka and pH", "Observe % ionization", "Dilute to verify trend", "Record values"];

  return (
    <Simulation3DLayout
      title="Weak Acid Ionization (Ka)"
      objective="Calculate Ka and % ionization using the ICE table"
      theory="HA ⇌ H⁺ + A⁻. Ka = [H⁺][A⁻]/[HA]. Dilute solutions have higher % ionization."
      onReset={reset} steps={steps} currentStep={concInit !== 0.1 || temp !== 25 ? 4 : 0}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">[HA]: {concInit.toFixed(2)} M</label>
            <Slider value={[concInit]} onValueChange={([v]) => { setConcInit(v); sound.playClick(); }} min={0.01} max={1} step={0.01} /></div>
          <div><label className="text-xs text-muted-foreground">Temperature: {temp}°C</label>
            <Slider value={[temp]} onValueChange={([v]) => { setTemp(v); sound.playClick(); }} min={10} max={60} step={1} /></div>
        </div>
      }
      canvas3D={<WeakAcidScene concInit={concInit} percentIon={percentIon} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Ka</span><span className="font-mono">{Ka.toExponential(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">[H⁺]</span><span className="font-mono">{x.toExponential(3)} M</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">pH</span><span className="font-mono">{pH.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">% Ionization</span><span className="font-mono">{percentIon.toFixed(2)}%</span></div>
        </div>
      }
    />
  );
}

/* ==================== 4. Buffer Solutions 3D ==================== */

function BufferScene({ bufferPH, waterPH }: { bufferPH: number; waterPH: number }) {
  const bColor = bufferPH < 4 ? "#ef4444" : bufferPH < 6 ? "#f97316" : "#22c55e";
  const wColor = waterPH < 4 ? "#ef4444" : waterPH < 6 ? "#f97316" : waterPH > 10 ? "#8b5cf6" : waterPH > 7.5 ? "#3b82f6" : "#22c55e";

  return (
    <group>
      <LabRoom />
      {/* Buffer beaker */}
      <group position={[-0.6, -0.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.22, 0.6, 32, 1, true]} />
          <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.23, 0.2, 0.35, 32]} />
          <meshStandardMaterial color={bColor} transparent opacity={0.5} />
        </mesh>
        <Text position={[0, 0.4, 0]} fontSize={0.07} color="white" fontWeight="bold">Buffer</Text>
        <Text position={[0, -0.45, 0]} fontSize={0.08} color="white">pH {bufferPH.toFixed(1)}</Text>
      </group>
      {/* Water beaker */}
      <group position={[0.6, -0.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.22, 0.6, 32, 1, true]} />
          <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.23, 0.2, 0.35, 32]} />
          <meshStandardMaterial color={wColor} transparent opacity={0.5} />
        </mesh>
        <Text position={[0, 0.4, 0]} fontSize={0.07} color="white" fontWeight="bold">Water</Text>
        <Text position={[0, -0.45, 0]} fontSize={0.08} color="white">pH {waterPH.toFixed(1)}</Text>
      </group>
      <Text position={[0, 0.8, 0]} fontSize={0.06} color="gray">Buffer resists pH change vs unbuffered water</Text>
    </group>
  );
}

export function BufferSolutions3D() {
  const [acidAdded, setAcidAdded] = useState(0);
  const [baseAdded, setBaseAdded] = useState(0);
  const sound = useSoundEffects();

  const basePH = 4.74;
  const bufferPH = Math.max(2, Math.min(12, basePH - acidAdded * 0.15 + baseAdded * 0.15));
  const waterPH = Math.max(0, Math.min(14, 7 - acidAdded * 1.5 + baseAdded * 1.5));

  const reset = () => { setAcidAdded(0); setBaseAdded(0); };
  const steps = ["Prepare buffer solution", "Record initial pH", "Add HCl to buffer", "Observe small pH change", "Compare with water", "Add NaOH instead", "Observe resistance", "Record pH values"];

  return (
    <Simulation3DLayout
      title="Buffer Solutions"
      objective="Observe how buffers resist pH changes compared to water"
      theory="Buffer = weak acid + conjugate base. Neutralizes added H⁺ or OH⁻, maintaining nearly constant pH."
      onReset={reset} steps={steps} currentStep={acidAdded > 0 || baseAdded > 0 ? 4 : 0}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">HCl: {acidAdded} mL</label>
            <Slider value={[acidAdded]} onValueChange={([v]) => { setAcidAdded(v); sound.playBubble(); }} min={0} max={10} step={0.5} /></div>
          <div><label className="text-xs text-muted-foreground">NaOH: {baseAdded} mL</label>
            <Slider value={[baseAdded]} onValueChange={([v]) => { setBaseAdded(v); sound.playBubble(); }} min={0} max={10} step={0.5} /></div>
        </div>
      }
      canvas3D={<BufferScene bufferPH={bufferPH} waterPH={waterPH} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Buffer pH</span><span className="font-mono">{bufferPH.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Water pH</span><span className="font-mono">{waterPH.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ΔpH Buffer</span><span className="font-mono">{Math.abs(bufferPH - basePH).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ΔpH Water</span><span className="font-mono">{Math.abs(waterPH - 7).toFixed(2)}</span></div>
        </div>
      }
    />
  );
}

/* ==================== 5. Acid-Base Titration 3D ==================== */

function TitrationScene({ buretteVol, pH }: { buretteVol: number; pH: number }) {
  const dropRef = useRef<THREE.Mesh>(null);
  const indicatorColor = pH > 8.2 ? "#ec4899" : "#aaddff";
  const eqVol = 10;
  const atEndpoint = Math.abs(buretteVol - eqVol) < 0.5;

  useFrame(({ clock }) => {
    if (dropRef.current && buretteVol > 0) {
      const t = (clock.elapsedTime * 2) % 1;
      dropRef.current.position.y = 0.5 - t * 1.2;
      dropRef.current.visible = t < 0.5;
    }
  });

  return (
    <group>
      <LabRoom />
      {/* Burette */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 16]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.2} transmission={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* NaOH in burette */}
      <mesh position={[0, 0.8 + (buretteVol / 20) * 0.5, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 1.1 - (buretteVol / 20) * 1, 16]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.4} />
      </mesh>
      <Text position={[0.15, 1.4, 0]} fontSize={0.05} color="gray">Burette</Text>
      <Text position={[0.15, 1.3, 0]} fontSize={0.05} color="white">{buretteVol.toFixed(1)} mL</Text>
      {/* Drip */}
      {buretteVol > 0 && (
        <Sphere ref={dropRef} args={[0.015, 8, 8]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#3b82f6" />
        </Sphere>
      )}
      {/* Erlenmeyer flask */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.3, 0.5, 32]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Liquid in flask */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.07, 0.28, 0.3, 32]} />
        <meshStandardMaterial color={indicatorColor} transparent opacity={0.6} />
      </mesh>
      {atEndpoint && (
        <Text position={[0, -0.8, 0]} fontSize={0.1} color="#ec4899" fontWeight="bold">⚡ Endpoint!</Text>
      )}
      <Text position={[0.5, -0.3, 0]} fontSize={0.06} color="gray">HCl + Phenolphthalein</Text>
    </group>
  );
}

export function AcidBaseTitration3D() {
  const [buretteVol, setBuretteVol] = useState(0);
  const [dropwise, setDropwise] = useState(false);
  const sound = useSoundEffects();

  const eqVol = 10;
  const pH = buretteVol < eqVol ? 1 + (buretteVol / eqVol) * 6 : buretteVol === eqVol ? 7 : Math.min(13, 7 + (buretteVol - eqVol) * 0.8);
  const atEndpoint = Math.abs(buretteVol - eqVol) < 0.5;

  const reset = () => { setBuretteVol(0); setDropwise(false); };
  const steps = ["Wash and fill burette", "Remove air bubbles", "Record initial reading", "Pipette 10 mL HCl", "Add phenolphthalein", "Add NaOH slowly", "Swirl flask", "Stop at pink endpoint", "Record final reading", "Calculate normality"];

  return (
    <Simulation3DLayout
      title="Acid-Base Titration"
      objective="Determine normality of HCl using standard NaOH"
      theory="At equivalence point, moles acid = moles base. N₁V₁ = N₂V₂. Phenolphthalein turns pink at pH ~8.2."
      onReset={reset} steps={steps} currentStep={buretteVol > 0 ? (atEndpoint ? 8 : 6) : 0}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">NaOH: {buretteVol.toFixed(1)} mL</label>
            <Slider value={[buretteVol]} onValueChange={([v]) => { setBuretteVol(v); sound.playBubble(); }} min={0} max={20} step={dropwise ? 0.1 : 0.5} /></div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={dropwise} onChange={e => setDropwise(e.target.checked)} className="rounded" />
            Dropwise mode
          </label>
        </div>
      }
      canvas3D={<TitrationScene buretteVol={buretteVol} pH={pH} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Vol NaOH</span><span className="font-mono">{buretteVol.toFixed(1)} mL</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">pH</span><span className="font-mono">{pH.toFixed(1)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Eq. Vol</span><span className="font-mono">{eqVol} mL</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Endpoint</span><span className="font-mono">{atEndpoint ? "✓ Reached" : "Not yet"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Indicator</span><span className="font-mono">{pH > 8.2 ? "Pink" : "Colorless"}</span></div>
        </div>
      }
    />
  );
}
