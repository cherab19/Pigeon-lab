import { useState, useMemo } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";
import { Button } from "@/components/ui/button";

// ─── UNIT 2: Physical Quantities ───

// 1. Measuring Length
export function MeasuringLength() {
  const [objectLen] = useState(() => +(Math.random() * 8 + 2).toFixed(2));
  const [tool, setTool] = useState<"ruler" | "vernier" | "micrometer">("ruler");
  const [rulerPos, setRulerPos] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [step, setStep] = useState(0);

  const precision = tool === "ruler" ? 0.1 : tool === "vernier" ? 0.01 : 0.001;
  const measured = Math.abs(objectLen - rulerPos);
  const roundedMeasured = +measured.toFixed(tool === "ruler" ? 1 : tool === "vernier" ? 2 : 3);
  const errorPct = studentAnswer ? Math.abs((+studentAnswer - objectLen) / objectLen * 100).toFixed(1) : "—";

  const steps = [
    "Select a measuring tool from the controls",
    "Observe the object on the virtual table",
    "Drag the ruler to align with the object",
    "Read the measurement carefully",
    "Note the estimated digit and precision",
    "Enter your measured value below",
    "Compare error percentage",
  ];

  const reset = () => { setRulerPos(0); setStudentAnswer(""); setStep(0); setTool("ruler"); };

  return (
    <SimulationLayout title="Lab: Measuring Length & Area" objective="Measure the object using the virtual ruler and calculate area" theory="Measurement precision depends on the instrument. Rulers: 0.1 cm, Vernier: 0.01 cm, Micrometer: 0.001 cm." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Measuring Tool</span>
          {(["ruler", "vernier", "micrometer"] as const).map(t => (
            <Button key={t} variant={tool === t ? "default" : "outline"} size="sm" className="w-full capitalize" onClick={() => { setTool(t); setStep(Math.max(step, 1)); }}>
              {t}
            </Button>
          ))}
        </div>
        <ControlGroup label="Ruler Position" value={rulerPos} onChange={v => { setRulerPos(v); setStep(Math.max(step, 3)); }} min={0} max={10} step={precision} unit="cm" />
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Your Answer (cm)</label>
          <input type="number" step={precision} value={studentAnswer} onChange={e => { setStudentAnswer(e.target.value); setStep(Math.max(step, 5)); }} className="w-full rounded border border-border bg-background px-2 py-1 text-xs font-mono" placeholder="Enter measured value" />
        </div>
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-52">
          {/* Table */}
          <rect x={30} y={50} width={340} height={80} fill="hsl(var(--muted))" rx={4} stroke="hsl(var(--border))" />
          <text x={200} y={45} textAnchor="middle" className="text-[9px] fill-muted-foreground">Virtual Table</text>
          {/* Object */}
          <rect x={60} y={70} width={objectLen * 28} height={24} fill="hsl(var(--primary))" rx={3} />
          <text x={60 + objectLen * 14} y={66} textAnchor="middle" className="text-[9px] fill-muted-foreground">Object</text>
          {/* Ruler */}
          <g transform={`translate(${60 + rulerPos * 28}, 110)`}>
            <rect x={0} y={0} width={280} height={14} fill="hsl(var(--accent)/0.15)" stroke="hsl(var(--border))" rx={2} />
            {Array.from({ length: 29 }, (_, i) => (
              <g key={i}>
                <line x1={i * 10} y1={0} x2={i * 10} y2={i % 5 === 0 ? 9 : 5} stroke="hsl(var(--foreground))" strokeWidth={i % 5 === 0 ? 1 : 0.5} />
                {i % 5 === 0 && <text x={i * 10} y={-2} textAnchor="middle" className="text-[6px] fill-foreground">{(i / 10).toFixed(1)}</text>}
              </g>
            ))}
          </g>
          {/* Precision indicator */}
          <text x={200} y={145} textAnchor="middle" className="text-[8px] fill-accent">Precision: ±{precision} cm ({tool})</text>
          {/* Estimated digit highlight */}
          <rect x={140} y={155} width={120} height={20} fill="hsl(var(--primary)/0.1)" rx={3} />
          <text x={200} y={169} textAnchor="middle" className="text-[10px] fill-primary font-bold">{roundedMeasured} cm</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Object Length" value={objectLen.toFixed(2)} unit="cm" />
        <DataRow label="Measured" value={roundedMeasured} unit="cm" />
        <DataRow label="Tool Precision" value={`±${precision}`} unit="cm" />
        <DataRow label="Sig Figures" value={roundedMeasured.toString().replace(/^0\./, "").replace(/\./,"").length} />
        <DataRow label="Your Answer" value={studentAnswer || "—"} unit="cm" />
        <DataRow label="Error %" value={errorPct} unit="%" />
      </div>}
      analysis={<p className="text-xs font-mono">Area = L × W = {objectLen.toFixed(2)} × {(objectLen * 0.4).toFixed(2)} = {(objectLen * objectLen * 0.4).toFixed(2)} cm²</p>}
    />
  );
}

