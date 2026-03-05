import { useState } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

export function EnzymeActivity() {
  const [temp, setTemp] = useState(37);
  const [pH, setPH] = useState(7);
  const optTemp = 37, optPH = 7;
  const tempFactor = Math.max(0, 1 - Math.pow((temp - optTemp) / 20, 2));
  const pHFactor = Math.max(0, 1 - Math.pow((pH - optPH) / 4, 2));
  const rate = tempFactor * pHFactor * 100;
  const denatured = temp > 60 || pH < 2 || pH > 12;
  const reset = () => { setTemp(37); setPH(7); };
  return (
    <SimulationLayout title="Lab: Enzyme Activity" objective="Investigate temperature and pH effects on enzyme rate" theory="Enzymes have optimal temp/pH. Beyond these, denaturation reduces activity." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={0} max={80} unit="°C" />
        <ControlGroup label="pH" value={pH} onChange={setPH} min={1} max={14} step={0.5} />
      </div>}
      workspace={<svg viewBox="0 0 400 200" className="w-full h-44">
        <line x1={40} y1={180} x2={360} y2={180} stroke="hsl(var(--border))" strokeWidth={1} />
        <line x1={40} y1={20} x2={40} y2={180} stroke="hsl(var(--border))" strokeWidth={1} />
        <text x={200} y={198} textAnchor="middle" className="text-[8px] fill-muted-foreground">Temperature / pH</text>
        {Array.from({ length: 80 }, (_, i) => {
          const t = i;
          const f = Math.max(0, 1 - Math.pow((t - 37) / 20, 2));
          const x = 40 + (t / 80) * 320;
          const y = 180 - f * 150;
          const px = 40 + ((t - 1) / 80) * 320;
          const pf = Math.max(0, 1 - Math.pow((t - 1 - 37) / 20, 2));
          const py = 180 - pf * 150;
          return i > 0 ? <line key={i} x1={px} y1={py} x2={x} y2={y} stroke="hsl(var(--primary) / 0.5)" strokeWidth={1} /> : null;
        })}
        <circle cx={40 + (temp / 80) * 320} cy={180 - rate / 100 * 150} r={5} fill="hsl(var(--primary))" />
        {denatured && <text x={200} y={100} textAnchor="middle" className="text-[12px] fill-destructive font-bold">⚠️ DENATURED</text>}
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Reaction Rate" value={rate.toFixed(1)} unit="%" /><DataRow label="Temperature" value={temp} unit="°C" /><DataRow label="pH" value={pH} /><DataRow label="Status" value={denatured ? "Denatured ⚠️" : "Active ✅"} /></div>}
    />
  );
}

