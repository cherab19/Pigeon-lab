import { useState, useEffect } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";
import { Button } from "@/components/ui/button";

// ── Lab 1: Cell Structure (Microscope) ──
export function CellStructureMicroscope() {
  const [cellType, setCellType] = useState<"plant" | "animal">("plant");
  const [zoom, setZoom] = useState(10);
  const [focus, setFocus] = useState(50);
  const [showLabels, setShowLabels] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    "Open the virtual microscope",
    "Select the plant cell slide",
    "Place the slide on the stage",
    "Turn on the microscope light",
    "Adjust coarse focus knob",
    "Use fine focus knob for clarity",
    "Adjust magnification (10× → 40×)",
    "Observe plant cell structures",
    "Identify organelles",
    "Record observations",
    "Repeat with animal cell slide",
    "Compare plant and animal cells",
  ];

  const clarity = Math.max(0, 1 - Math.abs(focus - 50) / 50);
  const organelles: Record<string, { x: number; y: number; plant: boolean; animal: boolean }> = {
    "Cell Wall": { x: 150, y: 30, plant: true, animal: false },
    "Cell Membrane": { x: 150, y: 50, plant: true, animal: true },
    "Nucleus": { x: 150, y: 120, plant: true, animal: true },
    "Cytoplasm": { x: 80, y: 90, plant: true, animal: true },
    "Vacuole": { x: 200, y: 80, plant: true, animal: false },
    "Chloroplast": { x: 100, y: 150, plant: true, animal: false },
    "Mitochondria": { x: 200, y: 150, plant: true, animal: true },
    "Centriole": { x: 190, y: 60, plant: false, animal: true },
  };

  const reset = () => { setCellType("plant"); setZoom(10); setFocus(50); setShowLabels(false); setStep(0); };

  return (
    <SimulationLayout title="Lab 1: Cell Structure (Microscope)" objective="Observe and identify plant and animal cell structures" theory="Plant cells have cell wall, large vacuole, chloroplasts. Animal cells have centrioles but lack cell wall." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Cell Type:</p>
          {(["plant", "animal"] as const).map(t => (
            <label key={t} className="flex items-center gap-2 text-xs capitalize">
              <input type="radio" checked={cellType === t} onChange={() => setCellType(t)} /> {t} Cell
            </label>
          ))}
        </div>
        <ControlGroup label="Magnification" value={zoom} onChange={setZoom} min={10} max={100} step={10} unit="×" />
        <ControlGroup label="Focus" value={focus} onChange={setFocus} min={0} max={100} />
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowLabels(!showLabels)}>
          {showLabels ? "Hide" : "Show"} Labels
        </Button>
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-60" style={{ filter: `blur(${(1 - clarity) * 4}px)` }}>
          <circle cx={150} cy={125} r={110} fill="hsl(var(--muted) / 0.2)" stroke="hsl(var(--border))" strokeWidth={2} />
          {cellType === "plant" ? (
            <>
              <rect x={45} y={20} width={210} height={210} fill="none" stroke="#22c55e" strokeWidth={2 * zoom / 40} rx={4} />
              <ellipse cx={150} cy={125} rx={95} ry={95} fill="#22c55e11" stroke="#22c55e88" strokeWidth={1} />
              <ellipse cx={150} cy={120} rx={25} ry={20} fill="#3b82f633" stroke="#3b82f6" strokeWidth={1} />
              <ellipse cx={195} cy={85} rx={40} ry={35} fill="#a855f711" stroke="#a855f7" strokeWidth={0.5} />
              {[{ x: 90, y: 140 }, { x: 110, y: 160 }, { x: 130, y: 145 }].map((p, i) => (
                <ellipse key={i} cx={p.x} cy={p.y} rx={8} ry={5} fill="#22c55e55" stroke="#22c55e" strokeWidth={0.5} />
              ))}
              {[{ x: 190, y: 150 }, { x: 175, y: 165 }].map((p, i) => (
                <ellipse key={i} cx={p.x} cy={p.y} rx={7} ry={4} fill="#ef444433" stroke="#ef4444" strokeWidth={0.5} />
              ))}
            </>
          ) : (
            <>
              <ellipse cx={150} cy={125} rx={95} ry={90} fill="#f9731611" stroke="#f97316" strokeWidth={1.5} />
              <ellipse cx={150} cy={120} rx={28} ry={22} fill="#3b82f633" stroke="#3b82f6" strokeWidth={1} />
              <circle cx={150} cy={115} r={5} fill="#1e40af" />
              {[{ x: 100, y: 90 }, { x: 195, y: 100 }, { x: 110, y: 160 }, { x: 185, y: 155 }].map((p, i) => (
                <ellipse key={i} cx={p.x} cy={p.y} rx={7} ry={4} fill="#ef444433" stroke="#ef4444" strokeWidth={0.5} />
              ))}
              <g transform="translate(185,65)">
                <line x1={0} y1={0} x2={5} y2={10} stroke="#6366f1" strokeWidth={1.5} />
                <line x1={5} y1={0} x2={0} y2={10} stroke="#6366f1" strokeWidth={1.5} />
              </g>
            </>
          )}
          {showLabels && Object.entries(organelles)
            .filter(([, v]) => cellType === "plant" ? v.plant : v.animal)
            .map(([name, pos]) => (
              <text key={name} x={pos.x} y={pos.y} textAnchor="middle" className="text-[7px] fill-primary font-bold">{name}</text>
            ))}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Cell Type" value={cellType} />
        <DataRow label="Magnification" value={`${zoom}×`} />
        <DataRow label="Focus Clarity" value={`${(clarity * 100).toFixed(0)}%`} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ── Lab 2: Osmosis & Diffusion ──
