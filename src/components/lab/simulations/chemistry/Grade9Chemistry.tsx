import { useState } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

// 1. Lab Safety & Measurement
export function LabSafety() {
  const [goggles, setGoggles] = useState(false);
  const [gloves, setGloves] = useState(false);
  const [apron, setApron] = useState(false);
  const [mass, setMass] = useState(0);
  const [temp, setTemp] = useState(25);
  const safetyScore = (goggles ? 33 : 0) + (gloves ? 33 : 0) + (apron ? 34 : 0);
  const reset = () => { setGoggles(false); setGloves(false); setApron(false); setMass(0); setTemp(25); };

  return (
    <SimulationLayout title="Lab: Lab Safety & Measurement" objective="Practice safety protocols and basic measurement" theory="Always wear safety equipment before handling chemicals or heat sources." onReset={reset}
      equipment={<div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Safety Equipment:</p>
        {[{ label: "Safety Goggles", val: goggles, set: setGoggles }, { label: "Lab Gloves", val: gloves, set: setGloves }, { label: "Lab Apron", val: apron, set: setApron }].map(s => (
          <label key={s.label} className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={s.val} onChange={e => s.set(e.target.checked)} className="rounded" />
            {s.label} {s.val ? "✅" : "❌"}
          </label>
        ))}
        <hr className="border-border" />
        <ControlGroup label="Sample Mass" value={mass} onChange={setMass} min={0} max={500} step={0.1} unit="g" />
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={-10} max={150} step={0.5} unit="°C" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <rect x={130} y={140} width={140} height={10} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} />
          <rect x={160} y={90} width={80} height={50} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={1.5} rx={2} />
          <text x={200} y={120} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{mass.toFixed(1)} g</text>
          <text x={200} y={165} textAnchor="middle" className="text-[9px] fill-muted-foreground">Digital Balance</text>
          <rect x={300} y={60} width={12} height={100} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={6} />
          <rect x={302} y={60 + (1 - (temp + 10) / 160) * 96} width={8} height={(temp + 10) / 160 * 96} fill="#ef4444" rx={4} />
          <text x={306} y={55} textAnchor="middle" className="text-[8px] fill-foreground">{temp}°C</text>
          <text x={306} y={175} textAnchor="middle" className="text-[8px] fill-muted-foreground">Therm.</text>
          <rect x={20} y={20} width={80} height={30} fill={safetyScore === 100 ? "hsl(var(--primary) / 0.2)" : "#ef444433"} stroke={safetyScore === 100 ? "hsl(var(--primary))" : "#ef4444"} strokeWidth={1.5} rx={6} />
          <text x={60} y={40} textAnchor="middle" className="text-[10px] fill-foreground font-bold">Safety: {safetyScore}%</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Safety Score" value={`${safetyScore}%`} />
        <DataRow label="Mass Reading" value={mass.toFixed(1)} unit="g" />
        <DataRow label="Temperature" value={temp.toFixed(1)} unit="°C" />
        <DataRow label="Status" value={safetyScore === 100 ? "Safe ✅" : "Unsafe ⚠️"} />
      </div>}
    />
  );
}

// 2. States of Matter
export function StatesOfMatter() {
  const [temp, setTemp] = useState(25);
  const [molecularView, setMolecularView] = useState(false);
  const state = temp <= 0 ? "Solid (Ice)" : temp < 100 ? "Liquid (Water)" : "Gas (Steam)";
  const color = temp <= 0 ? "#93c5fd" : temp < 100 ? "#3b82f6" : "#d1d5db";
  const reset = () => { setTemp(25); setMolecularView(false); };

  const molecules = Array.from({ length: 20 }, (_, i) => {
    const spacing = temp <= 0 ? 0 : temp < 100 ? temp / 100 : 1 + (temp - 100) / 50;
    const baseX = 100 + (i % 5) * 50 + (Math.random() - 0.5) * spacing * 30;
    const baseY = 80 + Math.floor(i / 5) * 40 + (Math.random() - 0.5) * spacing * 30;
    return { x: baseX, y: baseY, r: temp <= 0 ? 8 : temp < 100 ? 7 : 5 };
  });

  return (
    <SimulationLayout title="Lab: States of Matter" objective="Observe phase transitions of water" theory="Solid→Liquid at 0°C, Liquid→Gas at 100°C. Molecular spacing increases with temperature." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={-20} max={150} step={1} unit="°C" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={molecularView} onChange={e => setMolecularView(e.target.checked)} className="rounded" />
          Molecular View
        </label>
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          {!molecularView ? (
            <>
              <rect x={120} y={60} width={160} height={140} fill="hsl(var(--muted) / 0.5)" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
              {temp <= 0 && <rect x={130} y={120} width={140} height={70} fill={color} rx={2} />}
              {temp > 0 && temp < 100 && <><rect x={130} y={100} width={140} height={90} fill={color} rx={2} opacity={0.6} />
                <path d="M140,100 Q200,85 260,100" fill={color} /></>}
              {temp >= 100 && <>
                {[0, 1, 2, 3, 4].map(i => <circle key={i} cx={160 + i * 20} cy={130 - i * 10} r={8 + i * 2} fill="#d1d5db" opacity={0.4 - i * 0.06} />)}
              </>}
              <text x={200} y={220} textAnchor="middle" className="text-[12px] fill-foreground font-bold">{state}</text>
              <rect x={160} y={200} width={80} height={15} fill="#f97316" rx={3} opacity={temp > 50 ? 0.8 : 0.3} />
              <text x={200} y={245} textAnchor="middle" className="text-[8px] fill-muted-foreground">Bunsen Burner</text>
            </>
          ) : (
            <>
              {molecules.map((m, i) => <circle key={i} cx={m.x} cy={m.y} r={m.r} fill="hsl(var(--primary))" opacity={0.7} />)}
              <text x={200} y={230} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{state} — Molecular View</text>
            </>
          )}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Temperature" value={temp} unit="°C" />
        <DataRow label="State" value={state} />
        <DataRow label="Melting Pt" value="0" unit="°C" />
        <DataRow label="Boiling Pt" value="100" unit="°C" />
      </div>}
    />
  );
}

