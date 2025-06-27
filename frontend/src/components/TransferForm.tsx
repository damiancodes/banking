import React, { useState, useEffect } from 'react';
import { Account, TransferRequest } from '../types';
import CurrencyIcon from './CurrencyIcon';
import LoadingSpinner from './LoadingSpinner';
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

  // Set initial from account if provided
  useEffect(() => {
    if (initialFromAccount) {
      setFormData(prev => ({ ...prev, from_account: initialFromAccount.name }));
    }
  }, [initialFromAccount]);

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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary bg-white/80 ${
                validationErrors.from_account ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select source account</option>
              {getAccountOptions(formData.to_account)}
            </select>
            {validationErrors.from_account && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.from_account}</p>
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary bg-white/80 ${
                validationErrors.to_account ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select destination account</option>
              {getAccountOptions(formData.from_account)}
            </select>
            {validationErrors.to_account && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.to_account}</p>
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
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary bg-white/80 ${
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
              <p className="mt-1 text-sm text-red-600">{validationErrors.amount}</p>
            )}
            {fromAccount && (
              <p className="mt-1 text-sm text-gray-500">
                Available balance: {fromAccount.formatted_balance}
              </p>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label htmlFor="transfer_date" className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Date
            </label>
            <input
              type="date"
              id="transfer_date"
              value={transferDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setTransferDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary bg-white/80 border-gray-300"
            />
            <p className="mt-1 text-xs text-gray-500">Choose a future date to schedule this transfer, or today for immediate transfer.</p>
          </div>

          {/* Exchange Rate Info */}
          {exchangeRate && convertedAmount && fromAccount && toAccount && (
            <div className="bg-kcb-light border border-kcb-primary rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CurrencyIcon currency={fromAccount.currency} size="sm" />
                  <span className="text-sm font-medium">{formData.amount.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">{fromAccount.currency}</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <div className="flex items-center space-x-2">
                  <CurrencyIcon currency={toAccount.currency} size="sm" />
                  <span className="text-sm font-medium">{convertedAmount.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">{toAccount.currency}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-kcb-primary">
                Exchange rate: 1 {fromAccount.currency} = {exchangeRate} {toAccount.currency}
              </p>
              <p className="text-sm text-kcb-primary font-medium">Converted Amount: {convertedAmount.toLocaleString()}</p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kcb-primary focus:border-kcb-primary bg-white/80"
              placeholder="Add a note about this transfer..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kcb-primary"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-sm font-semibold text-white bg-kcb-primary border border-transparent rounded-lg shadow hover:bg-kcb-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kcb-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Transfer Money</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;
