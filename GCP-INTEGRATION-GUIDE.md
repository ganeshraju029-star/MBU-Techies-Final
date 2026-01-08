# GCP Integration Setup Guide for PulseRelief

## Overview
This guide walks through integrating Google Cloud Platform services into PulseRelief for production-ready backend, payments, analytics, and AI support.

---

## 1. Google Cloud Project Setup

### Prerequisites
- Google Cloud Account with billing enabled
- gcloud CLI installed and configured
- Node.js 14+ and npm

### Create Project
```bash
# Create a new GCP project
gcloud projects create pulserelief-xxxxx --name="PulseRelief"
gcloud config set project pulserelief-xxxxx

# Enable required APIs
gcloud services enable \
    firebasehosting.googleapis.com \
    cloudfunctions.googleapis.com \
    firebase.googleapis.com \
    bigquery.googleapis.com \
    dialogflow.googleapis.com \
    pay.googleapis.com
```

---

## 2. Firebase Setup (Authentication & Realtime Database)

### Create Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init
```

### Configure Firebase in Code
1. Go to Firebase Console → Project Settings
2. Copy your Firebase config
3. Update `firebase-config.js` with your credentials:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "pulserelief-xxxxx.firebaseapp.com",
    databaseURL: "https://pulserelief-xxxxx.firebaseio.com",
    projectId: "pulserelief-xxxxx",
    storageBucket: "pulserelief-xxxxx.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Enable Authentication Methods
```bash
firebase auth:enable --method email --project pulserelief-xxxxx
firebase auth:enable --method google --project pulserelief-xxxxx
firebase auth:enable --method phone --project pulserelief-xxxxx
```

### Configure Realtime Database Rules
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "verified": {
          ".write": "root.child('admins').child(auth.uid).exists()"
        }
      }
    },
    "donations": {
      "$donationId": {
        ".read": "root.child('users').child(auth.uid).exists()",
        ".write": "root.child('users').child(auth.uid).exists()"
      }
    },
    "emergencyCases": {
      ".read": true,
      "$caseId": {
        ".write": "root.child('users').child(auth.uid).child('userType').val() === 'staff'"
      }
    }
  }
}
```

---

## 3. Google Pay API Setup

### Get Google Pay Credentials
1. Go to Google Cloud Console → Credentials
2. Create a new API key or OAuth 2.0 credential
3. Update `google-pay-config.js`:
```javascript
'stripe:publishableKey': 'pk_live_xxxxx' // or pk_test for development
```

### Configure Stripe Integration
```bash
# Install Stripe CLI for testing
npm install stripe

# Create environment variable
export STRIPE_SECRET_KEY="sk_live_xxxxx"
```

### Update HTML
Add to `index.html` header:
```html
<!-- Google Pay -->
<script src="https://pay.google.com/gp/p/js/pay.js"></script>
```

---

## 4. BigQuery Setup (Analytics & Fraud Detection)

### Create BigQuery Dataset
```bash
bq mk --project_id=pulserelief-xxxxx \
      --dataset_description="PulseRelief Analytics" \
      analytics_dataset
```

### Create Analytics Tables
```bash
# Events Table
bq mk --table \
  analytics_dataset.events \
  eventName:STRING,eventData:JSON,timestamp:TIMESTAMP,insertedAt:TIMESTAMP

# Transactions Table
bq mk --table \
  analytics_dataset.transactions \
  userId:STRING,amount:NUMERIC,currency:STRING,\
  paymentMethod:STRING,stripeChargeId:STRING,\
  status:STRING,createdAt:TIMESTAMP

# Fraud Logs Table
bq mk --table \
  analytics_dataset.fraud_logs \
  transactionId:STRING,riskScore:NUMERIC,\
  fraudIndicators:STRING,timestamp:TIMESTAMP
```

### Create Fraud Detection Queries
```sql
-- High-value transactions
SELECT userId, amount, COUNT(*) as frequency
FROM `pulserelief-xxxxx.analytics_dataset.transactions`
WHERE amount > 50000
GROUP BY userId, amount;

-- Rapid transaction detection
SELECT userId, COUNT(*) as transaction_count
FROM `pulserelief-xxxxx.analytics_dataset.transactions`
WHERE timestamp > TIMESTAMP_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY userId
HAVING COUNT(*) > 5;

-- Daily spending limit check
SELECT userId, SUM(amount) as daily_total
FROM `pulserelief-xxxxx.analytics_dataset.transactions`
WHERE DATE(timestamp) = CURRENT_DATE()
GROUP BY userId
HAVING SUM(amount) > 100000;
```

---

## 5. Dialogflow Setup (AI Support Chatbot)

### Create Dialogflow Agent
1. Go to Dialogflow Console
2. Create new agent "PulseRelief Support"
3. Set Default Language to English
4. Copy Agent ID and Project ID

### Update Dialogflow Config
```javascript
// In dialogflow-config.js
window.df.config({
    projectId: 'pulserelief-xxxxx',
    agentId: 'your-agent-id-here',
    languageCode: 'en'
});
```

### Define Intents
Create the following intents in Dialogflow:

**Intent 1: donate_now**
- Training phrases: "I want to donate", "Make a donation", "Support a case"
- Parameters: amount (NUMBER)
- Response: "Great! You want to donate $XX. Which case would you like to support?"

**Intent 2: check_case_status**
- Training phrases: "Check case status", "How is case doing", "Case progress"
- Parameters: caseId (STRING)
- Webhook: Enable fulfillment

