// Google Cloud Functions for PulseRelief Backend
// Deploy to: https://console.cloud.google.com/functions
// These functions handle payment processing, analytics, and fraud detection

// ============================================================
// PAYMENT PROCESSING FUNCTION
// ============================================================

/**
 * Cloud Function: processPayment
 * Triggered by: HTTP POST request from frontend
 * Purpose: Process payments securely with Google Pay and store transaction data
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();

exports.processPayment = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    try {
        const { paymentToken, amount, currency, paymentMethod, userId } = req.body;

        // Validate input
        if (!paymentToken || !amount || amount < 5) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment data'
            });
        }

        // Process payment with Stripe
        const charge = await stripe.charges.create({
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            source: paymentToken,
            metadata: {
                userId: userId,
                paymentMethod: paymentMethod,
                timestamp: new Date().toISOString()
            }
        });

        // Store transaction in Firestore
        await admin.firestore().collection('transactions').add({
            userId: userId,
            amount: amount,
            currency: currency,
            paymentMethod: paymentMethod,
            stripeChargeId: charge.id,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            encryptedPaymentDetails: encryptPaymentDetails({
                last4: charge.source.last4,
                brand: charge.source.brand
            })
        });

        // Log to BigQuery
        await logToBigQuery({
            eventType: 'payment_processed',
            userId: userId,
            amount: amount,
            paymentMethod: paymentMethod,
            chargeId: charge.id,
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            chargeId: charge.id,
            message: 'Payment processed successfully'
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        
        // Log error to BigQuery for fraud analysis
        await logToBigQuery({
            eventType: 'payment_error',
            error: error.message,
            timestamp: new Date().toISOString()
        });

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// FRAUD DETECTION FUNCTION
// ============================================================

/**
 * Cloud Function: fraudCheck
 * Purpose: Detect potentially fraudulent transactions using BigQuery analysis
 */

