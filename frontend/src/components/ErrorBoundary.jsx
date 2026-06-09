import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
          <div className="max-w-2xl w-full p-8 glass-panel rounded-3xl space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Something went wrong.</h1>
            <p className="text-slate-500 dark:text-slate-400">
              An unexpected error caused the application to crash.
            </p>
            
            {this.state.error && (
              <div className="text-left bg-slate-100 dark:bg-slate-900 rounded-xl p-4 mt-4 overflow-auto border border-rose-500/30">
                <p className="text-sm font-bold text-rose-500 mb-2">Error Details:</p>
                <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack ? "\n\nComponent Stack:\n" + this.state.errorInfo.componentStack : ""}
                </pre>
              </div>
            )}

            <div className="pt-6 flex items-center justify-center gap-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Reload Page
              </button>
              <button 
                onClick={() => { window.location.href = '/dashboard'; }} 
                className="px-6 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center gap-2 transition-colors"
              >
                <Home className="h-4 w-4" /> Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
