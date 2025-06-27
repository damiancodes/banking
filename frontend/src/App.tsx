import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TransferPage from './pages/TransferPage';
import TransactionHistory from './pages/TransactionHistory';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer, { useToasts } from './components/ToastContainer';
import NetworkErrorHandler from './components/NetworkErrorHandler';
import { useTransactions } from './hooks/useTransactions';

type Page = 'dashboard' | 'transfer' | 'transactions' | 'history';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { transactions, loading, error, refreshTransactions } = useTransactions();
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToasts();

  const handleNavigate = (page: string) => {
    if (page === 'dashboard' || page === 'transfer' || page === 'transactions' || page === 'history') {
      setCurrentPage(page as Page);
    }
  };

  const handleRetry = () => {
    refreshTransactions();
    showInfo('Retrying...', 'Attempting to reconnect to the server');
  };

  const showInfo = (title: string, message?: string) => {
    showSuccess(title, message, 3000);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transfer':
        return <TransferPage onNavigate={handleNavigate} />;
      case 'transactions':
        return (
          <NetworkErrorHandler
            error={error}
            loading={loading}
            onRetry={handleRetry}
          >
            <TransactionHistory
              transactions={transactions}
              loading={loading}
              error={error}
              refreshTransactions={refreshTransactions}
            />
          </NetworkErrorHandler>
        );
      case 'history':
        return (
          <NetworkErrorHandler
            error={error}
            loading={loading}
            onRetry={handleRetry}
          >
            <TransactionHistory
              transactions={transactions}
              loading={loading}
              error={error}
              refreshTransactions={refreshTransactions}
            />
          </NetworkErrorHandler>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Layout
          currentPage={currentPage}
          onNavigate={handleNavigate}
        >
          {renderContent()}
        </Layout>
        
        {/* Toast Notifications */}
        <ToastContainer 
          toasts={toasts} 
          onRemoveToast={removeToast} 
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
