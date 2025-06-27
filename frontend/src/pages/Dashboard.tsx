import React, { useState } from 'react';
import { Account, Transaction } from '../types';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import Header from '../components/Header';
import BalanceCard from '../components/BalanceCard';
import AccountList from '../components/AccountList';
import TransactionLog from '../components/TransactionLog';
import TransferForm from '../components/TransferForm';
import QuickActions from '../components/QuickActions';
import TransactionChart from '../components/TransactionChart';
import { useToasts } from '../components/ToastContainer';

type ViewMode = 'overview' | 'accounts' | 'transfer' | 'history';

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const { showSuccess, showError } = useToasts();

  const {
    accounts,
    summary,
    loading: accountsLoading,
    error: accountsError,
    getAccountsByurrency,
    getTotalBalance,
    refreshAccounts
  } = useAccounts();

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    creating: transferLoading,
    createTransaction,
    getRecentTransactions,
    refreshTransactions
  } = useTransactions();

  const handleRefresh = async () => {
    try {
      await Promise.all([refreshAccounts(), refreshTransactions()]);
      showSuccess('Refreshed', 'Data updated successfully');
    } catch (error) {
      showError('Refresh Failed', 'Unable to update data');
    }
  };

  const handleTransfer = async (transferData: any) => {
    try {
      const result = await createTransaction(transferData);
      if (result) {
        // Check if it's a future transfer
        const isFutureTransfer = transferData.note?.includes('transfer_date:') && 
          new Date(transferData.note.split('transfer_date:')[1]) > new Date();
        
        if (isFutureTransfer) {
          showSuccess(
            'Transfer Scheduled!', 
            'Your transfer has been scheduled for the selected date.'
          );
        } else {
          showSuccess(
            'Transfer Completed!', 
            `Transfer of ${result.formatted_amount} completed successfully!`
          );
        }
        
        setCurrentView('overview');
        refreshAccounts(); // Refresh to get updated balances
      }
    } catch (error) {
      showError('Transfer Failed', 'There was an error processing your transfer');
    }
  };

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    setCurrentView('transfer');
  };

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    setCurrentView('accounts');
  };

  const handleTransactionClick = (transaction: Transaction) => {
    // Could navigate to transaction details or show modal
    console.log('Transaction clicked:', transaction);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'accounts':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <button
                onClick={() => setCurrentView('overview')}
                className="flex items-center text-kcb-primary hover:text-kcb-secondary transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Overview
              </button>
              <h1 className="text-lg font-semibold">
                {selectedCurrency ? `${selectedCurrency} Accounts` : 'All Accounts'}
              </h1>
            </div>
            <AccountList
              accounts={selectedCurrency ? getAccountsByurrency(selectedCurrency) : accounts}
              loading={accountsLoading}
              error={accountsError}
              onAccountSelect={handleAccountSelect}
              showDetails={true}
              onRetry={refreshAccounts}
            />
          </div>
        );

      case 'transfer':
        return (
          <div className="space-y-6">
            <div className="flex items-center px-4">
              <button
                onClick={() => setCurrentView('overview')}
                className="flex items-center text-kcb-primary hover:text-kcb-secondary transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Overview
              </button>
            </div>
            <div className="px-4">
              <TransferForm
                accounts={accounts}
                onSubmit={handleTransfer}
                loading={transferLoading}
                error={transactionsError}
                initialFromAccount={selectedAccount}
                onCancel={() => setCurrentView('overview')}
              />
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div className="flex items-center px-4">
              <button
                onClick={() => setCurrentView('overview')}
                className="flex items-center text-kcb-primary hover:text-kcb-secondary transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Overview
              </button>
            </div>
            <div className="px-4">
              <TransactionLog
                transactions={transactions}
                loading={transactionsLoading}
                error={transactionsError}
                onTransactionClick={handleTransactionClick}
                showFilters={true}
                onRetry={refreshTransactions}
                title="Transaction History"
              />
            </div>
          </div>
        );

      default: // overview
        return (
          <div className="space-y-6">
            <QuickActions
              onTransferClick={() => setCurrentView('transfer')}
              onHistoryClick={() => setCurrentView('history')}
              onRefreshClick={handleRefresh}
              isRefreshing={accountsLoading || transactionsLoading}
            />

            <BalanceCard
              summary={summary}
              onCurrencySelect={handleCurrencySelect}
            />

            {/* Analytics Section */}
            <div className="px-4">
              <TransactionChart 
                transactions={transactions} 
                className="mb-6"
              />
            </div>

            <div className="px-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Your Accounts</h2>
                <button
                  onClick={() => setCurrentView('accounts')}
                  className="text-kcb-primary text-sm font-medium hover:text-kcb-secondary transition-colors"
                >
                  View All
                </button>
              </div>
              <AccountList
                accounts={accounts.slice(0, 4)} // Show first 4 accounts
                loading={accountsLoading}
                error={accountsError}
                onAccountSelect={handleAccountSelect}
                onRetry={refreshAccounts}
              />
            </div>

            <div className="px-4">
              <TransactionLog
                transactions={getRecentTransactions(5)}
                loading={transactionsLoading}
                error={transactionsError}
                onTransactionClick={handleTransactionClick}
                showFilters={false}
                onRetry={refreshTransactions}
                title="Recent Activity"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Header
        totalBalance={getTotalBalance()}
        userName="Treasury Manager"
        onRefresh={handleRefresh}
        isRefreshing={accountsLoading}
      />
      <div className="pt-6">
        {renderCurrentView()}
      </div>
    </>
  );
};

export default Dashboard;
