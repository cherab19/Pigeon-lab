import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";

/* ==================== 6. Electrolysis & Metal Deposition 3D ==================== */

function ElectrolysisScene({ voltage, massCu }: { voltage: number; massCu: number }) {
  const bubblesRef = useRef<THREE.Group>(null);
  const current = voltage > 1.5 ? (voltage - 1.5) * 0.5 : 0;

  useFrame(({ clock }) => {
    if (!bubblesRef.current || current <= 0) return;
    const t = clock.elapsedTime;
    bubblesRef.current.children.forEach((child, i) => {
      child.visible = current > 0;
      child.position.y = -0.3 + ((t * 0.5 + i * 0.2) % 0.8);
      child.position.x = -0.3 + Math.sin(i * 2.3) * 0.05;
    });
  });

  return (
    <group>
      <LabRoom />
      {/* Electrolytic cell / beaker */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.4, 0.35, 0.8, 32, 1, true]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* CuSO4 solution */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.38, 0.33, 0.45, 32]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
      </mesh>
      {/* Cathode (left) */}
      <mesh position={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.03, 0.5, 0.2]} />
        <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.1} />
      </mesh>
      <Text position={[-0.2, 0.35, 0]} fontSize={0.05} color="gray">Cathode (−)</Text>
      {/* Cu deposit on cathode */}
      {massCu > 0 && (
        <mesh position={[-0.18, -0.1, 0]}>
          <boxGeometry args={[0.02, Math.min(0.4, massCu * 5), 0.18]} />
          <meshStandardMaterial color="#c87533" metalness={0.95} roughness={0.05} />
        </mesh>
      )}
      {/* Anode (right) */}
      <mesh position={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.03, 0.5, 0.2]} />
        <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.1} />
      </mesh>
      <Text position={[0.2, 0.35, 0]} fontSize={0.05} color="gray">Anode (+)</Text>
      {/* Wires */}
      <Line points={[[-0.2, 0.25, 0], [-0.2, 0.6, 0], [0.2, 0.6, 0], [0.2, 0.25, 0]]} color="#ef4444" lineWidth={2} />
      {/* Battery */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Text position={[0, 0.7, 0.06]} fontSize={0.05} color="#22c55e">{voltage.toFixed(1)}V</Text>
      {/* Bubbles at anode */}
      <group ref={bubblesRef} position={[0.2, 0, 0]}>
        {Array.from({ length: 6 }, (_, i) => (
          <Sphere key={i} args={[0.015, 8, 8]}>
            <meshStandardMaterial color="white" transparent opacity={0.4} />
          </Sphere>
        ))}
      </group>
      {/* Ion flow arrows */}
      {current > 0 && <>
        <Text position={[0, -0.1, 0.35]} fontSize={0.04} color="#3b82f6">Cu²⁺ → Cathode</Text>
        <Line points={[[0.1, -0.1, 0.3], [-0.1, -0.1, 0.3]]} color="#3b82f6" lineWidth={1} />
      </>}
    </group>
  );
}

export function ElectrolysisMetal3D() {
  const [voltage, setVoltage] = useState(0);
  const [time, setTime] = useState(0);
  const sound = useSoundEffects();

  const current = voltage > 1.5 ? (voltage - 1.5) * 0.5 : 0;
  const charge = current * time * 60;
  const massCu = (charge / 96485) * (63.5 / 2);

  const reset = () => { setVoltage(0); setTime(0); };
  const steps = ["Prepare CuSO₄ cell", "Insert Cu electrodes", "Connect to DC supply", "Weigh cathode", "Set voltage > 1.5V", "Allow current to flow", "Observe Cu deposit", "Weigh cathode again", "Calculate mass deposited"];

  return (
    <Simulation3DLayout
      title="Electrolysis & Metal Deposition"
      objective="Observe copper electroplating via electrolysis"
      theory="Cu²⁺ ions gain electrons at cathode → Cu deposit. m = (Q/F) × (M/z). Faraday's law of electrolysis."
      onReset={reset} steps={steps} currentStep={voltage > 1.5 ? 6 : 0}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Voltage: {voltage.toFixed(1)} V</label>
            <Slider value={[voltage]} onValueChange={([v]) => { setVoltage(v); sound.playClick(); }} min={0} max={6} step={0.5} /></div>
          <div><label className="text-xs text-muted-foreground">Time: {time} min</label>
            <Slider value={[time]} onValueChange={([v]) => { setTime(v); sound.playClick(); }} min={0} max={60} step={5} /></div>
        </div>
      }
      canvas3D={<ElectrolysisScene voltage={voltage} massCu={massCu} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Voltage</span><span className="font-mono">{voltage.toFixed(1)} V</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Current</span><span className="font-mono">{current.toFixed(2)} A</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Charge</span><span className="font-mono">{charge.toFixed(0)} C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Mass Cu</span><span className="font-mono">{massCu.toFixed(4)} g</span></div>
        </div>
      }
    />
  );
}

