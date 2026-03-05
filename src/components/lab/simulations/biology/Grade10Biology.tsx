import { useState } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";

export function OsmosisSimulation() {
  const [concentration, setConcentration] = useState(10);
  const [time, setTime] = useState(0);
  const waterMovement = concentration * time * 0.05;
  const leftLevel = 100 - waterMovement;
  const rightLevel = 100 + waterMovement;
  const reset = () => { setConcentration(10); setTime(0); };
  return (
    <SimulationLayout title="Lab: Osmosis Simulation" objective="Observe water movement across a semi-permeable membrane" theory="Water moves from low to high solute concentration across a semi-permeable membrane." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Solute (right)" value={concentration} onChange={setConcentration} min={0} max={30} unit="%" />
        <ControlGroup label="Time" value={time} onChange={setTime} min={0} max={60} unit="min" />
      </div>}
      workspace={<svg viewBox="0 0 300 250" className="w-full h-52">
        <rect x={40} y={50} width={100} height={160} fill="#3b82f633" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
        <rect x={160} y={50} width={100} height={160} fill="#3b82f655" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
        <line x1={140} y1={50} x2={160} y2={50} stroke="hsl(var(--foreground))" strokeWidth={2} />
        <line x1={140} y1={210} x2={160} y2={210} stroke="hsl(var(--foreground))" strokeWidth={2} />
        <line x1={150} y1={50} x2={150} y2={210} stroke="hsl(var(--foreground))" strokeWidth={2} strokeDasharray="4,4" />
        <rect x={45} y={210 - leftLevel * 1.4} width={90} height={leftLevel * 1.4} fill="#3b82f644" />
        <rect x={165} y={210 - rightLevel * 1.2} width={90} height={rightLevel * 1.2} fill="#3b82f666" />
        <text x={90} y={230} textAnchor="middle" className="text-[8px] fill-muted-foreground">Low solute</text>
        <text x={210} y={230} textAnchor="middle" className="text-[8px] fill-muted-foreground">High solute</text>
        {time > 0 && <text x={150} y={130} textAnchor="middle" className="text-[10px] fill-primary font-bold">→ H₂O →</text>}
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Left Level" value={leftLevel.toFixed(0)} unit="%" /><DataRow label="Right Level" value={Math.min(200, rightLevel).toFixed(0)} unit="%" /><DataRow label="Water Moved" value={waterMovement.toFixed(1)} unit="mL" /></div>}
    />
  );
}

export function TranspirationSimulation() {
  const [wind, setWind] = useState(5);
  const [humidity, setHumidity] = useState(50);
  const [lightInt, setLightInt] = useState(50);
  const rate = (wind * 0.3 + lightInt * 0.4 + (100 - humidity) * 0.3) / 10;
  const reset = () => { setWind(5); setHumidity(50); setLightInt(50); };
  return (
    <SimulationLayout title="Lab: Transpiration Simulation" objective="Investigate factors affecting water loss in plants" theory="Transpiration increases with wind, light, and low humidity." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Wind Speed" value={wind} onChange={setWind} min={0} max={20} unit="km/h" />
        <ControlGroup label="Humidity" value={humidity} onChange={setHumidity} min={10} max={100} unit="%" />
        <ControlGroup label="Light Intensity" value={lightInt} onChange={setLightInt} min={0} max={100} unit="%" />
      </div>}
      workspace={<svg viewBox="0 0 300 250" className="w-full h-52">
        <rect x={130} y={180} width={40} height={50} fill="#8B4513" rx={3} />
        <ellipse cx={150} cy={120} rx={60} ry={70} fill="#22c55e44" stroke="#22c55e" strokeWidth={2} />
        <text x={150} y={125} textAnchor="middle" className="text-[9px] fill-foreground">🌿</text>
        {rate > 2 && [0,1,2].map(i => <circle key={i} cx={150 + (i-1)*20} cy={50 - i * 5} r={3} fill="#93c5fd" opacity={0.5}><animate attributeName="cy" values={`${60};${20}`} dur={`${2/rate}s`} repeatCount="indefinite" /></circle>)}
        <text x={150} y={245} textAnchor="middle" className="text-[9px] fill-muted-foreground">Rate: {rate.toFixed(1)} mL/h</text>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Transpiration Rate" value={rate.toFixed(2)} unit="mL/h" /><DataRow label="Stomata" value={lightInt > 30 ? "Open" : "Closed"} /></div>}
    />
  );
}

