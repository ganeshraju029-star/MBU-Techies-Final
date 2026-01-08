// Dialogflow Integration for Enhanced Support Chatbot
// Documentation: https://cloud.google.com/dialogflow/docs

/**
 * Initialize Dialogflow Messenger
 * This integrates the Dialogflow Messenger widget into the page
 */
export function initializeDialogflowMessenger() {
    try {
        // Create and inject Dialogflow Messenger script
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js';
        script.async = true;
        document.head.appendChild(script);

        // Configure Dialogflow Messenger
        setTimeout(() => {
            if (window.df) {
                window.df.config({
                    projectId: 'pulserelief-xxxxx',
                    agentId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                    languageCode: 'en',
                    appearOn: 'load'
                });
            }
        }, 1000);

        return true;
    } catch (error) {
        console.error('Dialogflow initialization error:', error);
        return false;
    }
}

/**
 * Create Dialogflow Session Client
 * For backend server-side calls
 */
export function createDialogflowSessionClient() {
    const projectId = 'pulserelief-xxxxx';
    const sessionId = 'session-' + Date.now();
    
    return {
        projectId: projectId,
        sessionId: sessionId,
        detectIntentUrl: `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`
    };
}

/**
 * Send message to Dialogflow
 * @param {string} message - User message
 * @param {string} sessionId - Session ID
 * @param {string} projectId - GCP Project ID
 */
export async function sendMessageToDialogflow(message, sessionId, projectId) {
    try {
        const response = await fetch('https://us-central1-pulserelief-xxxxx.cloudfunctions.net/dialogflowWebhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userMessage: message,
                sessionId: sessionId,
                projectId: projectId,
                timestamp: new Date().toISOString()
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Dialogflow message error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Handle Dialogflow fulfillment for custom actions
 * This is called from Dialogflow webhook fulfillment
 */
export async function handleDialogflowFulfillment(intent, parameters) {
    try {
        switch (intent) {
            case 'donate_now':
                return handleDonateIntent(parameters);
            
            case 'check_case_status':
                return handleCaseStatusIntent(parameters);
            
            case 'get_help':
                return handleGetHelpIntent(parameters);
            
            case 'verify_donation':
                return handleVerifyDonationIntent(parameters);
            
            case 'fraud_check':
                return handleFraudCheckIntent(parameters);
            
            default:
                return { response: 'I can help you with donations, case status, verification, and more.' };
        }
    } catch (error) {
        console.error('Fulfillment error:', error);
        return { response: 'Sorry, I encountered an error. Please try again.' };
    }
}

/**
 * Handle "donate_now" intent
 */
async function handleDonateIntent(parameters) {
    const amount = parameters.amount || '25';
    return {
        response: `You want to donate $${amount}. I can help you complete this donation securely. What payment method would you prefer?`,
        action: 'open_donation_modal',
        amount: amount
    };
}

/**
 * Handle "check_case_status" intent
 */
async function handleCaseStatusIntent(parameters) {
    const caseId = parameters.caseId;
    
    if (!caseId) {
        return {
            response: 'Which case would you like to check on? Please provide the case ID or case name.'
        };
    }

    try {
        // Call backend to get case status
        const response = await fetch('https://us-central1-pulserelief-xxxxx.cloudfunctions.net/getCaseStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caseId: caseId })
        });

        const caseData = await response.json();
        
        if (caseData.success) {
            const fundingPercentage = (caseData.case.currentAmount / caseData.case.targetAmount * 100).toFixed(1);
            return {
                response: `Case: ${caseData.case.title}\nStatus: ${caseData.case.status}\nFunding: $${caseData.case.currentAmount} of $${caseData.case.targetAmount} (${fundingPercentage}%)\nLocation: ${caseData.case.location}`,
                caseData: caseData.case
            };
        }
    } catch (error) {
        console.error('Case status error:', error);
    }

    return {
        response: 'I couldn\'t find that case. Please provide a valid case ID.'
    };
}

/**
 * Handle "get_help" intent
 */
async function handleGetHelpIntent(parameters) {
    const helpType = parameters.helpType || 'general';
    
    const helpResponses = {
        'donation': 'To make a donation, click the "Support this emergency" button on any case, select your amount, and choose your payment method. All payments are encrypted and secure.',
        'account': 'To create an account, click the dashboard icon (👤) in the top right and sign up. You can choose to be a regular user or staff member.',
        'cases': 'Emergency cases are displayed on the main page. You can filter by category (Medical, Education, Disaster Relief, Startups) and track funding progress in real-time.',
        'verification': 'Cases are verified through partner hospitals, NGOs, and schools. Each case shows verification badges and a timeline of all verification steps.',
        'general': 'I can help you with donations, account setup, case information, verification details, and more. What would you like to know?'
    };

    return {
        response: helpResponses[helpType] || helpResponses['general']
    };
}

/**
 * Handle "verify_donation" intent
 */
async function handleVerifyDonationIntent(parameters) {
    const donationId = parameters.donationId;
    
    if (!donationId) {
        return {
            response: 'Please provide your donation ID to verify the status.'
        };
    }

    try {
        const response = await fetch('https://us-central1-pulserelief-xxxxx.cloudfunctions.net/verifyDonation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ donationId: donationId })
        });

        const donation = await response.json();
        
        if (donation.success) {
            return {
                response: `Donation verified!
Amount: $${donation.donation.amount}
Status: ${donation.donation.status}
Payment Method: ${donation.donation.paymentMethod}
Date: ${new Date(donation.donation.createdAt).toLocaleDateString()}`,
                donationData: donation.donation
            };
        }
    } catch (error) {
        console.error('Verification error:', error);
    }

    return {
        response: 'I couldn\'t verify that donation. Please check the ID and try again.'
    };
}

/**
 * Handle "fraud_check" intent (for staff)
 */
async function handleFraudCheckIntent(parameters) {
    const donationAmount = parameters.amount;
    const paymentMethod = parameters.paymentMethod;
    
    if (!donationAmount) {
        return {
            response: 'Please provide the donation amount to check for fraud.'
        };
    }

    try {
        const response = await fetch('https://us-central1-pulserelief-xxxxx.cloudfunctions.net/fraudCheck', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: donationAmount,
                paymentMethod: paymentMethod,
                timestamp: new Date().toISOString()
            })
        });

        const result = await response.json();
        
        return {
            response: result.isSuspicious 
                ? `⚠️ This transaction appears suspicious (Risk Score: ${result.riskScore}). Recommend manual review.`
                : `✅ Transaction looks legitimate (Risk Score: ${result.riskScore}). Safe to process.`,
            riskData: result
        };
    } catch (error) {
        console.error('Fraud check error:', error);
    }

    return {
        response: 'Error performing fraud check. Please try again.'
    };
}

