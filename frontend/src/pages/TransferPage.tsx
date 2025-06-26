import React, { useState } from 'react';
import Header from '../components/Header';
import TransferForm from '../components/TransferForm';
import SuccessMessage from '../components/SuccessMessage';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { TransferRequest } from '../types';

interface TransferPageProps {
  onNavigate: (page: string) => void;
}

const TransferPage: React.FC<TransferPageProps> = ({ onNavigate }) => {
  const { accounts, getTotalBalance, refreshAccounts } = useAccounts();
  const { createTransaction, loading, error, refreshTransactions } = useTransactions();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (data: TransferRequest) => {
    const result = await createTransaction(data);
    if (result) {
      setSuccessMessage('Transfer completed successfully!');
      refreshAccounts();
      refreshTransactions();
      setTimeout(() => {
        setSuccessMessage(null);
        onNavigate('transactions');
      }, 1200); // Show message for 1.2s, then navigate
    }
  };

  return (
    <>
      <Header totalBalance={getTotalBalance()} userName="Treasury Manager" onRefresh={() => {}} isRefreshing={loading} />
      <div className="pt-6">
        {successMessage && (
          <div className="mb-4">
            <SuccessMessage message={successMessage} autoHide={false} onClose={() => setSuccessMessage(null)} />
          </div>
        )}
        <TransferForm
          accounts={accounts}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </div>
    </>
  );
};

export default TransferPage;
