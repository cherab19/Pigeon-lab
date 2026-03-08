import { useState, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom, Beaker3D } from "../../3d/LabEnvironment";
import { useSoundEffects } from "../../3d/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ════════════════════════════════════════════════════════════
   c9-1  Lab Safety & Measurement 3D
   ════════════════════════════════════════════════════════════ */
function LabSafetyScene({ goggles, gloves, apron, mass, temp, volume, tared }: {
  goggles: boolean; gloves: boolean; apron: boolean; mass: number; temp: number; volume: number; tared: boolean;
}) {
  const thermRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (thermRef.current) thermRef.current.position.y = -0.1 + Math.sin(clock.getElapsedTime() * 2) * 0.005;
  });

  const safetyScore = (goggles ? 33 : 0) + (gloves ? 33 : 0) + (apron ? 34 : 0);

  return (
    <group>
      <LabRoom />
      {/* Safety equipment indicators */}
      {goggles && (
        <group position={[-1.5, 0.5, 0.5]}>
          <mesh><boxGeometry args={[0.2, 0.08, 0.08]} /><meshStandardMaterial color="#4488ff" transparent opacity={0.6} /></mesh>
          <Text position={[0, 0.1, 0]} fontSize={0.06} color="#4488ff">Goggles ✓</Text>
        </group>
      )}
      {gloves && (
        <group position={[-1.5, 0.3, 0.5]}>
          <mesh><boxGeometry args={[0.12, 0.15, 0.05]} /><meshStandardMaterial color="#44aa44" /></mesh>
          <Text position={[0, 0.12, 0]} fontSize={0.06} color="#44aa44">Gloves ✓</Text>
        </group>
      )}
      {apron && (
        <group position={[-1.5, 0.1, 0.5]}>
          <mesh><boxGeometry args={[0.15, 0.2, 0.02]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <Text position={[0, 0.15, 0]} fontSize={0.06} color="#888">Apron ✓</Text>
        </group>
      )}

      {/* Digital balance */}
      <group position={[-0.8, -0.45, 0]}>
        <mesh castShadow><boxGeometry args={[0.6, 0.05, 0.4]} /><meshStandardMaterial color="#ddd" /></mesh>
        <mesh position={[0, 0.04, 0]}><boxGeometry args={[0.3, 0.02, 0.2]} /><meshStandardMaterial color="#333" /></mesh>
        <Text position={[0, 0.08, 0.05]} fontSize={0.05} color="#44ff44">{tared ? `${mass.toFixed(1)} g` : "--- g"}</Text>
        {mass > 0 && <Beaker3D position={[0, 0.15, 0]} scale={0.5} liquidColor="#aaddff" liquidLevel={0.4} />}
      </group>

      {/* Thermometer */}
      <group position={[0.2, -0.1, 0]}>
        <mesh ref={thermRef} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
          <meshStandardMaterial color="#ddd" />
        </mesh>
        {/* Mercury */}
        <mesh position={[0, -0.2 + (temp + 10) / 160 * 0.3, 0]}>
          <cylinderGeometry args={[0.01, 0.01, (temp + 10) / 160 * 0.6, 8]} />
          <meshStandardMaterial color="#ff3333" />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#ff3333" />
        </mesh>
        <Text position={[0, 0.25, 0.03]} fontSize={0.06} color="#ff4444">{temp}°C</Text>
      </group>

      {/* Measuring cylinder */}
      <group position={[0.9, -0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.09, 0.6, 32, 1, true]} />
          <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} transmission={0.7} />
        </mesh>
        {volume > 0 && (
          <mesh position={[0, -0.3 + (volume / 100) * 0.3, 0]}>
            <cylinderGeometry args={[0.09, 0.085, (volume / 100) * 0.6, 32]} />
            <meshStandardMaterial color="#4488ff" transparent opacity={0.4} />
          </mesh>
        )}
        <Text position={[0, 0.35, 0.1]} fontSize={0.05} color="#888">{volume.toFixed(1)} mL</Text>
      </group>

      {/* Safety badge */}
      <Text position={[0, 1.2, 0]} fontSize={0.1} color={safetyScore === 100 ? "#44ff44" : "#ff4444"}>
        Safety: {safetyScore}%
      </Text>
    </group>
  );
}

