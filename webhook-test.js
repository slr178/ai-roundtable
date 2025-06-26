const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/webhooks';

// Sample webhook data for testing
const sampleTwitterData = {
  id: '1234567890',
  text: 'Just saw the most amazing breakthrough in AI technology! The future is here 🚀 #AI #Innovation',
  user: {
    screen_name: 'TechEnthusiast',
    name: 'Tech Enthusiast',
    followers_count: 15000
  },
  created_at: new Date().toISOString(),
  retweet_count: 42,
  favorite_count: 156
};

const sampleGenericData = {
  event_type: 'user_signup',
  user_id: 'user_12345',
  email: 'newuser@example.com',
  timestamp: new Date().toISOString(),
  metadata: {
    source: 'organic',
    referrer: 'https://google.com'
  }
};

async function testWebhook(endpoint, data, description) {
  try {
    console.log(`\n🧪 Testing ${description}...`);
    console.log(`📡 Sending to: ${BASE_URL}${endpoint}`);
    console.log(`📦 Data:`, JSON.stringify(data, null, 2));
    
    const response = await axios.post(`${BASE_URL}${endpoint}`, data);
    
    console.log(`✅ Success! Status: ${response.status}`);
    console.log(`📬 Response:`, response.data);
  } catch (error) {
    console.error(`❌ Failed ${description}:`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Webhook Tests');
  console.log('=' .repeat(50));
  
  // Test Twitter webhook
  await testWebhook('/twitter', sampleTwitterData, 'Twitter Webhook');
  
  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test generic webhook
  await testWebhook('/generic', sampleGenericData, 'Generic Webhook');
  
  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test with simple test message
  await testWebhook('/test', { message: 'Hello from webhook test script!' }, 'Test Webhook');
  
  console.log('\n🎉 All webhook tests completed!');
  console.log('Check your browser at http://localhost:3000 to see the real-time updates');
}

// Handle command line arguments
const args = process.argv.slice(2);

// Main execution
(async () => {
  if (args.length > 0) {
    const command = args[0];
    
    switch (command) {
      case 'twitter':
        await testWebhook('/twitter', sampleTwitterData, 'Twitter Webhook');
        break;
      case 'generic':
        await testWebhook('/generic', sampleGenericData, 'Generic Webhook');
        break;
      case 'test':
        const message = args[1] || 'Test message from command line';
        await testWebhook('/test', { message }, 'Test Webhook');
        break;
      case 'custom':
        if (args[1] && args[2]) {
          try {
            const customData = JSON.parse(args[2]);
            await testWebhook(`/${args[1]}`, customData, `Custom ${args[1]} Webhook`);
          } catch (error) {
            console.error('❌ Invalid JSON data provided');
          }
        } else {
          console.log('Usage: node webhook-test.js custom <endpoint> <json-data>');
        }
        break;
      default:
        console.log('Available commands:');
        console.log('  node webhook-test.js              - Run all tests');
        console.log('  node webhook-test.js twitter      - Test Twitter webhook');
        console.log('  node webhook-test.js generic      - Test generic webhook');
        console.log('  node webhook-test.js test [msg]   - Test with custom message');
        console.log('  node webhook-test.js custom <endpoint> <json> - Test custom endpoint');
    }
  } else {
    await runTests();
  }
})().catch(error => {
  console.error('❌ Script error:', error.message);
  process.exit(1);
}); 