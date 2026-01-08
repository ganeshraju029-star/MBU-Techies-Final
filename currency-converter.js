/**
 * PulseRelief Currency Converter
 * Handles automatic currency conversion and exchange rates
 */

const CurrencyConverter = {
    // Base currency (all conversions from USD)
    baseCurrency: 'USD',
    
    // Supported currencies with symbols and names
    currencies: {
        'USD': { symbol: '$', name: 'US Dollar', country: 'United States', flag: '🇺🇸' },
        'EUR': { symbol: '€', name: 'Euro', country: 'Eurozone', flag: '🇪🇺' },
        'GBP': { symbol: '£', name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧' },
        'INR': { symbol: '₹', name: 'Indian Rupee', country: 'India', flag: '🇮🇳' },
        'JPY': { symbol: '¥', name: 'Japanese Yen', country: 'Japan', flag: '🇯🇵' },
        'CAD': { symbol: 'C$', name: 'Canadian Dollar', country: 'Canada', flag: '🇨🇦' },
        'AUD': { symbol: 'A$', name: 'Australian Dollar', country: 'Australia', flag: '🇦🇺' },
        'CHF': { symbol: 'CHF', name: 'Swiss Franc', country: 'Switzerland', flag: '🇨🇭' },
        'CNY': { symbol: '¥', name: 'Chinese Yuan', country: 'China', flag: '🇨🇳' },
        'SGD': { symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore', flag: '🇸🇬' },
        'HKD': { symbol: 'HK$', name: 'Hong Kong Dollar', country: 'Hong Kong', flag: '🇭🇰' },
        'MXN': { symbol: '$', name: 'Mexican Peso', country: 'Mexico', flag: '🇲🇽' },
        'BRL': { symbol: 'R$', name: 'Brazilian Real', country: 'Brazil', flag: '🇧🇷' },
        'ZAR': { symbol: 'R', name: 'South African Rand', country: 'South Africa', flag: '🇿🇦' },
        'NGN': { symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria', flag: '🇳🇬' },
        'KES': { symbol: 'KSh', name: 'Kenyan Shilling', country: 'Kenya', flag: '🇰🇪' },
        'PHP': { symbol: '₱', name: 'Philippine Peso', country: 'Philippines', flag: '🇵🇭' },
        'THB': { symbol: '฿', name: 'Thai Baht', country: 'Thailand', flag: '🇹🇭' },
        'VND': { symbol: '₫', name: 'Vietnamese Dong', country: 'Vietnam', flag: '🇻🇳' },
        'PKR': { symbol: '₨', name: 'Pakistani Rupee', country: 'Pakistan', flag: '🇵🇰' },
    },

    // Mock exchange rates (in production, fetch from API)
    // Using rates as of Jan 2026 (approximations)
    exchangeRates: {
        'USD': 1,
        'EUR': 0.92,
        'GBP': 0.79,
        'INR': 83.15,
        'JPY': 145.50,
        'CAD': 1.35,
        'AUD': 1.50,
        'CHF': 0.88,
        'CNY': 7.10,
        'SGD': 1.34,
        'HKD': 7.78,
        'MXN': 17.05,
        'BRL': 4.98,
        'ZAR': 18.50,
        'NGN': 770.00,
        'KES': 130.00,
        'PHP': 55.80,
        'THB': 34.50,
        'VND': 24500,
        'PKR': 278.00,
    },

    // User's preferred currency
    userCurrency: localStorage.getItem('userCurrency') || 'USD',

    /**
     * Detect user's location based on timezone/browser settings
     */
    detectUserCurrency: function() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const currencyMap = {
                'Europe/London': 'GBP',
                'Europe/Paris': 'EUR',
                'Europe/Berlin': 'EUR',
                'Asia/Kolkata': 'INR',
                'Asia/Tokyo': 'JPY',
                'America/Toronto': 'CAD',
                'Australia/Sydney': 'AUD',
                'Europe/Zurich': 'CHF',
                'Asia/Shanghai': 'CNY',
                'Asia/Singapore': 'SGD',
                'Asia/Hong_Kong': 'HKD',
                'America/Mexico_City': 'MXN',
                'America/Sao_Paulo': 'BRL',
                'Africa/Johannesburg': 'ZAR',
                'Africa/Lagos': 'NGN',
                'Africa/Nairobi': 'KES',
                'Asia/Manila': 'PHP',
                'Asia/Bangkok': 'THB',
                'Asia/Ho_Chi_Minh': 'VND',
                'Asia/Karachi': 'PKR',
            };

            return currencyMap[timezone] || 'USD';
        } catch (e) {
            return 'USD';
        }
    },

    /**
     * Initialize currency converter
     */
    init: function() {
        // Auto-detect user currency if not already set
        if (!localStorage.getItem('userCurrency')) {
            const detectedCurrency = this.detectUserCurrency();
            this.setUserCurrency(detectedCurrency);
        }
    },

    /**
     * Convert amount from USD to target currency
     */
    convert: function(amount, fromCurrency = 'USD', toCurrency = 'USD') {
        if (fromCurrency === toCurrency) return parseFloat(amount).toFixed(2);
        
        if (!this.exchangeRates[fromCurrency] || !this.exchangeRates[toCurrency]) {
            console.warn('Currency conversion not supported: ' + fromCurrency + ' to ' + toCurrency);
            return amount;
        }

        // Convert to USD first, then to target currency
        const amountInUSD = parseFloat(amount) / this.exchangeRates[fromCurrency];
        const convertedAmount = amountInUSD * this.exchangeRates[toCurrency];
        
        return convertedAmount.toFixed(2);
    },

    /**
     * Format currency display
     */
    format: function(amount, currency = this.userCurrency) {
        const currencyInfo = this.currencies[currency];
        if (!currencyInfo) return amount + ' ' + currency;

        // Different formatting for different currencies
        if (currency === 'JPY' || currency === 'VND' || currency === 'NGN') {
            // No decimal places for these currencies
            return currencyInfo.symbol + Math.round(parseFloat(amount)).toLocaleString();
        } else if (currency === 'INR' || currency === 'PKR') {
            // Indian style formatting
            return currencyInfo.symbol + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            // Standard formatting
            return currencyInfo.symbol + parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    },

    /**
     * Get all currency options for dropdown
     */
    getCurrencyOptions: function() {
        return Object.keys(this.currencies).sort();
    },

    /**
     * Set user's preferred currency
     */
    setUserCurrency: function(currency) {
        if (this.currencies[currency]) {
            this.userCurrency = currency;
            localStorage.setItem('userCurrency', currency);
            // Trigger custom event
            window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency } }));
        }
    },

    /**
     * Get currency details
     */
    getCurrencyInfo: function(currency) {
        return this.currencies[currency] || null;
    },

    /**
     * Fetch live exchange rates from API
     * In production, use a real API like Open Exchange Rates, Fixer.io, or xe.com
     */
    updateExchangeRates: async function() {
        try {
            // Example using open-exchange-rates API
            // Replace with your actual API key
            const apiKey = 'PASTE_YOUR_API_KEY_HERE';
            const response = await fetch(
                'https://openexchangerates.org/api/latest.json?app_id=' + apiKey + '&base=USD'
            );
            
            if (response.ok) {
                const data = await response.json();
                // Update only supported currencies
                Object.keys(data.rates).forEach(currency => {
                    if (this.exchangeRates.hasOwnProperty(currency)) {
                        this.exchangeRates[currency] = data.rates[currency];
                    }
                });
                console.log('Exchange rates updated successfully');
            }
        } catch (error) {
            console.warn('Could not fetch live exchange rates, using cached rates:', error);
        }
    },

    /**
     * Get currency dropdown HTML
     */
    getCurrencyDropdownHTML: function() {
        const options = this.getCurrencyOptions();
        let html = '';
        
        options.forEach(currency => {
            const info = this.currencies[currency];
            const selected = currency === this.userCurrency ? 'selected' : '';
            html += '<option value="' + currency + '" ' + selected + '>' + info.flag + ' ' + currency + ' - ' + info.name + '</option>';
        });
        
        return html;
    },

    /**
     * Get quick currency buttons
     */
    getQuickCurrencyButtonsHTML: function() {
        const popularCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'BRL'];
        let html = '<div class="quick-currencies">';
        
        const self = this;
        popularCurrencies.forEach(currency => {
            const info = self.currencies[currency];
            const active = currency === self.userCurrency ? 'active' : '';
            html += '<button class="currency-btn ' + active + '" data-currency="' + currency + '" title="' + info.name + '">' +
                    '<span class="currency-flag">' + info.flag + '</span>' +
                    '<span class="currency-code">' + currency + '</span>' +
                    '</button>';
        });
        
        html += '</div>';
        return html;
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        CurrencyConverter.init();
    });
} else {
    CurrencyConverter.init();
}
