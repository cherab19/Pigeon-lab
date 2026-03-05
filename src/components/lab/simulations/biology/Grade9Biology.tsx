import { useState } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

export function MicroscopeSimulation() {
  const [objective, setObjective] = useState(4);
  const [focus, setFocus] = useState(50);
  const [light, setLight] = useState(50);
  const magnification = 10 * objective;
  const clarity = 100 - Math.abs(focus - 50) * 2;
  const reset = () => { setObjective(4); setFocus(50); setLight(50); };
  return (
    <SimulationLayout title="Lab: Microscope Simulation" objective="Learn to operate a compound microscope" theory="Total magnification = eyepiece (10×) × objective lens." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1"><p className="text-xs text-muted-foreground font-medium">Objective Lens</p>
          {[4, 10, 40].map(o => <label key={o} className="flex items-center gap-2 text-xs"><input type="radio" checked={objective === o} onChange={() => setObjective(o)} />{o}×</label>)}
        </div>
        <ControlGroup label="Focus" value={focus} onChange={setFocus} min={0} max={100} />
        <ControlGroup label="Light" value={light} onChange={setLight} min={0} max={100} unit="%" />
      </div>}
      workspace={<svg viewBox="0 0 300 300" className="w-full h-56">
        <circle cx={150} cy={150} r={130} fill={`rgba(255,255,255,${light / 100})`} stroke="hsl(var(--border))" strokeWidth={3} />
        <g opacity={clarity / 100}>
          {objective >= 4 && <><circle cx={120} cy={130} r={25} fill="none" stroke="#22c55e" strokeWidth={1.5} /><circle cx={170} cy={140} r={22} fill="none" stroke="#22c55e" strokeWidth={1.5} /><circle cx={140} cy={170} r={20} fill="none" stroke="#22c55e" strokeWidth={1.5} /></>}
          {objective >= 10 && <><circle cx={120} cy={130} r={8} fill="#22c55e33" /><circle cx={170} cy={140} r={7} fill="#22c55e33" /><circle cx={140} cy={170} r={9} fill="#22c55e33" /></>}
          {objective >= 40 && <><circle cx={120} cy={130} r={4} fill="#16a34a" /><circle cx={170} cy={140} r={3.5} fill="#16a34a" /><circle cx={140} cy={170} r={4.5} fill="#16a34a" /><text x={120} y={120} className="text-[5px] fill-foreground">nucleus</text></>}
        </g>
        <text x={150} y={295} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{magnification}× Magnification</text>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Magnification" value={`${magnification}×`} /><DataRow label="Clarity" value={`${clarity}%`} /><DataRow label="Light" value={`${light}%`} /></div>}
    />
  );
}

