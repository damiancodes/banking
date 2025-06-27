const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../treasury.db');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

const database = new Database();

async function initializeDatabase() {
  await database.connect();
  
  // Create accounts table
  await database.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      currency TEXT NOT NULL CHECK (currency IN ('KES', 'USD', 'NGN')),
      balance DECIMAL(15,2) NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create transactions table
  await database.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT NOT NULL UNIQUE,
      from_account TEXT NOT NULL,
      to_account TEXT NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      currency TEXT NOT NULL,
      exchange_rate DECIMAL(10,4) DEFAULT 1.0,
      converted_amount DECIMAL(15,2),
      note TEXT,
      status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
      transfer_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_account) REFERENCES accounts(name),
      FOREIGN KEY (to_account) REFERENCES accounts(name)
    )
  `);

  // Seed initial accounts
  await seedAccounts();
}

async function seedAccounts() {
  const accounts = [
    { name: 'Mpesa_KES_1', currency: 'KES', balance: 50000.00 },
    { name: 'Mpesa_KES_2', currency: 'KES', balance: 75000.00 },
    { name: 'Bank_KES_1', currency: 'KES', balance: 100000.00 },
    { name: 'Bank_USD_1', currency: 'USD', balance: 5000.00 },
    { name: 'Bank_USD_2', currency: 'USD', balance: 7500.00 },
    { name: 'Bank_USD_3', currency: 'USD', balance: 10000.00 },
    { name: 'Bank_NGN_1', currency: 'NGN', balance: 500000.00 },
    { name: 'Bank_NGN_2', currency: 'NGN', balance: 750000.00 },
    { name: 'Wallet_USD_1', currency: 'USD', balance: 2500.00 },
    { name: 'Wallet_NGN_1', currency: 'NGN', balance: 250000.00 }
  ];

  for (const account of accounts) {
    try {
      await database.run(
        'INSERT OR IGNORE INTO accounts (name, currency, balance) VALUES (?, ?, ?)',
        [account.name, account.currency, account.balance]
      );
    } catch (error) {
      console.error(`Error seeding account ${account.name}:`, error);
    }
  }
}

module.exports = { database, initializeDatabase };
