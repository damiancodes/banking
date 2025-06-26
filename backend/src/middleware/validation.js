const { ValidationHelpers, ResponseHelpers } = require('../utils/helpers');

class ValidationMiddleware {
  static validateCreateAccount(req, res, next) {
    const { name, currency, balance } = req.body;
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Account name is required and must be a non-empty string');
    }

    if (!currency || !ValidationHelpers.validateCurrency(currency)) {
      errors.push('Currency is required and must be one of: KES, USD, NGN');
    }

    if (balance !== undefined && (isNaN(parseFloat(balance)) || parseFloat(balance) < 0)) {
      errors.push('Balance must be a positive number');
    }

    if (errors.length > 0) {
      return res.status(400).json(ResponseHelpers.error('Validation failed', 400, errors));
    }

    next();
  }

  static validateCreateTransaction(req, res, next) {
    const { from_account, to_account, amount } = req.body;
    const errors = [];

    if (!from_account || typeof from_account !== 'string' || from_account.trim().length === 0) {
      errors.push('Source account is required and must be a non-empty string');
    }

    if (!to_account || typeof to_account !== 'string' || to_account.trim().length === 0) {
      errors.push('Destination account is required and must be a non-empty string');
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errors.push('Amount is required and must be a positive number');
    }

    if (from_account && to_account && from_account.trim() === to_account.trim()) {
      errors.push('Source and destination accounts cannot be the same');
    }

    if (errors.length > 0) {
      return res.status(400).json(ResponseHelpers.error('Validation failed', 400, errors));
    }

    next();
  }

  static validateUpdateBalance(req, res, next) {
    const { balance } = req.body;
    const errors = [];

    if (balance === undefined || isNaN(parseFloat(balance))) {
      errors.push('Balance is required and must be a valid number');
    }

    if (parseFloat(balance) < 0) {
      errors.push('Balance cannot be negative');
    }

    if (errors.length > 0) {
      return res.status(400).json(ResponseHelpers.error('Validation failed', 400, errors));
    }

    next();
  }

  static validateQueryParams(req, res, next) {
    const { currency, limit, page } = req.query;
    const errors = [];

    if (currency && !ValidationHelpers.validateCurrency(currency)) {
      errors.push('Currency must be one of: KES, USD, NGN');
    }

    if (limit && (isNaN(parseInt(limit)) || parseInt(limit) <= 0)) {
      errors.push('Limit must be a positive integer');
    }

    if (page && (isNaN(parseInt(page)) || parseInt(page) <= 0)) {
      errors.push('Page must be a positive integer');
    }

    if (errors.length > 0) {
      return res.status(400).json(ResponseHelpers.error('Invalid query parameters', 400, errors));
    }

    next();
  }

  static validateDateRange(req, res, next) {
    const { start_date, end_date, days } = req.query;
    const errors = [];

    if (!days && (!start_date || !end_date)) {
      errors.push('Either provide days parameter or both start_date and end_date');
    }

    if (days && (isNaN(parseInt(days)) || parseInt(days) <= 0)) {
      errors.push('Days must be a positive integer');
    }

    if (start_date && !Date.parse(start_date)) {
      errors.push('start_date must be a valid date');
    }

    if (end_date && !Date.parse(end_date)) {
      errors.push('end_date must be a valid date');
    }

    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      errors.push('start_date cannot be later than end_date');
    }

    if (errors.length > 0) {
      return res.status(400).json(ResponseHelpers.error('Invalid date parameters', 400, errors));
    }

    next();
  }

  static rateLimiter(windowMs = 15 * 60 * 1000, max = 100) {
    const requests = new Map();

    return (req, res, next) => {
      const clientId = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old requests
      if (requests.has(clientId)) {
        requests.set(clientId, requests.get(clientId).filter(time => time > windowStart));
      } else {
        requests.set(clientId, []);
      }

      const clientRequests = requests.get(clientId);

      if (clientRequests.length >= max) {
        return res.status(429).json(ResponseHelpers.error(
          'Too many requests. Please try again later.', 
          429
        ));
      }

      clientRequests.push(now);
      next();
    };
  }
}

module.exports = ValidationMiddleware;