// 2. Beam Balance (Mass Lab)
export function BeamBalanceLab() {
  const [unknownMass] = useState(() => Math.round(Math.random() * 900 + 100));
  const [weights, setWeights] = useState<number[]>([]);
  const [step, setStep] = useState(0);

  const totalWeights = weights.reduce((a, b) => a + b, 0);
  const diff = unknownMass - totalWeights;
  const balanced = Math.abs(diff) < 5;
  const needleAngle = Math.max(-30, Math.min(30, diff * 0.1));

  const available = [1000, 500, 200, 100, 50, 20, 10, 5];

  const addWeight = (w: number) => { setWeights([...weights, w]); setStep(Math.max(step, 3)); };
  const removeWeight = (i: number) => setWeights(weights.filter((_, idx) => idx !== i));
  const reset = () => { setWeights([]); setStep(0); };

  const steps = [
    "Place the beam balance on a flat surface",
    "Observe the unknown object on the left pan",
    "Add standard masses to the right pan",
    "Adjust masses until the beam is horizontal",
    "Record the total mass of the weights",
    "Compare with other measurements",
  ];

  return (
    <SimulationLayout title="Lab: Measuring Mass (Beam Balance)" objective="Measure the mass of an unknown object using a beam balance" theory="A beam balance compares an unknown mass with standard masses. When balanced, the unknown mass equals the sum of standard masses." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground font-semibold">Standard Weights</span>
          <div className="grid grid-cols-2 gap-1">
            {available.map(w => (
              <Button key={w} variant="outline" size="sm" onClick={() => addWeight(w)} className="text-xs">
                +{w >= 1000 ? `${w/1000}kg` : `${w}g`}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">On Right Pan:</span>
          <div className="flex flex-wrap gap-1">
            {weights.map((w, i) => (
              <button key={i} onClick={() => removeWeight(i)} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded hover:bg-destructive/20">
                {w}g ×
              </button>
            ))}
          </div>
        </div>
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 240" className="w-full h-56">
          {/* Stand */}
          <rect x={190} y={180} width={20} height={50} fill="hsl(var(--muted-foreground))" />
          <rect x={170} y={225} width={60} height={8} fill="hsl(var(--muted-foreground))" rx={2} />
          {/* Pivot */}
          <circle cx={200} cy={180} r={5} fill="hsl(var(--primary))" />
          {/* Beam */}
          <g transform={`rotate(${needleAngle}, 200, 180)`}>
            <rect x={60} y={176} width={280} height={8} fill="hsl(var(--foreground)/0.3)" rx={2} />
            {/* Left pan (object) */}
            <line x1={100} y1={184} x2={100} y2={210} stroke="hsl(var(--border))" strokeWidth={1} />
            <path d="M70,210 Q100,225 130,210" fill="none" stroke="hsl(var(--foreground))" strokeWidth={1.5} />
            <rect x={85} y={200} width={30} height={12} fill="hsl(var(--primary))" rx={2} />
            <text x={100} y={209} textAnchor="middle" className="text-[6px] fill-primary-foreground font-bold">?</text>
            {/* Right pan (weights) */}
            <line x1={300} y1={184} x2={300} y2={210} stroke="hsl(var(--border))" strokeWidth={1} />
            <path d="M270,210 Q300,225 330,210" fill="none" stroke="hsl(var(--foreground))" strokeWidth={1.5} />
            {weights.slice(0, 4).map((w, i) => (
              <rect key={i} x={288} y={198 - i * 6} width={24} height={5} fill="hsl(var(--accent))" rx={1} />
            ))}
          </g>
          {/* Needle */}
          <line x1={200} y1={160} x2={200 + Math.sin(needleAngle * Math.PI / 180) * 20} y2={160 - Math.cos(needleAngle * Math.PI / 180) * 20} stroke="hsl(var(--primary))" strokeWidth={2} />
          {/* Balance indicator */}
          {balanced && <text x={200} y={150} textAnchor="middle" className="text-[11px] fill-primary font-bold">✓ BALANCED</text>}
          <text x={100} y={240} textAnchor="middle" className="text-[8px] fill-muted-foreground">Unknown Object</text>
          <text x={300} y={240} textAnchor="middle" className="text-[8px] fill-muted-foreground">Standard Masses</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Unknown Mass" value={balanced ? `${unknownMass}` : "???"} unit="g" />
        <DataRow label="Total Weights" value={totalWeights} unit="g" />
        <DataRow label="Status" value={balanced ? "Balanced ✓" : diff > 0 ? "Need more →" : "Too heavy →"} />
        <DataRow label="In kg" value={(totalWeights / 1000).toFixed(3)} unit="kg" />
      </div>}
      analysis={balanced ? <p className="text-xs font-mono text-primary">Mass of object = {totalWeights} g = {(totalWeights / 1000).toFixed(3)} kg</p> : <p className="text-xs text-muted-foreground">Add or remove weights until balanced</p>}
    />
  );
}

// 3. Time Measurement Lab
export function TimeMeasurementLab() {
  const [distance, setDistance] = useState(5);
  const [speed, setSpeed] = useState(2);
  const [trials, setTrials] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [ballPos, setBallPos] = useState(0);
  const [step, setStep] = useState(0);

  const theoreticalTime = distance / speed;
  const avgTime = trials.length > 0 ? trials.reduce((a, b) => a + b, 0) / trials.length : 0;

  const startTrial = () => {
    if (running) return;
    setRunning(true);
    setBallPos(0);
    setStep(Math.max(step, 4));
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const fraction = elapsed / theoreticalTime;
      if (fraction >= 1) {
        clearInterval(interval);
        setBallPos(1);
        const jitter = (Math.random() - 0.5) * 0.2;
        setTrials(prev => [...prev, +(theoreticalTime + jitter).toFixed(2)]);
        setRunning(false);
        setStep(Math.max(step, 5));
      } else {
        setBallPos(fraction);
      }
    }, 30);
  };

  const reset = () => { setTrials([]); setBallPos(0); setRunning(false); setStep(0); };

  const steps = [
    "Set the track distance",
    "Set the ball speed",
    "Observe the rolling ball on the track",
    "Press Start to begin timing",
    "Watch the ball reach the end",
    "Record the time taken",
    "Repeat for 3 trials and compare",
  ];

  return (
    <SimulationLayout title="Lab: Measuring Time" objective="Measure the time taken for a ball to travel a set distance" theory="Time = Distance / Speed. Repeated trials reduce random error. The average of multiple readings is more reliable." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Distance" value={distance} onChange={v => { setDistance(v); setStep(Math.max(step, 1)); }} min={1} max={20} step={0.5} unit="m" />
        <ControlGroup label="Speed" value={speed} onChange={v => { setSpeed(v); setStep(Math.max(step, 1)); }} min={0.5} max={10} step={0.5} unit="m/s" />
        <Button variant="default" size="sm" className="w-full" onClick={startTrial} disabled={running}>
          {running ? "Running..." : "▶ Start Trial"}
        </Button>
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 160" className="w-full h-40">
          {/* Track */}
          <rect x={30} y={70} width={340} height={8} fill="hsl(var(--muted))" rx={4} />
          <line x1={30} y1={85} x2={30} y2={65} stroke="hsl(var(--accent))" strokeWidth={2} />
          <line x1={370} y1={85} x2={370} y2={65} stroke="hsl(var(--accent))" strokeWidth={2} />
          <text x={30} y={60} textAnchor="middle" className="text-[8px] fill-muted-foreground">Start</text>
          <text x={370} y={60} textAnchor="middle" className="text-[8px] fill-muted-foreground">{distance}m</text>
          {/* Ball */}
          <circle cx={30 + ballPos * 340} cy={66} r={10} fill="hsl(var(--primary))" />
          {/* Speed label */}
          {running && <text x={30 + ballPos * 340} y={50} textAnchor="middle" className="text-[8px] fill-primary font-bold">{speed} m/s →</text>}
          {/* Stopwatch */}
          <circle cx={200} cy={130} r={18} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1.5} />
          <text x={200} y={134} textAnchor="middle" className="text-[9px] fill-foreground font-mono font-bold">
            {running ? "⏱" : trials.length > 0 ? `${trials[trials.length - 1]}s` : "0.00s"}
          </text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Theoretical" value={theoreticalTime.toFixed(2)} unit="s" />
        {trials.map((t, i) => <DataRow key={i} label={`Trial ${i + 1}`} value={t.toFixed(2)} unit="s" />)}
        {trials.length > 1 && <DataRow label="Average" value={avgTime.toFixed(2)} unit="s" />}
        <DataRow label="Reaction Error" value={trials.length > 0 ? Math.abs(avgTime - theoreticalTime).toFixed(2) : "—"} unit="s" />
      </div>}
      analysis={trials.length >= 3 ? <p className="text-xs font-mono">Avg = ({trials.map(t => t.toFixed(2)).join(" + ")}) / {trials.length} = {avgTime.toFixed(2)} s</p> : <p className="text-xs text-muted-foreground">Complete at least 3 trials</p>}
    />
  );
}

// ─── UNIT 3: Motion in Straight Line ───

// 4. Distance vs Displacement
export function DistanceDisplacementLab() {
  const [movements, setMovements] = useState<number[]>([]);
  const [nextMove, setNextMove] = useState(3);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [step, setStep] = useState(0);

  const addMovement = () => {
    const val = direction === "right" ? nextMove : -nextMove;
    setMovements([...movements, val]);
    setStep(Math.max(step, 4));
  };

  const positions = movements.reduce<number[]>((acc, m) => [...acc, (acc[acc.length - 1] || 0) + m], [0]);
  const currentPos = positions[positions.length - 1] || 0;
  const totalDistance = movements.reduce((a, m) => a + Math.abs(m), 0);
  const displacement = currentPos;

  const reset = () => { setMovements([]); setStep(0); };

  const steps = [
    "Set the direction (left or right)",
    "Set the movement distance",
    "Add multiple movements to create a path",
    "Observe the car moving along the road",
    "Compare total distance vs displacement",
    "Observe position-time and velocity-time graphs",
  ];

  const scale = (v: number) => 200 + v * 12;

  return (
    <SimulationLayout title="Lab: Distance vs Displacement" objective="Distinguish between distance (scalar) and displacement (vector)" theory="Distance is total path length traveled. Displacement is the straight-line vector from start to finish." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="flex gap-1">
          <Button variant={direction === "left" ? "default" : "outline"} size="sm" onClick={() => { setDirection("left"); setStep(Math.max(step, 1)); }} className="flex-1 text-xs">← Left</Button>
          <Button variant={direction === "right" ? "default" : "outline"} size="sm" onClick={() => { setDirection("right"); setStep(Math.max(step, 1)); }} className="flex-1 text-xs">Right →</Button>
        </div>
        <ControlGroup label="Distance" value={nextMove} onChange={setNextMove} min={1} max={10} step={1} unit="m" />
        <Button variant="default" size="sm" className="w-full" onClick={addMovement}>Add Movement</Button>
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-48">
          {/* Road */}
          <rect x={20} y={85} width={360} height={20} fill="hsl(var(--muted))" rx={3} />
          <line x1={20} y1={95} x2={380} y2={95} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="8,4" />
          {/* Start marker */}
          <line x1={200} y1={75} x2={200} y2={115} stroke="hsl(var(--accent))" strokeWidth={1.5} />
          <text x={200} y={72} textAnchor="middle" className="text-[8px] fill-accent">Start (0)</text>
          {/* Path trail */}
          {positions.slice(0, -1).map((p, i) => (
            <line key={i} x1={scale(p)} y1={90} x2={scale(positions[i + 1])} y2={90} stroke="hsl(var(--primary)/0.3)" strokeWidth={3} />
          ))}
          {/* Car */}
          <rect x={scale(currentPos) - 12} y={82} width={24} height={14} fill="hsl(var(--primary))" rx={3} />
          <circle cx={scale(currentPos) - 6} cy={99} r={3} fill="hsl(var(--foreground))" />
          <circle cx={scale(currentPos) + 6} cy={99} r={3} fill="hsl(var(--foreground))" />
          {/* Displacement arrow */}
          {displacement !== 0 && <>
            <line x1={200} y1={130} x2={scale(displacement)} y2={130} stroke="hsl(var(--primary))" strokeWidth={2} markerEnd="url(#arrD)" />
            <text x={(200 + scale(displacement)) / 2} y={145} textAnchor="middle" className="text-[8px] fill-primary font-bold">Displacement = {displacement} m</text>
          </>}
          <defs><marker id="arrD" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto"><path d="M0,0 L8,3 L0,6" fill="hsl(var(--primary))" /></marker></defs>
          {/* Position-time mini graph */}
          <rect x={20} y={155} width={360} height={40} fill="hsl(var(--card))" rx={3} stroke="hsl(var(--border))" />
          <text x={25} y={165} className="text-[6px] fill-muted-foreground">Position vs Step</text>
          {positions.map((p, i) => (
            <circle key={i} cx={40 + i * (320 / Math.max(positions.length, 1))} cy={185 - (p + 10) * 1.2} r={2} fill="hsl(var(--primary))" />
          ))}
          {positions.slice(0, -1).map((p, i) => (
            <line key={i} x1={40 + i * (320 / Math.max(positions.length, 1))} y1={185 - (p + 10) * 1.2}
              x2={40 + (i + 1) * (320 / Math.max(positions.length, 1))} y2={185 - (positions[i + 1] + 10) * 1.2}
              stroke="hsl(var(--primary))" strokeWidth={1} />
          ))}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Total Distance" value={totalDistance} unit="m" />
        <DataRow label="Displacement" value={displacement} unit="m" />
        <DataRow label="Direction" value={displacement > 0 ? "Right →" : displacement < 0 ? "← Left" : "Origin"} />
        <DataRow label="Moves" value={movements.length} />
      </div>}
      analysis={<p className="text-xs font-mono">Distance = {movements.map(m => Math.abs(m)).join(" + ")} = {totalDistance} m | Displacement = {displacement} m {displacement >= 0 ? "→" : "←"}</p>}
    />
  );
}

