import { useState } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

// 1. Single Displacement
export function SingleDisplacement() {
  const [time, setTime] = useState(0);
  const progress = Math.min(time / 60, 1);
  const solutionColor = `rgb(${59 + progress * 100}, ${130 - progress * 60}, ${246 - progress * 180})`;
  const copperDeposit = progress * 100;
  const reset = () => setTime(0);

  return (
    <SimulationLayout title="Lab: Single Displacement (Fe + CuSO₄)" objective="Observe iron displacing copper from solution" theory="Fe + CuSO₄ → FeSO₄ + Cu. Iron is more reactive than copper." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Reaction Time" value={time} onChange={setTime} min={0} max={120} step={5} unit="s" />
        <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
          <p className="font-semibold">Reactivity Series:</p>
          <p>Fe {">"} Cu (Iron displaces Copper)</p>
        </div>
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          <rect x={80} y={50} width={140} height={150} fill="none" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <rect x={85} y={80} width={130} height={115} fill={solutionColor} opacity={0.6} rx={2} />
          <rect x={140} y={40} width={20} height={130} fill="#6b7280" rx={2} />
          {progress > 0.1 && Array.from({ length: Math.floor(copperDeposit / 10) }, (_, i) => (
            <circle key={i} cx={145 + (i % 3) * 5} cy={160 - i * 3} r={2} fill="#b45309" />
          ))}
          <text x={150} y={220} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{progress < 0.5 ? "Blue → " : ""}Green Solution</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Time" value={time} unit="s" />
        <DataRow label="Progress" value={`${(progress * 100).toFixed(0)}%`} />
        <DataRow label="Cu Deposited" value={copperDeposit.toFixed(0)} unit="%" />
        <DataRow label="Solution" value={progress < 0.3 ? "Blue" : progress < 0.7 ? "Blue-Green" : "Green"} />
      </div>}
      analysis={<p className="text-xs font-mono">Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)</p>}
    />
  );
}

// 2. Standard Solution
export function StandardSolution() {
  const [targetMass, setTargetMass] = useState(10);
  const [measuredMass, setMeasuredMass] = useState(0);
  const [waterLevel, setWaterLevel] = useState(0);
  const volumeTarget = 250;
  const concentration = volumeTarget > 0 && measuredMass > 0 ? (measuredMass / 58.44) / (waterLevel / 1000) : 0;
  const massError = Math.abs(measuredMass - targetMass);
  const volError = Math.abs(waterLevel - volumeTarget);
  const reset = () => { setMeasuredMass(0); setWaterLevel(0); };

  return (
    <SimulationLayout title="Lab: Preparation of Standard Solution" objective="Prepare a solution of known concentration" theory="Concentration (mol/L) = moles of solute / volume of solution in litres." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Target Mass (NaCl)" value={targetMass} onChange={setTargetMass} min={5} max={30} step={0.1} unit="g" />
        <ControlGroup label="Measured Mass" value={measuredMass} onChange={setMeasuredMass} min={0} max={40} step={0.1} unit="g" />
        <ControlGroup label="Water Volume" value={waterLevel} onChange={setWaterLevel} min={0} max={300} step={5} unit="mL" />
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          <path d="M110,30 L90,200 L210,200 L190,30 Z" fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          {waterLevel > 0 && <path d={`M${92 + (1 - waterLevel / 300) * 10},${200 - waterLevel / 300 * 160} L90,200 L210,200 L${208 - (1 - waterLevel / 300) * 10},${200 - waterLevel / 300 * 160} Z`} fill="hsl(var(--primary) / 0.3)" />}
          <line x1={85} y1={200 - 250 / 300 * 160} x2={215} y2={200 - 250 / 300 * 160} stroke="hsl(var(--accent))" strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={220} y={200 - 250 / 300 * 160 + 3} className="text-[7px] fill-accent">250 mL mark</text>
          <text x={150} y={230} textAnchor="middle" className="text-[9px] fill-muted-foreground">Volumetric Flask</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Target Mass" value={targetMass.toFixed(1)} unit="g" />
        <DataRow label="Measured Mass" value={measuredMass.toFixed(1)} unit="g" />
        <DataRow label="Mass Error" value={massError.toFixed(1)} unit="g" />
        <DataRow label="Water Volume" value={waterLevel} unit="mL" />
        <DataRow label="Concentration" value={isFinite(concentration) ? concentration.toFixed(4) : "—"} unit="mol/L" />
      </div>}
    />
  );
}

