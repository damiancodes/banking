import React from 'react';
import { Transaction } from '../types';
import CurrencyIcon from './CurrencyIcon';
import { formatDate, formatTime } from '../utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
  currentAccount?: string;
  onClick?: () => void;
  showDetails?: boolean;
}

// Helper to get today's date in Africa/Nairobi timezone (YYYY-MM-DD)
const getNairobiToday = () => {
  const nairobi = new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
  return new Date(nairobi).toISOString().slice(0, 10);
};

const isFutureDate = (dateString: string) => {
  if (!dateString) return false;
  const today = getNairobiToday();
  return dateString > today;
};

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  currentAccount,
  onClick,
  showDetails = false
}) => {
  const isIncoming = currentAccount ? transaction.to_account === currentAccount : false;
  const isOutgoing = currentAccount ? transaction.from_account === currentAccount : false;
  
  // Try to extract transfer_date from note (if present)
  let transferDate = '';
  if ((transaction as any).transfer_date) {
    transferDate = (transaction as any).transfer_date;
  } else if (transaction.note && transaction.note.includes('transfer_date:')) {
    const match = transaction.note.match(/transfer_date:(\d{4}-\d{2}-\d{2})/);
    if (match) transferDate = match[1];
  }
  // If your backend or frontend stores transfer_date as a field, use that instead
  // For now, fallback to created_at if not present
  if (!transferDate) transferDate = transaction.created_at.slice(0, 10);

  const getTransactionIcon = () => {
    if (isIncoming) {
      return (
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      );
    } else if (isOutgoing) {
      return (
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 bg-kcb-light rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-kcb-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
        </div>
      );
    }
  };

  const getStatusBadge = () => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
        ${statusStyles[transaction.status] || statusStyles.completed}
      `}>
        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
      </span>
    );
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center space-x-4">
        {getTransactionIcon()}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {isIncoming ? `From ${transaction.from_account}` : 
                 isOutgoing ? `To ${transaction.to_account}` :
                 `${transaction.from_account} → ${transaction.to_account}`}
              </p>
              <CurrencyIcon currency={transaction.currency} size="sm" />
              {/* Scheduled badge for future-dated transfers */}
              {isFutureDate(transferDate) && (
                <span className="ml-2 bg-kcb-primary text-white px-2 py-1 rounded-full text-xs font-semibold">Scheduled</span>
              )}
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                isIncoming ? 'text-green-600' : 
                isOutgoing ? 'text-red-600' : 'text-gray-900'
              }`}>
                {isIncoming ? '+' : isOutgoing ? '-' : ''}{transaction.formatted_amount}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{formatDate(transaction.created_at, 'Africa/Nairobi')}</span>
              <span>•</span>
              <span>{formatTime(transaction.created_at, 'Africa/Nairobi')}</span>
              {showDetails && (
                <>
                  <span>•</span>
                  {getStatusBadge()}
                </>
              )}
            </div>
            
            {transaction.exchange_rate !== 1 && transaction.formatted_converted_amount && (
              <p className="text-xs text-gray-500">
                ≈ {transaction.formatted_converted_amount}
              </p>
            )}
          </div>
          
          {transaction.note && showDetails && (
            <p className="text-xs text-gray-600 mt-1 truncate">
              Note: {transaction.note}
            </p>
          )}
        </div>

        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

export default TransactionItem;