// 5. Graphical Motion Lab
export function GraphicalMotionLab() {
  const [velocity, setVelocity] = useState(2);
  const [accel, setAccel] = useState(0);
  const [time, setTime] = useState(5);
  const [step, setStep] = useState(0);

  const timePoints = Array.from({ length: Math.min(time + 1, 21) }, (_, i) => i);
  const posData = timePoints.map(t => ({ t, x: velocity * t + 0.5 * accel * t * t }));
  const velData = timePoints.map(t => ({ t, v: velocity + accel * t }));
  const maxPos = Math.max(...posData.map(d => Math.abs(d.x)), 1);
  const maxVel = Math.max(...velData.map(d => Math.abs(d.v)), 1);

  const reset = () => { setVelocity(2); setAccel(0); setTime(5); setStep(0); };

  const steps = [
    "Set the initial velocity",
    "Set the acceleration (0 for uniform motion)",
    "Observe the moving dot on the x-axis",
    "Watch the position-time graph update",
    "Watch the velocity-time graph",
    "Identify the slope of each graph",
  ];

  return (
    <SimulationLayout title="Lab: Graphical Motion Analysis" objective="Plot and interpret position-time and velocity-time graphs" theory="Slope of x-t graph = velocity. Slope of v-t graph = acceleration. Area under v-t graph = displacement." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Initial Velocity" value={velocity} onChange={v => { setVelocity(v); setStep(Math.max(step, 1)); }} min={-5} max={10} step={0.5} unit="m/s" />
        <ControlGroup label="Acceleration" value={accel} onChange={v => { setAccel(v); setStep(Math.max(step, 1)); }} min={-3} max={3} step={0.1} unit="m/s²" />
        <ControlGroup label="Time Range" value={time} onChange={v => { setTime(v); setStep(Math.max(step, 2)); }} min={1} max={20} step={1} unit="s" />
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 260" className="w-full h-64">
          {/* Position-time graph */}
          <text x={10} y={15} className="text-[8px] fill-foreground font-semibold">Position (m) vs Time (s)</text>
          <rect x={40} y={20} width={150} height={100} fill="hsl(var(--card))" stroke="hsl(var(--border))" />
          <line x1={40} y1={120} x2={190} y2={120} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          <line x1={40} y1={20} x2={40} y2={120} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          {posData.slice(0, -1).map((d, i) => (
            <line key={i} x1={40 + (d.t / time) * 150} y1={120 - (d.x / maxPos) * 90}
              x2={40 + (posData[i + 1].t / time) * 150} y2={120 - (posData[i + 1].x / maxPos) * 90}
              stroke="hsl(var(--primary))" strokeWidth={2} />
          ))}
          <text x={115} y={135} textAnchor="middle" className="text-[7px] fill-muted-foreground">Time (s)</text>

          {/* Velocity-time graph */}
          <text x={210} y={15} className="text-[8px] fill-foreground font-semibold">Velocity (m/s) vs Time (s)</text>
          <rect x={220} y={20} width={150} height={100} fill="hsl(var(--card))" stroke="hsl(var(--border))" />
          <line x1={220} y1={70} x2={370} y2={70} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} strokeDasharray="3,3" />
          <line x1={220} y1={20} x2={220} y2={120} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          {velData.slice(0, -1).map((d, i) => (
            <line key={i} x1={220 + (d.t / time) * 150} y1={70 - (d.v / maxVel) * 45}
              x2={220 + (velData[i + 1].t / time) * 150} y2={70 - (velData[i + 1].v / maxVel) * 45}
              stroke="hsl(var(--accent))" strokeWidth={2} />
          ))}
          {/* Area under v-t (shaded) */}
          <polygon points={velData.map(d => `${220 + (d.t / time) * 150},${70 - (d.v / maxVel) * 45}`).join(" ") + ` ${370},${70} ${220},${70}`} fill="hsl(var(--accent)/0.1)" />
          <text x={295} y={135} textAnchor="middle" className="text-[7px] fill-muted-foreground">Time (s)</text>

          {/* Moving dot track */}
          <rect x={30} y={155} width={340} height={6} fill="hsl(var(--muted))" rx={3} />
          <text x={200} y={150} textAnchor="middle" className="text-[7px] fill-muted-foreground">Position Track</text>
          {timePoints.filter((_, i) => i % Math.max(1, Math.floor(time / 10)) === 0).map(t => {
            const x = velocity * t + 0.5 * accel * t * t;
            const px = 30 + Math.min(1, Math.max(0, (x / maxPos + 0.1) / 1.2)) * 340;
            return <circle key={t} cx={px} cy={158} r={t === time ? 5 : 2} fill={t === time ? "hsl(var(--primary))" : "hsl(var(--primary)/0.3)"} />;
          })}
          {/* Equations */}
          <text x={200} y={185} textAnchor="middle" className="text-[8px] fill-foreground font-mono">
            x = {velocity}t + ½({accel})t²
          </text>
          <text x={200} y={198} textAnchor="middle" className="text-[8px] fill-foreground font-mono">
            v = {velocity} + {accel}t
          </text>
          <text x={10} y={215} className="text-[7px] fill-muted-foreground">Slope of x-t = velocity | Slope of v-t = acceleration | Area under v-t = displacement</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="v₀" value={velocity} unit="m/s" />
        <DataRow label="a" value={accel} unit="m/s²" />
        <DataRow label="At t=" value={time} unit="s" />
        <DataRow label="Position" value={(velocity * time + 0.5 * accel * time * time).toFixed(1)} unit="m" />
        <DataRow label="Velocity" value={(velocity + accel * time).toFixed(1)} unit="m/s" />
      </div>}
    />
  );
}

// ─── UNIT 4: Force, Work & Energy ───

