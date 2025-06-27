import React from 'react';
import { Transaction } from '../types';

interface TransactionChartProps {
  transactions: Transaction[];
  className?: string;
}

const TransactionChart: React.FC<TransactionChartProps> = ({ transactions, className = '' }) => {
  // Group transactions by currency
  const currencyStats = transactions.reduce((acc, transaction) => {
    const currency = transaction.currency;
    if (!acc[currency]) {
      acc[currency] = { count: 0, total: 0 };
    }
    acc[currency].count++;
    acc[currency].total += transaction.amount;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  // Get currency colors
  const getCurrencyColor = (currency: string) => {
    const colors = {
      KES: 'bg-green-500',
      USD: 'bg-blue-500',
      NGN: 'bg-yellow-500'
    };
    return colors[currency as keyof typeof colors] || 'bg-gray-500';
  };

  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols = {
      KES: 'KSh',
      USD: '$',
      NGN: '₦'
    };
    return symbols[currency as keyof typeof symbols] || currency;
  };

  // Calculate total transactions
  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Get recent activity (last 7 days)
  const last7Days = transactions.filter(t => {
    const transactionDate = new Date(t.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return transactionDate >= weekAgo;
  });

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Overview</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-kcb-light rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-kcb-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{totalTransactions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-kcb-light rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-kcb-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{last7Days.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Currency Distribution</h4>
        <div className="space-y-3">
          {Object.entries(currencyStats).map(([currency, stats]) => {
            const percentage = totalTransactions > 0 ? (stats.count / totalTransactions) * 100 : 0;
            return (
              <div key={currency} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getCurrencyColor(currency)}`} />
                  <span className="text-sm font-medium text-gray-900">{currency}</span>
                  <span className="text-xs text-gray-500">
                    {getCurrencySymbol(currency)} {stats.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCurrencyColor(currency)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{percentage.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity (Last 7 Days)</h4>
        <div className="flex items-end space-x-1 h-20">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayTransactions = last7Days.filter(t => {
              const transactionDate = new Date(t.created_at);
              return transactionDate.toDateString() === date.toDateString();
            });
            
            const maxTransactions = Math.max(...Array.from({ length: 7 }, (_, j) => {
              const checkDate = new Date();
              checkDate.setDate(checkDate.getDate() - (6 - j));
              return last7Days.filter(t => {
                const transactionDate = new Date(t.created_at);
                return transactionDate.toDateString() === checkDate.toDateString();
              }).length;
            }));
            
            const height = maxTransactions > 0 ? (dayTransactions.length / maxTransactions) * 100 : 0;
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t ${getCurrencyColor('KES')} transition-all duration-300`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500 mt-1">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TransactionChart; 