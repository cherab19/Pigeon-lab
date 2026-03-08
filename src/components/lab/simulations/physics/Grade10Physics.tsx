import { useState, useMemo } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";

// ============================================================
// UNIT 1 – VECTOR QUANTITIES
// ============================================================

// Lab 1: Vector Addition (Triangle Method)
export function VectorAddition() {
  const [mag1, setMag1] = useState(5);
  const [ang1, setAng1] = useState(0);
  const [mag2, setMag2] = useState(5);
  const [ang2, setAng2] = useState(90);
  const [showComponents, setShowComponents] = useState(false);
  const [method, setMethod] = useState<"triangle" | "parallelogram">("triangle");
  const [step, setStep] = useState(0);

  const r1 = (ang1 * Math.PI) / 180, r2 = (ang2 * Math.PI) / 180;
  const rx = mag1 * Math.cos(r1) + mag2 * Math.cos(r2);
  const ry = mag1 * Math.sin(r1) + mag2 * Math.sin(r2);
  const rMag = Math.sqrt(rx * rx + ry * ry);
  const rAng = (Math.atan2(ry, rx) * 180) / Math.PI;
  const s = 15;
  const reset = () => { setMag1(5); setAng1(0); setMag2(5); setAng2(90); setStep(0); setShowComponents(false); };

  const steps = [
    "Open the Vector Addition Simulation",
    "Select 'Add Vector A' – set magnitude and direction",
    "Draw vector A on the coordinate grid",
    "Select 'Add Vector B'",
    "Place the tail of B at the head of A (triangle method)",
    "Draw resultant from tail of A to head of B",
    "Measure magnitude and angle of R",
    "Record results in the data table",
    "Compare graphical result with calculated components",
  ];

  const ax = mag1 * Math.cos(r1), ay = mag1 * Math.sin(r1);
  const bx = mag2 * Math.cos(r2), by = mag2 * Math.sin(r2);

  return (
    <SimulationLayout title="Lab: Vector Addition (Triangle Method)" objective="Determine the resultant of two vectors using the triangle method" theory="Vectors add by components: Rx = Ax+Bx, Ry = Ay+By. The triangle method places vectors head-to-tail." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Vector A Magnitude" value={mag1} onChange={setMag1} min={1} max={10} step={0.5} />
        <ControlGroup label="Vector A Angle" value={ang1} onChange={setAng1} min={0} max={360} unit="°" />
        <ControlGroup label="Vector B Magnitude" value={mag2} onChange={setMag2} min={1} max={10} step={0.5} />
        <ControlGroup label="Vector B Angle" value={ang2} onChange={setAng2} min={0} max={360} unit="°" />
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={showComponents} onChange={e => setShowComponents(e.target.checked)} className="rounded" />
            <span className="text-muted-foreground">Show components</span>
          </label>
          <div className="flex gap-1">
            {(["triangle", "parallelogram"] as const).map(m => (
              <button key={m} onClick={() => setMethod(m)} className={`text-[10px] px-2 py-1 rounded ${method === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{m}</button>
            ))}
          </div>
        </div>
      </div>}
      workspace={
        <div className="w-full">
          <svg viewBox="0 0 400 300" className="w-full h-56">
            {/* Grid */}
            {Array.from({ length: 21 }, (_, i) => (
              <line key={`gx${i}`} x1={i * 20} y1={0} x2={i * 20} y2={300} stroke="hsl(var(--border))" strokeWidth={0.3} />
            ))}
            {Array.from({ length: 16 }, (_, i) => (
              <line key={`gy${i}`} x1={0} y1={i * 20} x2={400} y2={i * 20} stroke="hsl(var(--border))" strokeWidth={0.3} />
            ))}
            <line x1={0} y1={150} x2={400} y2={150} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
            <line x1={200} y1={0} x2={200} y2={300} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />

            {/* Vector A */}
            <line x1={200} y1={150} x2={200 + ax * s} y2={150 - ay * s} stroke="hsl(var(--primary))" strokeWidth={2.5} markerEnd="url(#arrowA)" />
            <circle cx={200 + ax * s} cy={150 - ay * s} r={4} fill="hsl(var(--primary))" />
            <text x={200 + ax * s / 2} y={150 - ay * s / 2 - 8} className="text-[9px] fill-primary font-bold" textAnchor="middle">A</text>

            {/* Vector B */}
            {method === "triangle" ? (
              <>
                <line x1={200 + ax * s} y1={150 - ay * s} x2={200 + ax * s + bx * s} y2={150 - ay * s - by * s} stroke="hsl(var(--secondary))" strokeWidth={2.5} />
                <circle cx={200 + ax * s + bx * s} cy={150 - ay * s - by * s} r={4} fill="hsl(var(--secondary))" />
                <text x={200 + ax * s + bx * s / 2} y={150 - ay * s - by * s / 2 - 8} className="text-[9px] fill-secondary font-bold" textAnchor="middle">B</text>
              </>
            ) : (
              <>
                <line x1={200} y1={150} x2={200 + bx * s} y2={150 - by * s} stroke="hsl(var(--secondary))" strokeWidth={2.5} />
                <circle cx={200 + bx * s} cy={150 - by * s} r={4} fill="hsl(var(--secondary))" />
                <text x={200 + bx * s / 2} y={150 - by * s / 2 - 8} className="text-[9px] fill-secondary font-bold" textAnchor="middle">B</text>
                {/* parallelogram sides */}
                <line x1={200 + ax * s} y1={150 - ay * s} x2={200 + rx * s} y2={150 - ry * s} stroke="hsl(var(--secondary))" strokeWidth={1} strokeDasharray="4,3" />
                <line x1={200 + bx * s} y1={150 - by * s} x2={200 + rx * s} y2={150 - ry * s} stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="4,3" />
              </>
            )}

            {/* Resultant */}
            <line x1={200} y1={150} x2={200 + rx * s} y2={150 - ry * s} stroke="hsl(var(--accent))" strokeWidth={3} strokeDasharray="6,3" />
            <circle cx={200 + rx * s} cy={150 - ry * s} r={5} fill="hsl(var(--accent))" />
            <text x={200 + rx * s / 2 + 10} y={150 - ry * s / 2} className="text-[9px] fill-accent font-bold">R</text>

            {/* Components */}
            {showComponents && (
              <>
                <line x1={200} y1={150} x2={200 + rx * s} y2={150} stroke="hsl(var(--destructive))" strokeWidth={1.5} strokeDasharray="3,2" />
                <line x1={200 + rx * s} y1={150} x2={200 + rx * s} y2={150 - ry * s} stroke="hsl(var(--destructive))" strokeWidth={1.5} strokeDasharray="3,2" />
                <text x={200 + rx * s / 2} y={145} className="text-[7px] fill-destructive" textAnchor="middle">Rx</text>
                <text x={200 + rx * s + 12} y={150 - ry * s / 2} className="text-[7px] fill-destructive" textAnchor="middle">Ry</text>
              </>
            )}
          </svg>
          <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
        </div>
      }
      liveData={<div className="space-y-1">
        <DataRow label="A (mag)" value={mag1.toFixed(1)} />
        <DataRow label="A (angle)" value={`${ang1}°`} />
        <DataRow label="B (mag)" value={mag2.toFixed(1)} />
        <DataRow label="B (angle)" value={`${ang2}°`} />
        <DataRow label="Resultant" value={rMag.toFixed(2)} />
        <DataRow label="Direction" value={`${rAng.toFixed(1)}°`} />
        {showComponents && <>
          <DataRow label="Rx" value={rx.toFixed(2)} />
          <DataRow label="Ry" value={ry.toFixed(2)} />
        </>}
      </div>}
      analysis={<p className="text-xs font-mono">R = √(Rx²+Ry²) = √({rx.toFixed(2)}²+{ry.toFixed(2)}²) = {rMag.toFixed(2)} at {rAng.toFixed(1)}°</p>}
    />
  );
}

// Lab 2: Vector Resolution
export function VectorResolution() {
  const [mag, setMag] = useState(8);
  const [angle, setAngle] = useState(45);
  const [showFormula, setShowFormula] = useState(false);
  const [step, setStep] = useState(0);

  const rad = (angle * Math.PI) / 180;
  const ax = mag * Math.cos(rad);
  const ay = mag * Math.sin(rad);
  const sc = 12;
  const reset = () => { setMag(8); setAngle(45); setStep(0); setShowFormula(false); };

  const steps = [
    "Open the Vector Resolution Simulation",
    "Insert a vector on the coordinate plane",
    "Set magnitude using the slider",
    "Adjust direction using the angle control",
    "Enable 'Show Components' option",
    "Observe horizontal component Ax",
    "Observe vertical component Ay",
    "Record values of Ax and Ay",
    "Verify using Ax = A cosθ, Ay = A sinθ",
    "Change angle and observe how components change",
    "Record at least three different measurements",
  ];

  return (
    <SimulationLayout title="Lab: Vector Resolution" objective="Resolve a vector into horizontal and vertical components" theory="Any vector can be resolved: Ax = A cosθ, Ay = A sinθ" onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Magnitude (A)" value={mag} onChange={setMag} min={1} max={15} step={0.5} />
        <ControlGroup label="Angle (θ)" value={angle} onChange={setAngle} min={0} max={360} unit="°" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={showFormula} onChange={e => setShowFormula(e.target.checked)} className="rounded" />
          <span className="text-muted-foreground">Show trigonometric formula</span>
        </label>
      </div>}
      workspace={
        <div className="w-full">
          <svg viewBox="0 0 400 300" className="w-full h-56">
            {Array.from({ length: 21 }, (_, i) => (
              <line key={`gx${i}`} x1={i * 20} y1={0} x2={i * 20} y2={300} stroke="hsl(var(--border))" strokeWidth={0.3} />
            ))}
            {Array.from({ length: 16 }, (_, i) => (
              <line key={`gy${i}`} x1={0} y1={i * 20} x2={400} y2={i * 20} stroke="hsl(var(--border))" strokeWidth={0.3} />
            ))}
            <line x1={0} y1={150} x2={400} y2={150} stroke="hsl(var(--muted-foreground))" strokeWidth={0.8} />
            <line x1={200} y1={0} x2={200} y2={300} stroke="hsl(var(--muted-foreground))" strokeWidth={0.8} />
            {/* Vector */}
            <line x1={200} y1={150} x2={200 + ax * sc} y2={150 - ay * sc} stroke="hsl(var(--primary))" strokeWidth={3} />
            <circle cx={200 + ax * sc} cy={150 - ay * sc} r={5} fill="hsl(var(--primary))" />
            <text x={200 + ax * sc / 2 - 10} y={150 - ay * sc / 2 - 10} className="text-[10px] fill-primary font-bold" textAnchor="middle">A</text>
            {/* Ax */}
            <line x1={200} y1={150} x2={200 + ax * sc} y2={150} stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5,3" />
            <text x={200 + ax * sc / 2} y={165} className="text-[9px] fill-accent font-semibold" textAnchor="middle">Ax = {ax.toFixed(2)}</text>
            {/* Ay */}
            <line x1={200 + ax * sc} y1={150} x2={200 + ax * sc} y2={150 - ay * sc} stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5,3" />
            <text x={200 + ax * sc + 30} y={150 - ay * sc / 2} className="text-[9px] fill-destructive font-semibold" textAnchor="middle">Ay = {ay.toFixed(2)}</text>
            {/* Angle arc */}
            <path d={`M ${200 + 30} 150 A 30 30 0 0 ${angle <= 180 ? 1 : 0} ${200 + 30 * Math.cos(rad)} ${150 - 30 * Math.sin(rad)}`} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            <text x={200 + 40 * Math.cos(rad / 2)} y={150 - 40 * Math.sin(rad / 2)} className="text-[8px] fill-muted-foreground">{angle}°</text>
          </svg>
          {showFormula && (
            <div className="mt-2 p-2 bg-muted rounded text-xs font-mono text-center">
              Ax = A cos θ = {mag} × cos({angle}°) = {ax.toFixed(2)} | Ay = A sin θ = {mag} × sin({angle}°) = {ay.toFixed(2)}
            </div>
          )}
          <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
        </div>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Magnitude (A)" value={mag.toFixed(1)} />
        <DataRow label="Angle (θ)" value={`${angle}°`} />
        <DataRow label="Ax (horizontal)" value={ax.toFixed(2)} />
        <DataRow label="Ay (vertical)" value={ay.toFixed(2)} />
        <DataRow label="Check: √(Ax²+Ay²)" value={Math.sqrt(ax * ax + ay * ay).toFixed(2)} />
      </div>}
    />
  );
}

// ============================================================
// UNIT 2 – UNIFORMLY ACCELERATED MOTION
// ============================================================

// Lab 3: Distance vs Displacement
export function DistanceDisplacement() {
  const [pathType, setPathType] = useState<"straight" | "zigzag" | "circular">("zigzag");
  const [progress, setProgress] = useState(50);
  const [step, setStep] = useState(0);

  const paths: Record<string, { distance: number; displacement: number; points: string }> = {
    straight: { distance: progress * 3, displacement: progress * 3, points: `50,150 ${50 + progress * 3},150` },
    zigzag: { distance: progress * 4.5, displacement: Math.abs(progress * 2 - 50) * 3, points: `50,200 ${50 + progress * 1.5},80 ${50 + progress * 3},200 ${50 + progress * 3.5},100` },
    circular: { distance: progress * Math.PI * 1.2, displacement: progress < 50 ? progress * 2.4 : Math.abs(100 - progress) * 2.4, points: "" },
  };
  const p = paths[pathType];
  const reset = () => { setProgress(50); setPathType("zigzag"); setStep(0); };

  const steps = [
    "Open the Motion Simulation",
    "Select a path type (straight, zigzag, circular)",
    "Press Start to begin motion",
    "Observe total distance traveled",
    "Observe displacement vector",
    "Record both values",
    "Repeat with different paths",
    "Compare distance and displacement values",
  ];

  return (
    <SimulationLayout title="Lab: Distance vs Displacement" objective="Distinguish between distance and displacement" theory="Distance is the total path length traveled. Displacement is the shortest straight-line distance from start to finish." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Path Type</span>
          <div className="flex gap-1">
            {(["straight", "zigzag", "circular"] as const).map(t => (
              <button key={t} onClick={() => setPathType(t)} className={`text-[10px] px-2 py-1 rounded capitalize ${pathType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
        </div>
        <ControlGroup label="Progress" value={progress} onChange={setProgress} min={0} max={100} unit="%" />
      </div>}
      workspace={
        <div className="w-full">
          <svg viewBox="0 0 400 250" className="w-full h-48">
            {pathType === "circular" ? (
              <>
                <circle cx={200} cy={130} r={80} fill="none" stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="4,4" />
                {(() => {
                  const angle = (progress / 100) * 2 * Math.PI;
                  const cx = 200 + 80 * Math.cos(-Math.PI / 2);
                  const cy = 130 + 80 * Math.sin(-Math.PI / 2);
                  const ex = 200 + 80 * Math.cos(-Math.PI / 2 + angle);
                  const ey = 130 + 80 * Math.sin(-Math.PI / 2 + angle);
                  return <>
                    <circle cx={cx} cy={cy} r={5} fill="hsl(var(--primary))" />
                    <circle cx={ex} cy={ey} r={6} fill="hsl(var(--accent))" />
                    <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="4,3" />
                    <text x={cx - 15} y={cy - 10} className="text-[8px] fill-primary">Start</text>
                    <text x={ex + 5} y={ey - 10} className="text-[8px] fill-accent">End</text>
                  </>;
                })()}
              </>
            ) : (
              <>
                <polyline points={p.points} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} />
                {p.points.split(" ").map((pt, i) => {
                  const [x, y] = pt.split(",").map(Number);
                  return <circle key={i} cx={x} cy={y} r={4} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />;
                })}
                {(() => {
                  const pts = p.points.split(" ");
                  const [sx, sy] = pts[0].split(",").map(Number);
                  const [ex, ey] = pts[pts.length - 1].split(",").map(Number);
                  return <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5,3" />;
                })()}
              </>
            )}
          </svg>
          <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
        </div>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Path Type" value={pathType} />
        <DataRow label="Distance" value={p.distance.toFixed(1)} unit="m" />
        <DataRow label="Displacement" value={p.displacement.toFixed(1)} unit="m" />
        <DataRow label="Ratio (d/D)" value={p.displacement > 0 ? (p.distance / p.displacement).toFixed(2) : "∞"} />
      </div>}
      analysis={<p className="text-xs font-mono">Distance ({p.distance.toFixed(1)} m) ≥ Displacement ({p.displacement.toFixed(1)} m). Equal only for straight-line motion.</p>}
    />
  );
}

// Lab 4: Acceleration Simulation (enhanced)
export function AccelerationSim() {
  const [u, setU] = useState(5);
  const [a, setA] = useState(2);
  const [t, setT] = useState(5);
  const [step, setStep] = useState(0);

  const v = u + a * t;
  const s = u * t + 0.5 * a * t * t;
  const reset = () => { setU(5); setA(2); setT(5); setStep(0); };
  const carX = Math.min(350, 30 + Math.max(0, (s / 150) * 300));

  const steps = [
    "Open the Acceleration Simulation",
    "Set the initial velocity (u)",
    "Adjust the acceleration slider (a)",
    "Set the time interval",
    "Press Start Simulation",
    "Observe the motion of the object",
    "Record position at different time intervals",
    "Observe the velocity–time graph",
    "Observe the position–time graph",
    "Verify: v = u + at",
  ];

  // Graph data
  const graphPoints = useMemo(() => {
    const pts: { t: number; v: number; s: number }[] = [];
    for (let i = 0; i <= 10; i++) {
      const ti = i;
      pts.push({ t: ti, v: u + a * ti, s: u * ti + 0.5 * a * ti * ti });
    }
    return pts;
  }, [u, a]);

  const maxV = Math.max(...graphPoints.map(p => Math.abs(p.v)), 1);
  const maxS = Math.max(...graphPoints.map(p => Math.abs(p.s)), 1);

  return (
    <SimulationLayout title="Lab: Uniform Acceleration" objective="Study uniformly accelerated motion and kinematic equations" theory="v = u + at, s = ut + ½at². These equations describe motion along a straight line with constant acceleration." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Initial Velocity (u)" value={u} onChange={setU} min={0} max={20} step={0.5} unit="m/s" />
        <ControlGroup label="Acceleration (a)" value={a} onChange={setA} min={-5} max={10} step={0.5} unit="m/s²" />
        <ControlGroup label="Time (t)" value={t} onChange={setT} min={0} max={10} step={0.5} unit="s" />
      </div>}
      workspace={
        <div className="w-full space-y-2">
          {/* Track */}
          <svg viewBox="0 0 400 80" className="w-full h-16">
            <line x1={20} y1={50} x2={380} y2={50} stroke="hsl(var(--border))" strokeWidth={2} />
            <rect x={carX - 20} y={30} width={40} height={20} fill="hsl(var(--primary))" rx={4} />
            <circle cx={carX - 10} cy={52} r={4} fill="hsl(var(--foreground))" />
            <circle cx={carX + 10} cy={52} r={4} fill="hsl(var(--foreground))" />
            {Array.from({ length: 10 }, (_, i) => (
              <line key={i} x1={30 + i * 35} y1={55} x2={30 + i * 35} y2={60} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
            ))}
          </svg>
          {/* v-t graph */}
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-[8px] text-muted-foreground text-center mb-1">Velocity–Time</p>
              <svg viewBox="0 0 200 100" className="w-full h-20 bg-muted/30 rounded">
                <line x1={20} y1={90} x2={190} y2={90} stroke="hsl(var(--border))" strokeWidth={0.5} />
                <line x1={20} y1={10} x2={20} y2={90} stroke="hsl(var(--border))" strokeWidth={0.5} />
                <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} points={graphPoints.map((p, i) => `${20 + i * 17},${90 - (p.v / maxV) * 75}`).join(" ")} />
                {/* highlight current t */}
                <circle cx={20 + t * 17} cy={90 - (v / maxV) * 75} r={3} fill="hsl(var(--accent))" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[8px] text-muted-foreground text-center mb-1">Position–Time</p>
              <svg viewBox="0 0 200 100" className="w-full h-20 bg-muted/30 rounded">
                <line x1={20} y1={90} x2={190} y2={90} stroke="hsl(var(--border))" strokeWidth={0.5} />
                <line x1={20} y1={10} x2={20} y2={90} stroke="hsl(var(--border))" strokeWidth={0.5} />
                <polyline fill="none" stroke="hsl(var(--accent))" strokeWidth={1.5} points={graphPoints.map((p, i) => `${20 + i * 17},${90 - (p.s / maxS) * 75}`).join(" ")} />
                <circle cx={20 + t * 17} cy={90 - (s / maxS) * 75} r={3} fill="hsl(var(--primary))" />
              </svg>
            </div>
          </div>
          <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
        </div>
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

// ============================================================
// UNIT 3 – ELASTICITY & EQUILIBRIUM
// ============================================================

// Lab 5: Stress–Strain
export function StressStrainLab() {
  const [force, setForce] = useState(50);
  const [material, setMaterial] = useState<"steel" | "copper" | "rubber">("steel");
  const [step, setStep] = useState(0);

  const props: Record<string, { E: number; area: number; L0: number; yield: number; color: string }> = {
    steel: { E: 200, area: 1e-6, L0: 1, yield: 400, color: "hsl(var(--primary))" },
    copper: { E: 120, area: 1e-6, L0: 1, yield: 200, color: "hsl(var(--accent))" },
    rubber: { E: 5, area: 1e-6, L0: 1, yield: 15, color: "hsl(var(--destructive))" },
  };
  const m = props[material];
  const stress = force / (m.area * 1e6); // MPa
  const strain = stress / m.E;
  const extension = strain * m.L0 * 1000; // mm
  const isElastic = stress < m.yield;
  const reset = () => { setForce(50); setMaterial("steel"); setStep(0); };

  const steps = [
    "Open the Elasticity Simulation",
    "Select a material (steel, copper, rubber)",
    "Note the initial length of the wire",
    "Apply a small force using the force slider",
    "Measure the extension of the wire",
    "Record the force and extension",
    "Increase the force gradually",
    "Record new extension values",
    "Continue until deformation becomes nonlinear",
    "Plot stress vs strain graph",
    "Determine Young's modulus",
  ];

  // Simple stress-strain curve points
  const curvePoints = useMemo(() => {
    const pts: string[] = [];
    for (let f = 0; f <= 500; f += 10) {
      const s = f / (m.area * 1e6);
      const e = s < m.yield ? s / m.E : (m.yield / m.E) + (s - m.yield) / (m.E * 0.1);
      const x = 30 + (e / (m.yield / m.E * 3)) * 150;
      const y = 170 - (s / (m.yield * 1.5)) * 150;
      if (x <= 190 && y >= 10) pts.push(`${x},${y}`);
    }
    return pts.join(" ");
  }, [material]);

  const wireLen = 100 + extension * 2;

  return (
    <SimulationLayout title="Lab: Stress–Strain Experiment" objective="Determine the relationship between stress and strain" theory="Stress = Force/Area, Strain = Extension/Original Length. In the elastic region: Stress = E × Strain (Hooke's Law)." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Material</span>
          <div className="flex gap-1">
            {(["steel", "copper", "rubber"] as const).map(mt => (
              <button key={mt} onClick={() => setMaterial(mt)} className={`text-[10px] px-2 py-1 rounded capitalize ${material === mt ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{mt}</button>
            ))}
          </div>
        </div>
        <ControlGroup label="Applied Force" value={force} onChange={setForce} min={0} max={500} step={10} unit="N" />
      </div>}
      workspace={
        <div className="w-full space-y-2">
          <div className="flex gap-4">
            {/* Wire visualization */}
            <svg viewBox="0 0 100 200" className="w-20 h-44">
              <rect x={35} y={10} width={30} height={15} fill="hsl(var(--muted))" stroke="hsl(var(--border))" rx={2} />
              <line x1={50} y1={25} x2={50} y2={25 + wireLen} stroke={m.color} strokeWidth={isElastic ? 3 : 4} />
              <rect x={35} y={25 + wireLen} width={30} height={20} fill="hsl(var(--foreground))" rx={3} opacity={0.6} />
              <text x={50} y={25 + wireLen + 14} textAnchor="middle" className="text-[8px] fill-background font-bold">{force}N</text>
            </svg>
            {/* Stress-strain graph */}
            <svg viewBox="0 0 200 190" className="flex-1 h-44">
              <text x={100} y={12} textAnchor="middle" className="text-[8px] fill-muted-foreground">Stress vs Strain</text>
              <line x1={30} y1={170} x2={190} y2={170} stroke="hsl(var(--border))" strokeWidth={0.5} />
              <line x1={30} y1={170} x2={30} y2={15} stroke="hsl(var(--border))" strokeWidth={0.5} />
              <text x={110} y={185} className="text-[7px] fill-muted-foreground" textAnchor="middle">Strain</text>
              <text x={12} y={95} className="text-[7px] fill-muted-foreground" textAnchor="middle" transform="rotate(-90,12,95)">Stress</text>
              <polyline fill="none" stroke={m.color} strokeWidth={1.5} points={curvePoints} />
              {/* Current point */}
              {(() => {
                const e = stress < m.yield ? stress / m.E : (m.yield / m.E) + (stress - m.yield) / (m.E * 0.1);
                const x = 30 + (e / (m.yield / m.E * 3)) * 150;
                const y = 170 - (stress / (m.yield * 1.5)) * 150;
                return x <= 190 && y >= 10 ? <circle cx={x} cy={y} r={4} fill="hsl(var(--accent))" /> : null;
              })()}
              {/* Yield line */}
              <line x1={30} y1={170 - (m.yield / (m.yield * 1.5)) * 150} x2={190} y2={170 - (m.yield / (m.yield * 1.5)) * 150} stroke="hsl(var(--destructive))" strokeWidth={0.5} strokeDasharray="3,3" />
              <text x={192} y={170 - (m.yield / (m.yield * 1.5)) * 150 + 3} className="text-[6px] fill-destructive">Yield</text>
            </svg>
          </div>
          <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
        </div>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Material" value={material} />
        <DataRow label="Force" value={force} unit="N" />
        <DataRow label="Stress" value={stress.toFixed(1)} unit="MPa" />
        <DataRow label="Strain" value={strain.toFixed(5)} />
        <DataRow label="Extension" value={extension.toFixed(3)} unit="mm" />
        <DataRow label="Young's Mod." value={m.E} unit="GPa" />
        <DataRow label="Region" value={isElastic ? "Elastic" : "Plastic"} />
      </div>}
    />
  );
}

// Lab 6: Torque & Equilibrium
export function TorqueEquilibrium() {
  const [m1, setM1] = useState(5);
  const [d1, setD1] = useState(3);
  const [m2, setM2] = useState(3);
  const [d2, setD2] = useState(5);
  const [step, setStep] = useState(0);

  const g = 9.8;
  const torqueCW = m1 * g * d1;
  const torqueCCW = m2 * g * d2;
  const balanced = Math.abs(torqueCW - torqueCCW) < 1;
  const tiltAngle = Math.min(15, Math.max(-15, (torqueCW - torqueCCW) * 0.1));
  const reset = () => { setM1(5); setD1(3); setM2(3); setD2(5); setStep(0); };

  const steps = [
    "Open the Torque Simulation",
    "Place a beam on the pivot",
    "Add a weight on the left side",
    "Record the distance from the pivot",
    "Add another weight on the right side",
    "Adjust position until beam balances",
    "Record the forces and distances",
    "Calculate clockwise torque: τ = F × d",
    "Calculate anticlockwise torque",
    "Verify both torques are equal",
  ];

  return (
    <SimulationLayout title="Lab: Torque & Equilibrium" objective="Verify the principle of moments" theory="For equilibrium: ΣClockwise Torques = ΣAnticlockwise Torques. Torque = Force × Distance from pivot." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Mass Left (kg)" value={m1} onChange={setM1} min={1} max={10} step={0.5} unit="kg" />
        <ControlGroup label="Distance Left (m)" value={d1} onChange={setD1} min={0.5} max={5} step={0.5} unit="m" />
        <ControlGroup label="Mass Right (kg)" value={m2} onChange={setM2} min={1} max={10} step={0.5} unit="kg" />
        <ControlGroup label="Distance Right (m)" value={d2} onChange={setD2} min={0.5} max={5} step={0.5} unit="m" />
      </div>}
      workspace={
        <div className="w-full">
          <svg viewBox="0 0 400 200" className="w-full h-44">
            {/* Pivot */}
            <polygon points="200,180 190,200 210,200" fill="hsl(var(--muted-foreground))" />
            {/* Beam */}
            <g transform={`rotate(${tiltAngle}, 200, 180)`}>
              <rect x={50} y={175} width={300} height={10} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} rx={3} />
              {/* Left weight */}
              {(() => {
                const wx = 200 - d1 * 30;
                return <>
                  <rect x={wx - 12} y={185} width={24} height={20} fill="hsl(var(--primary))" rx={3} />
                  <text x={wx} y={199} textAnchor="middle" className="text-[8px] fill-primary-foreground font-bold">{m1}kg</text>
                  <line x1={wx} y1={170} x2={wx} y2={175} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
                </>;
              })()}
              {/* Right weight */}
              {(() => {
                const wx = 200 + d2 * 30;
                return <>
                  <rect x={wx - 12} y={185} width={24} height={20} fill="hsl(var(--accent))" rx={3} />
                  <text x={wx} y={199} textAnchor="middle" className="text-[8px] fill-accent-foreground font-bold">{m2}kg</text>
                  <line x1={wx} y1={170} x2={wx} y2={175} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
                </>;
              })()}
              {/* Distance markers */}
              <text x={200 - d1 * 15} y={168} textAnchor="middle" className="text-[7px] fill-muted-foreground">{d1}m</text>
              <text x={200 + d2 * 15} y={168} textAnchor="middle" className="text-[7px] fill-muted-foreground">{d2}m</text>
            </g>
            {/* Balance indicator */}
            <circle cx={200} cy={30} r={15} fill={balanced ? "hsl(var(--primary) / 0.2)" : "hsl(var(--destructive) / 0.2)"} stroke={balanced ? "hsl(var(--primary))" : "hsl(var(--destructive))"} strokeWidth={1.5} />
            <text x={200} y={34} textAnchor="middle" className={`text-[9px] font-bold ${balanced ? "fill-primary" : "fill-destructive"}`}>{balanced ? "✓" : "✗"}</text>
          </svg>
          <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
        </div>
      }
      liveData={<div className="space-y-1">
        <DataRow label="CW Torque" value={torqueCW.toFixed(1)} unit="N·m" />
        <DataRow label="CCW Torque" value={torqueCCW.toFixed(1)} unit="N·m" />
        <DataRow label="Net Torque" value={(torqueCW - torqueCCW).toFixed(1)} unit="N·m" />
        <DataRow label="Balanced?" value={balanced ? "Yes ✓" : "No ✗"} />
      </div>}
      analysis={<p className="text-xs font-mono">τ_CW = {m1}×{g}×{d1} = {torqueCW.toFixed(1)} N·m | τ_CCW = {m2}×{g}×{d2} = {torqueCCW.toFixed(1)} N·m</p>}
    />
  );
}

// ============================================================
// UNIT 4 – ELECTRICITY
// ============================================================

// Lab 7: Circuit Builder (Ohm's Law) – enhanced
export function CircuitBuilder() {
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(100);
  const [step, setStep] = useState(0);

  const current = voltage / resistance;
  const power = voltage * current;
  const reset = () => { setVoltage(12); setResistance(100); setStep(0); };

  const steps = [
    "Open the Circuit Builder Simulation",
    "Drag battery, resistor, ammeter, and voltmeter onto the board",
    "Connect the circuit correctly",
    "Ensure ammeter is in series",
    "Ensure voltmeter is in parallel",
    "Turn on the switch",
    "Record the current reading",
    "Measure voltage across resistor",
    "Change battery voltage",
    "Record new current values",
    "Plot a V–I graph",
    "Verify the graph is a straight line",
  ];

  // V-I data points
  const viPoints = useMemo(() => {
    const pts: string[] = [];
    for (let v = 0; v <= 50; v += 5) {
      const i = v / resistance;
      pts.push(`${30 + (v / 50) * 150},${160 - (i / (50 / resistance)) * 140}`);
    }
    return pts.join(" ");
  }, [resistance]);

  return (
    <SimulationLayout title="Lab: Ohm's Law – Circuit Builder" objective="Build a circuit and verify Ohm's Law (V = IR)" theory="Ohm's Law: V = IR. Current is proportional to voltage and inversely proportional to resistance." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Voltage" value={voltage} onChange={setVoltage} min={1} max={50} step={0.5} unit="V" />
        <ControlGroup label="Resistance" value={resistance} onChange={setResistance} min={10} max={1000} step={10} unit="Ω" />
      </div>}
      workspace={
        <div className="w-full space-y-2">
          <svg viewBox="0 0 400 250" className="w-full h-48">
            {/* Circuit */}
            <rect x={40} y={40} width={320} height={170} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} rx={10} />
            {/* Battery */}
            <rect x={160} y={30} width={80} height={20} fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth={1} rx={3} />
            <text x={200} y={44} textAnchor="middle" className="text-[9px] fill-foreground font-bold">{voltage}V</text>
            <text x={200} y={18} textAnchor="middle" className="text-[10px] fill-muted-foreground">Battery</text>
            {/* Resistor */}
            <g transform="translate(155,200)">
              <rect width={90} height={16} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1} rx={3} />
              <path d="M10,8 L20,2 L30,14 L40,2 L50,14 L60,2 L70,14 L80,8" fill="none" stroke="hsl(var(--accent))" strokeWidth={1.5} />
            </g>
            <text x={200} y={235} textAnchor="middle" className="text-[10px] fill-muted-foreground">{resistance}Ω</text>
            {/* Current flow */}
            {current > 0 && [0.25, 0.5, 0.75].map(f => (
              <circle key={f} cx={40 + f * 320} cy={125} r={3} fill="hsl(var(--accent))" opacity={0.7}>
                <animate attributeName="cx" values={`${40};${360};${360};${40}`} dur={`${Math.max(0.5, 2 / current)}s`} repeatCount="indefinite" />
              </circle>
            ))}
            {/* Ammeter */}
            <rect x={340} y={100} width={30} height={50} fill="hsl(var(--card))" stroke="hsl(var(--border))" rx={3} />
            <text x={355} y={120} textAnchor="middle" className="text-[7px] fill-muted-foreground">A</text>
            <text x={355} y={138} textAnchor="middle" className="text-[9px] fill-accent font-bold">{(current * 1000).toFixed(1)}</text>
            <text x={355} y={146} textAnchor="middle" className="text-[6px] fill-muted-foreground">mA</text>
          </svg>
          {/* V-I Graph */}
          <div>
            <p className="text-[8px] text-muted-foreground text-center mb-1">V–I Graph</p>
            <svg viewBox="0 0 200 170" className="w-full h-24 bg-muted/30 rounded">
              <line x1={30} y1={160} x2={190} y2={160} stroke="hsl(var(--border))" strokeWidth={0.5} />
              <line x1={30} y1={160} x2={30} y2={10} stroke="hsl(var(--border))" strokeWidth={0.5} />
              <text x={110} y={170} className="text-[6px] fill-muted-foreground" textAnchor="middle">Voltage (V)</text>
              <text x={10} y={85} className="text-[6px] fill-muted-foreground" textAnchor="middle" transform="rotate(-90,10,85)">Current</text>
              <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} points={viPoints} />
              {(() => {
                const x = 30 + (voltage / 50) * 150;
                const y = 160 - (current / (50 / resistance)) * 140;
                return <circle cx={x} cy={y} r={3} fill="hsl(var(--accent))" />;
              })()}
            </svg>
          </div>
          <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
        </div>
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

// ============================================================
// UNIT 5 – MAGNETISM
// ============================================================

// Lab 8: Magnetic Field Visualization
export function MagneticFieldLab() {
  const [reversed, setReversed] = useState(false);
  const [showFilings, setShowFilings] = useState(true);
  const [compassX, setCompassX] = useState(50);
  const [compassY, setCompassY] = useState(50);
  const [step, setStep] = useState(0);

  const reset = () => { setReversed(false); setShowFilings(true); setCompassX(50); setCompassY(50); setStep(0); };

  const steps = [
    "Open the Magnetism Simulation",
    "Place a bar magnet on the workspace",
    "Turn on iron filings mode",
    "Observe the pattern formed",
    "Drag compass near the magnet",
    "Observe direction of the needle",
    "Move compass to different points",
    "Record magnetic field direction",
    "Reverse the magnet polarity",
    "Observe changes in field direction",
  ];

  // Field lines
  const fieldLines = useMemo(() => {
    const lines: { points: string }[] = [];
    const cx = 200, cy = 100;
    for (let yOff = -40; yOff <= 40; yOff += 20) {
      if (yOff === 0) continue;
      const pts: string[] = [];
      for (let x = -120; x <= 120; x += 5) {
        const dx = x;
        const dy = yOff * (1 + Math.abs(x) / 200);
        const curve = yOff * Math.cos((x / 120) * Math.PI * 0.5) * 0.8;
        pts.push(`${cx + (reversed ? -dx : dx)},${cy + curve}`);
      }
      lines.push({ points: pts.join(" ") });
    }
    return lines;
  }, [reversed]);

  // Compass angle based on position
  const cxPos = compassX * 3.5 + 25;
  const cyPos = compassY * 1.5 + 30;
  const dx = cxPos - 200;
  const dy = cyPos - 100;
  const compassAngle = (Math.atan2(dy, dx) * 180) / Math.PI + (reversed ? 180 : 0);

  return (
    <SimulationLayout title="Lab: Magnetic Field Around a Magnet" objective="Visualize magnetic field lines around a bar magnet" theory="Magnetic field lines emerge from the North pole and enter the South pole. The pattern shows field strength and direction." onReset={reset}
      equipment={<div className="space-y-4">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={showFilings} onChange={e => setShowFilings(e.target.checked)} className="rounded" />
          <span className="text-muted-foreground">Show iron filings</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={reversed} onChange={e => setReversed(e.target.checked)} className="rounded" />
          <span className="text-muted-foreground">Reverse polarity</span>
        </label>
        <ControlGroup label="Compass X" value={compassX} onChange={setCompassX} min={0} max={100} />
        <ControlGroup label="Compass Y" value={compassY} onChange={setCompassY} min={0} max={100} />
      </div>}
      workspace={
        <div className="w-full">
          <svg viewBox="0 0 400 200" className="w-full h-44">
            {/* Field lines */}
            {showFilings && fieldLines.map((l, i) => (
              <polyline key={i} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={0.8} points={l.points} opacity={0.5} />
            ))}
            {/* Center field line */}
            {showFilings && (
              <>
                <line x1={80} y1={100} x2={150} y2={100} stroke="hsl(var(--muted-foreground))" strokeWidth={0.8} opacity={0.5} />
                <line x1={250} y1={100} x2={320} y2={100} stroke="hsl(var(--muted-foreground))" strokeWidth={0.8} opacity={0.5} />
              </>
            )}
            {/* Bar magnet */}
            <rect x={150} y={85} width={50} height={30} fill="hsl(var(--destructive))" rx={3} />
            <rect x={200} y={85} width={50} height={30} fill="hsl(var(--primary))" rx={3} />
            <text x={175} y={105} textAnchor="middle" className="text-[10px] fill-white font-bold">{reversed ? "S" : "N"}</text>
            <text x={225} y={105} textAnchor="middle" className="text-[10px] fill-white font-bold">{reversed ? "N" : "S"}</text>
            {/* Compass */}
            <g transform={`translate(${cxPos}, ${cyPos})`}>
              <circle r={12} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
              <line x1={0} y1={0} x2={10 * Math.cos(compassAngle * Math.PI / 180)} y2={10 * Math.sin(compassAngle * Math.PI / 180)} stroke="hsl(var(--destructive))" strokeWidth={2} />
              <line x1={0} y1={0} x2={-8 * Math.cos(compassAngle * Math.PI / 180)} y2={-8 * Math.sin(compassAngle * Math.PI / 180)} stroke="hsl(var(--primary))" strokeWidth={1.5} />
              <circle r={2} fill="hsl(var(--foreground))" />
            </g>
          </svg>
          <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
        </div>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Polarity" value={reversed ? "Reversed" : "Normal"} />
        <DataRow label="Iron Filings" value={showFilings ? "ON" : "OFF"} />
        <DataRow label="Compass Angle" value={`${compassAngle.toFixed(0)}°`} />
        <DataRow label="Compass Position" value={`(${compassX}, ${compassY})`} />
      </div>}
    />
  );
}

// ============================================================
// UNIT 6 – OPTICS
// ============================================================

// Lab 9: Reflection of Light
export function ReflectionLab() {
  const [incAngle, setIncAngle] = useState(30);
  const [step, setStep] = useState(0);

  const incRad = (incAngle * Math.PI) / 180;
  const reset = () => { setIncAngle(30); setStep(0); };
  const cx = 200, cy = 150;

  const steps = [
    "Open the Optics Simulation",
    "Place a plane mirror on the stage",
    "Turn on the laser source",
    "Direct the light ray toward the mirror",
    "Adjust the angle of incidence",
    "Observe the reflected ray",
    "Measure the angle of incidence",
    "Measure the angle of reflection",
    "Record both angles",
    "Repeat for different angles",
    "Verify: Angle of incidence = Angle of reflection",
  ];

  return (
    <SimulationLayout title="Lab: Reflection of Light" objective="Verify the law of reflection" theory="Law of Reflection: The angle of incidence equals the angle of reflection. Both angles are measured from the normal." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Angle of Incidence" value={incAngle} onChange={setIncAngle} min={0} max={85} unit="°" />
      </div>}
      workspace={
        <div className="w-full">
          <svg viewBox="0 0 400 300" className="w-full h-56">
            {/* Mirror surface */}
            <line x1={100} y1={cy} x2={300} y2={cy} stroke="hsl(var(--primary))" strokeWidth={4} />
            <rect x={100} y={cy} width={200} height={8} fill="hsl(var(--primary) / 0.3)" />
            {/* Normal line */}
            <line x1={cx} y1={cy - 120} x2={cx} y2={cy + 20} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4,4" />
            <text x={cx + 5} y={cy - 110} className="text-[8px] fill-muted-foreground">Normal</text>
            {/* Incident ray */}
            <line x1={cx - 100 * Math.sin(incRad)} y1={cy - 100 * Math.cos(incRad)} x2={cx} y2={cy} stroke="#eab308" strokeWidth={2.5} />
            {/* Reflected ray */}
            <line x1={cx} y1={cy} x2={cx + 100 * Math.sin(incRad)} y2={cy - 100 * Math.cos(incRad)} stroke="#ef4444" strokeWidth={2.5} />
            {/* Angle arcs */}
            <path d={`M ${cx} ${cy - 30} A 30 30 0 0 0 ${cx - 30 * Math.sin(incRad)} ${cy - 30 * Math.cos(incRad)}`} fill="none" stroke="#eab308" strokeWidth={1.5} />
            <path d={`M ${cx} ${cy - 30} A 30 30 0 0 1 ${cx + 30 * Math.sin(incRad)} ${cy - 30 * Math.cos(incRad)}`} fill="none" stroke="#ef4444" strokeWidth={1.5} />
            {/* Angle labels */}
            <text x={cx - 45 * Math.sin(incRad / 2)} y={cy - 45 * Math.cos(incRad / 2)} className="text-[9px] fill-foreground font-semibold" textAnchor="middle">θᵢ={incAngle}°</text>
            <text x={cx + 45 * Math.sin(incRad / 2)} y={cy - 45 * Math.cos(incRad / 2)} className="text-[9px] fill-foreground font-semibold" textAnchor="middle">θᵣ={incAngle}°</text>
            {/* Protractor overlay */}
            {[0, 15, 30, 45, 60, 75, 90].map(a => {
              const ar = (a * Math.PI) / 180;
              return (
                <g key={a}>
                  <line x1={cx - 70 * Math.sin(ar)} y1={cy - 70 * Math.cos(ar)} x2={cx - 65 * Math.sin(ar)} y2={cy - 65 * Math.cos(ar)} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
                  <line x1={cx + 70 * Math.sin(ar)} y1={cy - 70 * Math.cos(ar)} x2={cx + 65 * Math.sin(ar)} y2={cy - 65 * Math.cos(ar)} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
                </g>
              );
            })}
          </svg>
          <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
        </div>
      }
      liveData={<div className="space-y-1">
        <DataRow label="θ incidence" value={`${incAngle}°`} />
        <DataRow label="θ reflection" value={`${incAngle}°`} />
        <DataRow label="θᵢ = θᵣ?" value="Yes ✓" />
      </div>}
      analysis={<p className="text-xs font-mono">Law verified: θᵢ = θᵣ = {incAngle}°. Both measured from the normal to the mirror surface.</p>}
    />
  );
}

// Lab 10: Refraction (Snell's Law) – enhanced
export function ReflectionRefraction() {
  const [incAngle, setIncAngle] = useState(30);
  const [n1] = useState(1.0);
  const [n2, setN2] = useState(1.5);
  const [step, setStep] = useState(0);

  const incRad = (incAngle * Math.PI) / 180;
  const sinRef = (n1 * Math.sin(incRad)) / n2;
  const totalInternalReflection = sinRef > 1;
  const refAngle = totalInternalReflection ? 90 : (Math.asin(sinRef) * 180) / Math.PI;
  const refRad = (refAngle * Math.PI) / 180;
  const reset = () => { setIncAngle(30); setStep(0); };
  const cx = 200, cy = 150;

  const steps = [
    "Open the Refraction Simulation",
    "Set medium type (air → glass/water)",
    "Direct light ray toward interface",
    "Adjust the angle of incidence",
    "Observe the refracted ray",
    "Measure angles of incidence and refraction",
    "Record both angles",
    "Repeat for different angles",
    "Find critical angle for total internal reflection",
  ];

  return (
    <SimulationLayout title="Lab: Refraction – Snell's Law" objective="Investigate Snell's law: n₁sinθ₁ = n₂sinθ₂" theory="Light bends when passing between media of different refractive indices. At the critical angle, total internal reflection occurs." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Angle of Incidence" value={incAngle} onChange={setIncAngle} min={0} max={89} unit="°" />
        <ControlGroup label="Medium 2 (n₂)" value={n2} onChange={v => { setN2(v); }} min={1} max={2.5} step={0.1} />
        <p className="text-xs text-muted-foreground">n₁ = {n1} (Air)</p>
      </div>}
      workspace={
        <div className="w-full">
          <svg viewBox="0 0 400 300" className="w-full h-56">
            <rect x={0} y={0} width={400} height={150} fill="hsl(var(--background))" />
            <rect x={0} y={150} width={400} height={150} fill="hsl(var(--primary) / 0.15)" />
            <line x1={cx} y1={0} x2={cx} y2={300} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} strokeDasharray="4,4" />
            {/* Incident ray */}
            <line x1={cx - 120 * Math.sin(incRad)} y1={cy - 120 * Math.cos(incRad)} x2={cx} y2={cy} stroke="#eab308" strokeWidth={2.5} />
            {/* Reflected ray */}
            <line x1={cx} y1={cy} x2={cx + 80 * Math.sin(incRad)} y2={cy - 80 * Math.cos(incRad)} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4,2" />
            {/* Refracted ray */}
            {!totalInternalReflection && <line x1={cx} y1={cy} x2={cx + 120 * Math.sin(refRad)} y2={cy + 120 * Math.cos(refRad)} stroke="#eab308" strokeWidth={2} />}
            <text x={30} y={80} className="text-[10px] fill-muted-foreground">Air (n={n1})</text>
            <text x={30} y={200} className="text-[10px] fill-primary">Medium (n={n2})</text>
            {totalInternalReflection && <text x={cx + 10} y={cy + 30} className="text-[10px] fill-destructive font-bold">Total Internal Reflection!</text>}
          </svg>
          <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
        </div>
      }
      liveData={<div className="space-y-1">
        <DataRow label="θ incidence" value={`${incAngle}°`} />
        <DataRow label="θ reflection" value={`${incAngle}°`} />
        <DataRow label="θ refraction" value={totalInternalReflection ? "TIR" : `${refAngle.toFixed(1)}°`} />
        <DataRow label="n₁" value={n1} />
        <DataRow label="n₂" value={n2.toFixed(1)} />
        <DataRow label="Critical angle" value={n2 > n1 ? `${(Math.asin(n1 / n2) * 180 / Math.PI).toFixed(1)}°` : "N/A"} />
      </div>}
      analysis={<p className="text-xs font-mono">{n1}×sin({incAngle}°) = {n2}×sin({totalInternalReflection ? "TIR" : refAngle.toFixed(1)}°) → {(n1 * Math.sin(incRad)).toFixed(3)} ≈ {totalInternalReflection ? ">1" : (n2 * Math.sin(refRad)).toFixed(3)}</p>}
    />
  );
}
