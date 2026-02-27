import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-canvas p-6">
          <div className="fw-card w-full max-w-md p-8 text-center" role="alert">
            <div className="fw-icon-tile fw-icon-tile-lg mx-auto text-danger">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-xl font-semibold tracking-tight text-ink">Something went wrong</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {this.state.error?.message ||
                'An unexpected error occurred while rendering the application.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="fw-btn fw-btn-primary fw-btn-block mt-6"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