export function Photosynthesis() {
  const [light, setLight] = useState(50);
  const [co2, setCo2] = useState(50);
  const [temp, setTemp] = useState(25);
  const limitingFactor = Math.min(light, co2, temp > 10 && temp < 40 ? 100 : 20);
  const bubbleRate = limitingFactor * 0.6;
  const reset = () => { setLight(50); setCo2(50); setTemp(25); };
  return (
    <SimulationLayout title="Lab: Photosynthesis" objective="Measure O₂ production rate under varying conditions" theory="6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Rate limited by light, CO₂, or temperature." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Light Intensity" value={light} onChange={setLight} min={0} max={100} unit="%" />
        <ControlGroup label="CO₂ Level" value={co2} onChange={setCo2} min={0} max={100} unit="%" />
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={0} max={50} unit="°C" />
      </div>}
      workspace={<svg viewBox="0 0 300 250" className="w-full h-52">
        <rect x={100} y={30} width={100} height={180} fill="#3b82f622" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
        <rect x={130} y={120} width={40} height={80} fill="#22c55e" rx={2} />
        <text x={150} y={165} textAnchor="middle" className="text-[8px] fill-primary-foreground">Elodea</text>
        {bubbleRate > 5 && Array.from({ length: Math.min(10, Math.floor(bubbleRate / 5)) }, (_, i) => (
          <circle key={i} cx={150 + (i % 3 - 1) * 8} cy={110 - i * 8} r={3} fill="#93c5fd" opacity={0.6}>
            <animate attributeName="cy" values={`${110 - i * 8};${30}`} dur={`${3 - bubbleRate / 50}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <text x={150} y={235} textAnchor="middle" className="text-[9px] fill-foreground font-bold">Bubbles: {bubbleRate.toFixed(0)}/min</text>
        <circle cx={50} cy={80} r={25} fill="#eab30833" stroke="#eab308" strokeWidth={light > 30 ? 2 : 0.5} />
        <text x={50} y={83} textAnchor="middle" className="text-[8px] fill-foreground">☀️</text>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="O₂ Bubbles" value={bubbleRate.toFixed(0)} unit="/min" /><DataRow label="Limiting Factor" value={light <= co2 && light <= (temp > 10 ? 100 : 20) ? "Light" : co2 <= light ? "CO₂" : "Temperature"} /></div>}
    />
  );
}

export function HumanTissues() {
  const [tissue, setTissue] = useState("muscle");
  const info: Record<string, { desc: string; cells: string }> = {
    muscle: { desc: "Long, striated fibers that contract for movement", cells: "Multinucleated, elongated" },
    nerve: { desc: "Specialized for transmitting electrical impulses", cells: "Cell body + long axon" },
    epithelial: { desc: "Covers body surfaces and lines organs", cells: "Tightly packed, flat/cuboidal" },
    connective: { desc: "Supports, connects, and separates tissues", cells: "Scattered in matrix" },
  };
  const reset = () => setTissue("muscle");
  return (
    <SimulationLayout title="Lab: Human Tissues (Histology)" objective="Identify different tissue types under microscopy" theory="4 types: epithelial, connective, muscle, nervous. Each has distinct cell shapes." onReset={reset}
      equipment={<div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Select Tissue:</p>
        {Object.keys(info).map(t => <label key={t} className="flex items-center gap-2 text-xs capitalize"><input type="radio" checked={tissue === t} onChange={() => setTissue(t)} />{t}</label>)}
      </div>}
      workspace={<svg viewBox="0 0 300 250" className="w-full h-52">
        <circle cx={150} cy={125} r={110} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={2} />
        {tissue === "muscle" && Array.from({ length: 8 }, (_, i) => <rect key={i} x={60} y={60 + i * 18} width={180} height={12} fill="#ef444433" stroke="#ef4444" strokeWidth={0.5} rx={6} />)}
        {tissue === "nerve" && <><circle cx={100} cy={125} r={20} fill="#a855f733" stroke="#a855f7" strokeWidth={1} /><line x1={120} y1={125} x2={250} y2={125} stroke="#a855f7" strokeWidth={2} /><text x={100} y={128} textAnchor="middle" className="text-[6px] fill-foreground">Cell Body</text><text x={200} y={120} textAnchor="middle" className="text-[6px] fill-foreground">Axon</text></>}
        {tissue === "epithelial" && Array.from({ length: 20 }, (_, i) => <rect key={i} x={70 + (i % 5) * 35} y={70 + Math.floor(i / 5) * 30} width={30} height={25} fill="#3b82f622" stroke="#3b82f6" strokeWidth={0.5} rx={2} />)}
        {tissue === "connective" && <><rect x={50} y={50} width={200} height={150} fill="#eab30811" />{Array.from({ length: 8 }, (_, i) => <circle key={i} cx={80 + Math.random() * 140} cy={80 + Math.random() * 100} r={6} fill="#eab30844" stroke="#eab308" strokeWidth={0.5} />)}</>}
        <text x={150} y={245} textAnchor="middle" className="text-[10px] fill-foreground font-bold capitalize">{tissue} Tissue</text>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Type" value={tissue} /><DataRow label="Description" value={info[tissue].desc} /><DataRow label="Cell Shape" value={info[tissue].cells} /></div>}
    />
  );
}

export function MonohybridCross() {
  const [p1a1, setP1a1] = useState("A");
  const [p1a2, setP1a2] = useState("a");
  const [p2a1, setP2a1] = useState("A");
  const [p2a2, setP2a2] = useState("a");
  const offspring = [`${p1a1}${p2a1}`, `${p1a1}${p2a2}`, `${p1a2}${p2a1}`, `${p1a2}${p2a2}`];
  const dominant = offspring.filter(o => o.includes("A")).length;
  const reset = () => { setP1a1("A"); setP1a2("a"); setP2a1("A"); setP2a2("a"); };
  return (
    <SimulationLayout title="Lab: Monohybrid Cross (Punnett Square)" objective="Predict offspring genotypic and phenotypic ratios" theory="Heterozygous cross Aa × Aa → 1AA : 2Aa : 1aa (3:1 phenotypic ratio)." onReset={reset}
      equipment={<div className="space-y-3">
        <p className="text-xs font-semibold">Parent 1:</p>
        {[["A", setP1a1, p1a1], ["a", setP1a2, p1a2]].map(([label, , val], i) => (
          <div key={i} className="flex gap-2">{["A", "a"].map(a => <label key={a} className="flex items-center gap-1 text-xs"><input type="radio" checked={val === a} onChange={() => (i === 0 ? setP1a1 : setP1a2)(a)} />{a}</label>)}</div>
        ))}
        <p className="text-xs font-semibold">Parent 2:</p>
        {[["A", setP2a1, p2a1], ["a", setP2a2, p2a2]].map(([label, , val], i) => (
          <div key={i} className="flex gap-2">{["A", "a"].map(a => <label key={a} className="flex items-center gap-1 text-xs"><input type="radio" checked={val === a} onChange={() => (i === 0 ? setP2a1 : setP2a2)(a)} />{a}</label>)}</div>
        ))}
      </div>}
      workspace={<svg viewBox="0 0 300 250" className="w-full h-52">
        <text x={150} y={20} textAnchor="middle" className="text-[10px] fill-foreground font-bold">Punnett Square: {p1a1}{p1a2} × {p2a1}{p2a2}</text>
        <rect x={100} y={50} width={50} height={30} fill="hsl(var(--muted))" stroke="hsl(var(--border))" /><text x={125} y={70} textAnchor="middle" className="text-[10px] fill-primary font-bold">{p2a1}</text>
        <rect x={150} y={50} width={50} height={30} fill="hsl(var(--muted))" stroke="hsl(var(--border))" /><text x={175} y={70} textAnchor="middle" className="text-[10px] fill-primary font-bold">{p2a2}</text>
        <rect x={50} y={80} width={50} height={40} fill="hsl(var(--muted))" stroke="hsl(var(--border))" /><text x={75} y={105} textAnchor="middle" className="text-[10px] fill-accent font-bold">{p1a1}</text>
        <rect x={50} y={120} width={50} height={40} fill="hsl(var(--muted))" stroke="hsl(var(--border))" /><text x={75} y={145} textAnchor="middle" className="text-[10px] fill-accent font-bold">{p1a2}</text>
        {offspring.map((o, i) => {
          const x = 100 + (i % 2) * 50, y = 80 + Math.floor(i / 2) * 40;
          return <g key={i}><rect x={x} y={y} width={50} height={40} fill={o.includes("A") ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted))"} stroke="hsl(var(--border))" /><text x={x + 25} y={y + 25} textAnchor="middle" className="text-[12px] fill-foreground font-bold">{o}</text></g>;
        })}
        <text x={150} y={200} textAnchor="middle" className="text-[9px] fill-foreground">Phenotypic Ratio: {dominant}:{4 - dominant} (Dominant:Recessive)</text>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Genotypes" value={offspring.join(", ")} /><DataRow label="Dominant" value={`${dominant}/4`} /><DataRow label="Recessive" value={`${4 - dominant}/4`} /></div>}
    />
  );
}
