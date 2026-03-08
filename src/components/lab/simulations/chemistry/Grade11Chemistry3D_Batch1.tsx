import { useState, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom, Beaker3D } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ==================== 1. Cathode Ray Tube 3D ==================== */

function CRTScene({ voltage, plateCharge, magneticField }: { voltage: number; plateCharge: string; magneticField: boolean }) {
  const beamRef = useRef<THREE.Group>(null);
  const beamOn = voltage > 500;
  const deflection = plateCharge === "pos" ? -0.3 : plateCharge === "neg" ? 0.3 : 0;
  const magDeflection = magneticField ? 0.2 : 0;
  const totalDeflect = deflection + magDeflection;

  useFrame((_, delta) => {
    if (beamRef.current) {
      beamRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <group>
      <LabRoom />
      {/* Tube body */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 3, 32, 1, true]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.15} transmission={0.8} roughness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* End caps */}
      <mesh position={[0, -1.5, 0]} rotation={[Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Cathode */}
      <mesh position={[0, -1.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
      </mesh>
      <Text position={[0, -1.45, 0.35]} fontSize={0.08} color="gray">Cathode (−)</Text>
      {/* Anode */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
      </mesh>
      <Text position={[0, 1.45, 0.35]} fontSize={0.08} color="gray">Anode (+)</Text>
      {/* Deflection plates */}
      {plateCharge !== "none" && <>
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.02, 0.6, 0.3]} />
          <meshStandardMaterial color={plateCharge === "pos" ? "#ef4444" : "#3b82f6"} />
        </mesh>
        <mesh position={[-0.35, 0, 0]}>
          <boxGeometry args={[0.02, 0.6, 0.3]} />
          <meshStandardMaterial color={plateCharge === "pos" ? "#3b82f6" : "#ef4444"} />
        </mesh>
      </>}
      {/* Beam */}
      {beamOn && (
        <group ref={beamRef}>
          <Line
            points={[[0, -1.2, 0], [totalDeflect, 1.2, 0]]}
            color="#22c55e"
            lineWidth={3}
          />
          {Array.from({ length: 8 }, (_, i) => {
            const t = i / 7;
            return (
              <Sphere key={i} args={[0.02, 8, 8]} position={[totalDeflect * t, -1.2 + t * 2.4, 0]}>
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} />
              </Sphere>
            );
          })}
          <pointLight position={[totalDeflect * 0.5, 0, 0]} color="#22c55e" intensity={0.5} distance={2} />
        </group>
      )}
      {/* B field indicator */}
      {magneticField && <Text position={[0, 0.8, 0.4]} fontSize={0.1} color="#6366f1" fontWeight="bold">B →</Text>}
    </group>
  );
}

export function CathodeRayTube3D() {
  const [voltage, setVoltage] = useState(0);
  const [plateCharge, setPlateCharge] = useState<"none"|"pos"|"neg">("none");
  const [magneticField, setMagneticField] = useState(false);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const beamOn = voltage > 500;
  const deflection = (plateCharge === "pos" ? -30 : plateCharge === "neg" ? 30 : 0) + (magneticField ? 20 : 0);
  const emRatio = beamOn ? (1.76e11).toExponential(2) : "—";

  const reset = () => { setVoltage(0); setPlateCharge("none"); setMagneticField(false); setStep(0); };

  const steps = ["Open CRT simulation", "Start vacuum pump", "Turn on high voltage", "Observe green beam", "Place electric plates", "Change polarity", "Turn on magnetic field", "Adjust B strength", "Measure deflection", "Record results"];

  return (
    <Simulation3DLayout
      title="Cathode Ray Tube Experiment"
      objective="Discover the electron through beam deflection"
      theory="J.J. Thomson used electric and magnetic fields to deflect cathode rays, showing they are negatively charged particles (electrons) with a measurable e/m ratio."
      onReset={reset}
      steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Voltage: {voltage} V</label>
            <Slider value={[voltage]} onValueChange={([v]) => { setVoltage(v); if (v > 500 && step < 3) setStep(3); sound.playClick(); }} min={0} max={5000} step={100} /></div>
          <div><span className="text-xs text-muted-foreground">Plate Charge</span>
            <div className="flex gap-1 mt-1">
              {(["none","pos","neg"] as const).map(p => (
                <Button key={p} size="sm" variant={plateCharge === p ? "default" : "outline"} className="text-xs h-7" onClick={() => { setPlateCharge(p); if (step < 5) setStep(5); sound.playClick(); }}>
                  {p === "none" ? "Off" : p === "pos" ? "+ Top" : "− Top"}
                </Button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={magneticField} onChange={e => { setMagneticField(e.target.checked); if (step < 7) setStep(7); sound.playClick(); }} className="rounded" />
            Magnetic Field
          </label>
        </div>
      }
      canvas3D={<CRTScene voltage={voltage} plateCharge={plateCharge} magneticField={magneticField} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Voltage</span><span className="font-mono">{voltage} V</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Beam</span><span className="font-mono">{beamOn ? "ON ✅" : "OFF"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Deflection</span><span className="font-mono">{deflection > 0 ? "+" : ""}{deflection}°</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">e/m ratio</span><span className="font-mono">{emRatio} C/kg</span></div>
        </div>
      }
    />
  );
}

/* ==================== 2. Rutherford Gold Foil 3D ==================== */

function RutherfordScene({ energy, foilThickness }: { energy: number; foilThickness: number }) {
  const particlesRef = useRef<THREE.Group>(null);
  const deflected = Math.floor(foilThickness * 8);
  const bounced = Math.floor(foilThickness * 1.5);
  const passed = 100 - deflected - bounced;

  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const type = i < Math.floor(passed / 3.3) ? "pass" : i < Math.floor((passed + deflected) / 3.3) ? "deflect" : "bounce";
    const startZ = -2 + (i / 30) * 2;
    const speed = 0.3 + energy * 0.1;
    return { type, startZ, speed, offset: Math.random() * Math.PI * 2 };
  }), [passed, deflected, energy]);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    const t = clock.elapsedTime;
    particlesRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      const progress = ((t * p.speed + p.offset) % 3) / 3;
      if (p.type === "pass") {
        child.position.set(-2 + progress * 4, 0, p.startZ);
      } else if (p.type === "deflect") {
        const bend = progress > 0.5 ? (progress - 0.5) * 2 : 0;
        child.position.set(-2 + progress * 4, bend * (i % 2 === 0 ? 0.8 : -0.8), p.startZ + bend * 0.5);
      } else {
        const x = progress < 0.5 ? -2 + progress * 4 : -2 + (1 - progress) * 4;
        child.position.set(x, 0, p.startZ);
      }
    });
  });

  return (
    <group>
      <LabRoom />
      {/* Gold foil */}
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[0.02 * foilThickness, 2, 2]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      <Text position={[0.5, 1.2, 0]} fontSize={0.1} color="#eab308">Gold Foil</Text>
      {/* Alpha source */}
      <mesh position={[-2.2, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.3]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
      <Text position={[-2.2, -0.3, 0]} fontSize={0.08} color="gray">α source</Text>
      {/* Fluorescent screen */}
      <mesh position={[2.2, 0, 0]}>
        <planeGeometry args={[0.3, 2]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Particles */}
      <group ref={particlesRef}>
        {particles.map((p, i) => (
          <Sphere key={i} args={[0.03, 6, 6]}>
            <meshStandardMaterial color={p.type === "pass" ? "#3b82f6" : p.type === "deflect" ? "#f97316" : "#ef4444"} emissive={p.type === "bounce" ? "#ef4444" : "#000"} emissiveIntensity={0.5} />
          </Sphere>
        ))}
      </group>
    </group>
  );
}

