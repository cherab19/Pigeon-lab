import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Monitor, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onFallback?: () => void;
}

interface State {
  hasError: boolean;
}

export default class SimulationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Simulation error (likely WebGL/3D):", error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] gap-4">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <h3 className="font-display font-bold text-lg">3D Simulation Failed</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your device may not support 3D rendering. Switching to 2D mode...
          </p>
          {this.props.onFallback && (
            <Button size="sm" variant="outline" onClick={this.props.onFallback}>
              <Monitor className="w-4 h-4 mr-1" /> Load 2D Version
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => this.setState({ hasError: false })}>
            <RefreshCw className="w-4 h-4 mr-1" /> Retry 3D
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
