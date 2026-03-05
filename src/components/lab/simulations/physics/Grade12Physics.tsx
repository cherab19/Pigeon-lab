import { useState, useMemo } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

// 1. Horizontal & Inclined Projectile
export function AdvancedProjectile() {
  const [height, setHeight] = useState(20);
  const [velocity, setVelocity] = useState(15);
  const [angle, setAngle] = useState(0);
  const [airRes, setAirRes] = useState(false);
  const g = 9.8;
  const rad = (angle * Math.PI) / 180;
  const vy0 = velocity * Math.sin(rad);
  const vx = velocity * Math.cos(rad);
  const tof = (vy0 + Math.sqrt(vy0 * vy0 + 2 * g * height)) / g;
  const range = vx * tof * (airRes ? 0.7 : 1);
  const vyFinal = vy0 + g * tof;
  const vFinal = Math.sqrt(vx * vx + vyFinal * vyFinal);
  const reset = () => { setHeight(20); setVelocity(15); setAngle(0); setAirRes(false); };

  const trajectory = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = (tof * i) / 40;
      const x = vx * t * (airRes ? (1 - t / tof * 0.3) : 1);
      const y = height + vy0 * t - 0.5 * g * t * t;
      const sx = 40 + (x / Math.max(range, 1)) * 300;
      const sy = 220 - (y / Math.max(height + 10, 1)) * 180;
      if (sy >= 20 && sy <= 220) pts.push(`${sx},${sy}`);
    }
    return pts.join(" ");
  }, [height, velocity, angle, airRes, tof, range, vx, vy0, g]);

  return (
    <SimulationLayout title="Lab: Advanced Projectile Motion" objective="Compare horizontal and angled launch with optional air resistance" theory="Horizontal: t=√(2h/g), R=v₀t. Angled: combine horizontal and vertical components." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Launch Height" value={height} onChange={setHeight} min={5} max={50} unit="m" />
        <ControlGroup label="Velocity" value={velocity} onChange={setVelocity} min={5} max={40} unit="m/s" />
        <ControlGroup label="Angle" value={angle} onChange={setAngle} min={0} max={60} unit="°" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={airRes} onChange={e => setAirRes(e.target.checked)} className="rounded" />
          Air Resistance
        </label>
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <line x1={30} y1={220} x2={380} y2={220} stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={30} y={220 - (height / Math.max(height + 10, 1)) * 180} width={15} height={(height / Math.max(height + 10, 1)) * 180} fill="hsl(var(--muted))" />
          <polyline points={trajectory} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          {airRes && <text x={200} y={20} textAnchor="middle" className="text-[9px] fill-destructive">Air resistance ON (approx)</text>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Time of Flight" value={tof.toFixed(2)} unit="s" />
        <DataRow label="Range" value={range.toFixed(2)} unit="m" />
        <DataRow label="Final Speed" value={vFinal.toFixed(2)} unit="m/s" />
        <DataRow label="vx" value={vx.toFixed(2)} unit="m/s" />
        <DataRow label="vy (final)" value={vyFinal.toFixed(2)} unit="m/s" />
      </div>}
    />
  );
}

// 2. Fluid Pressure
export function FluidPressure() {
  const [depth, setDepth] = useState(5);
  const [density, setDensity] = useState(1000);
  const g = 9.8;
  const patm = 101325;
  const pGauge = density * g * depth;
  const pAbs = patm + pGauge;
  const buoyantF = density * g * 0.01 * depth;
  const reset = () => { setDepth(5); setDensity(1000); };

  return (
    <SimulationLayout title="Lab: Fluid Pressure" objective="P = P₀ + ρgh — Measure pressure at different depths" theory="Pressure in a fluid increases linearly with depth." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Depth" value={depth} onChange={setDepth} min={0} max={20} step={0.5} unit="m" />
        <ControlGroup label="Fluid Density" value={density} onChange={setDensity} min={500} max={13600} step={100} unit="kg/m³" />
      </div>}
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          <rect x={80} y={20} width={140} height={210} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} rx={4} />
          <line x1={80} y1={30} x2={220} y2={30} stroke="hsl(var(--primary) / 0.5)" strokeWidth={1} />
          <text x={75} y={30} textAnchor="end" className="text-[8px] fill-muted-foreground">0m</text>
          {[5, 10, 15, 20].map(d => {
            const y = 30 + (d / 20) * 190;
            return y <= 225 ? <g key={d}><line x1={80} y1={y} x2={220} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3,3" /><text x={75} y={y + 3} textAnchor="end" className="text-[7px] fill-muted-foreground">{d}m</text></g> : null;
          })}
          <circle cx={150} cy={30 + (depth / 20) * 190} r={8} fill="hsl(var(--accent))" />
          <text x={165} y={34 + (depth / 20) * 190} className="text-[8px] fill-accent">Sensor</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Depth" value={depth.toFixed(1)} unit="m" />
        <DataRow label="Gauge Pressure" value={(pGauge / 1000).toFixed(1)} unit="kPa" />
        <DataRow label="Absolute Pressure" value={(pAbs / 1000).toFixed(1)} unit="kPa" />
        <DataRow label="Buoyant Force" value={buoyantF.toFixed(2)} unit="N" />
      </div>}
    />
  );
}

