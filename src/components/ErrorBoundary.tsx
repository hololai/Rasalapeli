import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-2xl bg-stone-800 p-8 rounded-2xl border border-red-500/30">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Hups! Ohjelma kaatui.</h1>
            <p className="text-stone-300 mb-6">
              Jokin meni vikaan sivun latauksessa. Alla on tarkempi virheilmoitus kehittäjälle:
            </p>
            <div className="bg-black/50 p-4 rounded-lg text-left overflow-auto mb-6">
              <code className="text-red-300 text-sm">{this.state.error?.toString()}</code>
            </div>
            <button
              className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-bold"
              onClick={() => window.location.href = '/'}
            >
              Palaa Etusivulle
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
