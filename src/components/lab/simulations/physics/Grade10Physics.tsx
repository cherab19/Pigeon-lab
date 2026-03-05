import { useState } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

// 1. Vector Addition
export function VectorAddition() {
  const [mag1, setMag1] = useState(5);
  const [ang1, setAng1] = useState(0);
  const [mag2, setMag2] = useState(5);
  const [ang2, setAng2] = useState(90);
  const r1 = (ang1 * Math.PI) / 180, r2 = (ang2 * Math.PI) / 180;
  const rx = mag1 * Math.cos(r1) + mag2 * Math.cos(r2);
  const ry = mag1 * Math.sin(r1) + mag2 * Math.sin(r2);
  const rMag = Math.sqrt(rx * rx + ry * ry);
  const rAng = (Math.atan2(ry, rx) * 180) / Math.PI;
  const s = 15;
  const reset = () => { setMag1(5); setAng1(0); setMag2(5); setAng2(90); };

  return (
    <SimulationLayout title="Lab: Vector Addition" objective="Find the resultant of two vectors" theory="Vectors add by components: Rx = Ax+Bx, Ry = Ay+By" onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Vector A Magnitude" value={mag1} onChange={setMag1} min={1} max={10} step={0.5} />
        <ControlGroup label="Vector A Angle" value={ang1} onChange={setAng1} min={0} max={360} unit="°" />
        <ControlGroup label="Vector B Magnitude" value={mag2} onChange={setMag2} min={1} max={10} step={0.5} />
        <ControlGroup label="Vector B Angle" value={ang2} onChange={setAng2} min={0} max={360} unit="°" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 300" className="w-full h-56">
          <line x1={0} y1={150} x2={400} y2={150} stroke="hsl(var(--border))" strokeWidth={0.5} />
          <line x1={200} y1={0} x2={200} y2={300} stroke="hsl(var(--border))" strokeWidth={0.5} />
          <line x1={200} y1={150} x2={200 + mag1 * s * Math.cos(r1)} y2={150 - mag1 * s * Math.sin(r1)} stroke="hsl(var(--primary))" strokeWidth={2.5} />
          <circle cx={200 + mag1 * s * Math.cos(r1)} cy={150 - mag1 * s * Math.sin(r1)} r={4} fill="hsl(var(--primary))" />
          <text x={200 + mag1 * s * Math.cos(r1) / 2} y={150 - mag1 * s * Math.sin(r1) / 2 - 8} className="text-[9px] fill-primary" textAnchor="middle">A</text>
          <line x1={200} y1={150} x2={200 + mag2 * s * Math.cos(r2)} y2={150 - mag2 * s * Math.sin(r2)} stroke="hsl(var(--secondary))" strokeWidth={2.5} />
          <circle cx={200 + mag2 * s * Math.cos(r2)} cy={150 - mag2 * s * Math.sin(r2)} r={4} fill="hsl(var(--secondary))" />
          <text x={200 + mag2 * s * Math.cos(r2) / 2} y={150 - mag2 * s * Math.sin(r2) / 2 - 8} className="text-[9px] fill-secondary" textAnchor="middle">B</text>
          <line x1={200} y1={150} x2={200 + rx * s} y2={150 - ry * s} stroke="hsl(var(--accent))" strokeWidth={3} strokeDasharray="6,3" />
          <circle cx={200 + rx * s} cy={150 - ry * s} r={5} fill="hsl(var(--accent))" />
          <text x={200 + rx * s / 2 + 10} y={150 - ry * s / 2} className="text-[9px] fill-accent font-bold">R</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="A (mag)" value={mag1.toFixed(1)} />
        <DataRow label="A (angle)" value={`${ang1}°`} />
        <DataRow label="B (mag)" value={mag2.toFixed(1)} />
        <DataRow label="B (angle)" value={`${ang2}°`} />
        <DataRow label="Resultant" value={rMag.toFixed(2)} />
        <DataRow label="Direction" value={`${rAng.toFixed(1)}°`} />
      </div>}
    />
  );
}

