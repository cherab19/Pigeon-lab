import { useState, useMemo } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";

// ========== UNIT 1: Atomic Structure ==========

// 1. Cathode Ray Tube
export function CathodeRayTube() {
  const [voltage, setVoltage] = useState(0);
  const [plateCharge, setPlateCharge] = useState<"none"|"pos"|"neg">("none");
  const [magneticField, setMagneticField] = useState(false);
  const [step, setStep] = useState(0);

  const beamOn = voltage > 500;
  const deflection = plateCharge === "pos" ? -30 : plateCharge === "neg" ? 30 : 0;
  const magDeflection = magneticField ? 20 : 0;
  const totalDeflect = deflection + magDeflection;
  const emRatio = beamOn ? (1.76e11).toExponential(2) : "—";

  const reset = () => { setVoltage(0); setPlateCharge("none"); setMagneticField(false); setStep(0); };

  const steps = [
    "Open the Cathode Ray Tube simulation",
    "Click 'Start Vacuum Pump' to remove air",
    "Turn on the high voltage power supply",
    "Observe the green beam from cathode to anode",
    "Place electric plates near the beam",
    "Change polarity and observe deflection",
    "Turn on magnetic field switch",
    "Adjust magnetic field strength",
    "Measure deflection distance",
    "Record results in observation table",
  ];

  return (
    <SimulationLayout title="Lab: Cathode Ray Tube Experiment" objective="Discover the electron through beam deflection" theory="J.J. Thomson used electric and magnetic fields to deflect cathode rays, showing they are negatively charged particles (electrons) with a measurable e/m ratio." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Voltage" value={voltage} onChange={v => { setVoltage(v); if (v > 500 && step < 3) setStep(3); }} min={0} max={5000} step={100} unit="V" />
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Plate Charge</span>
          <div className="flex gap-1">
            {(["none","pos","neg"] as const).map(p => (
              <button key={p} onClick={() => { setPlateCharge(p); if (step < 5) setStep(5); }} className={`text-xs px-2 py-1 rounded ${plateCharge === p ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {p === "none" ? "Off" : p === "pos" ? "+ Top" : "− Top"}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={magneticField} onChange={e => { setMagneticField(e.target.checked); if (step < 7) setStep(7); }} className="rounded" />
          Magnetic Field
        </label>
      </div>}
      workspace={
        <svg viewBox="0 0 420 200" className="w-full h-48">
          {/* Tube */}
          <rect x={30} y={40} width={360} height={120} rx={60} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Cathode */}
          <rect x={50} y={70} width={8} height={60} fill="hsl(var(--muted-foreground))" rx={2} />
          <text x={54} y={145} textAnchor="middle" className="text-[7px] fill-muted-foreground">−</text>
          {/* Anode */}
          <rect x={360} y={70} width={8} height={60} fill="hsl(var(--muted-foreground))" rx={2} />
          <text x={364} y={145} textAnchor="middle" className="text-[7px] fill-muted-foreground">+</text>
          {/* Plates */}
          {plateCharge !== "none" && <>
            <rect x={180} y={50} width={60} height={4} fill={plateCharge === "pos" ? "#ef4444" : "#3b82f6"} />
            <rect x={180} y={146} width={60} height={4} fill={plateCharge === "pos" ? "#3b82f6" : "#ef4444"} />
            <text x={210} y={48} textAnchor="middle" className="text-[7px] fill-muted-foreground">{plateCharge === "pos" ? "+" : "−"}</text>
            <text x={210} y={162} textAnchor="middle" className="text-[7px] fill-muted-foreground">{plateCharge === "pos" ? "−" : "+"}</text>
          </>}
          {/* Beam */}
          {beamOn && (
            <line x1={60} y1={100} x2={355} y2={100 + totalDeflect} stroke="#22c55e" strokeWidth={3} opacity={0.8}>
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
            </line>
          )}
          {!beamOn && <text x={210} y={105} textAnchor="middle" className="text-[10px] fill-muted-foreground">Increase voltage to start beam</text>}
          {/* Magnetic field indicator */}
          {magneticField && <text x={340} y={38} className="text-[8px] fill-primary font-bold">B →</text>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Voltage" value={voltage} unit="V" />
        <DataRow label="Beam" value={beamOn ? "ON ✅" : "OFF"} />
        <DataRow label="Deflection" value={`${totalDeflect > 0 ? "+" : ""}${totalDeflect}`} unit="px" />
        <DataRow label="e/m ratio" value={String(emRatio)} unit="C/kg" />
        <DataRow label="Plate" value={plateCharge === "none" ? "Off" : plateCharge === "pos" ? "+ Top" : "− Top"} />
        <DataRow label="B Field" value={magneticField ? "ON" : "OFF"} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// 2. Rutherford Gold Foil
export function RutherfordExperiment() {
  const [energy, setEnergy] = useState(5);
  const [foilThickness, setFoilThickness] = useState(1);
  const [step, setStep] = useState(0);
  const totalParticles = 100;
  const deflected = Math.floor(foilThickness * 8);
  const bounced = Math.floor(foilThickness * 1.5);
  const passed = totalParticles - deflected - bounced;
  const reset = () => { setEnergy(5); setFoilThickness(1); setStep(0); };

  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const type = i < Math.floor(passed / 3.3) ? "pass" : i < Math.floor((passed + deflected) / 3.3) ? "deflect" : "bounce";
      const startY = 30 + (i / 30) * 200;
      const endX = type === "pass" ? 380 : type === "deflect" ? 300 + Math.random() * 80 : 50 + Math.random() * 50;
      const endY = type === "pass" ? startY : type === "deflect" ? startY + (Math.random() - 0.5) * 100 : startY;
      return { startY, endX, endY, type };
    });
  }, [passed, deflected]);

  const steps = [
    "Open the Gold Foil Experiment simulation",
    "Activate the alpha particle emitter",
    "Observe alpha particles striking gold foil",
    "Watch scattering on fluorescent screen",
    "Count particles: pass, deflect, bounce",
    "Adjust foil thickness",
    "Change particle energy level",
    "Record scattering observations",
    "Analyze results for nuclear structure",
  ];

  return (
    <SimulationLayout title="Lab: Rutherford Gold Foil Experiment" objective="Observe alpha particle scattering patterns" theory="Most particles pass through, some deflect, very few bounce back—proving a dense positive nucleus." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Particle Energy" value={energy} onChange={v => { setEnergy(v); if (step < 6) setStep(6); }} min={1} max={10} unit="MeV" />
        <ControlGroup label="Foil Thickness" value={foilThickness} onChange={v => { setFoilThickness(v); if (step < 5) setStep(5); }} min={0.5} max={5} step={0.5} unit="layers" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 260" className="w-full h-52">
          <rect x={195} y={10} width={10} height={240} fill="#eab308" opacity={0.6} />
          <text x={200} y={265} textAnchor="middle" className="text-[8px] fill-muted-foreground">Gold Foil</text>
          <text x={30} y={15} className="text-[8px] fill-muted-foreground">α source</text>
          {particles.map((p, i) => (
            <g key={i}>
              <line x1={20} y1={p.startY} x2={p.endX} y2={p.endY} stroke={p.type === "pass" ? "hsl(var(--primary) / 0.3)" : p.type === "deflect" ? "#f97316" : "#ef4444"} strokeWidth={1} />
              <circle cx={p.endX} cy={p.endY} r={2} fill={p.type === "pass" ? "hsl(var(--primary))" : p.type === "deflect" ? "#f97316" : "#ef4444"} />
            </g>
          ))}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Total Particles" value={totalParticles} />
        <DataRow label="Passed Through" value={`${passed}%`} />
        <DataRow label="Deflected" value={`${deflected}%`} />
        <DataRow label="Bounced Back" value={`${bounced}%`} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// 3. Photoelectric Effect
export function PhotoelectricEffect() {
  const [frequency, setFrequency] = useState(6);
  const [intensity, setIntensity] = useState(5);
  const [step, setStep] = useState(0);
  const h = 6.626e-34;
  const threshold = 4.5e14;
  const freqHz = frequency * 1e14;
  const ke = freqHz > threshold ? h * (freqHz - threshold) : 0;
  const electronsEmitted = freqHz > threshold;
  const numElectrons = electronsEmitted ? Math.floor(intensity * 2) : 0;
  const reset = () => { setFrequency(6); setIntensity(5); setStep(0); };

  const steps = [
    "Start the photoelectric effect simulation",
    "Select a metal surface",
    "Turn on the light source",
    "Adjust the frequency of light",
    "Observe whether electrons are emitted",
    "Increase the intensity of light",
    "Measure kinetic energy of emitted electrons",
    "Identify the threshold frequency",
    "Record observations and conclusions",
  ];

  return (
    <SimulationLayout title="Lab: Photoelectric Effect" objective="KE = hf − φ — Light frequency vs electron emission" theory="Electrons are emitted only if light frequency exceeds the threshold. KE depends on frequency, not intensity." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Frequency" value={frequency} onChange={v => { setFrequency(v); if (step < 3) setStep(3); }} min={1} max={15} step={0.5} unit="×10¹⁴ Hz" />
        <ControlGroup label="Intensity" value={intensity} onChange={v => { setIntensity(v); if (step < 5) setStep(5); }} min={1} max={10} unit="rel" />
        <p className="text-xs text-muted-foreground">Threshold: {(threshold / 1e14).toFixed(1)} ×10¹⁴ Hz</p>
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          <rect x={100} y={60} width={10} height={100} fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth={2} />
          <text x={105} y={180} textAnchor="middle" className="text-[8px] fill-muted-foreground">Metal</text>
          {Array.from({ length: intensity }, (_, i) => (
            <line key={i} x1={20} y1={70 + i * 10} x2={100} y2={70 + i * 10} stroke={freqHz > threshold ? "#a855f7" : "#eab308"} strokeWidth={1.5} />
          ))}
          {electronsEmitted && Array.from({ length: numElectrons }, (_, i) => (
            <circle key={i} cx={130 + i * 15 + Math.random() * 20} cy={80 + i * 8} r={3} fill="#3b82f6">
              <animate attributeName="cx" values={`${115};${200 + i * 20}`} dur="1.5s" repeatCount="indefinite" />
            </circle>
          ))}
          {!electronsEmitted && <text x={250} y={120} className="text-[11px] fill-destructive font-bold">No emission (f {"<"} f₀)</text>}
          <rect x={300} y={60} width={60} height={100} fill="hsl(var(--card))" stroke="hsl(var(--border))" rx={4} />
          <text x={330} y={95} textAnchor="middle" className="text-[7px] fill-muted-foreground">KE meter</text>
          <text x={330} y={120} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{(ke * 1e19).toFixed(2)}</text>
          <text x={330} y={135} textAnchor="middle" className="text-[7px] fill-muted-foreground">×10⁻¹⁹ J</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Frequency" value={`${frequency}×10¹⁴`} unit="Hz" />
        <DataRow label="Threshold" value={`${(threshold / 1e14).toFixed(1)}×10¹⁴`} unit="Hz" />
        <DataRow label="Emission?" value={electronsEmitted ? "Yes ✅" : "No ❌"} />
        <DataRow label="KE" value={`${(ke * 1e19).toFixed(3)}×10⁻¹⁹`} unit="J" />
        <DataRow label="Electrons" value={numElectrons} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ========== UNIT 2: Chemical Bonding ==========

// 4. Ionic Bond Formation
export function IonicBondFormation() {
  const [atomA, setAtomA] = useState<"Na"|"K"|"Ca">("Na");
  const [atomB, setAtomB] = useState<"Cl"|"F"|"O">("Cl");
  const [showTransfer, setShowTransfer] = useState(false);
  const [step, setStep] = useState(0);

  const charges: Record<string, number> = { Na: 1, K: 1, Ca: 2, Cl: -1, F: -1, O: -2 };
  const chargeA = charges[atomA];
  const chargeB = charges[atomB];
  const latticeEnergy = Math.abs(chargeA * chargeB) * 450;

  const reset = () => { setAtomA("Na"); setAtomB("Cl"); setShowTransfer(false); setStep(0); };

  const steps = [
    "Open the ionic bonding simulation",
    "Select sodium (Na) and chlorine (Cl) atoms",
    "Drag atoms into the reaction area",
    "Observe electron transfer from Na to Cl",
    "Watch formation of Na⁺ and Cl⁻ ions",
    "Observe electrostatic attraction between ions",
    "Build the ionic crystal lattice",
    "Measure lattice energy",
    "Record the bond formation process",
  ];

  return (
    <SimulationLayout title="Lab: Ionic Bond Formation" objective="Observe electron transfer and ionic crystal formation" theory="Ionic bonds form when electrons transfer from metal to non-metal atoms. The resulting ions attract via electrostatic force, forming a crystal lattice." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Metal Atom</span>
          <div className="flex gap-1">
            {(["Na","K","Ca"] as const).map(a => (
              <button key={a} onClick={() => { setAtomA(a); setShowTransfer(false); if (step < 1) setStep(1); }} className={`text-xs px-2 py-1 rounded ${atomA === a ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{a}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Non-metal Atom</span>
          <div className="flex gap-1">
            {(["Cl","F","O"] as const).map(b => (
              <button key={b} onClick={() => { setAtomB(b); setShowTransfer(false); if (step < 1) setStep(1); }} className={`text-xs px-2 py-1 rounded ${atomB === b ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{b}</button>
            ))}
          </div>
        </div>
        <button onClick={() => { setShowTransfer(true); setStep(3); }} className="w-full text-xs px-2 py-2 rounded bg-primary text-primary-foreground">
          Show Electron Transfer
        </button>
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          {/* Metal atom */}
          <circle cx={120} cy={110} r={35} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} />
          <text x={120} y={115} textAnchor="middle" className="text-[14px] fill-primary font-bold">{atomA}</text>
          {!showTransfer && Array.from({ length: chargeA }, (_, i) => (
            <circle key={i} cx={120 + 40 * Math.cos(i * Math.PI)} cy={110 + 40 * Math.sin(i * Math.PI)} r={4} fill="#ef4444">
              <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite" />
            </circle>
          ))}

          {/* Non-metal atom */}
          <circle cx={280} cy={110} r={35} fill="hsl(var(--accent) / 0.2)" stroke="hsl(var(--accent-foreground))" strokeWidth={2} />
          <text x={280} y={115} textAnchor="middle" className="text-[14px] fill-foreground font-bold">{atomB}</text>

          {/* Electron transfer animation */}
          {showTransfer && <>
            <circle r={4} fill="#ef4444">
              <animate attributeName="cx" values="160;240" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="cy" values="110;110" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <text x={120} y={160} textAnchor="middle" className="text-[11px] fill-primary font-bold">{atomA}{chargeA > 0 ? `${chargeA}+` : ""}</text>
            <text x={280} y={160} textAnchor="middle" className="text-[11px] fill-destructive font-bold">{atomB}{Math.abs(chargeB)}−</text>
            {/* Attraction arrow */}
            <line x1={155} y1={110} x2={245} y2={110} stroke="hsl(var(--foreground))" strokeWidth={1} strokeDasharray="4,4" markerEnd="url(#arrow)" />
            <text x={200} y={95} textAnchor="middle" className="text-[8px] fill-muted-foreground">Electrostatic attraction</text>
          </>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Metal" value={`${atomA} (${chargeA}+ valence e⁻)`} />
        <DataRow label="Non-metal" value={atomB} />
        <DataRow label="Bond Type" value="Ionic" />
        <DataRow label="Charge A" value={showTransfer ? `${chargeA}+` : "0"} />
        <DataRow label="Charge B" value={showTransfer ? `${Math.abs(chargeB)}−` : "0"} />
        <DataRow label="Lattice Energy" value={latticeEnergy} unit="kJ/mol" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// 5. VSEPR Molecular Geometry
export function VSEPRGeometry() {
  const [bondPairs, setBondPairs] = useState(4);
  const [lonePairs, setLonePairs] = useState(0);
  const [step, setStep] = useState(0);

  const shapes: Record<string, { name: string; angle: number }> = {
    "2-0": { name: "Linear", angle: 180 },
    "3-0": { name: "Trigonal Planar", angle: 120 },
    "3-1": { name: "Trigonal Pyramidal", angle: 107 },
    "4-0": { name: "Tetrahedral", angle: 109.5 },
    "4-1": { name: "See-saw", angle: 90 },
    "4-2": { name: "Square Planar", angle: 90 },
    "2-1": { name: "Bent", angle: 120 },
    "2-2": { name: "Bent", angle: 104.5 },
  };
  const key = `${bondPairs}-${lonePairs}`;
  const shape = shapes[key] || { name: "Complex", angle: 0 };

  const reset = () => { setBondPairs(4); setLonePairs(0); setStep(0); };

  const steps = [
    "Open the molecular geometry simulator",
    "Select a central atom",
    "Add bonded atoms around the central atom",
    "Add lone pairs if necessary",
    "Rotate the molecule in 3D view",
    "Measure bond angles",
    "Identify the molecular shape",
    "Compare predicted vs actual geometry",
    "Record results",
  ];

  // Generate atom positions around center
  const totalPairs = bondPairs + lonePairs;
  const atoms = Array.from({ length: bondPairs }, (_, i) => {
    const angle = (i / totalPairs) * 2 * Math.PI - Math.PI / 2;
    return { x: 200 + 70 * Math.cos(angle), y: 110 + 70 * Math.sin(angle) };
  });
  const lones = Array.from({ length: lonePairs }, (_, i) => {
    const angle = ((bondPairs + i) / totalPairs) * 2 * Math.PI - Math.PI / 2;
    return { x: 200 + 50 * Math.cos(angle), y: 110 + 50 * Math.sin(angle) };
  });

  return (
    <SimulationLayout title="Lab: VSEPR Molecular Geometry" objective="Predict molecular shapes from electron pair repulsion" theory="VSEPR: electron pairs around a central atom arrange to minimize repulsion. Lone pairs occupy more space than bonding pairs." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Bond Pairs" value={bondPairs} onChange={v => { setBondPairs(v); if (step < 2) setStep(2); }} min={2} max={4} step={1} />
        <ControlGroup label="Lone Pairs" value={lonePairs} onChange={v => { setLonePairs(v); if (step < 3) setStep(3); }} min={0} max={2} step={1} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          {/* Central atom */}
          <circle cx={200} cy={110} r={18} fill="hsl(var(--primary) / 0.3)" stroke="hsl(var(--primary))" strokeWidth={2} />
          <text x={200} y={115} textAnchor="middle" className="text-[11px] fill-primary font-bold">C</text>
          {/* Bond pairs */}
          {atoms.map((a, i) => (
            <g key={`b${i}`}>
              <line x1={200} y1={110} x2={a.x} y2={a.y} stroke="hsl(var(--foreground))" strokeWidth={2} />
              <circle cx={a.x} cy={a.y} r={12} fill="hsl(var(--accent) / 0.3)" stroke="hsl(var(--accent-foreground))" strokeWidth={1.5} />
              <text x={a.x} y={a.y + 4} textAnchor="middle" className="text-[9px] fill-foreground font-bold">X</text>
            </g>
          ))}
          {/* Lone pairs */}
          {lones.map((l, i) => (
            <g key={`l${i}`}>
              <line x1={200} y1={110} x2={l.x} y2={l.y} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4,3" />
              <text x={l.x} y={l.y + 4} textAnchor="middle" className="text-[8px] fill-muted-foreground">••</text>
            </g>
          ))}
          {/* Shape label */}
          <text x={200} y={205} textAnchor="middle" className="text-[12px] fill-foreground font-bold">{shape.name}</text>
          <text x={200} y={218} textAnchor="middle" className="text-[9px] fill-muted-foreground">Bond angle ≈ {shape.angle}°</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Bond Pairs" value={bondPairs} />
        <DataRow label="Lone Pairs" value={lonePairs} />
        <DataRow label="Shape" value={shape.name} />
        <DataRow label="Bond Angle" value={shape.angle} unit="°" />
        <DataRow label="Total e⁻ Domains" value={totalPairs} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// 6. Metallic Bonding
export function MetallicBonding() {
  const [temperature, setTemperature] = useState(25);
  const [force, setForce] = useState(false);
  const [step, setStep] = useState(0);

  const electronSpeed = 1 + temperature / 50;
  const vibration = temperature / 100;
  const conductivity = force ? "High (electrons flow)" : "Ready";

  const reset = () => { setTemperature(25); setForce(false); setStep(0); };

  const steps = [
    "Open the metallic bonding simulation",
    "Place positive metal ions in a lattice",
    "Add delocalized electrons",
    "Increase temperature using the heat slider",
    "Observe electron mobility",
    "Apply external force to test conductivity",
    "Observe electron flow through the lattice",
    "Record conductivity observations",
  ];

  const ions = Array.from({ length: 12 }, (_, i) => ({
    x: 80 + (i % 4) * 80,
    y: 60 + Math.floor(i / 4) * 60,
  }));

  return (
    <SimulationLayout title="Lab: Metallic Bonding (Electron Sea)" objective="Visualize delocalized electrons in a metallic lattice" theory="Metal atoms lose outer electrons to form a 'sea' of delocalized electrons. These free electrons enable electrical and thermal conductivity." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Temperature" value={temperature} onChange={v => { setTemperature(v); if (step < 3) setStep(3); }} min={0} max={500} step={10} unit="°C" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={force} onChange={e => { setForce(e.target.checked); if (step < 5) setStep(5); }} className="rounded" />
          Apply Electric Force
        </label>
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          <rect x={40} y={30} width={320} height={170} fill="hsl(var(--muted) / 0.2)" stroke="hsl(var(--border))" strokeWidth={1} rx={4} />
          {/* Ion cores */}
          {ions.map((ion, i) => (
            <g key={i}>
              <circle cx={ion.x} cy={ion.y} r={14} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={1.5}>
                {temperature > 50 && <animate attributeName="cx" values={`${ion.x - vibration * 3};${ion.x + vibration * 3}`} dur={`${0.3 / electronSpeed}s`} repeatCount="indefinite" />}
              </circle>
              <text x={ion.x} y={ion.y + 4} textAnchor="middle" className="text-[8px] fill-primary font-bold">M⁺</text>
            </g>
          ))}
          {/* Free electrons */}
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={`e${i}`} r={3} fill="#3b82f6" opacity={0.7}>
              <animate attributeName="cx" values={force ? "60;340" : `${80 + i * 35};${120 + i * 30};${80 + i * 35}`} dur={`${2 / electronSpeed}s`} repeatCount="indefinite" />
              <animate attributeName="cy" values={`${55 + i * 18};${75 + i * 15};${55 + i * 18}`} dur={`${1.5 / electronSpeed}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {force && <>
            <text x={30} y={20} className="text-[8px] fill-destructive font-bold">+ V</text>
            <text x={370} y={20} className="text-[8px] fill-primary font-bold">− V</text>
          </>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Temperature" value={temperature} unit="°C" />
        <DataRow label="Electron Speed" value={electronSpeed.toFixed(1)} unit="rel" />
        <DataRow label="Ion Vibration" value={vibration.toFixed(2)} unit="rel" />
        <DataRow label="Conductivity" value={conductivity} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ========== UNIT 3: States of Matter ==========

// 7. Kinetic Molecular Theory
export function KineticMolecularTheory() {
  const [temperature, setTemperature] = useState(25);
  const [step, setStep] = useState(0);

  const state = temperature < 0 ? "Solid" : temperature < 100 ? "Liquid" : "Gas";
  const speed = state === "Solid" ? 0.3 : state === "Liquid" ? 1 : 3;
  const spacing = state === "Solid" ? 20 : state === "Liquid" ? 30 : 50;
  const pressure = state === "Gas" ? (temperature / 100 * 1.5).toFixed(2) : "—";
  const avgKE = (1.5 * 1.38e-23 * (temperature + 273)).toExponential(2);

  const reset = () => { setTemperature(25); setStep(0); };

  const steps = [
    "Open the particle motion simulator",
    "Select solid state",
    "Observe particle vibration",
    "Increase temperature gradually",
    "Watch particles transition to liquid state",
    "Continue heating until gas state appears",
    "Observe particle speed and spacing",
    "Record particle behavior for each state",
  ];

  const particles = Array.from({ length: 16 }, (_, i) => ({
    baseX: 120 + (i % 4) * spacing,
    baseY: 70 + Math.floor(i / 4) * spacing,
  }));

  return (
    <SimulationLayout title="Lab: Kinetic Molecular Theory" objective="Observe particle motion in solid, liquid, and gas states" theory="Particles in solids vibrate in place, in liquids they slide past each other, and in gases they move freely and rapidly." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Temperature" value={temperature} onChange={v => { setTemperature(v); if (step < 3) setStep(3); }} min={-50} max={200} step={5} unit="°C" />
        <div className={`text-xs font-bold px-2 py-1 rounded text-center ${state === "Solid" ? "bg-blue-100 text-blue-800" : state === "Liquid" ? "bg-cyan-100 text-cyan-800" : "bg-red-100 text-red-800"}`}>
          State: {state}
        </div>
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          <rect x={80} y={40} width={240} height={160} fill="hsl(var(--muted) / 0.2)" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          {particles.map((p, i) => {
            const range = state === "Solid" ? 3 : state === "Liquid" ? 15 : 40;
            return (
              <circle key={i} r={5} fill={state === "Solid" ? "#3b82f6" : state === "Liquid" ? "#06b6d4" : "#ef4444"} opacity={0.8}>
                <animate attributeName="cx" values={`${p.baseX - range};${p.baseX + range};${p.baseX - range}`} dur={`${2 / speed}s`} repeatCount="indefinite" />
                <animate attributeName="cy" values={`${p.baseY - range};${p.baseY + range};${p.baseY - range}`} dur={`${1.5 / speed}s`} repeatCount="indefinite" />
              </circle>
            );
          })}
          <text x={200} y={215} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{state} — T = {temperature}°C</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="State" value={state} />
        <DataRow label="Temperature" value={temperature} unit="°C" />
        <DataRow label="Particle Speed" value={speed.toFixed(1)} unit="rel" />
        <DataRow label="Avg KE" value={avgKE} unit="J" />
        <DataRow label="Pressure" value={String(pressure)} unit={state === "Gas" ? "atm" : ""} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// 8. Boyle's Law
export function BoylesLaw() {
  const [volume, setVolume] = useState(10);
  const [step, setStep] = useState(0);
  const k = 1000; // PV = k
  const pressure = k / volume;

  const reset = () => { setVolume(10); setStep(0); };

  const steps = [
    "Open the Boyle's law simulator",
    "Set a fixed temperature",
    "Adjust the piston to change volume",
    "Observe changes in gas pressure",
    "Record pressure and volume values",
    "Repeat for several volumes",
    "Plot pressure vs volume graph",
    "Verify Boyle's law relationship",
  ];

  const pistonX = 100 + volume * 15;
  const dataPoints = [2, 4, 6, 8, 10, 15, 20].map(v => ({ v, p: k / v }));

  return (
    <SimulationLayout title="Lab: Boyle's Law (PV = k)" objective="Verify that pressure is inversely proportional to volume at constant temperature" theory="Boyle's Law: PV = constant (at constant T). Halving volume doubles pressure." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Volume" value={volume} onChange={v => { setVolume(v); if (step < 2) setStep(2); }} min={2} max={20} step={1} unit="L" />
        <p className="text-xs text-muted-foreground">Temperature: 25°C (fixed)</p>
      </div>}
      workspace={
        <svg viewBox="0 0 420 220" className="w-full h-48">
          {/* Cylinder */}
          <rect x={80} y={50} width={250} height={100} fill="hsl(var(--muted) / 0.2)" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          {/* Piston */}
          <rect x={pistonX} y={45} width={15} height={110} fill="hsl(var(--muted-foreground))" rx={2} />
          <text x={pistonX + 7} y={170} textAnchor="middle" className="text-[7px] fill-muted-foreground">Piston</text>
          {/* Gas particles */}
          {Array.from({ length: 8 }, (_, i) => {
            const maxX = pistonX - 90;
            return (
              <circle key={i} r={3} fill="hsl(var(--primary))" opacity={0.6}>
                <animate attributeName="cx" values={`${90 + Math.random() * maxX};${90 + Math.random() * maxX};${90 + Math.random() * maxX}`} dur={`${0.5 + Math.random()}s`} repeatCount="indefinite" />
                <animate attributeName="cy" values={`${60 + Math.random() * 80};${60 + Math.random() * 80};${60 + Math.random() * 80}`} dur={`${0.5 + Math.random()}s`} repeatCount="indefinite" />
              </circle>
            );
          })}
          {/* Pressure gauge */}
          <rect x={340} y={55} width={55} height={40} fill="hsl(var(--card))" stroke="hsl(var(--border))" rx={4} />
          <text x={367} y={70} textAnchor="middle" className="text-[7px] fill-muted-foreground">Pressure</text>
          <text x={367} y={88} textAnchor="middle" className="text-[11px] fill-foreground font-bold">{pressure.toFixed(0)}</text>

          {/* Mini PV graph */}
          <text x={360} y={115} textAnchor="middle" className="text-[7px] fill-muted-foreground">P vs V</text>
          <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5}
            points={dataPoints.map(d => `${335 + d.v * 3},${120 + 80 - d.p * 0.16}`).join(" ")} />
          <circle cx={335 + volume * 3} cy={120 + 80 - pressure * 0.16} r={3} fill="#ef4444" />
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Volume" value={volume} unit="L" />
        <DataRow label="Pressure" value={pressure.toFixed(1)} unit="kPa" />
        <DataRow label="PV" value={(pressure * volume).toFixed(0)} unit="kPa·L" />
        <DataRow label="Temperature" value="25" unit="°C" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// 9. Heating Curve
export function HeatingCurve() {
  const [heat, setHeat] = useState(0);
  const [step, setStep] = useState(0);

  // Heating curve logic
  const getTemp = (h: number) => {
    if (h < 20) return -20 + h * 1; // solid heating
    if (h < 40) return 0; // melting plateau
    if (h < 70) return (h - 40) * 3.33; // liquid heating
    if (h < 90) return 100; // boiling plateau
    return 100 + (h - 90) * 5; // gas heating
  };
  const temp = getTemp(heat);
  const phase = temp < 0 ? "Solid (Ice)" : heat < 40 && temp === 0 ? "Melting" : temp < 100 ? "Liquid (Water)" : heat < 90 ? "Boiling" : "Gas (Steam)";

  const reset = () => { setHeat(0); setStep(0); };

  const steps = [
    "Place a sample in the virtual beaker",
    "Turn on the heater",
    "Measure temperature over time",
    "Observe solid heating phase",
    "Watch melting plateau",
    "Continue heating until boiling occurs",
    "Observe boiling plateau",
    "Record temperature-time data",
    "Plot the heating curve graph",
  ];

  // Generate curve points
  const curvePoints = Array.from({ length: 50 }, (_, i) => {
    const h = i * 2;
    const t = getTemp(h);
    return `${80 + h * 2.5},${180 - t * 0.8}`;
  }).join(" ");

  return (
    <SimulationLayout title="Lab: Heating Curve of Water" objective="Observe temperature plateaus during phase changes" theory="During phase changes (melting/boiling), temperature remains constant as energy breaks intermolecular bonds rather than increasing kinetic energy." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Heat Added" value={heat} onChange={v => { setHeat(v); if (step < 1) setStep(Math.min(8, Math.floor(v / 12))); }} min={0} max={100} step={1} unit="kJ" />
        <div className={`text-xs font-bold px-2 py-1 rounded text-center ${phase.includes("Solid") ? "bg-blue-100 text-blue-800" : phase === "Melting" ? "bg-cyan-100 text-cyan-800" : phase.includes("Liquid") ? "bg-sky-100 text-sky-800" : phase === "Boiling" ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"}`}>
          {phase}
        </div>
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          {/* Axes */}
          <line x1={70} y1={190} x2={370} y2={190} stroke="hsl(var(--border))" strokeWidth={1} />
          <line x1={70} y1={10} x2={70} y2={190} stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={220} y={210} textAnchor="middle" className="text-[8px] fill-muted-foreground">Heat Added (kJ)</text>
          <text x={20} y={100} textAnchor="middle" className="text-[8px] fill-muted-foreground" transform="rotate(-90,20,100)">Temp (°C)</text>
          {/* Gridlines */}
          <line x1={70} y1={180} x2={370} y2={180} stroke="hsl(var(--border) / 0.3)" strokeWidth={0.5} />
          <text x={65} y={183} textAnchor="end" className="text-[6px] fill-muted-foreground">0°C</text>
          <line x1={70} y1={100} x2={370} y2={100} stroke="hsl(var(--border) / 0.3)" strokeWidth={0.5} />
          <text x={65} y={103} textAnchor="end" className="text-[6px] fill-muted-foreground">100°C</text>
          {/* Heating curve */}
          <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth={2} points={curvePoints} />
          {/* Current point */}
          <circle cx={80 + heat * 2.5} cy={180 - temp * 0.8} r={5} fill="#ef4444" stroke="white" strokeWidth={1.5} />
          <text x={80 + heat * 2.5} y={180 - temp * 0.8 - 10} textAnchor="middle" className="text-[8px] fill-foreground font-bold">{temp.toFixed(0)}°C</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Temperature" value={temp.toFixed(1)} unit="°C" />
        <DataRow label="Phase" value={phase} />
        <DataRow label="Heat Added" value={heat} unit="kJ" />
        <DataRow label="Melting Pt" value="0" unit="°C" />
        <DataRow label="Boiling Pt" value="100" unit="°C" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ========== UNIT 4: Chemical Kinetics ==========

// 10. Reaction Rate
export function ReactionRate() {
  const [concentration, setConcentration] = useState(1);
  const [temp, setTemp] = useState(25);
  const [step, setStep] = useState(0);

  const baseRate = concentration * 0.5;
  const tempFactor = Math.pow(2, (temp - 25) / 10);
  const rate = baseRate * tempFactor;
  const reactionProgress = Math.min(100, rate * 20);

  const reset = () => { setConcentration(1); setTemp(25); setStep(0); };

  const steps = [
    "Open the reaction rate simulation",
    "Select reactants in the reaction flask",
    "Set initial concentration",
    "Start the reaction timer",
    "Observe color change or product formation",
    "Record reaction time",
    "Repeat with different concentrations",
    "Compare reaction rates",
    "Plot concentration vs time graph",
  ];

  return (
    <SimulationLayout title="Lab: Reaction Rate Experiment" objective="Study how concentration and temperature affect reaction rate" theory="Increasing concentration increases collision frequency. Increasing temperature increases particle energy and collision rate." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Concentration" value={concentration} onChange={v => { setConcentration(v); if (step < 2) setStep(2); }} min={0.1} max={3} step={0.1} unit="M" />
        <ControlGroup label="Temperature" value={temp} onChange={v => { setTemp(v); if (step < 4) setStep(4); }} min={0} max={100} unit="°C" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          {/* Flask */}
          <path d="M150,50 L150,120 C150,170 250,170 250,120 L250,50" fill={`hsl(var(--primary) / ${0.1 + concentration * 0.2})`} stroke="hsl(var(--border))" strokeWidth={2} />
          <text x={200} y={185} textAnchor="middle" className="text-[8px] fill-muted-foreground">Reaction Flask</text>
          {/* Bubbles if reacting */}
          {rate > 1 && Array.from({ length: Math.min(8, Math.floor(rate)) }, (_, i) => (
            <circle key={i} r={2 + Math.random() * 2} fill="hsl(var(--primary) / 0.4)">
              <animate attributeName="cx" values={`${170 + Math.random() * 60}`} dur="1s" repeatCount="indefinite" />
              <animate attributeName="cy" values={`${140};${60}`} dur={`${1 + Math.random()}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Progress bar */}
          <rect x={280} y={50} width={20} height={120} fill="hsl(var(--muted))" stroke="hsl(var(--border))" rx={3} />
          <rect x={280} y={50 + 120 - reactionProgress * 1.2} width={20} height={reactionProgress * 1.2} fill="hsl(var(--primary))" rx={3} />
          <text x={290} y={185} textAnchor="middle" className="text-[7px] fill-muted-foreground">{reactionProgress.toFixed(0)}%</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Concentration" value={concentration.toFixed(1)} unit="M" />
        <DataRow label="Temperature" value={temp} unit="°C" />
        <DataRow label="Rate" value={rate.toFixed(2)} unit="mol/s" />
        <DataRow label="Temp Factor" value={tempFactor.toFixed(1)} unit="×" />
        <DataRow label="Progress" value={`${reactionProgress.toFixed(0)}`} unit="%" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// 11. Catalyst Simulation
export function CatalystSimulation() {
  const [catalyst, setCatalyst] = useState(false);
  const [temp, setTemp] = useState(25);
  const [step, setStep] = useState(0);

  const baseRate = 1;
  const tempFactor = Math.pow(2, (temp - 25) / 10);
  const catalystFactor = catalyst ? 3 : 1;
  const rate = baseRate * tempFactor * catalystFactor;
  const activationE = catalyst ? 40 : 75;
  const reset = () => { setCatalyst(false); setTemp(25); setStep(0); };

  const steps = [
    "Start the catalyst simulation",
    "Run the reaction without catalyst",
    "Measure reaction time",
    "Reset the experiment",
    "Add a catalyst to the reaction mixture",
    "Start the reaction again",
    "Observe faster reaction progress",
    "Compare activation energy diagrams",
    "Record conclusions",
  ];

  return (
    <SimulationLayout title="Lab: Catalyst & Activation Energy" objective="Compare reaction rates with and without a catalyst" theory="Catalysts lower activation energy by providing an alternative pathway, increasing the fraction of molecules with sufficient energy to react." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Temperature" value={temp} onChange={v => { setTemp(v); if (step < 2) setStep(2); }} min={0} max={100} unit="°C" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={catalyst} onChange={e => { setCatalyst(e.target.checked); if (e.target.checked && step < 4) setStep(4); }} className="rounded" />
          Add Catalyst (MnO₂)
        </label>
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          <text x={200} y={15} textAnchor="middle" className="text-[9px] fill-muted-foreground font-semibold">Energy Profile Diagram</text>
          <line x1={40} y1={200} x2={360} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          <line x1={40} y1={20} x2={40} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={35} y={15} textAnchor="end" className="text-[7px] fill-muted-foreground">Energy</text>
          <text x={360} y={215} className="text-[7px] fill-muted-foreground">Progress</text>
          {/* Reactants level */}
          <line x1={50} y1={150} x2={120} y2={150} stroke="hsl(var(--primary))" strokeWidth={2} />
          <text x={85} y={165} textAnchor="middle" className="text-[7px] fill-primary">Reactants</text>
          {/* Without catalyst (always shown dashed) */}
          <path d="M120,150 Q200,50 280,170" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4,4" />
          <text x={200} y={45} textAnchor="middle" className="text-[7px] fill-muted-foreground">Without catalyst</text>
          {/* Active path */}
          <path d={`M120,150 Q200,${200 - activationE * 2} 280,170`} fill="none" stroke={catalyst ? "#22c55e" : "hsl(var(--primary))"} strokeWidth={2} />
          {/* Products level */}
          <line x1={280} y1={170} x2={350} y2={170} stroke="hsl(var(--secondary))" strokeWidth={2} />
          <text x={315} y={185} textAnchor="middle" className="text-[7px] fill-muted-foreground">Products</text>
          <text x={200} y={200 - activationE * 2 + 15} textAnchor="middle" className="text-[8px] fill-foreground font-bold">Ea = {activationE} kJ/mol</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Temperature" value={temp} unit="°C" />
        <DataRow label="Catalyst" value={catalyst ? "MnO₂ ✅" : "None"} />
        <DataRow label="Activation E" value={activationE} unit="kJ/mol" />
        <DataRow label="Rate Factor" value={rate.toFixed(2)} unit="×" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ========== UNIT 5: Chemical Equilibrium ==========

// 12. Reversible Reaction
export function ReversibleReaction() {
  const [reactantConc, setReactantConc] = useState(80);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);

  const productConc = 100 - reactantConc;
  const forwardRate = reactantConc * 0.05;
  const reverseRate = productConc * 0.05;
  const atEquilibrium = Math.abs(forwardRate - reverseRate) < 1;
  const keq = productConc > 0 ? (productConc / reactantConc).toFixed(2) : "—";

  const reset = () => { setReactantConc(80); setTime(0); setStep(0); };

  const steps = [
    "Open the reversible reaction simulator",
    "Add reactants to the reaction chamber",
    "Start the reaction",
    "Observe forward reaction forming products",
    "Watch reverse reaction forming reactants",
    "Continue until equilibrium is reached",
    "Measure concentrations at equilibrium",
    "Record equilibrium constant values",
  ];

  return (
    <SimulationLayout title="Lab: Reversible Reaction Simulation" objective="Observe dynamic equilibrium in a reversible reaction" theory="In a reversible reaction, both forward and reverse reactions occur. At equilibrium, rates are equal and concentrations are constant." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="[Reactants]" value={reactantConc} onChange={v => { setReactantConc(v); if (step < 1) setStep(1); }} min={10} max={90} step={5} unit="%" />
        <ControlGroup label="Time" value={time} onChange={v => { setTime(v); if (step < 2) setStep(2); }} min={0} max={100} step={5} unit="s" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          {/* Container */}
          <rect x={60} y={40} width={280} height={130} fill="hsl(var(--muted) / 0.2)" stroke="hsl(var(--border))" strokeWidth={2} rx={6} />
          {/* Reactant bar */}
          <rect x={80} y={60} width={Math.max(10, reactantConc * 2.2)} height={35} fill="hsl(var(--primary) / 0.6)" rx={3} />
          <text x={85} y={82} className="text-[9px] fill-primary-foreground font-bold">Reactants ({reactantConc}%)</text>
          {/* Product bar */}
          <rect x={80} y={110} width={Math.max(10, productConc * 2.2)} height={35} fill="hsl(var(--accent) / 0.6)" rx={3} />
          <text x={85} y={132} className="text-[9px] fill-foreground font-bold">Products ({productConc}%)</text>
          {/* Arrows */}
          <text x={200} y={180} textAnchor="middle" className="text-[8px] fill-muted-foreground">
            Forward: {forwardRate.toFixed(1)} | Reverse: {reverseRate.toFixed(1)}
          </text>
          {atEquilibrium && <text x={200} y={200} textAnchor="middle" className="text-[11px] fill-primary font-bold">⟷ Dynamic Equilibrium ⟷</text>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="[Reactants]" value={`${reactantConc}`} unit="%" />
        <DataRow label="[Products]" value={`${productConc}`} unit="%" />
        <DataRow label="Forward Rate" value={forwardRate.toFixed(1)} />
        <DataRow label="Reverse Rate" value={reverseRate.toFixed(1)} />
        <DataRow label="Keq" value={keq} />
        <DataRow label="Equilibrium?" value={atEquilibrium ? "Yes ✅" : "No"} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// 13. Le Chatelier's Principle
export function LeChatelierPrinciple() {
  const [reactantAdded, setReactantAdded] = useState(0);
  const [temperature, setTemperature] = useState(50);
  const [pressure, setPressure] = useState(50);
  const [step, setStep] = useState(0);

  const shift = reactantAdded * 0.3 + (temperature - 50) * -0.02 + (pressure - 50) * 0.02;
  const direction = shift > 1 ? "Right (→ Products)" : shift < -1 ? "Left (← Reactants)" : "Equilibrium";
  const productConc = 50 + shift * 10;
  const reactantConc = 50 - shift * 10;
  const reset = () => { setReactantAdded(0); setTemperature(50); setPressure(50); setStep(0); };

  const steps = [
    "Start the equilibrium simulation",
    "Establish initial equilibrium",
    "Add more reactant",
    "Observe shift in equilibrium direction",
    "Change temperature",
    "Observe new equilibrium position",
    "Increase pressure (for gases)",
    "Record system responses",
  ];

  return (
    <SimulationLayout title="Lab: Le Chatelier's Principle" objective="Observe equilibrium shifts when conditions change" theory="A system at equilibrium shifts to counteract any imposed change in concentration, temperature, or pressure." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Add Reactant" value={reactantAdded} onChange={v => { setReactantAdded(v); if (step < 2) setStep(2); }} min={0} max={20} step={1} unit="mol" />
        <ControlGroup label="Temperature" value={temperature} onChange={v => { setTemperature(v); if (step < 4) setStep(4); }} min={0} max={100} unit="°C" />
        <ControlGroup label="Pressure" value={pressure} onChange={v => { setPressure(v); if (step < 6) setStep(6); }} min={10} max={100} unit="atm" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-44">
          <rect x={50} y={40} width={300} height={120} fill="hsl(var(--muted) / 0.5)" stroke="hsl(var(--border))" strokeWidth={2} rx={6} />
          <rect x={60} y={50} width={Math.max(10, reactantConc * 2.5)} height={40} fill="hsl(var(--primary) / 0.6)" rx={3} />
          <text x={65} y={75} className="text-[9px] fill-primary-foreground font-bold">Reactants</text>
          <rect x={60} y={100} width={Math.max(10, productConc * 2.5)} height={40} fill="hsl(var(--accent) / 0.6)" rx={3} />
          <text x={65} y={125} className="text-[9px] fill-foreground font-bold">Products</text>
          <text x={200} y={175} textAnchor="middle" className="text-[11px] fill-foreground font-bold">
            {shift > 1 ? "⟶ Shift Right" : shift < -1 ? "⟵ Shift Left" : "⟷ At Equilibrium"}
          </text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Shift" value={direction} />
        <DataRow label="[Reactants]" value={reactantConc.toFixed(1)} unit="%" />
        <DataRow label="[Products]" value={productConc.toFixed(1)} unit="%" />
        <DataRow label="Temperature" value={temperature} unit="°C" />
        <DataRow label="Pressure" value={pressure} unit="atm" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ========== UNIT 6: Organic Chemistry ==========

// 14. Esterification
export function Esterification() {
  const [acid, setAcid] = useState<"ethanoic"|"methanoic">("ethanoic");
  const [alcohol, setAlcohol] = useState<"ethanol"|"methanol">("ethanol");
  const [heat, setHeat] = useState(0);
  const [catalystAdded, setCatalystAdded] = useState(false);
  const [step, setStep] = useState(0);

  const reactionProgress = catalystAdded ? Math.min(100, heat * 1.5) : Math.min(60, heat * 0.8);
  const esterFormed = reactionProgress > 50;
  const esterName = acid === "ethanoic" && alcohol === "ethanol" ? "Ethyl ethanoate" : acid === "ethanoic" ? "Methyl ethanoate" : alcohol === "ethanol" ? "Ethyl methanoate" : "Methyl methanoate";
  const smellDetected = reactionProgress > 70;

  const reset = () => { setAcid("ethanoic"); setAlcohol("ethanol"); setHeat(0); setCatalystAdded(false); setStep(0); };

  const steps = [
    "Add carboxylic acid to the reaction flask",
    "Add alcohol to the mixture",
    "Add acid catalyst",
    "Heat the mixture gently",
    "Observe formation of ester and water",
    "Detect fruity smell (virtual indicator)",
    "Record reaction products",
  ];

  return (
    <SimulationLayout title="Lab: Esterification Reaction" objective="Form an ester from a carboxylic acid and an alcohol" theory="Esterification: Acid + Alcohol → Ester + Water (condensation reaction). Acid catalyst (H₂SO₄) speeds up the reaction." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Carboxylic Acid</span>
          <div className="flex gap-1">
            {(["ethanoic","methanoic"] as const).map(a => (
              <button key={a} onClick={() => { setAcid(a); if (step < 1) setStep(0); }} className={`text-xs px-2 py-1 rounded capitalize ${acid === a ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{a}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Alcohol</span>
          <div className="flex gap-1">
            {(["ethanol","methanol"] as const).map(a => (
              <button key={a} onClick={() => { setAlcohol(a); if (step < 1) setStep(1); }} className={`text-xs px-2 py-1 rounded capitalize ${alcohol === a ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{a}</button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={catalystAdded} onChange={e => { setCatalystAdded(e.target.checked); if (step < 2) setStep(2); }} className="rounded" />
          Add H₂SO₄ Catalyst
        </label>
        <ControlGroup label="Heat" value={heat} onChange={v => { setHeat(v); if (step < 3) setStep(3); }} min={0} max={100} step={5} unit="°C" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          {/* Flask */}
          <path d="M140,40 L140,100 C140,160 260,160 260,100 L260,40" fill={esterFormed ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted) / 0.3)"} stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Heat indicator */}
          {heat > 0 && <>
            <rect x={160} y={165} width={80} height={8} fill="#ef4444" opacity={heat / 100} rx={2} />
            <text x={200} y={190} textAnchor="middle" className="text-[7px] fill-muted-foreground">🔥 {heat}°C</text>
          </>}
          {/* Reaction equation */}
          <text x={200} y={25} textAnchor="middle" className="text-[8px] fill-muted-foreground">
            {acid === "ethanoic" ? "CH₃COOH" : "HCOOH"} + {alcohol === "ethanol" ? "C₂H₅OH" : "CH₃OH"}
          </text>
          {esterFormed && <>
            <text x={200} y={85} textAnchor="middle" className="text-[10px] fill-primary font-bold">→ {esterName}</text>
            <text x={200} y={100} textAnchor="middle" className="text-[8px] fill-muted-foreground">+ H₂O</text>
          </>}
          {/* Smell indicator */}
          {smellDetected && <text x={320} y={80} className="text-[20px]">🍎</text>}
          {/* Progress */}
          <rect x={300} y={40} width={15} height={120} fill="hsl(var(--muted))" stroke="hsl(var(--border))" rx={3} />
          <rect x={300} y={40 + 120 - reactionProgress * 1.2} width={15} height={reactionProgress * 1.2} fill="hsl(var(--primary))" rx={3} />
          <text x={307} y={175} textAnchor="middle" className="text-[6px] fill-muted-foreground">{reactionProgress.toFixed(0)}%</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Acid" value={acid} />
        <DataRow label="Alcohol" value={alcohol} />
        <DataRow label="Catalyst" value={catalystAdded ? "H₂SO₄ ✅" : "None"} />
        <DataRow label="Ester" value={esterFormed ? esterName : "—"} />
        <DataRow label="Smell" value={smellDetected ? "Fruity 🍎" : "None"} />
        <DataRow label="Progress" value={`${reactionProgress.toFixed(0)}`} unit="%" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// 15. Saponification
export function Saponification() {
  const [heat, setHeat] = useState(0);
  const [stirring, setStirring] = useState(false);
  const [saltAdded, setSaltAdded] = useState(false);
  const [step, setStep] = useState(0);

  const reactionProgress = Math.min(100, (heat * 0.8) * (stirring ? 1.5 : 0.7));
  const soapFormed = reactionProgress > 60;
  const separated = soapFormed && saltAdded;

  const reset = () => { setHeat(0); setStirring(false); setSaltAdded(false); setStep(0); };

  const steps = [
    "Add vegetable oil to the reaction container",
    "Add NaOH solution",
    "Heat the mixture slowly",
    "Stir continuously",
    "Observe formation of soap molecules",
    "Add salt to separate soap",
    "Collect soap product",
    "Record reaction results",
  ];

  return (
    <SimulationLayout title="Lab: Saponification (Soap Making)" objective="Produce soap by reacting oil with NaOH" theory="Saponification: Fat/Oil + NaOH → Soap (sodium salt of fatty acid) + Glycerol. The process breaks ester bonds in triglycerides." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Heat" value={heat} onChange={v => { setHeat(v); if (step < 2) setStep(2); }} min={0} max={100} step={5} unit="°C" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={stirring} onChange={e => { setStirring(e.target.checked); if (step < 3) setStep(3); }} className="rounded" />
          Stir Continuously
        </label>
        {soapFormed && (
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={saltAdded} onChange={e => { setSaltAdded(e.target.checked); if (step < 5) setStep(5); }} className="rounded" />
            Add Salt (NaCl)
          </label>
        )}
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          {/* Beaker */}
          <rect x={120} y={40} width={160} height={130} fill="hsl(var(--muted) / 0.2)" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          {/* Oil layer */}
          <rect x={122} y={42} width={156} height={40} fill="#eab308" opacity={soapFormed ? 0.2 : 0.6} rx={2} />
          {!soapFormed && <text x={200} y={67} textAnchor="middle" className="text-[8px] fill-foreground">Oil</text>}
          {/* NaOH layer */}
          <rect x={122} y={82} width={156} height={40} fill="hsl(var(--primary) / 0.3)" rx={0} />
          {!soapFormed && <text x={200} y={107} textAnchor="middle" className="text-[8px] fill-primary">NaOH (aq)</text>}
          {/* Soap formation */}
          {soapFormed && !separated && (
            <text x={200} y={90} textAnchor="middle" className="text-[11px] fill-primary font-bold">Soap mixture</text>
          )}
          {separated && <>
            <rect x={122} y={42} width={156} height={50} fill="hsl(var(--primary) / 0.4)" rx={2} />
            <text x={200} y={72} textAnchor="middle" className="text-[10px] fill-primary-foreground font-bold">Soap (solid)</text>
            <rect x={122} y={92} width={156} height={50} fill="hsl(var(--muted) / 0.3)" rx={0} />
            <text x={200} y={122} textAnchor="middle" className="text-[8px] fill-muted-foreground">Glycerol + salt water</text>
          </>}
          {/* Heat */}
          {heat > 0 && <rect x={140} y={175} width={120} height={6} fill="#ef4444" opacity={heat / 100} rx={2} />}
          {/* Stirring indicator */}
          {stirring && <text x={300} y={100} className="text-[16px]">🔄</text>}
          {/* Micelle */}
          {soapFormed && (
            <g>
              <circle cx={340} cy={60} r={20} fill="none" stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="3,2" />
              <circle cx={340} cy={60} r={8} fill="#eab308" opacity={0.5} />
              <text x={340} y={90} textAnchor="middle" className="text-[6px] fill-muted-foreground">Micelle</text>
            </g>
          )}
          <text x={200} y={200} textAnchor="middle" className="text-[8px] fill-muted-foreground">Oil + NaOH → Soap + Glycerol</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Heat" value={heat} unit="°C" />
        <DataRow label="Stirring" value={stirring ? "Yes 🔄" : "No"} />
        <DataRow label="Progress" value={`${reactionProgress.toFixed(0)}`} unit="%" />
        <DataRow label="Soap Formed" value={soapFormed ? "Yes ✅" : "No"} />
        <DataRow label="Separated" value={separated ? "Yes ✅" : "No"} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}
