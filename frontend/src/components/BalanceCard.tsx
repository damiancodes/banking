import React from 'react';
import { BalanceSummary } from '../types';
import CurrencyIcon from './CurrencyIcon';

interface BalanceCardProps {
  summary: BalanceSummary[];
  onCurrencySelect?: (currency: string) => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ summary, onCurrencySelect }) => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {summary.map((item) => (
        <button
          key={item.currency}
          onClick={() => onCurrencySelect?.(item.currency)}
          className={`
            card p-4 text-left hover:scale-105 transition-all duration-200 
            ${item.currency === 'KES' ? 'currency-kes' : ''}
            ${item.currency === 'USD' ? 'currency-usd' : ''}
            ${item.currency === 'NGN' ? 'currency-ngn' : ''}
          `}
        >
          <div className="flex items-center justify-between mb-3">
            <CurrencyIcon currency={item.currency} size="sm" />
            <span className="text-xs text-gray-500">{item.account_count} accounts</span>
          </div>
          
          <div>
            <p className="text-xs text-gray-600 mb-1">{item.currency} Accounts</p>
            <p className="font-semibold text-lg text-gray-900">
              {item.formatted_total_balance}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default BalanceCard;
