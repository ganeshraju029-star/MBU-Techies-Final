require('dotenv').config({ path: './config/config.env' });

console.log('🚀 Starting Server Test...\n');

try {
    // Test Firebase import
    console.log('1. Testing Firebase import...');
    const { db } = require('./config/firebase');
    console.log('✅ Firebase imported successfully');

    // Test Express import
    console.log('2. Testing Express import...');
    const express = require('express');
    console.log('✅ Express imported successfully');

    // Test middleware imports
    console.log('3. Testing middleware imports...');
    const cors = require('cors');
    const helmet = require('helmet');
    const rateLimit = require('express-rate-limit');
    const mongoSanitize = require('express-mongo-sanitize');
    const xss = require('xss');
    const hpp = require('hpp');
    const compression = require('compression');
    const morgan = require('morgan');
    console.log('✅ All middleware imported successfully');

    // Test route imports
    console.log('4. Testing route imports...');
    const auth = require('./routes/auth');
    const emergency = require('./routes/emergency');
    const donations = require('./routes/donations');
    console.log('✅ All routes imported successfully');

    // Test error handler import
    console.log('5. Testing error handler import...');
    const { errorHandler, notFound } = require('./middleware/errorHandler');
    console.log('✅ Error handler imported successfully');

    // Create basic app
    console.log('6. Creating Express app...');
    const app = express();
    console.log('✅ Express app created successfully');

    // Test basic middleware
    console.log('7. Testing basic middleware...');
    app.use(express.json());
    app.use(cors());
    console.log('✅ Basic middleware applied successfully');

    // Test basic route
    console.log('8. Testing basic route...');
    app.get('/test', (req, res) => {
        res.json({ success: true, message: 'Server is working!' });
    });
    console.log('✅ Basic route created successfully');

    // Test Firebase connection
    console.log('9. Testing Firebase connection...');
    db.ref('/').once('value')
        .then(() => {
            console.log('✅ Firebase connection test successful');
            
            console.log('\n🎉 All tests passed! Server should start successfully.');
            console.log('📡 Server would run on port:', process.env.PORT || 5000);
            
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Firebase connection test failed:', error.message);
            process.exit(1);
        });

} catch (error) {
    console.error('❌ Server test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
