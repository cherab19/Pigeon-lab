import { useState, useEffect, useCallback } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";

// ─── 1. Lab Safety & Measurement ────────────────────────────────────
export function LabSafety() {
  const [goggles, setGoggles] = useState(false);
  const [gloves, setGloves] = useState(false);
  const [apron, setApron] = useState(false);
  const [mass, setMass] = useState(0);
  const [temp, setTemp] = useState(25);
  const [volume, setVolume] = useState(0);
  const [tared, setTared] = useState(false);
  const [step, setStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const safetyScore = (goggles ? 33 : 0) + (gloves ? 33 : 0) + (apron ? 34 : 0);

  const reset = () => {
    setGoggles(false); setGloves(false); setApron(false);
    setMass(0); setTemp(25); setVolume(0); setTared(false); setStep(0); setShowWarning(false);
  };

  // Safety warning if student tries to measure without goggles
  useEffect(() => {
    if ((mass > 0 || temp !== 25) && !goggles) setShowWarning(true);
    else setShowWarning(false);
  }, [mass, temp, goggles]);

  const steps = [
    "Wear virtual safety goggles from the equipment panel",
    "Drag a balance onto the lab bench",
    "Drag a beaker onto the balance",
    "Click the Zero (Tare) button to calibrate the balance",
    "Record the mass displayed",
    "Remove the beaker from the balance",
    "Drag a thermometer into a container of liquid",
    "Wait until the thermometer stabilizes",
    "Record the temperature reading",
    "Drag a measuring cylinder onto the workspace",
    "Pour liquid into the cylinder",
    "Read the meniscus level to determine volume",
    "Enter mass, temperature, and volume values into the observation table",
  ];

  return (
    <SimulationLayout
      title="Lab Safety & Measurement"
      objective="Learn how to use laboratory instruments safely and measure mass and temperature"
      theory="Lab safety includes wearing goggles, proper chemical handling, and knowing emergency procedures. Accurate measurement is the foundation of chemistry."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Safety Equipment</p>
          {[
            { label: "Safety Goggles 🥽", val: goggles, set: setGoggles },
            { label: "Lab Gloves 🧤", val: gloves, set: setGloves },
            { label: "Lab Apron", val: apron, set: setApron },
          ].map((s) => (
            <label key={s.label} className="flex items-center gap-2 text-xs cursor-pointer select-none">
              <input type="checkbox" checked={s.val} onChange={(e) => s.set(e.target.checked)} className="rounded accent-primary" />
              {s.label} {s.val ? "✅" : "❌"}
            </label>
          ))}
          <hr className="border-border" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Instruments</p>
          <button
            onClick={() => { setTared(true); setStep(Math.max(step, 3)); }}
            className="w-full px-2 py-1.5 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            disabled={tared}
          >
            {tared ? "Balance Tared ✅" : "Tare Balance (Zero)"}
          </button>
          <ControlGroup label="Sample Mass" value={mass} onChange={(v) => { setMass(v); if (v > 0) setStep(Math.max(step, 4)); }} min={0} max={500} step={0.1} unit="g" />
          <ControlGroup label="Temperature" value={temp} onChange={(v) => { setTemp(v); if (v !== 25) setStep(Math.max(step, 8)); }} min={-10} max={150} step={0.5} unit="°C" />
          <ControlGroup label="Volume (Cylinder)" value={volume} onChange={(v) => { setVolume(v); if (v > 0) setStep(Math.max(step, 11)); }} min={0} max={100} step={0.5} unit="mL" />
        </div>
      }
      workspace={
        <div className="w-full space-y-2">
          {showWarning && (
            <div className="bg-destructive/10 border border-destructive text-destructive text-xs p-2 rounded-lg font-semibold animate-pulse">
              ⚠️ Safety Warning: Put on safety goggles before handling instruments!
            </div>
          )}
          <svg viewBox="0 0 480 280" className="w-full h-56 bg-muted/30 rounded-lg border border-border">
            {/* Lab bench surface */}
            <rect x={0} y={230} width={480} height={50} fill="hsl(var(--muted))" />
            <rect x={0} y={228} width={480} height={4} fill="hsl(var(--border))" />

            {/* Digital balance */}
            <rect x={30} y={170} width={120} height={60} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
            <rect x={45} y={178} width={90} height={20} fill="hsl(var(--muted))" rx={2} />
            <text x={90} y={193} textAnchor="middle" className="text-[12px] fill-foreground font-mono font-bold">
              {tared ? mass.toFixed(1) : "---"} g
            </text>
            <text x={90} y={212} textAnchor="middle" className="text-[7px] fill-muted-foreground">DIGITAL BALANCE</text>
            {/* Beaker on balance */}
            {mass > 0 && (
              <>
                <rect x={65} y={140} width={50} height={32} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={1.5} rx={2} />
                <text x={90} y={160} textAnchor="middle" className="text-[8px] fill-primary font-semibold">Beaker</text>
              </>
            )}

            {/* Thermometer */}
            <rect x={200} y={60} width={10} height={170} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={5} />
            <rect x={202} y={60 + (1 - (temp + 10) / 160) * 160} width={6} height={(temp + 10) / 160 * 160} fill="#ef4444" rx={3} />
            <circle cx={205} cy={225} r={8} fill="#ef4444" />
            <text x={205} y={50} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{temp}°C</text>
            <text x={205} y={248} textAnchor="middle" className="text-[7px] fill-muted-foreground">THERMOMETER</text>

            {/* Measuring Cylinder */}
            <rect x={300} y={100} width={40} height={130} fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--border))" strokeWidth={1.5} rx={2} />
            {volume > 0 && (
              <rect x={302} y={100 + (1 - volume / 100) * 126} width={36} height={volume / 100 * 126} fill="hsl(var(--primary) / 0.3)" rx={1} />
            )}
            {/* Meniscus */}
            {volume > 0 && (
              <path d={`M302,${100 + (1 - volume / 100) * 126} Q320,${97 + (1 - volume / 100) * 126} 338,${100 + (1 - volume / 100) * 126}`} fill="hsl(var(--primary) / 0.4)" />
            )}
            {/* Scale marks */}
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v}>
                <line x1={340} y1={226 - (v / 100) * 126} x2={345} y2={226 - (v / 100) * 126} stroke="hsl(var(--foreground))" strokeWidth={0.5} />
                <text x={350} y={229 - (v / 100) * 126} className="text-[6px] fill-muted-foreground">{v}</text>
              </g>
            ))}
            <text x={320} y={248} textAnchor="middle" className="text-[7px] fill-muted-foreground">CYLINDER ({volume.toFixed(1)} mL)</text>

            {/* Safety Score Badge */}
            <rect x={390} y={10} width={80} height={35} fill={safetyScore === 100 ? "hsl(var(--primary) / 0.15)" : "hsl(var(--destructive) / 0.15)"} stroke={safetyScore === 100 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} strokeWidth={1.5} rx={8} />
            <text x={430} y={24} textAnchor="middle" className="text-[7px] fill-muted-foreground">SAFETY</text>
            <text x={430} y={38} textAnchor="middle" className="text-[12px] fill-foreground font-bold">{safetyScore}%</text>
          </svg>
        </div>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Safety Score" value={`${safetyScore}%`} />
          <DataRow label="Mass" value={tared ? mass.toFixed(1) : "—"} unit="g" />
          <DataRow label="Temperature" value={temp.toFixed(1)} unit="°C" />
          <DataRow label="Volume" value={volume.toFixed(1)} unit="mL" />
          <DataRow label="Tared" value={tared ? "Yes" : "No"} />
          <DataRow label="Status" value={safetyScore === 100 ? "Safe ✅" : "Unsafe ⚠️"} />
        </div>
      }
      analysis={
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      }
    />
  );
}

