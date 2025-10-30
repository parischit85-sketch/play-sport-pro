/**
 * @fileoverview Script per generare VAPID keys per Web Push Notifications
 * 
 * Genera una coppia di chiavi VAPID (public + private) necessarie per
 * implementare Web Push Notifications secondo lo standard VAPID.
 * 
 * Usage:
 *   node scripts/generate-vapid-keys.js
 * 
 * Output:
 *   - Public Key (da usare nel frontend)
 *   - Private Key (da usare nel backend, KEEP SECRET)
 * 
 * @author Play Sport Pro Team
 * @version 1.0.0
 */

// Check if web-push is installed
let webpush;
try {
  webpush = require('web-push');
} catch (error) {
  console.error('\n❌ ERROR: web-push package not found!\n');
  console.log('📦 Install it with:');
  console.log('   npm install web-push --save-dev\n');
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

/**
 * Generate VAPID keys
 */
function generateVapidKeys() {
  console.log('\n' + '='.repeat(70));
  console.log('🔑  VAPID Keys Generator - Push Notifications v2.0');
  console.log('='.repeat(70) + '\n');

  console.log('⏳ Generating VAPID keys...\n');

  // Generate keys
  const vapidKeys = webpush.generateVAPIDKeys();

  // Display keys
  console.log('✅ VAPID Keys Generated Successfully!\n');
  console.log('='.repeat(70));
  console.log('\n📌 PUBLIC KEY (client-side - safe to expose):');
  console.log('─'.repeat(70));
  console.log(vapidKeys.publicKey);
  console.log('─'.repeat(70));
  
  console.log('\n🔒 PRIVATE KEY (server-side - KEEP SECRET!):');
  console.log('─'.repeat(70));
  console.log(vapidKeys.privateKey);
  console.log('─'.repeat(70));

  return vapidKeys;
}

/**
 * Save keys to .env file
 */
function saveToEnvFile(vapidKeys) {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');

  // Check if .env already exists
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Backup existing .env
    const backupPath = `${envPath}.backup.${Date.now()}`;
    fs.writeFileSync(backupPath, envContent);
    console.log(`\n💾 Existing .env backed up to: ${backupPath}`);
  }

  // Add/update VAPID key in .env
  const vapidLine = `VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`;
  
  if (envContent.includes('VITE_VAPID_PUBLIC_KEY=')) {
    // Replace existing key
    envContent = envContent.replace(
      /VITE_VAPID_PUBLIC_KEY=.*/,
      vapidLine
    );
    console.log('✏️  Updated VITE_VAPID_PUBLIC_KEY in .env');
  } else {
    // Add new key
    envContent += `\n# VAPID Public Key for Push Notifications\n${vapidLine}\n`;
    console.log('✏️  Added VITE_VAPID_PUBLIC_KEY to .env');
  }

  // Write updated .env
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ .env file updated: ${envPath}`);

  // Create .env.example if doesn't exist
  if (!fs.existsSync(envExamplePath)) {
    const exampleContent = `# VAPID Public Key for Push Notifications
# Generate with: node scripts/generate-vapid-keys.js
VITE_VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY_HERE
`;
    fs.writeFileSync(envExamplePath, exampleContent);
    console.log(`✅ Created .env.example template`);
  }
}

/**
 * Generate Firebase commands
 */
function generateFirebaseCommands(vapidKeys) {
  console.log('\n' + '='.repeat(70));
  console.log('📋 NEXT STEPS - Configure in Firebase');
  console.log('='.repeat(70) + '\n');

  console.log('1️⃣  Set VAPID keys in Firebase Functions config:\n');
  console.log('   firebase functions:config:set \\');
  console.log(`     vapid.public_key="${vapidKeys.publicKey}" \\`);
  console.log(`     vapid.private_key="${vapidKeys.privateKey}" \\`);
  console.log('     --project m-padelweb\n');

  console.log('2️⃣  Verify configuration:\n');
  console.log('   firebase functions:config:get --project m-padelweb\n');

  console.log('3️⃣  Redeploy Cloud Functions:\n');
  console.log('   firebase deploy --only functions --project m-padelweb\n');

  console.log('4️⃣  Rebuild and redeploy frontend:\n');
  console.log('   npm run build');
  console.log('   firebase deploy --only hosting --project m-padelweb\n');
}

/**
 * Save commands to shell script
 */
function saveCommandsToScript(vapidKeys) {
  const scriptPath = path.join(__dirname, 'setup-vapid-keys.sh');
  
  const scriptContent = `#!/bin/bash
# VAPID Keys Setup Script - Auto-generated
# Generated: ${new Date().toISOString()}

echo "🔑 Setting up VAPID keys in Firebase..."

# Set VAPID keys in Firebase Functions config
firebase functions:config:set \\
  vapid.public_key="${vapidKeys.publicKey}" \\
  vapid.private_key="${vapidKeys.privateKey}" \\
  --project m-padelweb

# Verify configuration
echo ""
echo "✅ Verifying configuration..."
firebase functions:config:get --project m-padelweb

echo ""
echo "🚀 Next steps:"
echo "   1. Redeploy functions: firebase deploy --only functions"
echo "   2. Rebuild frontend: npm run build"
echo "   3. Redeploy hosting: firebase deploy --only hosting"
`;

  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, '755'); // Make executable
  
  console.log(`\n💾 Firebase setup commands saved to: ${scriptPath}`);
  console.log('   Execute with: bash scripts/setup-vapid-keys.sh\n');
}

/**
 * Save commands to PowerShell script
 */
function saveCommandsToPowerShell(vapidKeys) {
  const scriptPath = path.join(__dirname, 'setup-vapid-keys.ps1');
  
  const scriptContent = `# VAPID Keys Setup Script - Auto-generated
# Generated: ${new Date().toISOString()}

Write-Host "🔑 Setting up VAPID keys in Firebase..." -ForegroundColor Green

# Set VAPID keys in Firebase Functions config
firebase functions:config:set \`
  vapid.public_key="${vapidKeys.publicKey}" \`
  vapid.private_key="${vapidKeys.privateKey}" \`
  --project m-padelweb

# Verify configuration
Write-Host ""
Write-Host "✅ Verifying configuration..." -ForegroundColor Green
firebase functions:config:get --project m-padelweb

Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Redeploy functions: firebase deploy --only functions"
Write-Host "   2. Rebuild frontend: npm run build"
Write-Host "   3. Redeploy hosting: firebase deploy --only hosting"
`;

  fs.writeFileSync(scriptPath, scriptContent);
  
  console.log(`\n💾 PowerShell setup commands saved to: ${scriptPath}`);
  console.log('   Execute with: .\\scripts\\setup-vapid-keys.ps1\n');
}

