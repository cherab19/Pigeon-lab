import { useState } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

export function BacterialTransformation() {
  const [step, setStep] = useState(0);
  const steps = ["Cut Plasmid", "Insert Gene", "Add Ligase", "Transform Bacteria", "Select Colonies"];
  const reset = () => setStep(0);
  return (
    <SimulationLayout title="Lab: Bacterial Transformation" objective="Insert a gene into bacteria using a plasmid vector" theory="Cut plasmid → insert gene → ligate → transform → select on antibiotic plates." onReset={reset}
      equipment={<div className="space-y-3">
        <button onClick={() => setStep(Math.min(4, step + 1))} disabled={step >= 4} className="w-full px-3 py-2 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50">
          {step < 4 ? `Next: ${steps[step + 1]}` : "Complete ✅"}
        </button>
        <div className="space-y-1">{steps.map((s, i) => <p key={i} className={`text-xs ${i <= step ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{i <= step ? "✅" : "⬜"} {s}</p>)}</div>
      </div>}
      workspace={<svg viewBox="0 0 300 220" className="w-full h-48">
        {step >= 0 && <><circle cx={80} cy={80} r={30} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray={step === 0 ? "20,5" : "0"} /><text x={80} y={83} textAnchor="middle" className="text-[8px] fill-primary">Plasmid</text></>}
        {step >= 1 && <rect x={65} y={70} width={30} height={8} fill="#22c55e" rx={2} />}
        {step >= 1 && <text x={80} y={120} textAnchor="middle" className="text-[7px] fill-foreground">Gene inserted</text>}
        {step >= 2 && <text x={80} y={135} textAnchor="middle" className="text-[7px] fill-accent">Ligase sealed ✓</text>}
        {step >= 3 && <><circle cx={200} cy={120} r={40} fill="#eab30811" stroke="#eab308" strokeWidth={1} rx={4} />
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={185 + (i % 3) * 15} cy={105 + Math.floor(i / 3) * 15} r={4} fill={step >= 4 ? "#22c55e" : "#eab308"} opacity={0.6} />)}
          <text x={200} y={175} textAnchor="middle" className="text-[8px] fill-foreground">Petri Dish</text></>}
        {step >= 4 && <text x={200} y={195} textAnchor="middle" className="text-[9px] fill-primary font-bold">Glowing colonies! ✨</text>}
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Step" value={`${step + 1}/5`} /><DataRow label="Current" value={steps[step]} /><DataRow label="Status" value={step >= 4 ? "Success ✅" : "In progress"} /></div>}
    />
  );
}

export function NaturalSelection() {
  const [generations, setGenerations] = useState(0);
  const [predatorPresent, setPredatorPresent] = useState(false);
  const [bgColor, setBgColor] = useState("light");
  const lightAlleleFreq = bgColor === "light" && predatorPresent ? Math.max(10, 80 - generations * 5) : bgColor === "dark" && predatorPresent ? Math.min(90, 20 + generations * 5) : 50;
  const darkAlleleFreq = 100 - lightAlleleFreq;
  const reset = () => { setGenerations(0); setPredatorPresent(false); setBgColor("light"); };
  return (
    <SimulationLayout title="Lab: Natural Selection Simulator" objective="Observe how environment drives allele frequency changes" theory="Organisms with traits better suited to the environment survive and reproduce more." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Generations" value={generations} onChange={setGenerations} min={0} max={20} />
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={predatorPresent} onChange={e => setPredatorPresent(e.target.checked)} className="rounded" />Add Predator</label>
        <div className="space-y-1"><p className="text-xs text-muted-foreground">Background:</p>
          {["light", "dark"].map(c => <label key={c} className="flex items-center gap-2 text-xs capitalize"><input type="radio" checked={bgColor === c} onChange={() => setBgColor(c)} />{c}</label>)}
        </div>
      </div>}
      workspace={<svg viewBox="0 0 400 200" className="w-full h-44">
        <rect x={20} y={20} width={360} height={140} fill={bgColor === "light" ? "#e5e7eb" : "#374151"} rx={6} />
        {Array.from({ length: 20 }, (_, i) => {
          const isLight = i < Math.floor(lightAlleleFreq / 5);
          return <circle key={i} cx={40 + (i % 10) * 35} cy={50 + Math.floor(i / 10) * 60} r={12} fill={isLight ? "#d1d5db" : "#1f2937"} stroke={isLight ? "#9ca3af" : "#4b5563"} strokeWidth={1} />;
        })}
        {predatorPresent && <text x={350} y={170} className="text-[12px]">🦅</text>}
        <text x={200} y={185} textAnchor="middle" className="text-[9px] fill-foreground font-bold">Generation {generations}</text>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Light Allele" value={`${lightAlleleFreq}%`} /><DataRow label="Dark Allele" value={`${darkAlleleFreq}%`} /><DataRow label="Predator" value={predatorPresent ? "Present" : "Absent"} /><DataRow label="Selection" value={predatorPresent ? `Favors ${bgColor === "light" ? "light" : "dark"}` : "None"} /></div>}
    />
  );
}

export function ReflexArcSynapse() {
  const [stimulated, setStimulated] = useState(false);
  const [impulsePos, setImpulsePos] = useState(0);
  const handleStimulate = () => { setStimulated(true); setImpulsePos(0); let p = 0; const iv = setInterval(() => { p += 10; setImpulsePos(p); if (p >= 100) { clearInterval(iv); } }, 200); };
  const reset = () => { setStimulated(false); setImpulsePos(0); };
  return (
    <SimulationLayout title="Lab: Reflex Arc & Synapse" objective="Trace a nerve impulse along a reflex arc" theory="Stimulus → receptor → sensory neuron → interneuron → motor neuron → effector." onReset={reset}
      equipment={<div className="space-y-4">
        <button onClick={handleStimulate} disabled={stimulated && impulsePos < 100} className="w-full px-3 py-2 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50">
          {!stimulated ? "Tap Patellar Tendon 🔨" : impulsePos >= 100 ? "Reflex Complete! 🦵" : "Impulse traveling..."}
        </button>
      </div>}
      workspace={<svg viewBox="0 0 400 200" className="w-full h-44">
        <line x1={30} y1={100} x2={120} y2={100} stroke="hsl(var(--primary))" strokeWidth={3} />
        <text x={75} y={90} textAnchor="middle" className="text-[7px] fill-primary">Sensory</text>
        <circle cx={140} cy={100} r={15} fill="hsl(var(--accent) / 0.3)" stroke="hsl(var(--accent))" strokeWidth={1} />
        <text x={140} y={103} textAnchor="middle" className="text-[6px] fill-foreground">Inter</text>
        <rect x={155} y={95} width={15} height={10} fill="hsl(var(--muted))" stroke="hsl(var(--border))" />
        <text x={163} y={88} textAnchor="middle" className="text-[5px] fill-muted-foreground">Synapse</text>
        <line x1={170} y1={100} x2={300} y2={100} stroke="hsl(var(--secondary))" strokeWidth={3} />
        <text x={235} y={90} textAnchor="middle" className="text-[7px] fill-secondary">Motor</text>
        <rect x={310} y={80} width={60} height={40} fill="#ef444422" stroke="#ef4444" strokeWidth={1} rx={6} />
        <text x={340} y={105} textAnchor="middle" className="text-[7px] fill-foreground">Muscle</text>
        {stimulated && impulsePos < 100 && <circle cx={30 + impulsePos * 3.4} cy={100} r={6} fill="#eab308"><animate attributeName="opacity" values="1;0.5;1" dur="0.3s" repeatCount="indefinite" /></circle>}
        {impulsePos >= 100 && <text x={340} y={140} textAnchor="middle" className="text-[10px] fill-primary font-bold">💪 Kick!</text>}
        <circle cx={15} cy={100} r={8} fill="#f9731644" stroke="#f97316" strokeWidth={1} /><text x={15} y={103} textAnchor="middle" className="text-[6px]">🔨</text>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Stimulus" value={stimulated ? "Applied" : "Ready"} /><DataRow label="Impulse" value={`${impulsePos}%`} /><DataRow label="Response" value={impulsePos >= 100 ? "Knee jerk! 🦵" : "Waiting..."} /></div>}
    />
  );
}

export function HormoneCycle() {
  const [day, setDay] = useState(1);
  const fsh = day <= 14 ? 20 + (14 - Math.abs(day - 7)) * 3 : 10;
  const lh = Math.abs(day - 14) < 2 ? 80 : 15;
  const estrogen = day <= 14 ? day * 5 : 70 - (day - 14) * 3;
  const progesterone = day > 14 ? (day - 14) * 5 : 5;
  const phase = day <= 5 ? "Menstruation" : day <= 13 ? "Follicular" : day === 14 ? "Ovulation" : "Luteal";
  const reset = () => setDay(1);
  return (
    <SimulationLayout title="Lab: Hormone Cycle (Menstrual Cycle)" objective="Track hormone levels through the 28-day cycle" theory="FSH→follicle growth, Estrogen→lining, LH→ovulation, Progesterone→maintains lining." onReset={reset}
      equipment={<div className="space-y-4"><ControlGroup label="Day" value={day} onChange={setDay} min={1} max={28} unit="" /></div>}
      workspace={<svg viewBox="0 0 400 220" className="w-full h-48">
        <text x={200} y={15} textAnchor="middle" className="text-[9px] fill-foreground font-bold">Hormone Levels — Day {day} ({phase})</text>
        <line x1={40} y1={200} x2={370} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
        <line x1={40} y1={20} x2={40} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
        {Array.from({ length: 28 }, (_, i) => {
          const d = i + 1;
          const x = 40 + (d / 28) * 330;
          const fshY = 200 - ((d <= 14 ? 20 + (14 - Math.abs(d - 7)) * 3 : 10) / 100) * 170;
          const lhY = 200 - ((Math.abs(d - 14) < 2 ? 80 : 15) / 100) * 170;
          const estY = 200 - ((d <= 14 ? d * 5 : 70 - (d - 14) * 3) / 100) * 170;
          const progY = 200 - ((d > 14 ? (d - 14) * 5 : 5) / 100) * 170;
          const px = 40 + ((d - 1) / 28) * 330;
          return d > 1 ? <g key={d}>
            <line x1={px} y1={200 - (((d-1) <= 14 ? 20 + (14 - Math.abs((d-1) - 7)) * 3 : 10) / 100) * 170} x2={x} y2={fshY} stroke="#f97316" strokeWidth={1} />
            <line x1={px} y1={200 - ((Math.abs((d-1) - 14) < 2 ? 80 : 15) / 100) * 170} x2={x} y2={lhY} stroke="#ef4444" strokeWidth={1} />
            <line x1={px} y1={200 - (((d-1) <= 14 ? (d-1) * 5 : 70 - ((d-1) - 14) * 3) / 100) * 170} x2={x} y2={estY} stroke="#3b82f6" strokeWidth={1} />
            <line x1={px} y1={200 - (((d-1) > 14 ? ((d-1) - 14) * 5 : 5) / 100) * 170} x2={x} y2={progY} stroke="#22c55e" strokeWidth={1} />
          </g> : null;
        })}
        <line x1={40 + (day / 28) * 330} y1={20} x2={40 + (day / 28) * 330} y2={200} stroke="hsl(var(--foreground))" strokeWidth={1} strokeDasharray="3,3" />
        <g transform="translate(280,25)">
          {[["FSH", "#f97316"], ["LH", "#ef4444"], ["Estrogen", "#3b82f6"], ["Progesterone", "#22c55e"]].map(([n, c], i) => (
            <g key={n}><rect x={0} y={i * 12} width={8} height={8} fill={c as string} rx={1} /><text x={12} y={i * 12 + 7} className="text-[6px] fill-foreground">{n}</text></g>
          ))}
        </g>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Day" value={day} /><DataRow label="Phase" value={phase} /><DataRow label="FSH" value={fsh.toFixed(0)} /><DataRow label="LH" value={lh.toFixed(0)} /><DataRow label="Estrogen" value={Math.max(0, estrogen).toFixed(0)} /><DataRow label="Progesterone" value={progesterone.toFixed(0)} /></div>}
    />
  );
}
