import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

/** Aísla widgets del shell: un fallo no debe activar el errorElement de la ruta. */
export class SoftWidgetBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(
      `[app] widget opcional falló${this.props.name ? ` (${this.props.name})` : ''}:`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