export function LabSafety3D() {
  const [goggles, setGoggles] = useState(false);
  const [gloves, setGloves] = useState(false);
  const [apron, setApron] = useState(false);
  const [mass, setMass] = useState(0);
  const [temp, setTemp] = useState(25);
  const [volume, setVolume] = useState(0);
  const [tared, setTared] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const safetyScore = (goggles ? 33 : 0) + (gloves ? 33 : 0) + (apron ? 34 : 0);
  const showWarning = (mass > 0 || temp !== 25) && !goggles;

  const reset = () => { setGoggles(false); setGloves(false); setApron(false); setMass(0); setTemp(25); setVolume(0); setTared(false); setStep(0); };
  const steps = ["Wear safety goggles", "Put on gloves and apron", "Tare the balance", "Measure sample mass", "Record mass", "Insert thermometer", "Record temperature", "Use measuring cylinder", "Record volume"];

  return (
    <Simulation3DLayout
      title="Lab Safety & Measurement"
      objective="Learn to use lab instruments safely and measure mass, temperature, and volume"
      theory="Lab safety includes wearing goggles, gloves, and apron. Accurate measurement is the foundation of chemistry."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-2">
          {showWarning && <div className="text-[10px] text-destructive bg-destructive/10 p-1.5 rounded animate-pulse">⚠️ Put on goggles first!</div>}
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Safety</p>
          {[{ l: "Goggles 🥽", v: goggles, s: setGoggles }, { l: "Gloves 🧤", v: gloves, s: setGloves }, { l: "Apron", v: apron, s: setApron }].map(i => (
            <label key={i.l} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={i.v} onChange={e => i.s(e.target.checked)} />{i.l}</label>
          ))}
          <Button size="sm" className="w-full text-xs" onClick={() => setTared(true)} disabled={tared}>{tared ? "Tared ✅" : "Tare Balance"}</Button>
          <div><label className="text-xs text-muted-foreground">Mass: {mass} g</label><Slider value={[mass]} onValueChange={v => setMass(v[0])} min={0} max={500} step={0.1} /></div>
          <div><label className="text-xs text-muted-foreground">Temp: {temp}°C</label><Slider value={[temp]} onValueChange={v => setTemp(v[0])} min={-10} max={150} step={0.5} /></div>
          <div><label className="text-xs text-muted-foreground">Volume: {volume} mL</label><Slider value={[volume]} onValueChange={v => setVolume(v[0])} min={0} max={100} step={0.5} /></div>
        </div>
      }
      canvas3D={<LabSafetyScene goggles={goggles} gloves={gloves} apron={apron} mass={mass} temp={temp} volume={volume} tared={tared} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Safety</span><span>{safetyScore}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Mass</span><span>{tared ? `${mass.toFixed(1)} g` : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span>{temp}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Volume</span><span>{volume.toFixed(1)} mL</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{safetyScore === 100 ? "Safe ✅" : "⚠️"}</span></div>
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   c9-2  States of Matter 3D
   ════════════════════════════════════════════════════════════ */
function StatesOfMatterScene({ temp, molecularView }: { temp: number; molecularView: boolean }) {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const count = 50;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const positions = useMemo(() => {
    return Array.from({ length: count }, () => [
      (Math.random() - 0.5) * 1.2,
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8,
    ] as [number, number, number]);
  }, []);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    const t = clock.getElapsedTime();
    const spread = temp <= 0 ? 0.02 : temp < 100 ? temp / 100 * 0.15 : 0.3 + (temp - 100) / 50 * 0.2;
    for (let i = 0; i < count; i++) {
      const base = positions[i];
      dummy.position.set(
        base[0] + Math.sin(t * 2 + i) * spread,
        base[1] + Math.cos(t * 1.5 + i * 0.7) * spread + (temp >= 100 ? Math.sin(t + i) * 0.3 : 0),
        base[2] + Math.sin(t * 1.8 + i * 1.3) * spread,
      );
      const scale = temp <= 0 ? 0.04 : temp < 100 ? 0.035 : 0.025;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    }
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  const state = temp <= 0 ? "Solid" : temp < 100 ? "Liquid" : "Gas";
  const color = temp <= 0 ? "#88bbff" : temp < 100 ? "#3366ff" : "#aabbcc";

  return (
    <group>
      <LabRoom />
      {/* Beaker */}
      <Beaker3D position={[0, -0.2, 0]} scale={1.8} liquidColor={color} liquidLevel={temp >= 100 ? 0.3 : 0.7} />

      {/* Particles */}
      {molecularView && (
        <instancedMesh ref={particlesRef} args={[undefined, undefined, count]} position={[0, -0.1, 0]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={color} />
        </instancedMesh>
      )}

      {/* Steam particles */}
      {temp >= 100 && Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 0.5, 0.3 + i * 0.15, (Math.random() - 0.5) * 0.3]}>
          <sphereGeometry args={[0.03 + i * 0.01, 8, 8]} />
          <meshStandardMaterial color="#ddeeff" transparent opacity={0.3 - i * 0.03} />
        </mesh>
      ))}

      {/* Bunsen burner */}
      <group position={[0, -0.7, 0]}>
        <mesh><cylinderGeometry args={[0.08, 0.12, 0.3, 16]} /><meshStandardMaterial color="#555" metalness={0.6} /></mesh>
        {temp > -10 && (
          <mesh position={[0, 0.2, 0]}>
            <coneGeometry args={[0.04, 0.15, 8]} />
            <meshStandardMaterial color="#ff6622" emissive="#ff4400" emissiveIntensity={Math.min(temp / 100, 1)} transparent opacity={0.8} />
          </mesh>
        )}
      </group>

      <Text position={[0, 1.2, 0]} fontSize={0.12} color="#eee">{state}</Text>
    </group>
  );
}