// 3. Atomic Structure (Bohr Model)
export function AtomicStructure() {
  const [protons, setProtons] = useState(6);
  const [neutrons, setNeutrons] = useState(6);
  const [electrons, setElectrons] = useState(6);
  const elements: Record<number, string> = { 1: "H", 2: "He", 3: "Li", 4: "Be", 5: "B", 6: "C", 7: "N", 8: "O", 9: "F", 10: "Ne", 11: "Na", 12: "Mg", 13: "Al", 14: "Si", 15: "P", 16: "S", 17: "Cl", 18: "Ar", 19: "K", 20: "Ca" };
  const element = elements[protons] || "?";
  const charge = protons - electrons;
  const shell1 = Math.min(electrons, 2);
  const shell2 = Math.min(Math.max(electrons - 2, 0), 8);
  const shell3 = Math.min(Math.max(electrons - 10, 0), 8);
  const reset = () => { setProtons(6); setNeutrons(6); setElectrons(6); };

  return (
    <SimulationLayout title="Lab: Atomic Structure (Bohr Model)" objective="Build an atom by adding protons, neutrons, and electrons" theory="Protons and neutrons are in the nucleus. Electrons orbit in shells: 2, 8, 8..." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Protons (p⁺)" value={protons} onChange={setProtons} min={1} max={20} unit="" />
        <ControlGroup label="Neutrons (n⁰)" value={neutrons} onChange={setNeutrons} min={0} max={25} unit="" />
        <ControlGroup label="Electrons (e⁻)" value={electrons} onChange={setElectrons} min={0} max={20} unit="" />
      </div>}
      workspace={
        <svg viewBox="0 0 300 300" className="w-full h-56">
          <circle cx={150} cy={150} r={25} fill="hsl(var(--primary))" />
          <text x={150} y={148} textAnchor="middle" className="text-[8px] fill-primary-foreground">{protons}p⁺ {neutrons}n⁰</text>
          <text x={150} y={160} textAnchor="middle" className="text-[10px] fill-primary-foreground font-bold">{element}</text>
          {[60, 95, 130].map((r, si) => {
            const count = si === 0 ? shell1 : si === 1 ? shell2 : shell3;
            return (<g key={si}>
              <circle cx={150} cy={150} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3,3" />
              {Array.from({ length: count }, (_, ei) => {
                const a = (ei / Math.max(count, 1)) * 2 * Math.PI - Math.PI / 2;
                return <circle key={ei} cx={150 + r * Math.cos(a)} cy={150 + r * Math.sin(a)} r={5} fill="#3b82f6" />;
              })}
            </g>);
          })}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Element" value={element} />
        <DataRow label="Atomic Number" value={protons} />
        <DataRow label="Mass Number" value={protons + neutrons} />
        <DataRow label="Charge" value={charge === 0 ? "Neutral" : charge > 0 ? `+${charge}` : `${charge}`} />
        <DataRow label="Shell 1" value={`${shell1}/2`} />
        <DataRow label="Shell 2" value={`${shell2}/8`} />
        <DataRow label="Shell 3" value={`${shell3}/8`} />
      </div>}
    />
  );
}

