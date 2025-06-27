import React, { useState } from 'react';
import Header from '../components/Header';
import TransferForm from '../components/TransferForm';
import { TransferRequest } from '../types';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { useToasts } from '../components/ToastContainer';

interface TransferPageProps {
  onNavigate: (page: string) => void;
}

const TransferPage: React.FC<TransferPageProps> = ({ onNavigate }) => {
  const { accounts, getTotalBalance, refreshAccounts } = useAccounts();
  const { createTransaction, loading, error, refreshTransactions } = useTransactions();
  const { showSuccess, showError, showWarning } = useToasts();

  const handleSubmit = async (data: TransferRequest) => {
    try {
      // Force spinner for at least 1 second
      const start = Date.now();
      const result = await createTransaction(data);
      const elapsed = Date.now() - start;
      if (elapsed < 1000) {
        await new Promise(res => setTimeout(res, 1000 - elapsed));
      }
      if (result) {
        // Check if it's a future transfer
        const isFutureTransfer = data.note?.includes('transfer_date:') && 
          new Date(data.note.split('transfer_date:')[1]) > new Date();
        
        if (isFutureTransfer) {
          showSuccess(
            'Transfer Scheduled!', 
            'Your transfer has been scheduled for the selected date.',
            4000
          );
        } else {
          showSuccess(
            'Transfer Completed!', 
            'Your money has been transferred successfully.',
            3000
          );
        }
        
        refreshAccounts();
        refreshTransactions();
        
        // Navigate to transactions page after a short delay
        setTimeout(() => {
          onNavigate('transactions');
        }, 2000);
      }
    } catch (err) {
      showError(
        'Transfer Failed', 
        'There was an error processing your transfer. Please try again.'
      );
    }
  };

  const handleInsufficientFunds = () => {
    showWarning(
      'Insufficient Balance', 
      'Please check your account balance before making a transfer.'
    );
  };

  return (
    <>
      <Header 
        totalBalance={getTotalBalance()} 
        userName="Treasury Manager" 
        onRefresh={() => {}} 
        isRefreshing={loading} 
      />
      <div className="pt-6">
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
