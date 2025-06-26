import { useState, useEffect, useCallback } from 'react';
import { Account, BalanceSummary } from '../types';
import { accountsApi } from '../utils/api';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<BalanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [accountsData, summaryData] = await Promise.all([
        accountsApi.getAll(),
        accountsApi.getSummary()
      ]);
      
      setAccounts(accountsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const getAccountsByurrency = useCallback((currency: string) => {
    return accounts.filter(account => account.currency === currency);
  }, [accounts]);

  const getAccountByName = useCallback((name: string) => {
    return accounts.find(account => account.name === name);
  }, [accounts]);

  const getTotalBalance = useCallback(() => {
    return summary.reduce((total, curr) => {
      // Convert to USD for total (simplified)
      const rates = { KES: 0.0067, USD: 1, NGN: 0.00125 };
      return total + (curr.total_balance * (rates[curr.currency as keyof typeof rates] || 1));
    }, 0);
  }, [summary]);

  const refreshAccounts = useCallback(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    summary,
    loading,
    error,
    getAccountsByurrency,
    getAccountByName,
    getTotalBalance,
    refreshAccounts
  };
};
