import { useState, useMemo, useCallback } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";
import { Button } from "@/components/ui/button";

// ===================== UNIT 1: Scientific Investigation =====================

export function BoilingPointAltitude() {
  const [altitude, setAltitude] = useState(0);
  const [heating, setHeating] = useState(false);
  const [step, setStep] = useState(0);
  const boilingPoint = 100 - altitude * 0.0034;
  const [records, setRecords] = useState<{ alt: number; temp: number }[]>([]);

  const steps = [
    "Open the Boiling Point Simulation",
    "Observe the beaker and thermometer",
    "Set altitude to 0 m",
    "Turn on the heater",
    "Watch until water boils",
    "Record the boiling temperature",
    "Repeat for 500 m, 1000 m, 2000 m",
    "Record results in data table",
    "Plot Boiling Point vs Altitude graph",
    "Write a conclusion",
  ];

  const recordData = () => {
    if (!records.find(r => r.alt === altitude)) {
      setRecords(prev => [...prev, { alt: altitude, temp: +boilingPoint.toFixed(1) }]);
    }
  };

  const reset = () => { setAltitude(0); setHeating(false); setStep(0); setRecords([]); };

  return (
    <SimulationLayout title="Lab: Boiling Point vs Altitude" objective="Investigate how altitude affects the boiling point of water" theory="At higher altitudes, atmospheric pressure decreases, lowering the boiling point. Approx −0.34°C per 100 m." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Altitude" value={altitude} onChange={v => { setAltitude(v); setStep(Math.max(step, 2)); }} min={0} max={3000} step={100} unit="m" />
        <Button size="sm" className="w-full" variant={heating ? "destructive" : "default"} onClick={() => { setHeating(!heating); if (!heating) setStep(Math.max(step, 3)); }}>
          {heating ? "Stop Heater" : "Turn On Heater"}
        </Button>
        <Button size="sm" variant="outline" className="w-full" onClick={recordData}>Record Data Point</Button>
      </div>}
      workspace={
        <svg viewBox="0 0 400 260" className="w-full h-56">
          {/* Beaker */}
          <rect x={140} y={80} width={120} height={130} rx={4} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--border))" strokeWidth={2} />
          <rect x={145} y={90} width={110} height={115} rx={2} fill="hsl(210 80% 60% / 0.3)" />
          {/* Water level */}
          <rect x={145} y={120} width={110} height={85} fill="hsl(210 80% 60% / 0.5)" rx={1} />
          {/* Thermometer */}
          <rect x={195} y={60} width={10} height={100} rx={5} fill="hsl(var(--muted))" stroke="hsl(var(--border))" />
          <rect x={197} y={70} width={6} height={heating ? 80 : 40} rx={3} fill="#ef4444" />
          <text x={210} y={75} className="text-[10px] fill-foreground font-bold">{boilingPoint.toFixed(1)}°C</text>
          {/* Heating element */}
          <rect x={150} y={215} width={100} height={12} rx={3} fill={heating ? "#ef4444" : "hsl(var(--muted))"} />
          {heating && <>
            <circle cx={170} cy={115} r={3} fill="hsl(var(--background))" opacity={0.6}><animate attributeName="cy" values="115;95;85" dur="1.5s" repeatCount="indefinite" /></circle>
            <circle cx={200} cy={110} r={2} fill="hsl(var(--background))" opacity={0.5}><animate attributeName="cy" values="110;90;80" dur="1.8s" repeatCount="indefinite" /></circle>
            <circle cx={230} cy={118} r={3} fill="hsl(var(--background))" opacity={0.6}><animate attributeName="cy" values="118;98;88" dur="1.3s" repeatCount="indefinite" /></circle>
          </>}
          <text x={200} y={250} textAnchor="middle" className="text-[9px] fill-muted-foreground">Altitude: {altitude} m</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Altitude" value={altitude} unit="m" />
        <DataRow label="Boiling Point" value={boilingPoint.toFixed(1)} unit="°C" />
        <DataRow label="Heater" value={heating ? "ON" : "OFF"} />
        {records.length > 0 && <>
          <h4 className="text-[10px] font-semibold text-muted-foreground mt-2 uppercase">Recorded Data</h4>
          {records.map(r => <DataRow key={r.alt} label={`${r.alt} m`} value={r.temp} unit="°C" />)}
        </>}
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ===================== UNIT 2: Vectors =====================

