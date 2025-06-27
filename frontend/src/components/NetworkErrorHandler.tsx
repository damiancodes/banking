import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface NetworkErrorHandlerProps {
  error: string | null;
  loading: boolean;
  onRetry: () => void;
  children: React.ReactNode;
  retryCount?: number;
  maxRetries?: number;
}

const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({
  error,
  loading,
  onRetry,
  children,
  retryCount = 0,
  maxRetries = 3
}) => {
  const isNetworkError = error?.includes('fetch') || 
                        error?.includes('network') || 
                        error?.includes('Failed to fetch') ||
                        error?.includes('NetworkError');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner 
          size="lg" 
          text="Loading..." 
          variant="dots"
        />
      </div>
    );
  }

  if (error && isNetworkError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Connection Error</h3>
            <p className="text-sm text-red-600">Unable to connect to the server</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-red-700">
            Please check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.
          </p>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onRetry}
              disabled={retryCount >= maxRetries}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {retryCount >= maxRetries ? 'Max Retries Reached' : `Retry (${retryCount}/${maxRetries})`}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 hover:text-red-700 text-sm font-medium underline"
            >
              Refresh Page
            </button>
          </div>

          {retryCount >= maxRetries && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Maximum retry attempts reached. Please try refreshing the page or contact support.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error Occurred</h3>
            <p className="text-sm text-red-600">Something went wrong</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-red-700">{error}</p>
          
          <button
            onClick={onRetry}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default NetworkErrorHandler; 