// 2. Acceleration Simulation
export function AccelerationSim() {
  const [u, setU] = useState(5);
  const [a, setA] = useState(2);
  const [t, setT] = useState(5);
  const v = u + a * t;
  const s = u * t + 0.5 * a * t * t;
  const reset = () => { setU(5); setA(2); setT(5); };
  const carX = Math.min(350, 30 + (s / 100) * 300);

  return (
    <SimulationLayout title="Lab: Acceleration Simulation" objective="Study uniformly accelerated motion" theory="v = u + at, s = ut + ½at²" onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Initial Velocity (u)" value={u} onChange={setU} min={0} max={20} step={0.5} unit="m/s" />
        <ControlGroup label="Acceleration (a)" value={a} onChange={setA} min={-5} max={10} step={0.5} unit="m/s²" />
        <ControlGroup label="Time (t)" value={t} onChange={setT} min={0} max={10} step={0.5} unit="s" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-44">
          <line x1={20} y1={130} x2={380} y2={130} stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={carX - 20} y={110} width={40} height={20} fill="hsl(var(--primary))" rx={4} />
          <circle cx={carX - 10} cy={132} r={4} fill="hsl(var(--foreground))" />
          <circle cx={carX + 10} cy={132} r={4} fill="hsl(var(--foreground))" />
          {Array.from({ length: 10 }, (_, i) => (
            <line key={i} x1={30 + i * 35} y1={135} x2={30 + i * 35} y2={140} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          ))}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Final Velocity" value={v.toFixed(2)} unit="m/s" />
        <DataRow label="Displacement" value={s.toFixed(2)} unit="m" />
        <DataRow label="v² - u²" value={(v * v - u * u).toFixed(2)} />
        <DataRow label="2as" value={(2 * a * s).toFixed(2)} />
      </div>}
      analysis={<p className="text-xs font-mono">v = {u} + {a}×{t} = {v.toFixed(2)} m/s | s = {u}×{t} + ½×{a}×{t}² = {s.toFixed(2)} m</p>}
    />
  );
}

