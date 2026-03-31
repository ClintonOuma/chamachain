const crypto = require('crypto');

console.log('=== ChamaChain Security Secrets Generator ===\n');

// Generate JWT secrets
const jwtAccessSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

console.log('Add these to your .env file:\n');
console.log(`JWT_ACCESS_SECRET=${jwtAccessSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log('\nThese are 64-character hex secrets suitable for JWT signing.');

// Generate other optional secrets
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log(`\nOptional: SESSION_SECRET=${sessionSecret}`);

console.log('\n=== Security Reminder ===');
console.log('1. Never commit these secrets to version control');
console.log('2. Add .env to your .gitignore file');
console.log('3. Use different secrets for development and production');
console.log('4. Rotate secrets periodically for security');
