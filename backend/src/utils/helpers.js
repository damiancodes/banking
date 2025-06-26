// Exchange rates (static for demo purposes)
const EXCHANGE_RATES = {
  'USD_TO_KES': 150.0,
  'USD_TO_NGN': 800.0,
  'KES_TO_USD': 1 / 150.0,
  'KES_TO_NGN': 5.33,
  'NGN_TO_USD': 1 / 800.0,
  'NGN_TO_KES': 1 / 5.33
};

class CurrencyConverter {
  static getExchangeRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    const rateKey = `${fromCurrency}_TO_${toCurrency}`;
    return EXCHANGE_RATES[rateKey] || 1.0;
  }

  static convertAmount(amount, fromCurrency, toCurrency) {
    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    return parseFloat(amount) * rate;
  }

  static getAllRates() {
    return EXCHANGE_RATES;
  }

  static formatCurrency(amount, currency) {
    const symbols = {
      'USD': '$',
      'KES': 'KSh',
      'NGN': '₦'
    };

    const symbol = symbols[currency] || currency;
    const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `${symbol} ${formattedAmount}`;
  }
}

class ValidationHelpers {
  static validateCurrency(currency) {
    const validCurrencies = ['KES', 'USD', 'NGN'];
    return validCurrencies.includes(currency);
  }

  static validateAmount(amount) {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  }

  static validateAccountName(name) {
    return typeof name === 'string' && name.trim().length > 0;
  }

  static sanitizeString(str) {
    return str ? str.trim().replace(/[<>]/g, '') : '';
  }

  static validateTransferData(data) {
    const errors = [];

    if (!this.validateAccountName(data.from_account)) {
      errors.push('Invalid source account name');
    }

    if (!this.validateAccountName(data.to_account)) {
      errors.push('Invalid destination account name');
    }

    if (!this.validateAmount(data.amount)) {
      errors.push('Invalid amount');
    }

    if (data.from_account === data.to_account) {
      errors.push('Source and destination accounts cannot be the same');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

class ResponseHelpers {
  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(message, statusCode = 500, details = null) {
    return {
      success: false,
      error: {
        message,
        statusCode,
        details,
        timestamp: new Date().toISOString()
      }
    };
  }

  static paginate(data, page = 1, limit = 10, totalCount = null) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedData = data.slice(startIndex, endIndex);
    const total = totalCount || data.length;

    return {
      success: true,
      data: paginatedData,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: endIndex < total,
        hasPrevPage: pageNum > 1
      },
      timestamp: new Date().toISOString()
    };
  }
}

class DateHelpers {
  static formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
  }

  static formatDateTime(date) {
    return new Date(date).toISOString();
  }

  static getDateRange(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return {
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate)
    };
  }
}

module.exports = {
  CurrencyConverter,
  ValidationHelpers,
  ResponseHelpers,
  DateHelpers
};
