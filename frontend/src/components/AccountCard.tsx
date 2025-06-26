import React from 'react';
import { Account } from '../types';
import CurrencyIcon from './CurrencyIcon';
import { formatDate } from '../utils/formatters';

interface AccountCardProps {
  account: Account;
  isSelected?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({ 
  account, 
  isSelected = false,
  onClick,
  showDetails = false 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        card p-4 text-left w-full transition-all duration-200
        ${isSelected ? 'ring-2 ring-kcb-primary shadow-lg' : 'hover:shadow-lg'}
        ${account.currency === 'KES' ? 'currency-kes' : ''}
        ${account.currency === 'USD' ? 'currency-usd' : ''}
        ${account.currency === 'NGN' ? 'currency-ngn' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <CurrencyIcon currency={account.currency} size="md" />
          <div>
            <h3 className="font-semibold text-gray-900">{account.name}</h3>
            <p className="text-sm text-gray-600">{account.currency}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-bold text-lg text-gray-900">
            {account.formatted_balance}
          </p>
          {showDetails && (
            <p className="text-xs text-gray-500">
              Updated {formatDate(account.updated_at)}
            </p>
          )}
        </div>
      </div>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center text-kcb-primary">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Selected as source</span>
          </div>
        </div>
      )}
    </button>
  );
};

export default AccountCard;
