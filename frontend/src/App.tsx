import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TransferPage from './pages/TransferPage';
import TransactionHistory from './pages/TransactionHistory';
import { useTransactions } from './hooks/useTransactions';

type Page = 'dashboard' | 'transfer' | 'transactions' | 'history';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { transactions, loading, error, refreshTransactions } = useTransactions();

  const handleNavigate = (page: string) => {
    if (page === 'dashboard' || page === 'transfer' || page === 'transactions' || page === 'history') {
      setCurrentPage(page as Page);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transfer':
        return <TransferPage onNavigate={handleNavigate} />;
      case 'transactions':
        return (
          <TransactionHistory
            transactions={transactions}
            loading={loading}
            error={error}
            refreshTransactions={refreshTransactions}
          />
        );
      case 'history':
        return (
          <TransactionHistory
            transactions={transactions}
            loading={loading}
            error={error}
            refreshTransactions={refreshTransactions}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