// ─── 2. States of Matter ────────────────────────────────────────────
export function StatesOfMatter() {
  const [temp, setTemp] = useState(-10);
  const [molecularView, setMolecularView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [step, setStep] = useState(0);

  const state = temp <= 0 ? "Solid (Ice)" : temp < 100 ? "Liquid (Water)" : "Gas (Steam)";
  const stateEmoji = temp <= 0 ? "🧊" : temp < 100 ? "💧" : "♨️";

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setTemp((t) => {
        if (t >= 150) { setPlaying(false); return 150; }
        return Math.min(t + speed, 150);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing, speed]);

  const reset = () => { setTemp(-10); setMolecularView(false); setPlaying(false); setSpeed(1); setStep(0); };

  const molecules = Array.from({ length: 30 }, (_, i) => {
    const spacing = temp <= 0 ? 0 : temp < 100 ? temp / 100 : 1 + (temp - 100) / 50;
    const cols = 6;
    const baseX = 80 + (i % cols) * 45 + (Math.random() - 0.5) * spacing * 35;
    const baseY = 60 + Math.floor(i / cols) * 35 + (Math.random() - 0.5) * spacing * 35;
    const r = temp <= 0 ? 8 : temp < 100 ? 7 : 5;
    return { x: Math.max(30, Math.min(370, baseX)), y: Math.max(30, Math.min(220, baseY)), r };
  });

  const steps = [
    "Drag a beaker containing ice to the workspace",
    "Place a Bunsen burner under the beaker",
    "Drag a thermometer into the beaker",
    "Set the heat slider to low",
    "Click Start Simulation",
    "Observe the ice molecules vibrating slowly",
    "Increase the temperature gradually",
    "At 0°C, observe ice melting into water",
    "Continue increasing temperature",
    "At 100°C, observe water boiling and forming steam",
    "Toggle Molecular View to see particle movement",
    "Record temperature changes and state transitions",
  ];

  return (
    <SimulationLayout
      title="States of Matter"
      objective="Observe how heating affects the physical state of matter"
      theory="Matter exists in solid, liquid, and gas states. Water melts at 0°C and boils at 100°C. Molecular motion increases with temperature."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <ControlGroup label="Temperature" value={temp} onChange={(v) => { setTemp(v); setStep(Math.max(step, v > 0 ? 7 : v >= 100 ? 9 : 5)); }} min={-20} max={150} step={1} unit="°C" />
          <div className="flex gap-1">
            <button onClick={() => { setPlaying(!playing); if (!playing) setStep(Math.max(step, 4)); }} className="flex-1 px-2 py-1.5 text-xs rounded-md bg-primary text-primary-foreground">
              {playing ? "⏸ Pause" : "▶ Start"}
            </button>
            <button onClick={reset} className="px-2 py-1.5 text-xs rounded-md bg-muted text-foreground">Reset</button>
          </div>
          <ControlGroup label="Speed" value={speed} onChange={setSpeed} min={1} max={5} step={1} unit="×" />
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={molecularView} onChange={(e) => { setMolecularView(e.target.checked); if (e.target.checked) setStep(Math.max(step, 10)); }} className="rounded accent-primary" />
            🔬 Molecular View
          </label>
        </div>
      }
      workspace={
        <svg viewBox="0 0 420 280" className="w-full h-56 bg-muted/30 rounded-lg border border-border">
          {!molecularView ? (
            <>
              {/* Lab bench */}
              <rect x={0} y={240} width={420} height={40} fill="hsl(var(--muted))" />
              {/* Beaker */}
              <path d="M130,80 L120,200 Q120,210 130,210 L270,210 Q280,210 280,200 L270,80" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} />
              {/* Contents */}
              {temp <= 0 && (
                <rect x={125} y={140} width={150} height={68} fill="#93c5fd" rx={2} opacity={0.8} />
              )}
              {temp > 0 && temp < 100 && (
                <>
                  <rect x={125} y={120} width={150} height={88} fill="#3b82f6" rx={2} opacity={0.5} />
                  <path d="M130,120 Q200,110 270,120" fill="#3b82f6" opacity={0.6} />
                </>
              )}
              {temp >= 100 && (
                <>
                  <rect x={125} y={140} width={150} height={68} fill="#3b82f6" rx={2} opacity={0.3} />
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <circle key={i} cx={150 + i * 20 + Math.random() * 10} cy={100 - i * 12} r={6 + i * 2} fill="hsl(var(--muted))" opacity={0.5 - i * 0.06}>
                      <animate attributeName="cy" values={`${100 - i * 12};${70 - i * 12};${100 - i * 12}`} dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0.1;0.5" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                </>
              )}
              {/* Thermometer */}
              <rect x={290} y={50} width={8} height={160} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={4} />
              <rect x={292} y={50 + (1 - (temp + 20) / 170) * 155} width={4} height={(temp + 20) / 170 * 155} fill="#ef4444" rx={2} />
              <circle cx={294} cy={208} r={6} fill="#ef4444" />
              <text x={294} y={40} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{temp}°C</text>
              {/* Bunsen burner */}
              <rect x={170} y={215} width={60} height={25} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={3} />
              {(playing || temp > -10) && (
                <>
                  <circle cx={200} cy={215} r={8} fill="#f97316" opacity={Math.min(1, temp / 100 + 0.3)}>
                    <animate attributeName="r" values="6;10;6" dur="0.6s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={200} cy={210} r={4} fill="#fbbf24" opacity={0.6}>
                    <animate attributeName="r" values="3;6;3" dur="0.4s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              <text x={200} y={255} textAnchor="middle" className="text-[7px] fill-muted-foreground">BUNSEN BURNER</text>
              {/* State label */}
              <text x={200} y={30} textAnchor="middle" className="text-[14px] fill-foreground font-bold">{stateEmoji} {state}</text>
            </>
          ) : (
            <>
              <rect x={10} y={10} width={400} height={230} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} rx={4} />
              {molecules.map((m, i) => (
                <g key={i}>
                  <circle cx={m.x} cy={m.y} r={m.r} fill="hsl(var(--primary))" opacity={0.7}>
                    {temp > 0 && (
                      <animate attributeName="cx" values={`${m.x};${m.x + (Math.random() - 0.5) * (temp / 5)};${m.x}`} dur={`${0.5 + Math.random()}s`} repeatCount="indefinite" />
                    )}
                  </circle>
                  {/* Bonds in solid */}
                  {temp <= 0 && i < molecules.length - 1 && i % 6 !== 5 && (
                    <line x1={m.x} y1={m.y} x2={molecules[i + 1].x} y2={molecules[i + 1].y} stroke="hsl(var(--border))" strokeWidth={0.5} opacity={0.4} />
                  )}
                </g>
              ))}
              <text x={210} y={258} textAnchor="middle" className="text-[12px] fill-foreground font-bold">{stateEmoji} {state} — Molecular View</text>
            </>
          )}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Temperature" value={temp} unit="°C" />
          <DataRow label="State" value={state} />
          <DataRow label="Melting Pt" value="0" unit="°C" />
          <DataRow label="Boiling Pt" value="100" unit="°C" />
          <DataRow label="Molecular KE" value={temp <= 0 ? "Low" : temp < 100 ? "Medium" : "High"} />
          <DataRow label="View" value={molecularView ? "Molecular" : "Macro"} />
        </div>
      }
      analysis={
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      }
    />
  );
}

