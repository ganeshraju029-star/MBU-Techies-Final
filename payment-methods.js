// Payment Methods Integration
// Handles Google Pay, UPI, QR Code, and Card payments

/**
 * Google Pay Integration
 */
export const GooglePayConfig = {
    environment: 'TEST', // Change to 'PRODUCTION' for live
    merchantId: '12345678901234567890',
    merchantName: 'PulseRelief',
    
    initializeGooglePay: async function() {
        try {
            if (!window.google || !window.google.payments) {
                console.error('Google Pay not loaded');
                return false;
            }

            const paymentsClient = new google.payments.api.PaymentsClient({
                environment: this.environment
            });

            const isReadyToPay = await paymentsClient.isReadyToPay({
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [{
                    type: 'CARD',
                    parameters: {
                        allowedCardNetworks: ['VISA', 'MASTERCARD'],
                        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
                    }
                }]
            });

            if (isReadyToPay.result) {
                console.log('✅ Google Pay available');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Google Pay init error:', error);
            return false;
        }
    },

    processPayment: async function(amount) {
        try {
            const paymentsClient = new google.payments.api.PaymentsClient({
                environment: this.environment
            });

            const paymentDataRequest = {
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [{
                    type: 'CARD',
                    tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: {
                            gateway: 'stripe',
                            'stripe:version': '2018-10-31',
                            'stripe:publishableKey': 'pk_test_xxxxx'
                        }
                    },
                    parameters: {
                        allowedCardNetworks: ['VISA', 'MASTERCARD'],
                        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
                    }
                }],
                transactionInfo: {
                    totalPriceStatus: 'FINAL',
                    totalPrice: amount.toString(),
                    currency: 'USD'
                },
                merchantInfo: {
                    merchantId: this.merchantId,
                    merchantName: this.merchantName
                }
            };

            const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
            return {
                success: true,
                method: 'google_pay',
                token: paymentData.paymentMethodData.tokenizationData.token,
                data: paymentData
            };
        } catch (error) {
            console.error('Google Pay error:', error);
            return { success: false, error: error.message };
        }
    }
};

/**
 * UPI Integration
 * Unified Payments Interface for India
 */
export const UPIConfig = {
    // Common UPI providers
    providers: {
        'googlepay': 'ok',
        'phonepe': 'ybl',
        'paytm': 'paytm',
        'bhim': 'upi',
        'whatsapp': 'upibank'
    },

    generateUPILink: function(upiId, amount, transactionId = null) {
        if (!upiId.includes('@')) {
            return null;
        }

        const txnId = transactionId || 'TXN' + Date.now();
        const upiLink = `upi://pay?pa=${upiId}&pn=PulseRelief&am=${amount}&tn=Emergency%20Donation&tr=${txnId}`;
        
        return upiLink;
    },

    openUPIApp: function(upiLink) {
        try {
            // Attempt to open UPI app
            window.location.href = upiLink;
            
            // Fallback after 2 seconds
            setTimeout(() => {
                console.log('UPI app may not be available');
            }, 2000);

            return true;
        } catch (error) {
            console.error('UPI open error:', error);
            return false;
        }
    },

    validateUPI: function(upiId) {
        // Basic UPI validation
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
        return upiRegex.test(upiId);
    },

    getUPIProvider: function(upiId) {
        const parts = upiId.split('@');
        if (parts.length === 2) {
            return parts[1].toLowerCase();
        }
        return null;
    }
};

/**
 * QR Code Payment Integration
 */