/**
 * Display security warnings
 */
function displaySecurityWarnings() {
  console.log('\n' + '='.repeat(70));
  console.log('⚠️  SECURITY WARNINGS');
  console.log('='.repeat(70) + '\n');

  console.log('🔴 CRITICAL - Private Key Security:');
  console.log('   ❌ NEVER commit private key to git');
  console.log('   ❌ NEVER expose private key in frontend code');
  console.log('   ❌ NEVER share via email/chat/Slack');
  console.log('   ✅ Store ONLY in Firebase Functions config (encrypted)\n');

  console.log('🟡 IMPORTANT - .env File:');
  console.log('   ✅ Ensure .env is in .gitignore');
  console.log('   ✅ Never commit .env to version control');
  console.log('   ✅ Use .env.example for team reference\n');

  console.log('🟢 BEST PRACTICES:');
  console.log('   ✅ Generate separate keys for dev/staging/production');
  console.log('   ✅ Rotate keys every 6-12 months');
  console.log('   ✅ Monitor key usage in Firebase Analytics');
  console.log('   ✅ Revoke keys if compromised\n');
}

/**
 * Check .gitignore
 */
function checkGitignore() {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    if (!gitignoreContent.includes('.env')) {
      console.log('\n⚠️  WARNING: .env not found in .gitignore!');
      console.log('   Add this line to .gitignore:');
      console.log('   .env\n');
      
      // Auto-add to .gitignore
      fs.appendFileSync(gitignorePath, '\n# Environment variables\n.env\n.env.*.backup\n');
      console.log('✅ Auto-added .env to .gitignore\n');
    } else {
      console.log('✅ .env is properly excluded from git\n');
    }
  }
}

/**
 * Main execution
 */
function main() {
  try {
    // Generate keys
    const vapidKeys = generateVapidKeys();

    // Save to .env
    console.log('\n' + '='.repeat(70));
    console.log('💾 Saving to .env file');
    console.log('='.repeat(70));
    saveToEnvFile(vapidKeys);

    // Check .gitignore
    checkGitignore();

    // Generate commands
    generateFirebaseCommands(vapidKeys);

    // Save scripts
    saveCommandsToScript(vapidKeys);
    saveCommandsToPowerShell(vapidKeys);

    // Security warnings
    displaySecurityWarnings();

    // Success message
    console.log('='.repeat(70));
    console.log('✅ VAPID Keys Setup Complete!');
    console.log('='.repeat(70) + '\n');

    console.log('📝 Summary:');
    console.log('   ✅ VAPID keys generated');
    console.log('   ✅ Public key saved to .env');
    console.log('   ✅ Private key ready for Firebase config');
    console.log('   ✅ Setup scripts created');
    console.log('   ✅ .gitignore verified\n');

    console.log('🚀 Quick Start:');
    console.log('   1. Review the keys above');
    console.log('   2. Run: bash scripts/setup-vapid-keys.sh   (or .ps1 for PowerShell)');
    console.log('   3. Redeploy: firebase deploy --only functions,hosting\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { generateVapidKeys };