export function StatesOfMatter3D() {
  const [temp, setTemp] = useState(-10);
  const [molecularView, setMolecularView] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const state = temp <= 0 ? "Solid (Ice)" : temp < 100 ? "Liquid (Water)" : "Gas (Steam)";

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => setTemp(t => { if (t >= 150) { setPlaying(false); return 150; } return t + 1; }), 100);
    return () => clearInterval(interval);
  }, [playing]);

  const reset = () => { setTemp(-10); setMolecularView(true); setPlaying(false); setStep(0); };
  const steps = ["Place beaker on burner", "Start heating", "Observe solid phase", "Watch melting at 0°C", "Observe liquid phase", "Continue heating", "Watch boiling at 100°C", "Observe gas phase", "Toggle molecular view", "Record observations"];

  return (
    <Simulation3DLayout
      title="States of Matter"
      objective="Observe how heating affects the physical state of matter"
      theory="Water melts at 0°C, boils at 100°C. Molecular motion increases with temperature."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Temp: {temp}°C</label><Slider value={[temp]} onValueChange={v => setTemp(v[0])} min={-20} max={150} step={1} /></div>
          <div className="flex gap-1">
            <Button size="sm" className="flex-1 text-xs" onClick={() => setPlaying(!playing)}>{playing ? "⏸ Pause" : "▶ Heat"}</Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={reset}>Reset</Button>
          </div>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={molecularView} onChange={e => setMolecularView(e.target.checked)} />🔬 Molecular View</label>
        </div>
      }
      canvas3D={<StatesOfMatterScene temp={temp} molecularView={molecularView} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span>{temp}°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">State</span><span>{state}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Melting</span><span>0°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Boiling</span><span>100°C</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">KE</span><span>{temp <= 0 ? "Low" : temp < 100 ? "Medium" : "High"}</span></div>
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   c9-3  Atomic Structure (Bohr Model) 3D
   ════════════════════════════════════════════════════════════ */
function AtomicStructureScene({ protons, neutrons, electrons }: { protons: number; neutrons: number; electrons: number }) {
  const shell1 = Math.min(electrons, 2);
  const shell2 = Math.min(Math.max(electrons - 2, 0), 8);
  const shell3 = Math.min(Math.max(electrons - 10, 0), 8);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Nucleus */}
      <mesh>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshStandardMaterial color="#ff6644" emissive="#ff4422" emissiveIntensity={0.3} />
      </mesh>
      {/* Proton/neutron particles inside nucleus */}
      {Array.from({ length: Math.min(protons, 8) }, (_, i) => {
        const phi = (i / protons) * Math.PI * 2;
        const r = 0.1;
        return (
          <mesh key={`p${i}`} position={[Math.cos(phi) * r, Math.sin(phi) * r, (i % 2 - 0.5) * 0.08]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#ff2222" />
          </mesh>
        );
      })}
      {Array.from({ length: Math.min(neutrons, 8) }, (_, i) => {
        const phi = (i / neutrons) * Math.PI * 2 + 0.3;
        const r = 0.12;
        return (
          <mesh key={`n${i}`} position={[Math.cos(phi) * r, (i % 2 - 0.5) * 0.08, Math.sin(phi) * r]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
        );
      })}

      {/* Electron shells (orbit rings) */}
      {[{ r: 0.6, count: shell1, speed: 2 }, { r: 0.9, count: shell2, speed: 1.5 }, { r: 1.2, count: shell3, speed: 1 }].map((shell, si) => (
        <group key={si}>
          {/* Orbit ring */}
          <mesh rotation={[Math.PI / 2, 0, si * 0.5]}>
            <torusGeometry args={[shell.r, 0.005, 8, 64]} />
            <meshStandardMaterial color="#4488ff" transparent opacity={0.3} />
          </mesh>
          {/* Electrons */}
          {Array.from({ length: shell.count }, (_, ei) => (
            <ElectronOrbit key={`${si}-${ei}`} radius={shell.r} speed={shell.speed} offset={(ei / shell.count) * Math.PI * 2} tilt={si * 0.5} />
          ))}
        </group>
      ))}
    </group>
  );
}

function ElectronOrbit({ radius, speed, offset, tilt }: { radius: number; speed: number; offset: number; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t) * radius * Math.cos(tilt);
    ref.current.position.z = Math.sin(t) * radius * Math.sin(tilt);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.03, 12, 12]} />
      <meshStandardMaterial color="#4488ff" emissive="#2266ff" emissiveIntensity={0.5} />
    </mesh>
  );
}

