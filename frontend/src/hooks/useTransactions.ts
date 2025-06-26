import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransferRequest, FilterOptions } from '../types';
import { transactionsApi } from '../utils/api';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchTransactions = useCallback(async (filters?: FilterOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await transactionsApi.getAll(filters);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (transferData: TransferRequest): Promise<Transaction | null> => {
    try {
      setCreating(true);
      setError(null);
      
      const newTransaction = await transactionsApi.create(transferData);
      
      // Add to local state
      setTransactions(prev => [newTransaction, ...prev]);
      
      return newTransaction;
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      const errorMessage = err.response?.data?.error?.message || 'Failed to create transaction. Please try again.';
      setError(errorMessage);
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const getRecentTransactions = useCallback((limit: number = 5) => {
    return transactions.slice(0, limit);
  }, [transactions]);

  const getTransactionsByAccount = useCallback((accountName: string) => {
    return transactions.filter(
      transaction => 
        transaction.from_account === accountName || 
        transaction.to_account === accountName
    );
  }, [transactions]);

  const getTransactionsByCurrency = useCallback((currency: string) => {
    return transactions.filter(transaction => transaction.currency === currency);
  }, [transactions]);

  const refreshTransactions = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    creating,
    createTransaction,
    getRecentTransactions,
    getTransactionsByAccount,
    getTransactionsByCurrency,
    refreshTransactions,
    fetchTransactions
  };
};
