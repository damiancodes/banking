const express = require('express');
const TransactionController = require('../controllers/transactionController');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Apply rate limiting to all transaction routes
router.use(ValidationMiddleware.rateLimiter(15 * 60 * 1000, 50)); // 50 requests per 15 minutes

// GET /api/transactions - Get all transactions with optional filters
router.get('/', 
  ValidationMiddleware.validateQueryParams,
  TransactionController.getAllTransactions
);

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', 
  TransactionController.getTransactionStats
);

// GET /api/transactions/currency-stats - Get statistics by currency
router.get('/currency-stats', 
  TransactionController.getCurrencyStats
);

// GET /api/transactions/date-range - Get transactions by date range
router.get('/date-range', 
  ValidationMiddleware.validateDateRange,
  TransactionController.getTransactionsByDateRange
);

// GET /api/transactions/:id - Get specific transaction by ID
router.get('/:id', 
  TransactionController.getTransactionById
);

// POST /api/transactions - Create new transaction (transfer money)
router.post('/', 
  ValidationMiddleware.validateCreateTransaction,
  TransactionController.createTransaction
);

// DELETE /api/transactions/:id - Delete transaction (admin only)
router.delete('/:id', 
  TransactionController.deleteTransaction
);

module.exports = router;
