import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Evita pantalla en blanco si falla el render inicial de la app. */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[app] error de render:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white p-6 text-center text-slate-900">
          <h1 className="text-xl font-semibold">No se pudo cargar Haitech</h1>
          <p className="max-w-md text-sm text-slate-600">{this.state.error.message}</p>
          <button
            type="button"
            className="min-h-11 rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
