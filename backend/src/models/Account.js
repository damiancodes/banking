const { database } = require('../config/database');

class Account {
  static async findAll() {
    try {
      const accounts = await database.all(`
        SELECT * FROM accounts 
        ORDER BY currency, name
      `);
      return accounts;
    } catch (error) {
      throw new Error(`Error fetching accounts: ${error.message}`);
    }
  }

  static async findByName(name) {
    try {
      const account = await database.get(
        'SELECT * FROM accounts WHERE name = ?',
        [name]
      );
      return account;
    } catch (error) {
      throw new Error(`Error fetching account ${name}: ${error.message}`);
    }
  }

  static async findByCurrency(currency) {
    try {
      const accounts = await database.all(
        'SELECT * FROM accounts WHERE currency = ? ORDER BY name',
        [currency]
      );
      return accounts;
    } catch (error) {
      throw new Error(`Error fetching accounts for currency ${currency}: ${error.message}`);
    }
  }

  static async updateBalance(name, newBalance) {
    try {
      const result = await database.run(
        'UPDATE accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?',
        [newBalance, name]
      );
      
      if (result.changes === 0) {
        throw new Error(`Account ${name} not found`);
      }
      
      return await this.findByName(name);
    } catch (error) {
      throw new Error(`Error updating balance for ${name}: ${error.message}`);
    }
  }

  static async create(accountData) {
    try {
      const { name, currency, balance = 0 } = accountData;
      
      const result = await database.run(
        'INSERT INTO accounts (name, currency, balance) VALUES (?, ?, ?)',
        [name, currency, balance]
      );
      
      return await this.findByName(name);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error(`Account with name ${accountData.name} already exists`);
      }
      throw new Error(`Error creating account: ${error.message}`);
    }
  }

  static async delete(name) {
    try {
      const result = await database.run(
        'DELETE FROM accounts WHERE name = ?',
        [name]
      );
      
      if (result.changes === 0) {
        throw new Error(`Account ${name} not found`);
      }
      
      return { success: true, message: `Account ${name} deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting account ${name}: ${error.message}`);
    }
  }

  static async getTotalBalanceByCurrency() {
    try {
      const totals = await database.all(`
        SELECT 
          currency,
          SUM(balance) as total_balance,
          COUNT(*) as account_count
        FROM accounts 
        GROUP BY currency
        ORDER BY currency
      `);
      return totals;
    } catch (error) {
      throw new Error(`Error getting balance totals: ${error.message}`);
    }
  }

  static async validateSufficientBalance(accountName, amount) {
    try {
      const account = await this.findByName(accountName);
      
      if (!account) {
        throw new Error(`Account ${accountName} not found`);
      }
      
      if (parseFloat(account.balance) < parseFloat(amount)) {
        throw new Error(`Insufficient balance. Available: ${account.balance}, Required: ${amount}`);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Account;