/* ==================== 7. Voltaic Cell 3D ==================== */

function VoltaicCellScene({ znConc, cuConc }: { znConc: number; cuConc: number }) {
  return (
    <group>
      <LabRoom />
      {/* Left beaker - Zn */}
      <group position={[-0.7, -0.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.22, 0.6, 32, 1, true]} />
          <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.23, 0.2, 0.35, 32]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.3} />
        </mesh>
        {/* Zn electrode */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.04, 0.5, 0.15]} />
          <meshStandardMaterial color="#a8a8a8" metalness={0.9} roughness={0.1} />
        </mesh>
        <Text position={[0, 0.45, 0]} fontSize={0.06} color="white" fontWeight="bold">Zn</Text>
        <Text position={[0, -0.45, 0]} fontSize={0.04} color="gray">ZnSO₄ ({znConc.toFixed(2)}M)</Text>
        <Text position={[0, -0.55, 0]} fontSize={0.04} color="#f97316">Anode (oxidation)</Text>
      </group>
      {/* Right beaker - Cu */}
      <group position={[0.7, -0.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.22, 0.6, 32, 1, true]} />
          <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.23, 0.2, 0.35, 32]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
        </mesh>
        {/* Cu electrode */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.04, 0.5, 0.15]} />
          <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.1} />
        </mesh>
        <Text position={[0, 0.45, 0]} fontSize={0.06} color="white" fontWeight="bold">Cu</Text>
        <Text position={[0, -0.45, 0]} fontSize={0.04} color="gray">CuSO₄ ({cuConc.toFixed(2)}M)</Text>
        <Text position={[0, -0.55, 0]} fontSize={0.04} color="#3b82f6">Cathode (reduction)</Text>
      </group>
      {/* Salt bridge */}
      <Line points={[[-0.4, 0.1, 0], [-0.2, 0.4, 0], [0.2, 0.4, 0], [0.4, 0.1, 0]]} color="gray" lineWidth={3} />
      <Text position={[0, 0.5, 0]} fontSize={0.05} color="gray">Salt Bridge</Text>
      {/* Wire connection */}
      <Line points={[[-0.7, 0.35, 0], [-0.7, 0.7, 0], [0.7, 0.7, 0], [0.7, 0.35, 0]]} color="#ef4444" lineWidth={2} />
      {/* Voltmeter */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <Text position={[0, 0.85, 0.06]} fontSize={0.04} color="#22c55e">Voltmeter</Text>
      {/* Half-reactions */}
      <Text position={[-0.7, -0.7, 0.3]} fontSize={0.04} color="#f97316">Zn → Zn²⁺ + 2e⁻</Text>
      <Text position={[0.7, -0.7, 0.3]} fontSize={0.04} color="#3b82f6">Cu²⁺ + 2e⁻ → Cu</Text>
    </group>
  );
}

