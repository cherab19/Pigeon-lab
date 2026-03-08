import { useState } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";

// ========== UNIT 1: Chemical Reactions & Stoichiometry ==========

// Lab 1: Combination Reaction (Fe + S)
export function CombinationReaction() {
  const [heated, setHeated] = useState(false);
  const [time, setTime] = useState(0);
  const [showAtoms, setShowAtoms] = useState(false);
  const progress = heated ? Math.min(time / 30, 1) : 0;
  const mixColor = progress < 0.3 ? "#9ca3af" : progress < 0.7 ? "#b45309" : "#1f2937";
  const reset = () => { setHeated(false); setTime(0); };

  const steps = [
    "Wear safety gloves and goggles.",
    "Take a clean test tube and place it in a test tube holder.",
    "Measure about 1 g of iron filings using a digital balance.",
    "Measure about 1 g of sulfur powder.",
    "Mix the iron and sulfur thoroughly in the test tube.",
    "Heat the mixture gently using a Bunsen burner.",
    "Continue heating until the mixture begins to glow.",
    "Remove the flame and allow the product to cool.",
    "Observe the color and texture of the product.",
    "Record observations and write the balanced chemical equation.",
  ];

  return (
    <SimulationLayout title="Lab: Combination Reaction (Fe + S → FeS)" objective="Observe a combination reaction forming iron sulfide"
      theory="In a combination reaction, two or more substances combine to form a single product. Fe + S → FeS is an exothermic reaction."
      onReset={reset}
      equipment={<div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setHeated(true)} className="px-2 py-1 text-xs rounded bg-destructive/80 text-destructive-foreground">{heated ? "🔥 Heating…" : "🔥 Heat"}</button>
          <button onClick={() => setShowAtoms(!showAtoms)} className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">{showAtoms ? "Hide Atoms" : "Show Atoms"}</button>
        </div>
        {heated && <ControlGroup label="Reaction Time" value={time} onChange={setTime} min={0} max={60} step={1} unit="s" />}
        <div className="text-[10px] text-muted-foreground space-y-1">
          <p className="font-semibold">Equipment:</p>
          <p>🧪 Test tube &amp; holder</p>
          <p>⚖️ Digital balance</p>
          <p>🔥 Bunsen burner</p>
        </div>
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 320 260" className="w-full h-56">
          {/* Test tube */}
          <rect x={120} y={30} width={80} height={150} rx={0} ry={0} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <path d="M120,180 Q160,210 200,180" fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Mixture */}
          <rect x={125} y={100} width={70} height={75} fill={mixColor} opacity={0.7} rx={2} />
          {progress > 0.5 && <text x={160} y={145} textAnchor="middle" className="text-[8px] fill-foreground font-bold">FeS (black)</text>}
          {progress < 0.3 && <>
            <circle cx={140} cy={120} r={3} fill="#6b7280" /><circle cx={155} cy={130} r={3} fill="#eab308" />
            <circle cx={170} cy={115} r={3} fill="#6b7280" /><circle cx={150} cy={140} r={3} fill="#eab308" />
          </>}
          {/* Burner */}
          {heated && <>
            <rect x={140} y={195} width={40} height={20} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={2} />
            <path d={`M155,195 Q150,${185 - progress * 10} 160,${180 - progress * 15} Q170,${185 - progress * 10} 165,195`} fill="#f97316" opacity={0.7}>
              <animate attributeName="d" values="M155,195 Q150,180 160,170 Q170,180 165,195;M155,195 Q148,175 160,165 Q172,175 165,195;M155,195 Q150,180 160,170 Q170,180 165,195" dur="0.8s" repeatCount="indefinite" />
            </path>
          </>}
          {/* Atom view */}
          {showAtoms && <g>
            <text x={260} y={60} textAnchor="middle" className="text-[9px] fill-foreground font-bold">Atom View</text>
            <circle cx={245} cy={85} r={10} fill="#6b7280" /><text x={245} y={89} textAnchor="middle" className="text-[8px] fill-background font-bold">Fe</text>
            {progress < 0.5 ? <>
              <text x={260} y={100} className="text-[8px] fill-muted-foreground">+</text>
              <circle cx={275} cy={85} r={10} fill="#eab308" /><text x={275} y={89} textAnchor="middle" className="text-[8px] fill-background font-bold">S</text>
            </> : <>
              <circle cx={260} cy={85} r={10} fill="#eab308" /><text x={260} y={89} textAnchor="middle" className="text-[8px] fill-background font-bold">S</text>
              <line x1={245} y1={85} x2={260} y2={85} stroke="hsl(var(--primary))" strokeWidth={2} />
            </>}
          </g>}
          <text x={160} y={250} textAnchor="middle" className="text-[9px] fill-muted-foreground">{progress < 0.3 ? "Fe (grey) + S (yellow)" : progress < 0.7 ? "Glowing…" : "FeS (black solid)"}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Progress" value={`${(progress * 100).toFixed(0)}%`} />
        <DataRow label="Color" value={progress < 0.3 ? "Grey + Yellow" : progress < 0.7 ? "Red glow" : "Black"} />
        <DataRow label="Product" value={progress > 0.7 ? "FeS" : "—"} />
        <DataRow label="Mass Before" value="2.00" unit="g" />
        <DataRow label="Mass After" value="2.00" unit="g" />
      </div>}
      analysis={<p className="text-xs font-mono">Fe(s) + S(s) → FeS(s) — Combination (Exothermic)</p>}
    />
  );
}