**Intent 3: fraud_check**
- Training phrases: "Check transaction", "Verify payment", "Fraud alert"
- Parameters: amount (NUMBER), paymentMethod (STRING)
- Webhook: Enable fulfillment

---

## 6. Deploy Cloud Functions

### Deploy Payment Processing
```bash
gcloud functions deploy processPayment \
    --runtime nodejs16 \
    --trigger-http \
    --allow-unauthenticated \
    --set-env-vars STRIPE_SECRET_KEY=sk_live_xxxxx

gcloud functions deploy fraudCheck \
    --runtime nodejs16 \
    --trigger-http \
    --allow-unauthenticated

gcloud functions deploy trackEvent \
    --runtime nodejs16 \
    --trigger-http \
    --allow-unauthenticated

gcloud functions deploy dialogflowWebhook \
    --runtime nodejs16 \
    --trigger-http \
    --allow-unauthenticated
```

### Verify Deployment
```bash
gcloud functions list
gcloud functions describe processPayment
```

---

## 7. Deploy to GCP Cloud Run

### Create Dockerfile
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

### Deploy
```bash
gcloud run deploy pulserelief \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

---

## 8. Configure Frontend Scripts

### Update index.html
Add before closing `</head>`:
```html
<!-- Firebase -->
<script type="module" src="firebase-config.js"></script>

<!-- Google Pay -->
<script src="https://pay.google.com/gp/p/js/pay.js"></script>

<!-- Dialogflow -->
<script src="dialogflow-config.js"></script>

<!-- GCP Integration -->
<script type="module">
    import { loginUser, registerUser, createDonation } from './firebase-config.js';
    import { initializeGooglePay, createGooglePayButton } from './google-pay-config.js';
    import { initializeDialogflowMessenger, DialogflowChatbot } from './dialogflow-config.js';
    
    // Initialize services
    window.onload = async () => {
        await initializeGooglePay();
        initializeDialogflowMessenger();
    };
</script>
```

---

## 9. Environment Variables Setup

### Create .env File
```
FIREBASE_API_KEY=AIzaSyDxxxxx
FIREBASE_PROJECT_ID=pulserelief-xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
BIGQUERY_DATASET=analytics_dataset
DIALOGFLOW_PROJECT_ID=pulserelief-xxxxx
GOOGLE_PAY_MERCHANT_ID=12345678901234567890
ENCRYPTION_KEY=your-encryption-key
```

### Set in GCP
```bash
gcloud secrets create firebase-api-key --data-file=-
gcloud secrets create stripe-secret-key --data-file=-
```

---

## 10. Security Best Practices

### Enable Cloud Security Command Center
```bash
gcloud compute security-policies create pulserelief-security \
    --description="Security policy for PulseRelief"
```

### Setup Cloud Armor
```bash
gcloud compute security-policies create pulserelief \
    --description="Cloud Armor policy"

gcloud compute security-policies rules create 1000 \
    --security-policy pulserelief \
    --action "deny-403" \
    --expression "evaluatePreconfiguredExpr('xss-stable')"
```

### Enable VPC Service Controls
```bash
gcloud access-context-manager policies create \
    --title="PulseRelief Access Policy"
```

---

## 11. Monitoring & Logging

### Setup Cloud Logging
```bash
gcloud logging read "resource.type=cloud_function" \
    --limit 50 \
    --format=json
```

### Create Monitoring Alerts
```bash
gcloud alpha monitoring policies create \
    --notification-channels=CHANNEL_ID \
    --display-name="Payment Processing Errors" \
    --condition-display-name="High Error Rate"
```

---

## 12. Testing

### Test Firebase Authentication
```bash
# Create test user
firebase auth:create --email test@pulserelief.org --password password123

# Verify login
curl -X POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword \
    -d '{"email":"test@pulserelief.org","password":"password123"}' \
    -H "Content-Type: application/json"
```

### Test Google Pay
```bash
# Test with provided test card
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
```

### Test Dialogflow
```bash
curl -X POST https://dialogflow.googleapis.com/v2/projects/pulserelief-xxxxx/agent/sessions/test:detectIntent \
    -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
    -H "Content-Type: application/json" \
    -d '{"queryInput": {"text": {"text": "I want to donate"}}}'
```

---

## 13. Production Checklist

- [ ] Enable production billing alerts
- [ ] Setup automated backups for Firebase Realtime Database
- [ ] Configure CDN for static assets
- [ ] Enable HTTPS and SSL/TLS certificates
- [ ] Setup DDoS protection with Cloud Armor
- [ ] Configure database replication across regions
- [ ] Enable audit logging for all services
- [ ] Setup error tracking and alerting
- [ ] Configure automated scaling policies
- [ ] Test disaster recovery procedures
- [ ] Schedule regular security audits
- [ ] Document all configurations and credentials
- [ ] Setup contact information for PagerDuty/alerting

---

## 14. Cost Optimization

```bash
# Monitor usage
gcloud billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="PulseRelief Monthly Budget" \
    --budget-amount=1000

# Setup cost alerts
gcloud alpha billing budgets update BUDGET_ID \
    --threshold-rule=percent=50% \
    --threshold-rule=percent=90% \
    --threshold-rule=percent=100%
```

---

## Support & Documentation

- Firebase Docs: https://firebase.google.com/docs
- Google Pay: https://developers.google.com/pay
- BigQuery: https://cloud.google.com/bigquery/docs
- Dialogflow: https://cloud.google.com/dialogflow/docs
- Cloud Functions: https://cloud.google.com/functions/docs