export function AtomicStructure3D() {
  const [protons, setProtons] = useState(6);
  const [neutrons, setNeutrons] = useState(6);
  const [electrons, setElectrons] = useState(6);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const elements: Record<number, string> = { 1: "H", 2: "He", 3: "Li", 4: "Be", 5: "B", 6: "C", 7: "N", 8: "O", 9: "F", 10: "Ne", 11: "Na", 12: "Mg", 13: "Al", 14: "Si", 15: "P", 16: "S", 17: "Cl", 18: "Ar", 19: "K", 20: "Ca" };
  const elementNames: Record<number, string> = { 1: "Hydrogen", 2: "Helium", 3: "Lithium", 4: "Beryllium", 5: "Boron", 6: "Carbon", 7: "Nitrogen", 8: "Oxygen", 9: "Fluorine", 10: "Neon", 11: "Sodium", 12: "Magnesium", 13: "Aluminium", 14: "Silicon", 15: "Phosphorus", 16: "Sulphur", 17: "Chlorine", 18: "Argon", 19: "Potassium", 20: "Calcium" };
  const element = elements[protons] || "?";
  const elementName = elementNames[protons] || "Unknown";
  const charge = protons - electrons;
  const shell1 = Math.min(electrons, 2);
  const shell2 = Math.min(Math.max(electrons - 2, 0), 8);
  const shell3 = Math.min(Math.max(electrons - 10, 0), 8);

  const reset = () => { setProtons(6); setNeutrons(6); setElectrons(6); setStep(0); };
  const steps = ["Add protons to nucleus", "Add neutrons", "Place electrons in shells", "Observe element name", "Change protons to change element", "Balance electrons", "Observe orbit animations", "Record atomic number"];

  return (
    <Simulation3DLayout
      title="Atomic Structure (Bohr Model)"
      objective="Construct atoms and understand atomic structure in 3D"
      theory="Electrons orbit in shells: 1st holds 2, 2nd holds 8, 3rd holds 8. Atomic number = protons."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Protons: {protons}</label><Slider value={[protons]} onValueChange={v => setProtons(v[0])} min={1} max={20} step={1} /></div>
          <div><label className="text-xs text-muted-foreground">Neutrons: {neutrons}</label><Slider value={[neutrons]} onValueChange={v => setNeutrons(v[0])} min={0} max={25} step={1} /></div>
          <div><label className="text-xs text-muted-foreground">Electrons: {electrons}</label><Slider value={[electrons]} onValueChange={v => setElectrons(v[0])} min={0} max={20} step={1} /></div>
          <div className="p-2 bg-primary/10 rounded text-xs">
            <p className="font-bold text-primary">{element} — {elementName}</p>
            <p className="text-muted-foreground">{charge === 0 ? "Neutral" : charge > 0 ? `+${charge} (cation)` : `${charge} (anion)`}</p>
          </div>
        </div>
      }
      canvas3D={<AtomicStructureScene protons={protons} neutrons={neutrons} electrons={electrons} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Element</span><span>{element}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Atomic #</span><span>{protons}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Mass #</span><span>{protons + neutrons}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Charge</span><span>{charge === 0 ? "0" : charge > 0 ? `+${charge}` : charge}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shell 1</span><span>{shell1}/2</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shell 2</span><span>{shell2}/8</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shell 3</span><span>{shell3}/8</span></div>
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   c9-4  Chemical Bonding 3D
   ════════════════════════════════════════════════════════════ */
function ChemicalBondingScene({ bondType, bonded, showTransfer }: { bondType: "ionic" | "covalent"; bonded: boolean; showTransfer: boolean }) {
  const electronRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!electronRef.current || !showTransfer || bonded) return;
    if (bondType === "ionic") {
      const t = Math.min((clock.getElapsedTime() % 2) / 1.2, 1);
      electronRef.current.position.x = -0.5 + t * 1.0;
    }
  });

  return (
    <group>
      <LabRoom />
      {bondType === "ionic" ? (
        <>
          {/* Na atom */}
          <mesh position={[bonded ? -0.3 : -0.6, 0, 0]} castShadow>
            <sphereGeometry args={[0.3, 24, 24]} />
            <meshStandardMaterial color="#6688ff" transparent opacity={0.6} />
          </mesh>
          <Text position={[bonded ? -0.3 : -0.6, 0, 0.32]} fontSize={0.12} color="#4466ff">{bonded ? "Na⁺" : "Na"}</Text>

          {/* Cl atom */}
          <mesh position={[bonded ? 0.3 : 0.6, 0, 0]} castShadow>
            <sphereGeometry args={[0.35, 24, 24]} />
            <meshStandardMaterial color="#44cc44" transparent opacity={0.6} />
          </mesh>
          <Text position={[bonded ? 0.3 : 0.6, 0, 0.38]} fontSize={0.12} color="#22aa22">{bonded ? "Cl⁻" : "Cl"}</Text>

          {/* Transferring electron */}
          {showTransfer && !bonded && (
            <mesh ref={electronRef} position={[-0.5, 0.15, 0]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshStandardMaterial color="#4488ff" emissive="#2266ff" emissiveIntensity={0.8} />
            </mesh>
          )}

          {bonded && (
            <>
              {/* Ionic bond glow */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.1, 12, 12]} />
                <meshStandardMaterial color="#ffff44" emissive="#ffff00" emissiveIntensity={0.5} transparent opacity={0.3} />
              </mesh>
              <Text position={[0, -0.6, 0]} fontSize={0.1} color="#ffcc00">NaCl — Ionic Bond</Text>
            </>
          )}
        </>
      ) : (
        <>
          {/* H atoms */}
          <mesh position={[bonded ? -0.2 : -0.5, 0, 0]} castShadow>
            <sphereGeometry args={[0.25, 24, 24]} />
            <meshStandardMaterial color="#6688ff" transparent opacity={0.5} />
          </mesh>
          <Text position={[bonded ? -0.2 : -0.5, 0, 0.28]} fontSize={0.12} color="#4466ff">H</Text>

          <mesh position={[bonded ? 0.2 : 0.5, 0, 0]} castShadow>
            <sphereGeometry args={[0.25, 24, 24]} />
            <meshStandardMaterial color="#6688ff" transparent opacity={0.5} />
          </mesh>
          <Text position={[bonded ? 0.2 : 0.5, 0, 0.28]} fontSize={0.12} color="#4466ff">H</Text>

          {/* Shared electron cloud */}
          {bonded && (
            <>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#4488ff" transparent opacity={0.3} />
              </mesh>
              <mesh position={[-0.05, 0, 0.05]}><sphereGeometry args={[0.03, 8, 8]} /><meshStandardMaterial color="#4488ff" emissive="#2266ff" emissiveIntensity={0.5} /></mesh>
              <mesh position={[0.05, 0, -0.05]}><sphereGeometry args={[0.03, 8, 8]} /><meshStandardMaterial color="#4488ff" emissive="#2266ff" emissiveIntensity={0.5} /></mesh>
              <Text position={[0, -0.6, 0]} fontSize={0.1} color="#4488ff">H₂ — Covalent Bond</Text>
            </>
          )}
        </>
      )}
    </group>
  );
}

