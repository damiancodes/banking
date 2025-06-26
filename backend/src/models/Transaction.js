const { database } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Transaction {
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM transactions';
      let params = [];
      let conditions = [];

      if (filters.account) {
        conditions.push('(from_account = ? OR to_account = ?)');
        params.push(filters.account, filters.account);
      }

      if (filters.currency) {
        conditions.push('currency = ?');
        params.push(filters.currency);
      }

      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }

      if (filters.from_date) {
        conditions.push('created_at >= ?');
        params.push(filters.from_date);
      }

      if (filters.to_date) {
        conditions.push('created_at <= ?');
        params.push(filters.to_date);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }

      const transactions = await database.all(query, params);
      return transactions;
    } catch (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const transaction = await database.get(
        'SELECT * FROM transactions WHERE id = ?',
        [id]
      );
      return transaction;
    } catch (error) {
      throw new Error(`Error fetching transaction ${id}: ${error.message}`);
    }
  }

  static async findByTransactionId(transactionId) {
    try {
      const transaction = await database.get(
        'SELECT * FROM transactions WHERE transaction_id = ?',
        [transactionId]
      );
      return transaction;
    } catch (error) {
      throw new Error(`Error fetching transaction ${transactionId}: ${error.message}`);
    }
  }

  static async create(transactionData) {
    const Account = require('./Account');
    
    try {
      const {
        from_account,
        to_account,
        amount,
        note = '',
        exchange_rate = 1.0
      } = transactionData;

      // Validate accounts exist
      const fromAccount = await Account.findByName(from_account);
      const toAccount = await Account.findByName(to_account);

      if (!fromAccount) {
        throw new Error(`Source account ${from_account} not found`);
      }

      if (!toAccount) {
        throw new Error(`Destination account ${to_account} not found`);
      }

      // Validate sufficient balance
      await Account.validateSufficientBalance(from_account, amount);

      // Calculate converted amount for cross-currency transfers
      const currency = fromAccount.currency;
      const converted_amount = parseFloat(amount) * parseFloat(exchange_rate);

      // Generate unique transaction ID
      const transaction_id = uuidv4();

      // Begin transaction
      await database.run('BEGIN TRANSACTION');

      try {
        // Create transaction record
        const result = await database.run(`
          INSERT INTO transactions (
            transaction_id, from_account, to_account, amount, 
            currency, exchange_rate, converted_amount, note, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')
        `, [
          transaction_id, from_account, to_account, amount,
          currency, exchange_rate, converted_amount, note
        ]);

        // Update account balances
        const newFromBalance = parseFloat(fromAccount.balance) - parseFloat(amount);
        const newToBalance = parseFloat(toAccount.balance) + converted_amount;

        await Account.updateBalance(from_account, newFromBalance);
        await Account.updateBalance(to_account, newToBalance);

        // Commit transaction
        await database.run('COMMIT');

        return await this.findByTransactionId(transaction_id);
      } catch (error) {
        // Rollback on error
        await database.run('ROLLBACK');
        throw error;
      }
    } catch (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  }

  static async getTransactionStats() {
    try {
      const stats = await database.get(`
        SELECT 
          COUNT(*) as total_transactions,
          SUM(amount) as total_amount,
          AVG(amount) as average_amount,
          COUNT(DISTINCT from_account) as unique_senders,
          COUNT(DISTINCT to_account) as unique_receivers
        FROM transactions
        WHERE status = 'completed'
      `);
      return stats;
    } catch (error) {
      throw new Error(`Error getting transaction stats: ${error.message}`);
    }
  }

  static async getTransactionsByDateRange(startDate, endDate) {
    try {
      const transactions = await database.all(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount,
          currency
        FROM transactions 
        WHERE created_at BETWEEN ? AND ?
        AND status = 'completed'
        GROUP BY DATE(created_at), currency
        ORDER BY date DESC, currency
      `, [startDate, endDate]);
      return transactions;
    } catch (error) {
      throw new Error(`Error getting transactions by date range: ${error.message}`);
    }
  }

  static async getCurrencyStats() {
    try {
      const stats = await database.all(`
        SELECT 
          currency,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount,
          AVG(amount) as average_amount,
          MIN(amount) as min_amount,
          MAX(amount) as max_amount
        FROM transactions
        WHERE status = 'completed'
        GROUP BY currency
        ORDER BY total_amount DESC
      `);
      return stats;
    } catch (error) {
      throw new Error(`Error getting currency stats: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await database.run(
        'DELETE FROM transactions WHERE id = ?',
        [id]
      );
      
      if (result.changes === 0) {
        throw new Error(`Transaction ${id} not found`);
      }
      
      return { success: true, message: `Transaction ${id} deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting transaction ${id}: ${error.message}`);
    }
  }
}

module.exports = Transaction;
