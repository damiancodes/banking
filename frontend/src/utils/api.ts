import axios from 'axios';
import { Account, Transaction, TransferRequest, ApiResponse, BalanceSummary, ExchangeRates } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const accountsApi = {
  getAll: async (): Promise<Account[]> => {
    const response = await api.get<ApiResponse<Account[]>>('/accounts');
    return response.data.data;
  },

  getByName: async (name: string): Promise<Account> => {
    const response = await api.get<ApiResponse<Account>>(`/accounts/${name}`);
    return response.data.data;
  },

  getByCurrency: async (currency: string): Promise<Account[]> => {
    const response = await api.get<ApiResponse<Account[]>>(`/accounts/currency/${currency}`);
    return response.data.data;
  },

  getSummary: async (): Promise<BalanceSummary[]> => {
    const response = await api.get<ApiResponse<BalanceSummary[]>>('/accounts/summary');
    return response.data.data;
  },

  getExchangeRates: async (): Promise<ExchangeRates> => {
    const response = await api.get<ApiResponse<ExchangeRates>>('/accounts/exchange-rates');
    return response.data.data;
  },
};

export const transactionsApi = {
  getAll: async (filters?: any): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
    }
    
    const response = await api.get<ApiResponse<Transaction[]>>(`/transactions?${params}`);
    return response.data.data;
  },

  create: async (transferData: TransferRequest): Promise<Transaction> => {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', transferData);
    return response.data.data;
  },
};

export default api;
