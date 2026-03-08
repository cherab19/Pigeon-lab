import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Simulation3DLayout from "../../3d/Simulation3DLayout";
import { LabRoom } from "../../3d/LabEnvironment";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/* ======================================================================
   LAB 9 — HUMAN TISSUES (HISTOLOGY) 3D
   ====================================================================== */
const tissueInfo: Record<string, { desc: string; cells: string; color: string }> = {
  epithelial: { desc: "Covers body surfaces and lines organs", cells: "Tightly packed, flat/cuboidal", color: "#3b82f6" },
  muscle: { desc: "Striated fibers that contract for movement", cells: "Multinucleated, elongated", color: "#ef4444" },
  nerve: { desc: "Transmits electrical impulses", cells: "Cell body + long axon", color: "#8b5cf6" },
  connective: { desc: "Supports and connects organs", cells: "Widely spaced with matrix", color: "#f59e0b" },
};

function TissueModel3D({ tissue }: { tissue: string }) {
  const info = tissueInfo[tissue];

  if (tissue === "epithelial") {
    return (
      <group>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[(i % 4 - 1.5) * 0.15, Math.floor(i / 4) * 0.08 - 0.1, 0]}>
            <boxGeometry args={[0.12, 0.06, 0.05]} />
            <meshStandardMaterial color={info.color} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    );
  }
  if (tissue === "muscle") {
    return (
      <group>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0, (i - 2.5) * 0.08, 0]} rotation={[0, 0, 0.1 * (i % 2 ? 1 : -1)]}>
            <capsuleGeometry args={[0.02, 0.4, 4, 8]} />
            <meshStandardMaterial color={info.color} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    );
  }
  if (tissue === "nerve") {
    return (
      <group>
        <mesh position={[-0.3, 0, 0]}><sphereGeometry args={[0.08, 12, 8]} /><meshStandardMaterial color={info.color} transparent opacity={0.6} /></mesh>
        <mesh><cylinderGeometry args={[0.015, 0.015, 0.6, 6]} rotation-z={Math.PI / 2} /><meshStandardMaterial color={info.color} transparent opacity={0.4} /></mesh>
        {[0.1, 0.2, 0.3].map((x, i) => (
          <mesh key={i} position={[-0.1 + x, 0.05, 0]}><boxGeometry args={[0.03, 0.06, 0.02]} /><meshStandardMaterial color="#a78bfa" transparent opacity={0.3} /></mesh>
        ))}
      </group>
    );
  }
  // connective
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.3, 0]}>
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshStandardMaterial color={info.color} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Matrix fibers */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`f${i}`} position={[(Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.25, 0]} rotation={[0, 0, Math.random() * Math.PI]}>
          <boxGeometry args={[0.3, 0.005, 0.005]} />
          <meshStandardMaterial color="#fcd34d" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function HumanTissues3D() {
  const [tissue, setTissue] = useState("epithelial");
  const [zoom, setZoom] = useState(10);
  const [step, setStep] = useState(0);

  const reset = () => { setTissue("epithelial"); setZoom(10); setStep(0); };
  const steps = [
    "Open virtual microscope", "Select tissue slide",
    "Adjust focus", "Observe structure",
    "Identify features", "Record observations",
  ];

  return (
    <Simulation3DLayout
      title="Lab 9: Human Tissues (3D)"
      objective="Observe and identify different human tissue types"
      theory="Four tissue types: epithelial, muscle, nerve, connective."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Tissue</p>
            {Object.keys(tissueInfo).map(t => (
              <label key={t} className="flex items-center gap-2 text-xs capitalize">
                <input type="radio" checked={tissue === t} onChange={() => setTissue(t)} className="accent-primary" /> {t}
              </label>
            ))}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Zoom: {zoom}×</p>
            <Slider value={[zoom]} onValueChange={v => setZoom(v[0])} min={10} max={100} step={10} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* FOV circle */}
          <mesh position={[0, 0.1, 0]}>
            <circleGeometry args={[0.7, 32]} />
            <meshBasicMaterial color="#fafafa" />
          </mesh>
          <mesh position={[0, 0.1, 0.01]}>
            <ringGeometry args={[0.65, 0.7, 32]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          {/* Tissue model */}
          <group position={[0, 0.1, 0.02]} scale={zoom / 20}>
            <TissueModel3D tissue={tissue} />
          </group>
          <Text position={[0, -0.7, 0.4]} fontSize={0.06} color="#666" anchorX="center">
            {tissue}: {tissueInfo[tissue].desc}
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-bold capitalize">{tissue}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Desc</span><span className="font-bold text-[10px]">{tissueInfo[tissue].desc}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Cells</span><span className="font-bold text-[10px]">{tissueInfo[tissue].cells}</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 10 — BLOOD CELLS 3D
   ====================================================================== */
export function BloodCells3D() {
  const [cellType, setCellType] = useState("all");
  const [zoom, setZoom] = useState(40);
  const [step, setStep] = useState(0);

  const reset = () => { setCellType("all"); setZoom(40); setStep(0); };
  const steps = [
    "Place blood smear slide", "Adjust focus",
    "Observe blood cells", "Identify RBCs",
    "Identify WBCs", "Identify platelets",
    "Count each type", "Record results",
  ];

  const showRBC = cellType === "all" || cellType === "rbc";
  const showWBC = cellType === "all" || cellType === "wbc";
  const showPlatelets = cellType === "all" || cellType === "platelets";

  return (
    <Simulation3DLayout
      title="Lab 10: Blood Cells (3D)"
      objective="Observe and identify different blood cell types"
      theory="Blood contains RBCs (O₂ transport), WBCs (immunity), and platelets (clotting)."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Highlight</p>
            {[
              { key: "all", label: "All Cells" },
              { key: "rbc", label: "Red Blood Cells" },
              { key: "wbc", label: "White Blood Cells" },
              { key: "platelets", label: "Platelets" },
            ].map(t => (
              <label key={t.key} className="flex items-center gap-2 text-xs">
                <input type="radio" checked={cellType === t.key} onChange={() => setCellType(t.key)} className="accent-primary" /> {t.label}
              </label>
            ))}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Zoom: {zoom}×</p>
            <Slider value={[zoom]} onValueChange={v => setZoom(v[0])} min={10} max={100} step={10} />
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Blood smear background */}
          <mesh position={[0, 0.1, 0]}>
            <circleGeometry args={[0.7, 32]} />
            <meshBasicMaterial color="#fef2f2" />
          </mesh>
          <group position={[0, 0.1, 0.01]} scale={zoom / 50}>
            {/* RBCs */}
            {showRBC && Array.from({ length: 15 }).map((_, i) => {
              const x = ((i * 29) % 140 - 70) / 100;
              const y = ((i * 23) % 130 - 65) / 100;
              return (
                <mesh key={`rbc${i}`} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.05, 0.02, 6, 12]} />
                  <meshStandardMaterial color="#ef4444" transparent opacity={0.6} />
                </mesh>
              );
            })}
            {/* WBCs */}
            {showWBC && [[-0.2, 0], [0.3, 0.15], [-0.15, -0.25]].map(([x, y], i) => (
              <group key={`wbc${i}`} position={[x, y, 0.02]}>
                <mesh><sphereGeometry args={[0.07, 12, 8]} /><meshStandardMaterial color="#a855f7" transparent opacity={0.4} /></mesh>
                <mesh><sphereGeometry args={[0.03, 8, 6]} /><meshStandardMaterial color="#6d28d9" transparent opacity={0.5} /></mesh>
              </group>
            ))}
            {/* Platelets */}
            {showPlatelets && Array.from({ length: 8 }).map((_, i) => {
              const x = ((i * 31) % 120 - 60) / 100;
              const y = ((i * 19) % 110 - 55) / 100;
              return <mesh key={`plt${i}`} position={[x, y, 0.01]}><sphereGeometry args={[0.015, 6, 4]} /><meshStandardMaterial color="#eab308" /></mesh>;
            })}
          </group>
          <Text position={[0, -0.7, 0.4]} fontSize={0.06} color="#666" anchorX="center">
            Blood Smear — {zoom}× magnification
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Viewing</span><span className="font-bold">{cellType === "all" ? "All" : cellType.toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">RBC</span><span className="font-bold">~15</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">WBC</span><span className="font-bold">~3</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Platelets</span><span className="font-bold">~8</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 11 — MONOHYBRID CROSS 3D
   ====================================================================== */
export function MonohybridCross3D() {
  const [p1a1, setP1a1] = useState("A");
  const [p1a2, setP1a2] = useState("a");
  const [p2a1, setP2a1] = useState("A");
  const [p2a2, setP2a2] = useState("a");
  const [step, setStep] = useState(0);

  const offspring = [`${p1a1}${p2a1}`, `${p1a1}${p2a2}`, `${p1a2}${p2a1}`, `${p1a2}${p2a2}`];
  const dominant = offspring.filter(o => o.includes("A")).length;
  const reset = () => { setP1a1("A"); setP1a2("a"); setP2a1("A"); setP2a2("a"); setStep(0); };

  const steps = [
    "Select parent traits", "Enter genotypes",
    "Generate Punnett square", "Observe offspring genotypes",
    "Calculate phenotypic ratio", "Record results", "Repeat",
  ];

  return (
    <Simulation3DLayout
      title="Lab 11: Monohybrid Cross (3D)"
      objective="Predict offspring genotypic and phenotypic ratios"
      theory="Heterozygous cross Aa × Aa → 1AA : 2Aa : 1aa (3:1 phenotypic ratio)."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Parent 1: {p1a1}{p1a2}</p>
            <div className="flex gap-2 mt-1">
              {["A", "a"].map(a => <Button key={`p1a1${a}`} size="sm" variant={p1a1 === a ? "default" : "outline"} className="text-xs flex-1" onClick={() => setP1a1(a)}>{a}</Button>)}
            </div>
            <div className="flex gap-2 mt-1">
              {["A", "a"].map(a => <Button key={`p1a2${a}`} size="sm" variant={p1a2 === a ? "default" : "outline"} className="text-xs flex-1" onClick={() => setP1a2(a)}>{a}</Button>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Parent 2: {p2a1}{p2a2}</p>
            <div className="flex gap-2 mt-1">
              {["A", "a"].map(a => <Button key={`p2a1${a}`} size="sm" variant={p2a1 === a ? "default" : "outline"} className="text-xs flex-1" onClick={() => setP2a1(a)}>{a}</Button>)}
            </div>
            <div className="flex gap-2 mt-1">
              {["A", "a"].map(a => <Button key={`p2a2${a}`} size="sm" variant={p2a2 === a ? "default" : "outline"} className="text-xs flex-1" onClick={() => setP2a2(a)}>{a}</Button>)}
            </div>
          </div>
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          <Text position={[0, 1, 0]} fontSize={0.09} color="#333" anchorX="center" fontWeight="bold">
            {p1a1}{p1a2} × {p2a1}{p2a2}
          </Text>
          {/* Punnett square as 3D boxes */}
          {/* Headers */}
          <mesh position={[-0.25, 0.55, 0]}><boxGeometry args={[0.4, 0.3, 0.05]} /><meshStandardMaterial color="#e5e7eb" /></mesh>
          <Text position={[-0.25, 0.55, 0.03]} fontSize={0.1} color="#6366f1" anchorX="center" fontWeight="bold">{p2a1}</Text>
          <mesh position={[0.25, 0.55, 0]}><boxGeometry args={[0.4, 0.3, 0.05]} /><meshStandardMaterial color="#e5e7eb" /></mesh>
          <Text position={[0.25, 0.55, 0.03]} fontSize={0.1} color="#6366f1" anchorX="center" fontWeight="bold">{p2a2}</Text>
          <mesh position={[-0.7, 0.2, 0]}><boxGeometry args={[0.3, 0.3, 0.05]} /><meshStandardMaterial color="#e5e7eb" /></mesh>
          <Text position={[-0.7, 0.2, 0.03]} fontSize={0.1} color="#ec4899" anchorX="center" fontWeight="bold">{p1a1}</Text>
          <mesh position={[-0.7, -0.15, 0]}><boxGeometry args={[0.3, 0.3, 0.05]} /><meshStandardMaterial color="#e5e7eb" /></mesh>
          <Text position={[-0.7, -0.15, 0.03]} fontSize={0.1} color="#ec4899" anchorX="center" fontWeight="bold">{p1a2}</Text>
          {/* Offspring cells */}
          {offspring.map((o, i) => {
            const x = (i % 2 - 0.5) * 0.5;
            const y = Math.floor(i / 2) === 0 ? 0.2 : -0.15;
            const isDom = o.includes("A");
            return (
              <group key={i}>
                <mesh position={[x, y, 0]} castShadow>
                  <boxGeometry args={[0.4, 0.3, 0.08]} />
                  <meshStandardMaterial color={isDom ? "#6366f1" : "#e5e7eb"} transparent opacity={isDom ? 0.3 : 0.5} />
                </mesh>
                <Text position={[x, y, 0.05]} fontSize={0.12} color={isDom ? "#4338ca" : "#666"} anchorX="center" fontWeight="bold">{o}</Text>
              </group>
            );
          })}
          <Text position={[0, -0.55, 0.3]} fontSize={0.07} color="#333" anchorX="center">
            Ratio: {dominant}:{4 - dominant} (Dom:Rec)
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Offspring</span><span className="font-bold">{offspring.join(", ")}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Dominant</span><span className="font-bold">{dominant}/4</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Recessive</span><span className="font-bold">{4 - dominant}/4</span></div>
        </div>
      }
    />
  );
}

/* ======================================================================
   LAB 12 — QUADRAT SAMPLING 3D
   ====================================================================== */
export function QuadratSampling3D() {
  const [quadratX, setQuadratX] = useState(2);
  const [quadratY, setQuadratY] = useState(2);
  const [samples, setSamples] = useState<number[]>([]);
  const [step, setStep] = useState(0);

  // Deterministic plants
  const plants = useRef<{ x: number; z: number }[]>([]);
  if (plants.current.length === 0) {
    for (let i = 0; i < 60; i++) {
      plants.current.push({
        x: ((i * 73 + 17) % 280 - 140) / 100,
        z: ((i * 47 + 31) % 180 - 90) / 100,
      });
    }
  }

  const qx = (quadratX - 2) * 0.5;
  const qz = (quadratY - 2) * 0.4;
  const qSize = 0.4;
  const plantsInQuadrat = plants.current.filter(p =>
    p.x >= qx - qSize / 2 && p.x <= qx + qSize / 2 && p.z >= qz - qSize / 2 && p.z <= qz + qSize / 2
  ).length;

  const takeSample = () => {
    setSamples(prev => [...prev, plantsInQuadrat]);
    setQuadratX(Math.floor(Math.random() * 5));
    setQuadratY(Math.floor(Math.random() * 5));
  };

  const avgDensity = samples.length > 0 ? (samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(1) : "—";
  const reset = () => { setQuadratX(2); setQuadratY(2); setSamples([]); setStep(0); };

  const steps = [
    "Open virtual field", "Select quadrat tool",
    "Place quadrat randomly", "Count organisms",
    "Record number", "Move quadrat",
    "Repeat sampling", "Calculate average density",
  ];

  return (
    <Simulation3DLayout
      title="Lab 12: Quadrat Sampling (3D)"
      objective="Estimate population density using quadrat sampling"
      theory="Population density = total count / (number of quadrats × quadrat area)."
      onReset={reset} steps={steps} currentStep={step} onStepClick={setStep}
      controls={
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Quadrat X: {quadratX}</p>
            <Slider value={[quadratX]} onValueChange={v => setQuadratX(v[0])} min={0} max={4} step={1} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Quadrat Y: {quadratY}</p>
            <Slider value={[quadratY]} onValueChange={v => setQuadratY(v[0])} min={0} max={4} step={1} />
          </div>
          <Button size="sm" className="w-full text-xs" onClick={takeSample}>📋 Record & Move</Button>
          {samples.length > 0 && (
            <div className="space-y-1">
              {samples.map((s, i) => (
                <div key={i} className="text-[10px] flex justify-between p-1 bg-muted rounded">
                  <span>S{i + 1}</span><span className="font-bold">{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      }
      canvas3D={
        <>
          <LabRoom />
          {/* Ground */}
          <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[3, 2]} />
            <meshStandardMaterial color="#7cc47c" transparent opacity={0.3} />
          </mesh>
          {/* Plants */}
          {plants.current.map((p, i) => (
            <group key={i} position={[p.x, -0.45, p.z]}>
              <mesh><cylinderGeometry args={[0.003, 0.005, 0.04, 4]} /><meshStandardMaterial color="#22c55e" /></mesh>
              <mesh position={[0, 0.03, 0]}><sphereGeometry args={[0.015, 6, 4]} /><meshStandardMaterial color="#4ade80" /></mesh>
            </group>
          ))}
          {/* Quadrat frame */}
          <group position={[qx, -0.44, qz]}>
            <mesh><boxGeometry args={[qSize, 0.01, qSize]} /><meshStandardMaterial color="#6366f1" transparent opacity={0.15} /></mesh>
            <mesh><boxGeometry args={[qSize, 0.01, qSize]} /><meshStandardMaterial color="#6366f1" wireframe /></mesh>
            <Text position={[0, 0.1, 0]} fontSize={0.06} color="#6366f1" anchorX="center" fontWeight="bold">
              {plantsInQuadrat} plants
            </Text>
          </group>
          <Text position={[0, 0.8, 0]} fontSize={0.06} color="#333" anchorX="center">
            Avg: {avgDensity} — Samples: {samples.length}
          </Text>
        </>
      }
      liveData={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Current</span><span className="font-bold">{plantsInQuadrat}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Samples</span><span className="font-bold">{samples.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Avg</span><span className="font-bold">{avgDensity}/quadrat</span></div>
        </div>
      }
    />
  );
}
