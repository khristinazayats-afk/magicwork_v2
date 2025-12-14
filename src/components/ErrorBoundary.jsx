import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="full-viewport w-full flex flex-col items-center justify-center bg-[#fcf8f2] px-8">
          <h2 className="font-hanken text-[#172223] text-xl font-semibold mb-4">Something went wrong</h2>
          <p className="font-hanken text-[#172223]/60 text-sm mb-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;










