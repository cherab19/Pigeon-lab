import { useState, useMemo } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

// 1. Projectile Motion
export function ProjectileMotion() {
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(20);
  const [grav, setGrav] = useState(9.8);
  const rad = (angle * Math.PI) / 180;
  const range = (velocity * velocity * Math.sin(2 * rad)) / grav;
  const maxH = (velocity * velocity * Math.sin(rad) * Math.sin(rad)) / (2 * grav);
  const tof = (2 * velocity * Math.sin(rad)) / grav;
  const reset = () => { setAngle(45); setVelocity(20); setGrav(9.8); };

  const trajectory = useMemo(() => {
    const pts: string[] = [];
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const t = (tof * i) / steps;
      const x = velocity * Math.cos(rad) * t;
      const y = velocity * Math.sin(rad) * t - 0.5 * grav * t * t;
      const sx = 40 + (x / Math.max(range, 1)) * 320;
      const sy = 220 - (y / Math.max(maxH, 1)) * 160;
      if (sy <= 220) pts.push(`${sx},${sy}`);
    }
    return pts.join(" ");
  }, [angle, velocity, grav, range, maxH, tof, rad]);

  return (
    <SimulationLayout title="Lab: Projectile Motion" objective="Analyze trajectory, range, and maximum height" theory="Range = v²sin(2θ)/g, Max Height = v²sin²(θ)/(2g)" onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Launch Angle" value={angle} onChange={setAngle} min={5} max={85} unit="°" />
        <ControlGroup label="Initial Velocity" value={velocity} onChange={setVelocity} min={5} max={50} step={1} unit="m/s" />
        <ControlGroup label="Gravity" value={grav} onChange={setGrav} min={1.6} max={25} step={0.1} unit="m/s²" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <line x1={30} y1={220} x2={380} y2={220} stroke="hsl(var(--border))" strokeWidth={2} />
          <line x1={40} y1={220} x2={40 + 30 * Math.cos(rad)} y2={220 - 30 * Math.sin(rad)} stroke="hsl(var(--foreground))" strokeWidth={3} />
          <polyline points={trajectory} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          <line x1={40} y1={220 - (maxH / Math.max(maxH, 1)) * 160} x2={40 + (range / 2 / Math.max(range, 1)) * 320} y2={220 - (maxH / Math.max(maxH, 1)) * 160} stroke="hsl(var(--accent))" strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={42 + (range / Math.max(range, 1)) * 320} y={235} className="text-[8px] fill-muted-foreground">R={range.toFixed(1)}m</text>
          <text x={5} y={220 - (maxH / Math.max(maxH, 1)) * 160} className="text-[8px] fill-accent">H={maxH.toFixed(1)}m</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Range" value={range.toFixed(2)} unit="m" />
        <DataRow label="Max Height" value={maxH.toFixed(2)} unit="m" />
        <DataRow label="Time of Flight" value={tof.toFixed(2)} unit="s" />
        <DataRow label="Angle" value={`${angle}°`} />
      </div>}
    />
  );
}

// 2. Inclined Plane
export function InclinedPlane() {
  const [angle, setAngle] = useState(30);
  const [mass, setMass] = useState(5);
  const [mu, setMu] = useState(0.2);
  const rad = (angle * Math.PI) / 180;
  const mgPar = mass * 9.8 * Math.sin(rad);
  const mgPerp = mass * 9.8 * Math.cos(rad);
  const friction = mu * mgPerp;
  const netF = Math.max(0, mgPar - friction);
  const accel = netF / mass;
  const reset = () => { setAngle(30); setMass(5); setMu(0.2); };

  return (
    <SimulationLayout title="Lab: Inclined Plane" objective="Analyze forces on a block on an inclined surface" theory="Parallel force = mgsinθ, Normal force = mgcosθ, Friction = μN" onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Incline Angle" value={angle} onChange={setAngle} min={5} max={75} unit="°" />
        <ControlGroup label="Mass" value={mass} onChange={setMass} min={1} max={20} step={0.5} unit="kg" />
        <ControlGroup label="Friction (μ)" value={mu} onChange={setMu} min={0} max={1} step={0.05} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <polygon points={`50,220 350,220 350,${220 - 300 * Math.tan(rad)}`} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />
          {(() => { const bx = 200, by = 220 - (150 / 350) * 300 * Math.tan(rad);
            return (<>
              <rect x={bx - 15} y={by - 25} width={30} height={25} fill="hsl(var(--primary))" rx={3} transform={`rotate(${-angle},${bx},${by})`} />
              <line x1={bx} y1={by} x2={bx + mgPar * 2 * Math.cos(rad)} y2={by + mgPar * 2 * Math.sin(rad)} stroke="#ef4444" strokeWidth={2} />
              <text x={bx + mgPar * 2.2 * Math.cos(rad)} y={by + mgPar * 2.2 * Math.sin(rad)} className="text-[7px]" fill="#ef4444">mg∥</text>
              <line x1={bx} y1={by} x2={bx} y2={by + mass * 9.8 * 0.3} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
              <text x={bx + 5} y={by + mass * 9.8 * 0.3 + 5} className="text-[7px] fill-foreground">mg</text>
            </>);
          })()}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="mg (weight)" value={(mass * 9.8).toFixed(1)} unit="N" />
        <DataRow label="mg∥ (parallel)" value={mgPar.toFixed(1)} unit="N" />
        <DataRow label="mg⊥ (normal)" value={mgPerp.toFixed(1)} unit="N" />
        <DataRow label="Friction" value={friction.toFixed(1)} unit="N" />
        <DataRow label="Net Force" value={netF.toFixed(1)} unit="N" />
        <DataRow label="Acceleration" value={accel.toFixed(2)} unit="m/s²" />
      </div>}
    />
  );
}

