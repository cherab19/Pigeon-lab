import { useState, useMemo } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

// 1. Rutherford Gold Foil
export function RutherfordExperiment() {
  const [energy, setEnergy] = useState(5);
  const [foilThickness, setFoilThickness] = useState(1);
  const totalParticles = 100;
  const deflected = Math.floor(foilThickness * 8);
  const bounced = Math.floor(foilThickness * 1.5);
  const passed = totalParticles - deflected - bounced;
  const reset = () => { setEnergy(5); setFoilThickness(1); };

  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const type = i < Math.floor(passed / 3.3) ? "pass" : i < Math.floor((passed + deflected) / 3.3) ? "deflect" : "bounce";
      const startY = 30 + (i / 30) * 200;
      const endX = type === "pass" ? 380 : type === "deflect" ? 300 + Math.random() * 80 : 50 + Math.random() * 50;
      const endY = type === "pass" ? startY : type === "deflect" ? startY + (Math.random() - 0.5) * 100 : startY;
      return { startY, endX, endY, type };
    });
  }, [passed, deflected]);

  return (
    <SimulationLayout title="Lab: Rutherford Gold Foil Experiment" objective="Observe alpha particle scattering patterns" theory="Most particles pass through, some deflect, very few bounce back—proving a dense positive nucleus." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Particle Energy" value={energy} onChange={setEnergy} min={1} max={10} unit="MeV" />
        <ControlGroup label="Foil Thickness" value={foilThickness} onChange={setFoilThickness} min={0.5} max={5} step={0.5} unit="layers" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 260" className="w-full h-52">
          <rect x={195} y={10} width={10} height={240} fill="#eab308" opacity={0.6} />
          <text x={200} y={265} textAnchor="middle" className="text-[8px] fill-muted-foreground">Gold Foil</text>
          <text x={30} y={15} className="text-[8px] fill-muted-foreground">α source</text>
          {particles.map((p, i) => (
            <g key={i}>
              <line x1={20} y1={p.startY} x2={p.endX} y2={p.endY} stroke={p.type === "pass" ? "hsl(var(--primary) / 0.3)" : p.type === "deflect" ? "#f97316" : "#ef4444"} strokeWidth={1} />
              <circle cx={p.endX} cy={p.endY} r={2} fill={p.type === "pass" ? "hsl(var(--primary))" : p.type === "deflect" ? "#f97316" : "#ef4444"} />
            </g>
          ))}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Total Particles" value={totalParticles} />
        <DataRow label="Passed Through" value={`${passed}%`} />
        <DataRow label="Deflected" value={`${deflected}%`} />
        <DataRow label="Bounced Back" value={`${bounced}%`} />
      </div>}
      analysis={<p className="text-xs text-muted-foreground">Conclusion: Atom is mostly empty space with a tiny, dense, positive nucleus.</p>}
    />
  );
}

// 2. Photoelectric Effect
export function PhotoelectricEffect() {
  const [frequency, setFrequency] = useState(6);
  const [intensity, setIntensity] = useState(5);
  const h = 6.626e-34;
  const threshold = 4.5e14;
  const freqHz = frequency * 1e14;
  const workFunction = h * threshold;
  const ke = freqHz > threshold ? h * (freqHz - threshold) : 0;
  const electronsEmitted = freqHz > threshold;
  const numElectrons = electronsEmitted ? Math.floor(intensity * 2) : 0;
  const reset = () => { setFrequency(6); setIntensity(5); };

  return (
    <SimulationLayout title="Lab: Photoelectric Effect" objective="KE = hf - φ — Light frequency vs electron emission" theory="Electrons are emitted only if light frequency exceeds the threshold. KE depends on frequency, not intensity." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Frequency" value={frequency} onChange={setFrequency} min={1} max={15} step={0.5} unit="×10¹⁴ Hz" />
        <ControlGroup label="Intensity" value={intensity} onChange={setIntensity} min={1} max={10} unit="rel" />
        <p className="text-xs text-muted-foreground">Threshold: {(threshold / 1e14).toFixed(1)} ×10¹⁴ Hz</p>
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          <rect x={100} y={60} width={10} height={100} fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth={2} />
          <text x={105} y={180} textAnchor="middle" className="text-[8px] fill-muted-foreground">Metal</text>
          {Array.from({ length: intensity }, (_, i) => (
            <line key={i} x1={20} y1={70 + i * 10} x2={100} y2={70 + i * 10} stroke={freqHz > threshold ? "#a855f7" : "#eab308"} strokeWidth={1.5} />
          ))}
          {electronsEmitted && Array.from({ length: numElectrons }, (_, i) => (
            <circle key={i} cx={130 + i * 15 + Math.random() * 20} cy={80 + i * 8} r={3} fill="#3b82f6">
              <animate attributeName="cx" values={`${115};${200 + i * 20}`} dur="1.5s" repeatCount="indefinite" />
            </circle>
          ))}
          {!electronsEmitted && <text x={250} y={120} className="text-[11px] fill-destructive font-bold">No emission (f {"<"} f₀)</text>}
          <rect x={300} y={60} width={60} height={100} fill="hsl(var(--card))" stroke="hsl(var(--border))" rx={4} />
          <text x={330} y={95} textAnchor="middle" className="text-[7px] fill-muted-foreground">KE meter</text>
          <text x={330} y={120} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{(ke * 1e19).toFixed(2)}</text>
          <text x={330} y={135} textAnchor="middle" className="text-[7px] fill-muted-foreground">×10⁻¹⁹ J</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Frequency" value={`${frequency}×10¹⁴`} unit="Hz" />
        <DataRow label="Threshold" value={`${(threshold / 1e14).toFixed(1)}×10¹⁴`} unit="Hz" />
        <DataRow label="Emission?" value={electronsEmitted ? "Yes ✅" : "No ❌"} />
        <DataRow label="KE" value={`${(ke * 1e19).toFixed(3)}×10⁻¹⁹`} unit="J" />
        <DataRow label="Electrons" value={numElectrons} />
      </div>}
    />
  );
}