// Lab 2: Decomposition of CuCO₃
export function DecompositionCuCO3() {
  const [heating, setHeating] = useState(false);
  const [time, setTime] = useState(0);
  const progress = heating ? Math.min(time / 40, 1) : 0;
  const solidColor = `rgb(${34 + (1 - progress) * 100}, ${139 - progress * 100}, ${34 - progress * 34})`;
  const reset = () => { setHeating(false); setTime(0); };

  const steps = [
    "Take a clean test tube and add a small amount of copper carbonate powder.",
    "Attach a delivery tube leading into a test tube containing limewater.",
    "Hold the test tube with a holder.",
    "Heat the copper carbonate strongly with a Bunsen burner.",
    "Observe any change in color of the solid.",
    "Observe bubbles passing through limewater.",
    "Continue heating for a few minutes.",
    "Stop heating and allow the apparatus to cool.",
    "Record the observations.",
  ];

  return (
    <SimulationLayout title="Lab: Decomposition of CuCO₃" objective="Observe thermal decomposition of copper carbonate"
      theory="CuCO₃ → CuO + CO₂. Green copper carbonate decomposes to black CuO. CO₂ turns limewater milky."
      onReset={reset}
      equipment={<div className="space-y-4">
        <button onClick={() => setHeating(true)} className="px-2 py-1 text-xs rounded bg-destructive/80 text-destructive-foreground">{heating ? "🔥 Heating…" : "🔥 Start Heating"}</button>
        {heating && <ControlGroup label="Time" value={time} onChange={setTime} min={0} max={60} step={1} unit="s" />}
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 380 240" className="w-full h-52">
          {/* Test tube 1 */}
          <rect x={60} y={50} width={50} height={120} rx={2} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={65} y={100} width={40} height={65} rx={1} fill={solidColor} opacity={0.8} />
          <text x={85} y={190} textAnchor="middle" className="text-[8px] fill-muted-foreground">{progress > 0.6 ? "CuO (black)" : "CuCO₃ (green)"}</text>
          {/* Delivery tube */}
          <line x1={110} y1={80} x2={200} y2={80} stroke="hsl(var(--border))" strokeWidth={2} />
          <line x1={200} y1={80} x2={200} y2={130} stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Gas bubbles in transit */}
          {progress > 0.2 && Array.from({ length: 3 }, (_, i) => (
            <circle key={i} cx={150 + i * 15} cy={75 - (i % 2) * 5} r={3} fill="hsl(var(--muted-foreground))" opacity={0.4}>
              <animate attributeName="cx" values={`${130};${200}`} dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Limewater test tube */}
          <rect x={180} y={90} width={40} height={100} rx={2} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={185} y={120} width={30} height={65} rx={1} fill={progress > 0.4 ? "rgba(255,255,255,0.8)" : "rgba(200,200,200,0.3)"} />
          <text x={200} y={210} textAnchor="middle" className="text-[8px] fill-muted-foreground">{progress > 0.4 ? "Milky!" : "Limewater"}</text>
          {/* Burner */}
          {heating && <rect x={65} y={175} width={40} height={12} rx={2} fill="#f97316" opacity={0.6} />}
          {/* Equation */}
          <text x={300} y={130} textAnchor="middle" className="text-[9px] fill-foreground font-bold">CuCO₃</text>
          <text x={300} y={145} textAnchor="middle" className="text-[9px] fill-muted-foreground">↓ heat</text>
          <text x={300} y={160} textAnchor="middle" className="text-[9px] fill-foreground font-bold">CuO + CO₂</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Progress" value={`${(progress * 100).toFixed(0)}%`} />
        <DataRow label="Solid Color" value={progress > 0.6 ? "Black" : "Green"} />
        <DataRow label="Limewater" value={progress > 0.4 ? "Milky ✓" : "Clear"} />
        <DataRow label="Gas" value={progress > 0.2 ? "CO₂ detected" : "—"} />
      </div>}
      analysis={<p className="text-xs font-mono">CuCO₃(s) → CuO(s) + CO₂(g) — Thermal Decomposition</p>}
    />
  );
}

// Lab 3: Single Displacement (Fe + CuSO₄)
export function SingleDisplacement() {
  const [time, setTime] = useState(0);
  const progress = Math.min(time / 60, 1);
  const solutionColor = `rgb(${59 + progress * 100}, ${130 - progress * 60}, ${246 - progress * 180})`;
  const reset = () => setTime(0);

  const steps = [
    "Pour about 20 mL of copper(II) sulfate solution into a beaker.",
    "Observe and record the initial blue color.",
    "Clean an iron nail using sandpaper.",
    "Immerse the iron nail into the solution.",
    "Leave it for about 10–15 minutes.",
    "Observe changes in the solution and nail.",
    "Remove the nail carefully.",
    "Record all observations.",
  ];

  return (
    <SimulationLayout title="Lab: Single Displacement (Fe + CuSO₄)" objective="Demonstrate displacement reaction"
      theory="Fe + CuSO₄ → FeSO₄ + Cu. Iron is more reactive than copper in the reactivity series."
      onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Reaction Time" value={time} onChange={setTime} min={0} max={120} step={5} unit="s" />
        <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
          <p className="font-semibold">Reactivity Series:</p>
          <p>K &gt; Na &gt; Ca &gt; Mg &gt; Al &gt; <span className="text-primary font-bold">Zn &gt; Fe</span> &gt; Cu &gt; Ag</p>
        </div>
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          <rect x={80} y={50} width={140} height={150} fill="none" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <rect x={85} y={80} width={130} height={115} fill={solutionColor} opacity={0.6} rx={2} />
          <rect x={140} y={40} width={20} height={130} fill="#6b7280" rx={2} />
          {progress > 0.1 && Array.from({ length: Math.floor(progress * 10) }, (_, i) => (
            <circle key={i} cx={145 + (i % 3) * 5} cy={160 - i * 3} r={2} fill="#b45309" />
          ))}
          <text x={150} y={220} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{progress < 0.5 ? "Blue Solution" : "Green Solution"}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Time" value={time} unit="s" />
        <DataRow label="Progress" value={`${(progress * 100).toFixed(0)}%`} />
        <DataRow label="Cu Deposited" value={(progress * 100).toFixed(0)} unit="%" />
        <DataRow label="Solution" value={progress < 0.3 ? "Blue" : progress < 0.7 ? "Blue-Green" : "Green"} />
      </div>}
      analysis={<p className="text-xs font-mono">Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)</p>}
    />
  );
}

