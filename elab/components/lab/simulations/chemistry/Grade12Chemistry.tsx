import { useState } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";

// 1. Indicators & Acid-Base Properties Lab
export function IndicatorsLab() {
  const [selectedBeaker, setSelectedBeaker] = useState<number | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, Record<string, string>>>({});
  const [step, setStep] = useState(0);

  const solutions = [
    { name: "HCl", type: "Strong Acid", pH: 1 },
    { name: "CH₃COOH", type: "Weak Acid", pH: 4.7 },
    { name: "NaCl", type: "Neutral Salt", pH: 7 },
    { name: "NH₃", type: "Weak Base", pH: 11.6 },
  ];
  const indicators = ["Red Litmus", "Blue Litmus", "Phenolphthalein", "Methyl Orange"];
  const indicatorColors: Record<string, Record<string, string>> = {
    "Red Litmus": { "Strong Acid": "#e53e3e", "Weak Acid": "#e53e3e", "Neutral Salt": "#e53e3e", "Weak Base": "#3b82f6" },
    "Blue Litmus": { "Strong Acid": "#e53e3e", "Weak Acid": "#e53e3e", "Neutral Salt": "#3b82f6", "Weak Base": "#3b82f6" },
    "Phenolphthalein": { "Strong Acid": "transparent", "Weak Acid": "transparent", "Neutral Salt": "transparent", "Weak Base": "#ec4899" },
    "Methyl Orange": { "Strong Acid": "#ef4444", "Weak Acid": "#f97316", "Neutral Salt": "#eab308", "Weak Base": "#eab308" },
  };

  const applyIndicator = () => {
    if (selectedBeaker === null || !selectedIndicator) return;
    const sol = solutions[selectedBeaker];
    const color = indicatorColors[selectedIndicator]?.[sol.type] || "transparent";
    setResults(prev => ({
      ...prev,
      [sol.name]: { ...prev[sol.name], [selectedIndicator]: color }
    }));
    setStep(s => Math.min(s + 1, 5));
  };

  const reset = () => { setSelectedBeaker(null); setSelectedIndicator(null); setResults({}); setStep(0); };

  const steps = [
    "Take small samples of HCl, CH₃COOH, NaCl, and NH₃ solutions in separate beakers.",
    "Select an indicator from the indicator rack on the left.",
    "Click on a beaker to apply the indicator to that solution.",
    "Observe the color change in the beaker.",
    "Repeat with different indicators for each solution.",
    "Record all observations in the data table and determine acid/base/neutral nature.",
  ];

  return (
    <SimulationLayout title="Lab: Indicators & Acid-Base Properties" objective="Identify acids, bases, and neutral solutions using indicators" theory="Indicators change color at specific pH ranges. Litmus, phenolphthalein, and methyl orange each respond differently to acidic, neutral, and basic solutions." onReset={reset}
      equipment={<div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground">Indicator Rack</h4>
        {indicators.map(ind => (
          <button key={ind} onClick={() => setSelectedIndicator(ind)} className={`block w-full text-left text-xs px-2 py-1.5 rounded border ${selectedIndicator === ind ? "border-primary bg-primary/10 font-bold" : "border-border"}`}>{ind}</button>
        ))}
        <StepByStep steps={steps} currentStep={step} />
      </div>}
      workspace={
        <svg viewBox="0 0 440 240" className="w-full h-52">
          <rect x={0} y={180} width={440} height={60} fill="hsl(var(--muted))" rx={4} />
          <text x={220} y={230} textAnchor="middle" className="text-[8px] fill-muted-foreground">Lab Bench</text>
          {solutions.map((sol, i) => {
            const bx = 50 + i * 100;
            const resultColors = results[sol.name] || {};
            const lastColor = Object.values(resultColors).pop() || "hsl(var(--muted) / 0.4)";
            return (
              <g key={i} onClick={() => { setSelectedBeaker(i); applyIndicator(); }} className="cursor-pointer">
                <rect x={bx} y={80} width={60} height={90} fill={lastColor} stroke="hsl(var(--border))" strokeWidth={2} rx={4} opacity={0.7} />
                <rect x={bx} y={80} width={60} height={90} fill="transparent" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
                <text x={bx + 30} y={130} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{sol.name}</text>
                <text x={bx + 30} y={75} textAnchor="middle" className="text-[7px] fill-muted-foreground">pH {sol.pH}</text>
                {selectedBeaker === i && <rect x={bx - 2} y={78} width={64} height={94} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} rx={5} strokeDasharray="4" />}
              </g>
            );
          })}
          {selectedIndicator && <text x={220} y={20} textAnchor="middle" className="text-[10px] fill-primary font-bold">Selected: {selectedIndicator} — Click a beaker</text>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Selected Indicator" value={selectedIndicator || "None"} />
        {solutions.map(sol => (
          <DataRow key={sol.name} label={sol.name} value={sol.type} />
        ))}
      </div>}
      analysis={<p className="text-xs text-muted-foreground">Acids turn blue litmus red. Bases turn red litmus blue. Phenolphthalein turns pink only in bases.</p>}
    />
  );
}