// 6. Newton's Second Law
export function NewtonsSecondLaw() {
  const [force, setForce] = useState(50);
  const [mass, setMass] = useState(10);
  const [surface, setSurface] = useState<"smooth" | "wood" | "rough">("smooth");
  const [step, setStep] = useState(0);

  const mu = surface === "smooth" ? 0 : surface === "wood" ? 0.3 : 0.6;
  const friction = mu * mass * 9.8;
  const netForce = Math.max(0, force - friction);
  const accel = mass > 0 ? netForce / mass : 0;

  const reset = () => { setForce(50); setMass(10); setSurface("smooth"); setStep(0); };

  const steps = [
    "Place the object on the surface",
    "Set the mass using the slider",
    "Choose a surface type",
    "Apply force using the force slider",
    "Observe the acceleration",
    "Record F, m, and a values",
    "Repeat with different forces and verify F=ma",
  ];

  return (
    <SimulationLayout title="Lab: Newton's Second Law (F = ma)" objective="Observe how force affects motion and verify F = ma" theory="Newton's Second Law: F_net = ma. The acceleration is proportional to net force and inversely proportional to mass." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Applied Force" value={force} onChange={v => { setForce(v); setStep(Math.max(step, 3)); }} min={0} max={200} unit="N" />
        <ControlGroup label="Mass" value={mass} onChange={v => { setMass(v); setStep(Math.max(step, 1)); }} min={1} max={50} unit="kg" />
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Surface</span>
          {(["smooth", "wood", "rough"] as const).map(s => (
            <Button key={s} variant={surface === s ? "default" : "outline"} size="sm" className="w-full capitalize text-xs" onClick={() => { setSurface(s); setStep(Math.max(step, 2)); }}>
              {s} (μ={s === "smooth" ? 0 : s === "wood" ? 0.3 : 0.6})
            </Button>
          ))}
        </div>
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-52">
          {/* Surface */}
          <rect x={20} y={140} width={360} height={10} fill={surface === "smooth" ? "hsl(var(--muted))" : surface === "wood" ? "hsl(30 60% 40%)" : "hsl(20 40% 30%)"} rx={2} />
          {surface === "rough" && Array.from({ length: 20 }, (_, i) => (
            <line key={i} x1={30 + i * 18} y1={140} x2={35 + i * 18} y2={135} stroke="hsl(20 40% 50%)" strokeWidth={0.5} />
          ))}
          {/* Block */}
          <rect x={140} y={100} width={60} height={40} fill="hsl(var(--primary))" rx={4} />
          <text x={170} y={125} textAnchor="middle" className="text-[10px] fill-primary-foreground font-bold">{mass}kg</text>
          {/* Applied force arrow */}
          {force > 0 && <>
            <line x1={200} y1={120} x2={200 + Math.min(force * 0.8, 150)} y2={120} stroke="hsl(var(--accent))" strokeWidth={3} markerEnd="url(#arr9)" />
            <text x={210 + Math.min(force * 0.4, 75)} y={112} className="text-[9px] fill-accent font-bold">{force}N</text>
          </>}
          {/* Friction arrow */}
          {friction > 0 && <>
            <line x1={140} y1={130} x2={140 - Math.min(friction * 0.8, 100)} y2={130} stroke="#ef4444" strokeWidth={2} markerEnd="url(#arrR9)" />
            <text x={130 - Math.min(friction * 0.4, 50)} y={128} className="text-[8px]" fill="#ef4444">f={friction.toFixed(0)}N</text>
          </>}
          {/* Free body diagram */}
          <text x={310} y={60} textAnchor="middle" className="text-[8px] fill-muted-foreground font-semibold">Free Body Diagram</text>
          <rect x={295} y={70} width={30} height={20} fill="hsl(var(--primary)/0.3)" rx={2} />
          <line x1={310} y1={90} x2={310} y2={110} stroke="hsl(var(--foreground))" strokeWidth={1} markerEnd="url(#arrFBD)" />
          <text x={320} y={105} className="text-[6px] fill-foreground">mg</text>
          <line x1={310} y1={70} x2={310} y2={55} stroke="hsl(var(--foreground))" strokeWidth={1} markerEnd="url(#arrFBD)" />
          <text x={320} y={60} className="text-[6px] fill-foreground">N</text>
          {force > 0 && <line x1={325} y1={80} x2={345} y2={80} stroke="hsl(var(--accent))" strokeWidth={1} markerEnd="url(#arrFBD)" />}
          {friction > 0 && <line x1={295} y1={82} x2={278} y2={82} stroke="#ef4444" strokeWidth={1} />}
          {/* Acceleration meter */}
          <rect x={100} y={165} width={200} height={25} fill="hsl(var(--card))" rx={4} stroke="hsl(var(--border))" />
          <text x={200} y={182} textAnchor="middle" className="text-[11px] fill-foreground font-mono font-bold">a = {accel.toFixed(2)} m/s²</text>
          <defs>
            <marker id="arr9" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto"><path d="M0,0 L8,3 L0,6" fill="hsl(var(--accent))" /></marker>
            <marker id="arrR9" markerWidth={8} markerHeight={6} refX={0} refY={3} orient="auto"><path d="M8,0 L0,3 L8,6" fill="#ef4444" /></marker>
            <marker id="arrFBD" markerWidth={6} markerHeight={5} refX={6} refY={2.5} orient="auto"><path d="M0,0 L6,2.5 L0,5" fill="hsl(var(--foreground))" /></marker>
          </defs>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Applied Force" value={force} unit="N" />
        <DataRow label="Friction (μ={mu})" value={friction.toFixed(1)} unit="N" />
        <DataRow label="Net Force" value={netForce.toFixed(1)} unit="N" />
        <DataRow label="Mass" value={mass} unit="kg" />
        <DataRow label="Acceleration" value={accel.toFixed(2)} unit="m/s²" />
      </div>}
      analysis={<p className="text-xs font-mono">F_net = {force} − {friction.toFixed(0)} = {netForce.toFixed(1)} N → a = {netForce.toFixed(1)} / {mass} = {accel.toFixed(2)} m/s²</p>}
    />
  );
}

// 7. Work & Energy Lab
export function WorkEnergyLab() {
  const [mass, setMass] = useState(5);
  const [height, setHeight] = useState(3);
  const [step, setStep] = useState(0);

  const g = 9.8;
  const PE = mass * g * height;
  const KE = 0; // at top, KE = 0; at bottom KE = PE
  const work = PE;

  const reset = () => { setMass(5); setHeight(3); setStep(0); };

  const steps = [
    "Set the mass of the object",
    "Set the height above ground",
    "Observe the potential energy bar",
    "Release the object (imagine it falls)",
    "Observe energy transformation",
    "Record work done against gravity",
  ];

  const maxPE = 50 * 9.8 * 10;
  const barH = (PE / maxPE) * 100;

  return (
    <SimulationLayout title="Lab: Work & Energy" objective="Observe energy transformation between potential and kinetic energy" theory="PE = mgh. When an object falls, PE converts to KE. Work done = Force × Distance = mgh." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Mass" value={mass} onChange={v => { setMass(v); setStep(Math.max(step, 1)); }} min={1} max={50} unit="kg" />
        <ControlGroup label="Height" value={height} onChange={v => { setHeight(v); setStep(Math.max(step, 1)); }} min={0.5} max={10} step={0.5} unit="m" />
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 240" className="w-full h-56">
          {/* Height reference */}
          <line x1={80} y1={200} x2={80} y2={200 - height * 16} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="3,3" />
          <text x={70} y={200 - height * 8} textAnchor="end" className="text-[8px] fill-muted-foreground">{height}m</text>
          {/* Ground */}
          <rect x={60} y={200} width={120} height={6} fill="hsl(var(--muted-foreground))" rx={2} />
          {/* Object at height */}
          <rect x={100} y={200 - height * 16 - 20} width={30} height={20} fill="hsl(var(--primary))" rx={3} />
          <text x={115} y={200 - height * 16 - 6} textAnchor="middle" className="text-[8px] fill-primary-foreground font-bold">{mass}kg</text>
          {/* Energy bars */}
          <text x={260} y={30} textAnchor="middle" className="text-[9px] fill-foreground font-semibold">Energy</text>
          {/* PE bar */}
          <rect x={230} y={200 - barH} width={25} height={barH} fill="hsl(220 80% 60%)" rx={2} />
          <text x={242} y={215} textAnchor="middle" className="text-[7px] fill-muted-foreground">PE</text>
          {/* KE bar (at bottom = PE) */}
          <rect x={270} y={200 - barH * 0.0} width={25} height={barH * 0.0} fill="hsl(0 70% 55%)" rx={2} />
          <text x={282} y={215} textAnchor="middle" className="text-[7px] fill-muted-foreground">KE</text>
          {/* Arrow showing transformation */}
          <text x={260} y={50} textAnchor="middle" className="text-[8px] fill-accent">PE at top</text>
          <text x={260} y={65} textAnchor="middle" className="text-[8px] fill-accent">= KE at bottom</text>
          {/* Values */}
          <rect x={200} y={95} width={140} height={60} fill="hsl(var(--card))" rx={4} stroke="hsl(var(--border))" />
          <text x={270} y={112} textAnchor="middle" className="text-[8px] fill-foreground font-mono">PE = mgh = {PE.toFixed(1)} J</text>
          <text x={270} y={128} textAnchor="middle" className="text-[8px] fill-foreground font-mono">KE (bottom) = {PE.toFixed(1)} J</text>
          <text x={270} y={144} textAnchor="middle" className="text-[8px] fill-foreground font-mono">Work = {work.toFixed(1)} J</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Mass" value={mass} unit="kg" />
        <DataRow label="Height" value={height} unit="m" />
        <DataRow label="PE (top)" value={PE.toFixed(1)} unit="J" />
        <DataRow label="KE (bottom)" value={PE.toFixed(1)} unit="J" />
        <DataRow label="Work Done" value={work.toFixed(1)} unit="J" />
      </div>}
      analysis={<p className="text-xs font-mono">W = mgh = {mass} × 9.8 × {height} = {work.toFixed(1)} J | Energy is conserved: PE → KE</p>}
    />
  );
}