export const QRCodeConfig = {
    generateQRForUPI: function(upiId, amount, transactionId = null) {
        try {
            if (!window.QRious) {
                console.error('QRious library not loaded');
                return false;
            }

            const upiLink = UPIConfig.generateUPILink(upiId, amount, transactionId);
            if (!upiLink) {
                console.error('Invalid UPI link');
                return false;
            }

            new QRious({
                element: document.getElementById('qrcode'),
                value: upiLink,
                size: 200,
                level: 'H',
                mime: 'image/png'
            });

            return true;
        } catch (error) {
            console.error('QR generation error:', error);
            return false;
        }
    },

    downloadQRCode: function(filename = 'donation-qr.png') {
        try {
            const canvas = document.querySelector('#qrcode canvas');
            if (!canvas) {
                console.error('QR code canvas not found');
                return false;
            }

            const link = document.createElement('a');
            link.href = canvas.toDataURL();
            link.download = filename;
            link.click();

            return true;
        } catch (error) {
            console.error('Download error:', error);
            return false;
        }
    },

    // Dynamic QR URL for static donations
    generateStaticQRURL: function(amount, upiId = 'pulserelief@okhdfcbank') {
        const encodedUPI = encodeURIComponent(`upi://pay?pa=${upiId}&pn=PulseRelief&am=${amount}&tn=Emergency%20Donation`);
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUPI}`;
    }
};

/**
 * Credit/Debit Card Integration
 */
export const CardConfig = {
    formatCardNumber: function(value) {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length > 0 ? parts.join(' ') : value;
    },

    formatExpiry: function(value) {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.slice(0, 2) + '/' + v.slice(2, 4);
        }
        return v;
    },

    validateCardNumber: function(cardNumber) {
        // Luhn algorithm
        const digits = cardNumber.replace(/\D/g, '');
        if (digits.length < 13 || digits.length > 19) return false;

        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i], 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    },

    validateExpiry: function(expiry) {
        const [month, year] = expiry.split('/');
        if (!month || !year) return false;

        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        const expYear = parseInt(year, 10);
        const expMonth = parseInt(month, 10);

        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;
        if (expMonth < 1 || expMonth > 12) return false;

        return true;
    },

    validateCVV: function(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }
};

/**
 * Unified Payment Processor
 */
export class PaymentProcessor {
    constructor() {
        this.currentMethod = null;
        this.transactionId = 'TXN' + Date.now();
    }

    async processPayment(method, amount, additionalData = {}) {
        try {
            this.currentMethod = method;

            switch (method) {
                case 'google_pay':
                    return await this.processGooglePay(amount);
                
                case 'upi':
                    return this.processUPI(amount, additionalData.upiId);
                
                case 'qr_code':
                    return this.processQRCode(amount, additionalData.upiId);
                
                case 'credit_card':
                case 'debit_card':
                    return this.processCard(amount, additionalData);
                
                default:
                    return { success: false, error: 'Unknown payment method' };
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            return { success: false, error: error.message };
        }
    }

    async processGooglePay(amount) {
        const result = await GooglePayConfig.processPayment(amount);
        if (result.success) {
            return {
                success: true,
                method: 'google_pay',
                amount: amount,
                transactionId: this.transactionId,
                token: result.token,
                timestamp: new Date().toISOString()
            };
        }
        return result;
    }

    processUPI(amount, upiId) {
        if (!UPIConfig.validateUPI(upiId)) {
            return { success: false, error: 'Invalid UPI ID' };
        }

        const upiLink = UPIConfig.generateUPILink(upiId, amount, this.transactionId);
        UPIConfig.openUPIApp(upiLink);

        return {
            success: true,
            method: 'upi',
            amount: amount,
            upiId: upiId,
            transactionId: this.transactionId,
            link: upiLink,
            timestamp: new Date().toISOString()
        };
    }

    processQRCode(amount, upiId = 'pulserelief@okhdfcbank') {
        if (QRCodeConfig.generateQRForUPI(upiId, amount, this.transactionId)) {
            return {
                success: true,
                method: 'qr_code',
                amount: amount,
                transactionId: this.transactionId,
                timestamp: new Date().toISOString()
            };
        }
        return { success: false, error: 'Failed to generate QR code' };
    }

    processCard(amount, cardData) {
        // Validate card details
        if (!CardConfig.validateCardNumber(cardData.cardNumber)) {
            return { success: false, error: 'Invalid card number' };
        }

        if (!CardConfig.validateExpiry(cardData.cardExpiry)) {
            return { success: false, error: 'Invalid expiry date' };
        }

        if (!CardConfig.validateCVV(cardData.cardCVV)) {
            return { success: false, error: 'Invalid CVV' };
        }

        return {
            success: true,
            method: cardData.cardType || 'card',
            amount: amount,
            transactionId: this.transactionId,
            last4: cardData.cardNumber.slice(-4),
            timestamp: new Date().toISOString()
        };
    }
}

export default {
    GooglePayConfig,
    UPIConfig,
    QRCodeConfig,
    CardConfig,
    PaymentProcessor
};