export function VoltaicCell3D() {
  const [znConc, setZnConc] = useState(1);
  const [cuConc, setCuConc] = useState(1);
  const sound = useSoundEffects();

  const E0 = 1.10;
  const nernst = E0 - (0.0257 / 2) * Math.log(znConc / cuConc);

  const reset = () => { setZnConc(1); setCuConc(1); };
  const steps = ["Set up Zn and Cu half-cells", "Insert electrodes", "Connect salt bridge", "Connect voltmeter", "Measure E°cell", "Adjust [Zn²⁺]", "Adjust [Cu²⁺]", "Calculate Nernst E", "Record observations"];

  return (
    <Simulation3DLayout
      title="Voltaic (Galvanic) Cell"
      objective="Measure cell potential using Zn-Cu electrochemical cell"
      theory="E°cell = E°cathode − E°anode = 0.34 − (−0.76) = 1.10 V. Nernst: E = E° − (RT/nF)ln(Q)."
      onReset={reset} steps={steps} currentStep={znConc !== 1 || cuConc !== 1 ? 6 : 0}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">[Zn²⁺]: {znConc.toFixed(2)} M</label>
            <Slider value={[znConc]} onValueChange={([v]) => { setZnConc(v); sound.playClick(); }} min={0.01} max={2} step={0.01} /></div>
          <div><label className="text-xs text-muted-foreground">[Cu²⁺]: {cuConc.toFixed(2)} M</label>
            <Slider value={[cuConc]} onValueChange={([v]) => { setCuConc(v); sound.playClick(); }} min={0.01} max={2} step={0.01} /></div>
        </div>
      }
      canvas3D={<VoltaicCellScene znConc={znConc} cuConc={cuConc} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">E° cell</span><span className="font-mono">{E0.toFixed(2)} V</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">E (Nernst)</span><span className="font-mono">{nernst.toFixed(3)} V</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">[Zn²⁺]</span><span className="font-mono">{znConc.toFixed(2)} M</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">[Cu²⁺]</span><span className="font-mono">{cuConc.toFixed(2)} M</span></div>
        </div>
      }
    />
  );
}

/* ==================== 8. Haber Process 3D ==================== */

