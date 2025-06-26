const express = require('express');
const AccountController = require('../controllers/accountController');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Apply rate limiting to all account routes
router.use(ValidationMiddleware.rateLimiter(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// GET /api/accounts - Get all accounts
router.get('/', 
  ValidationMiddleware.validateQueryParams,
  AccountController.getAllAccounts
);

// GET /api/accounts/summary - Get balance summary by currency
router.get('/summary', 
  AccountController.getBalanceSummary
);

// GET /api/accounts/exchange-rates - Get current exchange rates
router.get('/exchange-rates', 
  AccountController.getExchangeRates
);

// GET /api/accounts/currency/:currency - Get accounts by currency
router.get('/currency/:currency', 
  ValidationMiddleware.validateQueryParams,
  AccountController.getAccountsByCurrency
);

// GET /api/accounts/:name - Get specific account by name
router.get('/:name', 
  AccountController.getAccountByName
);

// POST /api/accounts - Create new account
router.post('/', 
  ValidationMiddleware.validateCreateAccount,
  AccountController.createAccount
);

// PUT /api/accounts/:name/balance - Update account balance
router.put('/:name/balance', 
  ValidationMiddleware.validateUpdateBalance,
  AccountController.updateAccountBalance
);

// DELETE /api/accounts/:name - Delete account
router.delete('/:name', 
  AccountController.deleteAccount
);

module.exports = router;
