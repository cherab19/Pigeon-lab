import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

// ============ b12-5: Pupil Reflex 3D ============

function EyeModel3D({ pupilSize, lightIntensity, covered }: { pupilSize: number; lightIntensity: number; covered: boolean }) {
  const irisRef = useRef<THREE.Mesh>(null);
  const normalizedPupil = pupilSize / 24;

  return (
    <group position={[0, 0.2, 0]}>
      {/* Eyeball */}
      <mesh><sphereGeometry args={[0.5, 32, 32]} /><meshStandardMaterial color="white" /></mesh>
      {/* Iris */}
      <mesh ref={irisRef} position={[0, 0, 0.45]}>
        <circleGeometry args={[0.22, 32]} />
        <meshStandardMaterial color="#8B4513" side={THREE.DoubleSide} />
      </mesh>
      {/* Pupil */}
      <mesh position={[0, 0, 0.46]}>
        <circleGeometry args={[0.22 * normalizedPupil, 32]} />
        <meshStandardMaterial color="black" side={THREE.DoubleSide} />
      </mesh>
      {/* Highlight */}
      <mesh position={[-0.05, 0.05, 0.47]}>
        <circleGeometry args={[0.03, 16]} />
        <meshStandardMaterial color="white" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Cover */}
      {covered && (
        <mesh position={[0, 0, 0.3]}>
          <boxGeometry args={[0.8, 0.6, 0.1]} />
          <meshStandardMaterial color="#333" transparent opacity={0.85} />
        </mesh>
      )}
      {/* Light source */}
      {!covered && lightIntensity > 60 && <pointLight position={[0, 1, 2]} intensity={lightIntensity / 50} color="#fbbf24" />}
      <Text position={[0, -0.7, 0.3]} fontSize={0.08} color="#888">
        Pupil: {(normalizedPupil * 8).toFixed(1)}mm — {normalizedPupil > 0.7 ? "Dilated" : normalizedPupil < 0.4 ? "Constricted" : "Normal"}
      </Text>
    </group>
  );
}

function PupilReflexScene({ pupilSize, lightIntensity, covered }: any) {
  return (
    <>
      <LabRoom />
      <EyeModel3D pupilSize={pupilSize} lightIntensity={lightIntensity} covered={covered} />
    </>
  );
}

