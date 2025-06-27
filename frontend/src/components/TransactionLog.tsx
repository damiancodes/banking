import React, { useState } from 'react';
import { Transaction } from '../types';
import TransactionItem from './TransactionItem';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import TransactionDetailsModal from './TransactionDetailsModal';
import TransactionSkeleton from './TransactionSkeleton';
import { useAccounts } from '../hooks/useAccounts';

interface TransactionLogProps {
  transactions: Transaction[];
  loading?: boolean;
  error?: string | null;
  onTransactionClick?: (transaction: Transaction) => void;
  currentAccount?: string;
  showFilters?: boolean;
  onRetry?: () => void;
  title?: string;
}

const TransactionLog: React.FC<TransactionLogProps> = ({
  transactions,
  loading = false,
  error = null,
  onTransactionClick,
  currentAccount,
  showFilters = false,
  onRetry,
  title = 'Recent Transactions'
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [accountFilter, setAccountFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const { accounts } = useAccounts();

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    if (onTransactionClick) {
      onTransactionClick(transaction);
    }
  };

  const closeModal = () => {
    setSelectedTransaction(null);
  };

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter(transaction => {
    // Account filter
    if (accountFilter !== 'all') {
      if (accountFilter === 'incoming') {
        if (!currentAccount || transaction.to_account !== currentAccount) return false;
      } else if (accountFilter === 'outgoing') {
        if (!currentAccount || transaction.from_account !== currentAccount) return false;
      } else {
        if (transaction.from_account !== accountFilter && transaction.to_account !== accountFilter) return false;
      }
    }

    // Direction filter
    if (directionFilter !== 'all') {
      if (directionFilter === 'incoming') {
        if (!currentAccount || transaction.to_account !== currentAccount) return false;
      } else if (directionFilter === 'outgoing') {
        if (!currentAccount || transaction.from_account !== currentAccount) return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </div>
        <TransactionSkeleton count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">{filteredTransactions.length} transactions</span>
      </div>

      {showFilters && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-3">
          {/* Account Filter */}
          <div className="flex space-x-2 items-center flex-1 min-w-0">
            <label htmlFor="account-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">Account:</label>
            <select
              id="account-filter"
              value={accountFilter}
              onChange={e => setAccountFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-kcb-primary text-sm font-medium focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary w-full"
            >
              <option value="all">All Accounts</option>
              <option value="incoming">Incoming Only</option>
              <option value="outgoing">Outgoing Only</option>
              {accounts.map(acc => (
                <option key={acc.name} value={acc.name}>{acc.name}</option>
              ))}
            </select>
          </div>
          {/* Direction Filter */}
          <div className="flex space-x-2 items-center flex-1 min-w-0 mt-2 sm:mt-0">
            <label htmlFor="direction-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">Direction:</label>
            <select
              id="direction-filter"
              value={directionFilter}
              onChange={e => setDirectionFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-kcb-primary text-sm font-medium focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary w-full"
            >
              <option value="all">All</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
            </select>
          </div>
        </div>
      )}

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-500">
            {showFilters ? 'Try adjusting your filters or make your first transfer.' : 'Make your first transfer to see transactions here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              currentAccount={currentAccount}
              onClick={() => handleTransactionClick(transaction)}
              showDetails={true}
            />
          ))}
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default TransactionLog;