export function OsmosisDiffusion() {
  const [concentration, setConcentration] = useState(5);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [measurements, setMeasurements] = useState<number[]>([]);
  const [step, setStep] = useState(0);

  const steps = [
    "Select the potato strip sample",
    "Measure initial length/mass",
    "Place strip in distilled water",
    "Start the experiment timer",
    "Observe the potato strip",
    "Remove strip from solution",
    "Measure final length/mass",
    "Record the change in size",
    "Repeat with salt solution",
    "Compare the results",
    "Explain using osmosis concept",
  ];

  const initialLength = 50;
  const change = concentration > 5 ? -(concentration - 5) * 0.8 : (5 - concentration) * 0.6;
  const currentLength = initialLength + change * Math.min(time / 30, 1);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTime(t => {
        if (t >= 60) { setRunning(false); return 60; }
        return t + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [running]);

  const reset = () => { setConcentration(5); setRunning(false); setTime(0); setMeasurements([]); setStep(0); };

  return (
    <SimulationLayout title="Lab 2: Osmosis & Diffusion" objective="Investigate water movement through a semi-permeable membrane" theory="Water moves from dilute to concentrated solution through a semi-permeable membrane." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Salt Concentration" value={concentration} onChange={setConcentration} min={0} max={20} unit="%" />
        <Button size="sm" className="w-full" onClick={() => { setRunning(!running); if (!running && time >= 60) setTime(0); }}>
          {running ? "⏸ Pause" : time > 0 && time < 60 ? "▶ Resume" : "▶ Start"}
        </Button>
        <div className="text-xs text-muted-foreground">Time: {time}s / 60s</div>
      </div>}
      workspace={
        <svg viewBox="0 0 300 220" className="w-full h-52">
          <rect x={80} y={40} width={140} height={150} fill="#3b82f611" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <text x={150} y={30} textAnchor="middle" className="text-[9px] fill-muted-foreground">
            {concentration > 5 ? "Hypertonic" : concentration < 5 ? "Hypotonic" : "Isotonic"} Solution ({concentration}%)
          </text>
          {/* Potato strip */}
          <rect x={130} y={70} width={40} height={currentLength * 1.8} fill="#eab308" stroke="#ca8a04" strokeWidth={1} rx={3} />
          <text x={150} y={70 + currentLength * 0.9} textAnchor="middle" className="text-[7px] fill-foreground font-bold">Potato</text>
          {/* Water arrows */}
          {concentration < 5 && time > 0 && Array.from({ length: 4 }, (_, i) => (
            <g key={i}>
              <line x1={110} y1={80 + i * 25} x2={128} y2={80 + i * 25} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrow)" opacity={0.6}>
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
              </line>
            </g>
          ))}
          {concentration > 5 && time > 0 && Array.from({ length: 4 }, (_, i) => (
            <g key={i}>
              <line x1={168} y1={80 + i * 25} x2={190} y2={80 + i * 25} stroke="#ef4444" strokeWidth={1.5} opacity={0.6}>
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
              </line>
            </g>
          ))}
          <text x={150} y={210} textAnchor="middle" className="text-[8px] fill-foreground font-semibold">
            Length: {currentLength.toFixed(1)}mm (Initial: {initialLength}mm)
          </text>
          <defs><marker id="arrow" markerWidth={6} markerHeight={4} refX={6} refY={2} orient="auto"><path d="M0,0 L6,2 L0,4" fill="#3b82f6" /></marker></defs>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Initial Length" value={initialLength} unit="mm" />
        <DataRow label="Current Length" value={currentLength.toFixed(1)} unit="mm" />
        <DataRow label="Change" value={(currentLength - initialLength).toFixed(1)} unit="mm" />
        <DataRow label="Solution" value={concentration > 5 ? "Hypertonic" : concentration < 5 ? "Hypotonic" : "Isotonic"} />
        <DataRow label="Time" value={time} unit="s" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ── Lab 3: Food Tests ──
export function FoodTests11() {
  const [sample, setSample] = useState("starch");
  const [reagent, setReagent] = useState<string | null>(null);
  const [heated, setHeated] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    "Select a food sample",
    "Pour the sample into a test tube",
    "Add iodine for starch test",
    "Observe color change",
    "Record the result",
    "Add Benedict's solution for sugars",
    "Heat the test tube",
    "Observe color change",
    "Record the result",
    "Add Biuret solution for protein",
    "Mix gently and observe",
    "Record the result",
    "Add ethanol for lipid test",
    "Shake and add water",
    "Observe milky layer",
  ];

  const samples: Record<string, Record<string, { color: string; result: string; needsHeat?: boolean }>> = {
    starch: { iodine: { color: "#1a1a6e", result: "Blue-black → Starch present ✅" }, benedicts: { color: "#3b82f6", result: "Blue (no change) → No sugar", needsHeat: true }, biuret: { color: "#3b82f6", result: "Blue (no change) → No protein" }, ethanol: { color: "transparent", result: "Clear → No lipid" } },
    glucose: { iodine: { color: "#b45309", result: "Brown → No starch" }, benedicts: { color: "#f97316", result: "Orange/red → Sugar present ✅", needsHeat: true }, biuret: { color: "#3b82f6", result: "Blue → No protein" }, ethanol: { color: "transparent", result: "Clear → No lipid" } },
    protein: { iodine: { color: "#b45309", result: "Brown → No starch" }, benedicts: { color: "#3b82f6", result: "Blue → No sugar", needsHeat: true }, biuret: { color: "#7c3aed", result: "Purple → Protein present ✅" }, ethanol: { color: "transparent", result: "Clear → No lipid" } },
    oil: { iodine: { color: "#b45309", result: "Brown → No starch" }, benedicts: { color: "#3b82f6", result: "Blue → No sugar", needsHeat: true }, biuret: { color: "#3b82f6", result: "Blue → No protein" }, ethanol: { color: "#f5f5f5", result: "Milky white → Lipid present ✅" } },
  };

  const currentTest = reagent ? samples[sample]?.[reagent] : null;
  const showResult = currentTest && (!currentTest.needsHeat || heated);

  const reset = () => { setSample("starch"); setReagent(null); setHeated(false); setStep(0); };

  return (
    <SimulationLayout title="Lab 3: Food Tests" objective="Test for biological molecules in food samples" theory="Iodine→starch, Benedict's→sugars, Biuret→protein, Ethanol→lipids." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Sample:</p>
          {Object.keys(samples).map(s => (
            <label key={s} className="flex items-center gap-2 text-xs capitalize"><input type="radio" checked={sample === s} onChange={() => { setSample(s); setReagent(null); setHeated(false); }} />{s}</label>
          ))}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Reagent:</p>
          {["iodine", "benedicts", "biuret", "ethanol"].map(r => (
            <label key={r} className="flex items-center gap-2 text-xs capitalize"><input type="radio" checked={reagent === r} onChange={() => { setReagent(r); setHeated(false); }} />{r === "benedicts" ? "Benedict's" : r}</label>
          ))}
        </div>
        {currentTest?.needsHeat && (
          <Button size="sm" variant={heated ? "default" : "outline"} className="w-full text-xs" onClick={() => setHeated(true)}>
            🔥 Heat Test Tube
          </Button>
        )}
      </div>}
      workspace={
        <svg viewBox="0 0 300 220" className="w-full h-52">
          {/* Test tube */}
          <rect x={120} y={30} width={60} height={150} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={2} rx={0} />
          <ellipse cx={150} cy={180} rx={30} ry={8} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Liquid */}
          {reagent && (
            <rect x={122} y={80} width={56} height={100} fill={showResult ? currentTest!.color : "hsl(var(--muted) / 0.5)"} rx={0} opacity={0.7}>
              {!showResult && <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" repeatCount="indefinite" />}
            </rect>
          )}
          {heated && <text x={150} y={210} textAnchor="middle" className="text-[10px] fill-destructive">🔥 Heating...</text>}
          {showResult && <text x={150} y={210} textAnchor="middle" className="text-[8px] fill-primary font-bold">{currentTest!.result}</text>}
          {!reagent && <text x={150} y={130} textAnchor="middle" className="text-[9px] fill-muted-foreground">Select a reagent</text>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Sample" value={sample} />
        <DataRow label="Reagent" value={reagent || "None"} />
        <DataRow label="Heated" value={heated ? "Yes" : "No"} />
        {showResult && <DataRow label="Result" value={currentTest!.result} />}
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ── Lab 4: Enzyme Activity ──
export function EnzymeActivity() {
  const [temp, setTemp] = useState(37);
  const [pH, setPH] = useState(7);
  const [substrate, setSubstrate] = useState(50);
  const [step, setStep] = useState(0);

  const steps = [
    "Select the enzyme reaction simulation",
    "Set initial temperature to 20°C",
    "Add enzyme and substrate",
    "Start the reaction timer",
    "Observe the reaction rate",
    "Record product formed",
    "Increase temperature gradually",
    "Observe changes in rate",
    "Record the results",
    "Reset the experiment",
    "Adjust pH using the slider",
    "Observe enzyme activity",
    "Record results",
    "Plot graph of activity vs temp/pH",
  ];

  const optTemp = 37, optPH = 7;
  const tempFactor = Math.max(0, 1 - Math.pow((temp - optTemp) / 20, 2));
  const pHFactor = Math.max(0, 1 - Math.pow((pH - optPH) / 4, 2));
  const substrateFactor = substrate / (substrate + 20);
  const rate = tempFactor * pHFactor * substrateFactor * 100;
  const denatured = temp > 60 || pH < 2 || pH > 12;

  const reset = () => { setTemp(37); setPH(7); setSubstrate(50); setStep(0); };

  return (
    <SimulationLayout title="Lab 4: Effect of Temperature & pH on Enzyme Activity" objective="Investigate factors affecting enzyme activity" theory="Enzymes have optimal temp (~37°C) and pH (~7). Beyond these, denaturation reduces activity." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={0} max={80} unit="°C" />
        <ControlGroup label="pH" value={pH} onChange={setPH} min={1} max={14} step={0.5} />
        <ControlGroup label="Substrate Conc." value={substrate} onChange={setSubstrate} min={0} max={100} unit="%" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-44">
          <line x1={40} y1={180} x2={360} y2={180} stroke="hsl(var(--border))" strokeWidth={1} />
          <line x1={40} y1={20} x2={40} y2={180} stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={200} y={198} textAnchor="middle" className="text-[8px] fill-muted-foreground">Temperature (°C)</text>
          <text x={15} y={100} textAnchor="middle" className="text-[8px] fill-muted-foreground" transform="rotate(-90,15,100)">Rate</text>
          {Array.from({ length: 80 }, (_, i) => {
            const t = i;
            const f = Math.max(0, 1 - Math.pow((t - 37) / 20, 2));
            const x = 40 + (t / 80) * 320;
            const y = 180 - f * 150;
            const px = 40 + ((t - 1) / 80) * 320;
            const pf = Math.max(0, 1 - Math.pow((t - 1 - 37) / 20, 2));
            const py = 180 - pf * 150;
            return i > 0 ? <line key={i} x1={px} y1={py} x2={x} y2={y} stroke="hsl(var(--primary) / 0.4)" strokeWidth={1} /> : null;
          })}
          <circle cx={40 + (temp / 80) * 320} cy={180 - rate / 100 * 150} r={5} fill="hsl(var(--primary))" />
          {denatured && <text x={200} y={100} textAnchor="middle" className="text-[12px] fill-destructive font-bold">⚠️ DENATURED</text>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Reaction Rate" value={rate.toFixed(1)} unit="%" />
        <DataRow label="Temperature" value={temp} unit="°C" />
        <DataRow label="pH" value={pH} />
        <DataRow label="Substrate" value={substrate} unit="%" />
        <DataRow label="Status" value={denatured ? "Denatured ⚠️" : "Active ✅"} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ── Lab 5: Photosynthesis ──
export function Photosynthesis() {
  const [light, setLight] = useState(50);
  const [co2, setCo2] = useState(50);
  const [temp, setTemp] = useState(25);
  const [step, setStep] = useState(0);

  const steps = [
    "Place aquatic plant in beaker of water",
    "Position light source near plant",
    "Turn on the light source",
    "Observe oxygen bubbles produced",
    "Count bubbles per minute",
    "Record the results",
    "Increase light intensity",
    "Repeat measurement",
    "Record new results",
    "Change CO₂ concentration",
    "Observe effect on O₂ production",
    "Record the results",
    "Plot graph of light vs rate",
  ];

  const tempOk = temp > 10 && temp < 40;
  const limitingFactor = Math.min(light, co2, tempOk ? 100 : 20);
  const bubbleRate = limitingFactor * 0.6;

  const reset = () => { setLight(50); setCo2(50); setTemp(25); setStep(0); };

  return (
    <SimulationLayout title="Lab 5: Photosynthesis" objective="Investigate factors affecting photosynthesis rate" theory="6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Rate limited by light, CO₂, or temperature." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Light Intensity" value={light} onChange={setLight} min={0} max={100} unit="%" />
        <ControlGroup label="CO₂ Level" value={co2} onChange={setCo2} min={0} max={100} unit="%" />
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={0} max={50} unit="°C" />
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          <rect x={100} y={30} width={100} height={180} fill="#3b82f622" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <rect x={130} y={120} width={40} height={80} fill="#22c55e" rx={2} />
          <text x={150} y={165} textAnchor="middle" className="text-[8px] fill-primary-foreground">Elodea</text>
          {bubbleRate > 5 && Array.from({ length: Math.min(10, Math.floor(bubbleRate / 5)) }, (_, i) => (
            <circle key={i} cx={150 + (i % 3 - 1) * 8} cy={110 - i * 8} r={3} fill="#93c5fd" opacity={0.6}>
              <animate attributeName="cy" values={`${110 - i * 8};${30}`} dur={`${Math.max(0.5, 3 - bubbleRate / 50)}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <text x={150} y={235} textAnchor="middle" className="text-[9px] fill-foreground font-bold">Bubbles: {bubbleRate.toFixed(0)}/min</text>
          <circle cx={50} cy={80} r={25} fill="#eab30833" stroke="#eab308" strokeWidth={light > 30 ? 2 : 0.5} />
          <text x={50} y={83} textAnchor="middle" className="text-[8px] fill-foreground">☀️</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="O₂ Bubbles" value={bubbleRate.toFixed(0)} unit="/min" />
        <DataRow label="Limiting Factor" value={light <= co2 && light <= (tempOk ? 100 : 20) ? "Light" : co2 <= light ? "CO₂" : "Temperature"} />
        <DataRow label="Light" value={light} unit="%" />
        <DataRow label="CO₂" value={co2} unit="%" />
        <DataRow label="Temperature" value={temp} unit="°C" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ── Lab 6: Respiration ──
export function Respiration() {
  const [mode, setMode] = useState<"yeast" | "human">("yeast");
  const [oxygenPresent, setOxygenPresent] = useState(true);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    "Place yeast and sugar solution in flask",
    "Connect flask to delivery tube",
    "Insert tube into limewater",
    "Start the experiment",
    "Observe limewater for changes",
    "Record if limewater turns milky",
    "Repeat with oxygen present",
    "Compare aerobic and anaerobic results",
  ];

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setTime(t => t + 1), 200);
    return () => clearInterval(interval);
  }, [running]);

  const co2Rate = mode === "yeast" ? (oxygenPresent ? 30 : 15) : (oxygenPresent ? 25 : 5);
  const limewaterMilky = time > 10;
  const balloonSize = mode === "yeast" && !oxygenPresent ? Math.min(40, time * 1.5) : 0;

  const reset = () => { setMode("yeast"); setOxygenPresent(true); setRunning(false); setTime(0); setStep(0); };

  return (
    <SimulationLayout title="Lab 6: Respiration" objective="Detect CO₂ produced during respiration" theory="Aerobic: glucose + O₂ → CO₂ + H₂O. Anaerobic (yeast): glucose → ethanol + CO₂." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Model:</p>
          {(["yeast", "human"] as const).map(m => (
            <label key={m} className="flex items-center gap-2 text-xs capitalize"><input type="radio" checked={mode === m} onChange={() => setMode(m)} />{m}</label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={oxygenPresent} onChange={e => setOxygenPresent(e.target.checked)} /> Oxygen Present
        </label>
        <Button size="sm" className="w-full" onClick={() => { setRunning(!running); if (!running) setTime(0); }}>
          {running ? "⏸ Stop" : "▶ Start"}
        </Button>
      </div>}
      workspace={
        <svg viewBox="0 0 300 220" className="w-full h-52">
          {/* Flask */}
          <ellipse cx={100} cy={140} rx={40} ry={50} fill="#eab30822" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={90} y={80} width={20} height={40} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={100} y={150} textAnchor="middle" className="text-[7px] fill-foreground">{mode === "yeast" ? "Yeast+Sugar" : "Model"}</text>
          {/* Delivery tube */}
          <line x1={110} y1={90} x2={200} y2={90} stroke="hsl(var(--border))" strokeWidth={2} />
          <line x1={200} y1={90} x2={200} y2={130} stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Limewater */}
          <rect x={180} y={130} width={40} height={60} fill={limewaterMilky ? "#e5e7eb" : "#f0fdf4"} stroke="hsl(var(--border))" strokeWidth={2} rx={2} />
          <text x={200} y={165} textAnchor="middle" className="text-[6px] fill-foreground">{limewaterMilky ? "Milky ✅" : "Clear"}</text>
          <text x={200} y={205} textAnchor="middle" className="text-[7px] fill-muted-foreground">Limewater</text>
          {/* CO2 bubbles */}
          {running && Array.from({ length: 3 }, (_, i) => (
            <circle key={i} cx={200 + (i - 1) * 6} cy={145} r={2} fill="#94a3b8">
              <animate attributeName="cy" values="155;135" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
            </circle>
          ))}
          {/* Balloon for anaerobic */}
          {balloonSize > 0 && (
            <ellipse cx={100} cy={75 - balloonSize / 2} rx={balloonSize / 2} ry={balloonSize / 2} fill="#f9731644" stroke="#f97316" strokeWidth={1} />
          )}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Mode" value={mode} />
        <DataRow label="Oxygen" value={oxygenPresent ? "Present" : "Absent"} />
        <DataRow label="CO₂ Rate" value={co2Rate} unit="ml/min" />
        <DataRow label="Limewater" value={limewaterMilky ? "Milky (CO₂ detected)" : "Clear"} />
        <DataRow label="Respiration Type" value={oxygenPresent ? "Aerobic" : "Anaerobic"} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ── Lab 7: Plant Tissues ──
export function PlantTissues() {
  const [tissue, setTissue] = useState("epidermis");
  const [zoom, setZoom] = useState(10);
  const [showLabels, setShowLabels] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    "Open the virtual microscope viewer",
    "Select the stem cross-section slide",
    "Observe under low magnification",
    "Increase magnification for detail",
    "Identify epidermis",
    "Identify cortex",
    "Identify xylem",
    "Identify phloem",
    "Label each tissue",
    "Record observations",
  ];

  const tissues: Record<string, { desc: string; color: string; cells: string }> = {
    epidermis: { desc: "Outer protective layer, one cell thick", color: "#22c55e", cells: "Flat, tightly packed" },
    cortex: { desc: "Storage tissue between epidermis and vascular bundle", color: "#86efac", cells: "Large, round, with spaces" },
    xylem: { desc: "Transports water and minerals upward", color: "#ef4444", cells: "Thick-walled, hollow tubes" },
    phloem: { desc: "Transports sugars from leaves", color: "#f97316", cells: "Sieve tubes with companion cells" },
  };

  const reset = () => { setTissue("epidermis"); setZoom(10); setShowLabels(false); setStep(0); };

  return (
    <SimulationLayout title="Lab 7: Plant Tissues" objective="Observe and identify plant tissues in a stem cross-section" theory="Stem contains epidermis, cortex, xylem, and phloem tissues." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Highlight Tissue:</p>
          {Object.keys(tissues).map(t => (
            <label key={t} className="flex items-center gap-2 text-xs capitalize"><input type="radio" checked={tissue === t} onChange={() => setTissue(t)} />{t}</label>
          ))}
        </div>
        <ControlGroup label="Magnification" value={zoom} onChange={setZoom} min={4} max={40} step={4} unit="×" />
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowLabels(!showLabels)}>
          {showLabels ? "Hide" : "Show"} Labels
        </Button>
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          <circle cx={150} cy={125} r={110} fill="hsl(var(--muted) / 0.2)" stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Epidermis ring */}
          <circle cx={150} cy={125} r={100} fill="none" stroke={tissue === "epidermis" ? "#22c55e" : "#22c55e44"} strokeWidth={tissue === "epidermis" ? 6 : 3} />
          {/* Cortex */}
          <circle cx={150} cy={125} r={85} fill={tissue === "cortex" ? "#86efac33" : "#86efac11"} stroke={tissue === "cortex" ? "#86efac" : "#86efac44"} strokeWidth={tissue === "cortex" ? 3 : 1} />
          {/* Vascular bundles */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const cx = 150 + Math.cos(angle) * 55;
            const cy = 125 + Math.sin(angle) * 55;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={15} fill={tissue === "xylem" ? "#ef444433" : "#ef444411"} stroke={tissue === "xylem" ? "#ef4444" : "#ef444444"} strokeWidth={tissue === "xylem" ? 2 : 0.5} />
                <circle cx={cx + 8} cy={cy} r={8} fill={tissue === "phloem" ? "#f9731633" : "#f9731611"} stroke={tissue === "phloem" ? "#f97316" : "#f9731644"} strokeWidth={tissue === "phloem" ? 2 : 0.5} />
              </g>
            );
          })}
          {showLabels && <>
            <text x={150} y={30} textAnchor="middle" className="text-[7px] fill-foreground font-bold">Epidermis</text>
            <text x={150} y={55} textAnchor="middle" className="text-[7px] fill-foreground font-bold">Cortex</text>
            <text x={85} y={75} textAnchor="middle" className="text-[6px] fill-destructive font-bold">Xylem</text>
            <text x={215} y={75} textAnchor="middle" className="text-[6px] fill-foreground font-bold" style={{ fill: "#f97316" }}>Phloem</text>
          </>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Tissue" value={tissue} />
        <DataRow label="Description" value={tissues[tissue].desc} />
        <DataRow label="Cell Shape" value={tissues[tissue].cells} />
        <DataRow label="Magnification" value={`${zoom}×`} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ── Lab 8: Transpiration ──
export function Transpiration() {
  const [temp, setTemp] = useState(25);
  const [wind, setWind] = useState(50);
  const [humidity, setHumidity] = useState(50);
  const [lightIntensity, setLightIntensity] = useState(50);
  const [step, setStep] = useState(0);

  const steps = [
    "Select the transpiration simulation",
    "Set environmental conditions",
    "Set temperature",
    "Set wind speed",
    "Set humidity",
    "Start the experiment",
    "Observe rate of water loss",
    "Record the results",
    "Change one factor at a time",
    "Repeat measurements",
    "Compare the results",
  ];

  const tempFactor = Math.min(1, temp / 40);
  const windFactor = wind / 100;
  const humidityFactor = 1 - humidity / 100;
  const lightFactor = lightIntensity / 100;
  const transpRate = (tempFactor * 0.3 + windFactor * 0.25 + humidityFactor * 0.25 + lightFactor * 0.2) * 100;
  const stomataOpen = transpRate > 30;

  const reset = () => { setTemp(25); setWind(50); setHumidity(50); setLightIntensity(50); setStep(0); };

  return (
    <SimulationLayout title="Lab 8: Transpiration" objective="Investigate factors affecting transpiration rate" theory="Transpiration is water loss from leaves through stomata. Rate depends on temperature, wind, humidity, and light." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={0} max={50} unit="°C" />
        <ControlGroup label="Wind Speed" value={wind} onChange={setWind} min={0} max={100} unit="%" />
        <ControlGroup label="Humidity" value={humidity} onChange={setHumidity} min={0} max={100} unit="%" />
        <ControlGroup label="Light Intensity" value={lightIntensity} onChange={setLightIntensity} min={0} max={100} unit="%" />
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          {/* Plant */}
          <rect x={145} y={120} width={10} height={80} fill="#22c55e" rx={2} />
          <ellipse cx={120} cy={100} rx={35} ry={20} fill="#22c55e88" stroke="#16a34a" strokeWidth={1} transform="rotate(-30,120,100)" />
          <ellipse cx={180} cy={100} rx={35} ry={20} fill="#22c55e88" stroke="#16a34a" strokeWidth={1} transform="rotate(30,180,100)" />
          <ellipse cx={150} cy={80} rx={30} ry={18} fill="#22c55e88" stroke="#16a34a" strokeWidth={1} />
          {/* Stomata */}
          {stomataOpen && <>
            <ellipse cx={135} cy={105} rx={3} ry={1.5} fill="none" stroke="#16a34a" strokeWidth={1} />
            <ellipse cx={165} cy={105} rx={3} ry={1.5} fill="none" stroke="#16a34a" strokeWidth={1} />
          </>}
          {/* Water vapor arrows */}
          {transpRate > 20 && Array.from({ length: Math.min(8, Math.floor(transpRate / 12)) }, (_, i) => (
            <g key={i}>
              <circle cx={110 + i * 12} cy={70} r={2} fill="#93c5fd" opacity={0.5}>
                <animate attributeName="cy" values="70;30" dur={`${3 - transpRate / 50}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
                <animate attributeName="opacity" values="0.6;0" dur={`${3 - transpRate / 50}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
              </circle>
            </g>
          ))}
          {/* Pot */}
          <rect x={125} y={200} width={50} height={30} fill="#92400e" rx={3} />
          <text x={150} y={245} textAnchor="middle" className="text-[8px] fill-foreground font-bold">Water Loss: {transpRate.toFixed(0)}%</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Transpiration Rate" value={transpRate.toFixed(1)} unit="%" />
        <DataRow label="Stomata" value={stomataOpen ? "Open" : "Closed"} />
        <DataRow label="Temperature" value={temp} unit="°C" />
        <DataRow label="Wind Speed" value={wind} unit="%" />
        <DataRow label="Humidity" value={humidity} unit="%" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ── Lab 9: Human Tissues (Histology) ──
export function HumanTissues() {
  const [tissue, setTissue] = useState("epithelial");
  const [zoom, setZoom] = useState(10);
  const [step, setStep] = useState(0);

  const steps = [
    "Open the virtual microscope",
    "Select a tissue slide",
    "Adjust microscope focus",
    "Observe tissue structure",
    "Identify distinguishing features",
    "Record observations",
  ];

  const info: Record<string, { desc: string; cells: string }> = {
    epithelial: { desc: "Covers body surfaces and lines organs", cells: "Tightly packed, flat/cuboidal" },
    muscle: { desc: "Long, striated fibers that contract for movement", cells: "Multinucleated, elongated" },
    nerve: { desc: "Specialized for transmitting electrical impulses", cells: "Cell body + long axon" },
    connective: { desc: "Supports, connects, and separates tissues", cells: "Scattered in matrix" },
  };

  const reset = () => { setTissue("epithelial"); setZoom(10); setStep(0); };

  return (
    <SimulationLayout title="Lab 9: Human Tissues (Histology)" objective="Identify different human tissue types under microscopy" theory="4 types: epithelial, connective, muscle, nervous. Each has distinct cell shapes." onReset={reset}
      equipment={<div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Select Tissue:</p>
        {Object.keys(info).map(t => <label key={t} className="flex items-center gap-2 text-xs capitalize"><input type="radio" checked={tissue === t} onChange={() => setTissue(t)} />{t}</label>)}
        <ControlGroup label="Magnification" value={zoom} onChange={setZoom} min={4} max={40} step={4} unit="×" />
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          <circle cx={150} cy={125} r={110} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={2} />
          {tissue === "muscle" && Array.from({ length: 8 }, (_, i) => <rect key={i} x={60} y={60 + i * 18} width={180} height={12} fill="#ef444433" stroke="#ef4444" strokeWidth={0.5} rx={6} />)}
          {tissue === "nerve" && <><circle cx={100} cy={125} r={20} fill="#a855f733" stroke="#a855f7" strokeWidth={1} /><line x1={120} y1={125} x2={250} y2={125} stroke="#a855f7" strokeWidth={2} /><text x={100} y={128} textAnchor="middle" className="text-[6px] fill-foreground">Cell Body</text><text x={200} y={120} textAnchor="middle" className="text-[6px] fill-foreground">Axon</text></>}
          {tissue === "epithelial" && Array.from({ length: 20 }, (_, i) => <rect key={i} x={70 + (i % 5) * 35} y={70 + Math.floor(i / 5) * 30} width={30} height={25} fill="#3b82f622" stroke="#3b82f6" strokeWidth={0.5} rx={2} />)}
          {tissue === "connective" && <><rect x={50} y={50} width={200} height={150} fill="#eab30811" />{Array.from({ length: 8 }, (_, i) => <circle key={i} cx={80 + ((i * 37) % 140)} cy={80 + ((i * 23) % 100)} r={6} fill="#eab30844" stroke="#eab308" strokeWidth={0.5} />)}</>}
          <text x={150} y={245} textAnchor="middle" className="text-[10px] fill-foreground font-bold capitalize">{tissue} Tissue</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Type" value={tissue} />
        <DataRow label="Description" value={info[tissue].desc} />
        <DataRow label="Cell Shape" value={info[tissue].cells} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ── Lab 10: Blood Cells ──
export function BloodCells() {
  const [cellType, setCellType] = useState("all");
  const [zoom, setZoom] = useState(40);
  const [step, setStep] = useState(0);

  const steps = [
    "Place blood smear slide on stage",
    "Adjust microscope focus",
    "Observe different blood cells",
    "Identify red blood cells",
    "Identify white blood cells",
    "Identify platelets",
    "Count each cell type",
    "Record the results",
  ];

  const reset = () => { setCellType("all"); setZoom(40); setStep(0); };

  return (
    <SimulationLayout title="Lab 10: Blood Cells" objective="Observe and identify different blood cell types" theory="Blood contains RBCs (O₂ transport), WBCs (immunity), and platelets (clotting)." onReset={reset}
      equipment={<div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Highlight:</p>
        {["all", "rbc", "wbc", "platelets"].map(t => (
          <label key={t} className="flex items-center gap-2 text-xs"><input type="radio" checked={cellType === t} onChange={() => setCellType(t)} />{t === "rbc" ? "Red Blood Cells" : t === "wbc" ? "White Blood Cells" : t === "platelets" ? "Platelets" : "All Cells"}</label>
        ))}
        <ControlGroup label="Magnification" value={zoom} onChange={setZoom} min={10} max={100} step={10} unit="×" />
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          <circle cx={150} cy={125} r={110} fill="#fef2f233" stroke="hsl(var(--border))" strokeWidth={2} />
          {/* RBCs */}
          {(cellType === "all" || cellType === "rbc") && Array.from({ length: 15 }, (_, i) => {
            const cx = 80 + ((i * 29) % 140);
            const cy = 60 + ((i * 23) % 130);
            return <ellipse key={`rbc-${i}`} cx={cx} cy={cy} rx={10} ry={10} fill="#ef444466" stroke="#ef4444" strokeWidth={0.5} />;
          })}
          {/* WBCs */}
          {(cellType === "all" || cellType === "wbc") && [{ x: 120, y: 100 }, { x: 200, y: 140 }, { x: 100, y: 170 }].map((p, i) => (
            <g key={`wbc-${i}`}>
              <circle cx={p.x} cy={p.y} r={14} fill="#a855f733" stroke="#a855f7" strokeWidth={1} />
              <circle cx={p.x} cy={p.y} r={6} fill="#6d28d9" opacity={0.4} />
            </g>
          ))}
          {/* Platelets */}
          {(cellType === "all" || cellType === "platelets") && Array.from({ length: 8 }, (_, i) => {
            const cx = 90 + ((i * 31) % 120);
            const cy = 70 + ((i * 19) % 110);
            return <circle key={`plt-${i}`} cx={cx} cy={cy} r={3} fill="#eab308" stroke="#ca8a04" strokeWidth={0.5} />;
          })}
          <text x={150} y={245} textAnchor="middle" className="text-[8px] fill-foreground font-bold">Blood Smear — {zoom}× magnification</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Viewing" value={cellType === "all" ? "All cells" : cellType.toUpperCase()} />
        <DataRow label="RBC Count" value="~15" />
        <DataRow label="WBC Count" value="~3" />
        <DataRow label="Platelet Count" value="~8" />
        <DataRow label="Magnification" value={`${zoom}×`} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ── Lab 11: Monohybrid Cross ──
export function MonohybridCross() {
  const [p1a1, setP1a1] = useState("A");
  const [p1a2, setP1a2] = useState("a");
  const [p2a1, setP2a1] = useState("A");
  const [p2a2, setP2a2] = useState("a");
  const [step, setStep] = useState(0);

  const steps = [
    "Select parent traits",
    "Enter parent genotypes",
    "Generate the Punnett square",
    "Observe offspring genotypes",
    "Calculate phenotypic ratio",
    "Record the results",
    "Repeat with different genotypes",
  ];

  const offspring = [`${p1a1}${p2a1}`, `${p1a1}${p2a2}`, `${p1a2}${p2a1}`, `${p1a2}${p2a2}`];
  const dominant = offspring.filter(o => o.includes("A")).length;
  const reset = () => { setP1a1("A"); setP1a2("a"); setP2a1("A"); setP2a2("a"); setStep(0); };

  return (
    <SimulationLayout title="Lab 11: Monohybrid Cross (Punnett Square)" objective="Predict offspring genotypic and phenotypic ratios" theory="Heterozygous cross Aa × Aa → 1AA : 2Aa : 1aa (3:1 phenotypic ratio)." onReset={reset}
      equipment={<div className="space-y-3">
        <p className="text-xs font-semibold">Parent 1:</p>
        {[["Allele 1", setP1a1, p1a1], ["Allele 2", setP1a2, p1a2]].map(([label, , val], i) => (
          <div key={i} className="flex gap-2">{["A", "a"].map(a => <label key={a} className="flex items-center gap-1 text-xs"><input type="radio" checked={val === a} onChange={() => (i === 0 ? setP1a1 : setP1a2)(a)} />{a}</label>)}</div>
        ))}
        <p className="text-xs font-semibold">Parent 2:</p>
        {[["Allele 1", setP2a1, p2a1], ["Allele 2", setP2a2, p2a2]].map(([label, , val], i) => (
          <div key={i} className="flex gap-2">{["A", "a"].map(a => <label key={a} className="flex items-center gap-1 text-xs"><input type="radio" checked={val === a} onChange={() => (i === 0 ? setP2a1 : setP2a2)(a)} />{a}</label>)}</div>
        ))}
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
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
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Genotypes" value={offspring.join(", ")} />
        <DataRow label="Dominant" value={`${dominant}/4`} />
        <DataRow label="Recessive" value={`${4 - dominant}/4`} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ── Lab 12: Quadrat Sampling ──
export function QuadratSampling() {
  const [quadratX, setQuadratX] = useState(2);
  const [quadratY, setQuadratY] = useState(2);
  const [samples, setSamples] = useState<number[]>([]);
  const [step, setStep] = useState(0);

  const steps = [
    "Open the virtual field environment",
    "Select the quadrat tool",
    "Place the quadrat randomly",
    "Count organisms inside quadrat",
    "Record the number",
    "Move quadrat to another location",
    "Repeat sampling several times",
    "Calculate average population density",
  ];

  // Deterministic plant positions using seed-like generation
  const plants: { x: number; y: number }[] = [];
  for (let i = 0; i < 60; i++) {
    plants.push({ x: ((i * 73 + 17) % 280) + 10, y: ((i * 47 + 31) % 180) + 10 });
  }

  const qx = quadratX * 50 + 10, qy = quadratY * 35 + 10, qw = 60, qh = 50;
  const plantsInQuadrat = plants.filter(p => p.x >= qx && p.x <= qx + qw && p.y >= qy && p.y <= qy + qh).length;

  const takeSample = () => {
    setSamples(prev => [...prev, plantsInQuadrat]);
    setQuadratX(Math.floor(Math.random() * 4));
    setQuadratY(Math.floor(Math.random() * 4));
  };

  const avgDensity = samples.length > 0 ? (samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(1) : "—";

  const reset = () => { setQuadratX(2); setQuadratY(2); setSamples([]); setStep(0); };

  return (
    <SimulationLayout title="Lab 12: Quadrat Sampling" objective="Estimate population density using quadrat sampling" theory="Population density = total count / (number of quadrats × quadrat area)." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Quadrat X" value={quadratX} onChange={setQuadratX} min={0} max={4} />
        <ControlGroup label="Quadrat Y" value={quadratY} onChange={setQuadratY} min={0} max={4} />
        <Button size="sm" className="w-full" onClick={takeSample}>📋 Record & Move</Button>
        <div className="text-xs text-muted-foreground">Samples: {samples.length}</div>
      </div>}
      workspace={
        <svg viewBox="0 0 300 200" className="w-full h-48">
          <rect x={0} y={0} width={300} height={200} fill="#22c55e11" stroke="hsl(var(--border))" strokeWidth={1} />
          {plants.map((p, i) => (
            <text key={i} x={p.x} y={p.y} className="text-[8px]">🌿</text>
          ))}
          <rect x={qx} y={qy} width={qw} height={qh} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="4,2" />
          <text x={qx + qw / 2} y={qy + qh / 2} textAnchor="middle" className="text-[8px] fill-primary font-bold">{plantsInQuadrat} plants</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Current Count" value={plantsInQuadrat} />
        <DataRow label="Samples Taken" value={samples.length} />
        <DataRow label="Avg Density" value={avgDensity} unit="/quadrat" />
        {samples.length > 0 && <DataRow label="All Counts" value={samples.join(", ")} />}
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}