// 3. Circuit Builder (Ohm's Law)
export function CircuitBuilder() {
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(100);
  const current = voltage / resistance;
  const power = voltage * current;
  const reset = () => { setVoltage(12); setResistance(100); };

  return (
    <SimulationLayout title="Lab: Circuit Builder" objective="V = IR — Build a circuit and verify Ohm's Law" theory="Current through a conductor is proportional to voltage and inversely proportional to resistance." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Voltage" value={voltage} onChange={setVoltage} min={1} max={50} step={0.5} unit="V" />
        <ControlGroup label="Resistance" value={resistance} onChange={setResistance} min={10} max={1000} step={10} unit="Ω" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <rect x={40} y={40} width={320} height={170} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} rx={10} />
          <rect x={160} y={30} width={80} height={20} fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth={1} rx={3} />
          <text x={200} y={44} textAnchor="middle" className="text-[9px] fill-foreground font-bold">{voltage}V</text>
          <text x={200} y={18} textAnchor="middle" className="text-[10px] fill-muted-foreground">Battery</text>
          <g transform="translate(155,200)">
            <rect width={90} height={16} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1} rx={3} />
            <path d="M10,8 L20,2 L30,14 L40,2 L50,14 L60,2 L70,14 L80,8" fill="none" stroke="hsl(var(--accent))" strokeWidth={1.5} />
          </g>
          <text x={200} y={235} textAnchor="middle" className="text-[10px] fill-muted-foreground">{resistance}Ω</text>
          {current > 0 && [0.25, 0.5, 0.75].map(f => (
            <circle key={f} cx={40 + f * 320} cy={125} r={3} fill="hsl(var(--accent))" opacity={0.7}>
              <animate attributeName="cx" values={`${40};${360};${360};${40}`} dur={`${2 / current}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <rect x={340} y={100} width={30} height={50} fill="hsl(var(--card))" stroke="hsl(var(--border))" rx={3} />
          <text x={355} y={120} textAnchor="middle" className="text-[7px] fill-muted-foreground">A</text>
          <text x={355} y={138} textAnchor="middle" className="text-[9px] fill-accent font-bold">{(current * 1000).toFixed(1)}</text>
          <text x={355} y={146} textAnchor="middle" className="text-[6px] fill-muted-foreground">mA</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Voltage" value={voltage.toFixed(1)} unit="V" />
        <DataRow label="Resistance" value={resistance} unit="Ω" />
        <DataRow label="Current" value={(current * 1000).toFixed(2)} unit="mA" />
        <DataRow label="Power" value={(power * 1000).toFixed(2)} unit="mW" />
      </div>}
      analysis={<p className="text-xs font-mono">I = V/R = {voltage}/{resistance} = {(current * 1000).toFixed(2)} mA | P = VI = {(power * 1000).toFixed(2)} mW</p>}
    />
  );
}

// 4. Reflection & Refraction
export function ReflectionRefraction() {
  const [incAngle, setIncAngle] = useState(30);
  const [n1] = useState(1.0);
  const [n2, setN2] = useState(1.5);
  const incRad = (incAngle * Math.PI) / 180;
  const sinRef = (n1 * Math.sin(incRad)) / n2;
  const totalInternalReflection = sinRef > 1;
  const refAngle = totalInternalReflection ? 90 : (Math.asin(sinRef) * 180) / Math.PI;
  const refRad = (refAngle * Math.PI) / 180;
  const reset = () => { setIncAngle(30); setN2(1.5); };
  const cx = 200, cy = 150;

  return (
    <SimulationLayout title="Lab: Reflection & Refraction" objective="Snell's Law: n₁sinθ₁ = n₂sinθ₂" theory="Light bends when passing between media of different refractive indices." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Angle of Incidence" value={incAngle} onChange={setIncAngle} min={0} max={89} unit="°" />
        <ControlGroup label="Medium 2 (n₂)" value={n2} onChange={setN2} min={1} max={2.5} step={0.1} />
        <p className="text-xs text-muted-foreground">n₁ = {n1} (Air)</p>
      </div>}
      workspace={
        <svg viewBox="0 0 400 300" className="w-full h-56">
          <rect x={0} y={0} width={400} height={150} fill="hsl(var(--background))" />
          <rect x={0} y={150} width={400} height={150} fill="hsl(var(--primary) / 0.15)" />
          <line x1={cx} y1={0} x2={cx} y2={300} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} strokeDasharray="4,4" />
          <line x1={200} y1={0} x2={200} y2={300} stroke="hsl(var(--border))" strokeWidth={0} />
          <line x1={cx - 120 * Math.sin(incRad)} y1={cy - 120 * Math.cos(incRad)} x2={cx} y2={cy} stroke="#eab308" strokeWidth={2.5} />
          <line x1={cx} y1={cy} x2={cx + 80 * Math.sin(incRad)} y2={cy - 80 * Math.cos(incRad)} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4,2" />
          {!totalInternalReflection && <line x1={cx} y1={cy} x2={cx + 120 * Math.sin(refRad)} y2={cy + 120 * Math.cos(refRad)} stroke="#eab308" strokeWidth={2} />}
          <text x={30} y={80} className="text-[10px] fill-muted-foreground">Air (n={n1})</text>
          <text x={30} y={200} className="text-[10px] fill-primary">Medium (n={n2})</text>
          {totalInternalReflection && <text x={cx + 10} y={cy + 30} className="text-[10px] fill-destructive font-bold">Total Internal Reflection!</text>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="θ incidence" value={`${incAngle}°`} />
        <DataRow label="θ reflection" value={`${incAngle}°`} />
        <DataRow label="θ refraction" value={totalInternalReflection ? "TIR" : `${refAngle.toFixed(1)}°`} />
        <DataRow label="n₁" value={n1} />
        <DataRow label="n₂" value={n2.toFixed(1)} />
      </div>}
      analysis={<p className="text-xs font-mono">{n1}×sin({incAngle}°) = {n2}×sin({totalInternalReflection ? "TIR" : refAngle.toFixed(1)}°) → {(n1 * Math.sin(incRad)).toFixed(3)} ≈ {totalInternalReflection ? ">1" : (n2 * Math.sin(refRad)).toFixed(3)}</p>}
    />
  );
}