export function RutherfordExperiment3D() {
  const [energy, setEnergy] = useState(5);
  const [foilThickness, setFoilThickness] = useState(1);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const deflected = Math.floor(foilThickness * 8);
  const bounced = Math.floor(foilThickness * 1.5);
  const passed = 100 - deflected - bounced;

  const reset = () => { setEnergy(5); setFoilThickness(1); setStep(0); };
  const steps = ["Open Gold Foil simulation", "Activate α emitter", "Observe particles hitting foil", "Watch scattering pattern", "Count pass/deflect/bounce", "Adjust foil thickness", "Change particle energy", "Record observations", "Analyze nuclear structure"];

  return (
    <Simulation3DLayout
      title="Rutherford Gold Foil Experiment"
      objective="Observe alpha particle scattering patterns"
      theory="Most particles pass through, some deflect, very few bounce back—proving a dense positive nucleus."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Energy: {energy} MeV</label>
            <Slider value={[energy]} onValueChange={([v]) => { setEnergy(v); if (step < 6) setStep(6); sound.playClick(); }} min={1} max={10} step={1} /></div>
          <div><label className="text-xs text-muted-foreground">Foil: {foilThickness} layers</label>
            <Slider value={[foilThickness]} onValueChange={([v]) => { setFoilThickness(v); if (step < 5) setStep(5); sound.playClick(); }} min={1} max={5} step={1} /></div>
        </div>
      }
      canvas3D={<RutherfordScene energy={energy} foilThickness={foilThickness} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Passed</span><span className="font-mono">{passed}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Deflected</span><span className="font-mono">{deflected}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Bounced</span><span className="font-mono text-destructive">{bounced}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Energy</span><span className="font-mono">{energy} MeV</span></div>
        </div>
      }
    />
  );
}

