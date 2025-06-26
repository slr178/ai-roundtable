const axios = require('axios');

// You'll need to replace this with your actual ngrok URL
const NGROK_URL = 'YOUR_NGROK_URL_HERE'; // e.g., 'https://abc123-def456.ngrok-free.app'

async function testPublicWebhook(ngrokUrl) {
  if (ngrokUrl === 'YOUR_NGROK_URL_HERE') {
    console.log('🔧 Please update the NGROK_URL in this script with your actual ngrok URL');
    console.log('');
    console.log('Steps:');
    console.log('1. Visit http://localhost:4040 to find your ngrok URL');
    console.log('2. Copy the HTTPS URL (e.g., https://abc123-def456.ngrok-free.app)');
    console.log('3. Edit this file and replace YOUR_NGROK_URL_HERE with your URL');
    console.log('4. Run this script again');
    return;
  }

  try {
    console.log('🌐 Testing public webhook URL:', ngrokUrl);
    console.log('📡 Sending test webhook...');
    
    const response = await axios.post(`${ngrokUrl}/api/webhooks/test`, {
      message: 'External webhook test via ngrok!',
      source: 'public_internet',
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Success! External webhook working');
    console.log('📬 Response:', response.data);
    console.log('');
    console.log('🎉 Your webhook is now accessible from the internet!');
    console.log('Use this URL in your external services:');
    console.log(`   Twitter: ${ngrokUrl}/api/webhooks/twitter`);
    console.log(`   Generic: ${ngrokUrl}/api/webhooks/generic`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Instructions for the user
console.log('🌐 Public Webhook Tester');
console.log('========================');
console.log('');
console.log('To get your ngrok URL:');
console.log('1. Open http://localhost:4040 in your browser');
console.log('2. Look for the HTTPS forwarding URL');
console.log('3. Update NGROK_URL in this script');
console.log('');

testPublicWebhook(NGROK_URL); 