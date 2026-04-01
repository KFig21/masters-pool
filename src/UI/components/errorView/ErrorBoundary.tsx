import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorView } from './ErrorView';
import './styles.scss';
import { BackgroundSlider } from '../backgroundSlider/BackgroundSlider';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="app-container">
          <BackgroundSlider />
          <div className="content-wrap">
            <ErrorView />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
