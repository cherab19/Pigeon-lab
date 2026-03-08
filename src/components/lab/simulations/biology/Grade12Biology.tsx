import { useState, useEffect } from "react";
import SimulationLayout, { ControlGroup, DataRow } from "../../SimulationLayout";
import StepByStep from "../../StepByStep";

// ============ UNIT 1: Biotechnology ============

export function RecombinantDNA() {
  const steps = [
    "Read the Lab Objective", "Observe the DNA Molecule", "Select Restriction Enzyme",
    "Cut the DNA", "Open the Plasmid Vector", "Insert the Target Gene",
    "Use DNA Ligase", "Transform Bacteria", "Observe Results", "Record Observations"
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [enzymeSelected, setEnzymeSelected] = useState(false);
  const [dnaCut, setDnaCut] = useState(false);
  const [plasmidOpen, setPlasmidOpen] = useState(false);
  const [geneInserted, setGeneInserted] = useState(false);
  const [ligased, setLigased] = useState(false);
  const [transformed, setTransformed] = useState(false);
  const [glowing, setGlowing] = useState(false);

  const advanceStep = () => {
    const next = currentStep + 1;
    if (next <= 9) setCurrentStep(next);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case "enzyme": setEnzymeSelected(true); if (currentStep === 2) advanceStep(); break;
      case "cutDNA": if (enzymeSelected) { setDnaCut(true); if (currentStep === 3) advanceStep(); } break;
      case "openPlasmid": if (dnaCut) { setPlasmidOpen(true); if (currentStep === 4) advanceStep(); } break;
      case "insertGene": if (plasmidOpen) { setGeneInserted(true); if (currentStep === 5) advanceStep(); } break;
      case "ligase": if (geneInserted) { setLigased(true); if (currentStep === 6) advanceStep(); } break;
      case "transform": if (ligased) { setTransformed(true); if (currentStep === 7) advanceStep(); setTimeout(() => { setGlowing(true); if (currentStep >= 7) setCurrentStep(9); }, 1500); } break;
    }
  };

  const reset = () => {
    setCurrentStep(0); setEnzymeSelected(false); setDnaCut(false);
    setPlasmidOpen(false); setGeneInserted(false); setLigased(false);
    setTransformed(false); setGlowing(false);
  };

  return (
    <SimulationLayout
      title="Lab: Recombinant DNA / Genetic Engineering"
      objective="Create recombinant DNA by inserting a gene into a bacterial plasmid"
      theory="Restriction enzymes cut DNA at recognition sites. DNA ligase joins fragments. Transformed bacteria express the foreign gene."
      onReset={reset}
      equipment={
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Tools</p>
          <button onClick={() => handleAction("enzyme")} className={`w-full px-3 py-2 text-xs rounded-md border ${enzymeSelected ? "bg-primary/20 border-primary text-primary" : "border-border hover:bg-muted"}`}>
            🔪 Restriction Enzyme {enzymeSelected && "✓"}
          </button>
          <button onClick={() => handleAction("cutDNA")} disabled={!enzymeSelected} className="w-full px-3 py-2 text-xs rounded-md border border-border hover:bg-muted disabled:opacity-40">
            ✂️ Cut DNA
          </button>
          <button onClick={() => handleAction("openPlasmid")} disabled={!dnaCut} className="w-full px-3 py-2 text-xs rounded-md border border-border hover:bg-muted disabled:opacity-40">
            🔓 Open Plasmid
          </button>
          <button onClick={() => handleAction("insertGene")} disabled={!plasmidOpen} className="w-full px-3 py-2 text-xs rounded-md border border-border hover:bg-muted disabled:opacity-40">
            🧬 Insert Gene
          </button>
          <button onClick={() => handleAction("ligase")} disabled={!geneInserted} className="w-full px-3 py-2 text-xs rounded-md border border-border hover:bg-muted disabled:opacity-40">
            🔗 DNA Ligase
          </button>
          <button onClick={() => handleAction("transform")} disabled={!ligased} className="w-full px-3 py-2 text-xs rounded-md border border-border hover:bg-muted disabled:opacity-40">
            🦠 Transform Bacteria
          </button>
        </div>
      }
      workspace={
        <svg viewBox="0 0 420 260" className="w-full h-56">
          {/* DNA strand */}
          <text x={60} y={20} className="text-[9px] fill-muted-foreground font-semibold">DNA Strand</text>
          <line x1={20} y1={40} x2={180} y2={40} stroke="hsl(var(--primary))" strokeWidth={3} strokeDasharray={dnaCut ? "40,10" : "0"} />
          <line x1={20} y1={50} x2={180} y2={50} stroke="hsl(var(--secondary))" strokeWidth={3} strokeDasharray={dnaCut ? "40,10" : "0"} />
          {dnaCut && <text x={90} y={70} textAnchor="middle" className="text-[7px] fill-destructive">✂️ Cut!</text>}
          {/* Target gene */}
          {dnaCut && <rect x={70} y={35} width={40} height={20} fill="#22c55e" opacity={0.7} rx={3} />}
          {dnaCut && <text x={90} y={48} textAnchor="middle" className="text-[6px] fill-white font-bold">GENE</text>}

          {/* Plasmid */}
          <text x={300} y={20} className="text-[9px] fill-muted-foreground font-semibold">Plasmid</text>
          <circle cx={300} cy={70} r={35} fill="none" stroke="hsl(var(--accent))" strokeWidth={2.5} strokeDasharray={plasmidOpen ? "30,8" : "0"} />
          {geneInserted && <rect x={280} y={60} width={40} height={12} fill="#22c55e" rx={3} />}
          {geneInserted && <text x={300} y={69} textAnchor="middle" className="text-[5px] fill-white font-bold">GENE</text>}
          {ligased && <text x={300} y={115} textAnchor="middle" className="text-[7px] fill-primary">🔗 Sealed</text>}

          {/* Bacteria */}
          {transformed && (
            <g>
              <text x={210} y={150} textAnchor="middle" className="text-[9px] fill-muted-foreground font-semibold">Petri Dish</text>
              <ellipse cx={210} cy={200} rx={90} ry={45} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} />
              {Array.from({ length: 12 }, (_, i) => (
                <circle key={i} cx={160 + (i % 4) * 30 + (Math.sin(i) * 5)} cy={185 + Math.floor(i / 4) * 18} r={6}
                  fill={glowing ? "#22c55e" : "hsl(var(--muted-foreground))"} opacity={glowing ? 0.9 : 0.4}>
                  {glowing && <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />}
                </circle>
              ))}
              {glowing && <text x={210} y={250} textAnchor="middle" className="text-[10px] fill-primary font-bold">✨ Colonies Expressing Gene!</text>}
            </g>
          )}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Enzyme" value={enzymeSelected ? "Selected" : "—"} />
          <DataRow label="DNA Cut" value={dnaCut ? "Yes" : "No"} />
          <DataRow label="Plasmid" value={plasmidOpen ? "Open" : "Closed"} />
          <DataRow label="Gene Inserted" value={geneInserted ? "Yes" : "No"} />
          <DataRow label="Ligated" value={ligased ? "Yes" : "No"} />
          <DataRow label="Transformed" value={transformed ? "Yes" : "No"} />
          <DataRow label="Expression" value={glowing ? "✅ Success" : "Pending"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={currentStep} onStepClick={i => { if (i <= 1) setCurrentStep(i); }} />}
    />
  );
}

