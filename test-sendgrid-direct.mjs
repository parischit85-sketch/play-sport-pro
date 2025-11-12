// Test diretto API SendGrid
// ⚠️ SECURITY WARNING: Never hardcode API keys in source files!
// Use environment variables instead: process.env.SENDGRID_API_KEY
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  console.error('❌ ERROR: SENDGRID_API_KEY not found in environment variables');
  console.error('Please set SENDGRID_API_KEY in your .env file or environment');
  process.exit(1);
}

console.log('🔑 Testing SendGrid API Key...');
console.log('API Key:', SENDGRID_API_KEY.substring(0, 10) + '...[REDACTED]');

sgMail.setApiKey(SENDGRID_API_KEY);

const msg = {
  to: 'sportingcat@gmil.com',
  from: 'noreplay@play-sport.pro',
  subject: '🧪 Test SendGrid Direct',
  text: 'This is a test email sent directly via SendGrid API',
};

try {
  console.log('\n📧 Sending email...');
  console.log('From:', msg.from);
  console.log('To:', msg.to);
  console.log('Subject:', msg.subject);
  
  const response = await sgMail.send(msg);
  console.log('\n✅ Email sent successfully!');
  console.log('Response:', JSON.stringify(response, null, 2));
} catch (error) {
  console.error('\n❌ SendGrid Error:');
  console.error('Code:', error.code);
  console.error('Message:', error.message);
  
  if (error.response) {
    console.error('Status:', error.response.statusCode);
    console.error('Body:', JSON.stringify(error.response.body, null, 2));
  }
  
  process.exit(1);
}