export function ChemicalBonding3D() {
  const [bondType, setBondType] = useState<"ionic" | "covalent">("ionic");
  const [showTransfer, setShowTransfer] = useState(false);
  const [bonded, setBonded] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound } = useSoundEffects();

  const handleBond = () => { setShowTransfer(true); setTimeout(() => setBonded(true), 1200); };
  const reset = () => { setBondType("ionic"); setShowTransfer(false); setBonded(false); setStep(0); };
  const steps = ["Select bond type", "Observe atoms", "Form the bond", "Watch electron transfer/sharing", "Observe bond formed", "Switch bond type", "Compare ionic vs covalent", "Record observations"];

  return (
    <Simulation3DLayout
      title="Chemical Bonding"
      objective="Understand ionic and covalent bonding in 3D"
      theory="Ionic: electron transfer (metal + non-metal). Covalent: electron sharing (non-metal + non-metal)."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Bond Type</p>
          {(["ionic", "covalent"] as const).map(t => (
            <label key={t} className="flex items-center gap-2 text-xs capitalize">
              <input type="radio" name="bond" checked={bondType === t} onChange={() => { setBondType(t); setBonded(false); setShowTransfer(false); }} />{t}
            </label>
          ))}
          <Button size="sm" className="w-full text-xs" onClick={handleBond} disabled={bonded}>
            {bonded ? "Bonded ✅" : showTransfer ? "Bonding..." : "Form Bond"}
          </Button>
        </div>
      }
      canvas3D={<ChemicalBondingScene bondType={bondType} bonded={bonded} showTransfer={showTransfer} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="capitalize">{bondType}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Atoms</span><span>{bondType === "ionic" ? "Na + Cl" : "H + H"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span>{bonded ? (bondType === "ionic" ? "NaCl" : "H₂") : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Energy</span><span>{bonded ? (bondType === "ionic" ? "787" : "436") : "—"} kJ/mol</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Mechanism</span><span>{bondType === "ionic" ? "Transfer" : "Sharing"}</span></div>
        </div>
      }
    />
  );
}

