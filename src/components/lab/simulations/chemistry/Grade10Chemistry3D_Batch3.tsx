import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom, Beaker3D } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ═══ c10-12 Electrochemical Cell (Zn-Cu) 3D ═══ */
export function ElectrochemicalCell3D() {
  const [connected, setConnected] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const voltage = connected ? 1.10 : 0;
  const znLoss = connected ? Math.min(time * 0.5, 15) : 0;
  const cuGain = connected ? Math.min(time * 0.4, 12) : 0;
  const reset = () => { setConnected(false); setTime(0); setStep(0); };
  const steps = ["Prepare ZnSO₄ & CuSO₄", "Insert electrodes", "Add salt bridge", "Connect voltmeter", "Observe voltage", "Record e⁻ flow"];
  return (
    <Simulation3DLayout title="Electrochemical Cell (Zn-Cu)" objective="Build galvanic cell and measure voltage"
      theory="Zn oxidized at anode, Cu²⁺ reduced at cathode. E°=1.10V." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <Button size="sm" className="w-full text-xs" variant={connected ? "default" : "outline"} onClick={() => setConnected(!connected)}>
          {connected ? "⚡ Connected" : "Connect Circuit"}
        </Button>
        {connected && <div><label className="text-xs text-muted-foreground">Time: {time}s</label><Slider value={[time]} onValueChange={v => setTime(v[0])} min={0} max={30} step={1} /></div>}
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          {/* Zn half-cell */}
          <group position={[-0.6, -0.2, 0]}>
            <Beaker3D position={[0, 0, 0]} scale={1.2} liquidColor="#aabbcc" liquidLevel={0.5} />
            <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.06, 0.4 - znLoss * 0.015, 0.02]} /><meshStandardMaterial color="#aaa" metalness={0.8} /></mesh>
            <Text position={[0, -0.45, 0]} fontSize={0.05} color="#888">Zn | ZnSO₄</Text>
            <Text position={[0, 0.35, 0]} fontSize={0.04} color="#ff4444">Anode (−)</Text>
          </group>
          {/* Cu half-cell */}
          <group position={[0.6, -0.2, 0]}>
            <Beaker3D position={[0, 0, 0]} scale={1.2} liquidColor="#4488ff" liquidLevel={0.5} />
            <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.06, 0.35 + cuGain * 0.01, 0.02]} /><meshStandardMaterial color="#b87333" metalness={0.8} /></mesh>
            <Text position={[0, -0.45, 0]} fontSize={0.05} color="#888">Cu | CuSO₄</Text>
            <Text position={[0, 0.35, 0]} fontSize={0.04} color="#4488ff">Cathode (+)</Text>
          </group>
          {/* Salt bridge */}
          <mesh position={[0, 0.15, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
            <meshStandardMaterial color="#ddcc88" />
          </mesh>
          <Text position={[0, 0.25, 0]} fontSize={0.04} color="#888">Salt Bridge</Text>
          {/* Voltmeter */}
          {connected && (
            <group position={[0, 0.7, 0]}>
              <mesh><cylinderGeometry args={[0.12, 0.12, 0.03, 24]} /><meshStandardMaterial color="#eee" /></mesh>
              <Text position={[0, 0, 0.02]} fontSize={0.08} color="#333">{voltage.toFixed(2)}V</Text>
              {/* Wires */}
              <line><bufferGeometry><bufferAttribute attach="attributes-position" count={2} array={new Float32Array([-0.6, -0.65, 0, -0.12, 0, 0])} itemSize={3} /></bufferGeometry><lineBasicMaterial color="#ff4444" /></line>
              <line><bufferGeometry><bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0.6, -0.65, 0, 0.12, 0, 0])} itemSize={3} /></bufferGeometry><lineBasicMaterial color="#4444ff" /></line>
            </group>
          )}
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Voltage</span><span>{voltage.toFixed(2)} V</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Zn lost</span><span>{znLoss.toFixed(1)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Cu gain</span><span>{cuGain.toFixed(1)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">e⁻ flow</span><span>{connected ? "Zn→Cu" : "—"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-13 Electrolysis of Water 3D ═══ */
export function ElectrolysisWater3D() {
  const [voltage, setVoltage] = useState(0);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const isRunning = voltage >= 2;
  const h2 = isRunning ? Math.min(time * 2, 100) : 0;
  const o2 = isRunning ? Math.min(time, 50) : 0;
  const reset = () => { setVoltage(0); setTime(0); setStep(0); };
  const steps = ["Set up electrodes", "Add electrolyte", "Set voltage ≥2V", "Observe bubbles", "Note 2:1 ratio", "Record observations"];
  return (
    <Simulation3DLayout title="Electrolysis of Water" objective="Decompose water into H₂ and O₂"
      theory="2H₂O → 2H₂ + O₂. H₂ at cathode (2x volume), O₂ at anode." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <div><label className="text-xs text-muted-foreground">Voltage: {voltage} V</label><Slider value={[voltage]} onValueChange={v => setVoltage(v[0])} min={0} max={12} step={0.5} /></div>
        {isRunning && <div><label className="text-xs text-muted-foreground">Time: {time}s</label><Slider value={[time]} onValueChange={v => setTime(v[0])} min={0} max={60} step={1} /></div>}
        {voltage > 0 && voltage < 2 && <p className="text-[10px] text-destructive">⚠️ Need ≥2V</p>}
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          {/* Water container */}
          <mesh position={[0, -0.1, 0]}><boxGeometry args={[1.2, 0.8, 0.5]} /><meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.2, 0]}><boxGeometry args={[1.18, 0.5, 0.48]} /><meshStandardMaterial color="#4488ff" transparent opacity={0.3} /></mesh>
          {/* H₂ tube (left) */}
          <group position={[-0.3, 0.2, 0]}>
            <mesh><cylinderGeometry args={[0.06, 0.06, 0.5, 12, 1, true]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
            {h2 > 0 && <mesh position={[0, 0.25 - h2 / 100 * 0.25, 0]}><cylinderGeometry args={[0.055, 0.055, h2 / 100 * 0.5, 12]} /><meshStandardMaterial color="#ddeeff" transparent opacity={0.15} /></mesh>}
            <Text position={[0, 0.3, 0.07]} fontSize={0.06} color="#888">H₂</Text>
            <Text position={[0, -0.3, 0.07]} fontSize={0.04} color="#888">(−)</Text>
          </group>
          {/* O₂ tube (right) */}
          <group position={[0.3, 0.2, 0]}>
            <mesh><cylinderGeometry args={[0.06, 0.06, 0.5, 12, 1, true]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
            {o2 > 0 && <mesh position={[0, 0.25 - o2 / 100 * 0.25, 0]}><cylinderGeometry args={[0.055, 0.055, o2 / 100 * 0.5, 12]} /><meshStandardMaterial color="#ddeeff" transparent opacity={0.15} /></mesh>}
            <Text position={[0, 0.3, 0.07]} fontSize={0.06} color="#888">O₂</Text>
            <Text position={[0, -0.3, 0.07]} fontSize={0.04} color="#888">(+)</Text>
          </group>
          {/* Bubbles */}
          {isRunning && Array.from({ length: 4 }, (_, i) => (
            <mesh key={`h${i}`} position={[-0.3 + (Math.random() - 0.5) * 0.05, -0.1 + i * 0.08, 0]}>
              <sphereGeometry args={[0.01, 6, 6]} /><meshStandardMaterial color="#fff" transparent opacity={0.4} />
            </mesh>
          ))}
          {isRunning && Array.from({ length: 2 }, (_, i) => (
            <mesh key={`o${i}`} position={[0.3 + (Math.random() - 0.5) * 0.05, -0.1 + i * 0.08, 0]}>
              <sphereGeometry args={[0.01, 6, 6]} /><meshStandardMaterial color="#fff" transparent opacity={0.4} />
            </mesh>
          ))}
          <Text position={[0, 0.7, 0]} fontSize={0.08} color="#888">H₂ : O₂ = 2 : 1</Text>
          {/* Power supply */}
          <group position={[0, -0.65, 0]}>
            <mesh><boxGeometry args={[0.4, 0.1, 0.15]} /><meshStandardMaterial color="#444" /></mesh>
            <Text position={[0, 0, 0.08]} fontSize={0.05} color="#44ff44">{voltage}V ⚡</Text>
          </group>
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Voltage</span><span>{voltage} V</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">H₂</span><span>{h2.toFixed(0)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">O₂</span><span>{o2.toFixed(0)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Ratio</span><span>{o2 > 0 ? `${(h2 / o2).toFixed(1)}:1` : "—"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-14 Reactivity Series 3D ═══ */
export function ReactivitySeries3D() {
  const [metal, setMetal] = useState("magnesium");
  const [acidAdded, setAcidAdded] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const reactivity: Record<string, { rate: number; label: string }> = {
    magnesium: { rate: 4, label: "Very vigorous" }, zinc: { rate: 3, label: "Vigorous" }, iron: { rate: 1.5, label: "Slow" }, copper: { rate: 0, label: "No reaction" },
  };
  const { rate, label } = reactivity[metal];
  const reset = () => { setAcidAdded(false); setStep(0); };
  const steps = ["Select metal", "Add HCl", "Observe bubbles", "Compare rates", "Order by reactivity"];
  return (
    <Simulation3DLayout title="Metal Reactivity Series" objective="Compare reactivity of metals with acid"
      theory="Mg > Zn > Fe > Cu. Cu doesn't react with dilute HCl." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-2">
        {Object.keys(reactivity).map(m => (
          <label key={m} className="flex items-center gap-2 text-xs capitalize"><input type="radio" name="m" checked={metal === m} onChange={() => { setMetal(m); setAcidAdded(false); }} />{m}</label>
        ))}
        <Button size="sm" className="w-full text-xs" onClick={() => setAcidAdded(true)} disabled={acidAdded}>{acidAdded ? "Added ✅" : "Add HCl"}</Button>
        <div className="p-2 bg-muted/50 rounded text-xs space-y-0.5">
          {["Mg", "Zn", "Fe", "Cu"].map(m => (
            <div key={m} className="flex items-center gap-1">
              <div className="h-1 rounded-full" style={{ width: `${(reactivity[m.toLowerCase() === "mg" ? "magnesium" : m.toLowerCase() === "zn" ? "zinc" : m.toLowerCase() === "fe" ? "iron" : "copper"]?.rate || 0) * 25}%`, backgroundColor: metal.startsWith(m.toLowerCase()) ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />
              <span className="text-[10px] text-muted-foreground">{m}</span>
            </div>
          ))}
        </div>
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          <Beaker3D position={[0, -0.1, 0]} scale={1.8} liquidColor="#aaffaa" liquidLevel={0.6} />
          <mesh position={[0, -0.15, 0]} castShadow><boxGeometry args={[0.05, 0.1, 0.03]} /><meshStandardMaterial color={metal === "copper" ? "#b87333" : "#999"} metalness={0.8} /></mesh>
          {acidAdded && rate > 0 && Array.from({ length: Math.floor(rate * 3) }, (_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 0.08, -0.1 + i * 0.05, (Math.random() - 0.5) * 0.08]}>
              <sphereGeometry args={[0.006 + rate * 0.002, 6, 6]} /><meshStandardMaterial color="#fff" transparent opacity={0.4} />
            </mesh>
          ))}
          <Text position={[0, 0.7, 0]} fontSize={0.08} color="#888">{acidAdded ? label : "Add acid"}</Text>
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Metal</span><span className="capitalize">{metal}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span>{label}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Bubbles</span><span>{acidAdded && rate > 0 ? "H₂↑" : "None"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-15 Metal Extraction 3D ═══ */
export function MetalExtraction3D() {
  const [temp, setTemp] = useState(500);
  const [carbonAdded, setCarbonAdded] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const progress = carbonAdded && temp >= 800 ? Math.min((temp - 800) / 700, 1) : 0;
  const reset = () => { setTemp(500); setCarbonAdded(false); setStep(0); };
  const steps = ["Heat furnace", "Add carbon", "Reach 800°C+", "Observe reduction", "Collect metal"];
  return (
    <Simulation3DLayout title="Metal Extraction (Reduction)" objective="Reduce metal oxide using carbon"
      theory="2Fe₂O₃ + 3C → 4Fe + 3CO₂. High temp needed." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <div><label className="text-xs text-muted-foreground">Temp: {temp}°C</label><Slider value={[temp]} onValueChange={v => setTemp(v[0])} min={200} max={1500} step={50} /></div>
        <Button size="sm" className="w-full text-xs" onClick={() => setCarbonAdded(true)} disabled={carbonAdded}>{carbonAdded ? "Carbon ✅" : "Add Carbon"}</Button>
        {carbonAdded && temp < 800 && <p className="text-[10px] text-destructive">⚠️ Need ≥800°C</p>}
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          {/* Furnace */}
          <mesh position={[0, 0, 0]}><boxGeometry args={[0.8, 0.6, 0.5]} /><meshStandardMaterial color="#555" /></mesh>
          <mesh position={[0, 0, 0]}><boxGeometry args={[0.6, 0.45, 0.35]} /><meshStandardMaterial color={temp > 800 ? "#ff4422" : "#888"} emissive={temp > 800 ? "#ff2200" : "#000"} emissiveIntensity={Math.min(temp / 1500, 0.8)} /></mesh>
          {/* Ore */}
          <mesh position={[-0.1, -0.1, 0]}><boxGeometry args={[0.15, 0.1, 0.1]} /><meshStandardMaterial color="#8B4513" transparent opacity={1 - progress * 0.5} /></mesh>
          {carbonAdded && <mesh position={[0.1, -0.1, 0]}><boxGeometry args={[0.1, 0.08, 0.08]} /><meshStandardMaterial color="#222" transparent opacity={1 - progress} /></mesh>}
          {progress > 0.5 && <mesh position={[0, -0.5, 0]}><boxGeometry args={[0.15, 0.06, 0.1]} /><meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} /></mesh>}
          {progress > 0.5 && <Text position={[0, -0.6, 0]} fontSize={0.06} color="#44ff44">Iron extracted!</Text>}
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span>{temp}°C</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Carbon</span><span>{carbonAdded ? "✅" : "—"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Reduction</span><span>{(progress * 100).toFixed(0)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span>{progress > 0.5 ? "Fe" : "—"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-16 Hydrocarbon Combustion 3D ═══ */
export function HydrocarbonCombustion3D() {
  const [airControl, setAirControl] = useState(100);
  const [lit, setLit] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const isComplete = airControl >= 70;
  const flameColor = isComplete ? "#4488ff" : "#eebb00";
  const sootLevel = isComplete ? 0 : Math.round((70 - airControl) / 7);
  const reset = () => { setLit(false); setAirControl(100); setStep(0); };
  const steps = ["Light burner", "Observe flame color", "Adjust air inlet", "Observe soot", "Record observations"];
  return (
    <Simulation3DLayout title="Hydrocarbon Combustion" objective="Compare complete vs incomplete combustion"
      theory="Complete: CH₄+2O₂→CO₂+2H₂O (blue). Incomplete: 2CH₄+3O₂→2CO+4H₂O (yellow, soot)." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <Button size="sm" className="w-full text-xs" variant={lit ? "destructive" : "default"} onClick={() => setLit(!lit)}>{lit ? "🔥 Extinguish" : "Light Burner"}</Button>
        <div><label className="text-xs text-muted-foreground">Air: {airControl}%</label><Slider value={[airControl]} onValueChange={v => setAirControl(v[0])} min={0} max={100} step={5} /></div>
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          {/* Bunsen burner */}
          <group position={[0, -0.3, 0]}>
            <mesh><cylinderGeometry args={[0.06, 0.1, 0.3, 16]} /><meshStandardMaterial color="#555" metalness={0.6} /></mesh>
            <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.03, 0.03, 0.06, 8]} /><meshStandardMaterial color="#666" /></mesh>
          </group>
          {/* Flame */}
          {lit && <mesh position={[0, 0.05, 0]}>
            <coneGeometry args={[0.04, 0.2 + airControl * 0.001, 8]} />
            <meshStandardMaterial color={flameColor} emissive={flameColor} emissiveIntensity={0.8} transparent opacity={0.7} />
          </mesh>}
          {/* Glass plate */}
          {lit && <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[0.3, 0.2]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.3} /></mesh>}
          {/* Soot */}
          {lit && sootLevel > 0 && Array.from({ length: sootLevel }, (_, i) => (
            <mesh key={i} position={[(i - sootLevel / 2) * 0.03, 0.29, 0]}><sphereGeometry args={[0.008, 6, 6]} /><meshStandardMaterial color="#111" /></mesh>
          ))}
          <Text position={[0, 0.7, 0]} fontSize={0.08} color={flameColor}>{lit ? (isComplete ? "Complete (Blue)" : "Incomplete (Yellow)") : "Off"}</Text>
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Flame</span><span>{lit ? (isComplete ? "Blue" : "Yellow") : "Off"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Air</span><span>{airControl}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Soot</span><span>{sootLevel > 0 ? `Level ${sootLevel}` : "None"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{isComplete ? "Complete" : "Incomplete"}</span></div>
      </div>}
    />
  );
}

/* ═══ c10-17 Bromine Test for Unsaturation 3D ═══ */
export function BromineTest3D() {
  const [sample, setSample] = useState<"alkene" | "alkane">("alkene");
  const [bromineAdded, setBromineAdded] = useState(false);
  const [shaken, setShaken] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();
  const decolorized = sample === "alkene" && bromineAdded && shaken;
  const reset = () => { setBromineAdded(false); setShaken(false); setStep(0); };
  const steps = ["Select sample", "Add bromine water", "Shake test tube", "Observe color change", "Record result"];
  return (
    <Simulation3DLayout title="Bromine Test for Unsaturation" objective="Test for C=C double bonds"
      theory="Alkenes decolorize bromine (addition). Alkanes don't react." onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={<div className="space-y-3">
        <label className="flex items-center gap-2 text-xs"><input type="radio" name="s" checked={sample === "alkene"} onChange={() => { setSample("alkene"); reset(); }} />Ethene (C=C)</label>
        <label className="flex items-center gap-2 text-xs"><input type="radio" name="s" checked={sample === "alkane"} onChange={() => { setSample("alkane"); reset(); }} />Ethane (C-C)</label>
        <Button size="sm" className="w-full text-xs" onClick={() => setBromineAdded(true)} disabled={bromineAdded}>{bromineAdded ? "Br₂ Added ✅" : "Add Bromine"}</Button>
        {bromineAdded && <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setShaken(true)} disabled={shaken}>{shaken ? "Shaken ✅" : "Shake"}</Button>}
      </div>}
      canvas3D={
        <group>
          <LabRoom />
          {/* Test tube */}
          <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.08, 0.07, 0.5, 12, 1, true]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.07, 0.065, 0.25, 12]} />
            <meshStandardMaterial color={!bromineAdded ? "#aabbcc" : decolorized ? "#cccccc" : "#884400"} transparent opacity={0.6} />
          </mesh>
          {/* Molecular view */}
          {sample === "alkene" && (
            <group position={[-0.6, 0.2, 0]}>
              <mesh position={[-0.06, 0, 0]}><sphereGeometry args={[0.04, 12, 12]} /><meshStandardMaterial color="#333" /></mesh>
              <mesh position={[0.06, 0, 0]}><sphereGeometry args={[0.04, 12, 12]} /><meshStandardMaterial color="#333" /></mesh>
              {/* Double bond lines */}
              <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.08, 0.005, 0.005]} /><meshStandardMaterial color="#44ff44" /></mesh>
              <mesh position={[0, -0.02, 0]}><boxGeometry args={[0.08, 0.005, 0.005]} /><meshStandardMaterial color="#44ff44" /></mesh>
              <Text position={[0, -0.08, 0]} fontSize={0.04} color="#44ff44">C=C</Text>
            </group>
          )}
          {/* Bromine bottle */}
          <group position={[0.5, -0.1, 0]}>
            <mesh><cylinderGeometry args={[0.05, 0.06, 0.25, 12]} /><meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>
            <mesh position={[0, -0.03, 0]}><cylinderGeometry args={[0.045, 0.055, 0.15, 12]} /><meshStandardMaterial color="#884400" transparent opacity={0.5} /></mesh>
            <Text position={[0, -0.2, 0.06]} fontSize={0.04} color="#888">Br₂</Text>
          </group>
          <Text position={[0, 0.7, 0]} fontSize={0.07} color={decolorized ? "#44ff44" : "#888"}>
            {!bromineAdded ? "Add bromine" : !shaken ? "Shake to mix" : decolorized ? "✓ Decolorized!" : "✗ Still brown"}
          </Text>
        </group>
      }
      liveData={<div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Sample</span><span>{sample === "alkene" ? "Ethene" : "Ethane"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Bond</span><span>{sample === "alkene" ? "C=C" : "C-C"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Bromine</span><span>{!bromineAdded ? "—" : decolorized ? "Decolorized ✓" : "Brown"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Result</span><span>{shaken ? (decolorized ? "Unsaturated" : "Saturated") : "—"}</span></div>
      </div>}
    />
  );
}
