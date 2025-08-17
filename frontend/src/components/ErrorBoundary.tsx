import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary] Caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-red-200 p-6 max-w-lg w-full">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-xl font-semibold text-red-900">Application Error</h1>
            </div>
            
            <p className="text-red-700 mb-4">
              Something went wrong while loading the dashboard. This might be a connection issue with the backend.
            </p>
            
            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Reload Page
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h3 className="text-sm font-medium text-blue-900 mb-1">Troubleshooting Tips:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check if the backend is running on port 8000</li>
                <li>• Verify your Kumo API key is configured</li>
                <li>• Check the browser console for additional errors</li>
                <li>• Ensure you're connected to the internet</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 