/**
 * Format Dialogflow response for UI
 * @param {object} response - Dialogflow API response
 */
export function formatDialogflowResponse(response) {
    try {
        if (response.queryResult && response.queryResult.fulfillmentText) {
            return {
                text: response.queryResult.fulfillmentText,
                intent: response.queryResult.intent.displayName,
                parameters: response.queryResult.parameters,
                fulfillmentMessages: response.queryResult.fulfillmentMessages
            };
        }
        return { text: response.fulfillmentText || 'Unable to process your request.' };
    } catch (error) {
        console.error('Response formatting error:', error);
        return { text: 'An error occurred processing the response.' };
    }
}

/**
 * Enhanced chatbot with Dialogflow context
 */
export class DialogflowChatbot {
    constructor(projectId, sessionId) {
        this.projectId = projectId || 'pulserelief-xxxxx';
        this.sessionId = sessionId || 'session-' + Date.now();
        this.conversationHistory = [];
    }

    async sendMessage(userMessage) {
        try {
            const response = await sendMessageToDialogflow(
                userMessage,
                this.sessionId,
                this.projectId
            );

            if (response.success) {
                this.conversationHistory.push({
                    user: userMessage,
                    bot: response.fulfillmentText,
                    timestamp: new Date().toISOString()
                });

                return formatDialogflowResponse(response);
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            return {
                text: 'Sorry, I encountered an error. Please try again.',
                error: error.message
            };
        }
    }

    getConversationHistory() {
        return this.conversationHistory;
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}

export { initializeDialogflowMessenger };
