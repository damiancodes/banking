import React from 'react';
import { BalanceSummary } from '../types';
import CurrencyIcon from './CurrencyIcon';

interface BalanceCardProps {
  summary: BalanceSummary[];
  onCurrencySelect?: (currency: string) => void;
}

const abbreviate = (value: number) => {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
  return value.toLocaleString();
};

const BalanceCard: React.FC<BalanceCardProps> = ({ summary, onCurrencySelect }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center my-4">
      {summary.map((item, idx) => (
        <React.Fragment key={item.currency}>
          <button
            onClick={() => onCurrencySelect?.(item.currency)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 hover:scale-105"
          >
            <CurrencyIcon currency={item.currency} size="sm" />
            <span className="font-medium text-gray-900">{item.currency}</span>
            <span className="font-semibold text-lg text-gray-900">{abbreviate(item.total_balance)}</span>
          </button>
          {idx < summary.length - 1 && (
            <span className="hidden sm:inline text-gray-300 text-xl font-bold">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BalanceCard;