/* ════════════════════════════════════════════════════════════
   c9-5  Chemical Reactions (Fe + S) 3D
   ════════════════════════════════════════════════════════════ */
function ChemicalReactionsScene({ heated, reacted }: { heated: boolean; reacted: boolean }) {
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (glowRef.current && heated && !reacted) {
      glowRef.current.intensity = 1 + Math.sin(clock.getElapsedTime() * 8) * 0.5;
    }
  });

  return (
    <group>
      <LabRoom />
      {/* Test tube */}
      <group position={[0, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.1, 0.8, 16, 1, true]} />
          <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} transmission={0.7} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>

        {/* Contents */}
        {!reacted ? (
          <>
            {/* Iron filings (grey) */}
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.15, 16]} />
              <meshStandardMaterial color="#999999" roughness={0.8} />
            </mesh>
            {/* Sulphur (yellow) */}
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.12, 16]} />
              <meshStandardMaterial color="#ddbb22" roughness={0.6} />
            </mesh>
          </>
        ) : (
          /* FeS product (black) */
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.25, 16]} />
            <meshStandardMaterial color="#222222" roughness={0.9} />
          </mesh>
        )}
      </group>

      {/* Reaction glow */}
      {heated && !reacted && <pointLight ref={glowRef} position={[0, 0, 0.2]} color="#ff6622" intensity={1} distance={1} />}

      {/* Bunsen burner */}
      {heated && (
        <group position={[0, -0.7, 0]}>
          <mesh><cylinderGeometry args={[0.06, 0.1, 0.25, 16]} /><meshStandardMaterial color="#555" metalness={0.6} /></mesh>
          <mesh position={[0, 0.18, 0]}>
            <coneGeometry args={[0.03, 0.12, 8]} />
            <meshStandardMaterial color="#ff6622" emissive="#ff4400" emissiveIntensity={1} transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {reacted && <Text position={[0, 0.8, 0]} fontSize={0.1} color="#44ff44">Fe + S → FeS</Text>}
    </group>
  );
}