function HaberScene({ pressure, temp, catalyst, yieldPct }: { pressure: number; temp: number; catalyst: boolean; yieldPct: number }) {
  const particlesRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    const t = clock.elapsedTime;
    particlesRef.current.children.forEach((child, i) => {
      const progress = ((t * 0.3 + i * 0.4) % 3) / 3;
      child.position.x = -1.5 + progress * 3;
      child.position.y = Math.sin(t * 2 + i) * 0.1;
    });
  });

  return (
    <group>
      <LabRoom />
      {/* Inlet tank */}
      <mesh position={[-1.2, 0, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.5} />
      </mesh>
      <Text position={[-1.2, 0.1, 0.16]} fontSize={0.05} color="white">N₂ + 3H₂</Text>
      {/* Compressor */}
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.25]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
      <Text position={[-0.5, 0.2, 0]} fontSize={0.04} color="gray">{pressure} atm</Text>
      {/* Reactor */}
      <mesh position={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.7, 16]} />
        <meshStandardMaterial color="#f97316" transparent opacity={0.4} />
      </mesh>
      <Text position={[0.2, 0.45, 0]} fontSize={0.05} color="white" fontWeight="bold">Reactor</Text>
      <Text position={[0.2, 0, 0.26]} fontSize={0.04} color="white">{temp}°C</Text>
      {catalyst && <Text position={[0.2, -0.15, 0.26]} fontSize={0.04} color="#22c55e">Fe catalyst</Text>}
      {/* Output */}
      <mesh position={[1.2, 0, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.5} />
      </mesh>
      <Text position={[1.2, 0.1, 0.16]} fontSize={0.06} color="white" fontWeight="bold">NH₃</Text>
      <Text position={[1.2, -0.05, 0.16]} fontSize={0.08} color="white">{yieldPct.toFixed(0)}%</Text>
      {/* Flow particles */}
      <group ref={particlesRef}>
        {Array.from({ length: 8 }, (_, i) => (
          <Sphere key={i} args={[0.025, 8, 8]}>
            <meshStandardMaterial color={i < 4 ? "#3b82f6" : "#22c55e"} emissive={i < 4 ? "#3b82f6" : "#22c55e"} emissiveIntensity={0.3} />
          </Sphere>
        ))}
      </group>
      {/* Pipes */}
      <Line points={[[-1, 0, 0], [-0.65, 0, 0]]} color="gray" lineWidth={2} />
      <Line points={[[-0.35, 0, 0], [-0.05, 0, 0]]} color="gray" lineWidth={2} />
      <Line points={[[0.45, 0, 0], [1, 0, 0]]} color="gray" lineWidth={2} />
      {/* Yield bar */}
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[2, 0.08, 0.05]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-1 + (yieldPct / 60), -0.7, 0]}>
        <boxGeometry args={[yieldPct / 30, 0.08, 0.06]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

export function HaberProcess3D() {
  const [pressure, setPressure] = useState(200);
  const [temp, setTemp] = useState(450);
  const [catalyst, setCatalyst] = useState(true);
  const sound = useSoundEffects();

  const yieldBase = 15;
  const pressureEffect = (pressure / 200) * 20;
  const tempEffect = -((temp - 400) / 100) * 8;
  const catEffect = catalyst ? 5 : 0;
  const yieldPct = Math.max(2, Math.min(60, yieldBase + pressureEffect + tempEffect + catEffect));
  const rate = (1 + (temp - 300) / 200) * (catalyst ? 3 : 1);

  const reset = () => { setPressure(200); setTemp(450); setCatalyst(true); };
  const steps = ["Set N₂/H₂ inlet", "Adjust pressure", "Set temperature", "Toggle Fe catalyst", "Observe NH₃ yield", "Increase pressure", "Decrease temperature", "Note yield vs rate tradeoff", "Record optimal conditions"];

  return (
    <Simulation3DLayout
      title="Haber Process"
      objective="Optimize industrial NH₃ production: N₂ + 3H₂ ⇌ 2NH₃"
      theory="High pressure favors product. Low temp favors product but slows rate. Fe catalyst increases rate without shifting equilibrium."
      onReset={reset} steps={steps} currentStep={pressure !== 200 || temp !== 450 ? 5 : 0}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Pressure: {pressure} atm</label>
            <Slider value={[pressure]} onValueChange={([v]) => { setPressure(v); sound.playClick(); }} min={50} max={500} step={10} /></div>
          <div><label className="text-xs text-muted-foreground">Temperature: {temp}°C</label>
            <Slider value={[temp]} onValueChange={([v]) => { setTemp(v); sound.playClick(); }} min={300} max={600} step={10} /></div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={catalyst} onChange={e => { setCatalyst(e.target.checked); sound.playClick(); }} className="rounded" />
            Iron Catalyst (Fe)
          </label>
        </div>
      }
      canvas3D={<HaberScene pressure={pressure} temp={temp} catalyst={catalyst} yieldPct={yieldPct} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Yield</span><span className="font-mono">{yieldPct.toFixed(1)}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span className="font-mono">{rate.toFixed(1)}×</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Pressure</span><span className="font-mono">{pressure} atm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span className="font-mono">{temp}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Catalyst</span><span className="font-mono">{catalyst ? "Fe ✅" : "No"}</span></div>
        </div>
      }
    />
  );
}

/* ==================== 9. Addition Polymerization 3D ==================== */

function PolymerScene({ monomers, reacted }: { monomers: number; reacted: number }) {
  return (
    <group>
      <LabRoom />
      {/* Unreacted monomers */}
      <Text position={[-0.8, 0.8, 0]} fontSize={0.06} color="gray">Monomers (CH₂=CH₂)</Text>
      {Array.from({ length: Math.min(monomers - reacted, 12) }, (_, i) => (
        <group key={`m${i}`} position={[-0.8 + (i % 4) * 0.3, 0.3 - Math.floor(i / 4) * 0.3, 0]}>
          <Sphere args={[0.08, 8, 8]}>
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} />
          </Sphere>
          <Text position={[0, 0, 0.1]} fontSize={0.04} color="white">=</Text>
        </group>
      ))}
      {/* Polymer chain */}
      {reacted > 0 && (
        <group position={[0, -0.4, 0]}>
          <Text position={[0, 0.3, 0]} fontSize={0.06} color="white" fontWeight="bold">Polymer Chain</Text>
          {Array.from({ length: Math.min(reacted, 20) }, (_, i) => {
            const x = -0.8 + i * 0.08;
            return (
              <group key={`p${i}`}>
                <Sphere args={[0.04, 8, 8]} position={[x, 0, 0]}>
                  <meshStandardMaterial color="#22c55e" />
                </Sphere>
                {i > 0 && <Line points={[[x - 0.08, 0, 0], [x, 0, 0]]} color="#22c55e" lineWidth={2} />}
              </group>
            );
          })}
          <Text position={[0, -0.2, 0]} fontSize={0.06} color="white">n = {reacted}</Text>
        </group>
      )}
      <Text position={[0, -0.9, 0]} fontSize={0.05} color="gray">n(CH₂=CH₂) → −(CH₂−CH₂)ₙ−</Text>
    </group>
  );
}

