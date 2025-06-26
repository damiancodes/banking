import React from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import CurrencyIcon from './CurrencyIcon';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const getNairobiDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: formatDate(dateString, 'Africa/Nairobi'),
    time: formatTime(dateString, 'Africa/Nairobi'),
  };
};

const getTransferDate = (transaction: Transaction) => {
  if ((transaction as any).transfer_date) return (transaction as any).transfer_date;
  if (transaction.note && transaction.note.includes('transfer_date:')) {
    const match = transaction.note.match(/transfer_date:(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  return transaction.created_at.slice(0, 10);
};

const getNairobiToday = () => {
  const nairobi = new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
  return new Date(nairobi).toISOString().slice(0, 10);
};

const isFutureDate = (dateString: string) => {
  if (!dateString) return false;
  const today = getNairobiToday();
  return dateString > today;
};

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;
  const transferDate = getTransferDate(transaction);
  const scheduled = isFutureDate(transferDate);
  const { date, time } = getNairobiDateTime(transaction.created_at);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-center mb-4">
          <CurrencyIcon currency={transaction.currency} size="md" />
          <h2 className="ml-3 text-lg font-bold text-gray-900">Transaction Details</h2>
          {scheduled && (
            <span className="ml-2 bg-kcb-primary text-white px-2 py-1 rounded-full text-xs font-semibold">Scheduled</span>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">From</span>
            <span className="font-medium">{transaction.from_account}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To</span>
            <span className="font-medium">{transaction.to_account}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount</span>
            <span className="font-medium">{transaction.formatted_amount}</span>
          </div>
          {transaction.exchange_rate !== 1 && transaction.formatted_converted_amount && (
            <div className="flex justify-between">
              <span className="text-gray-600">Converted</span>
              <span className="font-medium">{transaction.formatted_converted_amount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className="font-medium capitalize">{transaction.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Transfer Date</span>
            <span className="font-medium">{transferDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Created At</span>
            <span className="font-medium">{date} {time} (EAT)</span>
          </div>
          {transaction.note && (
            <div>
              <span className="text-gray-600">Note:</span>
              <div className="text-gray-800 text-sm mt-1 whitespace-pre-line">{transaction.note}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal; 