// 8. Hooke's Law Lab
export function HookesLawLab() {
  const [addedForce, setAddedForce] = useState(0);
  const [springK] = useState(50);
  const [step, setStep] = useState(0);
  const [records, setRecords] = useState<{ f: number; ext: number }[]>([]);

  const extension = addedForce / springK;

  const recordData = () => {
    setRecords([...records, { f: addedForce, ext: extension }]);
    setStep(Math.max(step, 6));
  };

  const reset = () => { setAddedForce(0); setRecords([]); setStep(0); };

  const steps = [
    "Suspend the spring from the support",
    "Measure the initial length of the spring",
    "Add a small weight using the slider",
    "Measure the new length",
    "Calculate the extension",
    "Record the force and extension",
    "Add more weights gradually and repeat",
    "Plot a force vs extension graph",
  ];

  return (
    <SimulationLayout title="Lab: Hooke's Law (F = kx)" objective="Verify Hooke's Law by measuring spring extension vs applied force" theory="Hooke's Law: F = kx. The extension is proportional to force in the elastic region. k is the spring constant." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Applied Force" value={addedForce} onChange={v => { setAddedForce(v); setStep(Math.max(step, 2)); }} min={0} max={200} step={5} unit="N" />
        <Button variant="default" size="sm" className="w-full" onClick={recordData}>📝 Record Data Point</Button>
        <div className="text-[10px] text-muted-foreground">Spring constant k = {springK} N/m</div>
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 260" className="w-full h-60">
          {/* Support */}
          <rect x={90} y={10} width={60} height={8} fill="hsl(var(--muted-foreground))" rx={2} />
          <rect x={118} y={18} width={4} height={10} fill="hsl(var(--muted-foreground))" />
          {/* Spring coils */}
          {Array.from({ length: 8 }, (_, i) => {
            const y = 28 + i * (10 + extension * 8);
            return <path key={i} d={`M110,${y} Q130,${y + 5} 110,${y + 10 + extension * 8}`} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1.5} />;
          })}
          {/* Weight */}
          <rect x={100} y={28 + 8 * (10 + extension * 8)} width={40} height={20} fill="hsl(var(--primary))" rx={3} />
          <text x={120} y={28 + 8 * (10 + extension * 8) + 14} textAnchor="middle" className="text-[8px] fill-primary-foreground font-bold">{addedForce}N</text>
          {/* Ruler */}
          <line x1={75} y1={28} x2={75} y2={28 + 8 * (10 + extension * 8) + 20} stroke="hsl(var(--accent))" strokeWidth={1} />
          <text x={65} y={28 + 4 * (10 + extension * 8)} textAnchor="end" className="text-[7px] fill-accent">{(extension * 100).toFixed(1)}cm</text>
          {/* Graph area */}
          <text x={250} y={25} textAnchor="middle" className="text-[9px] fill-foreground font-semibold">F vs Extension</text>
          <rect x={200} y={30} width={160} height={120} fill="hsl(var(--card))" stroke="hsl(var(--border))" rx={3} />
          <line x1={220} y1={140} x2={350} y2={140} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          <line x1={220} y1={30} x2={220} y2={140} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
          <text x={285} y={155} textAnchor="middle" className="text-[7px] fill-muted-foreground">Extension (m)</text>
          <text x={210} y={85} textAnchor="middle" className="text-[7px] fill-muted-foreground" transform="rotate(-90, 210, 85)">Force (N)</text>
          {/* Data points */}
          {records.map((r, i) => (
            <circle key={i} cx={220 + (r.ext / 4) * 120} cy={140 - (r.f / 200) * 100} r={3} fill="hsl(var(--primary))" />
          ))}
          {records.length > 1 && records.slice(0, -1).map((r, i) => (
            <line key={i} x1={220 + (r.ext / 4) * 120} y1={140 - (r.f / 200) * 100}
              x2={220 + (records[i + 1].ext / 4) * 120} y2={140 - (records[i + 1].f / 200) * 100}
              stroke="hsl(var(--primary))" strokeWidth={1} />
          ))}
          {/* Current point */}
          <circle cx={220 + (extension / 4) * 120} cy={140 - (addedForce / 200) * 100} r={4} fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth={1} />
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Force" value={addedForce} unit="N" />
        <DataRow label="Extension" value={(extension * 100).toFixed(1)} unit="cm" />
        <DataRow label="Spring k" value={springK} unit="N/m" />
        <DataRow label="Data Points" value={records.length} />
      </div>}
      analysis={<p className="text-xs font-mono">F = kx → {addedForce} = {springK} × {extension.toFixed(3)} m | k = F/x = {springK} N/m</p>}
    />
  );
}

// ─── UNIT 5: Simple Machines ───