// 3. Magnetic Field
export function MagneticField() {
  const [current, setCurrent] = useState(5);
  const [reversed, setReversed] = useState(false);
  const dir = reversed ? -1 : 1;
  const reset = () => { setCurrent(5); setReversed(false); };

  return (
    <SimulationLayout title="Lab: Magnetic Field Visualization" objective="Visualize magnetic field lines around a bar magnet" theory="Field lines go from North to South pole externally. Field strength decreases with distance." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Field Strength" value={current} onChange={setCurrent} min={1} max={10} unit="A" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={reversed} onChange={e => setReversed(e.target.checked)} className="rounded" />
          Reverse Polarity
        </label>
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <rect x={140} y={105} width={120} height={40} fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth={2} rx={4} />
          <rect x={140} y={105} width={60} height={40} fill={reversed ? "hsl(var(--primary))" : "#ef4444"} rx="4 0 0 4" />
          <rect x={200} y={105} width={60} height={40} fill={reversed ? "#ef4444" : "hsl(var(--primary))"} rx="0 4 4 0" />
          <text x={170} y={130} textAnchor="middle" className="text-[12px] fill-primary-foreground font-bold">{reversed ? "S" : "N"}</text>
          <text x={230} y={130} textAnchor="middle" className="text-[12px] fill-primary-foreground font-bold">{reversed ? "N" : "S"}</text>
          {[20, 40, 60].map(r => (
            <g key={r}>
              <ellipse cx={200} cy={125} rx={60 + r * current / 5} ry={20 + r * current / 8} fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth={1} />
              <circle cx={200 + dir * (60 + r * current / 5)} cy={125} r={2} fill="hsl(var(--primary))" />
            </g>
          ))}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Field Strength" value={current} unit="T (rel)" />
        <DataRow label="Polarity" value={reversed ? "Reversed" : "Normal"} />
        <DataRow label="N Pole" value={reversed ? "Right" : "Left"} />
      </div>}
    />
  );
}

// 4. Diode & Rectifier
export function DiodeRectifier() {
  const [acVoltage, setAcVoltage] = useState(5);
  const [freq, setFreq] = useState(50);
  const reset = () => { setAcVoltage(5); setFreq(50); };
  const vDrop = 0.7;
  const peakOut = Math.max(0, acVoltage - vDrop);

  return (
    <SimulationLayout title="Lab: Diode & Rectifier" objective="Study half-wave rectification and diode I-V characteristics" theory="A diode conducts above ~0.7V forward bias. Half-wave rectification passes only positive half-cycles." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="AC Voltage (peak)" value={acVoltage} onChange={setAcVoltage} min={1} max={20} step={0.5} unit="V" />
        <ControlGroup label="Frequency" value={freq} onChange={setFreq} min={10} max={200} step={10} unit="Hz" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <text x={200} y={15} textAnchor="middle" className="text-[10px] fill-muted-foreground font-semibold">Oscilloscope View</text>
          <line x1={30} y1={70} x2={370} y2={70} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3,3" />
          <line x1={30} y1={180} x2={370} y2={180} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={20} y={22} className="text-[8px] fill-muted-foreground">Input (AC)</text>
          {Array.from({ length: 340 }, (_, i) => {
            const x = 30 + i;
            const v = acVoltage * Math.sin((i / 340) * 4 * Math.PI);
            const y = 70 - (v / acVoltage) * 40;
            return i === 0 ? null : <line key={`in${i}`} x1={x - 1} y1={70 - (acVoltage * Math.sin(((i - 1) / 340) * 4 * Math.PI) / acVoltage) * 40} x2={x} y2={y} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />;
          })}
          <text x={20} y={135} className="text-[8px] fill-primary">Output (Rectified)</text>
          {Array.from({ length: 340 }, (_, i) => {
            const x = 30 + i;
            const v = acVoltage * Math.sin((i / 340) * 4 * Math.PI);
            const vOut = v > vDrop ? v - vDrop : 0;
            const prevV = acVoltage * Math.sin(((i - 1) / 340) * 4 * Math.PI);
            const prevOut = prevV > vDrop ? prevV - vDrop : 0;
            const y = 180 - (vOut / acVoltage) * 40;
            const py = 180 - (prevOut / acVoltage) * 40;
            return i === 0 ? null : <line key={`out${i}`} x1={x - 1} y1={py} x2={x} y2={y} stroke="hsl(var(--primary))" strokeWidth={1.5} />;
          })}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="AC Peak" value={acVoltage.toFixed(1)} unit="V" />
        <DataRow label="Diode Drop" value={vDrop} unit="V" />
        <DataRow label="DC Peak Out" value={peakOut.toFixed(1)} unit="V" />
        <DataRow label="Frequency" value={freq} unit="Hz" />
        <DataRow label="Avg DC" value={(peakOut / Math.PI).toFixed(2)} unit="V" />
      </div>}
    />
  );
}