// Lab 4: Double Displacement
export function DoubleDisplacement() {
  const [mixed, setMixed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [showIonic, setShowIonic] = useState<"molecular" | "full" | "net">("molecular");
  const reset = () => { setMixed(false); setSettled(false); };

  const steps = [
    "Take two clean test tubes.",
    "Add 10 mL sodium sulfate solution to one test tube.",
    "Add 10 mL barium nitrate solution to the other.",
    "Pour both solutions into a clean beaker.",
    "Stir the mixture using a glass rod.",
    "Observe the formation of a solid.",
    "Allow the precipitate to settle.",
    "Record observations.",
  ];

  const equations: Record<string, string> = {
    molecular: "Na₂SO₄(aq) + Ba(NO₃)₂(aq) → BaSO₄(s) + 2NaNO₃(aq)",
    full: "2Na⁺ + SO₄²⁻ + Ba²⁺ + 2NO₃⁻ → BaSO₄↓ + 2Na⁺ + 2NO₃⁻",
    net: "Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)↓",
  };

  return (
    <SimulationLayout title="Lab: Double Displacement Reaction" objective="Observe formation of a precipitate"
      theory="When two ionic compounds in solution exchange ions, an insoluble precipitate may form (BaSO₄)."
      onReset={reset}
      equipment={<div className="space-y-4">
        <button onClick={() => setMixed(true)} className="px-2 py-1 text-xs rounded bg-primary/80 text-primary-foreground w-full" disabled={mixed}>
          {mixed ? "✓ Mixed" : "Mix Solutions"}
        </button>
        {mixed && <button onClick={() => setSettled(true)} className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground w-full" disabled={settled}>
          {settled ? "✓ Settled" : "Let Settle"}
        </button>}
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-semibold">Equation View:</p>
          {(["molecular", "full", "net"] as const).map(t => (
            <label key={t} className="flex items-center gap-1 text-[10px] cursor-pointer">
              <input type="radio" name="eq" checked={showIonic === t} onChange={() => setShowIonic(t)} />
              {t === "molecular" ? "Molecular" : t === "full" ? "Full Ionic" : "Net Ionic"}
            </label>
          ))}
        </div>
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 340 240" className="w-full h-52">
          {!mixed ? <>
            {/* Two separate test tubes */}
            <rect x={80} y={50} width={50} height={120} rx={2} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
            <rect x={85} y={90} width={40} height={75} fill="hsl(var(--primary) / 0.2)" rx={1} />
            <text x={105} y={185} textAnchor="middle" className="text-[8px] fill-muted-foreground">Na₂SO₄</text>
            <rect x={200} y={50} width={50} height={120} rx={2} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
            <rect x={205} y={90} width={40} height={75} fill="hsl(var(--accent) / 0.3)" rx={1} />
            <text x={225} y={185} textAnchor="middle" className="text-[8px] fill-muted-foreground">Ba(NO₃)₂</text>
          </> : <>
            {/* Mixed beaker */}
            <rect x={110} y={40} width={120} height={140} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
            <rect x={115} y={70} width={110} height={105} fill="hsl(var(--muted))" opacity={0.4} rx={2} />
            {settled && <rect x={115} y={150} width={110} height={25} fill="white" opacity={0.7} rx={1} />}
            {!settled && Array.from({ length: 8 }, (_, i) => (
              <circle key={i} cx={130 + (i % 4) * 25} cy={100 + Math.floor(i / 4) * 30} r={3} fill="white" opacity={0.6}>
                <animate attributeName="cy" values={`${90 + i * 5};${150};${90 + i * 5}`} dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
              </circle>
            ))}
            <text x={170} y={200} textAnchor="middle" className="text-[9px] fill-foreground font-bold">{settled ? "White precipitate settled" : "Precipitate forming…"}</text>
          </>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Status" value={!mixed ? "Separate" : settled ? "Settled" : "Reacting"} />
        <DataRow label="Precipitate" value={mixed ? "BaSO₄ (white)" : "—"} />
        <DataRow label="Filtrate" value={mixed ? "NaNO₃ (clear)" : "—"} />
      </div>}
      analysis={<p className="text-xs font-mono break-all">{equations[showIonic]}</p>}
    />
  );
}

// ========== UNIT 2: Solutions ==========

// Lab 5: Preparation of Standard Solution
export function StandardSolution() {
  const [targetMass, setTargetMass] = useState(10);
  const [measuredMass, setMeasuredMass] = useState(0);
  const [waterLevel, setWaterLevel] = useState(0);
  const volumeTarget = 250;
  const concentration = volumeTarget > 0 && measuredMass > 0 ? (measuredMass / 58.44) / (waterLevel / 1000) : 0;
  const massError = Math.abs(measuredMass - targetMass);
  const volError = Math.abs(waterLevel - volumeTarget);
  const reset = () => { setMeasuredMass(0); setWaterLevel(0); };

  const steps = [
    "Weigh the required mass of solute using a balance.",
    "Transfer the solute into a beaker.",
    "Add a small amount of distilled water.",
    "Stir until the solute dissolves completely.",
    "Place a funnel in a volumetric flask.",
    "Pour the solution carefully into the flask.",
    "Add distilled water up to the calibration mark.",
    "Stopper the flask and shake gently.",
    "Label the prepared solution.",
  ];

  return (
    <SimulationLayout title="Lab: Standard Solution Preparation" objective="Prepare a solution of known concentration"
      theory="Concentration (mol/L) = moles of solute / volume of solution in litres. A standard solution has a precisely known concentration."
      onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Target Mass (NaCl)" value={targetMass} onChange={setTargetMass} min={5} max={30} step={0.1} unit="g" />
        <ControlGroup label="Measured Mass" value={measuredMass} onChange={setMeasuredMass} min={0} max={40} step={0.1} unit="g" />
        <ControlGroup label="Water Volume" value={waterLevel} onChange={setWaterLevel} min={0} max={300} step={5} unit="mL" />
        {massError > 2 && <p className="text-[10px] text-destructive">⚠️ Mass differs from target by {massError.toFixed(1)}g</p>}
        {waterLevel > 0 && volError > 10 && <p className="text-[10px] text-destructive">⚠️ Volume off by {volError.toFixed(0)}mL</p>}
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          <path d="M110,30 L90,200 L210,200 L190,30 Z" fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          {waterLevel > 0 && <path d={`M${92 + (1 - waterLevel / 300) * 10},${200 - waterLevel / 300 * 160} L90,200 L210,200 L${208 - (1 - waterLevel / 300) * 10},${200 - waterLevel / 300 * 160} Z`} fill="hsl(var(--primary) / 0.3)" />}
          <line x1={85} y1={200 - 250 / 300 * 160} x2={215} y2={200 - 250 / 300 * 160} stroke="hsl(var(--accent))" strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={220} y={200 - 250 / 300 * 160 + 3} className="text-[7px] fill-accent">250 mL</text>
          <text x={150} y={230} textAnchor="middle" className="text-[9px] fill-muted-foreground">Volumetric Flask</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Target Mass" value={targetMass.toFixed(1)} unit="g" />
        <DataRow label="Measured" value={measuredMass.toFixed(1)} unit="g" />
        <DataRow label="Volume" value={waterLevel} unit="mL" />
        <DataRow label="Concentration" value={isFinite(concentration) && concentration > 0 ? concentration.toFixed(4) : "—"} unit="mol/L" />
      </div>}
    />
  );
}

// Lab 6: Dilution
export function DilutionLab() {
  const [m1, setM1] = useState(1.0);
  const [v1, setV1] = useState(10);
  const [v2, setV2] = useState(100);
  const m2 = (m1 * v1) / v2;
  const reset = () => { setM1(1.0); setV1(10); setV2(100); };

  const steps = [
    "Take a pipette and pipette filler.",
    "Measure a known volume of stock solution.",
    "Transfer it into a volumetric flask.",
    "Add distilled water slowly.",
    "Fill the flask until the calibration mark.",
    "Stopper and shake the flask.",
    "Record the final concentration.",
  ];

  const gradientPct = Math.min(v1 / v2, 1);

  return (
    <SimulationLayout title="Lab: Dilution of a Solution" objective="Prepare a dilute solution from a concentrated one"
      theory="M₁V₁ = M₂V₂. When you dilute, the amount of solute stays constant but the concentration decreases."
      onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Stock Conc. (M₁)" value={m1} onChange={setM1} min={0.1} max={5} step={0.1} unit="M" />
        <ControlGroup label="Volume Taken (V₁)" value={v1} onChange={setV1} min={1} max={50} step={1} unit="mL" />
        <ControlGroup label="Final Volume (V₂)" value={v2} onChange={setV2} min={50} max={500} step={10} unit="mL" />
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 320 220" className="w-full h-48">
          {/* Stock bottle */}
          <rect x={40} y={50} width={50} height={80} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={45} y={70} width={40} height={55} fill="hsl(var(--primary))" opacity={0.7} rx={2} />
          <text x={65} y={150} textAnchor="middle" className="text-[8px] fill-muted-foreground">Stock ({m1}M)</text>
          {/* Arrow */}
          <line x1={100} y1={90} x2={140} y2={90} stroke="hsl(var(--muted-foreground))" strokeWidth={1} markerEnd="url(#arr)" />
          <defs><marker id="arr" markerWidth={6} markerHeight={4} refX={6} refY={2} orient="auto"><path d="M0,0 L6,2 L0,4" fill="hsl(var(--muted-foreground))" /></marker></defs>
          {/* Flask */}
          <path d="M170,40 L155,170 L245,170 L230,40 Z" fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={158} y={100} width={84} height={65} fill={`hsl(var(--primary) / ${0.15 + gradientPct * 0.6})`} rx={2} />
          <text x={200} y={190} textAnchor="middle" className="text-[8px] fill-muted-foreground">Diluted ({m2.toFixed(4)}M)</text>
          {/* Formula */}
          <text x={200} y={25} textAnchor="middle" className="text-[10px] fill-foreground font-bold">M₁V₁ = M₂V₂</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="M₁ (Stock)" value={m1.toFixed(2)} unit="M" />
        <DataRow label="V₁ (Taken)" value={v1} unit="mL" />
        <DataRow label="V₂ (Final)" value={v2} unit="mL" />
        <DataRow label="M₂ (Diluted)" value={m2.toFixed(4)} unit="M" />
      </div>}
      analysis={<p className="text-xs font-mono">{m1}×{v1} = {m2.toFixed(4)}×{v2} → M₂ = {m2.toFixed(4)} M</p>}
    />
  );
}

// Lab 7 (Solubility vs Temperature) - combined with solutions
export function SolubilityTemp() {
  const [temp, setTemp] = useState(25);
  const [spoonsAdded, setSpoonsAdded] = useState(0);
  const maxSolubility = 30 + temp * 0.5; // g per 100mL simplified
  const dissolved = Math.min(spoonsAdded * 5, maxSolubility);
  const saturated = spoonsAdded * 5 >= maxSolubility;
  const reset = () => { setTemp(25); setSpoonsAdded(0); };

  const steps = [
    "Place a beaker of water on the workspace.",
    "Set the temperature using the slider.",
    "Add solute powder using the spoon tool.",
    "Stir the mixture using the stirring rod.",
    "Observe the particles dissolving.",
    "Continue adding solute gradually.",
    "Watch the saturation indicator.",
    "Increase temperature to observe faster dissolving.",
    "Record concentration values at different temperatures.",
  ];

  return (
    <SimulationLayout title="Lab: Solubility vs Temperature" objective="Observe how temperature affects solubility"
      theory="Solubility of most solids increases with temperature. A saturated solution contains the maximum dissolved solute at a given temperature."
      onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={0} max={100} step={5} unit="°C" />
        <ControlGroup label="Spoons Added" value={spoonsAdded} onChange={setSpoonsAdded} min={0} max={30} step={1} />
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 340 240" className="w-full h-52">
          {/* Beaker */}
          <rect x={100} y={50} width={120} height={130} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={105} y={80} width={110} height={95} fill="hsl(var(--primary) / 0.2)" rx={2} />
          {/* Dissolved particles */}
          {Array.from({ length: Math.min(Math.floor(dissolved / 3), 12) }, (_, i) => (
            <circle key={i} cx={120 + (i % 4) * 25} cy={100 + Math.floor(i / 4) * 20} r={2} fill="hsl(var(--primary))" opacity={0.5}>
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Undissolved crystals at bottom */}
          {saturated && Array.from({ length: Math.floor((spoonsAdded * 5 - maxSolubility) / 3) }, (_, i) => (
            <rect key={`c${i}`} x={115 + i * 12} y={165} width={6} height={6} fill="hsl(var(--foreground))" opacity={0.6} rx={1} />
          ))}
          {/* Thermometer */}
          <rect x={240} y={60} width={10} height={100} rx={5} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} />
          <rect x={242} y={160 - temp} width={6} height={temp} fill="#ef4444" rx={3} />
          <text x={245} y={175} textAnchor="middle" className="text-[8px] fill-muted-foreground">{temp}°C</text>
          {/* Saturation bar */}
          <rect x={270} y={60} width={15} height={100} rx={2} fill="hsl(var(--muted))" />
          <rect x={272} y={160 - (dissolved / maxSolubility) * 96} width={11} height={(dissolved / maxSolubility) * 96} fill={saturated ? "#ef4444" : "hsl(var(--primary))"} rx={1} />
          <text x={278} y={175} textAnchor="middle" className="text-[7px] fill-muted-foreground">{saturated ? "SAT" : `${(dissolved / maxSolubility * 100).toFixed(0)}%`}</text>
          <text x={160} y={210} textAnchor="middle" className="text-[9px] fill-foreground">{saturated ? "⚠️ Saturated! Crystals forming" : "Dissolving…"}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Temperature" value={temp} unit="°C" />
        <DataRow label="Max Solubility" value={maxSolubility.toFixed(0)} unit="g/100mL" />
        <DataRow label="Dissolved" value={dissolved.toFixed(0)} unit="g" />
        <DataRow label="Status" value={saturated ? "Saturated" : "Unsaturated"} />
      </div>}
    />
  );
}