exports.fraudCheck = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    try {
        const { amount, paymentMethod, userId } = req.body;

        const fraudRules = [
            { rule: 'amount_too_high', threshold: 50000, weight: 0.3 },
            { rule: 'rapid_transactions', threshold: 5, weight: 0.4 },
            { rule: 'unusual_country', threshold: true, weight: 0.2 },
            { rule: 'payment_method_mismatch', threshold: true, weight: 0.25 }
        ];

        let riskScore = 0;
        let fraudIndicators = [];

        // Rule 1: Check if amount is unusually high
        if (amount > fraudRules[0].threshold) {
            riskScore += fraudRules[0].weight;
            fraudIndicators.push('High transaction amount');
        }

        // Rule 2: Check for rapid transactions from same user
        const recentTransactions = await queryBigQuery(
            `SELECT COUNT(*) as count FROM \`project.dataset.transactions\` 
             WHERE userId = @userId AND timestamp > TIMESTAMP_SUB(NOW(), INTERVAL 1 HOUR)`,
            { userId: userId }
        );

        if (recentTransactions[0]?.count > fraudRules[1].threshold) {
            riskScore += fraudRules[1].weight;
            fraudIndicators.push('Rapid consecutive transactions');
        }

        // Rule 3: Check for unusual patterns in BigQuery
        const unusualPattern = await queryBigQuery(
            `SELECT SUM(amount) as total FROM \`project.dataset.transactions\`
             WHERE userId = @userId AND DATE(timestamp) = CURRENT_DATE()`,
            { userId: userId }
        );

        if (unusualPattern[0]?.total > 100000) {
            riskScore += fraudRules[2].weight;
            fraudIndicators.push('Unusually high daily total');
        }

        // Rule 4: Check payment method consistency
        const paymentMethods = await queryBigQuery(
            `SELECT DISTINCT paymentMethod FROM \`project.dataset.transactions\`
             WHERE userId = @userId LIMIT 5`,
            { userId: userId }
        );

        if (paymentMethods.length > 3) {
            riskScore += fraudRules[3].weight;
            fraudIndicators.push('Multiple payment methods');
        }

        const isSuspicious = riskScore > 0.6;

        return res.status(200).json({
            success: true,
            isSuspicious: isSuspicious,
            riskScore: riskScore.toFixed(2),
            fraudIndicators: fraudIndicators,
            recommendation: isSuspicious ? 'manual_review' : 'auto_approve'
        });

    } catch (error) {
        console.error('Fraud check error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// ANALYTICS TRACKING FUNCTION
// ============================================================

/**
 * Cloud Function: trackEvent
 * Purpose: Log events to BigQuery for analytics and reporting
 */

exports.trackEvent = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    try {
        const { eventName, eventData, timestamp } = req.body;

        // Insert event into BigQuery
        const bigquery = new (require('@google-cloud/bigquery'))();
        const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET);
        const table = dataset.table('events');

        await table.insert({
            eventName: eventName,
            eventData: JSON.stringify(eventData),
            timestamp: timestamp,
            insertedAt: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            message: 'Event tracked'
        });

    } catch (error) {
        console.error('Event tracking error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// DIALOGFLOW WEBHOOK FUNCTION
// ============================================================

/**
 * Cloud Function: dialogflowWebhook
 * Purpose: Handle Dialogflow fulfillment requests
 */

exports.dialogflowWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const request = req.body;
        const intent = request.queryResult.intent.displayName;
        const parameters = request.queryResult.parameters;

        let fulfillmentText = '';
        let action = '';

        switch (intent) {
            case 'donate_now':
                fulfillmentText = `Great! You want to donate $${parameters.amount}. Which payment method would you prefer?`;
                action = 'open_donation';
                break;

            case 'check_case_status':
                const caseId = parameters.caseId;
                const caseData = await admin.database()
                    .ref(`emergencyCases/${caseId}`).get();
                
                if (caseData.exists()) {
                    const c = caseData.val();
                    fulfillmentText = `Case: ${c.title}\nFunding: $${c.currentAmount} of $${c.targetAmount}`;
                }
                break;

            case 'fraud_check':
                const fraudResult = await checkFraudScore(parameters.amount);
                fulfillmentText = fraudResult.isSuspicious
                    ? '⚠️ This transaction needs manual review'
                    : '✅ Transaction approved';
                break;

            default:
                fulfillmentText = 'How can I help you today?';
        }

        return res.status(200).json({
            fulfillmentText: fulfillmentText,
            action: action,
            source: 'webhook'
        });

    } catch (error) {
        console.error('Dialogflow webhook error:', error);
        return res.status(500).json({
            fulfillmentText: 'Sorry, I encountered an error.'
        });
    }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Encrypt payment details before storing
 */
function encryptPaymentDetails(details) {
    // Use Cloud KMS for encryption in production
    const crypto = require('crypto');
    const key = process.env.ENCRYPTION_KEY;
    const cipher = crypto.createCipher('aes192', key);
    let encrypted = cipher.update(JSON.stringify(details), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

/**
 * Log events to BigQuery
 */
async function logToBigQuery(eventData) {
    try {
        const BigQuery = require('@google-cloud/bigquery');
        const bigquery = new BigQuery();
        const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET);
        const table = dataset.table('analytics_events');

        await table.insert({
            ...eventData,
            insertedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('BigQuery logging error:', error);
    }
}

/**
 * Query BigQuery for analysis
 */
async function queryBigQuery(query, params) {
    try {
        const BigQuery = require('@google-cloud/bigquery');
        const bigquery = new BigQuery();
        const [rows] = await bigquery.query({
            query: query,
            params: params
        });
        return rows;
    } catch (error) {
        console.error('BigQuery query error:', error);
        return [];
    }
}

/**
 * Check fraud score
 */
async function checkFraudScore(amount) {
    const fraudThreshold = 50000;
    return {
        isSuspicious: amount > fraudThreshold,
        riskScore: amount > fraudThreshold ? 0.85 : 0.15
    };
}