export function AdditionPolymerization3D() {
  const [monomers, setMonomers] = useState(10);
  const [temp, setTemp] = useState(100);
  const [initiator, setInitiator] = useState(true);
  const sound = useSoundEffects();

  const reacted = initiator ? Math.min(monomers, Math.round(monomers * (temp / 200) * 0.9)) : 0;
  const molWeight = reacted * 28;

  const reset = () => { setMonomers(10); setTemp(100); setInitiator(true); };
  const steps = ["Prepare ethene monomers", "Add initiator", "Set temperature", "Observe C=C breaking", "Watch C−C formation", "Polymer chain grows", "Check degree of poly", "Record properties"];

  return (
    <Simulation3DLayout
      title="Addition Polymerization"
      objective="Observe polymer chain formation from ethene monomers"
      theory="Unsaturated monomers join by breaking C=C double bonds. n(CH₂=CH₂) → −(CH₂−CH₂)ₙ−"
      onReset={reset} steps={steps} currentStep={reacted > 0 ? 5 : 0}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Monomers: {monomers}</label>
            <Slider value={[monomers]} onValueChange={([v]) => { setMonomers(v); sound.playClick(); }} min={2} max={50} step={1} /></div>
          <div><label className="text-xs text-muted-foreground">Temperature: {temp}°C</label>
            <Slider value={[temp]} onValueChange={([v]) => { setTemp(v); sound.playClick(); }} min={50} max={300} step={10} /></div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={initiator} onChange={e => { setInitiator(e.target.checked); sound.playClick(); }} className="rounded" />
            Add Initiator
          </label>
        </div>
      }
      canvas3D={<PolymerScene monomers={monomers} reacted={reacted} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Monomers</span><span className="font-mono">{monomers}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Reacted</span><span className="font-mono">{reacted}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Degree</span><span className="font-mono">{reacted}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Mol Wt</span><span className="font-mono">{molWeight} g/mol</span></div>
        </div>
      }
    />
  );
}

/* ==================== 10. Air Pollution & Acid Rain 3D ==================== */