// ========== UNIT 3: Acids, Bases & Salts ==========

// Lab 8: pH & Indicators (renamed from PHIndicators)
export function PHIndicators() {
  const [solution, setSolution] = useState("water");
  const pHValues: Record<string, number> = { "hcl": 1, "vinegar": 3, "water": 7, "baking_soda": 9, "naoh": 13 };
  const solutionNames: Record<string, string> = { "hcl": "HCl (Strong Acid)", "vinegar": "Vinegar (Weak Acid)", "water": "Water (Neutral)", "baking_soda": "Baking Soda (Weak Base)", "naoh": "NaOH (Strong Base)" };
  const pH = pHValues[solution];
  const litmusColor = pH < 7 ? "#ef4444" : pH === 7 ? "#a855f7" : "#3b82f6";
  const universalColor = pH <= 2 ? "#ef4444" : pH <= 4 ? "#f97316" : pH <= 6 ? "#eab308" : pH <= 8 ? "#22c55e" : pH <= 10 ? "#06b6d4" : pH <= 12 ? "#3b82f6" : "#6d28d9";
  const reset = () => setSolution("water");

  const steps = [
    "Take small samples of different solutions in separate test tubes.",
    "Dip red and blue litmus papers into each solution.",
    "Observe color changes.",
    "Add a few drops of universal indicator.",
    "Compare the color with the pH chart.",
    "Record the pH value of each solution.",
  ];

  return (
    <SimulationLayout title="Lab: pH & Indicators" objective="Determine acidity or alkalinity using indicators and pH meter"
      theory="pH measures hydrogen ion concentration on a 0-14 scale. Acids have pH < 7, bases have pH > 7. Indicators change color at specific pH ranges."
      onReset={reset}
      equipment={<div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Select Solution:</p>
        {Object.entries(solutionNames).map(([key, name]) => (
          <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="radio" name="solution" checked={solution === key} onChange={() => setSolution(key)} />
            {name}
          </label>
        ))}
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          {/* Litmus */}
          <rect x={40} y={50} width={60} height={90} fill={litmusColor} opacity={0.6} stroke="hsl(var(--border))" strokeWidth={1} rx={4} />
          <text x={70} y={160} textAnchor="middle" className="text-[9px] fill-foreground">Litmus</text>
          {/* Universal */}
          <rect x={140} y={50} width={60} height={90} fill={universalColor} opacity={0.6} stroke="hsl(var(--border))" strokeWidth={1} rx={4} />
          <text x={170} y={160} textAnchor="middle" className="text-[9px] fill-foreground">Universal</text>
          {/* pH Meter */}
          <rect x={240} y={50} width={60} height={90} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          <text x={270} y={105} textAnchor="middle" className="text-[18px] fill-foreground font-bold">{pH}</text>
          <text x={270} y={160} textAnchor="middle" className="text-[9px] fill-foreground">pH Meter</text>
          {/* pH scale bar */}
          {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(p => {
            const c = p <= 2 ? "#ef4444" : p <= 4 ? "#f97316" : p <= 6 ? "#eab308" : p <= 8 ? "#22c55e" : p <= 10 ? "#06b6d4" : p <= 12 ? "#3b82f6" : "#6d28d9";
            return <rect key={p} x={30 + p * 22} y={190} width={20} height={12} fill={c} opacity={pH === p ? 1 : 0.3} rx={1} />;
          })}
          <text x={200} y={215} textAnchor="middle" className="text-[8px] fill-muted-foreground">pH Scale: 0 ————— 7 ————— 14</text>
          <text x={200} y={30} textAnchor="middle" className="text-[11px] fill-foreground font-bold">{solutionNames[solution]}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Solution" value={solutionNames[solution]} />
        <DataRow label="pH" value={pH} />
        <DataRow label="Type" value={pH < 7 ? "Acidic" : pH === 7 ? "Neutral" : "Basic"} />
        <DataRow label="Litmus" value={pH < 7 ? "Red" : pH === 7 ? "Purple" : "Blue"} />
      </div>}
    />
  );
}

