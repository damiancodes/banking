import React, { useState } from 'react';
import { Account } from '../types';
import AccountCard from './AccountCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface AccountListProps {
  accounts: Account[];
  loading?: boolean;
  error?: string | null;
  onAccountSelect?: (account: Account) => void;
  selectedAccount?: Account | null;
  filterByCurrency?: string;
  showDetails?: boolean;
  onRetry?: () => void;
}

const AccountList: React.FC<AccountListProps> = ({
  accounts,
  loading = false,
  error = null,
  onAccountSelect,
  selectedAccount,
  filterByCurrency,
  showDetails = false,
  onRetry
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCurrency = !filterByCurrency || account.currency === filterByCurrency;
    return matchesSearch && matchesCurrency;
  });

  const groupedAccounts = filteredAccounts.reduce((groups, account) => {
    const currency = account.currency;
    if (!groups[currency]) {
      groups[currency] = [];
    }
    groups[currency].push(account);
    return groups;
  }, {} as Record<string, Account[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={onRetry}
        className="mx-4"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="px-4 mb-1 mt-2">
        <div className="relative w-full max-w-xs mx-auto mb-1">
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/95 text-base border border-gray-200 focus:border-kcb-primary focus:ring-2 focus:ring-kcb-primary focus:shadow-lg focus:shadow-kcb-primary/20 shadow-sm transition placeholder-gray-400 outline-none"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Account Groups */}
      {Object.entries(groupedAccounts).map(([currency, currencyAccounts], idx) => (
        <section key={currency} className={`px-4 mb-2${idx === 0 ? ' mt-2' : ''}`}>
          <div className="flex items-center justify-between mb-1 mt-3">
            <h3 className="text-lg font-bold text-kcb-primary tracking-wide flex items-center gap-2">
              {currency} <span className="text-xs font-semibold text-gray-400 uppercase">Accounts</span>
            </h3>
            <span className="text-xs text-gray-500">{currencyAccounts.length} accounts</span>
          </div>
          <div className="border-b border-gray-200 mb-2" />
          <div className="space-y-1">
            {currencyAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                isSelected={selectedAccount?.id === account.id}
                onClick={() => onAccountSelect?.(account)}
                showDetails={showDetails}
              />
            ))}
          </div>
        </section>
      ))}

      {filteredAccounts.length === 0 && !loading && (
        <div className="text-center py-8 px-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mt-2 text-gray-600">No accounts found</p>
          {searchTerm && (
            <p className="text-sm text-gray-500">Try adjusting your search term</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountList;
