import { useState, Suspense, ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RotateCcw, Volume2, VolumeX } from "lucide-react";
import StepByStep from "../StepByStep";

interface Simulation3DLayoutProps {
  title: string;
  objective: string;
  theory?: string;
  onReset?: () => void;
  controls: ReactNode;
  canvas3D: ReactNode;
  liveData: ReactNode;
  graphPanel?: ReactNode;
  steps?: string[];
  currentStep?: number;
  onStepClick?: (step: number) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export default function Simulation3DLayout({
  title, objective, theory, onReset,
  controls, canvas3D, liveData, graphPanel,
  steps, currentStep = 0, onStepClick,
  soundEnabled = true, onToggleSound,
}: Simulation3DLayoutProps) {
  const [showTheory, setShowTheory] = useState(false);

  return (
    <div className="flex flex-col h-full min-h-[700px]">
      {/* Header */}
      <div className="border-b border-border p-3 bg-card shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display font-bold text-lg truncate">{title}</h2>
            <p className="text-xs text-muted-foreground truncate">{objective}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onToggleSound && (
              <Button variant="ghost" size="sm" onClick={onToggleSound}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            )}
            {theory && (
              <Button variant="ghost" size="sm" onClick={() => setShowTheory(!showTheory)}>
                Theory {showTheory ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
              </Button>
            )}
            {onReset && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Button>
            )}
          </div>
        </div>
        {showTheory && theory && (
          <div className="mt-2 p-3 bg-muted rounded-lg text-sm text-muted-foreground">{theory}</div>
        )}
      </div>

      {/* Main 3-panel layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] min-h-0">
        {/* Left: Controls + Steps */}
        <div className="border-b lg:border-b-0 lg:border-r border-border p-3 overflow-y-auto bg-muted/20">
          <h3 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider">🧰 Controls</h3>
          {controls}
          {steps && (
            <div className="mt-4">
              <h3 className="font-semibold text-xs mb-2 text-muted-foreground uppercase tracking-wider">📋 Procedure</h3>
              <StepByStep steps={steps} currentStep={currentStep} onStepClick={onStepClick} />
            </div>
          )}
        </div>

        {/* Center: 3D Canvas */}
        <div className="relative min-h-[400px] bg-gradient-to-b from-muted/30 to-background">
          <div className="absolute top-2 left-2 z-10 bg-card/80 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] text-muted-foreground border border-border">
            🖱️ Drag to rotate · Scroll to zoom · Right-click to pan
          </div>
          <Canvas
            shadows
            camera={{ position: [3, 2, 4], fov: 50 }}
            style={{ width: "100%", height: "100%" }}
          >
            <Suspense fallback={
              <Html center>
                <div className="text-sm text-muted-foreground animate-pulse">Loading 3D environment...</div>
              </Html>
            }>
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[5, 8, 3]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[1024, 1024]}
              />
              <pointLight position={[-3, 3, -2]} intensity={0.3} color="#aaccff" />
              {canvas3D}
              <ContactShadows
                position={[0, -1.49, 0]}
                opacity={0.4}
                scale={10}
                blur={2}
                far={4}
              />
              <OrbitControls
                enablePan
                enableZoom
                enableRotate
                minDistance={2}
                maxDistance={10}
                maxPolarAngle={Math.PI / 2}
              />
              <Environment preset="studio" />
            </Suspense>
          </Canvas>
        </div>

        {/* Right: Live Data */}
        <div className="border-t lg:border-t-0 lg:border-l border-border p-3 overflow-y-auto bg-muted/20">
          <h3 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider">📊 Live Data</h3>
          {liveData}
        </div>
      </div>

      {/* Bottom: Graph Panel */}
      {graphPanel && (
        <div className="border-t border-border p-3 bg-card shrink-0">
          <h3 className="font-semibold text-xs mb-2 text-muted-foreground uppercase tracking-wider">📈 Analysis</h3>
          {graphPanel}
        </div>
      )}
    </div>
  );
}