// 2. pH Meter Simulation
export function PHMeterSim() {
  const [acidAdded, setAcidAdded] = useState(0);
  const [baseAdded, setBaseAdded] = useState(0);
  const [dilution, setDilution] = useState(0);
  const basePH = 7;
  const pH = Math.max(0, Math.min(14, basePH - acidAdded * 0.7 + baseAdded * 0.7 + dilution * 0.1));
  const reset = () => { setAcidAdded(0); setBaseAdded(0); setDilution(0); };
  const step = Math.min(acidAdded + baseAdded + dilution > 0 ? 3 : 0, 8);

  const steps = [
    "Place a beaker with distilled water on the lab bench.",
    "Insert the pH meter probe into the solution.",
    "Observe the initial pH reading on the digital display.",
    "Click 'Add Acid' to add drops of HCl.",
    "Observe the pH value decrease on the meter.",
    "Click 'Add Base' to add drops of NaOH.",
    "Observe the pH value increase.",
    "Use the dilution slider to dilute the solution.",
    "Record all pH changes in the observation table.",
  ];

  const phColor = pH < 3 ? "#ef4444" : pH < 6 ? "#f97316" : pH < 8 ? "#22c55e" : pH < 11 ? "#3b82f6" : "#8b5cf6";

  return (
    <SimulationLayout title="Lab: pH Meter Simulation" objective="Measure pH of solutions and observe changes when acids/bases are added" theory="pH = -log[H⁺]. pH < 7 is acidic, pH = 7 is neutral, pH > 7 is basic. Adding acid lowers pH; adding base raises it." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="HCl Added" value={acidAdded} onChange={setAcidAdded} min={0} max={10} step={0.5} unit="mL" />
        <ControlGroup label="NaOH Added" value={baseAdded} onChange={setBaseAdded} min={0} max={10} step={0.5} unit="mL" />
        <ControlGroup label="Dilution" value={dilution} onChange={setDilution} min={0} max={10} step={1} unit="mL" />
        <StepByStep steps={steps} currentStep={step} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 260" className="w-full h-56">
          <rect x={0} y={220} width={400} height={40} fill="hsl(var(--muted))" rx={4} />
          {/* Beaker */}
          <rect x={120} y={100} width={100} height={110} fill={phColor} opacity={0.25} stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <rect x={120} y={100} width={100} height={110} fill="none" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <text x={170} y={160} textAnchor="middle" className="text-[9px] fill-foreground">Solution</text>
          {/* pH meter probe */}
          <rect x={160} y={40} width={8} height={80} fill="hsl(var(--foreground))" rx={2} />
          <circle cx={164} cy={120} r={6} fill={phColor} stroke="hsl(var(--border))" />
          <text x={164} y={35} textAnchor="middle" className="text-[8px] fill-muted-foreground">Probe</text>
          {/* Digital display */}
          <rect x={260} y={60} width={110} height={70} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} rx={6} />
          <text x={315} y={85} textAnchor="middle" className="text-[8px] fill-muted-foreground">pH Meter</text>
          <text x={315} y={115} textAnchor="middle" className="text-[22px] fill-foreground font-bold font-mono">{pH.toFixed(1)}</text>
          {/* pH scale bar */}
          <defs>
            <linearGradient id="phGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="75%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <rect x={40} y={200} width={320} height={10} fill="url(#phGrad)" rx={5} />
          <circle cx={40 + (pH / 14) * 320} cy={205} r={7} fill="hsl(var(--foreground))" stroke="white" strokeWidth={2} />
          {[0, 7, 14].map(v => <text key={v} x={40 + (v / 14) * 320} y={198} textAnchor="middle" className="text-[7px] fill-muted-foreground">{v}</text>)}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="pH" value={pH.toFixed(2)} />
        <DataRow label="Nature" value={pH < 6.5 ? "Acidic" : pH > 7.5 ? "Basic" : "Neutral"} />
        <DataRow label="[H⁺]" value={(10 ** -pH).toExponential(2)} unit="M" />
        <DataRow label="HCl Added" value={acidAdded} unit="mL" />
        <DataRow label="NaOH Added" value={baseAdded} unit="mL" />
      </div>}
    />
  );
}

// 3. Weak Acid Ionization (Ka Lab)
export function WeakAcidIonization() {
  const [concInit, setConcInit] = useState(0.1);
  const [temp, setTemp] = useState(25);
  const Ka = 1.8e-5 * (1 + (temp - 25) * 0.02);
  const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * concInit)) / 2;
  const pH = -Math.log10(x);
  const percentIon = (x / concInit) * 100;
  const reset = () => { setConcInit(0.1); setTemp(25); };

  const steps = [
    "Open the Weak Acid Ionization simulation.",
    "Set the initial concentration of the weak acid (CH₃COOH).",
    "Adjust the temperature slider.",
    "Observe the ICE table auto-populated with equilibrium values.",
    "Read the Ka value, [H⁺] concentration, and pH.",
    "Observe the % ionization change as you adjust concentration.",
    "Lower concentration increases % ionization — verify this.",
    "Record all values in the observation table.",
  ];

  return (
    <SimulationLayout title="Lab: Weak Acid Ionization (Ka)" objective="Calculate Ka and % ionization using the ICE table method" theory="HA ⇌ H⁺ + A⁻. Ka = [H⁺][A⁻]/[HA]. Use ICE table for equilibrium concentrations. Dilute solutions have higher % ionization." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Initial [HA]" value={concInit} onChange={setConcInit} min={0.01} max={1} step={0.01} unit="M" />
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={10} max={60} unit="°C" />
        <StepByStep steps={steps} currentStep={concInit !== 0.1 || temp !== 25 ? 4 : 0} />
      </div>}
      workspace={
        <svg viewBox="0 0 420 220" className="w-full h-48">
          <text x={210} y={18} textAnchor="middle" className="text-[11px] fill-foreground font-bold">ICE Table: CH₃COOH ⇌ H⁺ + CH₃COO⁻</text>
          {[["", "HA", "H⁺", "A⁻"], ["I", concInit.toFixed(4), "0", "0"], ["C", `-${x.toFixed(4)}`, `+${x.toFixed(4)}`, `+${x.toFixed(4)}`], ["E", (concInit - x).toFixed(4), x.toFixed(4), x.toFixed(4)]].map((row, ri) => (
            <g key={ri}>
              {row.map((cell, ci) => (
                <g key={ci}>
                  <rect x={40 + ci * 90} y={30 + ri * 35} width={90} height={30} fill={ri === 0 ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted) / 0.3)"} stroke="hsl(var(--border))" strokeWidth={0.5} />
                  <text x={85 + ci * 90} y={50 + ri * 35} textAnchor="middle" className={`text-[9px] ${ri === 0 ? "fill-primary font-bold" : "fill-foreground"}`}>{cell}</text>
                </g>
              ))}
            </g>
          ))}
          {/* Molecular animation area */}
          <text x={210} y={190} textAnchor="middle" className="text-[8px] fill-muted-foreground">HA molecules: {((1 - percentIon / 100) * 100).toFixed(0)}% | Ions: {percentIon.toFixed(1)}%</text>
          <rect x={60} y={195} width={300} height={12} fill="hsl(var(--muted))" rx={6} />
          <rect x={60} y={195} width={300 * (percentIon / 100)} height={12} fill="hsl(var(--primary))" rx={6} />
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Ka" value={Ka.toExponential(2)} />
        <DataRow label="[H⁺]" value={x.toExponential(3)} unit="M" />
        <DataRow label="pH" value={pH.toFixed(2)} />
        <DataRow label="% Ionization" value={percentIon.toFixed(2)} unit="%" />
        <DataRow label="Temperature" value={temp} unit="°C" />
      </div>}
    />
  );
}