// ─── 3. Atomic Structure (Bohr Model) ──────────────────────────────
export function AtomicStructure() {
  const [protons, setProtons] = useState(6);
  const [neutrons, setNeutrons] = useState(6);
  const [electrons, setElectrons] = useState(6);
  const [step, setStep] = useState(0);

  const elements: Record<number, string> = { 1: "H", 2: "He", 3: "Li", 4: "Be", 5: "B", 6: "C", 7: "N", 8: "O", 9: "F", 10: "Ne", 11: "Na", 12: "Mg", 13: "Al", 14: "Si", 15: "P", 16: "S", 17: "Cl", 18: "Ar", 19: "K", 20: "Ca" };
  const elementNames: Record<number, string> = { 1: "Hydrogen", 2: "Helium", 3: "Lithium", 4: "Beryllium", 5: "Boron", 6: "Carbon", 7: "Nitrogen", 8: "Oxygen", 9: "Fluorine", 10: "Neon", 11: "Sodium", 12: "Magnesium", 13: "Aluminium", 14: "Silicon", 15: "Phosphorus", 16: "Sulphur", 17: "Chlorine", 18: "Argon", 19: "Potassium", 20: "Calcium" };
  const element = elements[protons] || "?";
  const elementName = elementNames[protons] || "Unknown";
  const charge = protons - electrons;
  const shell1 = Math.min(electrons, 2);
  const shell2 = Math.min(Math.max(electrons - 2, 0), 8);
  const shell3 = Math.min(Math.max(electrons - 10, 0), 8);

  const reset = () => { setProtons(6); setNeutrons(6); setElectrons(6); setStep(0); };

  const steps = [
    "Drag protons into the nucleus area",
    "Add neutrons to the nucleus",
    "Place electrons in the first energy shell",
    "Observe the element name displayed automatically",
    "Add or remove protons to change the element",
    "Adjust electrons to balance the charge",
    "Observe electron orbit animations",
    "Record the atomic number and element name",
  ];

  return (
    <SimulationLayout
      title="Atomic Structure (Bohr Model)"
      objective="Construct atoms and understand atomic structure"
      theory="The Bohr model places electrons in shells: 1st shell holds 2, 2nd holds 8, 3rd holds 18. Atomic number = protons = electrons (neutral atom)."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <ControlGroup label="Protons (p⁺)" value={protons} onChange={(v) => { setProtons(v); setStep(Math.max(step, 0)); }} min={1} max={20} unit="" />
          <ControlGroup label="Neutrons (n⁰)" value={neutrons} onChange={(v) => { setNeutrons(v); setStep(Math.max(step, 1)); }} min={0} max={25} unit="" />
          <ControlGroup label="Electrons (e⁻)" value={electrons} onChange={(v) => { setElectrons(v); setStep(Math.max(step, 2)); }} min={0} max={20} unit="" />
          <div className="p-2 bg-primary/10 rounded-lg text-xs">
            <p className="font-bold text-primary">{element} — {elementName}</p>
            <p className="text-muted-foreground">Charge: {charge === 0 ? "Neutral" : charge > 0 ? `+${charge} (cation)` : `${charge} (anion)`}</p>
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 340 340" className="w-full h-60 bg-muted/30 rounded-lg border border-border">
          {/* Shells */}
          {[65, 105, 145].map((r, si) => {
            const count = si === 0 ? shell1 : si === 1 ? shell2 : shell3;
            return (
              <g key={si}>
                <circle cx={170} cy={170} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={0.8} strokeDasharray="4,4" />
                <text x={170 + r - 5} y={170 - r + 12} className="text-[6px] fill-muted-foreground">n={si + 1}</text>
                {Array.from({ length: count }, (_, ei) => {
                  const a = (ei / Math.max(count, 1)) * 2 * Math.PI - Math.PI / 2;
                  return (
                    <circle key={ei} cx={170 + r * Math.cos(a)} cy={170 + r * Math.sin(a)} r={5} fill="#3b82f6" stroke="#1d4ed8" strokeWidth={0.5}>
                      <animateTransform attributeName="transform" type="rotate" from={`0 170 170`} to={`360 170 170`} dur={`${4 + si * 2}s`} repeatCount="indefinite" />
                    </circle>
                  );
                })}
              </g>
            );
          })}
          {/* Nucleus */}
          <circle cx={170} cy={170} r={28} fill="hsl(var(--primary))" opacity={0.9} />
          <text x={170} y={165} textAnchor="middle" className="text-[7px] fill-primary-foreground">{protons}p⁺ {neutrons}n⁰</text>
          <text x={170} y={180} textAnchor="middle" className="text-[14px] fill-primary-foreground font-bold">{element}</text>
          {/* Element name */}
          <text x={170} y={320} textAnchor="middle" className="text-[12px] fill-foreground font-bold">{elementName}</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Element" value={`${element} (${elementName})`} />
          <DataRow label="Atomic #" value={protons} />
          <DataRow label="Mass #" value={protons + neutrons} />
          <DataRow label="Charge" value={charge === 0 ? "Neutral" : charge > 0 ? `+${charge}` : `${charge}`} />
          <DataRow label="Shell 1" value={`${shell1}/2`} />
          <DataRow label="Shell 2" value={`${shell2}/8`} />
          <DataRow label="Shell 3" value={`${shell3}/8`} />
        </div>
      }
      analysis={
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      }
    />
  );
}

