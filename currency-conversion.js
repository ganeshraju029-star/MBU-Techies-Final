// Currency Conversion System
// Handles real-time exchange rate fetching and local currency display

const CURRENCY_SYMBOLS = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'SGD': 'S$',
    'BRL': 'R$',
    'MXN': '$',
    'ZAR': 'R',
    'NGN': '₦',
    'KES': 'KSh',
    'PHP': '₱',
    'THB': '฿',
    'VND': '₫',
    'PKR': 'Rs'
};

// Default exchange rates (fallback when API is unavailable)
const DEFAULT_RATES = {
    'USD': 1.0,
    'EUR': 0.92,
    'GBP': 0.79,
    'INR': 83.12,
    'JPY': 149.50,
    'CAD': 1.32,
    'AUD': 1.53,
    'CHF': 0.88,
    'CNY': 7.08,
    'SGD': 1.34,
    'BRL': 4.97,
    'MXN': 17.05,
    'ZAR': 18.75,
    'NGN': 774.50,
    'KES': 155.80,
    'PHP': 56.40,
    'THB': 35.90,
    'VND': 24500.00,
    'PKR': 278.50
};

class CurrencyConverter {
    constructor() {
        this.rates = { ...DEFAULT_RATES };
        this.baseCurrency = 'USD';
        this.lastUpdated = null;
        this.updateInterval = null;
    }

    // Initialize currency converter
    async init() {
        // Try to fetch real-time rates from API
        await this.fetchExchangeRates();
        
        // Update rates every 5 minutes
        this.startAutoUpdate();
    }

    // Fetch exchange rates from free API
    async fetchExchangeRates() {
        try {
            // Using exchangerate-api.com free tier
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.rates = data.rates;
                this.lastUpdated = new Date();
                console.log('Exchange rates updated:', this.rates);
                return true;
            }
        } catch (error) {
            console.log('Using default exchange rates:', error.message);
            // Fallback to default rates
            this.rates = { ...DEFAULT_RATES };
        }
        return false;
    }

    // Start automatic rate updates
    startAutoUpdate() {
        // Update every 5 minutes (300000 ms)
        this.updateInterval = setInterval(() => {
            this.fetchExchangeRates();
        }, 300000);
    }

    // Stop automatic updates
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    // Convert amount from one currency to another
    convert(amount, fromCurrency = 'USD', toCurrency = 'USD') {
        if (!this.rates[fromCurrency] || !this.rates[toCurrency]) {
            console.warn(`Currency ${fromCurrency} or ${toCurrency} not found`);
            return amount;
        }

        // Convert to USD first, then to target currency
        const amountInUSD = amount / this.rates[fromCurrency];
        const convertedAmount = amountInUSD * this.rates[toCurrency];

        return convertedAmount;
    }

    // Format amount with currency symbol and proper decimals
    format(amount, currency) {
        const symbol = CURRENCY_SYMBOLS[currency] || currency;
        
        // Determine decimal places based on currency
        let decimals = 2;
        if (['JPY', 'VND', 'KRW', 'TWD', 'PHP'].includes(currency)) {
            decimals = 0;
        }

        const formatted = amount.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });

        return `${symbol}${formatted}`;
    }

    // Get currency symbol
    getSymbol(currency) {
        return CURRENCY_SYMBOLS[currency] || currency;
    }

    // Update currency display on UI
    updateDisplay(baseAmount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return {
                display: this.format(baseAmount, fromCurrency),
                converted: baseAmount,
                showConversion: false
            };
        }

        const converted = this.convert(baseAmount, fromCurrency, toCurrency);
        return {
            display: this.format(converted, toCurrency),
            converted: converted,
            showConversion: true,
            originalDisplay: this.format(baseAmount, fromCurrency)
        };
    }

    // Get all available currencies
    getAvailableCurrencies() {
        return Object.keys(this.rates);
    }

    // Get last update time
    getLastUpdateTime() {
        if (!this.lastUpdated) return null;
        return this.lastUpdated.toLocaleString();
    }
}

// Create global instance
const currencyConverter = new CurrencyConverter();

// Initialize on module load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        currencyConverter.init();
    });
} else {
    currencyConverter.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = currencyConverter;
}