export function FlowerDissection() {
  const [layer, setLayer] = useState(0);
  const parts = ["Complete Flower", "Remove Sepals", "Remove Petals", "Remove Stamens", "Pistil Only"];
  const reset = () => setLayer(0);
  return (
    <SimulationLayout title="Lab: Virtual Flower Dissection" objective="Identify flower parts layer by layer" theory="Sepals→Petals→Stamens (male)→Pistil (female: stigma, style, ovary)" onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Dissection Layer" value={layer} onChange={setLayer} min={0} max={4} unit="" />
        <p className="text-xs text-muted-foreground font-semibold">{parts[layer]}</p>
      </div>}
      workspace={<svg viewBox="0 0 300 250" className="w-full h-52">
        {layer < 1 && [0,1,2,3,4].map(i => <ellipse key={`s${i}`} cx={150 + Math.cos(i*1.26)*50} cy={125 + Math.sin(i*1.26)*50} rx={20} ry={10} fill="#22c55e" transform={`rotate(${i*72},${150 + Math.cos(i*1.26)*50},${125 + Math.sin(i*1.26)*50})`} />)}
        {layer < 2 && [0,1,2,3,4].map(i => <ellipse key={`p${i}`} cx={150 + Math.cos(i*1.26+0.3)*35} cy={125 + Math.sin(i*1.26+0.3)*35} rx={18} ry={10} fill="#ec4899" opacity={0.7} transform={`rotate(${i*72+36},${150 + Math.cos(i*1.26+0.3)*35},${125 + Math.sin(i*1.26+0.3)*35})`} />)}
        {layer < 3 && [0,1,2,3].map(i => <><line key={`st${i}`} x1={150} y1={125} x2={150 + Math.cos(i*1.57)*25} y2={125 + Math.sin(i*1.57)*25} stroke="#eab308" strokeWidth={2} /><circle cx={150 + Math.cos(i*1.57)*25} cy={125 + Math.sin(i*1.57)*25} r={4} fill="#eab308" /></>)}
        <rect x={145} y={110} width={10} height={30} fill="#16a34a" rx={2} />
        <circle cx={150} cy={105} r={6} fill="#15803d" />
        <ellipse cx={150} cy={145} rx={12} ry={8} fill="#166534" />
        <text x={150} y={200} textAnchor="middle" className="text-[10px] fill-foreground font-bold">{parts[layer]}</text>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Layer" value={parts[layer]} /><DataRow label="Visible" value={layer === 0 ? "All parts" : layer === 4 ? "Pistil only" : `${4-layer} layers left`} /></div>}
    />
  );
}

export function HeartPumping() {
  const [heartRate, setHeartRate] = useState(72);
  const [blocked, setBlocked] = useState(false);
  const strokeVol = blocked ? 40 : 70;
  const cardiacOutput = (heartRate * strokeVol) / 1000;
  const reset = () => { setHeartRate(72); setBlocked(false); };
  return (
    <SimulationLayout title="Lab: Heart Pumping Simulation" objective="Observe the cardiac cycle and blood flow" theory="Heart has 4 chambers. Right side→lungs, Left side→body. CO = HR × SV." onReset={reset}
      equipment={<div className="space-y-4">
        <ControlGroup label="Heart Rate" value={heartRate} onChange={setHeartRate} min={40} max={180} unit="bpm" />
        <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={blocked} onChange={e => setBlocked(e.target.checked)} className="rounded" />Block an artery</label>
      </div>}
      workspace={<svg viewBox="0 0 300 250" className="w-full h-52">
        <text x={150} y={20} textAnchor="middle" className="text-[10px] fill-foreground font-bold">Heart Diagram</text>
        <rect x={80} y={50} width={60} height={60} fill="#3b82f633" stroke="#3b82f6" strokeWidth={2} rx={8} /><text x={110} y={85} textAnchor="middle" className="text-[7px] fill-foreground">RA</text>
        <rect x={160} y={50} width={60} height={60} fill="#ef444433" stroke="#ef4444" strokeWidth={2} rx={8} /><text x={190} y={85} textAnchor="middle" className="text-[7px] fill-foreground">LA</text>
        <rect x={80} y={120} width={60} height={70} fill="#3b82f655" stroke="#3b82f6" strokeWidth={2} rx={8} /><text x={110} y={160} textAnchor="middle" className="text-[7px] fill-foreground">RV</text>
        <rect x={160} y={120} width={60} height={70} fill="#ef444455" stroke="#ef4444" strokeWidth={2} rx={8} /><text x={190} y={160} textAnchor="middle" className="text-[7px] fill-foreground">LV</text>
        <line x1={110} y1={40} x2={110} y2={30} stroke="#3b82f6" strokeWidth={2} /><text x={110} y={25} textAnchor="middle" className="text-[6px] fill-muted-foreground">Vena Cava</text>
        <line x1={190} y1={40} x2={190} y2={30} stroke="#ef4444" strokeWidth={2} /><text x={190} y={25} textAnchor="middle" className="text-[6px] fill-muted-foreground">Pulm. Vein</text>
        <line x1={190} y1={195} x2={190} y2={220} stroke={blocked ? "#6b7280" : "#ef4444"} strokeWidth={blocked ? 1 : 2} /><text x={190} y={235} textAnchor="middle" className="text-[6px] fill-muted-foreground">Aorta{blocked ? " ⛔" : ""}</text>
      </svg>}
      liveData={<div className="space-y-1"><DataRow label="Heart Rate" value={heartRate} unit="bpm" /><DataRow label="Stroke Vol" value={strokeVol} unit="mL" /><DataRow label="Cardiac Output" value={cardiacOutput.toFixed(1)} unit="L/min" /><DataRow label="Artery" value={blocked ? "Blocked ⚠️" : "Normal"} /></div>}
    />
  );
}