// ─── 4. Chemical Bonding ────────────────────────────────────────────
export function ChemicalBonding() {
  const [bondType, setBondType] = useState<"ionic" | "covalent">("ionic");
  const [showTransfer, setShowTransfer] = useState(false);
  const [bonded, setBonded] = useState(false);
  const [step, setStep] = useState(0);

  const reset = () => { setBondType("ionic"); setShowTransfer(false); setBonded(false); setStep(0); };

  const handleBond = () => {
    setShowTransfer(true);
    setTimeout(() => setBonded(true), 1200);
    setStep(Math.max(step, bondType === "ionic" ? 5 : 7));
  };

  const steps = [
    "Drag two atoms into the workspace",
    "Move the atoms closer together",
    "Observe their valence electrons",
    "Select Show Electron Transfer",
    "Watch the electron move from one atom to another (ionic bond)",
    "Reset the simulation",
    "Select Show Electron Sharing",
    "Observe electrons shared between atoms (covalent bond)",
    "Observe the bond energy meter change",
    "Record the type of bond formed",
  ];

  return (
    <SimulationLayout
      title="Chemical Bonding"
      objective="Understand ionic and covalent bonding"
      theory="Ionic bonds form when electrons transfer between atoms (metal + non-metal). Covalent bonds form when electrons are shared (non-metal + non-metal)."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Bond Type</p>
          {(["ionic", "covalent"] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 text-xs cursor-pointer capitalize">
              <input type="radio" name="bond" checked={bondType === t} onChange={() => { setBondType(t); setBonded(false); setShowTransfer(false); }} className="accent-primary" />
              {t} Bond
            </label>
          ))}
          <hr className="border-border" />
          <button onClick={handleBond} disabled={bonded} className="w-full px-2 py-1.5 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50">
            {bonded ? "Bond Formed ✅" : showTransfer ? "Bonding..." : "Form Bond"}
          </button>
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 260" className="w-full h-56 bg-muted/30 rounded-lg border border-border">
          {bondType === "ionic" ? (
            <>
              {/* Na atom */}
              <circle cx={bonded ? 160 : 120} cy={130} r={35} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} />
              <text x={bonded ? 160 : 120} y={125} textAnchor="middle" className="text-[10px] fill-foreground font-bold">Na</text>
              <text x={bonded ? 160 : 120} y={140} textAnchor="middle" className="text-[8px] fill-muted-foreground">{bonded ? "Na⁺" : "11e⁻"}</text>
              {/* Valence electron */}
              {!bonded && (
                <circle cx={showTransfer ? 240 : 155} cy={115} r={4} fill="#3b82f6">
                  {showTransfer && <animate attributeName="cx" from="155" to="240" dur="1s" fill="freeze" />}
                </circle>
              )}
              {/* Cl atom */}
              <circle cx={bonded ? 230 : 280} cy={130} r={35} fill="#22c55e20" stroke="#22c55e" strokeWidth={2} />
              <text x={bonded ? 230 : 280} y={125} textAnchor="middle" className="text-[10px] fill-foreground font-bold">Cl</text>
              <text x={bonded ? 230 : 280} y={140} textAnchor="middle" className="text-[8px] fill-muted-foreground">{bonded ? "Cl⁻" : "17e⁻"}</text>
              {/* Bond indicator */}
              {bonded && (
                <>
                  <line x1={195} y1={130} x2={195} y2={130} stroke="hsl(var(--primary))" strokeWidth={3} strokeDasharray="4,2" />
                  <text x={200} y={190} textAnchor="middle" className="text-[12px] fill-primary font-bold">NaCl — Ionic Bond</text>
                  <text x={200} y={210} textAnchor="middle" className="text-[9px] fill-muted-foreground">Electron transferred: Na → Cl</text>
                </>
              )}
            </>
          ) : (
            <>
              {/* H atoms for covalent */}
              <circle cx={bonded ? 175 : 140} cy={130} r={30} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={2} />
              <text x={bonded ? 175 : 140} y={135} textAnchor="middle" className="text-[12px] fill-foreground font-bold">H</text>
              <circle cx={bonded ? 225 : 260} cy={130} r={30} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={2} />
              <text x={bonded ? 225 : 260} y={135} textAnchor="middle" className="text-[12px] fill-foreground font-bold">H</text>
              {/* Shared electron cloud */}
              {bonded && (
                <>
                  <ellipse cx={200} cy={130} rx={18} ry={12} fill="#3b82f6" opacity={0.3} />
                  <circle cx={194} cy={128} r={3} fill="#3b82f6" />
                  <circle cx={206} cy={132} r={3} fill="#3b82f6" />
                  <text x={200} y={190} textAnchor="middle" className="text-[12px] fill-primary font-bold">H₂ — Covalent Bond</text>
                  <text x={200} y={210} textAnchor="middle" className="text-[9px] fill-muted-foreground">Electrons shared between atoms</text>
                </>
              )}
            </>
          )}
          {/* Bond energy meter */}
          <text x={200} y={245} textAnchor="middle" className="text-[8px] fill-muted-foreground">
            Bond Energy: {bonded ? (bondType === "ionic" ? "787 kJ/mol" : "436 kJ/mol") : "—"}
          </text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Bond Type" value={bondType} />
          <DataRow label="Status" value={bonded ? "Bonded" : showTransfer ? "Forming..." : "Ready"} />
          <DataRow label="Atoms" value={bondType === "ionic" ? "Na + Cl" : "H + H"} />
          <DataRow label="Product" value={bonded ? (bondType === "ionic" ? "NaCl" : "H₂") : "—"} />
          <DataRow label="Bond Energy" value={bonded ? (bondType === "ionic" ? "787" : "436") : "—"} unit="kJ/mol" />
          <DataRow label="Mechanism" value={bondType === "ionic" ? "Electron transfer" : "Electron sharing"} />
        </div>
      }
      analysis={
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      }
    />
  );
}

