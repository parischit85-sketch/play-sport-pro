#!/usr/bin/env node

/**
 * ===============================================
 * Config Validator - PlaySport Pro
 * ===============================================
 * 
 * Valida la configurazione prima del deploy
 * 
 * Usage:
 *   node validate-config.js
 *   npm run validate-config
 * 
 * ===============================================
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
};

// Required environment variables
const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
];

const RECOMMENDED_VARS = [
  'VITE_GA_MEASUREMENT_ID',
];

let errors = 0;
let warnings = 0;

/**
 * Parse .env file
 */
function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, 'utf-8');
  const env = {};

  content.split('\n').forEach((line) => {
    line = line.trim();
    
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;

    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    
    if (key && value) {
      env[key.trim()] = value;
    }
  });

  return env;
}

/**
 * Validate environment variables
 */
function validateEnvVars(env) {
  log.section('📋 Environment Variables');

  // Check required variables
  REQUIRED_VARS.forEach((varName) => {
    if (!env[varName]) {
      log.error(`Missing required variable: ${varName}`);
      errors++;
    } else if (env[varName].includes('your_') || env[varName] === '') {
      log.error(`Invalid value for ${varName} (contains placeholder)`);
      errors++;
    } else {
      log.success(`${varName}`);
    }
  });

  // Check recommended variables
  RECOMMENDED_VARS.forEach((varName) => {
    if (!env[varName]) {
      log.warning(`Missing recommended variable: ${varName}`);
      warnings++;
    } else if (env[varName].includes('your_') || env[varName] === '') {
      log.warning(`Invalid value for ${varName} (contains placeholder)`);
      warnings++;
    } else {
      log.success(`${varName}`);
    }
  });

  return errors === 0;
}

/**
 * Validate GA4 Measurement ID format
 */
function validateGA4MeasurementId(env) {
  log.section('📊 Google Analytics');

  const measurementId = env['VITE_GA_MEASUREMENT_ID'];
  
  if (!measurementId) {
    log.warning('GA4 Measurement ID not configured (optional)');
    warnings++;
    return true;
  }

  const regex = /^G-[A-Z0-9]+$/;
  if (!regex.test(measurementId)) {
    log.error(`Invalid GA4 Measurement ID format: ${measurementId}`);
    log.info('Expected format: G-XXXXXXXXXX');
    errors++;
    return false;
  }

  log.success(`Valid Measurement ID: ${measurementId}`);
  return true;
}

/**
 * Check required files exist
 */
function checkRequiredFiles() {
  log.section('📁 Required Files');

  const requiredFiles = [
    'firestore.rules',
    'storage.rules',
    'netlify.toml',
    'package.json',
    'vite.config.js',
  ];

  requiredFiles.forEach((file) => {
    const filePath = join(__dirname, file);
    if (existsSync(filePath)) {
      log.success(file);
    } else {
      log.error(`Missing file: ${file}`);
      errors++;
    }
  });

  return errors === 0;
}

/**
 * Validate Firebase Security Rules
 */
function validateFirebaseRules() {
  log.section('🔒 Firebase Security Rules');

  // Check Firestore rules
  const firestoreRulesPath = join(__dirname, 'firestore.rules');
  if (existsSync(firestoreRulesPath)) {
    const content = readFileSync(firestoreRulesPath, 'utf-8');
    
    // Check for production-ready rules (not allow all)
    if (content.includes('allow read, write: if true;')) {
      log.error('Firestore rules allow unrestricted access (NOT production-ready)');
      errors++;
    } else {
      log.success('Firestore rules configured');
    }
  }

  // Check Storage rules
  const storageRulesPath = join(__dirname, 'storage.rules');
  if (existsSync(storageRulesPath)) {
    const content = readFileSync(storageRulesPath, 'utf-8');
    
    if (content.includes('allow read, write: if true;')) {
      log.error('Storage rules allow unrestricted access (NOT production-ready)');
      errors++;
    } else {
      log.success('Storage rules configured');
    }
  }

  return errors === 0;
}

/**
 * Validate package.json
 */
function validatePackageJson() {
  log.section('📦 Package Configuration');

  const packagePath = join(__dirname, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

  // Check required scripts
  const requiredScripts = ['dev', 'build', 'preview', 'test'];
  requiredScripts.forEach((script) => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      log.success(`Script: ${script}`);
    } else {
      log.error(`Missing script: ${script}`);
      errors++;
    }
  });

  // Check version
  if (packageJson.version) {
    log.success(`Version: ${packageJson.version}`);
  } else {
    log.warning('No version specified');
    warnings++;
  }

  return errors === 0;
}

/**
 * Check .gitignore
 */
function validateGitignore() {
  log.section('🙈 Git Ignore');

  const gitignorePath = join(__dirname, '.gitignore');
  if (!existsSync(gitignorePath)) {
    log.error('.gitignore file not found');
    errors++;
    return false;
  }

  const content = readFileSync(gitignorePath, 'utf-8');
  
  // Check critical files are ignored
  const criticalIgnores = ['.env', 'serviceAccountKey.json', 'node_modules'];
  criticalIgnores.forEach((pattern) => {
    if (content.includes(pattern)) {
      log.success(`Ignoring: ${pattern}`);
    } else {
      log.error(`NOT ignoring: ${pattern} (security risk!)`);
      errors++;
    }
  });

  return errors === 0;
}

/**
 * Main validation
 */
async function main() {
  console.log(`
${colors.cyan}${colors.bright}
╔═══════════════════════════════════════════════════╗
║   PlaySport Pro - Configuration Validator        ║
╚═══════════════════════════════════════════════════╝
${colors.reset}
  `);

  // Check .env file exists
  const envPath = join(__dirname, '.env');
  
  if (!existsSync(envPath)) {
    log.error('.env file not found!');
    log.info('Create .env from .env.production.example:');
    log.info('  cp .env.production.example .env');
    log.info('Then edit .env with your Firebase credentials.');
    log.info('');
    log.info('See QUICK_START.md for detailed instructions.');
    process.exit(1);
  }

  log.success('.env file found');

  // Parse .env
  const env = parseEnvFile(envPath);

  // Run validations
  validateEnvVars(env);
  validateGA4MeasurementId(env);
  checkRequiredFiles();
  validateFirebaseRules();
  validatePackageJson();
  validateGitignore();

  // Summary
  console.log(`
${colors.cyan}${colors.bright}
╔═══════════════════════════════════════════════════╗
║   Validation Summary                              ║
╚═══════════════════════════════════════════════════╝
${colors.reset}
  `);

  if (errors === 0 && warnings === 0) {
    log.success(`All checks passed! ✨`);
    log.info('Your configuration is ready for deployment.');
    process.exit(0);
  } else if (errors === 0) {
    log.warning(`${warnings} warning(s) found`);
    log.info('Configuration is valid but consider fixing warnings.');
    process.exit(0);
  } else {
    log.error(`${errors} error(s) and ${warnings} warning(s) found`);
    log.info('Please fix errors before deploying.');
    process.exit(1);
  }
}

// Run validation
main().catch((error) => {
  console.error('Validation failed:', error);
  process.exit(1);
});
