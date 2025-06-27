import React, { useState } from 'react';
import { Transaction } from '../types';
import TransactionItem from './TransactionItem';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import TransactionDetailsModal from './TransactionDetailsModal';
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
  showFilters = true,
  onRetry,
  title = 'Recent Transactions'
}) => {
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const { accounts } = useAccounts();

  const filteredTransactions = transactions.filter(transaction => {
    // Filter by account
    if (accountFilter !== 'all') {
      if (transaction.from_account !== accountFilter && transaction.to_account !== accountFilter) return false;
    }
    // Filter by direction
    if (currentAccount) {
      if (filter === 'incoming' && transaction.to_account !== currentAccount) return false;
      if (filter === 'outgoing' && transaction.from_account !== currentAccount) return false;
    }
    // Filter by currency
    if (currencyFilter !== 'all' && transaction.currency !== currencyFilter) return false;
    return true;
  });

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    return groups;
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  if (loading) {
    return (
      <div className="card">
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading transactions...</span>
        </div>
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
        <div className="mb-6 space-y-3">
          {/* Account Filter */}
          <div className="flex space-x-2 items-center">
            <label htmlFor="account-filter" className="text-sm font-medium text-gray-700">Account:</label>
            <select
              id="account-filter"
              value={accountFilter}
              onChange={e => setAccountFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-kcb-primary text-sm font-medium focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary"
            >
              <option value="all">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.name} value={acc.name}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* Direction Filter */}
          {currentAccount && (
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'incoming', label: 'Incoming' },
                { key: 'outgoing', label: 'Outgoing' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key as any)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all border
                    ${filter === option.key 
                      ? 'bg-kcb-primary text-white border-kcb-primary shadow'
                      : 'bg-white text-kcb-primary border-kcb-primary hover:bg-kcb-light hover:text-kcb-primary'}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* Currency Filter */}
          <div className="flex space-x-2">
            {['all', 'KES', 'USD', 'NGN'].map(currency => (
              <button
                key={currency}
                onClick={() => setCurrencyFilter(currency)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all border
                  ${currencyFilter === currency 
                    ? 'bg-kcb-primary text-white border-kcb-primary shadow'
                    : 'bg-white text-kcb-primary border-kcb-primary hover:bg-kcb-light hover:text-kcb-primary'}
                `}
              >
                {currency === 'all' ? 'All Currencies' : currency}
              </button>
            ))}
          </div>
        </div>
      )}

      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-2 text-gray-600">No transactions found</p>
          <p className="text-sm text-gray-500">Transactions will appear here once you make transfers</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTransactions)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayTransactions]) => (
              <div key={date}>
                <h3 className="text-base font-bold text-kcb-primary mb-2 px-1">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {dayTransactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      currentAccount={currentAccount}
                      onClick={() => setSelectedTransaction(transaction)}
                      showDetails={true}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};

export default TransactionLog;
