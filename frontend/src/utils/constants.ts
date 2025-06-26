export const CURRENCIES = {
  KES: {
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    code: 'KES'
  },
  USD: {
    name: 'US Dollar',
    symbol: '$',
    code: 'USD'
  },
  NGN: {
    name: 'Nigerian Naira',
    symbol: '₦',
    code: 'NGN'
  }
} as const;

export const EXCHANGE_RATES = {
  KES: {
    USD: 0.0067,
    NGN: 0.186
  },
  USD: {
    KES: 149.25,
    NGN: 27.75
  },
  NGN: {
    KES: 5.38,
    USD: 0.036
  }
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export const API_ENDPOINTS = {
  ACCOUNTS: '/api/accounts',
  TRANSACTIONS: '/api/transactions',
  HEALTH: '/api/health'
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const;

export const VALIDATION = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999999.99,
  MAX_NOTE_LENGTH: 500
} as const;
