# PulseRelief - Emergency Fundraising Platform

A comprehensive emergency fundraising platform that connects verified urgent cases with ready donors in real-time.

## 🚀 Features

### Frontend
- **Modern Responsive Design**: Mobile-first approach with beautiful UI/UX
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Real-time Updates**: Live emergency streaming and case updates
- **Multi-currency Support**: 18+ currencies with real-time conversion
- **Payment Integration**: Google Pay, UPI, QR codes, Credit/Debit cards, PayPal
- **Advanced Dashboard**: Role-based access for Users, Staff, and Admin
- **Interactive Maps**: Global crisis visualization with Google Maps
- **File Upload**: Drag-and-drop document upload for verification
- **Chatbot Integration**: AI-powered support with Dialogflow

### Backend
- **RESTful API**: Complete REST API with comprehensive endpoints
- **Authentication**: JWT-based auth with role-based access control
- **Database Models**: Firebase Realtime Database with custom models for Users, Staff, Emergency Cases, Donations, Partners
- **Security**: Input validation, rate limiting, CORS, helmet protection
- **Payment Processing**: Stripe, PayPal, Google Pay integration ready
- **Email System**: Automated receipts and notifications
- **File Management**: Secure file upload and storage
- **Analytics**: Comprehensive statistics and reporting

## 📋 Prerequisites

- Node.js 16.0+
- Firebase project with Realtime Database enabled
- npm 8.0+

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd PulseRelief
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Firebase Configuration
```bash
# 1. Create a Firebase project at https://console.firebase.google.com
# 2. Enable Realtime Database
# 3. Generate service account key
# 4. Download serviceAccountKey.json and place in backend/config/
```

Edit `config/config.env` with your Firebase configuration:
```env
NODE_ENV=development
PORT=5000

# Database
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 4. Start Backend Server
```bash
npm run dev
```

### 5. Open Frontend
Open `index.html` in your browser or serve with a static server:
```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx serve . -p 3000
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/staff/login` - Staff login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Update password
- `POST /api/auth/forgot-password` - Forgot password

### Emergency Cases
- `GET /api/emergency` - Get all cases (public)
- `POST /api/emergency` - Create new case (auth required)
- `GET /api/emergency/:id` - Get single case
- `PUT /api/emergency/:id` - Update case (auth required)
- `DELETE /api/emergency/:id` - Delete case (auth required)
- `GET /api/emergency/featured` - Get featured cases
- `GET /api/emergency/my-cases` - Get user's cases (auth required)
- `PUT /api/emergency/:id/status` - Update case status (staff only)

### Donations
- `POST /api/donations` - Create donation
- `GET /api/donations` - Get all donations (staff only)
- `GET /api/donations/:id` - Get single donation (auth required)
- `GET /api/donations/my-donations` - Get user's donations (auth required)
- `PUT /api/donations/:id/status` - Update donation status (staff only)
- `POST /api/donations/:id/refund` - Process refund (staff only)

## 🧪 Testing

### Postman Collection
Import the provided Postman collection:
```bash
# Import backend/postman-collection.json into Postman
```

### Environment Variables in Postman
- `baseUrl`: http://localhost:5000/api
- `userToken`: Set after user login
- `staffToken`: Set after staff login

### Running Tests
```bash
npm test
```

## 🏗️ Project Structure

```
PulseRelief/
├── backend/
│   ├── config/
│   │   └── config.env
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── emergencyController.js
│   │   └── donationController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Staff.js
│   │   ├── EmergencyCase.js
│   │   ├── Donation.js
│   │   └── Partner.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── emergency.js
│   │   └── donations.js
│   ├── package.json
│   ├── server.js
│   └── postman-collection.json
├── index.html
├── script.js
├── styles.css
├── auth-system.js
├── currency-conversion.js
├── payment-methods.js
├── firebase-config.js
├── cloud-functions.js
├── dialogflow-config.js
├── google-pay-config.js
└── README.md
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Development/Production
- `PORT`: Server port (default: 5000)
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_PRIVATE_KEY_ID`: Service account private key ID
- `FIREBASE_CLIENT_EMAIL`: Service account email
- `FIREBASE_DATABASE_URL`: Realtime Database URL
- `FIREBASE_STORAGE_BUCKET`: Firebase Storage bucket name
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRE`: Token expiration (default: 30d)
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `GOOGLE_MAPS_API_KEY`: Google Maps API key
- `EMAIL_HOST`: SMTP server for emails
- `UPLOAD_PATH`: File upload directory

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configurable CORS policies
- **Helmet Security**: Security headers
- **Password Hashing**: bcrypt for secure password storage
- **XSS Protection**: Input sanitization
- **SQL Injection Prevention**: NoSQL injection protection

## 📱 Responsive Design

The platform is fully responsive:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Navigation
- **Desktop**: Horizontal navigation bar
- **Mobile**: Hamburger menu with slide-out navigation
- **4 Key Items**: How it works, Live emergencies, Crisis map, Get help

## 🎨 UI Features

- **Theme Toggle**: Dark/Light mode switcher
- **Interactive Elements**: Hover effects, smooth transitions
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Success States**: Confirmation messages and animations
- **Professional Footer**: Comprehensive footer with social links, newsletter, and app downloads

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Environment Setup
1. Set up Firebase project
2. Configure environment variables
3. Set up payment gateway accounts
4. Configure email service
5. Deploy to your preferred platform

## 📊 Analytics & Monitoring

- **User Analytics**: Registration, login, activity tracking
- **Case Analytics**: Creation, approval, funding statistics
- **Donation Analytics**: Amount, frequency, method tracking
- **Performance Monitoring**: Response times, error rates
- **Security Monitoring**: Failed logins, suspicious activities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@pulserelief.org
- Documentation: Check inline documentation
- Issues: Create GitHub issues

## 🔄 Version History

- **v1.0.0**: Initial release with complete backend and frontend
- **v1.1.0**: Added responsive navigation and professional footer
- **v1.2.0**: Enhanced security and API documentation

---

**Note**: This is a prototype/demo version. Not a live fundraising service.