// 4. Buffer Solution Lab
export function BufferSolutions() {
  const [acidAdded, setAcidAdded] = useState(0);
  const [baseAdded, setBaseAdded] = useState(0);
  const basePH = 4.74;
  const pH = Math.max(2, Math.min(12, basePH - acidAdded * 0.15 + baseAdded * 0.15));
  const unbufferedPH = Math.max(0, Math.min(14, 7 - acidAdded * 1.5 + baseAdded * 1.5));
  const reset = () => { setAcidAdded(0); setBaseAdded(0); };

  const steps = [
    "Prepare a buffer solution: CH₃COOH + CH₃COONa in a beaker.",
    "Record the initial pH of the buffer solution.",
    "Click 'Add HCl' to add acid to the buffer.",
    "Observe the small pH change in the buffer solution.",
    "Compare with the large pH change in unbuffered water.",
    "Reset and click 'Add NaOH' to add base.",
    "Observe the buffer resisting the pH change.",
    "Record pH values at each step and plot the graph.",
  ];

  // Generate graph points
  const bufferPoints: string[] = [];
  const waterPoints: string[] = [];
  for (let v = 0; v <= 10; v += 0.5) {
    const bpH = Math.max(2, Math.min(12, basePH + v * 0.15));
    const wpH = Math.max(0, Math.min(14, 7 + v * 1.5));
    bufferPoints.push(`${80 + v * 25},${200 - (bpH / 14) * 160}`);
    waterPoints.push(`${80 + v * 25},${200 - (wpH / 14) * 160}`);
  }

  return (
    <SimulationLayout title="Lab: Buffer Solutions" objective="Observe how buffer solutions resist pH changes compared to water" theory="Buffer = weak acid + conjugate base. The buffer neutralizes added H⁺ or OH⁻, maintaining nearly constant pH within the buffer region." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="HCl Added" value={acidAdded} onChange={setAcidAdded} min={0} max={10} step={0.5} unit="mL" />
        <ControlGroup label="NaOH Added" value={baseAdded} onChange={setBaseAdded} min={0} max={10} step={0.5} unit="mL" />
        <StepByStep steps={steps} currentStep={acidAdded > 0 || baseAdded > 0 ? 4 : 0} />
      </div>}
      workspace={
        <svg viewBox="0 0 420 240" className="w-full h-52">
          <text x={210} y={15} textAnchor="middle" className="text-[10px] fill-foreground font-bold">pH vs Volume Added</text>
          {/* Axes */}
          <line x1={70} y1={200} x2={350} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          <line x1={70} y1={30} x2={70} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={210} y={220} textAnchor="middle" className="text-[7px] fill-muted-foreground">Volume NaOH (mL)</text>
          <text x={25} y={115} textAnchor="middle" className="text-[7px] fill-muted-foreground" transform="rotate(-90, 25, 115)">pH</text>
          {[0, 7, 14].map(p => (
            <g key={p}>
              <line x1={67} y1={200 - (p / 14) * 160} x2={73} y2={200 - (p / 14) * 160} stroke="hsl(var(--foreground))" />
              <text x={62} y={203 - (p / 14) * 160} textAnchor="end" className="text-[7px] fill-muted-foreground">{p}</text>
            </g>
          ))}
          {/* Buffer region highlight */}
          <rect x={70} y={200 - (6 / 14) * 160} width={280} height={(2 / 14) * 160} fill="hsl(var(--primary) / 0.08)" />
          <text x={355} y={200 - (5 / 14) * 160} className="text-[6px] fill-primary">Buffer Region</text>
          {/* Buffer curve */}
          <polyline points={bufferPoints.join(" ")} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          {/* Water curve */}
          <polyline points={waterPoints.join(" ")} fill="none" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="4" />
          {/* Current markers */}
          <circle cx={80 + baseAdded * 25} cy={200 - (pH / 14) * 160} r={6} fill="hsl(var(--primary))" />
          <circle cx={80 + baseAdded * 25} cy={200 - (unbufferedPH / 14) * 160} r={6} fill="hsl(var(--accent))" />
          {/* Legend */}
          <line x1={100} y1={228} x2={120} y2={228} stroke="hsl(var(--primary))" strokeWidth={2} />
          <text x={125} y={231} className="text-[7px] fill-foreground">Buffer</text>
          <line x1={180} y1={228} x2={200} y2={228} stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="4" />
          <text x={205} y={231} className="text-[7px] fill-foreground">Water</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Buffer pH" value={pH.toFixed(2)} />
        <DataRow label="Water pH" value={unbufferedPH.toFixed(2)} />
        <DataRow label="ΔpH (Buffer)" value={Math.abs(pH - basePH).toFixed(2)} />
        <DataRow label="ΔpH (Water)" value={Math.abs(unbufferedPH - 7).toFixed(2)} />
      </div>}
      analysis={<p className="text-xs text-muted-foreground">Buffer resists pH change much better than unbuffered water. The buffer region is where the solution effectively neutralizes added acid or base.</p>}
    />
  );
}