// 9. Lever Lab
export function LeverLab() {
  const [effortForce, setEffortForce] = useState(20);
  const [loadForce, setLoadForce] = useState(40);
  const [effortArm, setEffortArm] = useState(4);
  const [loadArm, setLoadArm] = useState(2);
  const [step, setStep] = useState(0);

  const clockwise = loadForce * loadArm;
  const anticlockwise = effortForce * effortArm;
  const balanced = Math.abs(clockwise - anticlockwise) < 2;
  const MA = loadForce / effortForce;
  const efficiency = loadArm > 0 ? (loadForce * loadArm) / (effortForce * effortArm) * 100 : 0;

  const tiltAngle = Math.max(-15, Math.min(15, (clockwise - anticlockwise) * 0.05));
  const reset = () => { setEffortForce(20); setLoadForce(40); setEffortArm(4); setLoadArm(2); setStep(0); };

  const steps = [
    "Observe the lever and pivot point",
    "Set the effort force and arm length",
    "Set the load force and arm length",
    "Adjust until the lever balances",
    "Record MA and efficiency",
    "Verify: Effort × Effort Arm = Load × Load Arm",
  ];

  return (
    <SimulationLayout title="Lab: Lever (Simple Machine)" objective="Explore mechanical advantage of a lever and verify the principle of moments" theory="For a balanced lever: Effort × Effort Arm = Load × Load Arm. MA = Load / Effort." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Effort Force" value={effortForce} onChange={v => { setEffortForce(v); setStep(Math.max(step, 1)); }} min={5} max={100} unit="N" />
        <ControlGroup label="Effort Arm" value={effortArm} onChange={v => { setEffortArm(v); setStep(Math.max(step, 1)); }} min={1} max={8} step={0.5} unit="m" />
        <ControlGroup label="Load Force" value={loadForce} onChange={v => { setLoadForce(v); setStep(Math.max(step, 2)); }} min={5} max={100} unit="N" />
        <ControlGroup label="Load Arm" value={loadArm} onChange={v => { setLoadArm(v); setStep(Math.max(step, 2)); }} min={1} max={8} step={0.5} unit="m" />
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-48">
          {/* Pivot triangle */}
          <polygon points="190,160 210,160 200,140" fill="hsl(var(--muted-foreground))" />
          {/* Beam */}
          <g transform={`rotate(${tiltAngle}, 200, 140)`}>
            <rect x={60} y={134} width={280} height={8} fill="hsl(var(--foreground)/0.3)" rx={2} />
            {/* Load side (left) */}
            <rect x={200 - loadArm * 20 - 10} y={118} width={20} height={16} fill="hsl(var(--destructive))" rx={2} />
            <text x={200 - loadArm * 20} y={130} textAnchor="middle" className="text-[7px] fill-destructive-foreground font-bold">{loadForce}N</text>
            <line x1={200 - loadArm * 20} y1={134} x2={200 - loadArm * 20} y2={145} stroke="hsl(var(--destructive))" strokeWidth={1} />
            {/* Effort side (right) */}
            <line x1={200 + effortArm * 20} y1={120} x2={200 + effortArm * 20} y2={134} stroke="hsl(var(--accent))" strokeWidth={2} />
            <text x={200 + effortArm * 20} y={115} textAnchor="middle" className="text-[8px] fill-accent font-bold">↑{effortForce}N</text>
            {/* Arm labels */}
            <line x1={200} y1={150} x2={200 - loadArm * 20} y2={150} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
            <text x={200 - loadArm * 10} y={158} textAnchor="middle" className="text-[7px] fill-muted-foreground">{loadArm}m</text>
            <line x1={200} y1={150} x2={200 + effortArm * 20} y2={150} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
            <text x={200 + effortArm * 10} y={158} textAnchor="middle" className="text-[7px] fill-muted-foreground">{effortArm}m</text>
          </g>
          {balanced && <text x={200} y={180} textAnchor="middle" className="text-[11px] fill-primary font-bold">✓ BALANCED</text>}
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Clockwise τ" value={clockwise.toFixed(1)} unit="N·m" />
        <DataRow label="Anti-CW τ" value={anticlockwise.toFixed(1)} unit="N·m" />
        <DataRow label="MA" value={MA.toFixed(2)} />
        <DataRow label="Efficiency" value={efficiency.toFixed(0)} unit="%" />
        <DataRow label="Status" value={balanced ? "Balanced ✓" : "Unbalanced"} />
      </div>}
      analysis={<p className="text-xs font-mono">τ_cw = {loadForce}×{loadArm} = {clockwise.toFixed(1)} | τ_ccw = {effortForce}×{effortArm} = {anticlockwise.toFixed(1)} | MA = {MA.toFixed(2)}</p>}
    />
  );
}

// 10. Inclined Plane Lab
export function InclinedPlaneLab() {
  const [angle, setAngle] = useState(30);
  const [mass, setMass] = useState(5);
  const [mu, setMu] = useState(0.2);
  const [step, setStep] = useState(0);

  const g = 9.8;
  const rad = angle * Math.PI / 180;
  const weight = mass * g;
  const parallel = weight * Math.sin(rad);
  const normal = weight * Math.cos(rad);
  const friction = mu * normal;
  const requiredForce = parallel + friction;
  const workDone = requiredForce * 2; // assume 2m ramp
  const efficiency = (weight * 2 * Math.sin(rad)) / workDone * 100;

  const reset = () => { setAngle(30); setMass(5); setMu(0.2); setStep(0); };

  const steps = [
    "Set the angle of the inclined plane",
    "Set the mass of the object",
    "Adjust friction coefficient",
    "Observe the force components",
    "Calculate the required force to push up",
    "Record work done and efficiency",
  ];

  const rampEndX = 60 + Math.cos(rad) * 250;
  const rampEndY = 170 - Math.sin(rad) * 250;
  const blockX = 60 + Math.cos(rad) * 100;
  const blockY = 170 - Math.sin(rad) * 100;

  return (
    <SimulationLayout title="Lab: Inclined Plane" objective="Analyze forces on an inclined plane and calculate efficiency" theory="On a ramp: Parallel force = mgsinθ, Normal = mgcosθ. The inclined plane reduces effort at the cost of distance." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Angle" value={angle} onChange={v => { setAngle(v); setStep(Math.max(step, 1)); }} min={5} max={60} unit="°" />
        <ControlGroup label="Mass" value={mass} onChange={v => { setMass(v); setStep(Math.max(step, 1)); }} min={1} max={20} unit="kg" />
        <ControlGroup label="Friction (μ)" value={mu} onChange={v => { setMu(v); setStep(Math.max(step, 2)); }} min={0} max={0.8} step={0.05} />
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-48">
          {/* Ground */}
          <line x1={40} y1={170} x2={380} y2={170} stroke="hsl(var(--border))" strokeWidth={2} />
          {/* Ramp */}
          <line x1={60} y1={170} x2={rampEndX} y2={rampEndY} stroke="hsl(var(--foreground))" strokeWidth={3} />
          {/* Angle arc */}
          <path d={`M90,170 A30,30 0 0,0 ${60 + Math.cos(rad) * 30},${170 - Math.sin(rad) * 30}`} fill="none" stroke="hsl(var(--accent))" strokeWidth={1} />
          <text x={95} y={163} className="text-[8px] fill-accent">{angle}°</text>
          {/* Block */}
          <g transform={`translate(${blockX}, ${blockY}) rotate(${-angle})`}>
            <rect x={-12} y={-18} width={24} height={18} fill="hsl(var(--primary))" rx={2} />
            <text x={0} y={-6} textAnchor="middle" className="text-[7px] fill-primary-foreground font-bold">{mass}kg</text>
          </g>
          {/* Force arrows from block center */}
          {/* Weight (down) */}
          <line x1={blockX} y1={blockY} x2={blockX} y2={blockY + 30} stroke="hsl(var(--foreground))" strokeWidth={1.5} markerEnd="url(#arrIP)" />
          <text x={blockX + 5} y={blockY + 35} className="text-[7px] fill-foreground">mg</text>
          {/* Normal (perpendicular to surface) */}
          <line x1={blockX} y1={blockY} x2={blockX - Math.sin(rad) * 25} y2={blockY - Math.cos(rad) * 25} stroke="hsl(var(--accent))" strokeWidth={1.5} markerEnd="url(#arrIP)" />
          <text x={blockX - Math.sin(rad) * 30} y={blockY - Math.cos(rad) * 30} className="text-[6px] fill-accent">N</text>
          {/* Parallel (along surface down) */}
          <line x1={blockX} y1={blockY} x2={blockX - Math.cos(rad) * 20} y2={blockY + Math.sin(rad) * 20} stroke="#ef4444" strokeWidth={1.5} markerEnd="url(#arrIPR)" />
          <text x={blockX - Math.cos(rad) * 25} y={blockY + Math.sin(rad) * 25 + 5} className="text-[6px]" fill="#ef4444">mgsinθ</text>
          <defs>
            <marker id="arrIP" markerWidth={6} markerHeight={5} refX={6} refY={2.5} orient="auto"><path d="M0,0 L6,2.5 L0,5" fill="hsl(var(--foreground))" /></marker>
            <marker id="arrIPR" markerWidth={6} markerHeight={5} refX={6} refY={2.5} orient="auto"><path d="M0,0 L6,2.5 L0,5" fill="#ef4444" /></marker>
          </defs>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Weight" value={weight.toFixed(1)} unit="N" />
        <DataRow label="Parallel" value={parallel.toFixed(1)} unit="N" />
        <DataRow label="Normal" value={normal.toFixed(1)} unit="N" />
        <DataRow label="Friction" value={friction.toFixed(1)} unit="N" />
        <DataRow label="Required F" value={requiredForce.toFixed(1)} unit="N" />
        <DataRow label="Efficiency" value={efficiency.toFixed(0)} unit="%" />
      </div>}
      analysis={<p className="text-xs font-mono">F_∥ = {mass}×9.8×sin({angle}°) = {parallel.toFixed(1)}N | Efficiency = {efficiency.toFixed(0)}%</p>}
    />
  );
}

// ─── UNIT 6: Oscillation & Waves ───

