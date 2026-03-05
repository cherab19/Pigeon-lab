import { useState } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

// 1. Weak Acid Ionization
export function WeakAcidIonization() {
  const [concInit, setConcInit] = useState(0.1);
  const [temp, setTemp] = useState(25);
  const Ka = 1.8e-5 * (1 + (temp - 25) * 0.02);
  const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * concInit)) / 2;
  const pH = -Math.log10(x);
  const percentIon = (x / concInit) * 100;
  const reset = () => { setConcInit(0.1); setTemp(25); };

  return (
    <SimulationLayout title="Lab: Weak Acid Ionization (Ka)" objective="Calculate Ka and % ionization using ICE table" theory="HA ⇌ H⁺ + A⁻. Ka = [H⁺][A⁻]/[HA]. Use ICE table for equilibrium concentrations." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Initial [HA]" value={concInit} onChange={setConcInit} min={0.01} max={1} step={0.01} unit="M" />
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={10} max={60} unit="°C" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-44">
          <text x={200} y={20} textAnchor="middle" className="text-[11px] fill-foreground font-bold">ICE Table: CH₃COOH ⇌ H⁺ + CH₃COO⁻</text>
          {[["", "HA", "H⁺", "A⁻"], ["I", concInit.toFixed(4), "0", "0"], ["C", `-${x.toFixed(4)}`, `+${x.toFixed(4)}`, `+${x.toFixed(4)}`], ["E", (concInit - x).toFixed(4), x.toFixed(4), x.toFixed(4)]].map((row, ri) => (
            <g key={ri}>
              {row.map((cell, ci) => (
                <g key={ci}>
                  <rect x={40 + ci * 85} y={35 + ri * 35} width={85} height={30} fill={ri === 0 ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted) / 0.3)"} stroke="hsl(var(--border))" strokeWidth={0.5} />
                  <text x={82 + ci * 85} y={55 + ri * 35} textAnchor="middle" className={`text-[9px] ${ri === 0 ? "fill-primary font-bold" : "fill-foreground"}`}>{cell}</text>
                </g>
              ))}
            </g>
          ))}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Ka" value={Ka.toExponential(2)} />
        <DataRow label="[H⁺]" value={x.toExponential(3)} unit="M" />
        <DataRow label="pH" value={pH.toFixed(2)} />
        <DataRow label="% Ionization" value={percentIon.toFixed(2)} unit="%" />
      </div>}
    />
  );
}

// 2. Buffer Solutions
export function BufferSolutions() {
  const [acidAdded, setAcidAdded] = useState(0);
  const [baseAdded, setBaseAdded] = useState(0);
  const basePH = 4.74;
  const pH = Math.max(2, Math.min(12, basePH - acidAdded * 0.15 + baseAdded * 0.15));
  const unbufferedPH = Math.max(0, Math.min(14, 7 - acidAdded * 1.5 + baseAdded * 1.5));
  const reset = () => { setAcidAdded(0); setBaseAdded(0); };

  return (
    <SimulationLayout title="Lab: Buffer Solutions" objective="Observe how buffers resist pH changes" theory="Buffer = weak acid + conjugate base. Neutralizes added H⁺ or OH⁻." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="HCl Added" value={acidAdded} onChange={setAcidAdded} min={0} max={10} step={0.5} unit="mL" />
        <ControlGroup label="NaOH Added" value={baseAdded} onChange={setBaseAdded} min={0} max={10} step={0.5} unit="mL" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          <text x={200} y={15} textAnchor="middle" className="text-[9px] fill-muted-foreground font-semibold">pH Comparison</text>
          <line x1={40} y1={200} x2={360} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          <line x1={40} y1={20} x2={40} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          {[0, 2, 4, 7, 10, 14].map(p => (
            <g key={p}><line x1={38} y1={200 - (p / 14) * 170} x2={42} y2={200 - (p / 14) * 170} stroke="hsl(var(--foreground))" strokeWidth={1} />
            <text x={35} y={203 - (p / 14) * 170} textAnchor="end" className="text-[7px] fill-muted-foreground">{p}</text></g>
          ))}
          <circle cx={200} cy={200 - (pH / 14) * 170} r={8} fill="hsl(var(--primary))" />
          <text x={200} y={200 - (pH / 14) * 170 - 15} textAnchor="middle" className="text-[9px] fill-primary font-bold">Buffer: {pH.toFixed(1)}</text>
          <circle cx={300} cy={200 - (unbufferedPH / 14) * 170} r={8} fill="hsl(var(--accent))" />
          <text x={300} y={200 - (unbufferedPH / 14) * 170 - 15} textAnchor="middle" className="text-[9px] fill-accent font-bold">Water: {unbufferedPH.toFixed(1)}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Buffer pH" value={pH.toFixed(2)} />
        <DataRow label="Water pH" value={unbufferedPH.toFixed(2)} />
        <DataRow label="ΔpH (Buffer)" value={Math.abs(pH - basePH).toFixed(2)} />
        <DataRow label="ΔpH (Water)" value={Math.abs(unbufferedPH - 7).toFixed(2)} />
      </div>}
      analysis={<p className="text-xs text-muted-foreground">Buffer resists pH change much better than unbuffered water!</p>}
    />
  );
}

