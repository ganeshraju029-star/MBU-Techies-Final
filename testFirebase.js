require('dotenv').config({ path: './config/config.env' });

console.log('🔍 Testing Firebase Connection...\n');

try {
    // Test Firebase import
    const { db } = require('./config/firebase');
    console.log('✅ Firebase module loaded successfully');
    
    // Test environment variables
    console.log('📡 Environment Variables:');
    console.log(`  - Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log(`  - Database URL: ${process.env.FIREBASE_DATABASE_URL}`);
    console.log(`  - Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`);
    
    // Test database connection
    console.log('\n🔌 Testing Database Connection...');
    
    // Try to read root
    db.ref('/').once('value')
        .then((snapshot) => {
            console.log('✅ Firebase connection successful!');
            const data = snapshot.val();
            
            if (data) {
                console.log('\n📊 Database Contents:');
                console.log('  Root keys found:', Object.keys(data));
                
                // Check collections
                const collections = ['users', 'staff', 'emergencyCases', 'donations'];
                collections.forEach(collection => {
                    if (data[collection]) {
                        const count = Object.keys(data[collection]).length;
                        console.log(`  📂 ${collection}: ${count} records`);
                    } else {
                        console.log(`  📂 ${collection}: 0 records (empty)`);
                    }
                });
            } else {
                console.log('📂 Database is empty - ready for first data!');
            }
            
            console.log('\n🎉 Firebase is properly connected!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Firebase connection failed:', error.message);
            console.error('\n🔧 Troubleshooting:');
            console.error('1. Check serviceAccountKey.json exists');
            console.error('2. Verify FIREBASE_DATABASE_URL in config.env');
            console.error('3. Ensure Firebase project has Realtime Database enabled');
            console.error('4. Check service account permissions');
            process.exit(1);
        });
        
} catch (error) {
    console.error('❌ Error loading Firebase:', error.message);
    process.exit(1);
}