// 11. Pendulum Lab
export function PendulumLab() {
  const [length, setLength] = useState(1);
  const [gravity, setGravity] = useState(9.8);
  const [angle, setAngle] = useState(30);
  const [step, setStep] = useState(0);

  const period = 2 * Math.PI * Math.sqrt(length / gravity);
  const freq = 1 / period;
  const rad = (angle * Math.PI) / 180;
  const bobX = 200 + Math.sin(rad) * length * 120;
  const bobY = 30 + Math.cos(rad) * length * 120;

  const reset = () => { setLength(1); setGravity(9.8); setAngle(30); setStep(0); };

  const steps = [
    "Attach the metal ball to the string",
    "Set the pendulum length",
    "Pull the pendulum to a small angle (<10°)",
    "Release it gently",
    "Time 10 oscillations with stopwatch",
    "Calculate period T = Total Time / 10",
    "Use T = 2π√(L/g) to calculate g",
    "Discuss accuracy of your result",
  ];

  return (
    <SimulationLayout title="Lab: Simple Pendulum" objective="Determine acceleration due to gravity using a simple pendulum (T = 2π√(L/g))" theory="Period depends on length and gravity, not mass or amplitude (small angles). T = 2π√(L/g)." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Length" value={length} onChange={v => { setLength(v); setStep(Math.max(step, 2)); }} min={0.2} max={3} step={0.1} unit="m" />
        <ControlGroup label="Gravity" value={gravity} onChange={v => { setGravity(v); setStep(Math.max(step, 2)); }} min={1} max={25} step={0.1} unit="m/s²" />
        <ControlGroup label="Angle" value={angle} onChange={v => { setAngle(v); setStep(Math.max(step, 2)); }} min={5} max={60} unit="°" />
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 280" className="w-full h-56">
          <rect x={150} y={15} width={100} height={10} fill="hsl(var(--muted))" rx={2} />
          <line x1={200} y1={20} x2={200} y2={30} stroke="hsl(var(--border))" strokeWidth={4} />
          {/* String */}
          <line x1={200} y1={30} x2={bobX} y2={bobY} stroke="hsl(var(--foreground))" strokeWidth={2} />
          {/* Bob */}
          <circle cx={bobX} cy={bobY} r={14} fill="hsl(var(--primary))" />
          {/* Angle arc */}
          <path d={`M200,60 A30,30 0 0,1 ${200 + Math.sin(rad / 2) * 30},${30 + Math.cos(rad / 2) * 30}`} fill="none" stroke="hsl(var(--accent))" strokeWidth={1} />
          <text x={210} y={50} className="text-[8px] fill-accent">{angle}°</text>
          {/* Timer display */}
          <rect x={280} y={30} width={80} height={35} fill="hsl(var(--card))" rx={4} stroke="hsl(var(--border))" />
          <text x={320} y={48} textAnchor="middle" className="text-[7px] fill-muted-foreground">Period</text>
          <text x={320} y={60} textAnchor="middle" className="text-[11px] fill-foreground font-mono font-bold">{period.toFixed(3)}s</text>
          {/* Formula */}
          <text x={200} y={bobY + 40} textAnchor="middle" className="text-[9px] fill-foreground font-mono">
            T = 2π√({length.toFixed(1)}/{gravity.toFixed(1)}) = {period.toFixed(3)} s
          </text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Period (T)" value={period.toFixed(3)} unit="s" />
        <DataRow label="Frequency" value={freq.toFixed(3)} unit="Hz" />
        <DataRow label="Length" value={length.toFixed(1)} unit="m" />
        <DataRow label="Gravity" value={gravity.toFixed(1)} unit="m/s²" />
        <DataRow label="Calc g" value={(4 * Math.PI * Math.PI * length / (period * period)).toFixed(2)} unit="m/s²" />
      </div>}
      analysis={<p className="text-xs font-mono">T = 2π√(L/g) = {period.toFixed(3)} s | g = 4π²L/T² = {(4 * Math.PI * Math.PI * length / (period * period)).toFixed(2)} m/s²</p>}
    />
  );
}

// 12. Wave Simulation
export function WaveSimulation() {
  const [freq, setFreq] = useState(2);
  const [amp, setAmp] = useState(40);
  const [wavelength, setWavelength] = useState(100);
  const [step, setStep] = useState(0);

  const speed = freq * wavelength;
  const points = Array.from({ length: 400 }, (_, x) => {
    const y = 100 + amp * Math.sin((2 * Math.PI * x) / wavelength);
    return `${x},${y}`;
  }).join(" ");

  // Particles
  const particles = Array.from({ length: 20 }, (_, i) => {
    const x = i * 20 + 10;
    const y = 100 + amp * Math.sin((2 * Math.PI * x) / wavelength);
    return { x, y };
  });

  const reset = () => { setFreq(2); setAmp(40); setWavelength(100); setStep(0); };

  const steps = [
    "Set the frequency using the slider",
    "Set the amplitude",
    "Set the wavelength",
    "Observe particles oscillating up and down",
    "Note the wave equation v = fλ",
    "Change one variable and observe the effect on speed",
  ];

  return (
    <SimulationLayout title="Lab: Wave Simulation" objective="Explore transverse wave properties: v = fλ" theory="A wave transports energy without transporting matter. Speed = frequency × wavelength." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Frequency" value={freq} onChange={v => { setFreq(v); setStep(Math.max(step, 1)); }} min={0.5} max={10} step={0.5} unit="Hz" />
        <ControlGroup label="Amplitude" value={amp} onChange={v => { setAmp(v); setStep(Math.max(step, 1)); }} min={10} max={80} unit="px" />
        <ControlGroup label="Wavelength" value={wavelength} onChange={v => { setWavelength(v); setStep(Math.max(step, 2)); }} min={30} max={200} unit="px" />
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-48">
          {/* Equilibrium line */}
          <line x1={0} y1={100} x2={400} y2={100} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="4,4" />
          {/* Wave */}
          <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          {/* Oscillating particles */}
          {particles.map((p, i) => (
            <g key={i}>
              <line x1={p.x} y1={100} x2={p.x} y2={p.y} stroke="hsl(var(--accent)/0.3)" strokeWidth={0.5} />
              <circle cx={p.x} cy={p.y} r={3} fill="hsl(var(--accent))" />
            </g>
          ))}
          {/* Amplitude marker */}
          <line x1={15} y1={100 - amp} x2={15} y2={100 + amp} stroke="hsl(var(--accent))" strokeWidth={1} />
          <text x={25} y={100} className="text-[8px] fill-accent">A={amp}</text>
          {/* Wavelength marker */}
          <line x1={50} y1={100 - amp - 12} x2={50 + wavelength} y2={100 - amp - 12} stroke="hsl(var(--secondary-foreground))" strokeWidth={1} />
          <text x={50 + wavelength / 2} y={100 - amp - 16} textAnchor="middle" className="text-[8px] fill-secondary-foreground">λ={wavelength}</text>
          {/* Equation */}
          <text x={200} y={195} textAnchor="middle" className="text-[9px] fill-foreground font-mono">v = f × λ = {freq} × {wavelength} = {speed} px/s</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Frequency" value={freq.toFixed(1)} unit="Hz" />
        <DataRow label="Amplitude" value={amp} unit="px" />
        <DataRow label="Wavelength" value={wavelength} unit="px" />
        <DataRow label="Wave Speed" value={speed.toFixed(0)} unit="px/s" />
      </div>}
      analysis={<p className="text-xs font-mono">v = fλ = {freq} × {wavelength} = {speed.toFixed(0)} px/s</p>}
    />
  );
}

// ─── UNIT 7: Temperature & Thermometry ───