// 4. Chemical Reactions (Combination)
export function ChemicalReactions() {
  const [heated, setHeated] = useState(false);
  const [reacted, setReacted] = useState(false);
  const handleHeat = () => { setHeated(true); setTimeout(() => setReacted(true), 1500); };
  const reset = () => { setHeated(false); setReacted(false); };

  return (
    <SimulationLayout title="Lab: Chemical Reactions (Fe + S)" objective="Observe a combination reaction forming Iron Sulphide" theory="Iron + Sulphur → Iron Sulphide (FeS). This exothermic reaction produces a black compound." onReset={reset}
      equipment={<div className="space-y-4">
        <button onClick={handleHeat} disabled={heated} className="w-full px-3 py-2 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50">
          {heated ? (reacted ? "Reaction Complete ✅" : "Heating... 🔥") : "Apply Heat 🔥"}
        </button>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Iron filings (Fe) — grey</p>
          <p>• Sulphur powder (S) — yellow</p>
        </div>
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <rect x={160} y={40} width={80} height={120} fill="hsl(var(--muted) / 0.5)" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          {!reacted ? (
            <>
              <rect x={170} y={100} width={60} height={25} fill="#9ca3af" rx={2} />
              <text x={200} y={118} textAnchor="middle" className="text-[8px] fill-foreground">Fe (grey)</text>
              <rect x={170} y={70} width={60} height={25} fill="#eab308" rx={2} />
              <text x={200} y={88} textAnchor="middle" className="text-[8px] fill-foreground">S (yellow)</text>
            </>
          ) : (
            <>
              <rect x={170} y={70} width={60} height={55} fill="#1f2937" rx={2} />
              <text x={200} y={102} textAnchor="middle" className="text-[9px] fill-gray-300 font-bold">FeS</text>
            </>
          )}
          {heated && !reacted && (
            <>
              <circle cx={190} cy={90} r={5} fill="#f97316" opacity={0.8}><animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.5s" repeatCount="indefinite" /></circle>
              <circle cx={210} cy={85} r={4} fill="#ef4444" opacity={0.6}><animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.4s" repeatCount="indefinite" /></circle>
            </>
          )}
          {heated && <><circle cx={190} cy={190} r={10} fill="#f97316" opacity={0.6} /><circle cx={210} cy={185} r={8} fill="#ef4444" opacity={0.4} />
            <text x={200} y={215} textAnchor="middle" className="text-[8px] fill-muted-foreground">Bunsen Burner</text></>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Reactants" value="Fe + S" />
        <DataRow label="Product" value="FeS" />
        <DataRow label="Status" value={reacted ? "Complete" : heated ? "Reacting..." : "Ready"} />
        <DataRow label="Type" value="Combination" />
      </div>}
      analysis={reacted ? <p className="text-xs font-mono font-bold text-primary">Fe + S → FeS (Iron Sulphide)</p> : undefined}
    />
  );
}

// 5. Conservation of Mass
export function ConservationOfMass() {
  const [chamberOpen, setChamberOpen] = useState(false);
  const [reacted, setReacted] = useState(false);
  const massBefore = 150.0;
  const gasLoss = chamberOpen ? 2.3 : 0;
  const massAfter = massBefore - gasLoss;
  const handleReact = () => setReacted(true);
  const reset = () => { setChamberOpen(false); setReacted(false); };

  return (
    <SimulationLayout title="Lab: Conservation of Mass" objective="Verify that mass is conserved in a closed reaction" theory="In a closed system, total mass before = total mass after reaction." onReset={reset}
      equipment={<div className="space-y-3">
        <button onClick={handleReact} disabled={reacted} className="w-full px-3 py-2 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50">
          {reacted ? "Reacted ✅" : "Start Reaction"}
        </button>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={chamberOpen} onChange={e => setChamberOpen(e.target.checked)} className="rounded" disabled={!reacted} />
          Open Chamber Lid
        </label>
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          <rect x={130} y={140} width={140} height={12} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={200} y={170} textAnchor="middle" className="text-[9px] fill-muted-foreground">Digital Balance</text>
          <rect x={150} y={60} width={100} height={80} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={2} rx={4} />
          {!chamberOpen && <rect x={148} y={55} width={104} height={8} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={2} />}
          {reacted && <circle cx={200} cy={100} r={15} fill="#eab308" opacity={0.5} />}
          {chamberOpen && reacted && [0, 1, 2].map(i => (
            <circle key={i} cx={200 + (i - 1) * 15} cy={40 - i * 10} r={4} fill="#d1d5db" opacity={0.5}>
              <animate attributeName="cy" values={`${40 - i * 10};${10 - i * 10}`} dur="2s" repeatCount="indefinite" />
            </circle>
          ))}
          <text x={200} y={195} textAnchor="middle" className="text-[14px] fill-foreground font-bold">{massAfter.toFixed(1)} g</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Mass Before" value={massBefore.toFixed(1)} unit="g" />
        <DataRow label="Mass After" value={massAfter.toFixed(1)} unit="g" />
        <DataRow label="Chamber" value={chamberOpen ? "Open" : "Sealed"} />
        <DataRow label="Gas Lost" value={gasLoss.toFixed(1)} unit="g" />
        <DataRow label="Conserved?" value={!chamberOpen ? "Yes ✅" : "No (gas escaped)"} />
      </div>}
    />
  );
}