// ─── 5. Chemical Reactions ──────────────────────────────────────────
export function ChemicalReactions() {
  const [heated, setHeated] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [step, setStep] = useState(0);

  const handleHeat = () => {
    setHeated(true);
    setStep(Math.max(step, 4));
    setTimeout(() => { setReacted(true); setStep(Math.max(step, 6)); }, 1500);
  };
  const reset = () => { setHeated(false); setReacted(false); setStep(0); };

  const steps = [
    "Drag a test tube into the workspace",
    "Add iron filings (grey) using the dropper",
    "Add sulphur powder (yellow)",
    "Stir the mixture",
    "Apply heat using a Bunsen burner",
    "Observe changes: color change, heat released",
    "Note the balanced chemical equation displayed",
    "Record observations",
  ];

  return (
    <SimulationLayout
      title="Chemical Reactions (Fe + S)"
      objective="Observe indicators of chemical reactions"
      theory="Iron + Sulphur → Iron Sulphide (FeS). This exothermic reaction produces a black compound. Indicators: color change, heat release."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <button onClick={handleHeat} disabled={heated} className="w-full px-2 py-1.5 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50">
            {heated ? (reacted ? "Reaction Complete ✅" : "Heating... 🔥") : "Apply Heat 🔥"}
          </button>
          <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted/50 rounded">
            <p>• Iron filings (Fe) — grey</p>
            <p>• Sulphur powder (S) — yellow</p>
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 280" className="w-full h-56 bg-muted/30 rounded-lg border border-border">
          {/* Lab bench */}
          <rect x={0} y={240} width={400} height={40} fill="hsl(var(--muted))" />
          {/* Test tube */}
          <rect x={160} y={50} width={80} height={150} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <ellipse cx={200} cy={200} rx={40} ry={8} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} />
          {!reacted ? (
            <>
              <rect x={170} y={130} width={60} height={30} fill="#9ca3af" rx={2} />
              <text x={200} y={150} textAnchor="middle" className="text-[8px] fill-foreground font-semibold">Fe (grey)</text>
              <rect x={170} y={95} width={60} height={30} fill="#eab308" rx={2} />
              <text x={200} y={115} textAnchor="middle" className="text-[8px] fill-foreground font-semibold">S (yellow)</text>
            </>
          ) : (
            <>
              <rect x={170} y={95} width={60} height={65} fill="#1f2937" rx={2} />
              <text x={200} y={132} textAnchor="middle" className="text-[10px] fill-gray-300 font-bold">FeS (black)</text>
            </>
          )}
          {/* Reaction glow */}
          {heated && !reacted && (
            <>
              <circle cx={190} cy={110} r={6} fill="#f97316" opacity={0.8}>
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={210} cy={105} r={5} fill="#ef4444" opacity={0.6}>
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.4s" repeatCount="indefinite" />
              </circle>
            </>
          )}
          {/* Bunsen burner */}
          {heated && (
            <>
              <rect x={180} y={210} width={40} height={30} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={3} />
              <circle cx={200} cy={210} r={8} fill="#f97316" opacity={0.7}>
                <animate attributeName="r" values="6;10;6" dur="0.6s" repeatCount="indefinite" />
              </circle>
            </>
          )}
          {/* Equation */}
          {reacted && (
            <text x={200} y={265} textAnchor="middle" className="text-[11px] fill-primary font-bold">Fe + S → FeS</text>
          )}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Reactants" value="Fe + S" />
          <DataRow label="Product" value="FeS" />
          <DataRow label="Status" value={reacted ? "Complete ✅" : heated ? "Reacting..." : "Ready"} />
          <DataRow label="Type" value="Combination (Exothermic)" />
          <DataRow label="Color Change" value={reacted ? "Grey+Yellow → Black" : "—"} />
        </div>
      }
      analysis={
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      }
    />
  );
}

// ─── 6. Conservation of Mass ────────────────────────────────────────
export function ConservationOfMass() {
  const [chamberOpen, setChamberOpen] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [step, setStep] = useState(0);

  const massBefore = 150.0;
  const gasLoss = chamberOpen ? 2.3 : 0;
  const massAfter = massBefore - gasLoss;

  const reset = () => { setChamberOpen(false); setReacted(false); setStep(0); };

  const steps = [
    "Drag reactants into a closed reaction chamber",
    "Record the initial mass on the digital balance",
    "Close the chamber lid",
    "Click Start Reaction",
    "Observe the reaction inside the chamber",
    "Record the final mass",
    "Compare initial and final mass values",
    "Switch to Open System Mode",
    "Repeat the reaction",
    "Observe mass decrease due to gas escape",
  ];

  return (
    <SimulationLayout
      title="Conservation of Mass"
      objective="Verify that mass is conserved during chemical reactions"
      theory="In a closed system, total mass before = total mass after reaction. In an open system, gas may escape causing apparent mass loss."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <button onClick={() => { setReacted(true); setStep(Math.max(step, 3)); }} disabled={reacted} className="w-full px-2 py-1.5 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50">
            {reacted ? "Reacted ✅" : "Start Reaction"}
          </button>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={chamberOpen} onChange={(e) => { setChamberOpen(e.target.checked); if (e.target.checked) setStep(Math.max(step, 7)); }} className="rounded accent-primary" disabled={!reacted} />
            Open Chamber Lid
          </label>
          <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            <p className="font-semibold">Open vs Closed System</p>
            <p>Closed: mass conserved</p>
            <p>Open: gas escapes → mass ↓</p>
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 260" className="w-full h-52 bg-muted/30 rounded-lg border border-border">
          {/* Balance platform */}
          <rect x={120} y={180} width={160} height={12} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={2} />
          <text x={200} y={210} textAnchor="middle" className="text-[8px] fill-muted-foreground">DIGITAL BALANCE</text>
          {/* Chamber */}
          <rect x={145} y={70} width={110} height={110} fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth={2} rx={4} />
          {/* Lid */}
          {!chamberOpen && <rect x={143} y={63} width={114} height={10} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1.5} rx={3} />}
          {/* Reactants / products */}
          {reacted ? (
            <circle cx={200} cy={130} r={18} fill="#eab308" opacity={0.5} />
          ) : (
            <>
              <rect x={160} y={140} width={30} height={20} fill="#9ca3af" rx={2} />
              <rect x={210} y={140} width={30} height={20} fill="#eab308" rx={2} />
            </>
          )}
          {/* Escaping gas */}
          {chamberOpen && reacted && [0, 1, 2].map((i) => (
            <circle key={i} cx={200 + (i - 1) * 18} cy={50} r={5} fill="hsl(var(--muted-foreground))" opacity={0.4}>
              <animate attributeName="cy" values={`50;10`} dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Mass display */}
          <rect x={155} y={220} width={90} height={25} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} rx={4} />
          <text x={200} y={237} textAnchor="middle" className="text-[14px] fill-foreground font-mono font-bold">{massAfter.toFixed(1)} g</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Mass Before" value={massBefore.toFixed(1)} unit="g" />
          <DataRow label="Mass After" value={massAfter.toFixed(1)} unit="g" />
          <DataRow label="Chamber" value={chamberOpen ? "Open" : "Sealed"} />
          <DataRow label="Gas Lost" value={gasLoss.toFixed(1)} unit="g" />
          <DataRow label="Conserved?" value={!chamberOpen ? "Yes ✅" : "No (gas escaped)"} />
        </div>
      }
      analysis={
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      }
    />
  );
}