export function CellObservation() {
  const [zoom, setZoom] = useState(1);
  const reset = () => setZoom(1);
  return (
    <SimulationLayout title="Lab: Cell Observation (Plant vs Animal)" objective="Compare plant and animal cell structures" theory="Plant cells have cell walls, chloroplasts, large vacuoles. Animal cells have centrioles." onReset={reset}
      equipment={<div className="space-y-4"><ControlGroup label="Zoom" value={zoom} onChange={setZoom} min={1} max={5} step={0.5} unit="×" /></div>}
      workspace={<svg viewBox="0 0 400 250" className="w-full h-52">
        <text x={100} y={15} textAnchor="middle" className="text-[10px] fill-primary font-bold">Plant Cell</text>
        <rect x={20} y={25} width={160} height={200} fill="#22c55e11" stroke="#22c55e" strokeWidth={2 * zoom} rx={4} />
        <ellipse cx={100} cy={125} rx={60 / zoom * zoom} ry={70 / zoom * zoom} fill="#22c55e22" stroke="#16a34a" strokeWidth={1} />
        <circle cx={80} cy={110} r={15} fill="#15803d44" stroke="#15803d" strokeWidth={1} /><text x={80} y={113} textAnchor="middle" className="text-[6px] fill-foreground">Nucleus</text>
        <rect x={110} y={80} width={30} height={60} fill="#22c55e33" stroke="#22c55e" strokeWidth={0.5} rx={4} /><text x={125} y={115} textAnchor="middle" className="text-[5px] fill-foreground">Vacuole</text>
        {[0,1,2].map(i => <circle key={i} cx={60 + i * 25} cy={160 + i * 5} r={4} fill="#16a34a55" />)}
        <text x={85} y={185} className="text-[5px] fill-foreground">Chloroplasts</text>
        <text x={300} y={15} textAnchor="middle" className="text-[10px] fill-accent font-bold">Animal Cell</text>
        <ellipse cx={300} cy={125} rx={80} ry={90} fill="#f9731611" stroke="#f97316" strokeWidth={1.5} />
        <circle cx={290} cy={110} r={18} fill="#f9731622" stroke="#ea580c" strokeWidth={1} /><text x={290} y={113} textAnchor="middle" className="text-[6px] fill-foreground">Nucleus</text>
        <circle cx={320} cy={140} r={3} fill="#ea580c" /><circle cx={325} cy={135} r={3} fill="#ea580c" /><text x={340} y={140} className="text-[5px] fill-foreground">Centrioles</text>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Zoom" value={`${zoom}×`} /><DataRow label="Plant features" value="Wall, chloroplasts" /><DataRow label="Animal features" value="Centrioles, no wall" /></div>}
    />
  );
}

export function FoodTestingLab() {
  const [food, setFood] = useState("bread");
  const [reagent, setReagent] = useState("iodine");
  const results: Record<string, Record<string, { color: string; positive: boolean; nutrient: string }>> = {
    bread: { iodine: { color: "#1e3a5f", positive: true, nutrient: "Starch" }, benedicts: { color: "#f97316", positive: true, nutrient: "Sugar" }, biuret: { color: "#93c5fd", positive: false, nutrient: "Protein" } },
    milk: { iodine: { color: "#eab308", positive: false, nutrient: "Starch" }, benedicts: { color: "#f97316", positive: true, nutrient: "Sugar" }, biuret: { color: "#7c3aed", positive: true, nutrient: "Protein" } },
    oil: { iodine: { color: "#eab308", positive: false, nutrient: "Starch" }, benedicts: { color: "#3b82f6", positive: false, nutrient: "Sugar" }, biuret: { color: "#93c5fd", positive: false, nutrient: "Protein" } },
  };
  const result = results[food]?.[reagent];
  const reset = () => { setFood("bread"); setReagent("iodine"); };
  return (
    <SimulationLayout title="Lab: Food Testing" objective="Test foods for starch, sugar, and protein" theory="Iodine→blue-black=starch, Benedict's→orange=sugar, Biuret→purple=protein" onReset={reset}
      equipment={<div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Food:</p>
        {["bread", "milk", "oil"].map(f => <label key={f} className="flex items-center gap-2 text-xs"><input type="radio" checked={food === f} onChange={() => setFood(f)} />{f}</label>)}
        <p className="text-xs font-semibold text-muted-foreground mt-2">Reagent:</p>
        {["iodine", "benedicts", "biuret"].map(r => <label key={r} className="flex items-center gap-2 text-xs"><input type="radio" checked={reagent === r} onChange={() => setReagent(r)} />{r}</label>)}
      </div>}
      workspace={<svg viewBox="0 0 300 250" className="w-full h-52">
        <rect x={110} y={40} width={80} height={160} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
        <rect x={120} y={100} width={60} height={90} fill={result?.color || "#ccc"} opacity={0.7} rx={2} />
        <text x={150} y={220} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{result?.positive ? `✅ ${result.nutrient} detected!` : `❌ No ${result?.nutrient}`}</text>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Food" value={food} /><DataRow label="Reagent" value={reagent} /><DataRow label="Result" value={result?.positive ? "Positive" : "Negative"} /></div>}
    />
  );
}

export function EcosystemSimulation() {
  const [grass, setGrass] = useState(100);
  const [rabbits, setRabbits] = useState(30);
  const [foxes, setFoxes] = useState(5);
  const [rainfall, setRainfall] = useState(50);
  const grassGrowth = grass * (1 + rainfall / 200) - rabbits * 2;
  const rabbitGrowth = rabbits * (grass > 50 ? 1.1 : 0.8) - foxes * 4;
  const foxGrowth = foxes * (rabbits > 10 ? 1.05 : 0.7);
  const reset = () => { setGrass(100); setRabbits(30); setFoxes(5); setRainfall(50); };
  return (
    <SimulationLayout title="Lab: Ecosystem Simulation" objective="Observe predator-prey dynamics" theory="Energy flows: producers → primary consumers → secondary consumers. ~10% efficiency per level." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Grass" value={grass} onChange={setGrass} min={0} max={200} />
        <ControlGroup label="Rabbits" value={rabbits} onChange={setRabbits} min={0} max={100} />
        <ControlGroup label="Foxes" value={foxes} onChange={setFoxes} min={0} max={20} />
        <ControlGroup label="Rainfall" value={rainfall} onChange={setRainfall} min={0} max={100} unit="mm" />
      </div>}
      workspace={<svg viewBox="0 0 400 200" className="w-full h-44">
        <rect x={20} y={150} width={360} height={40} fill="#22c55e33" rx={4} />
        <text x={200} y={175} textAnchor="middle" className="text-[10px] fill-foreground">🌿 Grass: {grass}</text>
        <text x={120} y={120} textAnchor="middle" className="text-[10px] fill-foreground">🐰 ×{rabbits}</text>
        <text x={280} y={80} textAnchor="middle" className="text-[10px] fill-foreground">🦊 ×{foxes}</text>
        <text x={200} y={30} textAnchor="middle" className="text-[9px] fill-muted-foreground">Energy Pyramid</text>
        <polygon points="100,140 300,140 250,100 150,100" fill="#eab30822" stroke="#eab308" strokeWidth={1} />
        <polygon points="150,100 250,100 230,70 170,70" fill="#ef444422" stroke="#ef4444" strokeWidth={1} />
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Grass Growth" value={grassGrowth.toFixed(0)} /><DataRow label="Rabbit Pop" value={rabbitGrowth.toFixed(0)} /><DataRow label="Fox Pop" value={foxGrowth.toFixed(1)} /></div>}
    />
  );
}
