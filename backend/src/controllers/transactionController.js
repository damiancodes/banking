const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { ResponseHelpers, ValidationHelpers, CurrencyConverter, DateHelpers } = require('../utils/helpers');

class TransactionController {
  static async getAllTransactions(req, res) {
    try {
      const {
        account,
        currency,
        status,
        from_date,
        to_date,
        limit,
        page = 1
      } = req.query;

      const filters = {};
      
      if (account) filters.account = account;
      if (currency && ValidationHelpers.validateCurrency(currency)) {
        filters.currency = currency;
      }
      if (status) filters.status = status;
      if (from_date) filters.from_date = from_date;
      if (to_date) filters.to_date = to_date;
      if (limit) filters.limit = parseInt(limit);

      const transactions = await Transaction.findAll(filters);

      // Format transactions for display
      const formattedTransactions = transactions.map(transaction => ({
        ...transaction,
        formatted_amount: CurrencyConverter.formatCurrency(transaction.amount, transaction.currency),
        formatted_converted_amount: transaction.converted_amount ? 
          CurrencyConverter.formatCurrency(transaction.converted_amount, transaction.currency) : null,
        formatted_date: DateHelpers.formatDateTime(transaction.created_at)
      }));

      // Apply pagination if requested
      if (req.query.page) {
        const paginatedResult = ResponseHelpers.paginate(
          formattedTransactions, 
          page, 
          limit || 10
        );
        return res.json(paginatedResult);
      }

      res.json(ResponseHelpers.success(formattedTransactions, 'Transactions retrieved successfully'));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json(ResponseHelpers.error('Failed to fetch transactions', 500, error.message));
    }
  }

