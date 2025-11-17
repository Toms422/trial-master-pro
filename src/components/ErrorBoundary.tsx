import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'app' | 'page';
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    this.setState(prevState => ({
      ...prevState,
      errorInfo,
    }));

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToSentry(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const { level = 'page', pageName } = this.props;

      return (
        <div className={`flex items-center justify-center ${level === 'app' ? 'min-h-screen' : 'min-h-[400px]'} bg-gradient-to-br from-red-50 to-orange-50 p-4`}>
          <div className="max-w-md w-full space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {level === 'app' ? 'משהו השתבש' : `שגיאה ב${pageName || 'עמוד זה'}`}
              </h1>
              <p className="text-slate-600 text-sm">
                {level === 'app'
                  ? 'אנחנו סוררים בעיה בעת טעינת האפליקציה. אנא נסה שוב.'
                  : 'אנחנו סוררים בעיה בעת טעינת עמוד זה. אנא נסה שוב.'}
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="bg-white border border-red-200 rounded-lg p-4 space-y-2 max-h-48 overflow-auto">
                <p className="font-mono text-xs text-red-600 font-semibold">
                  {error.toString()}
                </p>
                {errorInfo && (
                  <details className="text-xs text-slate-600">
                    <summary className="cursor-pointer font-semibold mb-2">
                      Stack Trace
                    </summary>
                    <pre className="whitespace-pre-wrap break-words font-mono bg-slate-50 p-2 rounded">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={this.handleReset}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                נסה שוב
              </Button>
              {level === 'page' && (
                <Button
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="w-4 h-4 ml-2" />
                  חזור לעמוד הבית
                </Button>
              )}
            </div>

            {/* Support Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                אם הבעיה ממשיכה, אנא פנה למנהל המערכת עם פרטי השגיאה שלהלן.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
