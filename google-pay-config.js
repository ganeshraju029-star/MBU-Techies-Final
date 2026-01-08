// Google Pay API Integration
// Documentation: https://developers.google.com/pay/api

/**
 * Initialize Google Pay
 * Call this once when the page loads
 */
export async function initializeGooglePay() {
    try {
        if (!window.google || !window.google.payments) {
            console.error('Google Pay library not loaded');
            return false;
        }

        const paymentsClient = new google.payments.api.PaymentsClient({
            environment: 'TEST' // Change to 'PRODUCTION' for live
        });

        // Check if user can pay with Google Pay
        const isReadyToPay = await paymentsClient.isReadyToPay({
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                    allowedCardNetworks: ['MASTERCARD', 'VISA'],
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
                }
            }],
            allowedPaymentMethod: {
                type: 'TOKENIZED_CARD',
                parameters: {
                    tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: {
                            gateway: 'example',
                            gatewayMerchantId: 'exampleGatewayMerchantId'
                        }
                    }
                }
            }
        });

        if (isReadyToPay.result) {
            console.log('Device is ready for Google Pay');
            return true;
        } else {
            console.log('Device is not ready for Google Pay');
            return false;
        }
    } catch (error) {
        console.error('Google Pay initialization error:', error);
        return false;
    }
}

/**
 * Create Google Pay button
 * @param {string} containerId - ID of the container for the button
 * @param {function} onPaymentSuccess - Callback on successful payment
 */
export async function createGooglePayButton(containerId, onPaymentSuccess) {
    try {
        const paymentsClient = new google.payments.api.PaymentsClient({
            environment: 'TEST'
        });

        const button = paymentsClient.createButton({
            onClick: () => requestGooglePayPayment(paymentsClient, onPaymentSuccess),
            allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                    allowedCardNetworks: ['MASTERCARD', 'VISA'],
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
                }
            }]
        });

        document.getElementById(containerId).appendChild(button);
    } catch (error) {
        console.error('Error creating Google Pay button:', error);
    }
}

/**
 * Request payment from Google Pay
 * @param {object} paymentsClient - Google Payments client
 * @param {function} onPaymentSuccess - Callback on success
 */
async function requestGooglePayPayment(paymentsClient, onPaymentSuccess) {
    const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
            type: 'CARD',
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    gateway: 'stripe', // Use your payment gateway
                    'stripe:version': '2018-10-31',
                    'stripe:publishableKey': 'pk_test_xxxxxxxxxxxxx'
                }
            },
            parameters: {
                allowedCardNetworks: ['VISA', 'MASTERCARD'],
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                billingAddressRequired: true,
                billingAddressParameters: {
                    format: 'FULL'
                }
            }
        }],
        transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: '25.00',
            currency: 'USD'
        },
        merchantInfo: {
            merchantId: '12345678901234567890',
            merchantName: 'PulseRelief'
        },
        shippingAddressRequired: false
    };

    try {
        const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
        
        // Handle successful payment
        const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
        
        if (onPaymentSuccess) {
            onPaymentSuccess({
                success: true,
                paymentToken: paymentToken,
                paymentData: paymentData
            });
        }

        return { success: true, paymentData: paymentData };
    } catch (error) {
        console.error('Google Pay error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Process Google Pay token with backend
 * @param {string} token - Payment token from Google Pay
 * @param {number} amount - Payment amount
 * @param {string} currency - Currency code
 */
export async function processGooglePayPayment(token, amount, currency = 'USD') {
    try {
        const response = await fetch('https://us-central1-pulserelief-xxxxx.cloudfunctions.net/processPayment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                paymentToken: token,
                amount: amount,
                currency: currency,
                paymentMethod: 'google_pay',
                timestamp: new Date().toISOString()
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Payment processing error:', error);
        return { success: false, error: error.message };
    }
}

export { initializeGooglePay, createGooglePayButton, requestGooglePayPayment };