// 3. Coulomb's Law
export function CoulombsLaw() {
  const [q1, setQ1] = useState(5);
  const [q2, setQ2] = useState(-3);
  const [dist, setDist] = useState(2);
  const k = 8.99e9;
  const force = (k * Math.abs(q1 * q2) * 1e-12) / (dist * dist);
  const attractive = q1 * q2 < 0;
  const reset = () => { setQ1(5); setQ2(-3); setDist(2); };

  return (
    <SimulationLayout title="Lab: Coulomb's Law" objective="F = kq₁q₂/r² — Explore electrostatic force" theory="Like charges repel, unlike charges attract. Force is proportional to charges and inversely proportional to distance squared." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Charge q₁" value={q1} onChange={setQ1} min={-10} max={10} step={1} unit="μC" />
        <ControlGroup label="Charge q₂" value={q2} onChange={setQ2} min={-10} max={10} step={1} unit="μC" />
        <ControlGroup label="Distance" value={dist} onChange={setDist} min={0.5} max={5} step={0.1} unit="m" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-44">
          <circle cx={120} cy={100} r={25} fill={q1 > 0 ? "hsl(var(--primary) / 0.7)" : "#ef4444aa"} />
          <text x={120} y={105} textAnchor="middle" className="text-[12px] fill-primary-foreground font-bold">{q1 > 0 ? "+" : ""}{q1}</text>
          <circle cx={280} cy={100} r={25} fill={q2 > 0 ? "hsl(var(--primary) / 0.7)" : "#ef4444aa"} />
          <text x={280} y={105} textAnchor="middle" className="text-[12px] fill-primary-foreground font-bold">{q2 > 0 ? "+" : ""}{q2}</text>
          <line x1={145} y1={100} x2={255} y2={100} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4,4" />
          <text x={200} y={90} textAnchor="middle" className="text-[9px] fill-muted-foreground">{dist} m</text>
          {attractive ? (
            <><line x1={150} y1={100} x2={170} y2={100} stroke="#22c55e" strokeWidth={2} markerEnd="url(#arrowG)" />
            <line x1={250} y1={100} x2={230} y2={100} stroke="#22c55e" strokeWidth={2} markerEnd="url(#arrowG)" /></>
          ) : (
            <><line x1={95} y1={100} x2={75} y2={100} stroke="#ef4444" strokeWidth={2} />
            <line x1={305} y1={100} x2={325} y2={100} stroke="#ef4444" strokeWidth={2} /></>
          )}
          <text x={200} y={140} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{attractive ? "Attractive" : "Repulsive"}</text>
          <defs><marker id="arrowG" markerWidth={6} markerHeight={4} refX={6} refY={2} orient="auto"><path d="M0,0 L6,2 L0,4" fill="#22c55e" /></marker></defs>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="q₁" value={q1} unit="μC" />
        <DataRow label="q₂" value={q2} unit="μC" />
        <DataRow label="Distance" value={dist.toFixed(1)} unit="m" />
        <DataRow label="Force" value={force.toExponential(2)} unit="N" />
        <DataRow label="Type" value={attractive ? "Attractive" : "Repulsive"} />
      </div>}
    />
  );
}

// 4. Heat Conduction
export function HeatConduction() {
  const [hotTemp, setHotTemp] = useState(100);
  const [coldTemp, setColdTemp] = useState(20);
  const [conductivity, setConductivity] = useState(50);
  const diff = hotTemp - coldTemp;
  const rate = conductivity * diff / 100;
  const reset = () => { setHotTemp(100); setColdTemp(20); setConductivity(50); };

  return (
    <SimulationLayout title="Lab: Heat Conduction" objective="Observe heat transfer through a metal rod" theory="Heat flows from hot to cold. Rate depends on conductivity, temperature difference, cross-section, and length." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Hot End Temp" value={hotTemp} onChange={setHotTemp} min={50} max={200} unit="°C" />
        <ControlGroup label="Cold End Temp" value={coldTemp} onChange={setColdTemp} min={0} max={50} unit="°C" />
        <ControlGroup label="Conductivity (k)" value={conductivity} onChange={setConductivity} min={10} max={400} step={10} unit="W/mK" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 160" className="w-full h-40">
          <defs>
            <linearGradient id="heatGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <rect x={40} y={60} width={320} height={40} fill="url(#heatGrad)" rx={6} />
          <text x={40} y={55} className="text-[10px] fill-destructive font-bold">{hotTemp}°C</text>
          <text x={340} y={55} className="text-[10px] fill-blue-500 font-bold">{coldTemp}°C</text>
          {[0.2, 0.4, 0.6, 0.8].map(f => {
            const temp = hotTemp - f * diff;
            return <text key={f} x={40 + f * 320} y={115} textAnchor="middle" className="text-[8px] fill-muted-foreground">{temp.toFixed(0)}°C</text>;
          })}
          <text x={200} y={135} textAnchor="middle" className="text-[10px] fill-muted-foreground">→ Heat Flow Direction →</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="ΔT" value={diff} unit="°C" />
        <DataRow label="Conductivity" value={conductivity} unit="W/mK" />
        <DataRow label="Heat Rate" value={rate.toFixed(1)} unit="W" />
      </div>}
    />
  );
}
