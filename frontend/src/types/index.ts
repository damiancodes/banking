export interface Account {
  id: number;
  name: string;
  currency: 'KES' | 'USD' | 'NGN';
  balance: number;
  formatted_balance: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  transaction_id: string;
  from_account: string;
  to_account: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  converted_amount: number | null;
  note: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  formatted_amount: string;
  formatted_converted_amount: string | null;
  formatted_date: string;
}

export interface TransferRequest {
  from_account: string;
  to_account: string;
  amount: number;
  note?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface BalanceSummary {
  currency: string;
  total_balance: number;
  account_count: number;
  formatted_total_balance: string;
}

export interface ExchangeRates {
  [key: string]: number;
}

export interface FilterOptions {
  currency?: string;
  account?: string;
  status?: string;
  limit?: number;
}