export function PupilReflexExperiment3D() {
  const steps = ["Observe Normal Light", "Record Pupil Size", "Cover Eyes", "Uncover Eyes", "Increase Light", "Observe Constriction", "Return Normal", "Record Changes"];
  const [currentStep, setCurrentStep] = useState(0);
  const [lightIntensity, setLightIntensity] = useState(50);
  const [covered, setCovered] = useState(false);
  const [coverTimer, setCoverTimer] = useState(0);

  const pupilSize = covered ? 22 : Math.max(6, 24 - lightIntensity * 0.2);

  useEffect(() => {
    if (!covered) { setCoverTimer(0); return; }
    const iv = setInterval(() => setCoverTimer(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [covered]);

  const reset = () => { setCurrentStep(0); setLightIntensity(50); setCovered(false); setCoverTimer(0); };

  return (
    <Simulation3DLayout
      title="Lab: Pupil Reflex Experiment"
      objective="Observe how pupil size changes in response to light intensity"
      theory="In bright light, circular muscles contract (pupil constricts). In dim light, radial muscles contract (pupil dilates)."
      onReset={reset} steps={steps} currentStep={currentStep} onStepClick={setCurrentStep}
      controls={
        <div className="space-y-3">
          <div><p className="text-xs text-muted-foreground mb-1">Light: {lightIntensity}%</p><Slider value={[lightIntensity]} onValueChange={v => { setLightIntensity(v[0]); setCurrentStep(Math.max(currentStep, v[0] > 70 ? 4 : 0)); }} min={0} max={100} /></div>
          <Button variant={covered ? "default" : "outline"} size="sm" className="w-full text-xs" onClick={() => { setCovered(!covered); setCurrentStep(Math.max(currentStep, covered ? 3 : 2)); }}>
            {covered ? `👐 Uncover (${coverTimer}s)` : "🙈 Cover Eyes"}
          </Button>
        </div>
      }
      canvas3D={<PupilReflexScene pupilSize={pupilSize} lightIntensity={lightIntensity} covered={covered} />}
      liveData={
        <div className="space-y-2 text-xs">
          {[["Light", `${lightIntensity}%`], ["Pupil", `${(pupilSize * 0.3).toFixed(1)}mm`], ["Eyes", covered ? `Covered (${coverTimer}s)` : "Open"], ["Response", pupilSize > 18 ? "Dilation" : pupilSize < 10 ? "Constriction" : "Normal"]].map(([l, v]) => (
            <div key={l as string} className="flex justify-between"><span className="text-muted-foreground">{l as string}</span><span className="font-mono">{v}</span></div>
          ))}
        </div>
      }
    />
  );
}

// ============ b12-6: Reflex Arc / Light Refraction 3D ============

function RefractionScene({ waterLevel, pencilAngle, refractionOffset }: any) {
  const waterY = -0.4 + (waterLevel / 100) * 0.8;
  return (
    <>
      <LabRoom />
      {/* Glass */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.3, 1.2, 32, 1, true]} />
        <meshPhysicalMaterial color="#cceeff" transparent opacity={0.2} roughness={0.05} transmission={0.8} thickness={0.5} />
      </mesh>
      {/* Water */}
      {waterLevel > 0 && (
        <mesh position={[0, -0.6 + waterY / 2 + 0.3, 0]}>
          <cylinderGeometry args={[0.33, 0.28, waterLevel / 100 * 1.1, 32]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
        </mesh>
      )}
      {/* Pencil above water */}
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, (90 - pencilAngle) * Math.PI / 180]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      {/* Pencil below water (shifted) */}
      {waterLevel > 0 && (
        <mesh position={[refractionOffset * 0.01, -0.3, 0]} rotation={[0, 0, (90 - pencilAngle) * Math.PI / 180]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color="#f97316" transparent opacity={0.7} />
        </mesh>
      )}
      <Text position={[0, 1, 0]} fontSize={0.08} color="#888">Refraction: {refractionOffset.toFixed(1)}px offset</Text>
    </>
  );
}

export function ReflexArcSynapse3D() {
  const steps = ["Observe in Air", "Fill Water", "Insert Pencil", "Observe Bending", "Change Angle", "Explain Refraction", "Record"];
  const [currentStep, setCurrentStep] = useState(0);
  const [waterLevel, setWaterLevel] = useState(0);
  const [pencilAngle, setPencilAngle] = useState(80);
  const [viewAngle, setViewAngle] = useState(0);

  const refractionOffset = waterLevel > 20 ? (waterLevel / 100) * 25 * Math.sin((pencilAngle / 180) * Math.PI) : 0;

  const reset = () => { setCurrentStep(0); setWaterLevel(0); setPencilAngle(80); setViewAngle(0); };

  return (
    <Simulation3DLayout
      title="Lab: Light Refraction Experiment"
      objective="Observe how light refracts when passing through water"
      theory="Light bends when passing from one medium to another due to change in speed."
      onReset={reset} steps={steps} currentStep={currentStep} onStepClick={setCurrentStep}
      controls={
        <div className="space-y-3">
          <div><p className="text-xs text-muted-foreground mb-1">Water Level: {waterLevel}%</p><Slider value={[waterLevel]} onValueChange={v => { setWaterLevel(v[0]); setCurrentStep(Math.max(currentStep, 1)); }} min={0} max={100} /></div>
          <div><p className="text-xs text-muted-foreground mb-1">Pencil Angle: {pencilAngle}°</p><Slider value={[pencilAngle]} onValueChange={v => { setPencilAngle(v[0]); setCurrentStep(Math.max(currentStep, 3)); }} min={30} max={90} /></div>
          <div><p className="text-xs text-muted-foreground mb-1">View Angle: {viewAngle}°</p><Slider value={[viewAngle]} onValueChange={v => { setViewAngle(v[0]); setCurrentStep(Math.max(currentStep, 4)); }} min={-30} max={30} /></div>
        </div>
      }
      canvas3D={<RefractionScene waterLevel={waterLevel} pencilAngle={pencilAngle} refractionOffset={refractionOffset} />}
      liveData={
        <div className="space-y-2 text-xs">
          {[["Water Level", `${waterLevel}%`], ["Pencil Angle", `${pencilAngle}°`], ["Refraction", refractionOffset > 1 ? "Visible" : "None"], ["Offset", `${refractionOffset.toFixed(1)}`]].map(([l, v]) => (
            <div key={l as string} className="flex justify-between"><span className="text-muted-foreground">{l as string}</span><span className="font-mono">{v}</span></div>
          ))}
        </div>
      }
    />
  );
}

// ============ b12-7: Hormone Cycle 3D ============

function HormoneCycleScene({ day, fsh, lh, estrogen, progesterone, phase, fertilization }: any) {
  const uterusRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (uterusRef.current) {
      const thickness = 0.15 + (estrogen / 100) * 0.1 + (progesterone / 100) * 0.05;
      uterusRef.current.scale.set(1, thickness * 5, 1);
    }
  });

  return (
    <>
      <LabRoom />
      {/* Uterus representation */}
      <mesh ref={uterusRef} position={[0, 0, 0]}>
        <torusGeometry args={[0.4, 0.08, 16, 32]} />
        <meshStandardMaterial color={day <= 5 ? "#ef4444" : "#f472b6"} transparent opacity={0.7} />
      </mesh>

      {/* Ovary */}
      <mesh position={[-0.8, 0.2, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[0.8, 0.2, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>

      {/* Ovulation egg */}
      {day === 14 && (
        <mesh position={[-0.5, 0.3, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="white" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Hormone level bars */}
      {[
        { label: "FSH", value: fsh, color: "#f97316", x: -0.6 },
        { label: "LH", value: lh, color: "#ef4444", x: -0.2 },
        { label: "EST", value: estrogen, color: "#3b82f6", x: 0.2 },
        { label: "PROG", value: progesterone, color: "#22c55e", x: 0.6 },
      ].map(h => (
        <group key={h.label} position={[h.x, -0.8, 0.5]}>
          <mesh position={[0, Math.min(h.value, 100) / 200, 0]}>
            <boxGeometry args={[0.08, Math.min(h.value, 100) / 100 * 0.5, 0.08]} />
            <meshStandardMaterial color={h.color} />
          </mesh>
          <Text position={[0, -0.1, 0]} fontSize={0.05} color={h.color}>{h.label}</Text>
        </group>
      ))}

      <Text position={[0, 1, 0]} fontSize={0.1} color="#888">Day {day} — {phase}</Text>
      {fertilization && day > 14 && <Text position={[0, 0.8, 0]} fontSize={0.08} color="#f472b6">🤰 Pregnancy</Text>}
    </>
  );
}

export function HormoneCycle3D() {
  const steps = ["Start Cycle", "Set Day 1", "Observe Hormones", "Move Day Slider", "Identify Ovulation", "Observe Peaks", "Enable Fertilization", "Observe Pregnancy"];
  const [currentStep, setCurrentStep] = useState(0);
  const [day, setDay] = useState(1);
  const [fertilization, setFertilization] = useState(false);

  const fsh = day <= 14 ? 20 + (14 - Math.abs(day - 7)) * 3 : 10;
  const lh = Math.abs(day - 14) < 2 ? 80 : 15;
  const estrogen = day <= 14 ? day * 5 : 70 - (day - 14) * 3;
  const progesterone = day > 14 ? (fertilization ? (day - 14) * 7 : (day - 14) * 5) : 5;
  const phase = day <= 5 ? "Menstruation" : day <= 13 ? "Follicular" : day === 14 ? "Ovulation" : "Luteal";

  const reset = () => { setCurrentStep(0); setDay(1); setFertilization(false); };

  return (
    <Simulation3DLayout
      title="Lab: Menstrual Cycle Hormone Simulation"
      objective="Track hormone levels through the 28-day cycle"
      theory="FSH stimulates follicle growth, estrogen thickens the lining, LH triggers ovulation, progesterone maintains the lining."
      onReset={reset} steps={steps} currentStep={currentStep} onStepClick={setCurrentStep}
      controls={
        <div className="space-y-3">
          <div><p className="text-xs text-muted-foreground mb-1">Day: {day}</p><Slider value={[day]} onValueChange={v => { setDay(v[0]); setCurrentStep(Math.max(currentStep, v[0] === 14 ? 4 : 3)); }} min={1} max={28} /></div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={fertilization} onChange={e => { setFertilization(e.target.checked); if (e.target.checked) setCurrentStep(Math.max(currentStep, 6)); }} className="rounded" />
            Fertilization
          </label>
        </div>
      }
      canvas3D={<HormoneCycleScene day={day} fsh={fsh} lh={lh} estrogen={Math.max(0, estrogen)} progesterone={progesterone} phase={phase} fertilization={fertilization} />}
      liveData={
        <div className="space-y-2 text-xs">
          {[["Day", day], ["Phase", phase], ["FSH", fsh.toFixed(0)], ["LH", lh.toFixed(0)], ["Estrogen", Math.max(0, estrogen).toFixed(0)], ["Progesterone", Math.min(progesterone, 100).toFixed(0)], ["Fertilization", fertilization ? "Yes" : "No"]].map(([l, v]) => (
            <div key={l as string} className="flex justify-between"><span className="text-muted-foreground">{l as string}</span><span className="font-mono">{v}</span></div>
          ))}
        </div>
      }
    />
  );
}

// ============ b12-8: Punnett Square 3D ============

function PunnettScene({ offspring, dominantTrait, recessiveTrait, gametes1, gametes2 }: any) {
  return (
    <>
      <LabRoom />
      {/* 2x2 Punnett grid */}
      {[0, 1].map(row => [0, 1].map(col => {
        const idx = row * 2 + col;
        const geno = offspring[idx];
        const isDom = geno[0] === geno[0].toUpperCase();
        return (
          <group key={`${row}-${col}`} position={[(col - 0.5) * 0.7, 0.2 - row * 0.7, 0]}>
            <mesh>
              <boxGeometry args={[0.6, 0.6, 0.1]} />
              <meshStandardMaterial color={isDom ? "#3b82f6" : "#94a3b8"} transparent opacity={0.6} />
            </mesh>
            <Text position={[0, 0.05, 0.06]} fontSize={0.15} color="white" fontWeight="bold">{geno}</Text>
            <Text position={[0, -0.15, 0.06]} fontSize={0.06} color="white">{isDom ? dominantTrait : recessiveTrait}</Text>
          </group>
        );
      }))}

      {/* Headers */}
      <Text position={[-0.15, 0.9, 0]} fontSize={0.12} color="#3b82f6">{gametes2[0]}</Text>
      <Text position={[0.55, 0.9, 0]} fontSize={0.12} color="#3b82f6">{gametes2[1]}</Text>
      <Text position={[-0.85, 0.2, 0]} fontSize={0.12} color="#ef4444">{gametes1[0]}</Text>
      <Text position={[-0.85, -0.5, 0]} fontSize={0.12} color="#ef4444">{gametes1[1]}</Text>
    </>
  );
}

export function PunnettSquareSimulation3D() {
  const steps = ["Enter Genotypes", "Generate Gametes", "Construct Square", "Combine Gametes", "Determine Genotypes", "Determine Phenotypes", "Calculate Ratios"];
  const [currentStep, setCurrentStep] = useState(0);
  const [parent1, setParent1] = useState("Aa");
  const [parent2, setParent2] = useState("Aa");
  const [dominantTrait, setDominantTrait] = useState("Tall");
  const [recessiveTrait, setRecessiveTrait] = useState("Dwarf");

  const gametes1 = [parent1[0], parent1[1]];
  const gametes2 = [parent2[0], parent2[1]];
  const offspring = gametes1.flatMap(g1 => gametes2.map(g2 => {
    const alleles = [g1, g2].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return alleles[0] === alleles[0].toUpperCase() ? alleles.join("") : alleles[1] === alleles[1].toUpperCase() ? [alleles[1], alleles[0]].join("") : alleles.join("");
  }));

  const genotypeCounts: Record<string, number> = {};
  offspring.forEach(o => { genotypeCounts[o] = (genotypeCounts[o] || 0) + 1; });
  const dominantCount = offspring.filter(o => o[0] === o[0].toUpperCase()).length;
  const recessiveCount = 4 - dominantCount;

  const validGenotypes = ["AA", "Aa", "aa"];
  const reset = () => { setCurrentStep(0); setParent1("Aa"); setParent2("Aa"); };

  return (
    <Simulation3DLayout
      title="Lab: Punnett Square Simulation"
      objective="Predict offspring ratios using a Punnett Square"
      theory="A monohybrid cross examines one gene. Heterozygous cross (Aa × Aa) yields 1:2:1 genotypic and 3:1 phenotypic ratio."
      onReset={reset} steps={steps} currentStep={currentStep} onStepClick={setCurrentStep}
      controls={
        <div className="space-y-3">
          <div><p className="text-xs font-semibold text-muted-foreground mb-1">Parent 1</p>
            {validGenotypes.map(g => (
              <label key={`p1-${g}`} className="flex items-center gap-2 text-xs"><input type="radio" checked={parent1 === g} onChange={() => setParent1(g)} /> {g}</label>
            ))}
          </div>
          <div><p className="text-xs font-semibold text-muted-foreground mb-1">Parent 2</p>
            {validGenotypes.map(g => (
              <label key={`p2-${g}`} className="flex items-center gap-2 text-xs"><input type="radio" checked={parent2 === g} onChange={() => setParent2(g)} /> {g}</label>
            ))}
          </div>
          <div><label className="text-xs text-muted-foreground">Dominant:</label><input type="text" value={dominantTrait} onChange={e => setDominantTrait(e.target.value)} className="w-full px-2 py-1 text-xs rounded border border-border bg-background" /></div>
          <div><label className="text-xs text-muted-foreground">Recessive:</label><input type="text" value={recessiveTrait} onChange={e => setRecessiveTrait(e.target.value)} className="w-full px-2 py-1 text-xs rounded border border-border bg-background" /></div>
        </div>
      }
      canvas3D={<PunnettScene offspring={offspring} dominantTrait={dominantTrait} recessiveTrait={recessiveTrait} gametes1={gametes1} gametes2={gametes2} />}
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Cross</span><span className="font-mono">{parent1} × {parent2}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Dominant</span><span className="font-mono">{dominantCount}/4 ({dominantCount * 25}%)</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Recessive</span><span className="font-mono">{recessiveCount}/4 ({recessiveCount * 25}%)</span></div>
          {Object.entries(genotypeCounts).map(([k, v]) => (
            <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-mono">{v}/4</span></div>
          ))}
        </div>
      }
    />
  );
}