/* ==================== 3. Photoelectric Effect 3D ==================== */

function PhotoelectricScene({ frequency, intensity }: { frequency: number; intensity: number }) {
  const electronsRef = useRef<THREE.Group>(null);
  const h = 6.626e-34;
  const threshold = 4.5e14;
  const freqHz = frequency * 1e14;
  const emitting = freqHz > threshold;
  const numElectrons = emitting ? Math.floor(intensity * 2) : 0;

  useFrame(({ clock }) => {
    if (!electronsRef.current) return;
    const t = clock.elapsedTime;
    electronsRef.current.children.forEach((child, i) => {
      if (i >= numElectrons) { child.visible = false; return; }
      child.visible = true;
      const progress = ((t * 0.8 + i * 0.3) % 2) / 2;
      child.position.set(0.3 + progress * 1.5, -0.2 + i * 0.08, (i - numElectrons/2) * 0.1);
    });
  });

  const lightColor = frequency < 4 ? "#ff0000" : frequency < 5 ? "#ff8800" : frequency < 7 ? "#aa00ff" : "#4400ff";

  return (
    <group>
      <LabRoom />
      {/* Metal plate */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 1, 0.8]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
      <Text position={[0, -0.7, 0]} fontSize={0.08} color="gray">Metal Surface</Text>
      {/* Light source */}
      <mesh position={[-1.5, 0.3, 0]}>
        <coneGeometry args={[0.15, 0.3, 16]} />
        <meshStandardMaterial color={lightColor} emissive={lightColor} emissiveIntensity={0.5} />
      </mesh>
      {/* Light beams */}
      {Array.from({ length: intensity }, (_, i) => (
        <Line key={i} points={[[-1.3, 0.3, (i - intensity/2) * 0.08], [0, 0, (i - intensity/2) * 0.08]]} color={lightColor} lineWidth={1.5} />
      ))}
      {/* Electrons */}
      <group ref={electronsRef}>
        {Array.from({ length: 20 }, (_, i) => (
          <Sphere key={i} args={[0.03, 8, 8]}>
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} />
          </Sphere>
        ))}
      </group>
      {/* KE meter */}
      <mesh position={[2, 0, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.2]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <Text position={[2, 0.15, 0.11]} fontSize={0.06} color="#22c55e">KE Meter</Text>
      <Text position={[2, -0.05, 0.11]} fontSize={0.08} color="#22c55e" fontWeight="bold">
        {emitting ? (h * (freqHz - threshold) * 1e19).toFixed(2) : "0.00"}
      </Text>
      <Text position={[2, -0.18, 0.11]} fontSize={0.05} color="gray">×10⁻¹⁹ J</Text>
      {!emitting && <Text position={[0.8, 0.5, 0]} fontSize={0.1} color="#ef4444">f {"<"} f₀ — No emission</Text>}
    </group>
  );
}

