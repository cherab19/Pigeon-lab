import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface SimulationLayoutProps {
  title: string;
  objective: string;
  theory?: string;
  onReset?: () => void;
  equipment: React.ReactNode;
  workspace: React.ReactNode;
  liveData: React.ReactNode;
  analysis?: React.ReactNode;
}

export default function SimulationLayout({ title, objective, theory, onReset, equipment, workspace, liveData, analysis }: SimulationLayoutProps) {
  const [showTheory, setShowTheory] = useState(false);

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Zone 1: Header */}
      <div className="border-b border-border p-3 bg-card shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display font-bold text-lg truncate">{title}</h2>
            <p className="text-xs text-muted-foreground truncate">{objective}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
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

      {/* Zones 2-4: Main */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[200px_1fr_200px] min-h-0">
        <div className="border-b md:border-b-0 md:border-r border-border p-3 overflow-y-auto bg-muted/20">
          <h3 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider">Controls</h3>
          {equipment}
        </div>
        <div className="p-4 overflow-auto flex items-center justify-center">
          {workspace}
        </div>
        <div className="border-t md:border-t-0 md:border-l border-border p-3 overflow-y-auto bg-muted/20">
          <h3 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider">Live Data</h3>
          {liveData}
        </div>
      </div>

      {/* Zone 5: Analysis */}
      {analysis && (
        <div className="border-t border-border p-3 bg-card shrink-0">
          <h3 className="font-semibold text-xs mb-2 text-muted-foreground uppercase tracking-wider">Analysis</h3>
          {analysis}
        </div>
      )}
    </div>
  );
}

// Reusable helpers
export function ControlGroup({ label, value, onChange, min, max, step = 1, unit }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">{value}{unit && <span className="text-muted-foreground ml-0.5">{unit}</span>}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  );
}

export function DataRow({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex justify-between text-xs py-1.5 border-b border-border/50">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold">{String(value)}{unit && <span className="text-muted-foreground ml-0.5">{unit}</span>}</span>
    </div>
  );
}
