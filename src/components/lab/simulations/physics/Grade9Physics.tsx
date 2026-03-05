import { useState, useMemo } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

// 1. Measuring Length
export function MeasuringLength() {
  const [objectLen] = useState(() => +(Math.random() * 8 + 2).toFixed(2));
  const [rulerPos, setRulerPos] = useState(0);
  const measured = Math.abs(objectLen - rulerPos);
  const sigFigs = measured.toFixed(2).replace(/0+$/, "").replace(/\.$/, "").length;
  const reset = () => setRulerPos(0);

  return (
    <SimulationLayout title="Lab: Measuring Length" objective="Measure the object using the virtual ruler" theory="Accurate measurement requires aligning the zero mark and reading to the smallest division." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Ruler Position" value={rulerPos} onChange={setRulerPos} min={0} max={10} step={0.01} unit="cm" />
        <p className="text-xs text-muted-foreground">Align the ruler end with the object to measure its length.</p>
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-48">
          <rect x={50} y={60} width={objectLen * 30} height={20} fill="hsl(var(--primary))" rx={3} />
          <text x={50 + objectLen * 15} y={55} textAnchor="middle" className="text-[10px] fill-muted-foreground">Object</text>
          <g transform={`translate(${50 + rulerPos * 30}, 100)`}>
            <rect x={0} y={0} width={300} height={15} fill="hsl(var(--muted))" stroke="hsl(var(--border))" rx={2} />
            {Array.from({ length: 31 }, (_, i) => (
              <g key={i}><line x1={i * 10} y1={0} x2={i * 10} y2={i % 5 === 0 ? 10 : 6} stroke="hsl(var(--foreground))" strokeWidth={i % 5 === 0 ? 1 : 0.5} />
                {i % 5 === 0 && <text x={i * 10} y={-3} textAnchor="middle" className="text-[7px] fill-foreground">{i / 10}</text>}
              </g>
            ))}
          </g>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Object Length" value={objectLen.toFixed(2)} unit="cm" />
        <DataRow label="Measured" value={measured.toFixed(2)} unit="cm" />
        <DataRow label="Significant Figures" value={sigFigs} />
      </div>}
    />
  );
}

// 2. Newton's Second Law
export function NewtonsSecondLaw() {
  const [force, setForce] = useState(50);
  const [mass, setMass] = useState(10);
  const [friction, setFriction] = useState(0);
  const netForce = Math.max(0, force - friction * mass * 9.8);
  const accel = mass > 0 ? netForce / mass : 0;
  const reset = () => { setForce(50); setMass(10); setFriction(0); };

  return (
    <SimulationLayout title="Lab: Newton's Second Law" objective="F = ma — Explore force, mass, and acceleration" theory="Newton's Second Law: The net force on an object equals its mass times acceleration." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Applied Force" value={force} onChange={setForce} min={0} max={200} unit="N" />
        <ControlGroup label="Mass" value={mass} onChange={setMass} min={1} max={50} unit="kg" />
        <ControlGroup label="Friction Coeff (μ)" value={friction} onChange={setFriction} min={0} max={1} step={0.05} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-48">
          <line x1={20} y1={140} x2={380} y2={140} stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={150} y={100} width={60} height={40} fill="hsl(var(--primary))" rx={4} />
          <text x={180} y={125} textAnchor="middle" className="text-[10px] fill-primary-foreground font-bold">{mass}kg</text>
          {force > 0 && <><line x1={210} y1={120} x2={210 + Math.min(force, 150)} y2={120} stroke="hsl(var(--accent))" strokeWidth={3} markerEnd="url(#arrow)" />
            <text x={220 + Math.min(force, 150) / 2} y={115} className="text-[9px] fill-accent">{force}N</text></>}
          {friction > 0 && netForce < force && <><line x1={150} y1={130} x2={150 - friction * 30} y2={130} stroke="#ef4444" strokeWidth={2} markerEnd="url(#arrowR)" />
            <text x={140 - friction * 15} y={128} className="text-[8px]" fill="#ef4444">f</text></>}
          <defs>
            <marker id="arrow" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto"><path d="M0,0 L8,3 L0,6" fill="hsl(var(--accent))" /></marker>
            <marker id="arrowR" markerWidth={8} markerHeight={6} refX={0} refY={3} orient="auto"><path d="M8,0 L0,3 L8,6" fill="#ef4444" /></marker>
          </defs>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Applied Force" value={force.toFixed(1)} unit="N" />
        <DataRow label="Friction Force" value={(friction * mass * 9.8).toFixed(1)} unit="N" />
        <DataRow label="Net Force" value={netForce.toFixed(1)} unit="N" />
        <DataRow label="Mass" value={mass} unit="kg" />
        <DataRow label="Acceleration" value={accel.toFixed(2)} unit="m/s²" />
      </div>}
      analysis={<p className="text-xs font-mono">F_net = F_applied - μmg = {netForce.toFixed(1)} N → a = F/m = {accel.toFixed(2)} m/s²</p>}
    />
  );
}

