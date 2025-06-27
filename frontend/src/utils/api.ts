
import axios from 'axios';
import { Account, Transaction, TransferRequest, ApiResponse, BalanceSummary, ExchangeRates } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ca1525f7-422d-4c4b-95b7-cf8840b49241-00-kehjunnuffba.worf.replit.dev:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Success:', response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

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