export function ChemicalReactions3D() {
  const [heated, setHeated] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [step, setStep] = useState(0);
  const { enabled, toggleSound, playSuccess } = useSoundEffects();

  const handleHeat = () => { setHeated(true); setTimeout(() => { setReacted(true); playSuccess(); }, 1500); };
  const reset = () => { setHeated(false); setReacted(false); setStep(0); };
  const steps = ["Add iron filings", "Add sulphur powder", "Stir mixture", "Apply heat", "Observe glow/color change", "Note exothermic reaction", "View equation", "Record observations"];

  return (
    <Simulation3DLayout
      title="Chemical Reactions (Fe + S)"
      objective="Observe indicators of chemical reactions"
      theory="Fe + S → FeS. Exothermic: color change (grey+yellow → black), heat released."
      onReset={reset} soundEnabled={enabled} onToggleSound={toggleSound}
      steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <Button size="sm" className="w-full text-xs" onClick={handleHeat} disabled={heated}>
            {heated ? (reacted ? "Complete ✅" : "Heating... 🔥") : "Apply Heat 🔥"}
          </Button>
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
            <p>• Fe (grey) — iron filings</p>
            <p>• S (yellow) — sulphur powder</p>
          </div>
        </div>
      }
      canvas3D={<ChemicalReactionsScene heated={heated} reacted={reacted} />}
      liveData={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Reactants</span><span>Fe + S</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span>FeS</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{reacted ? "Complete ✅" : heated ? "Reacting..." : "Ready"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>Exothermic</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Color Δ</span><span>{reacted ? "→ Black" : "—"}</span></div>
        </div>
      }
    />
  );
}