// 5. Acid-Base Titration Lab
export function AcidBaseTitration() {
  const [buretteVol, setBuretteVol] = useState(0);
  const [dropwise, setDropwise] = useState(false);
  const acidConc = 0.1; const acidVol = 10;
  const baseConc = 0.1;
  const eqVol = (acidConc * acidVol) / baseConc;
  const pH = buretteVol < eqVol ? 1 + (buretteVol / eqVol) * 6 : buretteVol === eqVol ? 7 : Math.min(13, 7 + (buretteVol - eqVol) * 0.8);
  const atEndpoint = Math.abs(buretteVol - eqVol) < 0.5;
  const indicatorColor = pH > 8.2 ? "#ec4899" : "transparent";
  const reset = () => { setBuretteVol(0); setDropwise(false); };

  const steps = [
    "Wash the burette with distilled water and rinse with 0.1 N NaOH solution.",
    "Fix the burette vertically and fill with NaOH solution using a funnel.",
    "Allow some solution to flow to remove air bubbles from the tip.",
    "Record the initial volume reading of NaOH from the burette.",
    "Use a pipette to measure exactly 10 mL of HCl solution into a flask.",
    "Add 2–3 drops of phenolphthalein indicator into the flask.",
    "Slowly open the burette and add NaOH while swirling the flask.",
    "Continue adding NaOH until a faint pink color appears and persists.",
    "Record the final burette reading and calculate volume used.",
    "Use the titration formula to calculate the normality of HCl.",
  ];

  // Titration curve points
  const curvePoints: string[] = [];
  for (let v = 0; v <= 20; v += 0.5) {
    const p = v < eqVol ? 1 + (v / eqVol) * 6 : v === eqVol ? 7 : Math.min(13, 7 + (v - eqVol) * 0.8);
    curvePoints.push(`${80 + v * 13},${200 - (p / 14) * 160}`);
  }

  return (
    <SimulationLayout title="Lab: Acid-Base Titration" objective="Determine the normality of HCl using standard NaOH" theory="At the equivalence point, moles of acid = moles of base. N₁V₁ = N₂V₂. Phenolphthalein turns pink at pH ~8.2 indicating the endpoint." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="NaOH Added" value={buretteVol} onChange={setBuretteVol} min={0} max={20} step={dropwise ? 0.1 : 0.5} unit="mL" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={dropwise} onChange={e => setDropwise(e.target.checked)} className="rounded" />
          Dropwise mode (fine control)
        </label>
        <StepByStep steps={steps} currentStep={buretteVol > 0 ? (atEndpoint ? 8 : 6) : 0} />
      </div>}
      workspace={
        <svg viewBox="0 0 440 260" className="w-full h-56">
          {/* Burette */}
          <rect x={60} y={10} width={16} height={140} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1.5} rx={2} />
          <rect x={60} y={10 + (buretteVol / 20) * 130} width={16} height={140 - (buretteVol / 20) * 130} fill="hsl(var(--primary) / 0.3)" />
          <text x={68} y={8} textAnchor="middle" className="text-[7px] fill-muted-foreground">Burette</text>
          <text x={50} y={80} textAnchor="end" className="text-[7px] fill-foreground font-mono">{buretteVol.toFixed(1)}</text>
          {/* Drip */}
          <line x1={68} y1={150} x2={68} y2={165} stroke="hsl(var(--primary))" strokeWidth={1} />
          {buretteVol > 0 && <circle cx={68} cy={168} r={2} fill="hsl(var(--primary))" />}
          {/* Flask */}
          <path d="M40,210 L55,175 L80,175 L96,210 Z" fill={indicatorColor || "hsl(var(--muted) / 0.3)"} stroke="hsl(var(--border))" strokeWidth={2} />
          <text x={68} y={200} textAnchor="middle" className="text-[7px] fill-foreground">HCl + Indicator</text>
          {atEndpoint && <text x={68} y={230} textAnchor="middle" className="text-[8px] fill-primary font-bold animate-pulse">⚡ Endpoint!</text>}
          {/* Titration curve */}
          <text x={280} y={25} textAnchor="middle" className="text-[9px] fill-foreground font-bold">Titration Curve</text>
          <line x1={160} y1={200} x2={420} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          <line x1={160} y1={30} x2={160} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          {[0, 7, 14].map(p => <text key={p} x={155} y={203 - (p / 14) * 160} textAnchor="end" className="text-[6px] fill-muted-foreground">{p}</text>)}
          <polyline points={curvePoints.map(p => { const [px, py] = p.split(","); return `${parseFloat(px) + 80},${py}`; }).join(" ")} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} />
          {/* Equivalence point line */}
          <line x1={160 + eqVol * 13} y1={30} x2={160 + eqVol * 13} y2={200} stroke="hsl(var(--accent))" strokeWidth={1} strokeDasharray="3" />
          <text x={160 + eqVol * 13} y={215} textAnchor="middle" className="text-[6px] fill-accent">Eq. pt</text>
          {/* Current position */}
          <circle cx={160 + buretteVol * 13} cy={200 - (pH / 14) * 160} r={5} fill="hsl(var(--primary))" stroke="white" strokeWidth={1.5} />
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Vol NaOH" value={buretteVol.toFixed(1)} unit="mL" />
        <DataRow label="pH" value={pH.toFixed(1)} />
        <DataRow label="Equivalence Vol" value={eqVol.toFixed(1)} unit="mL" />
        <DataRow label="Endpoint" value={atEndpoint ? "✓ Reached" : "Not yet"} />
        <DataRow label="Indicator" value={pH > 8.2 ? "Pink" : "Colorless"} />
      </div>}
    />
  );
}