// 3. Acid-Base Titration
export function AcidBaseTitration() {
  const [volumeAdded, setVolumeAdded] = useState(0);
  const equivalenceVol = 25;
  const pH = volumeAdded < equivalenceVol ? 2 + (volumeAdded / equivalenceVol) * 5 : volumeAdded === equivalenceVol ? 7 : 7 + Math.min((volumeAdded - equivalenceVol) / 10, 6);
  const indicatorColor = pH < 4.4 ? "#ef4444" : pH < 8.2 ? "#f97316" : "#ec4899";
  const reset = () => setVolumeAdded(0);

  return (
    <SimulationLayout title="Lab: Acid-Base Titration" objective="Find the endpoint using an indicator" theory="At the equivalence point, moles of acid = moles of base. Phenolphthalein turns pink above pH 8.2." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="NaOH Added" value={volumeAdded} onChange={setVolumeAdded} min={0} max={50} step={0.5} unit="mL" />
        <div className="text-xs text-muted-foreground">
          <p>Burette: NaOH (0.1 M)</p>
          <p>Flask: HCl + Phenolphthalein</p>
        </div>
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <rect x={190} y={10} width={20} height={120} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={2} />
          <rect x={192} y={10 + (volumeAdded / 50) * 110} width={16} height={110 - (volumeAdded / 50) * 110} fill="hsl(var(--primary) / 0.4)" />
          <text x={175} y={75} textAnchor="end" className="text-[8px] fill-muted-foreground">Burette</text>
          <path d="M160,160 L140,230 L260,230 L240,160 Z" fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <path d="M142,225 L258,225 L245,180 L155,180 Z" fill={indicatorColor} opacity={0.5} />
          <text x={200} y={210} textAnchor="middle" className="text-[10px] fill-foreground font-bold">pH: {pH.toFixed(1)}</text>
          <line x1={300} y1={20} x2={300} y2={230} stroke="hsl(var(--border))" strokeWidth={1} />
          {[0, 2, 4, 7, 10, 14].map(p => (
            <g key={p}><circle cx={300} cy={230 - (p / 14) * 210} r={2} fill={p < 7 ? "#ef4444" : p === 7 ? "#22c55e" : "#3b82f6"} />
            <text x={310} y={233 - (p / 14) * 210} className="text-[7px] fill-muted-foreground">{p}</text></g>
          ))}
          <circle cx={300} cy={230 - (pH / 14) * 210} r={4} fill="hsl(var(--accent))" />
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Volume Added" value={volumeAdded.toFixed(1)} unit="mL" />
        <DataRow label="pH" value={pH.toFixed(1)} />
        <DataRow label="Endpoint" value={Math.abs(volumeAdded - equivalenceVol) < 1 ? "At endpoint! 🎯" : volumeAdded < equivalenceVol ? "Before" : "Past"} />
        <DataRow label="Indicator" value={pH < 8.2 ? "Colorless" : "Pink"} />
      </div>}
    />
  );
}

// 4. pH & Indicators
export function PHIndicators() {
  const [solution, setSolution] = useState("water");
  const pHValues: Record<string, number> = { "hcl": 1, "vinegar": 3, "water": 7, "baking_soda": 9, "naoh": 13 };
  const solutionNames: Record<string, string> = { "hcl": "HCl (Strong Acid)", "vinegar": "Vinegar (Weak Acid)", "water": "Water (Neutral)", "baking_soda": "Baking Soda (Weak Base)", "naoh": "NaOH (Strong Base)" };
  const pH = pHValues[solution];
  const litmusColor = pH < 7 ? "#ef4444" : pH === 7 ? "#a855f7" : "#3b82f6";
  const universalColor = pH <= 2 ? "#ef4444" : pH <= 4 ? "#f97316" : pH <= 6 ? "#eab308" : pH <= 8 ? "#22c55e" : pH <= 10 ? "#06b6d4" : pH <= 12 ? "#3b82f6" : "#6d28d9";
  const reset = () => setSolution("water");

  return (
    <SimulationLayout title="Lab: pH & Indicators" objective="Test pH of solutions with indicators and pH meter" theory="pH scale: 0-14. Acids < 7, Neutral = 7, Bases > 7." onReset={reset}
      equipment={<div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Select Solution:</p>
        {Object.entries(solutionNames).map(([key, name]) => (
          <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="radio" name="solution" checked={solution === key} onChange={() => setSolution(key)} />
            {name}
          </label>
        ))}
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          <rect x={50} y={60} width={60} height={100} fill={litmusColor} opacity={0.6} stroke="hsl(var(--border))" strokeWidth={1} rx={4} />
          <text x={80} y={180} textAnchor="middle" className="text-[9px] fill-foreground">Litmus</text>
          <rect x={170} y={60} width={60} height={100} fill={universalColor} opacity={0.6} stroke="hsl(var(--border))" strokeWidth={1} rx={4} />
          <text x={200} y={180} textAnchor="middle" className="text-[9px] fill-foreground">Universal</text>
          <rect x={290} y={60} width={60} height={100} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <text x={320} y={120} textAnchor="middle" className="text-[16px] fill-foreground font-bold">{pH}</text>
          <text x={320} y={180} textAnchor="middle" className="text-[9px] fill-foreground">pH Meter</text>
          <text x={200} y={30} textAnchor="middle" className="text-[11px] fill-foreground font-bold">{solutionNames[solution]}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Solution" value={solutionNames[solution]} />
        <DataRow label="pH" value={pH} />
        <DataRow label="Type" value={pH < 7 ? "Acidic" : pH === 7 ? "Neutral" : "Basic"} />
        <DataRow label="Litmus" value={pH < 7 ? "Red" : "Blue"} />
      </div>}
    />
  );
}
