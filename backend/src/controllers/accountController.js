const Account = require('../models/Account');
const { ResponseHelpers, ValidationHelpers, CurrencyConverter } = require('../utils/helpers');

class AccountController {
  static async getAllAccounts(req, res) {
    try {
      const accounts = await Account.findAll();
      
      // Add formatted balance for display
      const formattedAccounts = accounts.map(account => ({
        ...account,
        formatted_balance: CurrencyConverter.formatCurrency(account.balance, account.currency)
      }));

      res.json(ResponseHelpers.success(formattedAccounts, 'Accounts retrieved successfully'));
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json(ResponseHelpers.error('Failed to fetch accounts', 500, error.message));
    }
  }

  static async getAccountByName(req, res) {
    try {
      const { name } = req.params;

      if (!ValidationHelpers.validateAccountName(name)) {
        return res.status(400).json(ResponseHelpers.error('Invalid account name', 400));
      }

      const account = await Account.findByName(name);

      if (!account) {
        return res.status(404).json(ResponseHelpers.error('Account not found', 404));
      }

      const formattedAccount = {
        ...account,
        formatted_balance: CurrencyConverter.formatCurrency(account.balance, account.currency)
      };

      res.json(ResponseHelpers.success(formattedAccount, 'Account retrieved successfully'));
    } catch (error) {
      console.error('Error fetching account:', error);
      res.status(500).json(ResponseHelpers.error('Failed to fetch account', 500, error.message));
    }
  }

  static async getAccountsByCurrency(req, res) {
    try {
      const { currency } = req.params;

      if (!ValidationHelpers.validateCurrency(currency)) {
        return res.status(400).json(ResponseHelpers.error('Invalid currency', 400));
      }

      const accounts = await Account.findByCurrency(currency);
      
      const formattedAccounts = accounts.map(account => ({
        ...account,
        formatted_balance: CurrencyConverter.formatCurrency(account.balance, account.currency)
      }));

      res.json(ResponseHelpers.success(formattedAccounts, `Accounts for ${currency} retrieved successfully`));
    } catch (error) {
      console.error('Error fetching accounts by currency:', error);
      res.status(500).json(ResponseHelpers.error('Failed to fetch accounts', 500, error.message));
    }
  }

  static async createAccount(req, res) {
    try {
      const { name, currency, balance = 0 } = req.body;

      // Validate input
      if (!ValidationHelpers.validateAccountName(name)) {
        return res.status(400).json(ResponseHelpers.error('Invalid account name', 400));
      }

      if (!ValidationHelpers.validateCurrency(currency)) {
        return res.status(400).json(ResponseHelpers.error('Invalid currency. Must be KES, USD, or NGN', 400));
      }

      if (balance < 0) {
        return res.status(400).json(ResponseHelpers.error('Balance cannot be negative', 400));
      }

      const accountData = {
        name: ValidationHelpers.sanitizeString(name),
        currency: currency.toUpperCase(),
        balance: parseFloat(balance)
      };

      const newAccount = await Account.create(accountData);

      const formattedAccount = {
        ...newAccount,
        formatted_balance: CurrencyConverter.formatCurrency(newAccount.balance, newAccount.currency)
      };

      res.status(201).json(ResponseHelpers.success(formattedAccount, 'Account created successfully'));
    } catch (error) {
      console.error('Error creating account:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json(ResponseHelpers.error(error.message, 409));
      }
      
      res.status(500).json(ResponseHelpers.error('Failed to create account', 500, error.message));
    }
  }

  static async updateAccountBalance(req, res) {
    try {
      const { name } = req.params;
      const { balance } = req.body;

      if (!ValidationHelpers.validateAccountName(name)) {
        return res.status(400).json(ResponseHelpers.error('Invalid account name', 400));
      }

      if (!ValidationHelpers.validateAmount(balance) && balance !== 0) {
        return res.status(400).json(ResponseHelpers.error('Invalid balance amount', 400));
      }

      const updatedAccount = await Account.updateBalance(name, parseFloat(balance));

      const formattedAccount = {
        ...updatedAccount,
        formatted_balance: CurrencyConverter.formatCurrency(updatedAccount.balance, updatedAccount.currency)
      };

      res.json(ResponseHelpers.success(formattedAccount, 'Account balance updated successfully'));
    } catch (error) {
      console.error('Error updating account balance:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json(ResponseHelpers.error(error.message, 404));
      }
      
      res.status(500).json(ResponseHelpers.error('Failed to update account balance', 500, error.message));
    }
  }

  static async deleteAccount(req, res) {
    try {
      const { name } = req.params;

      if (!ValidationHelpers.validateAccountName(name)) {
        return res.status(400).json(ResponseHelpers.error('Invalid account name', 400));
      }

      const result = await Account.delete(name);
      res.json(ResponseHelpers.success(result, 'Account deleted successfully'));
    } catch (error) {
      console.error('Error deleting account:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json(ResponseHelpers.error(error.message, 404));
      }
      
      res.status(500).json(ResponseHelpers.error('Failed to delete account', 500, error.message));
    }
  }

  static async getBalanceSummary(req, res) {
    try {
      const totals = await Account.getTotalBalanceByCurrency();
      
      const formattedTotals = totals.map(total => ({
        ...total,
        formatted_total_balance: CurrencyConverter.formatCurrency(total.total_balance, total.currency)
      }));

      res.json(ResponseHelpers.success(formattedTotals, 'Balance summary retrieved successfully'));
    } catch (error) {
      console.error('Error fetching balance summary:', error);
      res.status(500).json(ResponseHelpers.error('Failed to fetch balance summary', 500, error.message));
    }
  }

  static async getExchangeRates(req, res) {
    try {
      const rates = CurrencyConverter.getAllRates();
      res.json(ResponseHelpers.success(rates, 'Exchange rates retrieved successfully'));
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      res.status(500).json(ResponseHelpers.error('Failed to fetch exchange rates', 500, error.message));
    }
  }
}

module.exports = AccountController;
