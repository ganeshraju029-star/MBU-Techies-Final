require('dotenv').config({ path: './config/config.env' });

console.log('🔍 Debugging Environment Variables...\n');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL);
console.log('FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET);

// Test if dotenv is working
const fs = require('fs');
try {
    const configContent = fs.readFileSync('./config/config.env', 'utf8');
    console.log('\n📄 config.env content preview:');
    console.log(configContent.substring(0, 200) + '...');
} catch (error) {
    console.error('❌ Error reading config.env:', error.message);
}