export function PhotoelectricEffect3D() {
  const [frequency, setFrequency] = useState(6);
  const [intensity, setIntensity] = useState(5);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const h = 6.626e-34;
  const threshold = 4.5e14;
  const freqHz = frequency * 1e14;
  const ke = freqHz > threshold ? h * (freqHz - threshold) : 0;
  const emitting = freqHz > threshold;

  const reset = () => { setFrequency(6); setIntensity(5); setStep(0); };
  const steps = ["Start simulation", "Select metal surface", "Turn on light", "Adjust frequency", "Observe electron emission", "Increase intensity", "Measure KE", "Find threshold", "Record conclusions"];

  return (
    <Simulation3DLayout
      title="Photoelectric Effect"
      objective="KE = hf − φ — Light frequency vs electron emission"
      theory="Electrons are emitted only if light frequency exceeds the threshold. KE depends on frequency, not intensity."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Frequency: {frequency}×10¹⁴ Hz</label>
            <Slider value={[frequency]} onValueChange={([v]) => { setFrequency(v); if (step < 3) setStep(3); sound.playClick(); }} min={1} max={15} step={0.5} /></div>
          <div><label className="text-xs text-muted-foreground">Intensity: {intensity}</label>
            <Slider value={[intensity]} onValueChange={([v]) => { setIntensity(v); if (step < 5) setStep(5); sound.playClick(); }} min={1} max={10} step={1} /></div>
          <p className="text-xs text-muted-foreground">Threshold: 4.5×10¹⁴ Hz</p>
        </div>
      }
      canvas3D={<PhotoelectricScene frequency={frequency} intensity={intensity} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Emission?</span><span className="font-mono">{emitting ? "Yes ✅" : "No ❌"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">KE</span><span className="font-mono">{(ke * 1e19).toFixed(3)}×10⁻¹⁹ J</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Electrons</span><span className="font-mono">{emitting ? Math.floor(intensity * 2) : 0}</span></div>
        </div>
      }
    />
  );
}

/* ==================== 4. Ionic Bond Formation 3D ==================== */