// 13. Thermal Expansion Lab
export function ThermalExpansionLab() {
  const [temp, setTemp] = useState(20);
  const [material, setMaterial] = useState<"iron" | "copper" | "aluminum">("iron");
  const [step, setStep] = useState(0);

  const alpha: Record<string, number> = { iron: 12e-6, copper: 17e-6, aluminum: 23e-6 };
  const initialLength = 1; // 1 meter
  const deltaT = temp - 20;
  const expansion = initialLength * alpha[material] * deltaT;
  const finalLength = initialLength + expansion;

  const reset = () => { setTemp(20); setMaterial("iron"); setStep(0); };

  const steps = [
    "Select a material for the rod",
    "Note the initial length at 20°C",
    "Increase the temperature using the slider",
    "Observe the rod expanding",
    "Record initial and final lengths",
    "Compare expansion for different materials",
  ];

  const rodWidth = 200 + expansion * 50000;
  const colors: Record<string, string> = { iron: "hsl(0 0% 50%)", copper: "hsl(20 70% 50%)", aluminum: "hsl(210 30% 70%)" };

  return (
    <SimulationLayout title="Lab: Thermal Expansion" objective="Observe how temperature affects the length of a metal rod" theory="Linear expansion: ΔL = L₀αΔT, where α is the coefficient of linear expansion. Different materials expand differently." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Material</span>
          {(["iron", "copper", "aluminum"] as const).map(m => (
            <Button key={m} variant={material === m ? "default" : "outline"} size="sm" className="w-full capitalize text-xs" onClick={() => { setMaterial(m); setStep(Math.max(step, 1)); }}>
              {m} (α = {(alpha[m] * 1e6).toFixed(0)} × 10⁻⁶)
            </Button>
          ))}
        </div>
        <ControlGroup label="Temperature" value={temp} onChange={v => { setTemp(v); setStep(Math.max(step, 2)); }} min={-50} max={500} step={5} unit="°C" />
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 200" className="w-full h-48">
          {/* Heat source */}
          {temp > 20 && <>
            <rect x={50} y={130} width={30} height={20} fill="hsl(0 80% 50%)" rx={3} />
            <text x={65} y={145} textAnchor="middle" className="text-[7px] fill-white font-bold">🔥</text>
            {/* Flame */}
            {[0, 1, 2].map(i => (
              <ellipse key={i} cx={55 + i * 10} cy={125} rx={4} ry={8} fill={`hsl(${30 + i * 10} 90% 55%)`} opacity={0.6} />
            ))}
          </>}
          {/* Rod */}
          <rect x={90} y={90} width={rodWidth} height={18} fill={colors[material]} rx={3} />
          {/* Temperature gradient */}
          {temp > 20 && <linearGradient id="heatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(0 80% 50%)" />
            <stop offset="100%" stopColor={colors[material]} />
          </linearGradient>}
          {/* Length markers */}
          <line x1={90} y1={115} x2={90} y2={130} stroke="hsl(var(--foreground))" strokeWidth={1} />
          <line x1={90 + rodWidth} y1={115} x2={90 + rodWidth} y2={130} stroke="hsl(var(--foreground))" strokeWidth={1} />
          <line x1={90} y1={125} x2={90 + rodWidth} y2={125} stroke="hsl(var(--foreground))" strokeWidth={0.5} />
          <text x={90 + rodWidth / 2} y={140} textAnchor="middle" className="text-[8px] fill-foreground font-mono">{finalLength.toFixed(6)} m</text>
          {/* Initial length reference */}
          <line x1={90} y1={80} x2={290} y2={80} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={190} y={75} textAnchor="middle" className="text-[7px] fill-muted-foreground">Initial: 1.000000 m</text>
          {/* Thermometer */}
          <rect x={340} y={50} width={12} height={100} fill="hsl(var(--card))" rx={6} stroke="hsl(var(--border))" />
          <rect x={342} y={150 - Math.max(0, (temp + 50) / 550) * 98} width={8} height={Math.max(0, (temp + 50) / 550) * 98} fill="hsl(0 70% 50%)" rx={4} />
          <text x={346} y={45} textAnchor="middle" className="text-[8px] fill-foreground font-bold">{temp}°C</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Material" value={material} />
        <DataRow label="α" value={`${(alpha[material] * 1e6).toFixed(0)} × 10⁻⁶`} unit="/°C" />
        <DataRow label="ΔT" value={deltaT} unit="°C" />
        <DataRow label="Initial L" value="1.000000" unit="m" />
        <DataRow label="ΔL" value={(expansion * 1000).toFixed(4)} unit="mm" />
        <DataRow label="Final L" value={finalLength.toFixed(6)} unit="m" />
      </div>}
      analysis={<p className="text-xs font-mono">ΔL = L₀αΔT = 1 × {(alpha[material] * 1e6).toFixed(0)}×10⁻⁶ × {deltaT} = {(expansion * 1000).toFixed(4)} mm</p>}
    />
  );
}

// 14. Temperature Measurement Lab
export function TemperatureMeasurementLab() {
  const [waterType, setWaterType] = useState<"cold" | "warm" | "hot">("cold");
  const [step, setStep] = useState(0);

  const temps: Record<string, number> = { cold: 5, warm: 35, hot: 85 };
  const temp = temps[waterType];

  const reset = () => { setWaterType("cold"); setStep(0); };

  const steps = [
    "Observe the thermometer",
    "Place thermometer in cold water",
    "Record the temperature reading",
    "Repeat for warm water",
    "Repeat for hot water",
    "Record all values and compare",
  ];

  const mercuryHeight = (temp / 100) * 120;

  return (
    <SimulationLayout title="Lab: Measuring Temperature" objective="Measure temperature of different water samples using a thermometer" theory="Temperature measures the average kinetic energy of molecules. The Celsius scale sets 0°C (freezing) and 100°C (boiling) for water." onReset={reset}
      equipment={<div className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Water Sample</span>
          {(["cold", "warm", "hot"] as const).map(w => (
            <Button key={w} variant={waterType === w ? "default" : "outline"} size="sm" className="w-full capitalize text-xs" onClick={() => { setWaterType(w); setStep(Math.max(step, w === "cold" ? 1 : w === "warm" ? 3 : 4)); }}>
              {w === "cold" ? "🧊 Cold Water" : w === "warm" ? "💧 Warm Water" : "♨️ Hot Water"}
            </Button>
          ))}
        </div>
        <StepByStep steps={steps} currentStep={step} onStepClick={setStep} />
      </div>}
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-52">
          {/* Beaker */}
          <rect x={120} y={80} width={100} height={100} fill={waterType === "cold" ? "hsl(210 80% 85%)" : waterType === "warm" ? "hsl(30 60% 80%)" : "hsl(0 70% 80%)"} rx={4} stroke="hsl(var(--border))" strokeWidth={1.5} />
          <text x={170} y={140} textAnchor="middle" className="text-[10px] fill-foreground">{waterType === "cold" ? "🧊" : waterType === "warm" ? "💧" : "♨️"}</text>
          <text x={170} y={195} textAnchor="middle" className="text-[9px] fill-muted-foreground capitalize">{waterType} Water</text>
          {/* Steam for hot */}
          {waterType === "hot" && [0, 1, 2].map(i => (
            <text key={i} x={140 + i * 20} y={70 - i * 5} className="text-[10px] fill-muted-foreground" opacity={0.5}>~</text>
          ))}
          {/* Thermometer */}
          <rect x={250} y={40} width={16} height={150} fill="hsl(var(--card))" rx={8} stroke="hsl(var(--border))" strokeWidth={1.5} />
          {/* Mercury */}
          <rect x={253} y={190 - mercuryHeight - 5} width={10} height={mercuryHeight + 5} fill="hsl(0 70% 50%)" rx={5} />
          {/* Bulb */}
          <circle cx={258} cy={185} r={10} fill="hsl(0 70% 50%)" />
          {/* Scale marks */}
          {[0, 20, 40, 60, 80, 100].map(t => {
            const y = 185 - (t / 100) * 120;
            return <g key={t}>
              <line x1={266} y1={y} x2={275} y2={y} stroke="hsl(var(--foreground))" strokeWidth={0.5} />
              <text x={280} y={y + 3} className="text-[7px] fill-foreground">{t}°C</text>
            </g>;
          })}
          {/* Reading */}
          <rect x={300} y={185 - mercuryHeight - 15} width={60} height={20} fill="hsl(var(--card))" rx={3} stroke="hsl(var(--primary))" />
          <text x={330} y={185 - mercuryHeight - 1} textAnchor="middle" className="text-[10px] fill-primary font-mono font-bold">{temp}°C</text>
        </svg>
      }
      liveData={<div className="space-y-1">
        <DataRow label="Sample" value={waterType} />
        <DataRow label="Temperature" value={temp} unit="°C" />
        <DataRow label="In Kelvin" value={temp + 273} unit="K" />
        <DataRow label="In °F" value={((temp * 9/5) + 32).toFixed(0)} unit="°F" />
      </div>}
      analysis={<p className="text-xs font-mono">T = {temp}°C = {temp + 273} K = {((temp * 9/5) + 32).toFixed(0)}°F</p>}
    />
  );
}