// ─── 7. Solutions ───────────────────────────────────────────────────
export function SolutionsLab() {
  const [soluteAmount, setSoluteAmount] = useState(0);
  const [temperature, setTemperature] = useState(25);
  const [stirring, setStirring] = useState(false);
  const [step, setStep] = useState(0);

  const maxSolubility = 36 + (temperature - 25) * 0.5; // g per 100mL, increases with temp
  const concentration = soluteAmount / 1; // simplified mol/L
  const saturationPct = Math.min((soluteAmount / maxSolubility) * 100, 100);
  const isSaturated = soluteAmount >= maxSolubility;
  const dissolvedAmount = Math.min(soluteAmount, maxSolubility);
  const undissolved = Math.max(0, soluteAmount - maxSolubility);

  const reset = () => { setSoluteAmount(0); setTemperature(25); setStirring(false); setStep(0); };

  const steps = [
    "Drag a beaker of water into the workspace",
    "Add solute powder using the spoon tool",
    "Stir the mixture using the stirring rod",
    "Observe the particles dissolving",
    "Continue adding solute gradually",
    "Watch the saturation indicator",
    "Increase temperature to observe faster dissolving",
    "Observe concentration changes on the meter",
    "Record concentration values",
  ];

  return (
    <SimulationLayout
      title="Solutions & Dissolving"
      objective="Understand dissolving and concentration"
      theory="A solution is a homogeneous mixture. Solubility increases with temperature for most solids. Concentration = mass of solute / volume of solvent."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <ControlGroup label="Solute Added" value={soluteAmount} onChange={(v) => { setSoluteAmount(v); setStep(Math.max(step, 1)); }} min={0} max={80} step={1} unit="g" />
          <ControlGroup label="Temperature" value={temperature} onChange={(v) => { setTemperature(v); setStep(Math.max(step, 6)); }} min={10} max={90} step={1} unit="°C" />
          <button onClick={() => { setStirring(!stirring); setStep(Math.max(step, 2)); }} className="w-full px-2 py-1.5 text-xs rounded-md bg-primary text-primary-foreground">
            {stirring ? "⏸ Stop Stirring" : "🥄 Stir"}
          </button>
          <div className="p-2 rounded bg-muted/50 text-xs">
            <p className="font-semibold text-muted-foreground">Saturation</p>
            <div className="w-full h-2 bg-muted rounded-full mt-1">
              <div className="h-2 rounded-full transition-all" style={{ width: `${saturationPct}%`, backgroundColor: isSaturated ? "hsl(var(--destructive))" : "hsl(var(--primary))" }} />
            </div>
            <p className="mt-1">{isSaturated ? "Saturated! ⚠️" : `${saturationPct.toFixed(0)}%`}</p>
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 280" className="w-full h-56 bg-muted/30 rounded-lg border border-border">
          {/* Lab bench */}
          <rect x={0} y={240} width={400} height={40} fill="hsl(var(--muted))" />
          {/* Beaker */}
          <path d="M120,70 L110,210 Q110,220 120,220 L280,220 Q290,220 290,210 L280,70" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Water */}
          <rect x={115} y={100} width={170} height={118} fill="#3b82f620" rx={2} />
          <path d="M118,100 Q200,90 282,100" fill="#3b82f630" />
          {/* Dissolved particles */}
          {dissolvedAmount > 0 && Array.from({ length: Math.min(Math.floor(dissolvedAmount / 3), 15) }, (_, i) => (
            <circle key={i} cx={140 + (i % 5) * 28} cy={130 + Math.floor(i / 5) * 25} r={3} fill="hsl(var(--primary))" opacity={0.5}>
              {stirring && <animate attributeName="cx" values={`${140 + (i % 5) * 28};${150 + (i % 5) * 28};${140 + (i % 5) * 28}`} dur={`${0.8 + i * 0.1}s`} repeatCount="indefinite" />}
            </circle>
          ))}
          {/* Undissolved solute at bottom */}
          {undissolved > 0 && (
            <rect x={150} y={200} width={Math.min(undissolved * 2, 100)} height={15} fill="hsl(var(--primary))" opacity={0.6} rx={3} />
          )}
          {/* Stirring rod */}
          {stirring && (
            <line x1={200} y1={60} x2={200} y2={200} stroke="hsl(var(--foreground))" strokeWidth={3} rx={2}>
              <animateTransform attributeName="transform" type="rotate" values="0 200 130;10 200 130;-10 200 130;0 200 130" dur="0.5s" repeatCount="indefinite" />
            </line>
          )}
          {/* Concentration meter */}
          <rect x={320} y={80} width={60} height={120} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} rx={4} />
          <rect x={325} y={85} width={50} height={15} fill="hsl(var(--muted))" rx={2} />
          <text x={350} y={95} textAnchor="middle" className="text-[7px] fill-foreground font-mono">{concentration.toFixed(1)} g/L</text>
          <text x={350} y={210} textAnchor="middle" className="text-[6px] fill-muted-foreground">CONCENTRATION</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Solute Added" value={soluteAmount} unit="g" />
          <DataRow label="Dissolved" value={dissolvedAmount.toFixed(1)} unit="g" />
          <DataRow label="Undissolved" value={undissolved.toFixed(1)} unit="g" />
          <DataRow label="Concentration" value={concentration.toFixed(1)} unit="g/L" />
          <DataRow label="Max Solubility" value={maxSolubility.toFixed(1)} unit="g/100mL" />
          <DataRow label="Temperature" value={temperature} unit="°C" />
          <DataRow label="Saturated?" value={isSaturated ? "Yes ⚠️" : "No"} />
        </div>
      }
      analysis={
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      }
    />
  );
}

