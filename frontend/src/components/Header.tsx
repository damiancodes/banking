import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  totalBalance: number;
  userName?: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  totalBalance, 
  userName = 'User', 
  onRefresh, 
  isRefreshing = false 
}) => {
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <div className="max-w-2xl mx-auto mt-4 rounded-3xl shadow-2xl bg-gradient-to-r from-kcb-primary via-kcb-secondary to-kcb-primary px-8 py-header-tight border border-kcb-light">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-kcb-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-kcb-light text-sm font-medium">Good day,</p>
            <h1 className="text-xl font-medium header-title">{userName}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
            title={balanceVisible ? 'Hide balance' : 'Show balance'}
          >
            {balanceVisible ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            )}
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
            title="Refresh"
          >
            <svg 
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-kcb-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <p className="text-kcb-light text-sm font-medium">Total </p>
        </div>
        <div className="flex items-baseline space-x-2">
          {balanceVisible ? (
            <h2 className="text-2xl font-medium header-amount">
              {formatCurrency(totalBalance, 'USD')}
            </h2>
          ) : (
            <h2 className="text-2xl font-medium text-kcb-light header-amount">
              ••••••••
            </h2>
          )}
          <span className="text-kcb-light text-sm">USD </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
