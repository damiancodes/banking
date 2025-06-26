import React from 'react';
import Header from '../components/Header';
import TransactionLog from '../components/TransactionLog';
import { Transaction } from '../types';
import { useAccounts } from '../hooks/useAccounts';

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refreshTransactions: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  loading,
  error,
  refreshTransactions
}) => {
  const { getTotalBalance } = useAccounts();

  return (
    <>
      <Header totalBalance={getTotalBalance()} userName="Treasury Manager" onRefresh={refreshTransactions} isRefreshing={loading} />
      <div className="pt-6">
        <TransactionLog
          transactions={transactions}
          loading={loading}
          error={error}
          onRetry={refreshTransactions}
          showFilters={true}
          title="Transaction History"
        />
      </div>
    </>
  );
};

export default TransactionHistory;