// ============ UNIT 2: Microbiology ============

export function MicroorganismObservation() {
  const steps = [
    "Open the Virtual Microscope", "Select Sample Slide", "Place Slide on Stage",
    "Adjust Magnification", "Adjust Focus", "Apply Staining",
    "Observe Cell Structure", "Compare Organisms", "Capture Image", "Record Observations"
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [sample, setSample] = useState<"bacteria" | "fungi" | "virus">("bacteria");
  const [magnification, setMagnification] = useState(10);
  const [focus, setFocus] = useState(50);
  const [stainApplied, setStainApplied] = useState(false);
  const [gramType, setGramType] = useState<"positive" | "negative">("positive");

  const blurAmount = Math.abs(focus - 50) / 10;
  const sampleData: Record<string, { shape: string; color: string; stainColor: string; size: number }> = {
    bacteria: { shape: "rod", color: "hsl(var(--muted-foreground))", stainColor: gramType === "positive" ? "#7c3aed" : "#ef4444", size: 8 },
    fungi: { shape: "circle", color: "#a3a3a3", stainColor: "#3b82f6", size: 20 },
    virus: { shape: "hex", color: "#737373", stainColor: "#f97316", size: 5 },
  };
  const s = sampleData[sample];
  const displayColor = stainApplied ? s.stainColor : s.color;

  const reset = () => { setCurrentStep(0); setSample("bacteria"); setMagnification(10); setFocus(50); setStainApplied(false); };

  return (
    <SimulationLayout
      title="Lab: Virtual Microscope – Microorganism Observation"
      objective="Observe and compare bacteria, fungi, and viruses under a microscope"
      theory="Microorganisms differ in size, structure, and staining properties. Gram staining differentiates bacteria by cell wall composition."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Sample Slide</p>
            {(["bacteria", "fungi", "virus"] as const).map(s => (
              <label key={s} className="flex items-center gap-2 text-xs capitalize">
                <input type="radio" checked={sample === s} onChange={() => { setSample(s); if (currentStep < 2) setCurrentStep(2); }} /> {s}
              </label>
            ))}
          </div>
          <ControlGroup label="Magnification" value={magnification} onChange={v => { setMagnification(v); if (currentStep < 4) setCurrentStep(3); }} min={10} max={1000} step={10} unit="×" />
          <ControlGroup label="Focus" value={focus} onChange={v => { setFocus(v); if (currentStep < 5) setCurrentStep(4); }} min={0} max={100} />
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Staining</p>
            <button onClick={() => { setStainApplied(!stainApplied); if (currentStep < 6) setCurrentStep(5); }} className={`w-full px-3 py-2 text-xs rounded-md border ${stainApplied ? "bg-primary/20 border-primary" : "border-border hover:bg-muted"}`}>
              {stainApplied ? "Stain Applied ✓" : "Apply Gram Stain"}
            </button>
            {stainApplied && (
              <div className="flex gap-2">
                {(["positive", "negative"] as const).map(g => (
                  <label key={g} className="flex items-center gap-1 text-xs">
                    <input type="radio" checked={gramType === g} onChange={() => setGramType(g)} /> Gram {g === "positive" ? "+" : "−"}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      }
      workspace={
        <div className="relative">
          <svg viewBox="0 0 300 300" className="w-full h-56" style={{ filter: `blur(${blurAmount}px)` }}>
            <circle cx={150} cy={150} r={130} fill="#f8fafc" stroke="hsl(var(--border))" strokeWidth={3} />
            <circle cx={150} cy={150} r={128} fill="#fefce8" opacity={0.3} />
            {sample === "bacteria" && Array.from({ length: Math.min(30, magnification / 5) }, (_, i) => (
              <ellipse key={i} cx={80 + (i % 6) * 25 + Math.sin(i) * 10} cy={80 + Math.floor(i / 6) * 30 + Math.cos(i) * 8}
                rx={s.size * (magnification / 100)} ry={s.size * 0.4 * (magnification / 100)} fill={displayColor} opacity={0.8}
                transform={`rotate(${i * 30}, ${80 + (i % 6) * 25}, ${80 + Math.floor(i / 6) * 30})`} />
            ))}
            {sample === "fungi" && Array.from({ length: Math.min(8, magnification / 30) }, (_, i) => (
              <g key={i}>
                <circle cx={100 + (i % 3) * 50} cy={100 + Math.floor(i / 3) * 60} r={s.size * (magnification / 200)} fill={displayColor} opacity={0.6} />
                <line x1={100 + (i % 3) * 50} y1={100 + Math.floor(i / 3) * 60 - s.size} x2={100 + (i % 3) * 50 + 15} y2={100 + Math.floor(i / 3) * 60 - s.size - 20} stroke={displayColor} strokeWidth={1.5} />
              </g>
            ))}
            {sample === "virus" && magnification >= 100 && Array.from({ length: Math.min(20, magnification / 50) }, (_, i) => (
              <polygon key={i} points={`${120 + (i % 5) * 20},${100 + Math.floor(i / 5) * 25 - 4} ${120 + (i % 5) * 20 + 4},${100 + Math.floor(i / 5) * 25 + 3} ${120 + (i % 5) * 20 - 4},${100 + Math.floor(i / 5) * 25 + 3}`}
                fill={displayColor} opacity={0.7} />
            ))}
            {sample === "virus" && magnification < 100 && <text x={150} y={155} textAnchor="middle" className="text-[8px] fill-muted-foreground">Increase magnification to see viruses</text>}
          </svg>
        </div>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Sample" value={sample} />
          <DataRow label="Magnification" value={`${magnification}×`} />
          <DataRow label="Focus" value={blurAmount < 1 ? "Sharp" : "Blurry"} />
          <DataRow label="Stain" value={stainApplied ? `Gram ${gramType === "positive" ? "+" : "−"}` : "None"} />
          <DataRow label="Shape" value={sample === "bacteria" ? "Rod/Bacillus" : sample === "fungi" ? "Spherical + Hyphae" : "Icosahedral"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={currentStep} onStepClick={i => setCurrentStep(i)} />}
    />
  );
}

// ============ UNIT 3: Ecology ============

export function EcosystemSimulation() {
  const steps = [
    "Choose Ecosystem Type", "Add Producers", "Add Primary Consumers",
    "Add Secondary Consumers", "Start Simulation", "Observe Population Changes",
    "Change Environmental Factors", "Observe Predator-Prey Interaction",
    "Generate Food Web", "Record Population Graph"
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [ecosystem, setEcosystem] = useState<"grassland" | "forest" | "aquatic">("grassland");
  const [producers, setProducers] = useState(50);
  const [herbivores, setHerbivores] = useState(20);
  const [predators, setPredators] = useState(5);
  const [rainfall, setRainfall] = useState(50);
  const [temperature, setTemperature] = useState(25);
  const [generation, setGeneration] = useState(0);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<{ p: number; h: number; pr: number }[]>([]);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setGeneration(g => g + 1);
      setProducers(p => Math.max(5, Math.min(100, p + (rainfall / 25) - (herbivores / 10) + Math.random() * 4 - 2)));
      setHerbivores(h => Math.max(2, Math.min(80, h + (producers / 30) - (predators / 3) + Math.random() * 3 - 1.5)));
      setPredators(pr => Math.max(1, Math.min(40, pr + (herbivores / 20) - 1 + Math.random() * 2 - 1)));
    }, 1000);
    return () => clearInterval(iv);
  }, [running, rainfall, producers, herbivores, predators]);

  useEffect(() => {
    if (running) {
      setHistory(h => [...h.slice(-20), { p: Math.round(producers), h: Math.round(herbivores), pr: Math.round(predators) }]);
    }
  }, [generation]);

  const reset = () => {
    setCurrentStep(0); setProducers(50); setHerbivores(20); setPredators(5);
    setRainfall(50); setTemperature(25); setGeneration(0); setRunning(false); setHistory([]);
  };

  return (
    <SimulationLayout
      title="Lab: Ecosystem Simulation"
      objective="Build an ecosystem and observe population dynamics and predator-prey interactions"
      theory="Producers form the base of food chains. Predator-prey interactions create cyclic population patterns. Environmental factors affect all trophic levels."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">Ecosystem</p>
            {(["grassland", "forest", "aquatic"] as const).map(e => (
              <label key={e} className="flex items-center gap-2 text-xs capitalize">
                <input type="radio" checked={ecosystem === e} onChange={() => { setEcosystem(e); if (currentStep < 1) setCurrentStep(0); }} /> {e}
              </label>
            ))}
          </div>
          <ControlGroup label="Rainfall" value={rainfall} onChange={v => { setRainfall(v); if (currentStep < 7) setCurrentStep(6); }} min={0} max={100} unit="%" />
          <ControlGroup label="Temperature" value={temperature} onChange={setTemperature} min={0} max={50} unit="°C" />
          <button onClick={() => { setRunning(!running); if (!running && currentStep < 5) setCurrentStep(4); }}
            className={`w-full px-3 py-2 text-xs rounded-md ${running ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>
            {running ? "⏸ Pause" : "▶ Start Simulation"}
          </button>
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 250" className="w-full h-52">
          {/* Background */}
          <rect x={0} y={0} width={400} height={180} fill={ecosystem === "aquatic" ? "#0ea5e911" : ecosystem === "forest" ? "#16a34a11" : "#eab30811"} rx={8} />
          <text x={200} y={18} textAnchor="middle" className="text-[8px] fill-muted-foreground capitalize">{ecosystem} — Gen {generation}</text>

          {/* Producers */}
          {Array.from({ length: Math.min(20, Math.round(producers / 3)) }, (_, i) => (
            <text key={`p${i}`} x={15 + (i % 10) * 38} y={50 + Math.floor(i / 10) * 30} className="text-[12px]">
              {ecosystem === "aquatic" ? "🌿" : ecosystem === "forest" ? "🌲" : "🌾"}
            </text>
          ))}
          {/* Herbivores */}
          {Array.from({ length: Math.min(10, Math.round(herbivores / 3)) }, (_, i) => (
            <text key={`h${i}`} x={20 + (i % 5) * 70} y={110 + Math.floor(i / 5) * 25} className="text-[14px]">
              {ecosystem === "aquatic" ? "🐟" : "🐇"}
            </text>
          ))}
          {/* Predators */}
          {Array.from({ length: Math.min(6, Math.round(predators)) }, (_, i) => (
            <text key={`pr${i}`} x={40 + i * 55} y={155} className="text-[16px]">
              {ecosystem === "aquatic" ? "🦈" : ecosystem === "forest" ? "🦊" : "🦅"}
            </text>
          ))}

          {/* Mini graph */}
          {history.length > 1 && (
            <g transform="translate(10,180)">
              <rect x={0} y={0} width={380} height={60} fill="hsl(var(--muted))" rx={4} opacity={0.5} />
              {history.map((d, i) => {
                if (i === 0) return null;
                const x1 = (i - 1) / 20 * 370 + 5;
                const x2 = i / 20 * 370 + 5;
                return (
                  <g key={i}>
                    <line x1={x1} y1={55 - (history[i - 1].p / 100) * 50} x2={x2} y2={55 - (d.p / 100) * 50} stroke="#22c55e" strokeWidth={1.5} />
                    <line x1={x1} y1={55 - (history[i - 1].h / 80) * 50} x2={x2} y2={55 - (d.h / 80) * 50} stroke="#3b82f6" strokeWidth={1.5} />
                    <line x1={x1} y1={55 - (history[i - 1].pr / 40) * 50} x2={x2} y2={55 - (d.pr / 40) * 50} stroke="#ef4444" strokeWidth={1.5} />
                  </g>
                );
              })}
              <text x={5} y={10} className="text-[5px] fill-foreground">🟢 Producers  🔵 Herbivores  🔴 Predators</text>
            </g>
          )}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Ecosystem" value={ecosystem} />
          <DataRow label="Generation" value={generation} />
          <DataRow label="Producers" value={Math.round(producers)} />
          <DataRow label="Herbivores" value={Math.round(herbivores)} />
          <DataRow label="Predators" value={Math.round(predators)} />
          <DataRow label="Rainfall" value={`${rainfall}%`} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={currentStep} onStepClick={i => setCurrentStep(i)} />}
    />
  );
}

// ============ UNIT 4: Evolution ============

export function NaturalSelection() {
  const steps = [
    "Start Population Simulation", "Choose Trait Variation", "Introduce Environmental Conditions",
    "Run Simulation for One Generation", "Observe Survival Rates", "Reproduce Surviving Individuals",
    "Run Multiple Generations", "Observe Allele Frequency Change", "Analyze Graph", "Explain Natural Selection Outcome"
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [trait, setTrait] = useState<"fur" | "speed" | "camouflage">("fur");
  const [bgColor, setBgColor] = useState<"light" | "dark">("light");
  const [predatorDensity, setPredatorDensity] = useState(3);
  const [generations, setGenerations] = useState(0);

  const lightAlleleFreq = (() => {
    if (predatorDensity === 0) return 50;
    const pressure = predatorDensity * generations * 3;
    if (bgColor === "light") return Math.max(10, 50 + Math.min(40, pressure));
    return Math.max(10, 50 - Math.min(40, pressure));
  })();
  const darkAlleleFreq = 100 - lightAlleleFreq;
  const survivalRate = predatorDensity > 0 ? Math.max(20, 90 - predatorDensity * 5 - generations * 2) : 95;

  const reset = () => { setCurrentStep(0); setTrait("fur"); setBgColor("light"); setPredatorDensity(3); setGenerations(0); };

  return (
    <SimulationLayout
      title="Lab: Natural Selection Simulation"
      objective="Observe how environmental pressures drive allele frequency changes over generations"
      theory="Organisms with traits better suited to the environment survive and reproduce more, shifting allele frequencies over generations."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">Trait</p>
            {(["fur", "speed", "camouflage"] as const).map(t => (
              <label key={t} className="flex items-center gap-2 text-xs capitalize">
                <input type="radio" checked={trait === t} onChange={() => { setTrait(t); if (currentStep < 2) setCurrentStep(1); }} /> {t === "fur" ? "Fur Color" : t === "speed" ? "Speed" : "Camouflage"}
              </label>
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">Environment</p>
            {(["light", "dark"] as const).map(c => (
              <label key={c} className="flex items-center gap-2 text-xs capitalize">
                <input type="radio" checked={bgColor === c} onChange={() => { setBgColor(c); if (currentStep < 3) setCurrentStep(2); }} /> {c} Background
              </label>
            ))}
          </div>
          <ControlGroup label="Predator Density" value={predatorDensity} onChange={v => { setPredatorDensity(v); if (currentStep < 3) setCurrentStep(2); }} min={0} max={10} />
          <ControlGroup label="Generations" value={generations} onChange={v => { setGenerations(v); if (currentStep < 7) setCurrentStep(v > 1 ? 6 : 3); }} min={0} max={20} />
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 220" className="w-full h-48">
          <rect x={10} y={10} width={380} height={130} fill={bgColor === "light" ? "#e5e7eb" : "#374151"} rx={6} />
          {Array.from({ length: 20 }, (_, i) => {
            const isLight = i < Math.floor(lightAlleleFreq / 5);
            return (
              <circle key={i} cx={30 + (i % 10) * 36} cy={35 + Math.floor(i / 10) * 50} r={14}
                fill={isLight ? "#d1d5db" : "#1f2937"} stroke={isLight ? "#9ca3af" : "#4b5563"} strokeWidth={1.5} />
            );
          })}
          {predatorDensity > 0 && Array.from({ length: Math.min(5, predatorDensity) }, (_, i) => (
            <text key={i} x={350} y={30 + i * 25} className="text-[14px]">🦅</text>
          ))}

          {/* Allele bar */}
          <rect x={10} y={155} width={380} height={18} fill="#d1d5db" rx={4} />
          <rect x={10} y={155} width={380 * lightAlleleFreq / 100} height={18} fill="#9ca3af" rx={4} />
          <text x={200} y={167} textAnchor="middle" className="text-[7px] fill-foreground font-bold">Light {lightAlleleFreq}% | Dark {darkAlleleFreq}%</text>

          <text x={200} y={195} textAnchor="middle" className="text-[9px] fill-foreground font-semibold">Generation {generations}</text>
          <text x={200} y={210} textAnchor="middle" className="text-[7px] fill-muted-foreground">
            Selection favors: {predatorDensity > 0 ? (bgColor === "light" ? "light-colored" : "dark-colored") : "none (no predators)"}
          </text>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Trait" value={trait} />
          <DataRow label="Light Allele" value={`${lightAlleleFreq}%`} />
          <DataRow label="Dark Allele" value={`${darkAlleleFreq}%`} />
          <DataRow label="Survival Rate" value={`${survivalRate}%`} />
          <DataRow label="Predators" value={predatorDensity} />
          <DataRow label="Generation" value={generations} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={currentStep} onStepClick={i => setCurrentStep(i)} />}
    />
  );
}

// ============ UNIT 5: Nervous System ============

export function PupilReflexExperiment() {
  const steps = [
    "Observe Eye in Normal Light", "Record Initial Pupil Size", "Cover Eyes for 1 Minute",
    "Remove Hand or Cover", "Observe Immediate Change", "Increase Light Intensity",
    "Observe Pupil Constriction", "Return to Normal Light", "Record Pupil Changes", "Explain Reflex Mechanism"
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [lightIntensity, setLightIntensity] = useState(50);
  const [eyesCovered, setEyesCovered] = useState(false);
  const [coverTimer, setCoverTimer] = useState(0);

  const pupilSize = eyesCovered ? 22 : Math.max(6, 24 - lightIntensity * 0.2);
  const reactionTime = lightIntensity > 70 ? "~0.3s" : lightIntensity < 30 ? "~0.5s" : "~0.4s";

  useEffect(() => {
    if (!eyesCovered) { setCoverTimer(0); return; }
    const iv = setInterval(() => setCoverTimer(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [eyesCovered]);

  const reset = () => { setCurrentStep(0); setLightIntensity(50); setEyesCovered(false); setCoverTimer(0); };

  return (
    <SimulationLayout
      title="Lab: Pupil Reflex Experiment"
      objective="Observe how pupil size changes in response to light intensity"
      theory="The pupil reflex is an involuntary response. In bright light, circular muscles contract (pupil constricts). In dim light, radial muscles contract (pupil dilates)."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Light Intensity" value={lightIntensity} onChange={v => {
            setLightIntensity(v);
            if (v > 70 && currentStep < 7) setCurrentStep(5);
            else if (v < 30 && currentStep >= 5) setCurrentStep(7);
          }} min={0} max={100} unit="%" />
          <button onClick={() => {
            setEyesCovered(!eyesCovered);
            if (!eyesCovered && currentStep < 3) setCurrentStep(2);
            if (eyesCovered && currentStep < 4) setCurrentStep(3);
          }} className={`w-full px-3 py-2 text-xs rounded-md border ${eyesCovered ? "bg-primary/20 border-primary" : "border-border hover:bg-muted"}`}>
            {eyesCovered ? `👐 Uncover Eyes (${coverTimer}s)` : "🙈 Cover Eyes"}
          </button>
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          {/* Light rays */}
          {!eyesCovered && Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={150} y1={10} x2={100 + i * 12} y2={70} stroke="#eab308" strokeWidth={0.5} opacity={lightIntensity / 100} />
          ))}
          {lightIntensity > 70 && !eyesCovered && <text x={150} y={25} textAnchor="middle" className="text-[16px]">☀️</text>}
          {lightIntensity < 30 && !eyesCovered && <text x={150} y={25} textAnchor="middle" className="text-[16px]">🌙</text>}

          {/* Eye */}
          <ellipse cx={150} cy={120} rx={65} ry={40} fill="white" stroke="hsl(var(--border))" strokeWidth={2} />
          <circle cx={150} cy={120} r={28} fill="#8B4513" />
          <circle cx={150} cy={120} r={pupilSize} fill="black">
            <animate attributeName="r" to={pupilSize} dur="0.5s" fill="freeze" />
          </circle>
          <circle cx={142} cy={112} r={4} fill="white" opacity={0.6} />

          {eyesCovered && <rect x={70} y={70} width={160} height={100} fill="hsl(var(--foreground))" rx={10} opacity={0.8} />}
          {eyesCovered && <text x={150} y={125} textAnchor="middle" className="text-[12px]" fill="white">Eyes Covered</text>}

          {/* Labels */}
          <text x={150} y={190} textAnchor="middle" className="text-[9px] fill-foreground font-semibold">
            Pupil Diameter: {(pupilSize * 0.3).toFixed(1)} mm
          </text>
          <text x={150} y={205} textAnchor="middle" className="text-[8px] fill-muted-foreground">
            {pupilSize > 18 ? "Dilated (dim light)" : pupilSize < 10 ? "Constricted (bright light)" : "Normal"}
          </text>

          {/* Reflex arc diagram */}
          <g transform="translate(30,215)">
            <text x={0} y={10} className="text-[6px] fill-muted-foreground">Light → Retina → Optic Nerve → Brain → Ciliary Muscles → Pupil Response</text>
            <line x1={0} y1={15} x2={270} y2={15} stroke="hsl(var(--primary))" strokeWidth={1} markerEnd="url(#arrowhead)" />
          </g>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Light" value={`${lightIntensity}%`} />
          <DataRow label="Pupil Size" value={`${(pupilSize * 0.3).toFixed(1)} mm`} />
          <DataRow label="Eyes" value={eyesCovered ? `Covered (${coverTimer}s)` : "Open"} />
          <DataRow label="Reaction Time" value={reactionTime} />
          <DataRow label="Response" value={pupilSize > 18 ? "Dilation" : pupilSize < 10 ? "Constriction" : "Normal"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={currentStep} onStepClick={i => setCurrentStep(i)} />}
    />
  );
}

export function ReflexArcSynapse() {
  const steps = [
    "Observe Object in Air", "Fill Glass with Water", "Insert Pencil into Water",
    "Observe Apparent Bending", "Change Viewing Angle", "Observe Image Distortion",
    "Explain Light Refraction", "Record Observation"
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [waterLevel, setWaterLevel] = useState(0);
  const [pencilAngle, setPencilAngle] = useState(80);
  const [viewAngle, setViewAngle] = useState(0);

  const refractionOffset = waterLevel > 20 ? (waterLevel / 100) * 25 * Math.sin((pencilAngle / 180) * Math.PI) : 0;

  const reset = () => { setCurrentStep(0); setWaterLevel(0); setPencilAngle(80); setViewAngle(0); };

  return (
    <SimulationLayout
      title="Lab: Light Refraction Experiment"
      objective="Observe how light refracts when passing through water"
      theory="Light bends (refracts) when passing from one medium to another due to change in speed. Objects in water appear shifted or bent."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Water Level" value={waterLevel} onChange={v => { setWaterLevel(v); if (v > 0 && currentStep < 2) setCurrentStep(1); }} min={0} max={100} unit="%" />
          <ControlGroup label="Pencil Angle" value={pencilAngle} onChange={v => { setPencilAngle(v); if (currentStep < 4) setCurrentStep(3); }} min={30} max={90} unit="°" />
          <ControlGroup label="View Angle" value={viewAngle} onChange={v => { setViewAngle(v); if (currentStep < 5) setCurrentStep(4); }} min={-30} max={30} unit="°" />
        </div>
      }
      workspace={
        <svg viewBox="0 0 300 250" className="w-full h-52">
          {/* Glass */}
          <rect x={100} y={50} width={100} height={160} fill="none" stroke="hsl(var(--border))" strokeWidth={2} rx={4} />
          {/* Water */}
          {waterLevel > 0 && <rect x={102} y={50 + 158 * (1 - waterLevel / 100)} width={96} height={158 * waterLevel / 100} fill="#3b82f622" rx={2} />}
          {waterLevel > 0 && <line x1={102} y1={50 + 158 * (1 - waterLevel / 100)} x2={198} y2={50 + 158 * (1 - waterLevel / 100)} stroke="#3b82f6" strokeWidth={1} />}

          {/* Pencil above water */}
          <line x1={150 + viewAngle * 0.5} y1={30} x2={150 + viewAngle * 0.5} y2={50 + 158 * (1 - waterLevel / 100)}
            stroke="#f97316" strokeWidth={4} strokeLinecap="round" />
          {/* Pencil below water (refracted) */}
          {waterLevel > 0 && (
            <line x1={150 + viewAngle * 0.5} y1={50 + 158 * (1 - waterLevel / 100)}
              x2={150 + viewAngle * 0.5 + refractionOffset} y2={208}
              stroke="#f97316" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
          )}
          {waterLevel === 0 && (
            <line x1={150 + viewAngle * 0.5} y1={30} x2={150 + viewAngle * 0.5} y2={208}
              stroke="#f97316" strokeWidth={4} strokeLinecap="round" />
          )}

          <text x={150} y={230} textAnchor="middle" className="text-[8px] fill-foreground font-semibold">
            Refraction offset: {refractionOffset.toFixed(1)}px
          </text>
          {waterLevel > 20 && <text x={150} y={245} textAnchor="middle" className="text-[7px] fill-muted-foreground">
            Pencil appears bent at water surface!
          </text>}
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Water Level" value={`${waterLevel}%`} />
          <DataRow label="Pencil Angle" value={`${pencilAngle}°`} />
          <DataRow label="View Angle" value={`${viewAngle}°`} />
          <DataRow label="Refraction" value={refractionOffset > 1 ? "Visible" : "None"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={currentStep} onStepClick={i => setCurrentStep(i)} />}
    />
  );
}

// ============ UNIT 6: Reproduction ============

export function HormoneCycle() {
  const steps = [
    "Start Cycle Simulation", "Set Day = 1", "Observe Hormone Levels",
    "Move Day Slider", "Identify Ovulation Day", "Observe Hormonal Peaks",
    "Activate Fertilization Option", "Observe Pregnancy Path",
    "Generate Hormone Graph", "Explain Hormone Regulation"
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [day, setDay] = useState(1);
  const [fertilization, setFertilization] = useState(false);

  const fsh = day <= 14 ? 20 + (14 - Math.abs(day - 7)) * 3 : 10;
  const lh = Math.abs(day - 14) < 2 ? 80 : 15;
  const estrogen = day <= 14 ? day * 5 : 70 - (day - 14) * 3;
  const progesterone = day > 14 ? (fertilization ? (day - 14) * 7 : (day - 14) * 5) : 5;
  const phase = day <= 5 ? "Menstruation" : day <= 13 ? "Follicular" : day === 14 ? "Ovulation" : "Luteal";

  const reset = () => { setCurrentStep(0); setDay(1); setFertilization(false); };

  return (
    <SimulationLayout
      title="Lab: Menstrual Cycle Hormone Simulation"
      objective="Track hormone levels and ovarian changes through the 28-day cycle"
      theory="FSH stimulates follicle growth, estrogen thickens the uterine lining, LH triggers ovulation, progesterone maintains the lining."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <ControlGroup label="Day" value={day} onChange={v => {
            setDay(v);
            if (currentStep < 4 && v > 1) setCurrentStep(3);
            if (v === 14 && currentStep < 5) setCurrentStep(4);
          }} min={1} max={28} />
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={fertilization} onChange={e => {
              setFertilization(e.target.checked);
              if (e.target.checked && currentStep < 7) setCurrentStep(6);
            }} className="rounded" />
            Fertilization Occurred
          </label>
        </div>
      }
      workspace={
        <svg viewBox="0 0 400 240" className="w-full h-52">
          <text x={200} y={15} textAnchor="middle" className="text-[9px] fill-foreground font-bold">Hormone Levels — Day {day} ({phase})</text>

          <line x1={40} y1={200} x2={370} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />
          <line x1={40} y1={25} x2={40} y2={200} stroke="hsl(var(--border))" strokeWidth={1} />

          {Array.from({ length: 28 }, (_, i) => {
            const d = i + 1;
            const x = 40 + (d / 28) * 330;
            const calcFsh = (dd: number) => dd <= 14 ? 20 + (14 - Math.abs(dd - 7)) * 3 : 10;
            const calcLh = (dd: number) => Math.abs(dd - 14) < 2 ? 80 : 15;
            const calcEst = (dd: number) => dd <= 14 ? dd * 5 : 70 - (dd - 14) * 3;
            const calcProg = (dd: number) => dd > 14 ? (fertilization ? (dd - 14) * 7 : (dd - 14) * 5) : 5;

            const fshY = 200 - (calcFsh(d) / 100) * 170;
            const lhY = 200 - (calcLh(d) / 100) * 170;
            const estY = 200 - (calcEst(d) / 100) * 170;
            const progY = 200 - (Math.min(calcProg(d), 100) / 100) * 170;
            const px = 40 + ((d - 1) / 28) * 330;

            return d > 1 ? (
              <g key={d}>
                <line x1={px} y1={200 - (calcFsh(d - 1) / 100) * 170} x2={x} y2={fshY} stroke="#f97316" strokeWidth={1.5} />
                <line x1={px} y1={200 - (calcLh(d - 1) / 100) * 170} x2={x} y2={lhY} stroke="#ef4444" strokeWidth={1.5} />
                <line x1={px} y1={200 - (calcEst(d - 1) / 100) * 170} x2={x} y2={estY} stroke="#3b82f6" strokeWidth={1.5} />
                <line x1={px} y1={200 - (Math.min(calcProg(d - 1), 100) / 100) * 170} x2={x} y2={progY} stroke="#22c55e" strokeWidth={1.5} />
              </g>
            ) : null;
          })}

          <line x1={40 + (day / 28) * 330} y1={25} x2={40 + (day / 28) * 330} y2={200} stroke="hsl(var(--foreground))" strokeWidth={1} strokeDasharray="3,3" />

          {/* Ovary animation */}
          {day === 14 && <text x={200} y={225} textAnchor="middle" className="text-[10px] fill-primary font-bold">🥚 Ovulation!</text>}
          {fertilization && day > 14 && <text x={200} y={225} textAnchor="middle" className="text-[9px] fill-primary font-bold">🤰 Pregnancy — HCG rising</text>}

          <g transform="translate(280,28)">
            {[["FSH", "#f97316"], ["LH", "#ef4444"], ["Estrogen", "#3b82f6"], ["Progesterone", "#22c55e"]].map(([n, c], i) => (
              <g key={n}><rect x={0} y={i * 12} width={8} height={8} fill={c as string} rx={1} /><text x={12} y={i * 12 + 7} className="text-[6px] fill-foreground">{n}</text></g>
            ))}
          </g>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Day" value={day} />
          <DataRow label="Phase" value={phase} />
          <DataRow label="FSH" value={fsh.toFixed(0)} />
          <DataRow label="LH" value={lh.toFixed(0)} />
          <DataRow label="Estrogen" value={Math.max(0, estrogen).toFixed(0)} />
          <DataRow label="Progesterone" value={Math.min(progesterone, 100).toFixed(0)} />
          <DataRow label="Fertilization" value={fertilization ? "Yes" : "No"} />
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={currentStep} onStepClick={i => setCurrentStep(i)} />}
    />
  );
}

// ============ UNIT 7: Genetics ============

export function PunnettSquareSimulation() {
  const steps = [
    "Enter Parent Genotypes", "Generate Gametes", "Construct Punnett Square",
    "Combine Gametes", "Determine Offspring Genotypes", "Determine Phenotypes",
    "Calculate Probabilities", "Compare with Mendel's Law", "Visualize Offspring Traits", "Save Result"
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [parent1, setParent1] = useState("Aa");
  const [parent2, setParent2] = useState("Aa");
  const [dominantTrait, setDominantTrait] = useState("Tall");
  const [recessiveTrait, setRecessiveTrait] = useState("Dwarf");

  const gametes1 = [parent1[0], parent1[1]];
  const gametes2 = [parent2[0], parent2[1]];

  const offspring = gametes1.flatMap(g1 => gametes2.map(g2 => {
    const alleles = [g1, g2].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    if (alleles[0] === alleles[0].toUpperCase()) return alleles.join("");
    return alleles[1] === alleles[1].toUpperCase() ? [alleles[1], alleles[0]].join("") : alleles.join("");
  }));

  const genotypeCounts: Record<string, number> = {};
  offspring.forEach(o => { genotypeCounts[o] = (genotypeCounts[o] || 0) + 1; });

  const dominantCount = offspring.filter(o => o[0] === o[0].toUpperCase()).length;
  const recessiveCount = 4 - dominantCount;

  const validGenotypes = ["AA", "Aa", "aa"];
  const reset = () => { setCurrentStep(0); setParent1("Aa"); setParent2("Aa"); };

  return (
    <SimulationLayout
      title="Lab: Punnett Square Simulation"
      objective="Predict offspring ratios using a Punnett Square for monohybrid crosses"
      theory="A monohybrid cross examines one gene. Heterozygous cross (Aa × Aa) yields 1:2:1 genotypic ratio and 3:1 phenotypic ratio."
      onReset={reset}
      equipment={
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Parent 1 Genotype</p>
            {validGenotypes.map(g => (
              <label key={`p1-${g}`} className="flex items-center gap-2 text-xs">
                <input type="radio" checked={parent1 === g} onChange={() => { setParent1(g); if (currentStep < 1) setCurrentStep(0); }} /> {g}
              </label>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Parent 2 Genotype</p>
            {validGenotypes.map(g => (
              <label key={`p2-${g}`} className="flex items-center gap-2 text-xs">
                <input type="radio" checked={parent2 === g} onChange={() => { setParent2(g); if (currentStep < 1) setCurrentStep(0); }} /> {g}
              </label>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Dominant trait:</label>
            <input type="text" value={dominantTrait} onChange={e => setDominantTrait(e.target.value)} className="w-full px-2 py-1 text-xs rounded border border-border bg-background" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Recessive trait:</label>
            <input type="text" value={recessiveTrait} onChange={e => setRecessiveTrait(e.target.value)} className="w-full px-2 py-1 text-xs rounded border border-border bg-background" />
          </div>
        </div>
      }
      workspace={
        <svg viewBox="0 0 360 280" className="w-full h-56">
          <text x={180} y={20} textAnchor="middle" className="text-[10px] fill-foreground font-bold">
            {parent1} × {parent2}
          </text>

          {/* Punnett Square */}
          <g transform="translate(80,35)">
            {/* Headers */}
            <text x={50} y={-5} textAnchor="middle" className="text-[10px] fill-primary font-bold">{gametes2[0]}</text>
            <text x={130} y={-5} textAnchor="middle" className="text-[10px] fill-primary font-bold">{gametes2[1]}</text>
            <text x={-10} y={45} textAnchor="middle" className="text-[10px] fill-secondary font-bold">{gametes1[0]}</text>
            <text x={-10} y={125} textAnchor="middle" className="text-[10px] fill-secondary font-bold">{gametes1[1]}</text>

            {/* Grid */}
            {[0, 1].map(row => [0, 1].map(col => {
              const idx = row * 2 + col;
              const geno = offspring[idx];
              const isDominant = geno[0] === geno[0].toUpperCase();
              return (
                <g key={`${row}-${col}`}>
                  <rect x={col * 80 + 10} y={row * 80 + 5} width={75} height={75}
                    fill={isDominant ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))"} stroke="hsl(var(--border))" strokeWidth={1.5} rx={6} />
                  <text x={col * 80 + 47} y={row * 80 + 40} textAnchor="middle" className="text-[14px] fill-foreground font-bold">{geno}</text>
                  <text x={col * 80 + 47} y={row * 80 + 58} textAnchor="middle" className="text-[7px] fill-muted-foreground">
                    {isDominant ? dominantTrait : recessiveTrait}
                  </text>
                </g>
              );
            }))}
          </g>

          {/* Results */}
          <text x={180} y={210} textAnchor="middle" className="text-[9px] fill-foreground font-semibold">
            Phenotypic Ratio: {dominantTrait} {dominantCount} : {recessiveTrait} {recessiveCount}
          </text>
          <text x={180} y={225} textAnchor="middle" className="text-[8px] fill-muted-foreground">
            Genotypic: {Object.entries(genotypeCounts).map(([k, v]) => `${k}(${v})`).join(" : ")}
          </text>

          {/* Phenotype visualization */}
          <g transform="translate(80,235)">
            {offspring.map((o, i) => {
              const isDom = o[0] === o[0].toUpperCase();
              return (
                <g key={i}>
                  <rect x={i * 50} y={0} width={40} height={25} fill={isDom ? "hsl(var(--primary) / 0.3)" : "hsl(var(--muted))"} rx={4} stroke="hsl(var(--border))" />
                  <text x={i * 50 + 20} y={16} textAnchor="middle" className="text-[8px] fill-foreground font-semibold">
                    {isDom ? dominantTrait.slice(0, 4) : recessiveTrait.slice(0, 4)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      }
      liveData={
        <div className="space-y-1">
          <DataRow label="Parent 1" value={parent1} />
          <DataRow label="Parent 2" value={parent2} />
          <DataRow label="Dominant" value={`${dominantCount}/4 (${dominantCount * 25}%)`} />
          <DataRow label="Recessive" value={`${recessiveCount}/4 (${recessiveCount * 25}%)`} />
          {Object.entries(genotypeCounts).map(([k, v]) => (
            <DataRow key={k} label={k} value={`${v}/4`} />
          ))}
        </div>
      }
      analysis={<StepByStep steps={steps} currentStep={currentStep} onStepClick={i => setCurrentStep(i)} />}
    />
  );
}
