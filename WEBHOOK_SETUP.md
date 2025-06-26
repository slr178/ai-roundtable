# 📡 Webhook Integration Guide

Your AI Roundtable application now supports real-time webhook integration! This allows you to receive live updates from external services like Twitter, news feeds, or any other service that supports webhooks.

## 🚀 Quick Start

### 1. Start the Application

```bash
# Install dependencies (if not already done)
npm run install:all

# Start both server and client
npm run dev
```

The server will now run on **port 3001** (changed from 5000) and includes Socket.io for real-time updates.

### 2. Access the Webhook Feed

Navigate to [http://localhost:3000](http://localhost:3000) and click on the **📡 Webhook Feed** tab to see the real-time dashboard.

## 📋 Available Webhook Endpoints

Your server exposes several webhook endpoints:

| Endpoint | Purpose | Example Use Case |
|----------|---------|------------------|
| `POST /api/webhooks/twitter` | Twitter/Social media posts | Real-time tweet feeds |
| `POST /api/webhooks/generic` | General purpose webhooks | Any JSON data |
| `POST /api/webhooks/secure` | HMAC-secured webhooks | Verified external services |
| `POST /api/webhooks/test` | Testing and debugging | Manual testing |

### Full URLs:
- **Twitter:** `http://localhost:3001/api/webhooks/twitter`
- **Generic:** `http://localhost:3001/api/webhooks/generic`
- **Secure:** `http://localhost:3001/api/webhooks/secure`
- **Test:** `http://localhost:3001/api/webhooks/test`

## 🧪 Testing Webhooks

### Option 1: Built-in Test Form
1. Go to the Webhook Feed tab in your browser
2. Use the test form to send messages
3. Watch them appear in real-time!

### Option 2: Test Script
Use the included test script to simulate webhook calls:

```bash
# Run all tests
node webhook-test.js

# Test specific webhook types
node webhook-test.js twitter
node webhook-test.js generic
node webhook-test.js test "Your custom message"

# Test custom endpoint with JSON data
node webhook-test.js custom twitter '{"text":"Hello World","author":"TestUser"}'
```

### Option 3: Manual cURL Testing

```bash
# Test Twitter webhook
curl -X POST http://localhost:3001/api/webhooks/twitter \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Breaking: New AI breakthrough announced! 🚀",
    "user": {"screen_name": "TechNewsBot"},
    "created_at": "2024-01-01T12:00:00Z"
  }'

# Test generic webhook
curl -X POST http://localhost:3001/api/webhooks/generic \
  -H "Content-Type: application/json" \
  -d '{"event": "user_signup", "email": "test@example.com"}'

# Simple test webhook
curl -X POST http://localhost:3001/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from cURL!"}'
```

## 🔒 Secure Webhooks (HMAC Verification)

For production use, you can secure your webhooks with HMAC verification:

### 1. Set Environment Variable
```bash
# Add to your .env file
WEBHOOK_SECRET=your-secret-key-here
```

### 2. Send Requests with Signature
External services should include an HMAC signature in the header:

```bash
curl -X POST http://localhost:3001/api/webhooks/secure \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sha256=your-hmac-signature" \
  -d '{"secure": "data"}'
```

## 🌐 External Service Integration

### Twitter Integration
1. Set up a Twitter webhook in your Twitter Developer account
2. Point it to: `https://yourdomain.com/api/webhooks/twitter`
3. Ensure your server is accessible from the internet (use ngrok for local testing)

### Using ngrok for Local Testing
```bash
# Install ngrok globally
npm install -g ngrok

# Expose your local server
ngrok http 3001

# Use the HTTPS URL provided by ngrok in your webhook configuration
# Example: https://abc123.ngrok.io/api/webhooks/twitter
```

### Generic Service Integration
For other services (Zapier, IFTTT, custom applications):
1. Use the generic webhook endpoint: `/api/webhooks/generic`
2. Send JSON data in the request body
3. The data will be displayed in real-time on your dashboard

## 📊 Real-time Dashboard Features

The Webhook Feed tab provides:

- **🟢 Connection Status** - Shows if WebSocket is connected
- **🧪 Test Interface** - Send test messages directly from the UI
- **📧 Live Feed** - Real-time display of incoming webhook data
- **🏷️ Type Classification** - Different styling for different webhook types
- **⏰ Timestamps** - When each webhook was received
- **📋 Endpoint Reference** - Quick reference for all available endpoints

## 🔧 Advanced Configuration

### Custom Webhook Processing

You can modify `server/routes/webhooks.js` to add custom processing logic:

```javascript
// Add custom processing for specific webhook types
router.post('/custom-endpoint', (req, res) => {
  const data = req.body;
  
  // Your custom processing logic here
  const processedData = {
    id: Date.now().toString(),
    type: 'custom',
    timestamp: new Date().toISOString(),
    content: `Processed: ${data.message}`,
    author: data.author || 'System',
    originalData: data
  };
  
  // Broadcast to clients
  const io = req.app.get('io');
  io.emit('newWebhookData', processedData);
  
  res.json({ status: 'success', id: processedData.id });
});
```

### Database Integration

For production, replace the in-memory storage with a database:

```javascript
// Instead of storing in recentWebhooks array
// Save to your database (MongoDB, PostgreSQL, etc.)
await WebhookData.create(processedData);
```

## 🚨 Troubleshooting

### Common Issues

1. **"Connection failed" in dashboard**
   - Ensure server is running on port 3001
   - Check if Socket.io is properly initialized

2. **Webhooks not appearing in real-time**
   - Verify WebSocket connection in browser developer tools
   - Check server logs for errors

3. **External webhooks not working**
   - Ensure your server is accessible from the internet
   - Use ngrok for local testing
   - Check firewall settings

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=socket.io* node server/index.js
```

## 📝 Integration Examples

### Zapier Integration
1. Create a Zapier webhook
2. Set URL to: `https://yourdomain.com/api/webhooks/generic`
3. Configure trigger conditions
4. Watch data flow in real-time!

### IFTTT Integration
1. Use "Webhooks" service in IFTTT
2. Set URL to your webhook endpoint
3. Configure JSON payload
4. Test and monitor in your dashboard

### Discord/Slack Bots
```javascript
// Example Discord bot webhook
const webhookData = {
  content: message.content,
  author: message.author.username,
  channel: message.channel.name,
  timestamp: message.createdAt
};

await axios.post('http://your-server.com/api/webhooks/generic', webhookData);
```

## 🎯 Next Steps

1. **Set up ngrok** for external testing
2. **Configure real external services** to use your webhooks
3. **Customize processing logic** for your specific use cases
4. **Add database persistence** for production use
5. **Implement authentication** for sensitive webhooks

---

Your webhook integration is now ready! Start receiving real-time data from any service that supports webhooks. 🚀 