import { useState, useMemo } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";

// ======== UNIT 1: Medical Physics — MRI Simulation ========
export function MRISimulation() {
  const [fieldStrength, setFieldStrength] = useState(1.5);
  const [pulseDuration, setPulseDuration] = useState(50);
  const [tissue, setTissue] = useState<"brain" | "muscle" | "fat">("brain");
  const [step, setStep] = useState(0);

  const tissues: Record<string, { t1: number; t2: number; color: string }> = {
    brain: { t1: 900, t2: 100, color: "hsl(var(--primary))" },
    muscle: { t1: 1200, t2: 50, color: "hsl(var(--accent))" },
    fat: { t1: 250, t2: 80, color: "hsl(var(--muted-foreground))" },
  };
  const t = tissues[tissue];
  const signalIntensity = (1 - Math.exp(-pulseDuration / t.t1)) * Math.exp(-pulseDuration / t.t2);
  const contrast = (signalIntensity * fieldStrength / 3).toFixed(3);

  const protonAngles = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 12; i++) arr.push(Math.random() * 360);
    return arr;
  }, []);

  const alignedFraction = Math.min(1, fieldStrength / 3);

  const reset = () => { setFieldStrength(1.5); setPulseDuration(50); setTissue("brain"); setStep(0); };

  const steps = [
    "Open the MRI Simulation",
    "Set the magnetic field strength",
    "Select tissue type to image",
    "Observe proton alignment in field",
    "Adjust pulse duration",
    "Apply RF pulse and observe energy absorption",
    "Observe signal release as protons relax",
    "View reconstructed image contrast",
    "Compare different tissue types",
    "Record signal intensity and contrast values",
  ];

  return (
    <SimulationLayout
      title="Lab: MRI Simulation"
      objective="Understand magnetic resonance imaging by manipulating field strength and pulse parameters"
      theory="MRI uses strong magnetic fields to align proton spins. An RF pulse tips protons, and the signal emitted during relaxation (T1/T2) creates tissue contrast."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Field Strength" value={fieldStrength} onChange={setFieldStrength} min={0.5} max={3} step={0.1} unit="T" />
          <ControlGroup label="Pulse Duration" value={pulseDuration} onChange={setPulseDuration} min={10} max={200} step={5} unit="ms" />
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Tissue Type</span>
            <div className="flex gap-1">
              {(["brain", "muscle", "fat"] as const).map(tt => (
                <button key={tt} onClick={() => setTissue(tt)} className={`text-xs px-2 py-1 rounded ${tissue === tt ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {tt.charAt(0).toUpperCase() + tt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 260" className="w-full h-56">
          {/* MRI bore */}
          <ellipse cx={200} cy={130} rx={160} ry={100} fill="none" stroke="hsl(var(--border))" strokeWidth={3} />
          <ellipse cx={200} cy={130} rx={140} ry={85} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={1} />
          {/* Magnetic field arrows */}
          {[60, 120, 180, 240, 300, 340].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={130 - 30 * alignedFraction} x2={x} y2={130 + 30 * alignedFraction} stroke="hsl(var(--primary) / 0.2)" strokeWidth={1} />
            </g>
          ))}
          {/* Protons */}
          {protonAngles.map((a, i) => {
            const cx = 130 + (i % 4) * 40;
            const cy = 90 + Math.floor(i / 4) * 40;
            const angle = alignedFraction > 0.5 ? 0 : a;
            return (
              <g key={i} transform={`rotate(${angle},${cx},${cy})`}>
                <circle cx={cx} cy={cy} r={6} fill={t.color} opacity={0.7} />
                <line x1={cx} y1={cy - 6} x2={cx} y2={cy - 12} stroke={t.color} strokeWidth={1.5} markerEnd="url(#arrowP)" />
              </g>
            );
          })}
          <defs>
            <marker id="arrowP" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={t.color} /></marker>
          </defs>
          {/* Signal bar */}
          <rect x={350} y={230 - signalIntensity * 100} width={20} height={signalIntensity * 100} fill={t.color} rx={2} opacity={0.8} />
          <text x={360} y={245} textAnchor="middle" className="text-[7px] fill-muted-foreground">Signal</text>
          <text x={200} y={18} textAnchor="middle" className="text-[9px] fill-muted-foreground font-semibold">{tissue.toUpperCase()} — B₀ = {fieldStrength} T</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Field Strength" value={fieldStrength} unit="T" />
          <DataRow label="Pulse Duration" value={pulseDuration} unit="ms" />
          <DataRow label="T1 (tissue)" value={t.t1} unit="ms" />
          <DataRow label="T2 (tissue)" value={t.t2} unit="ms" />
          <DataRow label="Signal Intensity" value={signalIntensity.toFixed(3)} />
          <DataRow label="Contrast" value={contrast} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ======== UNIT 2: Projectile Motion — Horizontal ========
export function HorizontalProjectile() {
  const [height, setHeight] = useState(2);
  const [velocity, setVelocity] = useState(4);
  const [airRes, setAirRes] = useState(false);
  const [step, setStep] = useState(0);
  const g = 9.8;

  const tof = Math.sqrt((2 * height) / g);
  const range = velocity * tof * (airRes ? 0.75 : 1);
  const vyFinal = g * tof;
  const vFinal = Math.sqrt(velocity * velocity + vyFinal * vyFinal);

  const trajectory = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const t = (tof * i) / 50;
      const x = velocity * t * (airRes ? (1 - t / tof * 0.25) : 1);
      const y = 0.5 * g * t * t;
      const sx = 60 + (x / Math.max(range, 0.1)) * 260;
      const sy = 40 + (y / Math.max(height, 0.1)) * 170;
      if (sy <= 215) pts.push(`${sx},${sy}`);
    }
    return pts.join(" ");
  }, [height, velocity, airRes, tof, range, g]);

  const reset = () => { setHeight(2); setVelocity(4); setAirRes(false); setStep(0); };

  const steps = [
    "Open the Horizontal Projectile Simulation",
    "Set the height of the table",
    "Set the initial horizontal velocity",
    "Press Start Experiment",
    "Observe the parabolic trajectory",
    "Record time of flight, range, final velocity",
    "Repeat 3–5 times with different velocities",
    "Plot Range vs Velocity graph",
    "Compare with R = v₀√(2h/g)",
    "Write your conclusion",
  ];

  return (
    <SimulationLayout
      title="Lab 1: Horizontal Projectile Motion"
      objective="Investigate the horizontal range and time of flight of a horizontally projected object"
      theory="In horizontal projection, initial vertical velocity = 0. Time to ground: t = √(2h/g). Range R = v₀ × t. Horizontal and vertical motions are independent."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Table Height" value={height} onChange={setHeight} min={0.5} max={5} step={0.1} unit="m" />
          <ControlGroup label="Initial Velocity" value={velocity} onChange={setVelocity} min={1} max={20} step={0.5} unit="m/s" />
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={airRes} onChange={e => setAirRes(e.target.checked)} className="rounded" />
            Air Resistance
          </label>
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          {/* Table */}
          <rect x={30} y={35} width={35} height={180} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={2} />
          <rect x={25} y={35} width={45} height={8} fill="hsl(var(--muted-foreground) / 0.5)" rx={1} />
          {/* Ball at launch */}
          <circle cx={60} cy={39} r={5} fill="hsl(var(--primary))" />
          <line x1={60} y1={39} x2={80} y2={39} stroke="hsl(var(--primary))" strokeWidth={1.5} markerEnd="url(#arrH)" />
          {/* Ground */}
          <line x1={25} y1={215} x2={380} y2={215} stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Trajectory */}
          <polyline points={trajectory} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray={airRes ? "4,3" : "none"} />
          {/* Landing */}
          <circle cx={60 + (range / Math.max(range, 0.1)) * 260} cy={212} r={5} fill="hsl(var(--accent))" />
          {/* Labels */}
          <text x={20} y={130} className="text-[8px] fill-muted-foreground" transform="rotate(-90,20,130)">h = {height} m</text>
          <text x={200} y={235} textAnchor="middle" className="text-[8px] fill-muted-foreground">R = {range.toFixed(2)} m</text>
          {airRes && <text x={200} y={18} textAnchor="middle" className="text-[9px] fill-destructive">Air resistance ON</text>}
          <defs><marker id="arrH" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--primary))" /></marker></defs>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Height" value={height} unit="m" />
          <DataRow label="v₀ (horiz)" value={velocity} unit="m/s" />
          <DataRow label="Time of Flight" value={tof.toFixed(3)} unit="s" />
          <DataRow label="Range" value={range.toFixed(2)} unit="m" />
          <DataRow label="vy (final)" value={vyFinal.toFixed(2)} unit="m/s" />
          <DataRow label="Final Speed" value={vFinal.toFixed(2)} unit="m/s" />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ======== UNIT 2: Projectile Motion — Angled ========
export function AngledProjectile() {
  const [velocity, setVelocity] = useState(10);
  const [angle, setAngle] = useState(45);
  const [step, setStep] = useState(0);
  const g = 9.8;
  const rad = (angle * Math.PI) / 180;
  const tof = (2 * velocity * Math.sin(rad)) / g;
  const range = (velocity * velocity * Math.sin(2 * rad)) / g;
  const maxH = (velocity * velocity * Math.sin(rad) * Math.sin(rad)) / (2 * g);

  const complementaryAngle = 90 - angle;
  const complementaryRange = (velocity * velocity * Math.sin(2 * complementaryAngle * Math.PI / 180)) / g;

  const trajectory = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const t = (tof * i) / 50;
      const x = velocity * Math.cos(rad) * t;
      const y = velocity * Math.sin(rad) * t - 0.5 * g * t * t;
      const sx = 40 + (x / Math.max(range, 0.1)) * 320;
      const sy = 210 - (y / Math.max(maxH + 1, 1)) * 170;
      pts.push(`${sx},${sy}`);
    }
    return pts.join(" ");
  }, [velocity, angle, tof, range, maxH, g, rad]);

  const reset = () => { setVelocity(10); setAngle(45); setStep(0); };

  const steps = [
    "Open the Projectile Launcher Simulation",
    "Set initial velocity (e.g. 10 m/s)",
    "Set projection angle (e.g. 15°)",
    "Press Launch and observe trajectory",
    "Record the range",
    "Repeat for angles: 15°, 30°, 45°, 60°, 75°",
    "Plot Range vs Angle graph",
    "Identify angle for maximum range",
    "Verify complementary angles give similar range",
    "Write the conclusion",
  ];

  return (
    <SimulationLayout
      title="Lab 2: Projectile Motion at an Angle"
      objective="Investigate how angle of projection affects the range"
      theory="R = v₀²sin(2θ)/g. Maximum range at 45°. Complementary angles (e.g. 30° & 60°) yield the same range."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Initial Velocity" value={velocity} onChange={setVelocity} min={5} max={30} step={0.5} unit="m/s" />
          <ControlGroup label="Launch Angle" value={angle} onChange={setAngle} min={5} max={85} step={1} unit="°" />
          {angle === 45 && <div className="text-[10px] text-primary font-semibold bg-primary/10 p-1.5 rounded">★ Maximum range angle!</div>}
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <line x1={35} y1={215} x2={380} y2={215} stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Cannon */}
          <rect x={30} y={200} width={20} height={15} fill="hsl(var(--muted-foreground))" rx={2} />
          <line x1={40} y1={207} x2={40 + 25 * Math.cos(rad)} y2={207 - 25 * Math.sin(rad)} stroke="hsl(var(--foreground))" strokeWidth={3} strokeLinecap="round" />
          {/* Trajectory */}
          <polyline points={trajectory} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          {/* Max height marker */}
          <line x1={40 + 160} y1={210 - (maxH / Math.max(maxH + 1, 1)) * 170} x2={40 + 160} y2={215} stroke="hsl(var(--accent))" strokeWidth={1} strokeDasharray="3,3" />
          <text x={40 + 165} y={210 - (maxH / Math.max(maxH + 1, 1)) * 170 - 3} className="text-[7px] fill-accent">H={maxH.toFixed(1)}m</text>
          {/* Range marker */}
          <text x={200} y={235} textAnchor="middle" className="text-[8px] fill-muted-foreground">R = {range.toFixed(2)} m</text>
          {/* Angle arc */}
          <path d={`M55,207 A15,15 0 0,0 ${40 + 15 * Math.cos(rad)},${207 - 15 * Math.sin(rad)}`} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
          <text x={58} y={200} className="text-[7px] fill-muted-foreground">{angle}°</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Velocity" value={velocity} unit="m/s" />
          <DataRow label="Angle" value={angle} unit="°" />
          <DataRow label="Range" value={range.toFixed(2)} unit="m" />
          <DataRow label="Max Height" value={maxH.toFixed(2)} unit="m" />
          <DataRow label="Time of Flight" value={tof.toFixed(3)} unit="s" />
          <DataRow label="Comp. Angle" value={complementaryAngle} unit="°" />
          <DataRow label="Comp. Range" value={complementaryRange.toFixed(2)} unit="m" />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ======== UNIT 3: Fluid Mechanics — Pressure vs Depth ========
export function FluidPressureLab() {
  const [depth, setDepth] = useState(2);
  const [density, setDensity] = useState(1000);
  const [step, setStep] = useState(0);
  const g = 9.8;
  const patm = 101325;
  const pGauge = density * g * depth;
  const pAbs = patm + pGauge;
  const reset = () => { setDepth(2); setDensity(1000); setStep(0); };

  const steps = [
    "Open the Fluid Tank Simulation",
    "Select Water as the fluid",
    "Place the pressure sensor at the surface",
    "Record pressure at depth = 0 m",
    "Move sensor deeper (e.g. 1 m)",
    "Record pressure value",
    "Repeat for depths: 0, 1, 2, 3, 4 m",
    "Plot Pressure vs Depth graph",
    "Compare with P = ρgh",
    "Explain the linear relationship",
  ];

  return (
    <SimulationLayout
      title="Lab 3: Pressure vs Depth"
      objective="Investigate how pressure varies with depth in a fluid"
      theory="P = P₀ + ρgh. Pressure increases linearly with depth. Gauge pressure is the pressure above atmospheric."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Sensor Depth" value={depth} onChange={setDepth} min={0} max={10} step={0.5} unit="m" />
          <ControlGroup label="Fluid Density" value={density} onChange={setDensity} min={500} max={13600} step={100} unit="kg/m³" />
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 260" className="w-full h-56">
          {/* Tank */}
          <rect x={80} y={20} width={140} height={220} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={2} rx={4} />
          {/* Water surface */}
          <line x1={80} y1={30} x2={220} y2={30} stroke="hsl(var(--primary) / 0.6)" strokeWidth={1.5} />
          <text x={75} y={30} textAnchor="end" className="text-[7px] fill-muted-foreground">0m</text>
          {/* Depth markers */}
          {[2, 4, 6, 8, 10].map(d => {
            const y = 30 + (d / 10) * 200;
            return y <= 235 ? (
              <g key={d}>
                <line x1={80} y1={y} x2={220} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3,3" />
                <text x={75} y={y + 3} textAnchor="end" className="text-[7px] fill-muted-foreground">{d}m</text>
              </g>
            ) : null;
          })}
          {/* Pressure sensor */}
          {(() => {
            const sy = 30 + (depth / 10) * 200;
            return (
              <g>
                <circle cx={150} cy={Math.min(sy, 235)} r={8} fill="hsl(var(--accent))" stroke="hsl(var(--accent))" strokeWidth={1} />
                <text x={165} y={Math.min(sy, 235) + 4} className="text-[8px] fill-accent font-semibold">Sensor</text>
                <line x1={150} y1={20} x2={150} y2={Math.min(sy, 235) - 8} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="2,2" />
              </g>
            );
          })()}
          {/* Pressure bar */}
          <rect x={240} y={240 - Math.min((pGauge / 200000) * 200, 200)} width={16} height={Math.min((pGauge / 200000) * 200, 200)} fill="hsl(var(--primary))" rx={2} opacity={0.6} />
          <text x={248} y={250} textAnchor="middle" className="text-[6px] fill-muted-foreground">P</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Depth" value={depth.toFixed(1)} unit="m" />
          <DataRow label="Density" value={density} unit="kg/m³" />
          <DataRow label="Gauge P" value={(pGauge / 1000).toFixed(1)} unit="kPa" />
          <DataRow label="Absolute P" value={(pAbs / 1000).toFixed(1)} unit="kPa" />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ======== UNIT 3: Fluid Mechanics — Archimedes Principle ========
export function ArchimedesPrinciple() {
  const [objectDensity, setObjectDensity] = useState(7800);
  const [volume, setVolume] = useState(0.001);
  const [submerged, setSubmerged] = useState(false);
  const [step, setStep] = useState(0);
  const g = 9.8;
  const fluidDensity = 1000;

  const weightAir = objectDensity * volume * g;
  const buoyantForce = fluidDensity * volume * g;
  const apparentWeight = weightAir - buoyantForce;

  const reset = () => { setObjectDensity(7800); setVolume(0.001); setSubmerged(false); setStep(0); };

  const steps = [
    "Open the Buoyancy Simulation",
    "Select an object (e.g. metal block)",
    "Measure weight in air",
    "Submerge the object in water",
    "Measure apparent weight",
    "Calculate buoyant force: Fb = W_air − W_water",
    "Measure volume of displaced fluid",
    "Calculate theoretical Fb = ρVg",
    "Compare measured and theoretical values",
    "Write the conclusion",
  ];

  return (
    <SimulationLayout
      title="Lab 4: Archimedes' Principle"
      objective="Verify Archimedes' Principle by comparing buoyant force with weight of displaced fluid"
      theory="Buoyant force = weight of displaced fluid = ρ_fluid × V × g. Apparent weight = actual weight − buoyant force."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Object Density" value={objectDensity} onChange={setObjectDensity} min={500} max={11000} step={100} unit="kg/m³" />
          <ControlGroup label="Volume" value={volume} onChange={setVolume} min={0.0005} max={0.005} step={0.0005} unit="m³" />
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={submerged} onChange={e => setSubmerged(e.target.checked)} className="rounded" />
            Submerge in water
          </label>
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 260" className="w-full h-56">
          {/* Beaker */}
          <rect x={80} y={80} width={140} height={150} fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth={2} rx={3} />
          <line x1={80} y1={100} x2={220} y2={100} stroke="hsl(var(--primary) / 0.4)" strokeWidth={1} />
          <text x={225} y={104} className="text-[7px] fill-muted-foreground">water</text>
          {/* Object */}
          {(() => {
            const blockY = submerged ? 140 : 30;
            const size = Math.max(15, volume * 6000);
            return (
              <g>
                <rect x={140 - size / 2} y={blockY} width={size} height={size} fill="hsl(var(--muted-foreground))" stroke="hsl(var(--foreground))" strokeWidth={1} rx={2} />
                {/* Weight arrow */}
                <line x1={150} y1={blockY + size} x2={150} y2={blockY + size + 25} stroke="hsl(var(--destructive))" strokeWidth={1.5} />
                <text x={155} y={blockY + size + 20} className="text-[7px] fill-destructive">W</text>
                {/* Buoyant force arrow */}
                {submerged && (
                  <>
                    <line x1={140} y1={blockY} x2={140} y2={blockY - 20} stroke="hsl(var(--primary))" strokeWidth={1.5} />
                    <text x={125} y={blockY - 10} className="text-[7px] fill-primary">Fb</text>
                  </>
                )}
                {/* String */}
                <line x1={150} y1={10} x2={150} y2={blockY} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="3,2" />
              </g>
            );
          })()}
          {/* Scale reading */}
          <rect x={10} y={5} width={50} height={22} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} rx={3} />
          <text x={35} y={19} textAnchor="middle" className="text-[8px] fill-foreground font-mono font-bold">
            {submerged ? apparentWeight.toFixed(1) : weightAir.toFixed(1)} N
          </text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Weight (air)" value={weightAir.toFixed(2)} unit="N" />
          <DataRow label="Buoyant Force" value={submerged ? buoyantForce.toFixed(2) : "—"} unit="N" />
          <DataRow label="Apparent W" value={submerged ? apparentWeight.toFixed(2) : "—"} unit="N" />
          <DataRow label="ρVg (theory)" value={buoyantForce.toFixed(2)} unit="N" />
          <DataRow label="Volume" value={(volume * 1e6).toFixed(0)} unit="cm³" />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ======== UNIT 4: Electromagnetism — Magnetic Field ========
export function MagneticFieldWire() {
  const [current, setCurrent] = useState(2);
  const [reversed, setReversed] = useState(false);
  const [step, setStep] = useState(0);
  const dir = reversed ? -1 : 1;
  const reset = () => { setCurrent(2); setReversed(false); setStep(0); };

  const steps = [
    "Open the Current Wire Simulation",
    "Set current to 2 A",
    "Observe magnetic field lines",
    "Increase current to 5 A",
    "Observe how field density changes",
    "Use virtual compass for field direction",
    "Apply Right Hand Rule",
    "Record observations",
    "Draw field pattern",
  ];

  return (
    <SimulationLayout
      title="Lab 5: Magnetic Field — Current-Carrying Wire"
      objective="Observe magnetic field patterns around a current-carrying conductor"
      theory="A current-carrying wire produces concentric circular magnetic field lines. Field strength B = μ₀I/(2πr). Use the Right-Hand Rule for direction."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Current" value={current} onChange={setCurrent} min={0.5} max={10} step={0.5} unit="A" />
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={reversed} onChange={e => setReversed(e.target.checked)} className="rounded" />
            Reverse Current
          </label>
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          {/* Wire cross-section */}
          <circle cx={200} cy={125} r={10} fill="hsl(var(--muted-foreground))" stroke="hsl(var(--foreground))" strokeWidth={2} />
          <text x={200} y={129} textAnchor="middle" className="text-[10px] fill-background font-bold">{reversed ? "×" : "•"}</text>
          {/* Concentric field lines */}
          {[25, 45, 65, 85, 105].map((r, i) => {
            const opacity = Math.max(0.1, 1 - i * 0.18) * Math.min(current / 5, 1);
            return (
              <g key={r}>
                <circle cx={200} cy={125} r={r} fill="none" stroke={`hsl(var(--primary) / ${opacity})`} strokeWidth={1} />
                {/* Direction arrows */}
                <circle cx={200 + dir * r} cy={125} r={2.5} fill="hsl(var(--primary))" opacity={opacity} />
                <circle cx={200 - dir * r} cy={125} r={2.5} fill="hsl(var(--primary))" opacity={opacity} />
              </g>
            );
          })}
          {/* Compass */}
          <g transform="translate(310, 60)">
            <circle cx={0} cy={0} r={15} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
            <line x1={0} y1={-10} x2={0} y2={10} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            <line x1={-10} y1={0} x2={10} y2={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            <text x={0} y={-4} textAnchor="middle" className="text-[5px] fill-destructive font-bold">N</text>
            <polygon points={`0,-10 ${dir * 3},-3 ${-dir * 3},-3`} fill="hsl(var(--destructive))" />
          </g>
          <text x={200} y={20} textAnchor="middle" className="text-[9px] fill-muted-foreground">I = {current} A ({reversed ? "into page ×" : "out of page •"})</text>
          <text x={200} y={240} textAnchor="middle" className="text-[8px] fill-muted-foreground">Right-Hand Rule: Thumb → current, Fingers → field direction</text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Current" value={current} unit="A" />
          <DataRow label="Direction" value={reversed ? "Into page" : "Out of page"} />
          <DataRow label="B at 2cm" value={((4 * Math.PI * 1e-7 * current) / (2 * Math.PI * 0.02) * 1e4).toFixed(2)} unit="×10⁻⁴ T" />
          <DataRow label="B at 5cm" value={((4 * Math.PI * 1e-7 * current) / (2 * Math.PI * 0.05) * 1e4).toFixed(2)} unit="×10⁻⁴ T" />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ======== UNIT 4: Electromagnetism — Electromagnetic Induction ========
export function ElectromagneticInduction() {
  const [magnetPos, setMagnetPos] = useState(50);
  const [speed, setSpeed] = useState(5);
  const [coilTurns, setCoilTurns] = useState(100);
  const [step, setStep] = useState(0);

  // EMF depends on rate of change of position (proxy for dΦ/dt)
  const distance = Math.abs(magnetPos - 50);
  const flux = coilTurns * speed / (distance + 5);
  const emf = magnetPos < 50 ? flux * 0.1 : magnetPos > 50 ? -flux * 0.1 : 0;

  const reset = () => { setMagnetPos(50); setSpeed(5); setCoilTurns(100); setStep(0); };

  const steps = [
    "Open Induction Simulation",
    "Insert a coil connected to galvanometer",
    "Move magnet toward the coil",
    "Observe needle deflection",
    "Stop the magnet — observe no deflection",
    "Move magnet away — observe opposite deflection",
    "Increase speed of magnet",
    "Record observations",
    "Explain using Faraday's Law",
  ];

  return (
    <SimulationLayout
      title="Lab 6: Electromagnetic Induction"
      objective="Observe induced EMF due to changing magnetic flux"
      theory="Faraday's Law: EMF = −N(dΦ/dt). Moving a magnet near a coil changes flux and induces voltage. Faster motion = larger EMF."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Magnet Position" value={magnetPos} onChange={setMagnetPos} min={0} max={100} unit="%" />
          <ControlGroup label="Speed" value={speed} onChange={setSpeed} min={1} max={10} unit="m/s" />
          <ControlGroup label="Coil Turns" value={coilTurns} onChange={setCoilTurns} min={10} max={500} step={10} unit="N" />
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          {/* Coil */}
          <ellipse cx={250} cy={125} rx={15} ry={50} fill="none" stroke="hsl(var(--accent))" strokeWidth={3} />
          <ellipse cx={255} cy={125} rx={15} ry={50} fill="none" stroke="hsl(var(--accent))" strokeWidth={2} opacity={0.5} />
          <text x={250} y={190} textAnchor="middle" className="text-[8px] fill-accent">Coil ({coilTurns} turns)</text>
          {/* Magnet */}
          {(() => {
            const mx = 40 + (magnetPos / 100) * 200;
            return (
              <g>
                <rect x={mx - 25} y={112} width={25} height={26} fill="hsl(var(--destructive))" rx={2} />
                <rect x={mx} y={112} width={25} height={26} fill="hsl(var(--primary))" rx={2} />
                <text x={mx - 12} y={129} textAnchor="middle" className="text-[9px] fill-white font-bold">N</text>
                <text x={mx + 12} y={129} textAnchor="middle" className="text-[9px] fill-white font-bold">S</text>
                {/* Motion arrow */}
                {magnetPos !== 50 && (
                  <line x1={mx + 30} y1={100} x2={mx + (magnetPos < 50 ? -15 : 45)} y2={100} stroke="hsl(var(--foreground))" strokeWidth={1.5} markerEnd="url(#arrEM)" />
                )}
              </g>
            );
          })()}
          {/* Galvanometer */}
          <circle cx={330} cy={60} r={25} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} />
          <text x={330} y={50} textAnchor="middle" className="text-[7px] fill-muted-foreground">G</text>
          {/* Needle */}
          <line x1={330} y1={65} x2={330 + emf * 80} y2={65 - Math.abs(emf) * 20} stroke="hsl(var(--destructive))" strokeWidth={1.5} />
          <circle cx={330} cy={65} r={2} fill="hsl(var(--foreground))" />
          {/* Wire from coil to galvanometer */}
          <path d="M265,85 Q290,40 305,50" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
          <path d="M265,165 Q290,200 305,70" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
          <defs><marker id="arrEM" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--foreground))" /></marker></defs>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Magnet Position" value={magnetPos} unit="%" />
          <DataRow label="Speed" value={speed} unit="m/s" />
          <DataRow label="Coil Turns" value={coilTurns} />
          <DataRow label="Induced EMF" value={(emf * 10).toFixed(2)} unit="mV" />
          <DataRow label="Flux Change" value={magnetPos === 50 ? "Zero" : magnetPos < 50 ? "Increasing" : "Decreasing"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ======== UNIT 5: Electronics — PN Junction Diode ========
export function PNJunctionDiode() {
  const [voltage, setVoltage] = useState(0.5);
  const [forwardBias, setForwardBias] = useState(true);
  const [step, setStep] = useState(0);
  const vThreshold = 0.7;

  const current = forwardBias
    ? (voltage > vThreshold ? (voltage - vThreshold) * 100 : voltage > 0.3 ? (voltage - 0.3) * 2 : 0)
    : -0.01;

  const reset = () => { setVoltage(0.5); setForwardBias(true); setStep(0); };

  const steps = [
    "Open Diode Circuit Simulation",
    "Connect circuit in forward bias",
    "Increase voltage gradually (0.1, 0.2, 0.3 V...)",
    "Record current at each voltage",
    "Plot Current vs Voltage graph",
    "Switch to reverse bias",
    "Repeat measurements",
    "Compare forward and reverse characteristics",
    "Determine threshold voltage",
  ];

  // I-V curve points
  const ivPoints = useMemo(() => {
    const pts: string[] = [];
    for (let v = 0; v <= 2; v += 0.05) {
      const i = v > vThreshold ? (v - vThreshold) * 100 : v > 0.3 ? (v - 0.3) * 2 : 0;
      const sx = 50 + (v / 2) * 160;
      const sy = 200 - Math.min(i, 130);
      pts.push(`${sx},${sy}`);
    }
    return pts.join(" ");
  }, []);

  return (
    <SimulationLayout
      title="Lab 7: PN Junction Diode I-V Characteristics"
      objective="Study current–voltage characteristics of a diode in forward and reverse bias"
      theory="A silicon diode has ~0.7V threshold. In forward bias, current rises exponentially above threshold. In reverse bias, only tiny leakage current flows."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Voltage" value={voltage} onChange={setVoltage} min={0} max={2} step={0.05} unit="V" />
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={forwardBias} onChange={e => setForwardBias(e.target.checked)} className="rounded" />
            Forward Bias
          </label>
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          {/* I-V Graph */}
          <text x={200} y={15} textAnchor="middle" className="text-[9px] fill-muted-foreground font-semibold">I-V Characteristic Curve</text>
          {/* Axes */}
          <line x1={50} y1={200} x2={220} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          <line x1={50} y1={200} x2={50} y2={50} stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={135} y={220} textAnchor="middle" className="text-[7px] fill-muted-foreground">Voltage (V)</text>
          <text x={30} y={125} className="text-[7px] fill-muted-foreground" transform="rotate(-90,30,125)">Current (mA)</text>
          {/* Forward curve */}
          <polyline points={ivPoints} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          {/* Current point */}
          {forwardBias && (
            <circle cx={50 + (voltage / 2) * 160} cy={200 - Math.min(current, 130)} r={4} fill="hsl(var(--accent))" stroke="hsl(var(--accent))" />
          )}
          {/* Threshold marker */}
          <line x1={50 + (0.7 / 2) * 160} y1={200} x2={50 + (0.7 / 2) * 160} y2={195} stroke="hsl(var(--destructive))" strokeWidth={1} />
          <text x={50 + (0.7 / 2) * 160} y={215} textAnchor="middle" className="text-[6px] fill-destructive">0.7V</text>

          {/* Diode symbol */}
          <g transform="translate(290, 100)">
            <polygon points="0,-20 20,0 0,20" fill="none" stroke="hsl(var(--foreground))" strokeWidth={2} />
            <line x1={20} y1={-20} x2={20} y2={20} stroke="hsl(var(--foreground))" strokeWidth={2} />
            <line x1={-15} y1={0} x2={0} y2={0} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
            <line x1={20} y1={0} x2={35} y2={0} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
            <text x={10} y={35} textAnchor="middle" className="text-[8px] fill-muted-foreground">{forwardBias ? "Forward" : "Reverse"}</text>
            {/* Current flow indicator */}
            {forwardBias && current > 0.1 && (
              <circle cx={-8} cy={0} r={3} fill="hsl(var(--primary))" opacity={Math.min(current / 50, 1)}>
                <animate attributeName="cx" values="-8;30" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Voltage" value={voltage.toFixed(2)} unit="V" />
          <DataRow label="Bias" value={forwardBias ? "Forward" : "Reverse"} />
          <DataRow label="Current" value={current.toFixed(2)} unit="mA" />
          <DataRow label="Threshold" value={vThreshold} unit="V" />
          <DataRow label="Conducting" value={forwardBias && voltage > vThreshold ? "Yes" : "No"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ======== UNIT 5: Electronics — Half-Wave Rectifier ========
export function HalfWaveRectifier() {
  const [acVoltage, setAcVoltage] = useState(5);
  const [freq, setFreq] = useState(50);
  const [step, setStep] = useState(0);
  const vDrop = 0.7;
  const peakOut = Math.max(0, acVoltage - vDrop);
  const reset = () => { setAcVoltage(5); setFreq(50); setStep(0); };

  const steps = [
    "Open the Rectifier Simulation",
    "Set AC voltage amplitude",
    "Observe input AC waveform",
    "Observe rectified output waveform",
    "Note the diode voltage drop (0.7V)",
    "Change frequency and observe",
    "Record peak output voltage",
    "Calculate average DC voltage",
    "Compare input and output waveforms",
  ];

  return (
    <SimulationLayout
      title="Lab: Half-Wave Rectifier"
      objective="Study half-wave rectification using a diode"
      theory="A diode conducts above ~0.7V forward bias. Half-wave rectification passes only positive half-cycles. Avg DC = V_peak/π."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="AC Voltage (peak)" value={acVoltage} onChange={setAcVoltage} min={1} max={20} step={0.5} unit="V" />
          <ControlGroup label="Frequency" value={freq} onChange={setFreq} min={10} max={200} step={10} unit="Hz" />
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <text x={200} y={15} textAnchor="middle" className="text-[10px] fill-muted-foreground font-semibold">Oscilloscope View</text>
          {/* Input waveform */}
          <text x={20} y={45} className="text-[8px] fill-muted-foreground">Input (AC)</text>
          <line x1={30} y1={70} x2={370} y2={70} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3,3" />
          {Array.from({ length: 340 }, (_, i) => {
            const x = 30 + i;
            const v = acVoltage * Math.sin((i / 340) * 4 * Math.PI);
            const pv = acVoltage * Math.sin(((i - 1) / 340) * 4 * Math.PI);
            const y = 70 - (v / acVoltage) * 35;
            const py = 70 - (pv / acVoltage) * 35;
            return i === 0 ? null : <line key={`in${i}`} x1={x - 1} y1={py} x2={x} y2={y} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />;
          })}
          {/* Output waveform */}
          <text x={20} y={140} className="text-[8px] fill-primary">Output (Rectified)</text>
          <line x1={30} y1={180} x2={370} y2={180} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3,3" />
          {Array.from({ length: 340 }, (_, i) => {
            const x = 30 + i;
            const v = acVoltage * Math.sin((i / 340) * 4 * Math.PI);
            const vOut = v > vDrop ? v - vDrop : 0;
            const pv = acVoltage * Math.sin(((i - 1) / 340) * 4 * Math.PI);
            const pOut = pv > vDrop ? pv - vDrop : 0;
            const y = 180 - (vOut / acVoltage) * 35;
            const py = 180 - (pOut / acVoltage) * 35;
            return i === 0 ? null : <line key={`out${i}`} x1={x - 1} y1={py} x2={x} y2={y} stroke="hsl(var(--primary))" strokeWidth={1.5} />;
          })}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="AC Peak" value={acVoltage.toFixed(1)} unit="V" />
          <DataRow label="Diode Drop" value={vDrop} unit="V" />
          <DataRow label="DC Peak Out" value={peakOut.toFixed(1)} unit="V" />
          <DataRow label="Frequency" value={freq} unit="Hz" />
          <DataRow label="Avg DC" value={(peakOut / Math.PI).toFixed(2)} unit="V" />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}