function IonicBondScene({ atomA, atomB, showTransfer }: { atomA: string; atomB: string; showTransfer: boolean }) {
  const electronRef = useRef<THREE.Mesh>(null);
  const charges: Record<string, number> = { Na: 1, K: 1, Ca: 2, Cl: -1, F: -1, O: -2 };
  const chargeA = charges[atomA];

  useFrame(({ clock }) => {
    if (electronRef.current && showTransfer) {
      const t = (Math.sin(clock.elapsedTime * 2) + 1) / 2;
      electronRef.current.position.x = -1 + t * 2;
    }
  });

  const colorA = "#3b82f6";
  const colorB = "#ef4444";

  return (
    <group>
      <LabRoom />
      {/* Metal atom */}
      <Sphere args={[0.4, 32, 32]} position={[-1, 0, 0]}>
        <meshStandardMaterial color={colorA} transparent opacity={0.7} />
      </Sphere>
      <Text position={[-1, 0, 0.45]} fontSize={0.15} color="white" fontWeight="bold">{atomA}</Text>
      {/* Valence electrons on metal */}
      {!showTransfer && Array.from({ length: chargeA }, (_, i) => (
        <Sphere key={i} args={[0.05, 8, 8]} position={[-1 + 0.5 * Math.cos(i * Math.PI), 0.5 * Math.sin(i * Math.PI), 0]}>
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
        </Sphere>
      ))}
      {/* Non-metal atom */}
      <Sphere args={[0.4, 32, 32]} position={[1, 0, 0]}>
        <meshStandardMaterial color={colorB} transparent opacity={0.7} />
      </Sphere>
      <Text position={[1, 0, 0.45]} fontSize={0.15} color="white" fontWeight="bold">{atomB}</Text>
      {/* Transferring electron */}
      {showTransfer && (
        <Sphere ref={electronRef} args={[0.05, 8, 8]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
        </Sphere>
      )}
      {/* Ion charges */}
      {showTransfer && <>
        <Text position={[-1, -0.6, 0]} fontSize={0.12} color="#3b82f6" fontWeight="bold">{atomA}{chargeA}+</Text>
        <Text position={[1, -0.6, 0]} fontSize={0.12} color="#ef4444" fontWeight="bold">{atomB}{Math.abs(charges[atomB])}−</Text>
        {/* Attraction line */}
        <Line points={[[-0.5, 0, 0], [0.5, 0, 0]]} color="white" lineWidth={1} dashed dashSize={0.05} gapSize={0.05} />
        <Text position={[0, 0.3, 0]} fontSize={0.07} color="gray">Electrostatic attraction</Text>
      </>}
    </group>
  );
}

export function IonicBondFormation3D() {
  const [atomA, setAtomA] = useState<"Na"|"K"|"Ca">("Na");
  const [atomB, setAtomB] = useState<"Cl"|"F"|"O">("Cl");
  const [showTransfer, setShowTransfer] = useState(false);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const charges: Record<string, number> = { Na: 1, K: 1, Ca: 2, Cl: -1, F: -1, O: -2 };
  const latticeEnergy = Math.abs(charges[atomA] * charges[atomB]) * 450;

  const reset = () => { setAtomA("Na"); setAtomB("Cl"); setShowTransfer(false); setStep(0); };
  const steps = ["Open ionic bonding sim", "Select Na and Cl", "Drag atoms together", "Observe electron transfer", "Watch ion formation", "See electrostatic attraction", "Build crystal lattice", "Measure lattice energy", "Record process"];

  return (
    <Simulation3DLayout
      title="Ionic Bond Formation"
      objective="Observe electron transfer and ionic crystal formation"
      theory="Ionic bonds form when electrons transfer from metal to non-metal atoms, creating ions that attract via electrostatic force."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><span className="text-xs text-muted-foreground">Metal Atom</span>
            <div className="flex gap-1 mt-1">
              {(["Na","K","Ca"] as const).map(a => (
                <Button key={a} size="sm" variant={atomA === a ? "default" : "outline"} className="text-xs h-7" onClick={() => { setAtomA(a); setShowTransfer(false); if (step < 1) setStep(1); sound.playClick(); }}>{a}</Button>
              ))}
            </div>
          </div>
          <div><span className="text-xs text-muted-foreground">Non-metal</span>
            <div className="flex gap-1 mt-1">
              {(["Cl","F","O"] as const).map(b => (
                <Button key={b} size="sm" variant={atomB === b ? "default" : "outline"} className="text-xs h-7" onClick={() => { setAtomB(b); setShowTransfer(false); if (step < 1) setStep(1); sound.playClick(); }}>{b}</Button>
              ))}
            </div>
          </div>
          <Button size="sm" className="w-full text-xs" onClick={() => { setShowTransfer(true); setStep(3); sound.playSuccess(); }}>Show Electron Transfer</Button>
        </div>
      }
      canvas3D={<IonicBondScene atomA={atomA} atomB={atomB} showTransfer={showTransfer} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Metal</span><span className="font-mono">{atomA}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Non-metal</span><span className="font-mono">{atomB}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Bond Type</span><span className="font-mono">Ionic</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Charge A</span><span className="font-mono">{showTransfer ? `${charges[atomA]}+` : "0"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Lattice E</span><span className="font-mono">{latticeEnergy} kJ/mol</span></div>
        </div>
      }
    />
  );
}

/* ==================== 5. VSEPR Molecular Geometry 3D ==================== */

function VSEPRScene({ bondPairs, lonePairs }: { bondPairs: number; lonePairs: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const total = bondPairs + lonePairs;

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3;
  });

  const shapes: Record<string, { name: string }> = {
    "2-0": { name: "Linear" }, "3-0": { name: "Trigonal Planar" }, "3-1": { name: "Trigonal Pyramidal" },
    "4-0": { name: "Tetrahedral" }, "4-1": { name: "See-saw" }, "4-2": { name: "Square Planar" },
    "2-1": { name: "Bent" }, "2-2": { name: "Bent" },
  };

  // Generate 3D positions
  const positions: [number, number, number][] = [];
  if (total === 2) { positions.push([1, 0, 0], [-1, 0, 0]); }
  else if (total === 3) { for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; positions.push([Math.cos(a), 0, Math.sin(a)]); } }
  else if (total === 4) { positions.push([0.577, 0.577, 0.577], [-0.577, -0.577, 0.577], [-0.577, 0.577, -0.577], [0.577, -0.577, -0.577]); }
  else if (total === 5) { for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; positions.push([Math.cos(a), 0, Math.sin(a)]); } positions.push([0, 1, 0], [0, -1, 0]); }
  else if (total === 6) { positions.push([1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]); }

  return (
    <group ref={groupRef}>
      <LabRoom />
      {/* Central atom */}
      <Sphere args={[0.25, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" />
      </Sphere>
      <Text position={[0, 0, 0.3]} fontSize={0.12} color="white" fontWeight="bold">C</Text>
      {/* Bond pairs */}
      {positions.slice(0, bondPairs).map((pos, i) => (
        <group key={`b${i}`}>
          <Line points={[[0, 0, 0], pos]} color="white" lineWidth={3} />
          <Sphere args={[0.15, 16, 16]} position={pos}>
            <meshStandardMaterial color="#ef4444" />
          </Sphere>
          <Text position={[pos[0] * 1.2, pos[1] * 1.2, pos[2] * 1.2]} fontSize={0.1} color="white">X</Text>
        </group>
      ))}
      {/* Lone pairs */}
      {positions.slice(bondPairs, bondPairs + lonePairs).map((pos, i) => (
        <group key={`l${i}`}>
          <Line points={[[0, 0, 0], [pos[0] * 0.6, pos[1] * 0.6, pos[2] * 0.6]]} color="gray" lineWidth={1} />
          <Text position={[pos[0] * 0.7, pos[1] * 0.7, pos[2] * 0.7]} fontSize={0.12} color="#a855f7">••</Text>
        </group>
      ))}
      {/* Shape label */}
      <Text position={[0, -1.5, 0]} fontSize={0.12} color="white" fontWeight="bold">{shapes[`${bondPairs}-${lonePairs}`]?.name || "Complex"}</Text>
    </group>
  );
}

export function VSEPRGeometry3D() {
  const [bondPairs, setBondPairs] = useState(4);
  const [lonePairs, setLonePairs] = useState(0);
  const [step, setStep] = useState(0);
  const sound = useSoundEffects();

  const shapes: Record<string, { name: string; angle: number }> = {
    "2-0": { name: "Linear", angle: 180 }, "3-0": { name: "Trigonal Planar", angle: 120 },
    "3-1": { name: "Trigonal Pyramidal", angle: 107 }, "4-0": { name: "Tetrahedral", angle: 109.5 },
    "4-1": { name: "See-saw", angle: 90 }, "4-2": { name: "Square Planar", angle: 90 },
    "2-1": { name: "Bent", angle: 120 }, "2-2": { name: "Bent", angle: 104.5 },
  };
  const shape = shapes[`${bondPairs}-${lonePairs}`] || { name: "Complex", angle: 0 };

  const reset = () => { setBondPairs(4); setLonePairs(0); setStep(0); };
  const steps = ["Open geometry simulator", "Select central atom", "Add bonded atoms", "Add lone pairs", "Rotate molecule in 3D", "Measure bond angles", "Identify shape", "Compare geometries", "Record results"];

  return (
    <Simulation3DLayout
      title="VSEPR Molecular Geometry"
      objective="Predict molecular shapes from electron pair repulsion"
      theory="VSEPR: electron pairs arrange to minimize repulsion. Lone pairs occupy more space than bonding pairs."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      soundEnabled={sound.enabled} onToggleSound={sound.toggleSound}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Bond Pairs: {bondPairs}</label>
            <Slider value={[bondPairs]} onValueChange={([v]) => { setBondPairs(v); if (step < 2) setStep(2); sound.playClick(); }} min={2} max={4} step={1} /></div>
          <div><label className="text-xs text-muted-foreground">Lone Pairs: {lonePairs}</label>
            <Slider value={[lonePairs]} onValueChange={([v]) => { setLonePairs(v); if (step < 3) setStep(3); sound.playClick(); }} min={0} max={2} step={1} /></div>
        </div>
      }
      canvas3D={<VSEPRScene bondPairs={bondPairs} lonePairs={lonePairs} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Shape</span><span className="font-mono">{shape.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Bond Angle</span><span className="font-mono">{shape.angle}°</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total Domains</span><span className="font-mono">{bondPairs + lonePairs}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Bond Pairs</span><span className="font-mono">{bondPairs}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Lone Pairs</span><span className="font-mono">{lonePairs}</span></div>
        </div>
      }
    />
  );
}
