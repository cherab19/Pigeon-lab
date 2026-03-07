import { CheckCircle, Circle } from "lucide-react";

interface StepByStepProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function StepByStep({ steps, currentStep, onStepClick }: StepByStepProps) {
  return (
    <div className="space-y-1">
      <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Procedure</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <button
              key={i}
              onClick={() => onStepClick?.(i)}
              className={`flex items-start gap-2 text-left text-xs p-2 rounded-lg transition-all ${
                active ? "bg-primary/10 text-primary font-semibold" :
                done ? "text-muted-foreground line-through opacity-60" :
                "text-muted-foreground hover:bg-muted"
              }`}
            >
              {done ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" /> : <Circle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${active ? "text-primary" : ""}`} />}
              <span>Step {i + 1}: {step}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
