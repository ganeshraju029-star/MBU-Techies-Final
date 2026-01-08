# AI-Powered Document Verification Setup Guide

## Overview

This feature uses **Google Cloud Vision AI** to automatically verify emergency request documents (medical bills, receipts, ID cards) by:

1. **Extracting text** from images using OCR (Optical Character Recognition)
2. **Identifying key information** (hospital name, amount, date, document type)
3. **Calculating trust scores** to detect fraud
4. **Flagging duplicate submissions**
5. **Warning about suspicious patterns**

---

## 🚀 Features Implemented

### Frontend Features
- ✅ Automatic document verification on upload
- ✅ Real-time AI analysis with animated loading states
- ✅ Visual trust score display (High/Medium/Low)
- ✅ Extracted data preview (institution, amount, date)
- ✅ Warning system for suspicious documents
- ✅ Full extracted text viewer (collapsible)
- ✅ Professional blue-themed verification panel

### Backend Features
- ✅ Google Cloud Vision API integration
- ✅ Intelligent text extraction and parsing
- ✅ Document type detection (medical bill, invoice, receipt)
- ✅ Trust score calculation algorithm
- ✅ Fraud pattern detection
- ✅ Duplicate document checking
- ✅ Audit trail storage

---

## 📋 Prerequisites

1. **Google Cloud Platform Account**
   - Sign up at [console.cloud.google.com](https://console.cloud.google.com)
   - Enable billing (free tier includes 1,000 Vision API calls/month)

2. **Node.js Dependencies**
   ```bash
   npm install @google-cloud/vision multer
   ```

---

## 🔧 Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "**Select a project**" → "**New Project**"
3. Name it: `pulserelief-verification`
4. Click "**Create**"

### Step 2: Enable Vision AI API

1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for "**Cloud Vision API**"
3. Click "**Enable**"

### Step 3: Create Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click "**+ CREATE SERVICE ACCOUNT**"
3. Name: `document-verifier`
4. Role: **Cloud Vision AI User**
5. Click "**Done**"

### Step 4: Generate API Key

1. Click on the created service account
2. Go to "**Keys**" tab
3. Click "**Add Key**" → "**Create new key**"
4. Choose "**JSON**" format
5. Download the JSON file
6. Rename it to `gcp-service-account.json`
7. Place it in: `backend/config/gcp-service-account.json`

### Step 5: Configure Environment Variables

Add to your `backend/config/config.env`:

```env
# Google Cloud Platform Configuration
GOOGLE_APPLICATION_CREDENTIALS=./config/gcp-service-account.json
GCP_PROJECT_ID=pulserelief-verification
```

### Step 6: Update Server Configuration

Add the verification route to your `backend/server.js`:

```javascript
const documentVerificationRoutes = require('./routes/documentVerification');

// Mount routes
app.use('/api/verify', documentVerificationRoutes);
```

### Step 7: Install Required Dependencies

```bash
cd backend
npm install @google-cloud/vision multer
```

---

## 🎯 How It Works

### Frontend Flow

1. **User uploads document** → File selected in "Request Emergency Help" form
2. **Automatic trigger** → `verifyDocumentWithAI()` function called
3. **API call** → File sent to backend `/api/verify/document`
4. **Loading state** → Shows "Analyzing..." badge with animation
5. **Results display** → Trust score, extracted data, warnings shown
6. **User review** → Can expand to see full extracted text

### Backend Processing

```
Upload → Google Vision API → Text Extraction → Smart Parsing → Trust Score → Response
```

**Text Extraction:**
- Uses Google Cloud Vision's `textDetection()` method
- Returns full document text with high accuracy

**Smart Parsing:**
- **Institution**: Searches for hospital/clinic names
- **Amount**: Finds currency values ($, amounts)
- **Date**: Detects multiple date formats
- **IDs**: Extracts patient ID, invoice numbers

**Trust Score Algorithm:**
```javascript
Start: 100 points
- Missing institution: -20
- Missing amount: -25
- Missing date: -15
- Document > 30 days old: -10
- Document > 90 days old: -15
- Amount < $100: -10
- Amount > $100,000: -5
- Low image quality: -10
```

---

## 📊 API Endpoints

### Verify Document

**POST** `/api/verify/document`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
```
document: <file> (JPG/PNG, max 5MB)
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "trustScore": 85,
  "extractedData": {
    "institution": "City General Hospital",
    "amount": 2500,
    "date": "2026-01-05",
    "documentType": "Medical Bill",
    "patientId": "PT-1234",
    "invoiceNumber": "INV-5678"
  },
  "extractedText": "Full document text...",
  "warnings": [],
  "isDuplicate": false,
  "timestamp": "2026-01-07T22:30:00.000Z"
}
```

### Fraud Detection

**POST** `/api/verify/fraud-check`

**Body:**
```json
{
  "extractedText": "Document text content..."
}
```

**Response:**
```json
{
  "success": true,
  "fraudScore": 25,
  "isSuspicious": false,
  "indicators": ["Document contains placeholder text"],
  "recommendation": "Low risk - Proceed with standard verification"
}
```

---

## 💰 Pricing

**Google Cloud Vision API:**
- **Free Tier**: 1,000 requests/month
- **After Free Tier**: $1.50 per 1,000 requests

**Estimated Costs for PulseRelief:**
- 100 requests/day = 3,000/month = **$3.00/month**
- 500 requests/day = 15,000/month = **$21.00/month**

---

## 🔒 Security Best Practices

1. **Never commit** `gcp-service-account.json` to version control
2. Add to `.gitignore`:
   ```
   backend/config/gcp-service-account.json
   backend/config/*.json
   ```

3. **Use environment variables** in production:
   ```javascript
   const client = new vision.ImageAnnotatorClient({
     credentials: JSON.parse(process.env.GCP_CREDENTIALS)
   });
   ```

4. **Implement rate limiting** to prevent abuse
5. **Validate file types** before processing
6. **Store verification logs** for audit trail

---

## 🧪 Testing

### Test with Sample Documents

1. Create test medical bills with clear text
2. Upload through "Request Emergency Help" form
3. Watch verification panel appear
4. Check extracted data accuracy

### Test Cases

✅ **Valid medical bill** → Trust score 80-100  
✅ **Old document (>30 days)** → Warning shown  
✅ **Low amount (<$100)** → Warning shown  
✅ **Blurry image** → Lower trust score  
✅ **Non-medical document** → Type detection warning  

---

## 🐛 Troubleshooting

### "Authentication Error"
- Check if `gcp-service-account.json` is in correct location
- Verify `GOOGLE_APPLICATION_CREDENTIALS` path in `.env`

### "API Not Enabled"
- Go to Cloud Console → APIs & Services
- Enable "Cloud Vision API"

### "Quota Exceeded"
- Check usage in Cloud Console → Vision AI
- Upgrade to paid tier or wait for quota reset

### "Low Accuracy"
- Ensure uploaded images are clear and high resolution
- Minimum 1000x1000 pixels recommended
- Avoid heavily compressed JPEGs

---

## 🎨 UI Customization

### Change Trust Score Thresholds

In `script.js`:
```javascript
if (result.trustScore >= 80) {  // High trust
    verificationBadge.className = 'verification-badge verified';
} else if (result.trustScore >= 60) {  // Medium
    verificationBadge.className = 'verification-badge warning';
} else {  // Low trust
    verificationBadge.className = 'verification-badge failed';
}
```

### Modify Panel Colors

In `styles.css`:
```css
.ai-verification-panel {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border: 2px solid #3b82f6; /* Change color here */
}
```

---

## 📈 Future Enhancements

- [ ] Multi-language support for international documents
- [ ] Advanced fraud detection using ML models
- [ ] Document comparison for duplicate detection
- [ ] Integration with hospital databases for verification
- [ ] Real-time document quality assessment
- [ ] Automatic redaction of sensitive information

---

## 🏆 Jury Impact Points

**For Google Hackathon Presentation:**

✅ **Technical Depth**: Real GCP API integration  
✅ **Security Focus**: Trust scoring + fraud detection  
✅ **User Experience**: Automatic verification, no manual review needed  
✅ **Scalability**: Cloud-native, handles thousands of documents  
✅ **Innovation**: AI-powered emergency verification in <2 seconds  
✅ **Trust Building**: Transparent scoring visible to donors  

**Demo Talking Points:**
1. "When users upload medical bills, our AI extracts key data **instantly**"
2. "Trust scores help donors feel confident about verified cases"
3. "Fraud detection catches duplicate submissions and suspicious patterns"
4. "Uses Google's state-of-the-art Vision AI - same tech powering Google Lens"

---

## 📞 Support

For issues or questions:
- Check [Google Cloud Vision Documentation](https://cloud.google.com/vision/docs)
- Review backend logs: `backend/logs/verification.log`
- Test API directly: Use Postman collection in `backend/postman-collection.json`

---

**Built with ❤️ for PulseRelief Google Hackathon 2026**