// Lab 9: Acid + Metal (Hydrogen gas)
export function AcidMetalReaction() {
  const [metal, setMetal] = useState("zinc");
  const [acidAdded, setAcidAdded] = useState(false);
  const [time, setTime] = useState(0);
  const reactivity: Record<string, number> = { magnesium: 3, zinc: 2, iron: 1, copper: 0 };
  const rate = reactivity[metal];
  const progress = acidAdded ? Math.min(time * rate / 60, 1) : 0;
  const gasCollected = progress * 100;
  const reset = () => { setAcidAdded(false); setTime(0); };

  const steps = [
    "Place a few zinc granules in a test tube.",
    "Add about 5 mL dilute hydrochloric acid.",
    "Immediately cover the test tube with a stopper fitted with a delivery tube.",
    "Allow the gas produced to collect in another test tube.",
    "Bring a burning splint near the gas.",
    "Listen for the pop sound.",
    "Record observations.",
  ];

  return (
    <SimulationLayout title="Lab: Acid + Metal → Hydrogen Gas" objective="Observe hydrogen gas production from metal-acid reaction"
      theory="Reactive metals displace hydrogen from acids: Metal + HCl → Metal Chloride + H₂. Hydrogen produces a 'pop' sound with a burning splint."
      onReset={reset}
      equipment={<div className="space-y-4">
        <p className="text-xs font-semibold text-muted-foreground">Select Metal:</p>
        {["magnesium", "zinc", "iron", "copper"].map(m => (
          <label key={m} className="flex items-center gap-2 text-xs cursor-pointer capitalize">
            <input type="radio" name="metal" checked={metal === m} onChange={() => { setMetal(m); setAcidAdded(false); setTime(0); }} />
            {m}
          </label>
        ))}
        <button onClick={() => setAcidAdded(true)} className="px-2 py-1 text-xs rounded bg-primary/80 text-primary-foreground w-full" disabled={acidAdded}>
          {acidAdded ? "✓ Acid Added" : "Add HCl"}
        </button>
        {acidAdded && <ControlGroup label="Time" value={time} onChange={setTime} min={0} max={60} step={1} unit="s" />}
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 340 240" className="w-full h-52">
          {/* Beaker with acid */}
          <rect x={80} y={60} width={80} height={120} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={85} y={90} width={70} height={85} fill="hsl(var(--primary) / 0.15)" rx={2} />
          {/* Metal piece */}
          <rect x={105} y={130} width={30} height={20} fill="#9ca3af" rx={2} />
          <text x={120} y={145} textAnchor="middle" className="text-[7px] fill-background font-bold capitalize">{metal.slice(0, 2)}</text>
          {/* Bubbles */}
          {acidAdded && rate > 0 && Array.from({ length: Math.floor(rate * 4) }, (_, i) => (
            <circle key={i} cx={110 + i * 10} cy={120} r={2 + rate} fill="hsl(var(--muted-foreground))" opacity={0.3}>
              <animate attributeName="cy" values="130;80" dur={`${0.8 / rate + i * 0.1}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Gas collection tube */}
          <rect x={220} y={40} width={40} height={120} rx={2} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          {gasCollected > 0 && <rect x={225} y={155 - gasCollected * 1.1} width={30} height={gasCollected * 1.1} fill="hsl(var(--muted-foreground) / 0.2)" rx={1} />}
          <text x={240} y={175} textAnchor="middle" className="text-[8px] fill-muted-foreground">H₂ Gas</text>
          {/* Pop test */}
          {gasCollected > 80 && <text x={240} y={30} textAnchor="middle" className="text-[10px] fill-destructive font-bold">💥 Pop!</text>}
          {/* No reaction indicator */}
          {acidAdded && rate === 0 && <text x={170} y={210} textAnchor="middle" className="text-[10px] fill-destructive">No reaction — Cu is below H in reactivity series</text>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Metal" value={metal} />
        <DataRow label="Reactivity" value={rate === 0 ? "None" : rate === 1 ? "Low" : rate === 2 ? "Medium" : "High"} />
        <DataRow label="Gas Collected" value={gasCollected.toFixed(0)} unit="%" />
        <DataRow label="Pop Test" value={gasCollected > 80 ? "✓ Pop sound" : "—"} />
      </div>}
      analysis={rate > 0 ? <p className="text-xs font-mono capitalize">{metal}(s) + 2HCl(aq) → {metal}Cl₂(aq) + H₂(g)</p> : <p className="text-xs text-destructive">Copper does not react with dilute HCl.</p>}
    />
  );
}

// Lab 10: Acid-Base Titration
export function AcidBaseTitration() {
  const [volumeAdded, setVolumeAdded] = useState(0);
  const equivalenceVol = 25;
  const pH = volumeAdded < equivalenceVol ? 2 + (volumeAdded / equivalenceVol) * 5 : volumeAdded === equivalenceVol ? 7 : 7 + Math.min((volumeAdded - equivalenceVol) / 10, 6);
  const indicatorColor = pH < 4.4 ? "#ef4444" : pH < 8.2 ? "#f97316" : "#ec4899";
  const reset = () => setVolumeAdded(0);

  const steps = [
    "Rinse the burette with the base solution.",
    "Fill the burette and record the initial reading.",
    "Pipette a measured volume of acid into a conical flask.",
    "Add a few drops of indicator (phenolphthalein).",
    "Place the flask under the burette.",
    "Slowly release the base from the burette.",
    "Swirl the flask continuously.",
    "Stop adding base when the endpoint color appears.",
    "Record the final burette reading.",
    "Calculate the concentration.",
  ];

  return (
    <SimulationLayout title="Lab: Acid-Base Titration" objective="Determine concentration of an acid by neutralization"
      theory="At the equivalence point, moles of acid = moles of base. Phenolphthalein turns pink above pH 8.2."
      onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="NaOH Added" value={volumeAdded} onChange={setVolumeAdded} min={0} max={50} step={0.5} unit="mL" />
        <div className="text-xs text-muted-foreground">
          <p>Burette: NaOH (0.1 M)</p>
          <p>Flask: HCl + Phenolphthalein</p>
        </div>
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          {/* Burette */}
          <rect x={190} y={10} width={20} height={120} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={2} />
          <rect x={192} y={10 + (volumeAdded / 50) * 110} width={16} height={110 - (volumeAdded / 50) * 110} fill="hsl(var(--primary) / 0.4)" />
          <text x={175} y={75} textAnchor="end" className="text-[8px] fill-muted-foreground">Burette</text>
          {/* Flask */}
          <path d="M160,160 L140,230 L260,230 L240,160 Z" fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <path d="M142,225 L258,225 L245,180 L155,180 Z" fill={indicatorColor} opacity={0.5} />
          <text x={200} y={210} textAnchor="middle" className="text-[10px] fill-foreground font-bold">pH: {pH.toFixed(1)}</text>
          {/* pH scale */}
          <line x1={320} y1={20} x2={320} y2={230} stroke="hsl(var(--border))" strokeWidth={1} />
          {[0, 2, 4, 7, 10, 14].map(p => (
            <g key={p}><circle cx={320} cy={230 - (p / 14) * 210} r={2} fill={p < 7 ? "#ef4444" : p === 7 ? "#22c55e" : "#3b82f6"} />
            <text x={330} y={233 - (p / 14) * 210} className="text-[7px] fill-muted-foreground">{p}</text></g>
          ))}
          <circle cx={320} cy={230 - (pH / 14) * 210} r={4} fill="hsl(var(--accent))" />
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Volume Added" value={volumeAdded.toFixed(1)} unit="mL" />
        <DataRow label="pH" value={pH.toFixed(1)} />
        <DataRow label="Endpoint" value={Math.abs(volumeAdded - equivalenceVol) < 1 ? "At endpoint! 🎯" : volumeAdded < equivalenceVol ? "Before" : "Past"} />
        <DataRow label="Indicator" value={pH < 8.2 ? "Colorless" : "Pink"} />
      </div>}
      analysis={<p className="text-xs font-mono">HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)</p>}
    />
  );
}

// ========== UNIT 4: Energy & Electrochemistry ==========

// Lab 11: Exothermic vs Endothermic
export function ExoEndothermic() {
  const [substance, setSubstance] = useState<"cao" | "nh4no3">("cao");
  const [time, setTime] = useState(0);
  const isExo = substance === "cao";
  const initialTemp = 25;
  const tempChange = isExo ? Math.min(time * 1.5, 40) : -Math.min(time * 1.2, 20);
  const currentTemp = initialTemp + tempChange;
  const reset = () => setTime(0);

  const steps = [
    "Measure the initial temperature of water in a beaker.",
    "Add a chemical substance (CaO for exothermic, NH₄NO₃ for endothermic).",
    "Stir the mixture gently.",
    "Observe the temperature change using a thermometer.",
    "Record the final temperature.",
    "Identify whether the reaction absorbed or released heat.",
  ];

  return (
    <SimulationLayout title="Lab: Exothermic vs Endothermic Reactions" objective="Compare reactions that release vs absorb heat"
      theory="Exothermic reactions release energy (ΔH < 0, temperature rises). Endothermic reactions absorb energy (ΔH > 0, temperature drops)."
      onReset={reset}
      equipment={<div className="space-y-4">
        <p className="text-xs font-semibold text-muted-foreground">Substance:</p>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="radio" name="sub" checked={substance === "cao"} onChange={() => { setSubstance("cao"); setTime(0); }} />
          CaO (Exothermic)
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="radio" name="sub" checked={substance === "nh4no3"} onChange={() => { setSubstance("nh4no3"); setTime(0); }} />
          NH₄NO₃ (Endothermic)
        </label>
        <ControlGroup label="Time" value={time} onChange={setTime} min={0} max={30} step={1} unit="s" />
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 320 230" className="w-full h-48">
          {/* Beaker */}
          <rect x={100} y={50} width={100} height={120} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={105} y={80} width={90} height={85} fill="hsl(var(--primary) / 0.2)" rx={2} />
          {/* Thermometer */}
          <rect x={220} y={40} width={12} height={120} rx={6} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} />
          <rect x={222} y={155 - Math.max(currentTemp, 0)} width={8} height={Math.max(currentTemp, 5)} fill={isExo ? "#ef4444" : "#3b82f6"} rx={3} />
          <text x={226} y={175} textAnchor="middle" className="text-[8px] fill-foreground font-bold">{currentTemp.toFixed(1)}°C</text>
          {/* Heat arrows */}
          {time > 0 && isExo && <>
            <text x={150} y={45} textAnchor="middle" className="text-[12px]">↑🔥↑</text>
          </>}
          {time > 0 && !isExo && <>
            <text x={150} y={190} textAnchor="middle" className="text-[12px]">↓❄️↓</text>
          </>}
          {/* Label */}
          <text x={150} y={210} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{isExo ? "Exothermic — Heat Released" : "Endothermic — Heat Absorbed"}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Initial Temp" value={initialTemp} unit="°C" />
        <DataRow label="Current Temp" value={currentTemp.toFixed(1)} unit="°C" />
        <DataRow label="ΔT" value={tempChange.toFixed(1)} unit="°C" />
        <DataRow label="Type" value={isExo ? "Exothermic" : "Endothermic"} />
      </div>}
    />
  );
}

// Lab 12: Electrochemical Cell (Zn-Cu)
export function ElectrochemicalCell() {
  const [connected, setConnected] = useState(false);
  const [time, setTime] = useState(0);
  const voltage = connected ? 1.10 : 0;
  const znLoss = connected ? Math.min(time * 0.5, 15) : 0;
  const cuGain = connected ? Math.min(time * 0.4, 12) : 0;
  const reset = () => { setConnected(false); setTime(0); };

  const steps = [
    "Prepare two solutions: ZnSO₄ and CuSO₄.",
    "Insert a zinc electrode into ZnSO₄ solution.",
    "Insert a copper electrode into CuSO₄ solution.",
    "Connect the two solutions using a salt bridge.",
    "Connect the electrodes to a voltmeter using wires.",
    "Observe the voltage reading.",
    "Record electron flow direction.",
  ];

  return (
    <SimulationLayout title="Lab: Electrochemical Cell (Zn-Cu)" objective="Build a galvanic cell and measure voltage"
      theory="Zn is oxidized (loses e⁻) at the anode. Cu²⁺ is reduced (gains e⁻) at the cathode. E°cell = 1.10V."
      onReset={reset}
      equipment={<div className="space-y-4">
        <button onClick={() => setConnected(!connected)} className={`px-2 py-1 text-xs rounded w-full ${connected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {connected ? "⚡ Connected" : "Connect Circuit"}
        </button>
        {connected && <ControlGroup label="Time" value={time} onChange={setTime} min={0} max={30} step={1} unit="s" />}
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 380 240" className="w-full h-52">
          {/* Zn half-cell */}
          <rect x={30} y={80} width={80} height={100} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={35} y={100} width={70} height={75} fill="hsl(var(--muted))" opacity={0.3} rx={2} />
          <rect x={60} y={65} width={20} height={90 - znLoss} fill="#9ca3af" rx={2} />
          <text x={70} y={200} textAnchor="middle" className="text-[8px] fill-muted-foreground">Zn | ZnSO₄</text>
          <text x={70} y={60} textAnchor="middle" className="text-[8px] fill-destructive font-bold">Anode (−)</text>
          {/* Cu half-cell */}
          <rect x={260} y={80} width={80} height={100} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={265} y={100} width={70} height={75} fill="hsl(var(--primary) / 0.2)" rx={2} />
          <rect x={290} y={65} width={20} height={70 + cuGain} fill="#b45309" rx={2} />
          <text x={300} y={200} textAnchor="middle" className="text-[8px] fill-muted-foreground">Cu | CuSO₄</text>
          <text x={300} y={60} textAnchor="middle" className="text-[8px] fill-primary font-bold">Cathode (+)</text>
          {/* Salt bridge */}
          <path d="M110,120 Q185,90 260,120" fill="none" stroke="hsl(var(--accent))" strokeWidth={3} strokeDasharray="4,4" />
          <text x={185} y={100} textAnchor="middle" className="text-[8px] fill-accent">Salt Bridge</text>
          {/* Wire + voltmeter */}
          {connected && <>
            <line x1={70} y1={65} x2={185} y2={30} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
            <line x1={300} y1={65} x2={185} y2={30} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
            <circle cx={185} cy={30} r={18} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} />
            <text x={185} y={35} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{voltage.toFixed(2)}V</text>
            {/* Electron flow arrows */}
            <text x={130} y={55} textAnchor="middle" className="text-[8px] fill-muted-foreground">e⁻ →</text>
            <text x={240} y={55} textAnchor="middle" className="text-[8px] fill-muted-foreground">→ e⁻</text>
          </>}
          <text x={185} y={230} textAnchor="middle" className="text-[9px] fill-foreground">{connected ? "Zn → Zn²⁺ + 2e⁻ | Cu²⁺ + 2e⁻ → Cu" : "Connect circuit to start"}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Voltage" value={voltage.toFixed(2)} unit="V" />
        <DataRow label="Zn lost" value={znLoss.toFixed(1)} unit="%" />
        <DataRow label="Cu gained" value={cuGain.toFixed(1)} unit="%" />
        <DataRow label="e⁻ flow" value={connected ? "Zn → Cu" : "—"} />
      </div>}
      analysis={connected ? <p className="text-xs font-mono">Oxidation: Zn → Zn²⁺ + 2e⁻ | Reduction: Cu²⁺ + 2e⁻ → Cu</p> : null}
    />
  );
}

// Lab 13: Electrolysis of Water
export function ElectrolysisWater() {
  const [voltage, setVoltage] = useState(0);
  const [time, setTime] = useState(0);
  const isRunning = voltage >= 2;
  const h2 = isRunning ? Math.min(time * 2, 100) : 0;
  const o2 = isRunning ? Math.min(time, 50) : 0;
  const reset = () => { setVoltage(0); setTime(0); };

  const steps = [
    "Set up the electrolysis apparatus with two electrodes.",
    "Fill the container with water and add a few drops of electrolyte.",
    "Connect the electrodes to the power supply.",
    "Increase voltage to at least 2V.",
    "Observe gas bubbles at both electrodes.",
    "Note the 2:1 ratio of hydrogen to oxygen gas.",
    "Record observations.",
  ];

  return (
    <SimulationLayout title="Lab: Electrolysis of Water" objective="Decompose water into hydrogen and oxygen using electricity"
      theory="2H₂O → 2H₂ + O₂. Hydrogen forms at the cathode (2x volume), oxygen at the anode. Minimum ~1.23V required."
      onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Voltage" value={voltage} onChange={setVoltage} min={0} max={12} step={0.5} unit="V" />
        {isRunning && <ControlGroup label="Time" value={time} onChange={setTime} min={0} max={60} step={1} unit="s" />}
        {voltage > 0 && voltage < 2 && <p className="text-[10px] text-destructive">⚠️ Need ≥2V for electrolysis</p>}
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 340 230" className="w-full h-48">
          {/* Water container */}
          <rect x={70} y={40} width={200} height={140} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={75} y={70} width={190} height={105} fill="hsl(var(--primary) / 0.15)" rx={2} />
          {/* H₂ tube (cathode, left) */}
          <rect x={100} y={30} width={40} height={110} rx={2} fill="none" stroke="hsl(var(--border))" strokeWidth={1.5} />
          {h2 > 0 && <rect x={103} y={137 - h2} width={34} height={h2} fill="hsl(var(--muted-foreground) / 0.15)" rx={1} />}
          <text x={120} y={25} textAnchor="middle" className="text-[9px] fill-foreground font-bold">H₂</text>
          <text x={120} y={155} textAnchor="middle" className="text-[7px] fill-muted-foreground">(−) Cathode</text>
          {/* O₂ tube (anode, right) */}
          <rect x={200} y={30} width={40} height={110} rx={2} fill="none" stroke="hsl(var(--border))" strokeWidth={1.5} />
          {o2 > 0 && <rect x={203} y={137 - o2} width={34} height={o2} fill="hsl(var(--muted-foreground) / 0.15)" rx={1} />}
          <text x={220} y={25} textAnchor="middle" className="text-[9px] fill-foreground font-bold">O₂</text>
          <text x={220} y={155} textAnchor="middle" className="text-[7px] fill-muted-foreground">(+) Anode</text>
          {/* Bubbles */}
          {isRunning && <>
            {Array.from({ length: 4 }, (_, i) => (
              <circle key={`h${i}`} cx={115 + i * 5} cy={120} r={2} fill="hsl(var(--muted-foreground))" opacity={0.3}>
                <animate attributeName="cy" values="130;60" dur={`${0.6 + i * 0.15}s`} repeatCount="indefinite" />
              </circle>
            ))}
            {Array.from({ length: 2 }, (_, i) => (
              <circle key={`o${i}`} cx={215 + i * 5} cy={120} r={2} fill="hsl(var(--muted-foreground))" opacity={0.3}>
                <animate attributeName="cy" values="130;70" dur={`${0.9 + i * 0.2}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </>}
          {/* Ratio label */}
          <text x={170} y={200} textAnchor="middle" className="text-[10px] fill-foreground font-bold">H₂ : O₂ = 2 : 1</text>
          {/* Power supply */}
          <rect x={130} y={185} width={80} height={25} rx={4} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={170} y={202} textAnchor="middle" className="text-[9px] fill-foreground">{voltage}V ⚡</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Voltage" value={voltage} unit="V" />
        <DataRow label="H₂ collected" value={h2.toFixed(0)} unit="%" />
        <DataRow label="O₂ collected" value={o2.toFixed(0)} unit="%" />
        <DataRow label="Ratio H₂:O₂" value={o2 > 0 ? `${(h2 / o2).toFixed(1)} : 1` : "—"} />
      </div>}
      analysis={<p className="text-xs font-mono">2H₂O(l) → 2H₂(g) + O₂(g)</p>}
    />
  );
}

// ========== UNIT 5: Metals & Nonmetals ==========

// Lab 14: Reactivity Series
export function ReactivitySeries() {
  const [metal, setMetal] = useState("magnesium");
  const [acidAdded, setAcidAdded] = useState(false);
  const reactivity: Record<string, { rate: number; label: string }> = {
    magnesium: { rate: 4, label: "Very vigorous" },
    zinc: { rate: 3, label: "Vigorous" },
    iron: { rate: 1.5, label: "Slow" },
    copper: { rate: 0, label: "No reaction" },
  };
  const { rate, label } = reactivity[metal];
  const reset = () => setAcidAdded(false);

  const steps = [
    "Take small pieces of different metals (Mg, Zn, Fe).",
    "Place each metal in separate test tubes.",
    "Add dilute hydrochloric acid to each tube.",
    "Observe bubble formation.",
    "Compare the rate of reaction.",
    "Record observations to determine reactivity order.",
  ];

  return (
    <SimulationLayout title="Lab: Metal Reactivity Series" objective="Compare reactivity of metals with acid"
      theory="More reactive metals produce hydrogen gas faster. Reactivity order: Mg > Zn > Fe > Cu. Copper does not react with dilute HCl."
      onReset={reset}
      equipment={<div className="space-y-4">
        <p className="text-xs font-semibold text-muted-foreground">Metal:</p>
        {Object.keys(reactivity).map(m => (
          <label key={m} className="flex items-center gap-2 text-xs cursor-pointer capitalize">
            <input type="radio" name="metal" checked={metal === m} onChange={() => { setMetal(m); setAcidAdded(false); }} />
            {m}
          </label>
        ))}
        <button onClick={() => setAcidAdded(true)} className="px-2 py-1 text-xs rounded bg-primary/80 text-primary-foreground w-full" disabled={acidAdded}>
          {acidAdded ? "✓ HCl Added" : "Add HCl"}
        </button>
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 340 230" className="w-full h-48">
          <rect x={100} y={50} width={80} height={120} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={105} y={80} width={70} height={85} fill="hsl(var(--primary) / 0.15)" rx={2} />
          <rect x={125} y={120} width={30} height={20} fill="#9ca3af" rx={2} />
          <text x={140} y={135} textAnchor="middle" className="text-[7px] fill-background font-bold capitalize">{metal.slice(0, 2)}</text>
          {acidAdded && rate > 0 && Array.from({ length: Math.floor(rate * 3) }, (_, i) => (
            <circle key={i} cx={120 + i * 8} cy={110} r={1.5 + rate * 0.5} fill="hsl(var(--muted-foreground))" opacity={0.3}>
              <animate attributeName="cy" values="130;60" dur={`${0.5 / (rate * 0.5) + i * 0.1}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Reactivity meter */}
          <rect x={220} y={50} width={20} height={120} rx={2} fill="hsl(var(--muted))" />
          <rect x={222} y={170 - rate * 28} width={16} height={rate * 28} rx={1} fill={rate > 2 ? "#22c55e" : rate > 0 ? "#eab308" : "#ef4444"} />
          <text x={230} y={185} textAnchor="middle" className="text-[7px] fill-muted-foreground">Rate</text>
          {/* Reactivity series */}
          <g>
            <text x={290} y={70} textAnchor="middle" className="text-[8px] fill-foreground font-bold">Reactivity:</text>
            {["Mg", "Zn", "Fe", "Cu"].map((m, i) => (
              <text key={m} x={290} y={85 + i * 14} textAnchor="middle" className={`text-[8px] ${metal.startsWith(m.toLowerCase()) ? "fill-primary font-bold" : "fill-muted-foreground"}`}>{m} {i < 3 ? ">" : ""}</text>
            ))}
          </g>
          <text x={140} y={200} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{acidAdded ? label : "Add acid to start"}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Metal" value={metal} />
        <DataRow label="Rate" value={label} />
        <DataRow label="Bubbles" value={acidAdded && rate > 0 ? "H₂ ↑" : "None"} />
        <DataRow label="Reacts?" value={rate > 0 ? "Yes ✓" : "No ✗"} />
      </div>}
    />
  );
}

// Lab 15: Metal Extraction (Conceptual)
export function MetalExtraction() {
  const [temp, setTemp] = useState(500);
  const [carbonAdded, setCaronAdded] = useState(false);
  const progress = carbonAdded && temp >= 800 ? Math.min((temp - 800) / 700, 1) : 0;
  const reset = () => { setTemp(500); setCaronAdded(false); };

  return (
    <SimulationLayout title="Lab: Metal Extraction (Reduction)" objective="Observe reduction of metal oxide using carbon"
      theory="Metal oxides of moderately reactive metals can be reduced by carbon: 2Fe₂O₃ + 3C → 4Fe + 3CO₂. High temperatures are needed."
      onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={200} max={1500} step={50} unit="°C" />
        <button onClick={() => setCaronAdded(true)} className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground w-full" disabled={carbonAdded}>
          {carbonAdded ? "✓ Carbon Added" : "Add Carbon"}
        </button>
        {carbonAdded && temp < 800 && <p className="text-[10px] text-destructive">⚠️ Need ≥800°C</p>}
      </div>}
      workspace={
        <svg viewBox="0 0 320 220" className="w-full h-48">
          {/* Furnace */}
          <rect x={90} y={40} width={140} height={130} rx={8} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={100} y={50} width={120} height={100} rx={4} fill={temp > 800 ? `rgba(239, 68, 68, ${Math.min(temp / 1500, 0.8)})` : "hsl(var(--muted) / 0.5)"} />
          {/* Ore */}
          <rect x={120} y={90} width={40} height={30} fill="#92400e" rx={2} opacity={1 - progress * 0.5} />
          <text x={140} y={110} textAnchor="middle" className="text-[7px] fill-background font-bold">Ore</text>
          {/* Carbon */}
          {carbonAdded && <rect x={170} y={95} width={25} height={20} fill="#1f2937" rx={2} opacity={1 - progress} />}
          {/* Metal output */}
          {progress > 0.5 && <>
            <rect x={140} y={155} width={40} height={15} fill="#9ca3af" rx={2} />
            <text x={160} y={166} textAnchor="middle" className="text-[7px] fill-background font-bold">Fe</text>
          </>}
          {/* Slag */}
          {progress > 0.3 && <rect x={190} y={155} width={25} height={10} fill="#78716c" rx={2} opacity={0.6} />}
          <text x={160} y={200} textAnchor="middle" className="text-[9px] fill-foreground">{progress > 0.5 ? "Metal extracted!" : temp >= 800 && carbonAdded ? "Reducing…" : "Heat furnace & add carbon"}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Temperature" value={temp} unit="°C" />
        <DataRow label="Carbon" value={carbonAdded ? "Added" : "None"} />
        <DataRow label="Reduction" value={`${(progress * 100).toFixed(0)}%`} />
        <DataRow label="Product" value={progress > 0.5 ? "Iron (Fe)" : "—"} />
      </div>}
      analysis={progress > 0.3 ? <p className="text-xs font-mono">2Fe₂O₃ + 3C → 4Fe + 3CO₂</p> : null}
    />
  );
}

// ========== UNIT 6: Hydrocarbons ==========

// Lab 16: Combustion of Hydrocarbon
export function HydrocarbonCombustion() {
  const [airControl, setAirControl] = useState(100);
  const [lit, setLit] = useState(false);
  const isComplete = airControl >= 70;
  const flameColor = isComplete ? "#3b82f6" : "#eab308";
  const sootLevel = isComplete ? 0 : Math.round((70 - airControl) / 7);
  const reset = () => { setLit(false); setAirControl(100); };

  const steps = [
    "Light a hydrocarbon burner (e.g., methane).",
    "Observe the flame color.",
    "Adjust the air inlet.",
    "Observe changes in flame appearance.",
    "Hold a clean glass plate above the flame.",
    "Observe soot formation.",
    "Record observations.",
  ];

  return (
    <SimulationLayout title="Lab: Combustion of Hydrocarbon" objective="Compare complete vs incomplete combustion"
      theory="Complete: CH₄ + 2O₂ → CO₂ + 2H₂O (blue flame, no soot). Incomplete: 2CH₄ + 3O₂ → 2CO + 4H₂O (yellow flame, soot)."
      onReset={reset}
      equipment={<div className="space-y-4">
        <button onClick={() => setLit(!lit)} className={`px-2 py-1 text-xs rounded w-full ${lit ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>
          {lit ? "🔥 Lit — Extinguish" : "Light Burner"}
        </button>
        <ControlGroup label="Air Inlet" value={airControl} onChange={setAirControl} min={0} max={100} step={5} unit="%" />
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 300 230" className="w-full h-48">
          {/* Burner */}
          <rect x={130} y={150} width={40} height={40} rx={4} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={145} y={140} width={10} height={15} fill="hsl(var(--border))" />
          {/* Flame */}
          {lit && <path d={`M140,140 Q135,${100 - airControl * 0.3} 150,${80 - airControl * 0.2} Q165,${100 - airControl * 0.3} 160,140 Z`} fill={flameColor} opacity={0.7}>
            <animate attributeName="d" values={`M140,140 Q135,100 150,80 Q165,100 160,140 Z;M140,140 Q133,95 150,75 Q167,95 160,140 Z;M140,140 Q135,100 150,80 Q165,100 160,140 Z`} dur="0.4s" repeatCount="indefinite" />
          </path>}
          {/* Glass plate for soot */}
          {lit && <rect x={120} y={55} width={60} height={5} fill="hsl(var(--border))" rx={1} />}
          {lit && sootLevel > 0 && Array.from({ length: sootLevel }, (_, i) => (
            <circle key={i} cx={135 + i * 8} cy={54} r={2} fill="#1f2937" />
          ))}
          {/* CO2 detector */}
          {lit && <text x={220} y={100} className="text-[9px] fill-muted-foreground">CO₂: {isComplete ? "High" : "Low"}</text>}
          {lit && <text x={220} y={115} className="text-[9px] fill-muted-foreground">CO: {isComplete ? "None" : "Present ⚠️"}</text>}
          {lit && <text x={220} y={130} className="text-[9px] fill-muted-foreground">Soot: {sootLevel > 0 ? "Yes" : "None"}</text>}
          <text x={150} y={210} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{lit ? (isComplete ? "Complete Combustion (Blue)" : "Incomplete Combustion (Yellow)") : "Light the burner"}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Flame" value={lit ? (isComplete ? "Blue" : "Yellow") : "Off"} />
        <DataRow label="Air" value={airControl} unit="%" />
        <DataRow label="Soot" value={sootLevel > 0 ? `Level ${sootLevel}` : "None"} />
        <DataRow label="Combustion" value={isComplete ? "Complete" : "Incomplete"} />
      </div>}
      analysis={<p className="text-xs font-mono">{isComplete ? "CH₄ + 2O₂ → CO₂ + 2H₂O" : "2CH₄ + 3O₂ → 2CO + 4H₂O + C(soot)"}</p>}
    />
  );
}

// Lab 17: Test for Unsaturation (Bromine Test)
export function BromineTest() {
  const [sample, setSample] = useState<"alkene" | "alkane">("alkene");
  const [bromineAdded, setBromineAdded] = useState(false);
  const [shaken, setShaken] = useState(false);
  const decolorized = sample === "alkene" && bromineAdded && shaken;
  const reset = () => { setBromineAdded(false); setShaken(false); };

  const steps = [
    "Place a few drops of alkene sample in a test tube.",
    "Add bromine water slowly.",
    "Shake the test tube gently.",
    "Observe the color change.",
    "Record whether the brown color disappears.",
  ];

  return (
    <SimulationLayout title="Lab: Bromine Test for Unsaturation" objective="Test for C=C double bonds using bromine water"
      theory="Alkenes decolorize bromine water because the Br₂ adds across the C=C double bond. Alkanes do not react — bromine stays brown."
      onReset={reset}
      equipment={<div className="space-y-4">
        <p className="text-xs font-semibold text-muted-foreground">Sample:</p>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="radio" name="samp" checked={sample === "alkene"} onChange={() => { setSample("alkene"); reset(); }} />
          Ethene (Alkene — C=C)
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="radio" name="samp" checked={sample === "alkane"} onChange={() => { setSample("alkane"); reset(); }} />
          Ethane (Alkane — C-C)
        </label>
        <button onClick={() => setBromineAdded(true)} className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground w-full" disabled={bromineAdded}>
          {bromineAdded ? "✓ Bromine Added" : "Add Bromine Water"}
        </button>
        {bromineAdded && <button onClick={() => setShaken(true)} className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground w-full" disabled={shaken}>
          {shaken ? "✓ Shaken" : "Shake"}
        </button>}
        <StepByStep steps={steps} />
      </div>}
      workspace={
        <svg viewBox="0 0 320 230" className="w-full h-48">
          {/* Test tube */}
          <rect x={110} y={40} width={60} height={130} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={115} y={80} width={50} height={85} fill={!bromineAdded ? "hsl(var(--muted) / 0.3)" : decolorized ? "rgba(200,200,200,0.3)" : "#92400e"} opacity={0.7} rx={2} />
          {/* Bromine bottle */}
          <rect x={220} y={60} width={40} height={60} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={1.5} />
          <rect x={225} y={80} width={30} height={35} fill="#92400e" opacity={0.6} rx={2} />
          <text x={240} y={140} textAnchor="middle" className="text-[8px] fill-muted-foreground">Br₂ water</text>
          {/* Molecular view */}
          {sample === "alkene" && <g>
            <text x={50} y={60} textAnchor="middle" className="text-[8px] fill-foreground font-bold">C=C</text>
            <line x1={35} y1={70} x2={65} y2={70} stroke="hsl(var(--primary))" strokeWidth={2} />
            <line x1={35} y1={75} x2={65} y2={75} stroke="hsl(var(--primary))" strokeWidth={2} />
            {decolorized && <>
              <text x={50} y={100} textAnchor="middle" className="text-[8px] fill-foreground">→</text>
              <text x={50} y={115} textAnchor="middle" className="text-[8px] fill-foreground font-bold">C—C</text>
              <text x={35} y={130} className="text-[7px] fill-muted-foreground">Br Br</text>
            </>}
          </g>}
          {sample === "alkane" && <g>
            <text x={50} y={60} textAnchor="middle" className="text-[8px] fill-foreground font-bold">C—C</text>
            <line x1={35} y1={70} x2={65} y2={70} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
            <text x={50} y={95} textAnchor="middle" className="text-[8px] fill-muted-foreground">No double bond</text>
          </g>}
          <text x={140} y={200} textAnchor="middle" className="text-[10px] fill-foreground font-bold">
            {!bromineAdded ? "Add bromine water" : !shaken ? "Shake to mix" : decolorized ? "✓ Decolorized! (Unsaturated)" : "✗ Still brown (Saturated)"}
          </text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Sample" value={sample === "alkene" ? "Ethene" : "Ethane"} />
        <DataRow label="Bond" value={sample === "alkene" ? "C=C (double)" : "C-C (single)"} />
        <DataRow label="Bromine" value={!bromineAdded ? "Not added" : decolorized ? "Decolorized ✓" : "Brown"} />
        <DataRow label="Result" value={shaken ? (decolorized ? "Unsaturated" : "Saturated") : "—"} />
      </div>}
      analysis={decolorized ? <p className="text-xs font-mono">CH₂=CH₂ + Br₂ → CH₂BrCH₂Br (1,2-dibromoethane)</p> : null}
    />
  );
}