// 3. Voltaic Cell
export function VoltaicCell() {
  const [znConc, setZnConc] = useState(1);
  const [cuConc, setCuConc] = useState(1);
  const E0 = 1.1;
  const nernst = E0 - (0.0257 / 2) * Math.log(znConc / cuConc);
  const reset = () => { setZnConc(1); setCuConc(1); };

  return (
    <SimulationLayout title="Lab: Voltaic (Galvanic) Cell" objective="Build a Zn-Cu cell and observe voltage" theory="Zn is oxidized at anode, Cu²⁺ reduced at cathode. E°cell = 1.10V. Nernst equation adjusts for concentration." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="[ZnSO₄]" value={znConc} onChange={setZnConc} min={0.01} max={2} step={0.01} unit="M" />
        <ControlGroup label="[CuSO₄]" value={cuConc} onChange={setCuConc} min={0.01} max={2} step={0.01} unit="M" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 230" className="w-full h-48">
          <rect x={40} y={80} width={120} height={120} fill="#d1d5db33" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <rect x={80} y={50} width={20} height={100} fill="#9ca3af" rx={2} />
          <text x={100} y={45} textAnchor="middle" className="text-[9px] fill-foreground font-bold">Zn</text>
          <text x={100} y={215} textAnchor="middle" className="text-[8px] fill-muted-foreground">ZnSO₄</text>
          <rect x={240} y={80} width={120} height={120} fill="#3b82f622" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <rect x={280} y={50} width={20} height={100} fill="#b45309" rx={2} />
          <text x={290} y={45} textAnchor="middle" className="text-[9px] fill-foreground font-bold">Cu</text>
          <text x={300} y={215} textAnchor="middle" className="text-[8px] fill-muted-foreground">CuSO₄</text>
          <path d="M160,90 Q200,70 240,90" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
          <text x={200} y={68} textAnchor="middle" className="text-[8px] fill-muted-foreground">Salt Bridge</text>
          <line x1={90} y1={40} x2={200} y2={25} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
          <line x1={290} y1={40} x2={200} y2={25} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
          <rect x={175} y={10} width={50} height={20} fill="hsl(var(--card))" stroke="hsl(var(--border))" rx={3} />
          <text x={200} y={24} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{nernst.toFixed(2)}V</text>
          <text x={90} y={170} textAnchor="middle" className="text-[7px] fill-muted-foreground">Anode (−)</text>
          <text x={300} y={170} textAnchor="middle" className="text-[7px] fill-muted-foreground">Cathode (+)</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="E° cell" value={E0.toFixed(2)} unit="V" />
        <DataRow label="E cell" value={nernst.toFixed(3)} unit="V" />
        <DataRow label="[Zn²⁺]" value={znConc.toFixed(2)} unit="M" />
        <DataRow label="[Cu²⁺]" value={cuConc.toFixed(2)} unit="M" />
      </div>}
      analysis={<p className="text-xs font-mono">Zn → Zn²⁺ + 2e⁻ (oxidation) | Cu²⁺ + 2e⁻ → Cu (reduction)</p>}
    />
  );
}

// 4. Haber Process
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

  return (
    <SimulationLayout title="Lab: Haber Process" objective="Optimize NH₃ production: N₂ + 3H₂ ⇌ 2NH₃" theory="High pressure favors product (fewer moles). Low temp favors product (exothermic) but slows rate. Compromise needed." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Pressure" value={pressure} onChange={setPressure} min={50} max={500} step={10} unit="atm" />
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={300} max={600} step={10} unit="°C" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={catalyst} onChange={e => setCatalyst(e.target.checked)} className="rounded" />
          Iron Catalyst (Fe)
        </label>
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-44">
          <rect x={30} y={40} width={60} height={80} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} rx={4} />
          <text x={60} y={75} textAnchor="middle" className="text-[8px] fill-primary">N₂</text>
          <text x={60} y={95} textAnchor="middle" className="text-[8px] fill-primary">3H₂</text>
          <line x1={90} y1={80} x2={140} y2={80} stroke="hsl(var(--foreground))" strokeWidth={2} markerEnd="url(#ar)" />
          <rect x={140} y={30} width={120} height={100} fill="hsl(var(--accent) / 0.15)" stroke="hsl(var(--accent))" strokeWidth={2} rx={6} />
          <text x={200} y={70} textAnchor="middle" className="text-[10px] fill-foreground font-bold">Reactor</text>
          <text x={200} y={90} textAnchor="middle" className="text-[8px] fill-muted-foreground">{temp}°C, {pressure} atm</text>
          {catalyst && <text x={200} y={110} textAnchor="middle" className="text-[8px] fill-accent">Fe catalyst</text>}
          <line x1={260} y1={80} x2={310} y2={80} stroke="hsl(var(--foreground))" strokeWidth={2} markerEnd="url(#ar)" />
          <rect x={310} y={40} width={60} height={80} fill="hsl(var(--secondary) / 0.2)" stroke="hsl(var(--secondary))" strokeWidth={2} rx={4} />
          <text x={340} y={75} textAnchor="middle" className="text-[9px] fill-secondary font-bold">NH₃</text>
          <text x={340} y={95} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{yieldPct.toFixed(0)}%</text>
          <rect x={100} y={160} width={200} height={12} fill="hsl(var(--muted))" rx={6} />
          <rect x={100} y={160} width={yieldPct / 60 * 200} height={12} fill="hsl(var(--primary))" rx={6} />
          <text x={200} y={190} textAnchor="middle" className="text-[8px] fill-muted-foreground">Yield: {yieldPct.toFixed(0)}%</text>
          <defs><marker id="ar" markerWidth={6} markerHeight={4} refX={6} refY={2} orient="auto"><path d="M0,0 L6,2 L0,4" fill="hsl(var(--foreground))" /></marker></defs>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Yield" value={`${yieldPct.toFixed(1)}%`} />
        <DataRow label="Rate" value={rate.toFixed(1)} unit="×" />
        <DataRow label="Pressure" value={pressure} unit="atm" />
        <DataRow label="Temperature" value={temp} unit="°C" />
        <DataRow label="Catalyst" value={catalyst ? "Yes" : "No"} />
      </div>}
    />
  );
}