// ─── 8. Acids, Bases & Salts ────────────────────────────────────────
export function AcidsBasesLab() {
  const [solution, setSolution] = useState<"acid" | "base" | "neutral">("acid");
  const [mixed, setMixed] = useState(false);
  const [step, setStep] = useState(0);

  const phValues = { acid: 2.5, base: 12.0, neutral: 7.0 };
  const ph = mixed ? 7.2 : phValues[solution];
  const litmusColor = ph < 7 ? "#ef4444" : ph > 7 ? "#3b82f6" : "#22c55e";

  const reset = () => { setSolution("acid"); setMixed(false); setStep(0); };

  const steps = [
    "Drag a test tube rack into the workspace",
    "Add an acid solution into one test tube",
    "Add a base solution into another",
    "Dip litmus paper into each solution",
    "Observe color change",
    "Use the pH meter to measure acidity",
    "Mix acid and base together",
    "Observe the neutralization reaction",
    "Record pH values before and after mixing",
  ];

  return (
    <SimulationLayout
      title="Acids, Bases & Salts"
      objective="Identify acids and bases using indicators"
      theory="Acids: pH < 7, turn blue litmus red. Bases: pH > 7, turn red litmus blue. Neutralization: Acid + Base → Salt + Water."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Solution</p>
          {(["acid", "base", "neutral"] as const).map((s) => (
            <label key={s} className="flex items-center gap-2 text-xs cursor-pointer capitalize">
              <input type="radio" name="sol" checked={solution === s && !mixed} onChange={() => { setSolution(s); setMixed(false); }} className="accent-primary" />
              {s === "acid" ? "HCl (Acid)" : s === "base" ? "NaOH (Base)" : "Water (Neutral)"}
            </label>
          ))}
          <hr className="border-border" />
          <button onClick={() => { setMixed(true); setStep(Math.max(step, 6)); }} disabled={mixed} className="w-full px-2 py-1.5 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50">
            {mixed ? "Neutralized ✅" : "Mix Acid + Base"}
          </button>
        </div>
      }
      workspace={
        <svg viewBox="0 0 420 280" className="w-full h-56 bg-muted/30 rounded-lg border border-border">
          {/* Lab bench */}
          <rect x={0} y={240} width={420} height={40} fill="hsl(var(--muted))" />
          {/* Test tube rack */}
          <rect x={60} y={200} width={180} height={10} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} />
          {/* Acid tube */}
          <rect x={80} y={100} width={30} height={100} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1.5} rx={2} />
          <rect x={82} y={140} width={26} height={58} fill="#ef444440" rx={1} />
          <text x={95} y={220} textAnchor="middle" className="text-[7px] fill-muted-foreground">HCl</text>
          {/* Base tube */}
          <rect x={140} y={100} width={30} height={100} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1.5} rx={2} />
          <rect x={142} y={140} width={26} height={58} fill="#3b82f640" rx={1} />
          <text x={155} y={220} textAnchor="middle" className="text-[7px] fill-muted-foreground">NaOH</text>
          {/* Mixed tube */}
          {mixed && (
            <>
              <rect x={200} y={100} width={30} height={100} fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth={2} rx={2} />
              <rect x={202} y={140} width={26} height={58} fill="#22c55e40" rx={1} />
              <text x={215} y={220} textAnchor="middle" className="text-[7px] fill-primary font-bold">NaCl+H₂O</text>
              {/* Heat animation */}
              <circle cx={215} cy={160} r={8} fill="#f9731630">
                <animate attributeName="r" values="6;12;6" dur="1s" repeatCount="3" />
              </circle>
            </>
          )}
          {/* Litmus paper */}
          <rect x={290} y={90} width={12} height={60} fill={litmusColor} stroke="hsl(var(--border))" strokeWidth={0.5} rx={1} />
          <text x={296} y={165} textAnchor="middle" className="text-[7px] fill-muted-foreground">Litmus</text>
          {/* pH meter */}
          <rect x={330} y={60} width={70} height={130} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1.5} rx={4} />
          <rect x={335} y={68} width={60} height={25} fill="hsl(var(--muted))" rx={2} />
          <text x={365} y={85} textAnchor="middle" className="text-[14px] fill-foreground font-mono font-bold">{ph.toFixed(1)}</text>
          {/* pH scale bar */}
          <defs>
            <linearGradient id="phScale" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <rect x={345} y={100} width={10} height={80} fill="url(#phScale)" rx={2} />
          {/* pH indicator line */}
          <line x1={343} y1={100 + (14 - ph) / 14 * 80} x2={357} y2={100 + (14 - ph) / 14 * 80} stroke="hsl(var(--foreground))" strokeWidth={2} />
          <text x={365} y={195} textAnchor="middle" className="text-[7px] fill-muted-foreground">pH METER</text>
          {/* Labels */}
          <text x={340} y={98} className="text-[5px] fill-muted-foreground">14</text>
          <text x={340} y={142} className="text-[5px] fill-muted-foreground">7</text>
          <text x={340} y={183} className="text-[5px] fill-muted-foreground">0</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Solution" value={mixed ? "Mixture" : solution} />
          <DataRow label="pH" value={ph.toFixed(1)} />
          <DataRow label="Nature" value={ph < 7 ? "Acidic" : ph > 7 ? "Basic" : "Neutral"} />
          <DataRow label="Litmus" value={ph < 7 ? "Red" : ph > 7 ? "Blue" : "Green (neutral)"} />
          <DataRow label="Neutralized" value={mixed ? "Yes ✅" : "No"} />
          {mixed && <DataRow label="Equation" value="HCl + NaOH → NaCl + H₂O" />}
        </div>
      }
      analysis={
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      }
    />
  );
}