export function VectorAddition11() {
  const [magA, setMagA] = useState(5);
  const [angA, setAngA] = useState(30);
  const [magB, setMagB] = useState(4);
  const [angB, setAngB] = useState(120);
  const [showComponents, setShowComponents] = useState(false);
  const [showResultant, setShowResultant] = useState(true);
  const [step, setStep] = useState(0);

  const radA = (angA * Math.PI) / 180;
  const radB = (angB * Math.PI) / 180;
  const ax = magA * Math.cos(radA), ay = magA * Math.sin(radA);
  const bx = magB * Math.cos(radB), by = magB * Math.sin(radB);
  const rx = ax + bx, ry = ay + by;
  const rMag = Math.sqrt(rx * rx + ry * ry);
  const rAng = (Math.atan2(ry, rx) * 180) / Math.PI;

  const steps = [
    "Open the Vector Addition Simulation",
    "Observe the coordinate grid",
    "Set vector A magnitude",
    "Set vector A direction angle",
    "Place vector B on the grid",
    "Adjust B magnitude and direction",
    "Drag B tail to head of A",
    "Draw resultant vector",
    "Observe resultant magnitude and direction",
    "Record and verify with parallelogram method",
  ];

  const s = 25; // scale
  const cx = 200, cy = 150;
  const reset = () => { setMagA(5); setAngA(30); setMagB(4); setAngB(120); setStep(0); };

  return (
    <SimulationLayout title="Lab: Vector Addition" objective="Determine the resultant of two vectors using graphical methods" theory="Vectors add by components: Rx = Ax+Bx, Ry = Ay+By. Triangle method places vectors head-to-tail." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Vector A Magnitude" value={magA} onChange={v => { setMagA(v); setStep(Math.max(step, 2)); }} min={1} max={10} step={0.5} />
        <ControlGroup label="Vector A Angle" value={angA} onChange={v => { setAngA(v); setStep(Math.max(step, 3)); }} min={0} max={360} unit="°" />
        <ControlGroup label="Vector B Magnitude" value={magB} onChange={v => { setMagB(v); setStep(Math.max(step, 4)); }} min={1} max={10} step={0.5} />
        <ControlGroup label="Vector B Angle" value={angB} onChange={v => { setAngB(v); setStep(Math.max(step, 5)); }} min={0} max={360} unit="°" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={showComponents} onChange={() => setShowComponents(!showComponents)} className="rounded" /> Show Components
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={showResultant} onChange={() => setShowResultant(!showResultant)} className="rounded" /> Show Resultant
        </label>
      </div>}
      workspace={
        <svg viewBox="0 0 400 300" className="w-full h-60">
          <defs>
            <marker id="aA" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto"><path d="M0,0 L8,3 L0,6" fill="hsl(var(--primary))" /></marker>
            <marker id="aB" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto"><path d="M0,0 L8,3 L0,6" fill="#22c55e" /></marker>
            <marker id="aR" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto"><path d="M0,0 L8,3 L0,6" fill="#ef4444" /></marker>
          </defs>
          {/* Grid */}
          {Array.from({ length: 17 }, (_, i) => <line key={`gv${i}`} x1={i * 25} y1={0} x2={i * 25} y2={300} stroke="hsl(var(--border))" strokeWidth={0.3} />)}
          {Array.from({ length: 13 }, (_, i) => <line key={`gh${i}`} x1={0} y1={i * 25} x2={400} y2={300 > 0 ? i * 25 : 0} stroke="hsl(var(--border))" strokeWidth={0.3} />)}
          {/* Axes */}
          <line x1={0} y1={cy} x2={400} y2={cy} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          <line x1={cx} y1={0} x2={cx} y2={300} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          {/* Vector A */}
          <line x1={cx} y1={cy} x2={cx + ax * s} y2={cy - ay * s} stroke="hsl(var(--primary))" strokeWidth={2.5} markerEnd="url(#aA)" />
          <text x={cx + ax * s * 0.5 + 5} y={cy - ay * s * 0.5 - 5} className="text-[9px] fill-primary font-bold">A</text>
          {/* Vector B from head of A */}
          <line x1={cx + ax * s} y1={cy - ay * s} x2={cx + ax * s + bx * s} y2={cy - ay * s - by * s} stroke="#22c55e" strokeWidth={2.5} markerEnd="url(#aB)" />
          <text x={cx + ax * s + bx * s * 0.5 + 5} y={cy - ay * s - by * s * 0.5 - 5} className="text-[9px] font-bold" fill="#22c55e">B</text>
          {/* Resultant */}
          {showResultant && <line x1={cx} y1={cy} x2={cx + rx * s} y2={cy - ry * s} stroke="#ef4444" strokeWidth={2} strokeDasharray="6,3" markerEnd="url(#aR)" />}
          {showResultant && <text x={cx + rx * s * 0.5 - 10} y={cy - ry * s * 0.5 + 15} className="text-[9px] font-bold" fill="#ef4444">R</text>}
          {/* Components */}
          {showComponents && <>
            <line x1={cx} y1={cy} x2={cx + ax * s} y2={cy} stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="3,3" />
            <line x1={cx + ax * s} y1={cy} x2={cx + ax * s} y2={cy - ay * s} stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="3,3" />
          </>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Ax" value={ax.toFixed(2)} />
        <DataRow label="Ay" value={ay.toFixed(2)} />
        <DataRow label="Bx" value={bx.toFixed(2)} />
        <DataRow label="By" value={by.toFixed(2)} />
        <DataRow label="Resultant" value={rMag.toFixed(2)} />
        <DataRow label="Direction" value={rAng.toFixed(1)} unit="°" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function FieldDisplacement() {
  const [segments, setSegments] = useState<{ dist: number; dir: string }[]>([
    { dist: 40, dir: "N" }, { dist: 30, dir: "E" },
  ]);
  const [step, setStep] = useState(0);

  const dirMap: Record<string, [number, number]> = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  const points = useMemo(() => {
    const pts: [number, number][] = [[200, 200]];
    segments.forEach(s => {
      const [dx, dy] = dirMap[s.dir] || [0, 0];
      const [lx, ly] = pts[pts.length - 1];
      pts.push([lx + dx * s.dist * 2, ly + dy * s.dist * 2]);
    });
    return pts;
  }, [segments]);

  const totalDist = segments.reduce((s, seg) => s + seg.dist, 0);
  const [fx, fy] = points[points.length - 1];
  const displacement = Math.sqrt((fx - 200) ** 2 + (fy - 200) ** 2) / 2;

  const steps = [
    "Observe the field and compass",
    "Set displacement segments",
    "Observe the trail line",
    "Compare distance vs displacement",
    "Record both values",
  ];

  const reset = () => { setSegments([{ dist: 40, dir: "N" }, { dist: 30, dir: "E" }]); setStep(0); };

  return (
    <SimulationLayout title="Lab: Field Displacement" objective="Distinguish distance traveled from displacement vector" theory="Distance is total path length (scalar). Displacement is the straight-line vector from start to end." onReset={reset}
      equipment={<div className="space-y-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex gap-1 items-center">
            <input type="number" value={seg.dist} min={5} max={80} onChange={e => { const ns = [...segments]; ns[i] = { ...ns[i], dist: +e.target.value }; setSegments(ns); }} className="w-14 px-1 py-0.5 text-xs rounded bg-muted border border-border" />
            <select value={seg.dir} onChange={e => { const ns = [...segments]; ns[i] = { ...ns[i], dir: e.target.value }; setSegments(ns); }} className="px-1 py-0.5 text-xs rounded bg-muted border border-border">
              {["N", "S", "E", "W"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        ))}
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setSegments([...segments, { dist: 20, dir: "N" }])}>+ Add Segment</Button>
      </div>}
      workspace={
        <svg viewBox="0 0 400 400" className="w-full h-56">
          <rect x={0} y={0} width={400} height={400} fill="hsl(120 30% 90% / 0.2)" />
          {/* Grid */}
          {Array.from({ length: 21 }, (_, i) => <><line key={`gv${i}`} x1={i * 20} y1={0} x2={i * 20} y2={400} stroke="hsl(var(--border))" strokeWidth={0.2} /><line key={`gh${i}`} x1={0} y1={i * 20} x2={400} y2={i * 20} stroke="hsl(var(--border))" strokeWidth={0.2} /></>)}
          {/* Compass */}
          <text x={370} y={20} className="text-[10px] fill-muted-foreground font-bold">N</text>
          <text x={370} y={55} className="text-[10px] fill-muted-foreground font-bold">S</text>
          <text x={385} y={38} className="text-[10px] fill-muted-foreground font-bold">E</text>
          <text x={355} y={38} className="text-[10px] fill-muted-foreground font-bold">W</text>
          {/* Path */}
          <polyline points={points.map(p => p.join(",")).join(" ")} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          {/* Displacement */}
          <line x1={200} y1={200} x2={fx} y2={fy} stroke="#ef4444" strokeWidth={2} strokeDasharray="6,3" />
          {/* Start/end markers */}
          <circle cx={200} cy={200} r={5} fill="hsl(var(--primary))" />
          <circle cx={fx} cy={fy} r={5} fill="#ef4444" />
          <text x={205} y={195} className="text-[8px] fill-primary">Start</text>
          <text x={fx + 5} y={fy - 5} className="text-[8px]" fill="#ef4444">End</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Distance" value={totalDist.toFixed(1)} unit="m" />
        <DataRow label="Displacement" value={displacement.toFixed(1)} unit="m" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ===================== UNIT 3: Motion =====================

export function UniformMotion() {
  const [velocity, setVelocity] = useState(5);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);

  const distance = velocity * time;

  const steps = [
    "Open the Uniform Motion Simulation",
    "Observe the object on the track",
    "Set the initial velocity",
    "Click Start",
    "Observe the object moving",
    "Record position every second",
    "Fill the distance–time table",
    "Plot the distance–time graph",
    "Determine speed from slope",
    "Compare with preset velocity",
  ];

  const reset = () => { setVelocity(5); setRunning(false); setTime(0); setStep(0); };

  // Simple time stepping via button
  const tick = () => { setTime(t => Math.min(t + 1, 10)); setStep(Math.max(step, 5)); };

  return (
    <SimulationLayout title="Lab: Uniform Motion" objective="Observe motion with constant velocity and plot distance-time graph" theory="For uniform motion, distance = velocity × time. The d-t graph is a straight line." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Velocity" value={velocity} onChange={v => { setVelocity(v); setStep(Math.max(step, 2)); }} min={1} max={15} step={0.5} unit="m/s" />
        <Button size="sm" className="w-full" onClick={tick}>Advance 1 second</Button>
        <Button size="sm" variant="outline" className="w-full" onClick={() => setTime(0)}>Reset Timer</Button>
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-44">
          {/* Track */}
          <rect x={20} y={85} width={360} height={30} rx={4} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} />
          {/* Object position */}
          {(() => {
            const maxDist = 15 * 10;
            const objX = 30 + (distance / maxDist) * 340;
            return <>
              <rect x={objX - 12} y={72} width={24} height={20} rx={3} fill="hsl(var(--primary))" />
              <text x={objX} y={85} textAnchor="middle" className="text-[8px] fill-primary-foreground font-bold">●</text>
            </>;
          })()}
          {/* Distance markers */}
          {Array.from({ length: 11 }, (_, i) => (
            <text key={i} x={30 + (i / 10) * 340} y={130} textAnchor="middle" className="text-[7px] fill-muted-foreground">{i * 15}m</text>
          ))}
          {/* Mini graph area */}
          <rect x={20} y={140} width={180} height={50} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={0.5} rx={3} />
          <text x={25} y={150} className="text-[7px] fill-muted-foreground">d-t graph</text>
          <line x1={30} y1={185} x2={190} y2={185} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          <line x1={30} y1={145} x2={30} y2={185} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          {time > 0 && <line x1={30} y1={185} x2={30 + (time / 10) * 160} y2={185 - (distance / 150) * 35} stroke="hsl(var(--primary))" strokeWidth={2} />}
          {/* v-t graph */}
          <rect x={210} y={140} width={180} height={50} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={0.5} rx={3} />
          <text x={215} y={150} className="text-[7px] fill-muted-foreground">v-t graph</text>
          <line x1={220} y1={185} x2={380} y2={185} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          <line x1={220} y1={145} x2={220} y2={185} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          {time > 0 && <line x1={220} y1={185 - (velocity / 15) * 35} x2={220 + (time / 10) * 160} y2={185 - (velocity / 15) * 35} stroke="#22c55e" strokeWidth={2} />}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Time" value={time} unit="s" />
        <DataRow label="Velocity" value={velocity} unit="m/s" />
        <DataRow label="Distance" value={distance.toFixed(1)} unit="m" />
        <DataRow label="Equation" value={`x = ${velocity}×${time}`} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function FreeFall() {
  const [height, setHeight] = useState(20);
  const [airResistance, setAirResistance] = useState(false);
  const [step, setStep] = useState(0);
  const g = 9.8;
  const tFall = Math.sqrt((2 * height) / g);
  const vFinal = g * tFall;

  const steps = [
    "Open the Free Fall Simulation",
    "Observe the ball at a height",
    "Set the height value",
    "Click Drop Object",
    "Watch the object fall",
    "Observe timer and velocity",
    "Record time and final velocity",
    "Repeat with different heights",
    "Plot a velocity–time graph",
    "Determine acceleration due to gravity",
  ];

  const reset = () => { setHeight(20); setAirResistance(false); setStep(0); };

  return (
    <SimulationLayout title="Lab: Free Fall" objective="Observe free fall motion and determine acceleration due to gravity" theory="In free fall: v = gt, h = ½gt², v² = 2gh. Acceleration is constant at g = 9.8 m/s²." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Height" value={height} onChange={v => { setHeight(v); setStep(Math.max(step, 2)); }} min={5} max={100} step={5} unit="m" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={airResistance} onChange={() => setAirResistance(!airResistance)} className="rounded" /> Air Resistance
        </label>
      </div>}
      workspace={
        <svg viewBox="0 0 400 280" className="w-full h-56">
          {/* Building */}
          <rect x={50} y={20} width={80} height={230} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} rx={2} />
          {/* Windows */}
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={65} y={30 + i * 44} width={20} height={25} fill="hsl(210 60% 70% / 0.3)" rx={1} />
          ))}
          {/* Height scale */}
          <line x1={140} y1={20} x2={140} y2={250} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
          {Array.from({ length: 6 }, (_, i) => {
            const y = 250 - (i / 5) * 230;
            return <><line key={i} x1={138} y1={y} x2={142} y2={y} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            <text x={148} y={y + 3} className="text-[7px] fill-muted-foreground">{(i * height / 5).toFixed(0)}m</text></>;
          })}
          {/* Ball animation */}
          <circle cx={90} cy={30} r={10} fill="hsl(var(--primary))">
            <animate attributeName="cy" values="30;245" dur={`${tFall}s`} repeatCount="indefinite" />
          </circle>
          {/* v-t graph mini */}
          <rect x={200} y={30} width={180} height={100} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={0.5} rx={3} />
          <text x={205} y={42} className="text-[8px] fill-muted-foreground font-semibold">v-t graph</text>
          <line x1={210} y1={125} x2={370} y2={125} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          <line x1={210} y1={45} x2={210} y2={125} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          <line x1={210} y1={125} x2={210 + (tFall / 5) * 160} y2={125 - (vFinal / 50) * 75} stroke="hsl(var(--primary))" strokeWidth={2} />
          {/* h-t graph mini */}
          <rect x={200} y={145} width={180} height={100} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={0.5} rx={3} />
          <text x={205} y={157} className="text-[8px] fill-muted-foreground font-semibold">h-t graph</text>
          <line x1={210} y1={240} x2={370} y2={240} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          <line x1={210} y1={160} x2={210} y2={240} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          <path d={`M210,160 Q${210 + (tFall / 5) * 80},160 ${210 + (tFall / 5) * 160},240`} fill="none" stroke="#22c55e" strokeWidth={2} />
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Height" value={height} unit="m" />
        <DataRow label="Time to fall" value={tFall.toFixed(2)} unit="s" />
        <DataRow label="Final velocity" value={vFinal.toFixed(1)} unit="m/s" />
        <DataRow label="g" value="9.8" unit="m/s²" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function ProjectileMotion() {
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(20);
  const [grav, setGrav] = useState(9.8);
  const [step, setStep] = useState(0);
  const rad = (angle * Math.PI) / 180;
  const range = (velocity * velocity * Math.sin(2 * rad)) / grav;
  const maxH = (velocity * velocity * Math.sin(rad) * Math.sin(rad)) / (2 * grav);
  const tof = (2 * velocity * Math.sin(rad)) / grav;
  const reset = () => { setAngle(45); setVelocity(20); setGrav(9.8); setStep(0); };

  const trajectory = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const t = (tof * i) / 50;
      const x = velocity * Math.cos(rad) * t;
      const y = velocity * Math.sin(rad) * t - 0.5 * grav * t * t;
      const sx = 40 + (x / Math.max(range, 1)) * 320;
      const sy = 220 - (y / Math.max(maxH, 1)) * 160;
      if (sy <= 220) pts.push(`${sx},${sy}`);
    }
    return pts.join(" ");
  }, [angle, velocity, grav, range, maxH, tof, rad]);

  const steps = [
    "Open the Projectile Motion Simulation",
    "Observe the cannon on the ground",
    "Set the initial velocity",
    "Set the launch angle",
    "Click Launch Projectile",
    "Observe the trajectory path",
    "Record max height, time of flight, range",
    "Repeat for different angles",
    "Compare ranges obtained",
    "Determine angle for maximum range",
  ];

  return (
    <SimulationLayout title="Lab: Projectile Motion" objective="Analyze trajectory, range, and maximum height" theory="Range = v²sin(2θ)/g, Max Height = v²sin²(θ)/(2g)" onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Launch Angle" value={angle} onChange={v => { setAngle(v); setStep(Math.max(step, 3)); }} min={5} max={85} unit="°" />
        <ControlGroup label="Initial Velocity" value={velocity} onChange={v => { setVelocity(v); setStep(Math.max(step, 2)); }} min={5} max={50} step={1} unit="m/s" />
        <ControlGroup label="Gravity" value={grav} onChange={setGrav} min={1.6} max={25} step={0.1} unit="m/s²" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          <line x1={30} y1={220} x2={380} y2={220} stroke="hsl(var(--border))" strokeWidth={2} />
          <line x1={40} y1={220} x2={40 + 30 * Math.cos(rad)} y2={220 - 30 * Math.sin(rad)} stroke="hsl(var(--foreground))" strokeWidth={3} />
          <polyline points={trajectory} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          <line x1={40} y1={220 - 160} x2={40 + (range / 2 / Math.max(range, 1)) * 320} y2={220 - 160} stroke="hsl(var(--accent))" strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={42 + (range / Math.max(range, 1)) * 320} y={235} className="text-[8px] fill-muted-foreground">R={range.toFixed(1)}m</text>
          <text x={5} y={220 - 160} className="text-[8px] fill-accent">H={maxH.toFixed(1)}m</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Range" value={range.toFixed(2)} unit="m" />
        <DataRow label="Max Height" value={maxH.toFixed(2)} unit="m" />
        <DataRow label="Time of Flight" value={tof.toFixed(2)} unit="s" />
        <DataRow label="Angle" value={`${angle}°`} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ===================== UNIT 4: Dynamics =====================

export function NewtonsSecondLaw11() {
  const [mass, setMass] = useState(5);
  const [force, setForce] = useState(20);
  const [friction, setFriction] = useState(false);
  const [mu, setMu] = useState(0.2);
  const [step, setStep] = useState(0);

  const frictionF = friction ? mu * mass * 9.8 : 0;
  const netF = Math.max(0, force - frictionF);
  const accel = netF / mass;

  const steps = [
    "Open the Force and Motion Simulation",
    "Observe the block on a surface",
    "Set the mass of the block",
    "Apply force using the slider",
    "Click Start Motion",
    "Observe acceleration",
    "Record force, mass, acceleration",
    "Repeat with different forces",
    "Compare results",
    "Verify that F = ma",
  ];

  const reset = () => { setMass(5); setForce(20); setFriction(false); setMu(0.2); setStep(0); };

  return (
    <SimulationLayout title="Lab: Newton's Second Law" objective="Verify F = ma by varying force and mass" theory="Newton's Second Law: F_net = ma. With friction, F_net = F_applied - f." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Mass" value={mass} onChange={v => { setMass(v); setStep(Math.max(step, 2)); }} min={1} max={20} step={0.5} unit="kg" />
        <ControlGroup label="Applied Force" value={force} onChange={v => { setForce(v); setStep(Math.max(step, 3)); }} min={0} max={100} step={1} unit="N" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={friction} onChange={() => setFriction(!friction)} className="rounded" /> Enable Friction
        </label>
        {friction && <ControlGroup label="Friction (μ)" value={mu} onChange={setMu} min={0.05} max={1} step={0.05} />}
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-44">
          {/* Surface */}
          <rect x={20} y={130} width={360} height={10} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} rx={2} />
          {/* Block */}
          <rect x={150} y={90} width={60} height={40} rx={4} fill="hsl(var(--primary))" />
          <text x={180} y={115} textAnchor="middle" className="text-[10px] fill-primary-foreground font-bold">{mass}kg</text>
          {/* Applied force arrow */}
          <line x1={210} y1={110} x2={210 + Math.min(force, 100) * 1.2} y2={110} stroke="#22c55e" strokeWidth={3} />
          <polygon points={`${210 + Math.min(force, 100) * 1.2},104 ${210 + Math.min(force, 100) * 1.2 + 8},110 ${210 + Math.min(force, 100) * 1.2},116`} fill="#22c55e" />
          <text x={210 + Math.min(force, 100) * 0.6} y={100} className="text-[9px] font-bold" fill="#22c55e">F={force}N</text>
          {/* Friction arrow */}
          {friction && frictionF > 0 && <>
            <line x1={150} y1={110} x2={150 - frictionF * 1.5} y2={110} stroke="#ef4444" strokeWidth={2} />
            <text x={150 - frictionF * 1.5 - 5} y={100} className="text-[8px]" fill="#ef4444">f={frictionF.toFixed(1)}N</text>
          </>}
          {/* Acceleration indicator */}
          <rect x={100} y={155} width={200} height={30} rx={4} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={0.5} />
          <text x={200} y={175} textAnchor="middle" className="text-[11px] fill-foreground font-bold">a = {accel.toFixed(2)} m/s²</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Applied Force" value={force} unit="N" />
        <DataRow label="Friction" value={frictionF.toFixed(1)} unit="N" />
        <DataRow label="Net Force" value={netF.toFixed(1)} unit="N" />
        <DataRow label="Mass" value={mass} unit="kg" />
        <DataRow label="Acceleration" value={accel.toFixed(2)} unit="m/s²" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function FrictionExperiment() {
  const [surface, setSurface] = useState<"ice" | "wood" | "sandpaper">("wood");
  const [force, setForce] = useState(10);
  const [mass, setMass] = useState(5);
  const [step, setStep] = useState(0);

  const muMap = { ice: 0.05, wood: 0.3, sandpaper: 0.7 };
  const mu = muMap[surface];
  const normal = mass * 9.8;
  const staticF = mu * normal;
  const moving = force > staticF;
  const kineticF = moving ? mu * 0.8 * normal : 0;
  const netF = moving ? force - kineticF : 0;
  const accel = moving ? netF / mass : 0;

  const steps = [
    "Open the Friction Simulation",
    "Select a surface type",
    "Place a block on the surface",
    "Gradually increase applied force",
    "Observe when block begins to move",
    "Record minimum force to move",
    "Repeat for other surfaces",
    "Compare values obtained",
    "Calculate coefficient of friction",
    "Write your conclusion",
  ];

  const reset = () => { setSurface("wood"); setForce(10); setMass(5); setStep(0); };

  return (
    <SimulationLayout title="Lab: Friction Experiment" objective="Compare static and kinetic friction on different surfaces" theory="Friction force = μN. Static friction is greater than kinetic. μ depends on surface properties." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Surface</span>
          <div className="flex gap-1">
            {(["ice", "wood", "sandpaper"] as const).map(s => (
              <Button key={s} size="sm" variant={surface === s ? "default" : "outline"} className="text-xs flex-1" onClick={() => { setSurface(s); setStep(Math.max(step, 1)); }}>{s}</Button>
            ))}
          </div>
        </div>
        <ControlGroup label="Mass" value={mass} onChange={setMass} min={1} max={20} step={0.5} unit="kg" />
        <ControlGroup label="Applied Force" value={force} onChange={v => { setForce(v); setStep(Math.max(step, 3)); }} min={0} max={150} step={1} unit="N" />
      </div>}
      workspace={
        <svg viewBox="0 0 400 180" className="w-full h-40">
          {/* Surface */}
          <rect x={20} y={120} width={360} height={15} rx={2} fill={surface === "ice" ? "hsl(200 80% 80% / 0.5)" : surface === "wood" ? "hsl(30 50% 50% / 0.4)" : "hsl(20 40% 40% / 0.5)"} stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={200} y={148} textAnchor="middle" className="text-[8px] fill-muted-foreground capitalize">{surface} (μ={mu})</text>
          {/* Block */}
          <rect x={140} y={80} width={60} height={40} rx={4} fill="hsl(var(--primary))" />
          <text x={170} y={105} textAnchor="middle" className="text-[9px] fill-primary-foreground font-bold">{mass}kg</text>
          {/* Force arrow */}
          <line x1={200} y1={100} x2={200 + force * 0.8} y2={100} stroke="#22c55e" strokeWidth={2.5} />
          <text x={200 + force * 0.4} y={90} className="text-[8px] font-bold" fill="#22c55e">F={force}N</text>
          {/* Friction arrow */}
          {force > 0 && <line x1={140} y1={100} x2={140 - Math.min(force > staticF ? kineticF : force, 80) * 0.8} y2={100} stroke="#ef4444" strokeWidth={2} />}
          {/* Status */}
          <text x={200} y={170} textAnchor="middle" className={`text-[10px] font-bold ${moving ? "fill-primary" : "fill-muted-foreground"}`}>{moving ? "MOVING" : "STATIONARY"}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Surface" value={surface} />
        <DataRow label="μ (static)" value={mu.toFixed(2)} />
        <DataRow label="μ (kinetic)" value={(mu * 0.8).toFixed(2)} />
        <DataRow label="Normal Force" value={normal.toFixed(1)} unit="N" />
        <DataRow label="Max Static f" value={staticF.toFixed(1)} unit="N" />
        <DataRow label="Status" value={moving ? "Moving" : "Static"} />
        <DataRow label="Acceleration" value={accel.toFixed(2)} unit="m/s²" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function InclinedPlane() {
  const [angle, setAngle] = useState(30);
  const [mass, setMass] = useState(5);
  const [mu, setMu] = useState(0.2);
  const [step, setStep] = useState(0);
  const rad = (angle * Math.PI) / 180;
  const mgPar = mass * 9.8 * Math.sin(rad);
  const mgPerp = mass * 9.8 * Math.cos(rad);
  const friction = mu * mgPerp;
  const netF = Math.max(0, mgPar - friction);
  const accel = netF / mass;
  const reset = () => { setAngle(30); setMass(5); setMu(0.2); setStep(0); };

  const steps = [
    "Open the Inclined Plane Simulation",
    "Place the block on the ramp",
    "Adjust the angle of inclination",
    "Observe forces acting on the block",
    "Start the motion",
    "Measure the acceleration",
    "Record values for different angles",
    "Observe force component changes",
    "Compare the results",
    "Write your conclusion",
  ];

  return (
    <SimulationLayout title="Lab: Inclined Plane" objective="Analyze forces on a block on an inclined surface" theory="Parallel force = mgsinθ, Normal force = mgcosθ, Friction = μN" onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Incline Angle" value={angle} onChange={v => { setAngle(v); setStep(Math.max(step, 2)); }} min={5} max={75} unit="°" />
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
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ===================== UNIT 5: Heat =====================

export function HeatConduction() {
  const [hotTemp, setHotTemp] = useState(100);
  const [coldTemp, setColdTemp] = useState(20);
  const [material, setMaterial] = useState<"copper" | "steel" | "glass">("copper");
  const [step, setStep] = useState(0);
  const kMap = { copper: 385, steel: 50, glass: 1 };
  const conductivity = kMap[material];
  const diff = hotTemp - coldTemp;
  const rate = conductivity * diff / 100;

  const steps = [
    "Open the Heat Conduction Simulation",
    "Observe the metal rod and heat source",
    "Turn on the heater",
    "Observe temperature change along rod",
    "Record temperature at different points",
    "Change the material of the rod",
    "Repeat the experiment",
    "Compare heat transfer rates",
    "Plot temperature vs distance graph",
    "Identify the best conductor",
  ];

  const reset = () => { setHotTemp(100); setColdTemp(20); setMaterial("copper"); setStep(0); };

  return (
    <SimulationLayout title="Lab: Heat Conduction" objective="Observe heat transfer through a rod and compare materials" theory="Heat flows from hot to cold. Rate ∝ k·ΔT. Copper conducts best, glass worst." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Hot End Temp" value={hotTemp} onChange={setHotTemp} min={50} max={300} unit="°C" />
        <ControlGroup label="Cold End Temp" value={coldTemp} onChange={setColdTemp} min={0} max={50} unit="°C" />
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Material</span>
          <div className="flex gap-1">
            {(["copper", "steel", "glass"] as const).map(m => (
              <Button key={m} size="sm" variant={material === m ? "default" : "outline"} className="text-xs flex-1 capitalize" onClick={() => { setMaterial(m); setStep(Math.max(step, 5)); }}>{m}</Button>
            ))}
          </div>
        </div>
      </div>}
      workspace={
        <svg viewBox="0 0 400 160" className="w-full h-40">
          <defs>
            <linearGradient id="heatGrad11" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <rect x={40} y={60} width={320} height={40} fill="url(#heatGrad11)" rx={6} />
          <text x={40} y={55} className="text-[10px] fill-destructive font-bold">{hotTemp}°C</text>
          <text x={340} y={55} className="text-[10px] fill-blue-500 font-bold">{coldTemp}°C</text>
          {[0.2, 0.4, 0.6, 0.8].map(f => {
            const temp = hotTemp - f * diff;
            return <text key={f} x={40 + f * 320} y={115} textAnchor="middle" className="text-[8px] fill-muted-foreground">{temp.toFixed(0)}°C</text>;
          })}
          <text x={200} y={135} textAnchor="middle" className="text-[9px] fill-muted-foreground capitalize">{material} rod — k = {conductivity} W/mK</text>
          <text x={200} y={148} textAnchor="middle" className="text-[8px] fill-muted-foreground">→ Heat Flow Direction →</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Material" value={material} />
        <DataRow label="k" value={conductivity} unit="W/mK" />
        <DataRow label="ΔT" value={diff} unit="°C" />
        <DataRow label="Heat Rate" value={rate.toFixed(1)} unit="W" />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function Calorimetry() {
  const [massA, setMassA] = useState(200);
  const [tempA, setTempA] = useState(80);
  const [massB, setMassB] = useState(300);
  const [tempB, setTempB] = useState(20);
  const [mixed, setMixed] = useState(false);
  const [step, setStep] = useState(0);

  const finalTemp = (massA * tempA + massB * tempB) / (massA + massB);
  const heatLost = massA * 4.18 * (tempA - finalTemp);
  const heatGained = massB * 4.18 * (finalTemp - tempB);

  const steps = [
    "Open the Calorimetry Simulation",
    "Observe two beakers with water",
    "Measure temperature of each beaker",
    "Pour one beaker into the other",
    "Wait for equilibrium",
    "Record final temperature",
    "Calculate heat lost and gained",
    "Verify conservation of energy",
    "Repeat with different masses",
    "Record the results",
  ];

  const reset = () => { setMassA(200); setTempA(80); setMassB(300); setTempB(20); setMixed(false); setStep(0); };

  return (
    <SimulationLayout title="Lab: Calorimetry (Mixing Water)" objective="Verify conservation of energy when mixing hot and cold water" theory="Q_lost = Q_gained. mcΔT (hot) = mcΔT (cold). Final temp depends on masses and initial temps." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Hot Water Mass" value={massA} onChange={setMassA} min={50} max={500} step={10} unit="g" />
        <ControlGroup label="Hot Water Temp" value={tempA} onChange={setTempA} min={50} max={100} unit="°C" />
        <ControlGroup label="Cold Water Mass" value={massB} onChange={setMassB} min={50} max={500} step={10} unit="g" />
        <ControlGroup label="Cold Water Temp" value={tempB} onChange={setTempB} min={5} max={30} unit="°C" />
        <Button size="sm" className="w-full" onClick={() => { setMixed(true); setStep(Math.max(step, 3)); }}>{mixed ? "Mixed!" : "Pour & Mix"}</Button>
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-44">
          {!mixed ? <>
            {/* Two beakers */}
            <rect x={60} y={60} width={80} height={100} rx={4} fill="#ef444433" stroke="hsl(var(--border))" strokeWidth={2} />
            <rect x={65} y={80} width={70} height={75} fill="#ef444466" rx={2} />
            <text x={100} y={110} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{tempA}°C</text>
            <text x={100} y={50} textAnchor="middle" className="text-[9px] fill-muted-foreground">{massA}g (hot)</text>
            <rect x={260} y={60} width={80} height={100} rx={4} fill="#3b82f633" stroke="hsl(var(--border))" strokeWidth={2} />
            <rect x={265} y={80} width={70} height={75} fill="#3b82f666" rx={2} />
            <text x={300} y={110} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{tempB}°C</text>
            <text x={300} y={50} textAnchor="middle" className="text-[9px] fill-muted-foreground">{massB}g (cold)</text>
            <text x={200} y={120} textAnchor="middle" className="text-[20px] fill-muted-foreground">→</text>
          </> : <>
            {/* Mixed beaker */}
            <rect x={140} y={40} width={120} height={130} rx={4} fill="hsl(30 60% 50% / 0.2)" stroke="hsl(var(--border))" strokeWidth={2} />
            <rect x={145} y={60} width={110} height={105} fill="hsl(30 60% 50% / 0.4)" rx={2} />
            <text x={200} y={100} textAnchor="middle" className="text-[14px] fill-foreground font-bold">{finalTemp.toFixed(1)}°C</text>
            <text x={200} y={120} textAnchor="middle" className="text-[9px] fill-muted-foreground">{massA + massB}g total</text>
            <text x={200} y={185} textAnchor="middle" className="text-[9px] fill-muted-foreground font-semibold">Equilibrium reached!</text>
          </>}
        </svg>
      }
      liveData={<div className="space-y-1">
        {mixed ? <>
          <DataRow label="Final Temp" value={finalTemp.toFixed(1)} unit="°C" />
          <DataRow label="Heat Lost" value={heatLost.toFixed(0)} unit="J" />
          <DataRow label="Heat Gained" value={heatGained.toFixed(0)} unit="J" />
          <DataRow label="Balance" value={Math.abs(heatLost - heatGained) < 1 ? "✓ Equal" : "Checking..."} />
        </> : <>
          <DataRow label="Hot Water" value={`${massA}g @ ${tempA}°C`} />
          <DataRow label="Cold Water" value={`${massB}g @ ${tempB}°C`} />
          <DataRow label="Expected Final" value={finalTemp.toFixed(1)} unit="°C" />
        </>}
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ===================== UNIT 6: Electricity =====================

export function CoulombsLaw() {
  const [q1, setQ1] = useState(5);
  const [q2, setQ2] = useState(-3);
  const [dist, setDist] = useState(2);
  const [showField, setShowField] = useState(false);
  const [step, setStep] = useState(0);
  const k = 8.99e9;
  const force = (k * Math.abs(q1 * q2) * 1e-12) / (dist * dist);
  const attractive = q1 * q2 < 0;

  const steps = [
    "Open the Electric Force Simulation",
    "Place two charges on the screen",
    "Set charge magnitudes",
    "Adjust the distance",
    "Observe force arrows",
    "Record force value",
    "Change distance and repeat",
    "Compare force values",
    "Verify inverse square law",
    "Write the conclusion",
  ];

  const reset = () => { setQ1(5); setQ2(-3); setDist(2); setShowField(false); setStep(0); };

  return (
    <SimulationLayout title="Lab: Coulomb's Law" objective="F = kq₁q₂/r² — Explore electrostatic force" theory="Like charges repel, unlike attract. Force ∝ charges, ∝ 1/r²." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Charge q₁" value={q1} onChange={v => { setQ1(v); setStep(Math.max(step, 2)); }} min={-10} max={10} step={1} unit="μC" />
        <ControlGroup label="Charge q₂" value={q2} onChange={v => { setQ2(v); setStep(Math.max(step, 2)); }} min={-10} max={10} step={1} unit="μC" />
        <ControlGroup label="Distance" value={dist} onChange={v => { setDist(v); setStep(Math.max(step, 3)); }} min={0.5} max={5} step={0.1} unit="m" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={showField} onChange={() => setShowField(!showField)} className="rounded" /> Show Field Lines
        </label>
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
            <><line x1={150} y1={100} x2={170} y2={100} stroke="#22c55e" strokeWidth={2} />
            <line x1={250} y1={100} x2={230} y2={100} stroke="#22c55e" strokeWidth={2} /></>
          ) : (
            <><line x1={95} y1={100} x2={75} y2={100} stroke="#ef4444" strokeWidth={2} />
            <line x1={305} y1={100} x2={325} y2={100} stroke="#ef4444" strokeWidth={2} /></>
          )}
          {showField && [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
            const r = (a * Math.PI) / 180;
            return <line key={a} x1={120 + 30 * Math.cos(r)} y1={100 + 30 * Math.sin(r)} x2={120 + 55 * Math.cos(r)} y2={100 + 55 * Math.sin(r)} stroke="hsl(var(--primary) / 0.3)" strokeWidth={0.8} />;
          })}
          <text x={200} y={140} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{attractive ? "Attractive" : "Repulsive"}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="q₁" value={q1} unit="μC" />
        <DataRow label="q₂" value={q2} unit="μC" />
        <DataRow label="Distance" value={dist.toFixed(1)} unit="m" />
        <DataRow label="Force" value={force.toExponential(2)} unit="N" />
        <DataRow label="Type" value={attractive ? "Attractive" : "Repulsive"} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

export function ElectricCircuit() {
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(4);
  const [step, setStep] = useState(0);
  const [on, setOn] = useState(false);

  const current = on ? voltage / resistance : 0;
  const power = on ? voltage * current : 0;

  const steps = [
    "Open the Circuit Builder Simulation",
    "Drag a battery to workspace",
    "Add a resistor",
    "Connect wires to complete circuit",
    "Place ammeter in series",
    "Place voltmeter across resistor",
    "Turn on the power supply",
    "Observe current flow",
    "Record voltage and current",
    "Verify Ohm's Law (V=IR)",
  ];

  const reset = () => { setVoltage(12); setResistance(4); setOn(false); setStep(0); };

  return (
    <SimulationLayout title="Lab: Electric Circuit (Ohm's Law)" objective="Build a circuit and verify Ohm's Law (V = IR)" theory="Ohm's Law: V = IR. Current is proportional to voltage and inversely proportional to resistance." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Voltage" value={voltage} onChange={v => { setVoltage(v); setStep(Math.max(step, 1)); }} min={1} max={24} step={1} unit="V" />
        <ControlGroup label="Resistance" value={resistance} onChange={v => { setResistance(v); setStep(Math.max(step, 2)); }} min={1} max={20} step={0.5} unit="Ω" />
        <Button size="sm" className="w-full" variant={on ? "destructive" : "default"} onClick={() => { setOn(!on); if (!on) setStep(Math.max(step, 6)); }}>
          {on ? "Turn OFF" : "Turn ON"}
        </Button>
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          {/* Circuit loop */}
          <rect x={60} y={40} width={280} height={140} rx={10} fill="none" stroke={on ? "hsl(var(--primary))" : "hsl(var(--border))"} strokeWidth={2.5} />
          {/* Battery */}
          <rect x={55} y={90} width={12} height={40} fill="hsl(var(--foreground))" rx={1} />
          <line x1={61} y1={85} x2={61} y2={90} stroke="hsl(var(--foreground))" strokeWidth={2} />
          <text x={40} y={115} className="text-[8px] fill-muted-foreground" textAnchor="middle">{voltage}V</text>
          {/* Resistor */}
          <rect x={170} y={30} width={60} height={20} rx={3} fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth={1.5} />
          <text x={200} y={25} textAnchor="middle" className="text-[8px] fill-muted-foreground">{resistance}Ω</text>
          {/* Ammeter */}
          <circle cx={310} cy={110} r={14} fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth={1.5} />
          <text x={310} y={114} textAnchor="middle" className="text-[9px] fill-foreground font-bold">A</text>
          <text x={335} y={114} className="text-[8px] fill-primary font-bold">{current.toFixed(1)}A</text>
          {/* Voltmeter */}
          <circle cx={200} cy={80} r={14} fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth={1.5} />
          <text x={200} y={84} textAnchor="middle" className="text-[9px] fill-foreground font-bold">V</text>
          <text x={220} y={80} className="text-[8px] fill-primary font-bold">{on ? voltage : 0}V</text>
          {/* Current flow dots */}
          {on && [0, 1, 2, 3].map(i => (
            <circle key={i} cx={0} cy={0} r={3} fill="hsl(var(--primary))">
              <animateMotion dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`}>
                <mpath href="#circuitPath" />
              </animateMotion>
            </circle>
          ))}
          <path id="circuitPath" d="M61,130 L61,180 L340,180 L340,40 L60,40 L60,90" fill="none" stroke="none" />
          {/* Switch indicator */}
          <circle cx={120} cy={180} r={6} fill={on ? "#22c55e" : "#ef4444"} />
          <text x={120} y={198} textAnchor="middle" className="text-[7px] fill-muted-foreground">{on ? "ON" : "OFF"}</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Voltage" value={on ? voltage : 0} unit="V" />
        <DataRow label="Current" value={current.toFixed(2)} unit="A" />
        <DataRow label="Resistance" value={resistance} unit="Ω" />
        <DataRow label="Power" value={power.toFixed(1)} unit="W" />
        <DataRow label="V = IR check" value={on ? `${voltage} = ${current.toFixed(1)}×${resistance}` : "—"} />
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}

// ===================== UNIT 7: Nuclear Physics =====================

export function RadioactiveDecay() {
  const [atoms, setAtoms] = useState(100);
  const [remaining, setRemaining] = useState(100);
  const [rounds, setRounds] = useState<number[]>([100]);
  const [step, setStep] = useState(0);

  const steps = [
    "Open the Radioactive Decay Simulation",
    "Observe the group of atoms",
    "Click Start Decay",
    "Watch atoms decay randomly",
    "Record remaining atoms each interval",
    "Continue until half decay",
    "Record the half-life",
    "Plot a decay curve",
    "Repeat for another sample",
    "Compare results",
  ];

  const decay = () => {
    const newRemaining = Math.round(remaining * (0.4 + Math.random() * 0.2)); // ~half
    setRemaining(newRemaining);
    setRounds(prev => [...prev, newRemaining]);
    setStep(Math.max(step, 3));
  };

  const reset = () => { setAtoms(100); setRemaining(100); setRounds([100]); setStep(0); };

  // Generate atom grid
  const atomGrid = useMemo(() => {
    const grid: boolean[] = [];
    for (let i = 0; i < 100; i++) grid.push(i < remaining);
    // Shuffle for visual randomness
    for (let i = grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }
    return grid;
  }, [remaining]);

  return (
    <SimulationLayout title="Lab: Radioactive Decay" objective="Observe random decay and determine half-life from decay curve" theory="Radioactive decay is random. On average, half the atoms decay each half-life period. N = N₀(½)^(t/t½)." onReset={reset}
      equipment={<div className="space-y-4">
        <Button size="sm" className="w-full" onClick={decay} disabled={remaining <= 1}>Toss / Decay Round</Button>
        <div className="text-xs text-muted-foreground">Round: {rounds.length - 1}</div>
        <div className="text-xs text-muted-foreground">Remaining: {remaining} / 100</div>
      </div>}
      workspace={
        <svg viewBox="0 0 400 280" className="w-full h-56">
          {/* Atom grid */}
          {atomGrid.map((alive, i) => {
            const x = 30 + (i % 10) * 18;
            const y = 20 + Math.floor(i / 10) * 18;
            return <circle key={i} cx={x} cy={y} r={6} fill={alive ? "hsl(var(--primary))" : "hsl(var(--muted))"} opacity={alive ? 1 : 0.2} />;
          })}
          {/* Decay curve */}
          <rect x={220} y={10} width={170} height={170} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth={0.5} rx={4} />
          <text x={225} y={25} className="text-[8px] fill-muted-foreground font-semibold">Decay Curve</text>
          <line x1={235} y1={170} x2={380} y2={170} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          <line x1={235} y1={30} x2={235} y2={170} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          {rounds.length > 1 && (
            <polyline
              points={rounds.map((r, i) => `${235 + (i / Math.max(rounds.length - 1, 1)) * 140},${170 - (r / 100) * 135}`).join(" ")}
              fill="none" stroke="hsl(var(--primary))" strokeWidth={2}
            />
          )}
          {/* Half-life line */}
          <line x1={235} y1={170 - 67.5} x2={380} y2={170 - 67.5} stroke="#ef4444" strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={382} y={170 - 65} className="text-[7px]" fill="#ef4444">50%</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Initial" value={100} />
        <DataRow label="Remaining" value={remaining} />
        <DataRow label="Decayed" value={100 - remaining} />
        <DataRow label="Rounds" value={rounds.length - 1} />
        {rounds.length > 1 && <h4 className="text-[10px] font-semibold text-muted-foreground mt-2 uppercase">History</h4>}
        {rounds.map((r, i) => i > 0 && <DataRow key={i} label={`Round ${i}`} value={r} />)}
      </div>}
      analysis={<StepByStep steps={steps} currentStep={step} onStepClick={setStep} />}
    />
  );
}