// 6. Electrolysis & Metal Deposition
export function ElectrolysisMetal() {
  const [voltage, setVoltage] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const current = voltage > 1.5 ? (voltage - 1.5) * 0.5 : 0;
  const charge = current * time * 60;
  const massCu = (charge / 96485) * (63.5 / 2);
  const reset = () => { setVoltage(0); setTime(0); setRunning(false); };

  const steps = [
    "Prepare an electrolytic cell with copper(II) sulfate solution.",
    "Place two copper electrodes into the solution.",
    "Connect the electrodes to a DC power supply.",
    "Weigh the cathode electrode before electrolysis begins.",
    "Set the voltage above 1.5V and switch on the power supply.",
    "Allow current to pass for a specific time interval.",
    "Observe copper deposition on the cathode.",
    "Turn off the power supply after the required time.",
    "Remove, wash, and dry the cathode, then weigh it again.",
    "Determine mass deposited and verify with Faraday's law.",
  ];

  return (
    <SimulationLayout title="Lab: Electrolysis & Metal Deposition" objective="Determine mass of copper deposited using Faraday's law" theory="During electrolysis, Cu²⁺ ions are reduced at the cathode: Cu²⁺ + 2e⁻ → Cu. Mass deposited = (Q × M) / (n × F), where F = 96485 C/mol." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Voltage" value={voltage} onChange={setVoltage} min={0} max={12} step={0.5} unit="V" />
        <ControlGroup label="Time" value={time} onChange={setTime} min={0} max={60} step={1} unit="min" />
        <StepByStep steps={steps} currentStep={voltage > 1.5 ? (time > 0 ? 7 : 5) : 0} />
      </div>}
      workspace={
        <svg viewBox="0 0 420 240" className="w-full h-52">
          {/* Power supply */}
          <rect x={150} y={10} width={120} height={35} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <text x={210} y={22} textAnchor="middle" className="text-[7px] fill-muted-foreground">DC Power Supply</text>
          <text x={210} y={38} textAnchor="middle" className="text-[12px] fill-foreground font-bold font-mono">{voltage.toFixed(1)}V</text>
          {/* Wires */}
          <line x1={170} y1={45} x2={100} y2={80} stroke="#ef4444" strokeWidth={2} />
          <line x1={250} y1={45} x2={320} y2={80} stroke="#3b82f6" strokeWidth={2} />
          {/* Beaker */}
          <rect x={60} y={80} width={300} height={130} fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <text x={210} y={225} textAnchor="middle" className="text-[8px] fill-muted-foreground">CuSO₄ Solution</text>
          {/* Anode */}
          <rect x={90} y={75} width={20} height={100} fill="#b45309" rx={2} />
          <text x={100} y={70} textAnchor="middle" className="text-[8px] fill-foreground font-bold">Anode (+)</text>
          {/* Cathode with deposit */}
          <rect x={310} y={75} width={20} height={100} fill="#b45309" rx={2} />
          {massCu > 0 && <rect x={306} y={75} width={4} height={100} fill="#d97706" rx={1} opacity={Math.min(1, massCu * 10)} />}
          <text x={320} y={70} textAnchor="middle" className="text-[8px] fill-foreground font-bold">Cathode (−)</text>
          {/* Ion movement */}
          {current > 0 && <>
            <text x={200} y={130} textAnchor="middle" className="text-[9px] fill-primary animate-pulse">Cu²⁺ →</text>
            {[0, 1, 2].map(i => (
              <circle key={i} cx={150 + i * 50} cy={140 + Math.sin(i * 2) * 10} r={3} fill="hsl(var(--primary))" opacity={0.6}>
                <animate attributeName="cx" values={`${150 + i * 50};${300};${150 + i * 50}`} dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </>}
          {/* Bubble animation at anode */}
          {current > 0 && [0, 1, 2].map(i => (
            <circle key={`b${i}`} cx={100} cy={120} r={2} fill="hsl(var(--muted-foreground))" opacity={0.4}>
              <animate attributeName="cy" values="150;80" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Current" value={current.toFixed(2)} unit="A" />
        <DataRow label="Charge (Q)" value={charge.toFixed(1)} unit="C" />
        <DataRow label="Cu Deposited" value={massCu > 0 ? (massCu * 1000).toFixed(2) : "0"} unit="mg" />
        <DataRow label="Time" value={time} unit="min" />
        <DataRow label="Faraday (F)" value="96485" unit="C/mol" />
      </div>}
      analysis={<p className="text-xs font-mono text-muted-foreground">Cu²⁺ + 2e⁻ → Cu | m = (Q × M) / (n × F) = ({charge.toFixed(0)} × 63.5) / (2 × 96485) = {(massCu * 1000).toFixed(2)} mg</p>}
    />
  );
}

// 7. Voltaic (Galvanic) Cell
export function VoltaicCell() {
  const [znConc, setZnConc] = useState(1);
  const [cuConc, setCuConc] = useState(1);
  const E0 = 1.1;
  const nernst = E0 - (0.0257 / 2) * Math.log(znConc / cuConc);
  const reset = () => { setZnConc(1); setCuConc(1); };

  const steps = [
    "Prepare two solutions: ZnSO₄ and CuSO₄ in separate beakers.",
    "Insert a zinc electrode into the ZnSO₄ solution.",
    "Insert a copper electrode into the CuSO₄ solution.",
    "Connect the two solutions using a salt bridge.",
    "Connect the electrodes to a voltmeter using wires.",
    "Observe the voltage reading on the voltmeter.",
    "Adjust concentrations and observe voltage changes.",
    "Record electron flow direction and voltage readings.",
  ];

  return (
    <SimulationLayout title="Lab: Voltaic (Galvanic) Cell" objective="Build a Zn-Cu cell and observe electron flow and voltage" theory="Zn is oxidized at anode, Cu²⁺ reduced at cathode. E°cell = 1.10V. Nernst equation: E = E° − (RT/nF)ln(Q)." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="[ZnSO₄]" value={znConc} onChange={setZnConc} min={0.01} max={2} step={0.01} unit="M" />
        <ControlGroup label="[CuSO₄]" value={cuConc} onChange={setCuConc} min={0.01} max={2} step={0.01} unit="M" />
        <StepByStep steps={steps} currentStep={znConc !== 1 || cuConc !== 1 ? 6 : 0} />
      </div>}
      workspace={
        <svg viewBox="0 0 420 240" className="w-full h-52">
          {/* Voltmeter */}
          <rect x={175} y={5} width={70} height={30} fill="hsl(var(--card))" stroke="hsl(var(--border))" rx={4} strokeWidth={2} />
          <text x={210} y={17} textAnchor="middle" className="text-[7px] fill-muted-foreground">Voltmeter</text>
          <text x={210} y={30} textAnchor="middle" className="text-[12px] fill-foreground font-bold font-mono">{nernst.toFixed(2)}V</text>
          {/* Wires */}
          <line x1={90} y1={50} x2={175} y2={25} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
          <line x1={330} y1={50} x2={245} y2={25} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
          {/* Electron flow arrow */}
          <text x={210} y={48} textAnchor="middle" className="text-[7px] fill-primary">e⁻ →</text>
          {/* Left beaker - Zn */}
          <rect x={30} y={80} width={130} height={120} fill="#d1d5db22" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <rect x={80} y={50} width={18} height={100} fill="#9ca3af" rx={2} />
          <text x={89} y={45} textAnchor="middle" className="text-[9px] fill-foreground font-bold">Zn</text>
          <text x={95} y={215} textAnchor="middle" className="text-[8px] fill-muted-foreground">ZnSO₄ ({znConc.toFixed(2)}M)</text>
          <text x={95} y={175} textAnchor="middle" className="text-[7px] fill-muted-foreground">Anode (−)</text>
          <text x={95} y={188} textAnchor="middle" className="text-[6px] fill-accent">Oxidation</text>
          {/* Right beaker - Cu */}
          <rect x={260} y={80} width={130} height={120} fill="#3b82f622" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <rect x={320} y={50} width={18} height={100} fill="#b45309" rx={2} />
          <text x={329} y={45} textAnchor="middle" className="text-[9px] fill-foreground font-bold">Cu</text>
          <text x={325} y={215} textAnchor="middle" className="text-[8px] fill-muted-foreground">CuSO₄ ({cuConc.toFixed(2)}M)</text>
          <text x={325} y={175} textAnchor="middle" className="text-[7px] fill-muted-foreground">Cathode (+)</text>
          <text x={325} y={188} textAnchor="middle" className="text-[6px] fill-primary">Reduction</text>
          {/* Salt bridge */}
          <path d="M160,95 Q210,70 260,95" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={3} />
          <text x={210} y={72} textAnchor="middle" className="text-[8px] fill-muted-foreground font-semibold">Salt Bridge</text>
          {/* Ion flow indicators */}
          <text x={140} y={130} textAnchor="middle" className="text-[6px] fill-accent">Zn→Zn²⁺+2e⁻</text>
          <text x={280} y={130} textAnchor="middle" className="text-[6px] fill-primary">Cu²⁺+2e⁻→Cu</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="E° cell" value={E0.toFixed(2)} unit="V" />
        <DataRow label="E cell (Nernst)" value={nernst.toFixed(3)} unit="V" />
        <DataRow label="[Zn²⁺]" value={znConc.toFixed(2)} unit="M" />
        <DataRow label="[Cu²⁺]" value={cuConc.toFixed(2)} unit="M" />
      </div>}
      analysis={<p className="text-xs font-mono text-muted-foreground">Zn → Zn²⁺ + 2e⁻ (oxidation) | Cu²⁺ + 2e⁻ → Cu (reduction)</p>}
    />
  );
}

// 8. Haber Process Simulation
export function HaberProcess() {
  const [pressure, setPressure] = useState(200);
  const [temp, setTemp] = useState(450);
  const [catalyst, setCatalyst] = useState(true);
  const yieldBase = 15;
  const pressureEffect = (pressure / 200) * 20;
  const tempEffect = -((temp - 400) / 100) * 8;
  const catEffect = catalyst ? 5 : 0;
  const yieldPct = Math.max(2, Math.min(60, yieldBase + pressureEffect + tempEffect + catEffect));
  const rate = (1 + (temp - 300) / 200) * (catalyst ? 3 : 1);
  const reset = () => { setPressure(200); setTemp(450); setCatalyst(true); };

  const steps = [
    "Set the N₂ and H₂ inlet to the reactor.",
    "Adjust the pressure using the pressure slider.",
    "Set the temperature in the reactor.",
    "Toggle the iron (Fe) catalyst ON or OFF.",
    "Observe the NH₃ yield percentage change.",
    "Increase pressure — observe yield increase (fewer gas moles).",
    "Decrease temperature — observe yield increase (exothermic).",
    "Note the trade-off: low temp gives high yield but slow rate.",
    "Record optimal conditions for maximum practical yield.",
  ];

  return (
    <SimulationLayout title="Lab: Haber Process" objective="Optimize industrial NH₃ production: N₂ + 3H₂ ⇌ 2NH₃" theory="High pressure favors product (fewer moles). Low temp favors product (exothermic) but slows rate. Iron catalyst increases rate without shifting equilibrium." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Pressure" value={pressure} onChange={setPressure} min={50} max={500} step={10} unit="atm" />
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={300} max={600} step={10} unit="°C" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={catalyst} onChange={e => setCatalyst(e.target.checked)} className="rounded" />
          Iron Catalyst (Fe)
        </label>
        <StepByStep steps={steps} currentStep={pressure !== 200 || temp !== 450 ? 5 : 0} />
      </div>}
      workspace={
        <svg viewBox="0 0 420 210" className="w-full h-48">
          {/* Process flow */}
          <rect x={20} y={40} width={60} height={80} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} rx={4} />
          <text x={50} y={72} textAnchor="middle" className="text-[8px] fill-primary">N₂</text>
          <text x={50} y={92} textAnchor="middle" className="text-[8px] fill-primary">3H₂</text>
          <line x1={80} y1={80} x2={120} y2={80} stroke="hsl(var(--foreground))" strokeWidth={2} markerEnd="url(#harrow)" />
          {/* Compressor */}
          <rect x={120} y={55} width={50} height={50} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <text x={145} y={75} textAnchor="middle" className="text-[7px] fill-foreground">Compress</text>
          <text x={145} y={88} textAnchor="middle" className="text-[6px] fill-muted-foreground">{pressure} atm</text>
          <line x1={170} y1={80} x2={200} y2={80} stroke="hsl(var(--foreground))" strokeWidth={2} markerEnd="url(#harrow)" />
          {/* Reactor */}
          <rect x={200} y={30} width={100} height={100} fill="hsl(var(--accent) / 0.15)" stroke="hsl(var(--accent))" strokeWidth={2} rx={6} />
          <text x={250} y={60} textAnchor="middle" className="text-[10px] fill-foreground font-bold">Reactor</text>
          <text x={250} y={78} textAnchor="middle" className="text-[8px] fill-muted-foreground">{temp}°C</text>
          <text x={250} y={93} textAnchor="middle" className="text-[8px] fill-muted-foreground">{pressure} atm</text>
          {catalyst && <text x={250} y={108} textAnchor="middle" className="text-[7px] fill-accent font-semibold">Fe catalyst</text>}
          <line x1={300} y1={80} x2={340} y2={80} stroke="hsl(var(--foreground))" strokeWidth={2} markerEnd="url(#harrow)" />
          {/* Output */}
          <rect x={340} y={40} width={60} height={80} fill="hsl(var(--secondary) / 0.2)" stroke="hsl(var(--secondary))" strokeWidth={2} rx={4} />
          <text x={370} y={72} textAnchor="middle" className="text-[9px] fill-secondary font-bold">NH₃</text>
          <text x={370} y={92} textAnchor="middle" className="text-[11px] fill-foreground font-bold">{yieldPct.toFixed(0)}%</text>
          {/* Yield bar */}
          <rect x={60} y={155} width={300} height={14} fill="hsl(var(--muted))" rx={7} />
          <rect x={60} y={155} width={yieldPct / 60 * 300} height={14} fill="hsl(var(--primary))" rx={7} />
          <text x={210} y={185} textAnchor="middle" className="text-[8px] fill-muted-foreground">Yield: {yieldPct.toFixed(0)}% | Rate: {rate.toFixed(1)}×</text>
          <defs><marker id="harrow" markerWidth={6} markerHeight={4} refX={6} refY={2} orient="auto"><path d="M0,0 L6,2 L0,4" fill="hsl(var(--foreground))" /></marker></defs>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Yield" value={`${yieldPct.toFixed(1)}%`} />
        <DataRow label="Rate" value={rate.toFixed(1)} unit="×" />
        <DataRow label="Pressure" value={pressure} unit="atm" />
        <DataRow label="Temperature" value={temp} unit="°C" />
        <DataRow label="Catalyst" value={catalyst ? "Fe (Yes)" : "No"} />
      </div>}
      analysis={<p className="text-xs text-muted-foreground">N₂ + 3H₂ ⇌ 2NH₃ (ΔH = −92 kJ/mol). Industrial conditions: ~450°C, 200 atm, Fe catalyst = compromise between yield and rate.</p>}
    />
  );
}

// 9. Addition Polymerization
export function AdditionPolymerization() {
  const [monomers, setMonomers] = useState(10);
  const [temp, setTemp] = useState(100);
  const [initiator, setInitiator] = useState(true);
  const reacted = initiator ? Math.min(monomers, Math.round(monomers * (temp / 200) * 0.9)) : 0;
  const degreeOfPoly = reacted;
  const molWeight = reacted * 28;
  const reset = () => { setMonomers(10); setTemp(100); setInitiator(true); };

  const steps = [
    "Prepare a reaction vessel with ethene (C₂H₄) monomers.",
    "Add a polymerization initiator (free radical source).",
    "Set the temperature and apply heat/pressure.",
    "Observe the breaking of C=C double bonds in monomers.",
    "Watch the formation of C–C single bonds between monomers.",
    "Continue until the polymer chain forms.",
    "Examine the degree of polymerization and molecular weight.",
    "Record observations about the polymer product properties.",
  ];

  return (
    <SimulationLayout title="Lab: Addition Polymerization" objective="Observe polymer chain formation from ethene monomers" theory="In addition polymerization, unsaturated monomers (alkenes) join by breaking C=C double bonds. n(CH₂=CH₂) → −(CH₂−CH₂)ₙ− (polyethylene)." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Number of Monomers" value={monomers} onChange={setMonomers} min={2} max={50} step={1} />
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={50} max={300} step={10} unit="°C" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={initiator} onChange={e => setInitiator(e.target.checked)} className="rounded" />
          Add Initiator (Free Radical)
        </label>
        <StepByStep steps={steps} currentStep={reacted > 0 ? 5 : 0} />
      </div>}
      workspace={
        <svg viewBox="0 0 420 220" className="w-full h-48">
          <text x={210} y={18} textAnchor="middle" className="text-[10px] fill-foreground font-bold">Addition Polymerization of Ethene</text>
          {/* Monomers */}
          <text x={60} y={50} className="text-[8px] fill-muted-foreground">Monomers (CH₂=CH₂)</text>
          {Array.from({ length: Math.min(monomers - reacted, 12) }).map((_, i) => (
            <g key={`m${i}`}>
              <circle cx={30 + (i % 6) * 30} cy={70 + Math.floor(i / 6) * 30} r={10} fill="hsl(var(--primary) / 0.3)" stroke="hsl(var(--primary))" strokeWidth={1.5} />
              <text x={30 + (i % 6) * 30} y={74 + Math.floor(i / 6) * 30} textAnchor="middle" className="text-[5px] fill-primary">=</text>
            </g>
          ))}
          {/* Arrow */}
          {reacted > 0 && <>
            <line x1={200} y1={90} x2={200} y2={130} stroke="hsl(var(--foreground))" strokeWidth={2} markerEnd="url(#parrow)" />
            <text x={215} y={115} className="text-[7px] fill-accent">{initiator ? "Initiator" : ""}</text>
          </>}
          {/* Polymer chain */}
          {reacted > 0 && <>
            <text x={210} y={150} textAnchor="middle" className="text-[8px] fill-muted-foreground">Polymer Chain −(CH₂−CH₂)ₙ−</text>
            <line x1={40} y1={170} x2={40 + reacted * 7} y2={170} stroke="hsl(var(--primary))" strokeWidth={4} strokeLinecap="round" />
            {Array.from({ length: Math.min(reacted, 40) }).map((_, i) => (
              <circle key={`p${i}`} cx={44 + i * 7} cy={170} r={3} fill="hsl(var(--primary))" />
            ))}
            <text x={210} y={195} textAnchor="middle" className="text-[8px] fill-foreground font-bold">n = {degreeOfPoly}</text>
          </>}
          <defs><marker id="parrow" markerWidth={6} markerHeight={4} refX={3} refY={2} orient="auto"><path d="M0,0 L6,2 L0,4" fill="hsl(var(--foreground))" /></marker></defs>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Monomers" value={monomers} />
        <DataRow label="Reacted" value={reacted} />
        <DataRow label="Degree of Poly" value={degreeOfPoly} />
        <DataRow label="Mol. Weight" value={molWeight} unit="g/mol" />
        <DataRow label="Initiator" value={initiator ? "Yes" : "No"} />
      </div>}
      analysis={<p className="text-xs font-mono text-muted-foreground">n(CH₂=CH₂) → −(CH₂−CH₂)ₙ− | Degree of polymerization = {degreeOfPoly}</p>}
    />
  );
}

// 10. Air Pollution & Acid Rain Simulation
export function AirPollutionAcidRain() {
  const [emission, setEmission] = useState(50);
  const [windSpeed, setWindSpeed] = useState(10);
  const [temp, setTemp] = useState(25);
  const so2 = emission * 0.6;
  const no2 = emission * 0.4;
  const rainPH = Math.max(2, 5.6 - (emission / 100) * 3.5);
  const damageIndex = Math.min(100, ((5.6 - rainPH) / 3.5) * 100);
  const dispersion = windSpeed * 0.5;
  const reset = () => { setEmission(50); setWindSpeed(10); setTemp(25); };

  const steps = [
    "Observe the factory emitting SO₂ and NO₂ gases.",
    "Adjust the emission slider to increase or decrease pollutants.",
    "Observe the atmospheric reaction forming H₂SO₄ and HNO₃.",
    "Watch acid rain falling on the environment below.",
    "Measure the rain pH using the virtual pH indicator.",
    "Adjust wind speed to see pollutant dispersion.",
    "Observe effects on soil, lake, and plants.",
    "Record rain pH and environmental damage index.",
    "Suggest methods to reduce air pollution.",
  ];

  return (
    <SimulationLayout title="Lab: Air Pollution & Acid Rain" objective="Investigate how factory emissions cause acid rain and environmental damage" theory="SO₂ + H₂O → H₂SO₃. 2NO₂ + H₂O → HNO₃ + HNO₂. These form acid rain (pH < 5.6) which damages ecosystems, buildings, and water bodies." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Emission Level" value={emission} onChange={setEmission} min={0} max={100} step={5} unit="%" />
        <ControlGroup label="Wind Speed" value={windSpeed} onChange={setWindSpeed} min={0} max={30} step={1} unit="km/h" />
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={5} max={40} step={1} unit="°C" />
        <StepByStep steps={steps} currentStep={emission !== 50 ? 5 : 0} />
      </div>}
      workspace={
        <svg viewBox="0 0 440 260" className="w-full h-56">
          {/* Sky */}
          <rect x={0} y={0} width={440} height={160} fill="hsl(var(--muted) / 0.2)" />
          {/* Ground */}
          <rect x={0} y={160} width={440} height={100} fill="hsl(var(--accent) / 0.15)" />
          {/* Factory */}
          <rect x={20} y={90} width={50} height={70} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={35} y={50} width={20} height={50} fill="hsl(var(--foreground) / 0.4)" stroke="hsl(var(--border))" strokeWidth={1.5} />
          <text x={45} y={145} textAnchor="middle" className="text-[6px] fill-foreground">Factory</text>
          {/* Smoke / emissions */}
          {emission > 0 && [0, 1, 2].map(i => (
            <g key={i}>
              <circle cx={45 + i * 15 + dispersion} cy={40 - i * 10} r={8 + i * 3} fill="hsl(var(--muted-foreground) / 0.2)" >
                <animate attributeName="cx" values={`${45 + i * 15};${100 + dispersion * 3};${200 + dispersion * 5}`} dur={`${4 + i}s`} repeatCount="indefinite" />
                <animate attributeName="cy" values={`${40 - i * 10};${20};${10}`} dur={`${4 + i}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.1;0" dur={`${4 + i}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
          {/* Atmospheric reactions label */}
          <text x={220} y={30} textAnchor="middle" className="text-[7px] fill-muted-foreground">SO₂ + H₂O → H₂SO₃ | NO₂ + H₂O → HNO₃</text>
          {/* Cloud */}
          <ellipse cx={250} cy={60} rx={60} ry={25} fill="hsl(var(--muted-foreground) / 0.15)" />
          <text x={250} y={55} textAnchor="middle" className="text-[7px] fill-muted-foreground">Acid Cloud</text>
          <text x={250} y={68} textAnchor="middle" className="text-[8px] fill-foreground font-bold">pH {rainPH.toFixed(1)}</text>
          {/* Rain drops */}
          {emission > 10 && [0, 1, 2, 3, 4].map(i => (
            <line key={`r${i}`} x1={200 + i * 25} y1={85} x2={195 + i * 25} y2={95} stroke={rainPH < 4 ? "#ef4444" : rainPH < 5 ? "#f97316" : "#3b82f6"} strokeWidth={1.5} opacity={0.6}>
              <animate attributeName="y1" values="85;155" dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
              <animate attributeName="y2" values="95;165" dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
            </line>
          ))}
          {/* Environment */}
          {/* Tree */}
          <rect x={180} y={170} width={6} height={30} fill="#92400e" />
          <circle cx={183} cy={165} r={15} fill={damageIndex > 60 ? "#a16207" : "#16a34a"} opacity={0.8} />
          <text x={183} y={215} textAnchor="middle" className="text-[6px] fill-foreground">Tree</text>
          {/* Lake */}
          <ellipse cx={290} cy={195} rx={40} ry={15} fill={rainPH < 4 ? "#fbbf24" : "#3b82f6"} opacity={0.4} />
          <text x={290} y={199} textAnchor="middle" className="text-[7px] fill-foreground">Lake pH {(rainPH + 0.5).toFixed(1)}</text>
          {/* Soil */}
          <rect x={360} y={175} width={60} height={30} fill={damageIndex > 50 ? "#92400e" : "#65a30d"} opacity={0.4} rx={4} />
          <text x={390} y={195} textAnchor="middle" className="text-[7px] fill-foreground">Soil</text>
          {/* Damage bar */}
          <text x={220} y={240} textAnchor="middle" className="text-[7px] fill-muted-foreground">Environmental Damage: {damageIndex.toFixed(0)}%</text>
          <rect x={120} y={245} width={200} height={8} fill="hsl(var(--muted))" rx={4} />
          <rect x={120} y={245} width={damageIndex * 2} height={8} fill={damageIndex > 60 ? "#ef4444" : damageIndex > 30 ? "#f97316" : "#22c55e"} rx={4} />
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Rain pH" value={rainPH.toFixed(2)} />
        <DataRow label="SO₂ Level" value={so2.toFixed(0)} unit="ppm" />
        <DataRow label="NO₂ Level" value={no2.toFixed(0)} unit="ppm" />
        <DataRow label="Damage Index" value={`${damageIndex.toFixed(0)}%`} />
        <DataRow label="Wind" value={windSpeed} unit="km/h" />
      </div>}
      analysis={<p className="text-xs text-muted-foreground">Normal rain pH ≈ 5.6. Acid rain (pH {"<"} 5.6) erodes buildings, acidifies lakes, and kills vegetation. Reducing SO₂/NO₂ emissions is critical.</p>}
    />
  );
}
