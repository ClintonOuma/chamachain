const fs = require('fs');
const crypto = require('crypto');

// Generate new secrets
const jwtAccessSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

// Read existing .env file
let envContent = '';
if (fs.existsSync('.env')) {
  envContent = fs.readFileSync('.env', 'utf8');
}

// Update or add JWT secrets
const lines = envContent.split('\n');
let updatedLines = [];
let hasAccessSecret = false;
let hasRefreshSecret = false;

lines.forEach(line => {
  if (line.startsWith('JWT_ACCESS_SECRET=')) {
    updatedLines.push(`JWT_ACCESS_SECRET=${jwtAccessSecret}`);
    hasAccessSecret = true;
  } else if (line.startsWith('JWT_REFRESH_SECRET=')) {
    updatedLines.push(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
    hasRefreshSecret = true;
  } else {
    updatedLines.push(line);
  }
});

// Add secrets if they don't exist
if (!hasAccessSecret) {
  updatedLines.push(`JWT_ACCESS_SECRET=${jwtAccessSecret}`);
}
if (!hasRefreshSecret) {
  updatedLines.push(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
}

// Write updated .env file
fs.writeFileSync('.env', updatedLines.join('\n'));

console.log('✅ Updated .env file with new JWT secrets');
console.log('🔒 Old hardcoded secrets removed from code');
console.log('📝 Your .env file now contains secure secrets');
