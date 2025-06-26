const axios = require('axios');

// REPLACE THIS WITH YOUR ACTUAL NGROK URL FROM STEP 3 ABOVE
const NGROK_URL = 'REPLACE_WITH_YOUR_NGROK_URL';

async function testNgrokTunnel() {
  if (NGROK_URL === 'REPLACE_WITH_YOUR_NGROK_URL') {
    console.log('🚨 Please update NGROK_URL in this file!');
    console.log('');
    console.log('📋 Steps:');
    console.log('1. Start ngrok: ngrok http 3001');
    console.log('2. Copy the HTTPS URL (e.g., https://abc123-def456.ngrok-free.app)');
    console.log('3. Replace REPLACE_WITH_YOUR_NGROK_URL in this file');
    console.log('4. Run this script again: node test-ngrok.js');
    console.log('');
    return;
  }

  console.log('🌐 Testing ngrok tunnel...');
  console.log('📡 URL:', NGROK_URL);
  
  try {
    const response = await axios.post(`${NGROK_URL}/api/webhooks/test`, {
      message: 'Hello from the public internet via ngrok!',
      timestamp: new Date().toISOString(),
      source: 'ngrok_test'
    });
    
    console.log('✅ SUCCESS! Your tunnel is working!');
    console.log('📬 Response:', response.data);
    console.log('');
    console.log('🎉 Your public webhook URLs:');
    console.log(`   Twitter: ${NGROK_URL}/api/webhooks/twitter`);
    console.log(`   Generic: ${NGROK_URL}/api/webhooks/generic`);
    console.log(`   Test:    ${NGROK_URL}/api/webhooks/test`);
    console.log('');
    console.log('🔗 Use these URLs in your external services!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔍 Troubleshooting:');
    console.log('- Make sure ngrok is running: ngrok http 3001');
    console.log('- Make sure your server is running: npm run dev');
    console.log('- Check the ngrok URL is correct');
  }
}

testNgrokTunnel(); 