// ─── 9. Metals & Non-Metals ────────────────────────────────────────
export function MetalsNonMetals() {
  const [metal, setMetal] = useState<"Mg" | "Zn" | "Fe" | "Cu">("Zn");
  const [dropped, setDropped] = useState(false);
  const [gasCollected, setGasCollected] = useState(0);
  const [splintTest, setSplintTest] = useState(false);
  const [step, setStep] = useState(0);

  const reactivity: Record<string, number> = { Mg: 4, Zn: 3, Fe: 2, Cu: 0 };
  const rate = reactivity[metal];
  const reacts = rate > 0;

  useEffect(() => {
    if (!dropped || !reacts) return;
    const interval = setInterval(() => {
      setGasCollected((g) => {
        if (g >= 100) { clearInterval(interval); return 100; }
        return g + rate * 2;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [dropped, reacts, rate]);

  const reset = () => { setMetal("Zn"); setDropped(false); setGasCollected(0); setSplintTest(false); setStep(0); };

  const steps = [
    "Drag a beaker containing hydrochloric acid to the workspace",
    "Add a zinc metal strip into the acid",
    "Observe bubbles forming",
    "Collect gas in the gas collection tube",
    "Test the gas using a burning splint",
    "Observe the pop sound indicating hydrogen gas",
    "Record the reaction observations",
    "Compare reactivity of different metals",
  ];

  return (
    <SimulationLayout
      title="Metals & Non-Metals"
      objective="Observe the reaction of metals with acids"
      theory="Reactive metals displace hydrogen from acids: Metal + HCl → Metal Chloride + H₂. Reactivity: Mg > Zn > Fe > Cu (Cu does not react)."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Select Metal</p>
          {(["Mg", "Zn", "Fe", "Cu"] as const).map((m) => (
            <label key={m} className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="radio" name="metal" checked={metal === m} onChange={() => { setMetal(m); setDropped(false); setGasCollected(0); setSplintTest(false); }} className="accent-primary" />
              {m} {m === "Mg" ? "(Magnesium)" : m === "Zn" ? "(Zinc)" : m === "Fe" ? "(Iron)" : "(Copper)"}
            </label>
          ))}
          <hr className="border-border" />
          <button onClick={() => { setDropped(true); setStep(Math.max(step, 1)); }} disabled={dropped} className="w-full px-2 py-1.5 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50">
            {dropped ? "Metal Added ✅" : `Drop ${metal} into HCl`}
          </button>
          {gasCollected >= 50 && (
            <button onClick={() => { setSplintTest(true); setStep(Math.max(step, 4)); }} disabled={splintTest || !reacts} className="w-full px-2 py-1.5 text-xs rounded-md bg-accent text-accent-foreground disabled:opacity-50">
              {splintTest ? "Pop! 💥 H₂ confirmed" : "🔥 Burning Splint Test"}
            </button>
          )}
          {/* Reactivity panel */}
          <div className="p-2 rounded bg-muted/50 text-xs space-y-1">
            <p className="font-semibold text-muted-foreground">Reactivity Series</p>
            {["Mg", "Zn", "Fe", "Cu"].map((m) => (
              <div key={m} className="flex items-center gap-1">
                <div className="h-1.5 rounded-full" style={{ width: `${reactivity[m] * 25}%`, backgroundColor: metal === m ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", opacity: metal === m ? 1 : 0.3 }} />
                <span className={metal === m ? "font-bold text-primary" : "text-muted-foreground"}>{m}</span>
              </div>
            ))}
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 420 280" className="w-full h-56 bg-muted/30 rounded-lg border border-border">
          {/* Lab bench */}
          <rect x={0} y={245} width={420} height={35} fill="hsl(var(--muted))" />
          {/* Beaker with HCl */}
          <path d="M80,80 L70,210 Q70,220 80,220 L200,220 Q210,220 210,210 L200,80" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={75} y={120} width={140} height={98} fill="#22c55e15" rx={2} />
          <text x={140} y={235} textAnchor="middle" className="text-[8px] fill-muted-foreground">HCl (aq)</text>
          {/* Metal strip */}
          {dropped && (
            <rect x={120} y={110} width={15} height={80} fill={metal === "Cu" ? "#b87333" : "#9ca3af"} stroke="hsl(var(--border))" strokeWidth={0.5} rx={1} />
          )}
          {/* Bubbles */}
          {dropped && reacts && gasCollected < 100 && Array.from({ length: rate * 3 }, (_, i) => (
            <circle key={i} cx={125 + Math.random() * 20} cy={180 - i * 15} r={2 + Math.random() * 2} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={0.5}>
              <animate attributeName="cy" values={`${180 - i * 15};${100 - i * 10}`} dur={`${0.8 + Math.random()}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0" dur={`${1 + Math.random()}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* No reaction for Cu */}
          {dropped && !reacts && (
            <text x={140} y={160} textAnchor="middle" className="text-[10px] fill-destructive font-bold">No Reaction ❌</text>
          )}
          {/* Gas collection tube */}
          <rect x={280} y={50} width={50} height={140} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1.5} rx={3} />
          {gasCollected > 0 && reacts && (
            <rect x={282} y={50 + (1 - gasCollected / 100) * 136} width={46} height={gasCollected / 100 * 136} fill="hsl(var(--primary) / 0.15)" rx={2} />
          )}
          <text x={305} y={200} textAnchor="middle" className="text-[7px] fill-muted-foreground">GAS TUBE</text>
          <text x={305} y={212} textAnchor="middle" className="text-[8px] fill-foreground font-mono">{Math.min(gasCollected, 100).toFixed(0)}%</text>
          {/* Splint test result */}
          {splintTest && (
            <>
              <circle cx={305} cy={40} r={12} fill="#f97316" opacity={0.6}>
                <animate attributeName="r" values="8;16;8" dur="0.3s" repeatCount="3" />
              </circle>
              <text x={305} y={30} textAnchor="middle" className="text-[10px] fill-foreground font-bold">💥 Pop!</text>
            </>
          )}
          {/* Equation */}
          {dropped && reacts && (
            <text x={210} y={270} textAnchor="middle" className="text-[9px] fill-primary font-bold">
              {metal} + 2HCl → {metal}Cl₂ + H₂↑
            </text>
          )}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Metal" value={metal} />
          <DataRow label="Acid" value="HCl" />
          <DataRow label="Reactivity" value={rate === 0 ? "None" : rate <= 2 ? "Low" : rate <= 3 ? "Medium" : "High"} />
          <DataRow label="Bubbles" value={dropped && reacts ? "Yes (H₂)" : dropped ? "None" : "—"} />
          <DataRow label="Gas Collected" value={Math.min(gasCollected, 100).toFixed(0)} unit="%" />
          <DataRow label="Splint Test" value={splintTest ? "Pop! (H₂ ✅)" : "—"} />
          {dropped && reacts && <DataRow label="Product" value={`${metal}Cl₂`} />}
        </div>
      }
      analysis={
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      }
    />
  );
}
