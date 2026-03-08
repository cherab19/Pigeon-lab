import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom, Beaker3D } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ═══ c10-7 Solubility vs Temperature 3D ═══ */
export function SolubilityTemp3D() {
  const [temp, setTemp] = useState(25);
  const [spoonsAdded, setSpoonsAdded] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const maxSolubility = 30 + temp * 0.5;
  const dissolved = Math.min(spoonsAdded * 5, maxSolubility);
  const saturated = spoonsAdded * 5 >= maxSolubility;
  const reset = () => { setTemp(25); setSpoonsAdded(0); setStep(0); };
  const steps = ["Set temperature", "Add solute spoons", "Observe dissolving", "Check saturation", "Increase temperature", "Record observations"];
  return (
    <Simulation3DLayout title="Solubility vs Temperature" objective="Observe how temperature affects solubility"
      theory="Solubility of most solids increases with temperature." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <div><label className="text-xs text-muted-foreground">Temp: {temp}°C</label><Slider value={[temp]} onValueChange={v => setTemp(v[0])} min={0} max={100} step={5} /></div>
        <div><label className="text-xs text-muted-foreground">Spoons: {spoonsAdded}</label><Slider value={[spoonsAdded]} onValueChange={v => setSpoonsAdded(v[0])} min={0} max={30} step={1} /></div>
        <div className="p-2 bg-muted/50 rounded text-xs">
          <div className="w-full h-1.5 bg-muted rounded-full"><div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min((spoonsAdded * 5 / maxSolubility) * 100, 100)}%`, backgroundColor: saturated ? "hsl(var(--destructive))" : "hsl(var(--primary))" }} /></div>
          <p className="mt-1 text-muted-foreground">{saturated ? "Saturated! ⚠️" : `${(dissolved / maxSolubility * 100).toFixed(0)}%`}</p>
        </div>
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          <Beaker3D position={[0, -0.1, 0]} scale={1.8} liquidColor="#4488ff" liquidLevel={0.7} />
          {/* Dissolved particles */}
          {dissolved > 0 && Array.from({ length: Math.min(Math.floor(dissolved / 3), 15) }, (_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 0.2, -0.2 + (i % 4) * 0.08, (Math.random() - 0.5) * 0.2]}>
              <sphereGeometry args={[0.012, 6, 6]} /><meshStandardMaterial color="#fff" transparent opacity={0.5} />
            </mesh>
          ))}
          {/* Undissolved at bottom */}
          {saturated && <mesh position={[0, -0.38, 0]}><cylinderGeometry args={[0.08, 0.08, 0.04, 12]} /><meshStandardMaterial color="#fff" roughness={0.9} /></mesh>}
          <Text position={[0, 0.7, 0]} fontSize={0.08} color="#888">{temp}°C — {saturated ? "Saturated!" : "Dissolving"}</Text>
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span>{temp}°C</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Max Sol.</span><span>{maxSolubility.toFixed(0)} g/100mL</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Dissolved</span><span>{dissolved.toFixed(0)} g</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{saturated ? "Saturated" : "Unsaturated"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-8 pH & Indicators 3D ═══ */
export function PHIndicators3D() {
  const [solution, setSolution] = useState("water");
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const pHValues: Record<string, number> = { hcl: 1, vinegar: 3, water: 7, baking_soda: 9, naoh: 13 };
  const names: Record<string, string> = { hcl: "HCl", vinegar: "Vinegar", water: "Water", baking_soda: "Baking Soda", naoh: "NaOH" };
  const pH = pHValues[solution];
  const litmusColor = pH < 7 ? "#ff4444" : pH === 7 ? "#aa55ff" : "#4444ff";
  const universalColor = pH <= 2 ? "#ff4444" : pH <= 4 ? "#ff8800" : pH <= 6 ? "#ddbb00" : pH <= 8 ? "#44cc44" : pH <= 10 ? "#44bbcc" : pH <= 12 ? "#4444ff" : "#6622cc";
  const reset = () => { setSolution("water"); setStep(0); };
  const steps = ["Select a solution", "Dip litmus paper", "Check universal indicator", "Read pH meter", "Compare with pH chart", "Record values"];
  return (
    <Simulation3DLayout title="pH & Indicators" objective="Determine acidity/alkalinity using indicators"
      theory="pH 0-14. Acids<7, bases>7. Indicators change color at specific pH." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase">Solution</p>
        {Object.entries(names).map(([k, n]) => (
          <label key={k} className="flex items-center gap-2 text-xs"><input type="radio" name="sol" checked={solution === k} onChange={() => setSolution(k)} />{n}</label>
        ))}
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          {/* Test tubes */}
          <Beaker3D position={[-0.5, -0.2, 0]} scale={1} liquidColor={litmusColor} liquidLevel={0.5} />
          <Text position={[-0.5, -0.5, 0]} fontSize={0.05} color="#888">Litmus</Text>
          <Beaker3D position={[0, -0.2, 0]} scale={1} liquidColor={universalColor} liquidLevel={0.5} />
          <Text position={[0, -0.5, 0]} fontSize={0.05} color="#888">Universal</Text>
          {/* pH meter */}
          <group position={[0.6, 0, 0]}>
            <mesh><boxGeometry args={[0.3, 0.4, 0.05]} /><meshStandardMaterial color="#333" /></mesh>
            <Text position={[0, 0.05, 0.03]} fontSize={0.12} color="#44ff44">{pH}</Text>
            <Text position={[0, -0.12, 0.03]} fontSize={0.04} color="#888">pH Meter</Text>
          </group>
          <Text position={[0, 0.8, 0]} fontSize={0.1} color="#eee">{names[solution]} — pH {pH}</Text>
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Solution</span><span>{names[solution]}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">pH</span><span>{pH}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{pH < 7 ? "Acidic" : pH === 7 ? "Neutral" : "Basic"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Litmus</span><span>{pH < 7 ? "Red" : pH === 7 ? "Purple" : "Blue"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-9 Acid + Metal → H₂ 3D ═══ */
export function AcidMetalReaction3D() {
  const [metal, setMetal] = useState("zinc");
  const [acidAdded, setAcidAdded] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const reactivity: Record<string, number> = { magnesium: 3, zinc: 2, iron: 1, copper: 0 };
  const rate = reactivity[metal];
  const progress = acidAdded ? Math.min(time * rate / 60, 1) : 0;
  const gas = progress * 100;
  const reset = () => { setAcidAdded(false); setTime(0); setStep(0); };
  const steps = ["Select metal", "Add HCl acid", "Observe bubbles", "Collect gas", "Burning splint test", "Record observations"];
  return (
    <Simulation3DLayout title="Acid + Metal → H₂ Gas" objective="Observe hydrogen gas from metal-acid reaction"
      theory="Metal + HCl → Metal Chloride + H₂. H₂ pops with burning splint." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase">Metal</p>
        {["magnesium", "zinc", "iron", "copper"].map(m => (
          <label key={m} className="flex items-center gap-2 text-xs capitalize"><input type="radio" name="m" checked={metal === m} onChange={() => { setMetal(m); setAcidAdded(false); setTime(0); }} />{m}</label>
        ))}
        <Button size="sm" className="w-full text-xs" onClick={() => setAcidAdded(true)} disabled={acidAdded}>{acidAdded ? "Added ✅" : "Add HCl"}</Button>
        {acidAdded && <div><label className="text-xs text-muted-foreground">Time: {time}s</label><Slider value={[time]} onValueChange={v => setTime(v[0])} min={0} max={60} step={1} /></div>}
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          <Beaker3D position={[0, -0.1, 0]} scale={1.8} liquidColor="#aaffaa" liquidLevel={0.6} />
          {/* Metal piece */}
          {acidAdded && <mesh position={[0, -0.2, 0]} castShadow><boxGeometry args={[0.06, 0.12, 0.03]} /><meshStandardMaterial color={metal === "copper" ? "#b87333" : "#999"} metalness={0.8} /></mesh>}
          {/* Bubbles */}
          {acidAdded && rate > 0 && gas < 100 && Array.from({ length: rate * 3 }, (_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 0.08, -0.15 + i * 0.06, (Math.random() - 0.5) * 0.08]}>
              <sphereGeometry args={[0.008 + rate * 0.003, 6, 6]} /><meshStandardMaterial color="#fff" transparent opacity={0.4} />
            </mesh>
          ))}
          {/* Gas collection */}
          <group position={[0.6, 0.1, 0]}>
            <mesh><cylinderGeometry args={[0.06, 0.06, 0.4, 12, 1, true]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
            {gas > 0 && <mesh position={[0, 0.2 - gas / 100 * 0.2, 0]}><cylinderGeometry args={[0.055, 0.055, gas / 100 * 0.4, 12]} /><meshStandardMaterial color="#ddeeff" transparent opacity={0.15} /></mesh>}
            <Text position={[0, -0.25, 0.07]} fontSize={0.04} color="#888">H₂ {gas.toFixed(0)}%</Text>
          </group>
          {gas > 80 && <Text position={[0.6, 0.5, 0]} fontSize={0.08} color="#ff6622">💥 Pop!</Text>}
          {acidAdded && rate === 0 && <Text position={[0, 0.7, 0]} fontSize={0.07} color="#ff4444">Cu: No reaction</Text>}
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Metal</span><span className="capitalize">{metal}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Reactivity</span><span>{rate === 0 ? "None" : rate === 1 ? "Low" : rate === 2 ? "Med" : "High"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">H₂</span><span>{gas.toFixed(0)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Pop test</span><span>{gas > 80 ? "✓" : "—"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-10 Acid-Base Titration 3D ═══ */
export function AcidBaseTitration3D() {
  const [volumeAdded, setVolumeAdded] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const eqVol = 25;
  const pH = volumeAdded < eqVol ? 2 + (volumeAdded / eqVol) * 5 : volumeAdded === eqVol ? 7 : 7 + Math.min((volumeAdded - eqVol) / 10, 6);
  const indicatorColor = pH < 4.4 ? "#ff4444" : pH < 8.2 ? "#ff8800" : "#ff44aa";
  const reset = () => { setVolumeAdded(0); setStep(0); };
  const steps = ["Rinse burette", "Fill with NaOH", "Add HCl to flask", "Add indicator", "Titrate slowly", "Find endpoint", "Record volume"];
  return (
    <Simulation3DLayout title="Acid-Base Titration" objective="Determine concentration by titration"
      theory="Acid + Base → Salt + Water. Endpoint when indicator changes color at equivalence point." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <div><label className="text-xs text-muted-foreground">NaOH added: {volumeAdded} mL</label><Slider value={[volumeAdded]} onValueChange={v => setVolumeAdded(v[0])} min={0} max={50} step={0.5} /></div>
        {Math.abs(volumeAdded - eqVol) < 1 && <div className="text-[10px] text-primary bg-primary/10 p-1.5 rounded">★ Endpoint!</div>}
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          {/* Burette */}
          <group position={[0, 0.6, 0]}>
            <mesh><cylinderGeometry args={[0.025, 0.025, 1, 12]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>
            <mesh position={[0, (1 - volumeAdded / 50) * 0.5 - 0.25, 0]}><cylinderGeometry args={[0.023, 0.023, (1 - volumeAdded / 50) * 0.9, 12]} /><meshStandardMaterial color="#4466ff" transparent opacity={0.4} /></mesh>
            <Text position={[0.1, 0.5, 0]} fontSize={0.04} color="#888">Burette</Text>
          </group>
          {/* Flask below */}
          <group position={[0, -0.3, 0]}>
            <mesh><sphereGeometry args={[0.3, 24, 24]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
            <mesh><sphereGeometry args={[0.25, 24, 24]} /><meshStandardMaterial color={indicatorColor} transparent opacity={0.4} /></mesh>
          </group>
          {/* Drop */}
          {volumeAdded > 0 && volumeAdded < 50 && <mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.015, 8, 8]} /><meshStandardMaterial color="#4466ff" /></mesh>}
          <Text position={[0, -0.7, 0]} fontSize={0.06} color="#888">pH: {pH.toFixed(1)}</Text>
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Added</span><span>{volumeAdded} mL</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">pH</span><span>{pH.toFixed(1)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Endpoint</span><span>{eqVol} mL</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{volumeAdded < eqVol - 1 ? "Before" : volumeAdded > eqVol + 1 ? "Past" : "At endpoint ★"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-11 Exo/Endothermic 3D ═══ */
export function ExoEndothermic3D() {
  const [substance, setSubstance] = useState<"cao" | "nh4no3">("cao");
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const isExo = substance === "cao";
  const initialTemp = 25;
  const tempChange = isExo ? Math.min(time * 2, 40) : -Math.min(time * 1.5, 20);
  const currentTemp = initialTemp + tempChange;
  const reset = () => { setSubstance("cao"); setTime(0); setStep(0); };
  const steps = ["Select substance", "Add to water", "Observe temperature", "Record ΔT", "Compare exo vs endo"];
  return (
    <Simulation3DLayout title="Exo & Endothermic Reactions" objective="Distinguish exo- and endothermic processes"
      theory="Exothermic: releases heat (ΔT>0). Endothermic: absorbs heat (ΔT<0)." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <label className="flex items-center gap-2 text-xs"><input type="radio" name="sub" checked={substance === "cao"} onChange={() => { setSubstance("cao"); setTime(0); }} />CaO (Exo)</label>
        <label className="flex items-center gap-2 text-xs"><input type="radio" name="sub" checked={substance === "nh4no3"} onChange={() => { setSubstance("nh4no3"); setTime(0); }} />NH₄NO₃ (Endo)</label>
        <div><label className="text-xs text-muted-foreground">Time: {time}s</label><Slider value={[time]} onValueChange={v => setTime(v[0])} min={0} max={30} step={1} /></div>
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          <Beaker3D position={[0, -0.1, 0]} scale={1.8} liquidColor={isExo ? "#ff6644" : "#4488ff"} liquidLevel={0.6} />
          {/* Thermometer */}
          <group position={[0.3, 0.1, 0.1]}>
            <mesh><cylinderGeometry args={[0.01, 0.01, 0.5, 8]} /><meshStandardMaterial color="#ddd" /></mesh>
            <mesh position={[0, -0.15 + Math.max(currentTemp, 0) / 100 * 0.2, 0]}><cylinderGeometry args={[0.007, 0.007, Math.max(currentTemp, 5) / 100 * 0.4, 8]} /><meshStandardMaterial color="#ff3333" /></mesh>
          </group>
          <Text position={[0.3, 0.45, 0.1]} fontSize={0.06} color="#ff4444">{currentTemp.toFixed(1)}°C</Text>
          {isExo && time > 0 && <Text position={[0, 0.7, 0]} fontSize={0.1} color="#ff6644">↑🔥 Heat Released</Text>}
          {!isExo && time > 0 && <Text position={[0, 0.7, 0]} fontSize={0.1} color="#4488ff">↓❄️ Heat Absorbed</Text>}
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Initial</span><span>{initialTemp}°C</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Current</span><span>{currentTemp.toFixed(1)}°C</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">ΔT</span><span>{tempChange.toFixed(1)}°C</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{isExo ? "Exothermic" : "Endothermic"}</span></div>
      </div>}
    />
  );
}
