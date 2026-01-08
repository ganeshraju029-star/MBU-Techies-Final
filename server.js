const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars (must be before Firebase initialization)
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// Load Firebase configuration
const { db } = require('./config/firebase');

// Route files
const auth = require('./routes/auth');
const emergency = require('./routes/emergency');
const donations = require('./routes/donations');
const verify = require('./routes/documentVerification');

// Initialize Firebase connection
const connectDB = async () => {
    try {
        console.log('Firebase Connected Successfully');
        console.log('Database URL:', process.env.FIREBASE_DATABASE_URL);
    } catch (error) {
        console.error('Firebase connection error:', error);
        process.exit(1);
    }
};

connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com", "https://www.gstatic.com"],
            connectSrc: ["'self'", "https://maps.googleapis.com", "https://www.googleapis.com"],
        },
    },
}));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://localhost:8080'];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Data sanitization
app.use(mongoSanitize());

// Prevent XSS attacks
app.use((req, res, next) => {
    const shouldSkipSanitize = (key, value) => {
        if (typeof value !== 'string') return true;
        const k = String(key || '').toLowerCase();
        if (k === 'image' || k === 'dataurl' || k === 'base64') return true;
        if (value.startsWith('data:') && value.includes(';base64,')) return true;
        if (value.length > 2000 && /^[a-z0-9+/=\r\n]+$/i.test(value)) return true;
        return false;
    };

    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                if (!shouldSkipSanitize(key, req.body[key])) {
                    req.body[key] = xss(req.body[key]);
                }
            }
        });
    }
    next();
});

// Prevent parameter pollution
app.use(hpp({
    whitelist: ['sort', 'limit', 'page']
}));

// Compression
app.use(compression());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/emergency', emergency);
app.use('/api/donations', donations);
app.use('/api/verify', verify);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'PulseRelief API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Public runtime config for frontend
app.get('/api/config', (req, res) => {
    res.status(200).json({
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
    });
} else {
    // In development, also serve frontend files
    app.use(express.static(path.join(__dirname, '../frontend')));
    
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
    });
}

// Error handling middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});

module.exports = app;
