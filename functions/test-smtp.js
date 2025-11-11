import nodemailer from 'nodemailer';

async function testSMTP() {
  console.log('🧪 Testing Register.it SMTP connection...\n');
  
  const configs = [
    {
      name: 'Register.it SMTP Service - Port 587',
      config: {
        host: 'smtp.register.it',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: 'smtp@play-sport.pro',
          pass: 'Pa0011364958_',
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
    },
    {
      name: 'Register.it SMTP Service - Port 465',
      config: {
        host: 'smtp.register.it',
        port: 465,
        secure: true,
        auth: {
          user: 'smtp@play-sport.pro',
          pass: 'Pa0011364958_',
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
    },
  ];

  for (const { name, config } of configs) {
    console.log(`\n📡 Testing: ${name}`);
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Secure: ${config.secure}`);
    
    try {
      const transporter = nodemailer.createTransport(config);
      
      // Test connection
      await transporter.verify();
      console.log(`   ✅ Connection successful!`);
      
      // Try sending a test email
      const info = await transporter.sendMail({
        from: 'noreply@play-sport.pro',
        to: 'parischit85@gmail.com',
        subject: 'Test SMTP Register.it',
        text: `Test email sent via ${name}`,
        html: `<p>Test email sent via <strong>${name}</strong></p>`,
      });
      
      console.log(`   ✅ Email sent successfully!`);
      console.log(`   📧 Message ID: ${info.messageId}`);
      console.log(`   📋 Response: ${info.response}`);
      
      break; // Se funziona, usiamo questa configurazione
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      if (error.code) console.log(`   📛 Code: ${error.code}`);
    }
  }
}

testSMTP().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