// 3. Pendulum Lab
export function PendulumLab() {
  const [length, setLength] = useState(1);
  const [gravity, setGravity] = useState(9.8);
  const [angle, setAngle] = useState(30);
  const period = 2 * Math.PI * Math.sqrt(length / gravity);
  const freq = 1 / period;
  const reset = () => { setLength(1); setGravity(9.8); setAngle(30); };
  const rad = (angle * Math.PI) / 180;
  const bobX = 200 + Math.sin(rad) * length * 120;
  const bobY = 30 + Math.cos(rad) * length * 120;

  return (
    <SimulationLayout title="Lab: Pendulum" objective="T = 2π√(L/g) — Investigate pendulum period" theory="Period depends on length and gravity, not mass or amplitude (for small angles)." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Length" value={length} onChange={setLength} min={0.2} max={3} step={0.1} unit="m" />
        <ControlGroup label="Gravity" value={gravity} onChange={setGravity} min={1} max={25} step={0.1} unit="m/s²" />
        <ControlGroup label="Angle" value={angle} onChange={setAngle} min={5} max={60} unit="°" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 280" className="w-full h-56">
          <line x1={200} y1={20} x2={200} y2={30} stroke="hsl(var(--border))" strokeWidth={4} />
          <rect x={150} y={15} width={100} height={10} fill="hsl(var(--muted))" rx={2} />
          <line x1={200} y1={30} x2={bobX} y2={bobY} stroke="hsl(var(--foreground))" strokeWidth={2} />
          <circle cx={bobX} cy={bobY} r={14} fill="hsl(var(--primary))" />
          <path d={`M200,30 A${length * 120},${length * 120} 0 0,1 ${200 + Math.sin(rad / 2) * length * 60},${30 + Math.cos(rad / 2) * length * 60}`} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} strokeDasharray="3,3" />
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Period (T)" value={period.toFixed(3)} unit="s" />
        <DataRow label="Frequency" value={freq.toFixed(3)} unit="Hz" />
        <DataRow label="Length" value={length.toFixed(1)} unit="m" />
        <DataRow label="Gravity" value={gravity.toFixed(1)} unit="m/s²" />
      </div>}
      analysis={<p className="text-xs font-mono">T = 2π√({length.toFixed(1)}/{gravity.toFixed(1)}) = {period.toFixed(3)} s</p>}
    />
  );
}

// 4. Wave Simulation
export function WaveSimulation() {
  const [freq, setFreq] = useState(2);
  const [amp, setAmp] = useState(40);
  const [wavelength, setWavelength] = useState(100);
  const speed = freq * wavelength;
  const reset = () => { setFreq(2); setAmp(40); setWavelength(100); };
  const points = Array.from({ length: 400 }, (_, x) => {
    const y = 100 + amp * Math.sin((2 * Math.PI * x) / wavelength);
    return `${x},${y}`;
  }).join(" ");

  return (
    <SimulationLayout title="Lab: Wave Simulation" objective="v = fλ — Explore transverse wave properties" theory="Wave speed equals frequency times wavelength." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Frequency" value={freq} onChange={setFreq} min={0.5} max={10} step={0.5} unit="Hz" />
        <ControlGroup label="Amplitude" value={amp} onChange={setAmp} min={10} max={80} unit="px" />
        <ControlGroup label="Wavelength" value={wavelength} onChange={setWavelength} min={30} max={200} unit="px" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-48">
          <line x1={0} y1={100} x2={400} y2={100} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="4,4" />
          <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          <line x1={20} y1={100 - amp} x2={20} y2={100 + amp} stroke="hsl(var(--accent))" strokeWidth={1} />
          <text x={30} y={100} className="text-[8px] fill-accent">A={amp}</text>
          <line x1={50} y1={100 - amp - 10} x2={50 + wavelength} y2={100 - amp - 10} stroke="hsl(var(--secondary))" strokeWidth={1} />
          <text x={50 + wavelength / 2} y={100 - amp - 15} textAnchor="middle" className="text-[8px] fill-secondary">λ={wavelength}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Frequency" value={freq.toFixed(1)} unit="Hz" />
        <DataRow label="Amplitude" value={amp} unit="px" />
        <DataRow label="Wavelength" value={wavelength} unit="px" />
        <DataRow label="Wave Speed" value={speed.toFixed(0)} unit="px/s" />
      </div>}
      analysis={<p className="text-xs font-mono">v = f × λ = {freq} × {wavelength} = {speed.toFixed(0)} px/s</p>}
    />
  );
}