  static async getTransactionById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(ResponseHelpers.error('Invalid transaction ID', 400));
      }

      const transaction = await Transaction.findById(parseInt(id));

      if (!transaction) {
        return res.status(404).json(ResponseHelpers.error('Transaction not found', 404));
      }

      const formattedTransaction = {
        ...transaction,
        formatted_amount: CurrencyConverter.formatCurrency(transaction.amount, transaction.currency),
        formatted_converted_amount: transaction.converted_amount ? 
          CurrencyConverter.formatCurrency(transaction.converted_amount, transaction.currency) : null,
        formatted_date: DateHelpers.formatDateTime(transaction.created_at)
      };

      res.json(ResponseHelpers.success(formattedTransaction, 'Transaction retrieved successfully'));
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json(ResponseHelpers.error('Failed to fetch transaction', 500, error.message));
    }
  }

  static async createTransaction(req, res) {
    try {
      const { from_account, to_account, amount, note, transfer_date } = req.body;

      // Validate transaction data
      const validation = ValidationHelpers.validateTransferData({
        from_account,
        to_account,
        amount
      });

      if (!validation.isValid) {
        return res.status(400).json(ResponseHelpers.error(
          'Validation failed', 
          400, 
          validation.errors
        ));
      }

      // Get account details to determine currencies and exchange rate
      const fromAccount = await Account.findByName(from_account);
      const toAccount = await Account.findByName(to_account);

      if (!fromAccount || !toAccount) {
        return res.status(404).json(ResponseHelpers.error('One or both accounts not found', 404));
      }

      // Calculate exchange rate if currencies differ
      const exchange_rate = CurrencyConverter.getExchangeRate(
        fromAccount.currency, 
        toAccount.currency
      );

      const transactionData = {
        from_account: ValidationHelpers.sanitizeString(from_account),
        to_account: ValidationHelpers.sanitizeString(to_account),
        amount: parseFloat(amount),
        note: ValidationHelpers.sanitizeString(note || ''),
        exchange_rate,
        transfer_date: transfer_date || null
      };

      const newTransaction = await Transaction.create(transactionData);

      const formattedTransaction = {
        ...newTransaction,
        formatted_amount: CurrencyConverter.formatCurrency(newTransaction.amount, newTransaction.currency),
        formatted_converted_amount: newTransaction.converted_amount ? 
          CurrencyConverter.formatCurrency(newTransaction.converted_amount, newTransaction.currency) : null,
        formatted_date: DateHelpers.formatDateTime(newTransaction.created_at)
      };

      res.status(201).json(ResponseHelpers.success(
        formattedTransaction, 
        'Transaction completed successfully'
      ));
    } catch (error) {
      console.error('Error creating transaction:', error);
      
      if (error.message.includes('Insufficient balance')) {
        return res.status(400).json(ResponseHelpers.error(error.message, 400));
      }
      
      if (error.message.includes('not found')) {
        return res.status(404).json(ResponseHelpers.error(error.message, 404));
      }
      
      res.status(500).json(ResponseHelpers.error('Failed to create transaction', 500, error.message));
    }
  }

  static async getTransactionStats(req, res) {
    try {
      const stats = await Transaction.getTransactionStats();
      
      const formattedStats = {
        ...stats,
        formatted_total_amount: CurrencyConverter.formatCurrency(stats.total_amount || 0, 'USD'),
        formatted_average_amount: CurrencyConverter.formatCurrency(stats.average_amount || 0, 'USD')
      };

      res.json(ResponseHelpers.success(formattedStats, 'Transaction statistics retrieved successfully'));
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      res.status(500).json(ResponseHelpers.error('Failed to fetch transaction statistics', 500, error.message));
    }
  }

  static async getCurrencyStats(req, res) {
    try {
      const stats = await Transaction.getCurrencyStats();
      
      const formattedStats = stats.map(stat => ({
        ...stat,
        formatted_total_amount: CurrencyConverter.formatCurrency(stat.total_amount, stat.currency),
        formatted_average_amount: CurrencyConverter.formatCurrency(stat.average_amount, stat.currency),
        formatted_min_amount: CurrencyConverter.formatCurrency(stat.min_amount, stat.currency),
        formatted_max_amount: CurrencyConverter.formatCurrency(stat.max_amount, stat.currency)
      }));

      res.json(ResponseHelpers.success(formattedStats, 'Currency statistics retrieved successfully'));
    } catch (error) {
      console.error('Error fetching currency stats:', error);
      res.status(500).json(ResponseHelpers.error('Failed to fetch currency statistics', 500, error.message));
    }
  }

  static async getTransactionsByDateRange(req, res) {
    try {
      const { start_date, end_date, days } = req.query;

      let startDate, endDate;

      if (days) {
        const range = DateHelpers.getDateRange(parseInt(days));
        startDate = range.startDate;
        endDate = range.endDate;
      } else {
        startDate = start_date;
        endDate = end_date;
      }

      if (!startDate || !endDate) {
        return res.status(400).json(ResponseHelpers.error(
          'Please provide start_date and end_date, or days parameter', 
          400
        ));
      }

      const transactions = await Transaction.getTransactionsByDateRange(startDate, endDate);

      const formattedTransactions = transactions.map(transaction => ({
        ...transaction,
        formatted_total_amount: CurrencyConverter.formatCurrency(transaction.total_amount, transaction.currency)
      }));

      res.json(ResponseHelpers.success(
        formattedTransactions, 
        `Transactions for ${startDate} to ${endDate} retrieved successfully`
      ));
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      res.status(500).json(ResponseHelpers.error('Failed to fetch transactions by date range', 500, error.message));
    }
  }

  static async deleteTransaction(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(ResponseHelpers.error('Invalid transaction ID', 400));
      }

      const result = await Transaction.delete(parseInt(id));
      res.json(ResponseHelpers.success(result, 'Transaction deleted successfully'));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json(ResponseHelpers.error(error.message, 404));
      }
      
      res.status(500).json(ResponseHelpers.error('Failed to delete transaction', 500, error.message));
    }
  }
}

module.exports = TransactionController;