function AcidRainScene({ emission, rainPH, damageIndex }: { emission: number; rainPH: number; damageIndex: number }) {
  const rainRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!rainRef.current) return;
    const t = clock.elapsedTime;
    rainRef.current.children.forEach((child, i) => {
      child.position.y = 1.5 - ((t * 2 + i * 0.3) % 3);
      child.visible = emission > 10;
    });
  });

  const treeColor = damageIndex > 60 ? "#a16207" : "#16a34a";
  const lakeColor = rainPH < 4 ? "#fbbf24" : "#3b82f6";

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      {/* Sky */}
      <mesh position={[0, 2, -3]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#93c5fd" />
      </mesh>
      {/* Factory */}
      <mesh position={[-2, -0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 2, 0.5]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      {/* Chimney */}
      <mesh position={[-2, 0.8, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.6, 8]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      {/* Smoke */}
      {emission > 0 && Array.from({ length: 5 }, (_, i) => (
        <Sphere key={`s${i}`} args={[0.1 + i * 0.05, 8, 8]} position={[-2 + i * 0.3, 1.2 + i * 0.2, 0]}>
          <meshStandardMaterial color="#9ca3af" transparent opacity={0.3 - i * 0.05} />
        </Sphere>
      ))}
      {/* Cloud */}
      <Sphere args={[0.5, 16, 16]} position={[0.5, 1.5, 0]}>
        <meshStandardMaterial color="#9ca3af" transparent opacity={0.4} />
      </Sphere>
      <Sphere args={[0.35, 16, 16]} position={[0, 1.6, 0]}>
        <meshStandardMaterial color="#9ca3af" transparent opacity={0.4} />
      </Sphere>
      <Text position={[0.3, 1.8, 0.4]} fontSize={0.06} color="white">pH {rainPH.toFixed(1)}</Text>
      {/* Rain */}
      <group ref={rainRef}>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[-0.5 + (i % 5) * 0.3, 1, (Math.floor(i / 5) - 0.5) * 0.3]}>
            <cylinderGeometry args={[0.005, 0.005, 0.1, 4]} />
            <meshStandardMaterial color={rainPH < 4 ? "#ef4444" : "#3b82f6"} />
          </mesh>
        ))}
      </group>
      {/* Tree */}
      <mesh position={[1, -1, 0.5]}>
        <cylinderGeometry args={[0.04, 0.06, 0.5, 6]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      <Sphere args={[0.2, 8, 8]} position={[1, -0.5, 0.5]}>
        <meshStandardMaterial color={treeColor} />
      </Sphere>
      {/* Lake */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.5, -1.48, -0.5]}>
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial color={lakeColor} transparent opacity={0.6} />
      </mesh>
      <Text position={[1.5, -1.3, -0.5]} fontSize={0.05} color="white">Lake pH {(rainPH + 0.5).toFixed(1)}</Text>
    </group>
  );
}

export function AirPollutionAcidRain3D() {
  const [emission, setEmission] = useState(50);
  const [windSpeed, setWindSpeed] = useState(10);
  const [temp, setTemp] = useState(25);
  const sound = useSoundEffects();

  const so2 = emission * 0.6;
  const no2 = emission * 0.4;
  const rainPH = Math.max(2, 5.6 - (emission / 100) * 3.5);
  const damageIndex = Math.min(100, ((5.6 - rainPH) / 3.5) * 100);

  const reset = () => { setEmission(50); setWindSpeed(10); setTemp(25); };
  const steps = ["Observe factory emissions", "Adjust emission level", "See atmospheric reactions", "Watch acid rain fall", "Measure rain pH", "Adjust wind speed", "Observe environmental effects", "Record damage index", "Suggest solutions"];

  return (
    <Simulation3DLayout
      title="Air Pollution & Acid Rain"
      objective="Investigate how emissions cause acid rain and environmental damage"
      theory="SO₂ + H₂O → H₂SO₃. NO₂ + H₂O → HNO₃. Acid rain (pH < 5.6) damages ecosystems."
      onReset={reset} steps={steps} currentStep={emission !== 50 ? 5 : 0}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Emission: {emission}%</label>
            <Slider value={[emission]} onValueChange={([v]) => { setEmission(v); sound.playClick(); }} min={0} max={100} step={5} /></div>
          <div><label className="text-xs text-muted-foreground">Wind: {windSpeed} km/h</label>
            <Slider value={[windSpeed]} onValueChange={([v]) => { setWindSpeed(v); sound.playClick(); }} min={0} max={30} step={1} /></div>
          <div><label className="text-xs text-muted-foreground">Temperature: {temp}°C</label>
            <Slider value={[temp]} onValueChange={([v]) => { setTemp(v); sound.playClick(); }} min={5} max={40} step={1} /></div>
        </div>
      }
      canvas3D={<AcidRainScene emission={emission} rainPH={rainPH} damageIndex={damageIndex} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Rain pH</span><span className="font-mono">{rainPH.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">SO₂</span><span className="font-mono">{so2.toFixed(0)} ppm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">NO₂</span><span className="font-mono">{no2.toFixed(0)} ppm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Damage</span><span className="font-mono">{damageIndex.toFixed(0)}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Wind</span><span className="font-mono">{windSpeed} km/h</span></div>
        </div>
      }
    />
  );
}
