import React, { useState, useEffect } from 'react';
import { Account, TransferRequest } from '../types';
import CurrencyIcon from './CurrencyIcon';
import { ButtonSpinner } from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface TransferFormProps {
  accounts: Account[];
  onSubmit: (data: TransferRequest) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  initialFromAccount?: Account | null;
  onCancel?: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({
  accounts,
  onSubmit,
  loading = false,
  error = null,
  initialFromAccount = null,
  onCancel
}) => {
  const [formData, setFormData] = useState<TransferRequest>({
    from_account: '',
    to_account: '',
    amount: 0,
    note: ''
  });

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [transferDate, setTransferDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [isFutureTransfer, setIsFutureTransfer] = useState(false);

  // Set initial from account if provided
  useEffect(() => {
    if (initialFromAccount) {
      setFormData(prev => ({ ...prev, from_account: initialFromAccount.name }));
    }
  }, [initialFromAccount]);

  // Check if transfer is scheduled for future
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setIsFutureTransfer(transferDate > today);
  }, [transferDate]);

  // Calculate exchange rate and converted amount when accounts change
  useEffect(() => {
    if (formData.from_account && formData.to_account && formData.amount > 0) {
      const fromAccount = accounts.find(acc => acc.name === formData.from_account);
      const toAccount = accounts.find(acc => acc.name === formData.to_account);
      
      if (fromAccount && toAccount && fromAccount.currency !== toAccount.currency) {
        // Static exchange rates (in real app, these would come from API)
        const rates: Record<string, Record<string, number>> = {
          KES: { USD: 0.0067, NGN: 0.186 },
          USD: { KES: 149.25, NGN: 27.75 },
          NGN: { KES: 5.38, USD: 0.036 }
        };
        
        const rate = rates[fromAccount.currency]?.[toAccount.currency];
        if (rate) {
          setExchangeRate(rate);
          setConvertedAmount(formData.amount * rate);
        } else {
          setExchangeRate(null);
          setConvertedAmount(null);
        }
      } else {
        setExchangeRate(null);
        setConvertedAmount(null);
      }
    }
  }, [formData.from_account, formData.to_account, formData.amount, accounts]);

  // Real-time validation
  useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (formData.from_account && formData.to_account && formData.from_account === formData.to_account) {
      errors.to_account = 'Source and destination accounts must be different';
    }
    
    if (formData.amount > 0) {
      const fromAccount = accounts.find(acc => acc.name === formData.from_account);
      if (fromAccount && formData.amount > fromAccount.balance) {
        errors.amount = `Insufficient balance. Available: ${fromAccount.formatted_balance}`;
      }
    }
    
    setValidationErrors(prev => ({ ...prev, ...errors }));
  }, [formData, accounts]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.from_account) {
      errors.from_account = 'Please select a source account';
    }
    
    if (!formData.to_account) {
      errors.to_account = 'Please select a destination account';
    }
    
    if (formData.from_account === formData.to_account) {
      errors.to_account = 'Source and destination accounts must be different';
    }
    
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Please enter a valid amount';
    } else {
      const fromAccount = accounts.find(acc => acc.name === formData.from_account);
      if (fromAccount && formData.amount > fromAccount.balance) {
        errors.amount = `Insufficient balance. Available: ${fromAccount.formatted_balance}`;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      let noteWithDate = formData.note || '';
      if (!noteWithDate.includes('transfer_date:')) {
        noteWithDate = (noteWithDate ? noteWithDate + ' ' : '') + `transfer_date:${transferDate}`;
      }
      await onSubmit({ ...formData, note: noteWithDate });
    }
  };

  const handleInputChange = (field: keyof TransferRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getAccountOptions = (excludeAccount?: string) => {
    return accounts
      .filter(account => account.name !== excludeAccount)
      .map(account => (
        <option key={account.name} value={account.name}>
          {account.name} ({account.currency}) - {account.formatted_balance}
        </option>
      ));
  };

  const fromAccount = accounts.find(acc => acc.name === formData.from_account);
  const toAccount = accounts.find(acc => acc.name === formData.to_account);

  return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="bg-white/90 rounded-2xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <svg className="w-8 h-8 text-kcb-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">Transfer Money</h2>
        </div>
        <div className="border-b border-gray-200 mb-6" />
        {error && <ErrorMessage message={error} />}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* From Account */}
          <div>
            <label htmlFor="from_account" className="block text-sm font-medium text-gray-700 mb-2">
              From Account
            </label>
            <select
              id="from_account"
              value={formData.from_account}
              onChange={(e) => handleInputChange('from_account', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed ${
                validationErrors.from_account ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select source account</option>
              {getAccountOptions(formData.to_account)}
            </select>
            {validationErrors.from_account && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.from_account}
              </p>
            )}
          </div>

          {/* To Account */}
          <div>
            <label htmlFor="to_account" className="block text-sm font-medium text-gray-700 mb-2">
              To Account
            </label>
            <select
              id="to_account"
              value={formData.to_account}
              onChange={(e) => handleInputChange('to_account', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed ${
                validationErrors.to_account ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select destination account</option>
              {getAccountOptions(formData.from_account)}
            </select>
            {validationErrors.to_account && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.to_account}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                id="amount"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
                disabled={loading}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed ${
                  validationErrors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {fromAccount && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <CurrencyIcon currency={fromAccount.currency} size="sm" />
                </div>
              )}
            </div>
            {validationErrors.amount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.amount}
              </p>
            )}
            {fromAccount && (
              <p className="mt-1 text-sm text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Available balance: {fromAccount.formatted_balance}
              </p>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label htmlFor="transfer_date" className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="transfer_date"
                value={transferDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setTransferDate(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary bg-white/80 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isFutureTransfer && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="bg-kcb-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Scheduled
                  </span>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {isFutureTransfer 
                ? 'This transfer will be scheduled for the selected date.'
                : 'Choose a future date to schedule this transfer, or today for immediate transfer.'
              }
            </p>
          </div>

          {/* FX Card */}
          {exchangeRate && convertedAmount && fromAccount && toAccount && (
            <div className="bg-green-50 border border-green-400 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between mb-2 shadow-sm">
              <div className="flex items-center space-x-2 flex-1">
                <CurrencyIcon currency={fromAccount.currency} size="sm" />
                <span className="font-bold text-gray-900 text-lg">{formData.amount.toLocaleString()}</span>
                <span className="text-gray-500 font-medium">{fromAccount.currency}</span>
              </div>
              <div className="flex items-center mx-4">
                <svg className="w-7 h-7 text-kcb-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4-4 4 4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21V3" />
                </svg>
              </div>
              <div className="flex items-center space-x-2 flex-1 justify-end">
                <CurrencyIcon currency={toAccount.currency} size="sm" />
                <span className="font-bold text-gray-900 text-lg">{convertedAmount.toLocaleString()}</span>
                <span className="text-gray-500 font-medium">{toAccount.currency}</span>
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={3}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Add a note about this transfer..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kcb-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0}
              className={`w-full h-12 text-sm font-semibold text-white bg-kcb-primary border border-transparent rounded-lg shadow hover:bg-kcb-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kcb-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition ${loading ? 'animate-pulse' : ''}`}
            >
              {loading ? (
                <>
                  <ButtonSpinner size="sm" />
                  <span>Processing…</span>
                </>
              ) : (
                <span>{isFutureTransfer ? 'Schedule Transfer' : 'Transfer Money'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;