// 3. Reaction Rate
export function ReactionRate() {
  const [catalyst, setCatalyst] = useState(false);
  const [temp, setTemp] = useState(25);
  const baseRate = 1;
  const tempFactor = Math.pow(2, (temp - 25) / 10);
  const catalystFactor = catalyst ? 3 : 1;
  const rate = baseRate * tempFactor * catalystFactor;
  const activationE = catalyst ? 40 : 75;
  const reset = () => { setCatalyst(false); setTemp(25); };

  return (
    <SimulationLayout title="Lab: Reaction Rate (Catalyst)" objective="Observe how catalysts reduce activation energy" theory="Catalysts provide an alternative pathway with lower activation energy, increasing reaction rate." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Temperature" value={temp} onChange={setTemp} min={0} max={100} unit="°C" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={catalyst} onChange={e => setCatalyst(e.target.checked)} className="rounded" />
          Add Catalyst (MnO₂)
        </label>
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          <text x={200} y={15} textAnchor="middle" className="text-[9px] fill-muted-foreground font-semibold">Energy Profile Diagram</text>
          <line x1={40} y1={200} x2={360} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          <line x1={40} y1={20} x2={40} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={35} y={15} textAnchor="end" className="text-[7px] fill-muted-foreground">Energy</text>
          <text x={360} y={215} className="text-[7px] fill-muted-foreground">Progress</text>
          <line x1={50} y1={150} x2={120} y2={150} stroke="hsl(var(--primary))" strokeWidth={2} />
          <text x={85} y={165} textAnchor="middle" className="text-[7px] fill-primary">Reactants</text>
          <path d={`M120,150 Q200,${200 - activationE * 2} 280,170`} fill="none" stroke={catalyst ? "#22c55e" : "hsl(var(--accent))"} strokeWidth={2} />
          {!catalyst && <path d="M120,150 Q200,50 280,170" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4,4" />}
          {catalyst && <path d="M120,150 Q200,50 280,170" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4,4" />}
          <line x1={280} y1={170} x2={350} y2={170} stroke="hsl(var(--secondary))" strokeWidth={2} />
          <text x={315} y={185} textAnchor="middle" className="text-[7px] fill-secondary">Products</text>
          <text x={200} y={200 - activationE * 2 + 15} textAnchor="middle" className="text-[8px] fill-foreground font-bold">Ea = {activationE} kJ/mol</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Temperature" value={temp} unit="°C" />
        <DataRow label="Catalyst" value={catalyst ? "MnO₂ ✅" : "None"} />
        <DataRow label="Activation E" value={activationE} unit="kJ/mol" />
        <DataRow label="Rate Factor" value={rate.toFixed(2)} unit="×" />
      </div>}
    />
  );
}

// 4. Le Chatelier's Principle
export function LeChatelierPrinciple() {
  const [reactantAdded, setReactantAdded] = useState(0);
  const [temperature, setTemperature] = useState(50);
  const [pressure, setPressure] = useState(50);
  const shift = reactantAdded * 0.3 + (temperature - 50) * -0.02 + (pressure - 50) * 0.02;
  const direction = shift > 1 ? "Right (→ Products)" : shift < -1 ? "Left (← Reactants)" : "Equilibrium";
  const productConc = 50 + shift * 10;
  const reactantConc = 50 - shift * 10;
  const reset = () => { setReactantAdded(0); setTemperature(50); setPressure(50); };

  return (
    <SimulationLayout title="Lab: Le Chatelier's Principle" objective="Observe equilibrium shifts when conditions change" theory="A system at equilibrium shifts to counteract any imposed change." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Add Reactant" value={reactantAdded} onChange={setReactantAdded} min={0} max={20} step={1} unit="mol" />
        <ControlGroup label="Temperature" value={temperature} onChange={setTemperature} min={0} max={100} unit="°C" />
        <ControlGroup label="Pressure" value={pressure} onChange={setPressure} min={10} max={100} unit="atm" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-44">
          <rect x={50} y={40} width={300} height={120} fill="hsl(var(--muted) / 0.5)" stroke="hsl(var(--border))" strokeWidth={2} rx={6} />
          <rect x={60} y={50} width={Math.max(10, reactantConc * 2.5)} height={40} fill="hsl(var(--primary) / 0.6)" rx={3} />
          <text x={65} y={75} className="text-[9px] fill-primary-foreground font-bold">Reactants</text>
          <rect x={60} y={100} width={Math.max(10, productConc * 2.5)} height={40} fill="hsl(var(--accent) / 0.6)" rx={3} />
          <text x={65} y={125} className="text-[9px] fill-foreground font-bold">Products</text>
          <text x={200} y={175} textAnchor="middle" className="text-[11px] fill-foreground font-bold">
            {shift > 1 ? "⟶ Shift Right" : shift < -1 ? "⟵ Shift Left" : "⟷ At Equilibrium"}
          </text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Shift" value={direction} />
        <DataRow label="[Reactants]" value={reactantConc.toFixed(1)} unit="%" />
        <DataRow label="[Products]" value={productConc.toFixed(1)} unit="%" />
        <DataRow label="Temperature" value={temperature} unit="°C" />
        <DataRow label="Pressure" value={pressure} unit="atm" />
      </div>}
    />
  );
}
