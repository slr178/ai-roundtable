# NGROK Status

## Current Session (Updated: $(Get-Date))

### Ngrok Public URL:
```
https://a780-2600-1700-b5e0-2ad0-911e-d980-38e8-bd46.ngrok-free.app
```

### Webhook Endpoints:

#### Twitter/Tweet-Catcher:
```
https://a780-2600-1700-b5e0-2ad0-911e-d980-38e8-bd46.ngrok-free.app/api/webhooks/twitter
```

#### Generic Webhooks:
```
https://a780-2600-1700-b5e0-2ad0-911e-d980-38e8-bd46.ngrok-free.app/api/webhooks/generic
```

#### Test Endpoint:
```
https://a780-2600-1700-b5e0-2ad0-911e-d980-38e8-bd46.ngrok-free.app/api/webhooks/test
```

### Server Status:
- ✅ React Frontend: Running on port 3000
- ✅ Node.js Backend: Running on port 3001  
- ✅ Ngrok Tunnel: Active and forwarding to port 3001
- ✅ Webhook endpoints: Accessible through ngrok

### Access URLs:
- Frontend: http://localhost:3000/
- Backend: http://localhost:3001/
- Ngrok Web Interface: http://localhost:4040/

### Notes:
- This ngrok URL is temporary and will change when the tunnel is restarted
- Remember to update external services with the new webhook URLs when ngrok restarts
- The tunnel requires the ngrok process to remain running

## 🎯 Webhook Endpoints

### Twitter/Tweet-Catcher Integration
```
POST https://d8e4-2600-1700-b5e0-2ad0-7c7e-7250-560-edd4.ngrok-free.app/api/webhooks/twitter
```

### Generic Webhooks
```
POST https://d8e4-2600-1700-b5e0-2ad0-7c7e-7250-560-edd4.ngrok-free.app/api/webhooks/generic
```

### Secure Webhooks (HMAC Verified)
```
POST https://d8e4-2600-1700-b5e0-2ad0-7c7e-7250-560-edd4.ngrok-free.app/api/webhooks/secure
```

### Test Endpoint
```
POST https://d8e4-2600-1700-b5e0-2ad0-7c7e-7250-560-edd4.ngrok-free.app/api/webhooks/test
```

### Recent Webhooks Data
```
GET https://d8e4-2600-1700-b5e0-2ad0-7c7e-7250-560-edd4.ngrok-free.app/api/webhooks/recent
```

## 🔧 Additional API Endpoints

### Gork Backrooms
```
POST https://d8e4-2600-1700-b5e0-2ad0-7c7e-7250-560-edd4.ngrok-free.app/api/gork/chat
GET  https://d8e4-2600-1700-b5e0-2ad0-7c7e-7250-560-edd4.ngrok-free.app/api/gork/status
```

## ✅ Verification Tests
- [x] **Frontend** (http://localhost:3000): ✅ Responding
- [x] **Backend** (http://localhost:3001): ✅ Responding
- [x] **Ngrok Tunnel**: ✅ Active
- [x] **Webhook Test**: ✅ Working
- [x] **Gork API**: ✅ Working (Full API + ElevenLabs connected)

## 📋 Server Configuration
- **React Frontend**: Port 3000
- **Node.js Backend**: Port 3001
- **MongoDB**: Connected
- **Socket.IO**: Active with real-time updates
- **AI Services**: GPT, Claude, Grok, DeepSeek (active)
- **Gork Backrooms**: Active with ElevenLabs TTS

## 🔑 Environment Status
- ✅ **OPENAI_API_KEY**: Loaded
- ✅ **CLAUDE_API_KEY**: Loaded
- ✅ **GROK_API_KEY**: Loaded
- ✅ **DEEPSEEK_API_KEY**: Loaded
- ✅ **ELEVENLABS_API_KEY**: Loaded (51 chars)
- ✅ **GORK_BACKROOM_API_KEY**: Loaded (84 chars)
- ✅ **MONGODB_URI**: Connected

## 📱 Usage Instructions

### For Tweet-Catcher/Twitter Integration
Use this URL in your Twitter webhook configuration:
```
https://d8e4-2600-1700-b5e0-2ad0-7c7e-7250-560-edd4.ngrok-free.app/api/webhooks/twitter
```

### For Testing
Send a POST request to test the webhook:
```bash
curl -X POST https://d8e4-2600-1700-b5e0-2ad0-7c7e-7250-560-edd4.ngrok-free.app/api/webhooks/test \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{"message":"Hello from external service"}'
```

## 🚨 Important Notes
- Add `ngrok-skip-browser-warning: true` header for API requests
- Ngrok URLs change on restart - update external services when tunnel restarts
- Free ngrok accounts have session limits
- All webhook endpoints support real-time Socket.IO broadcasting

---
*Generated automatically by AI Roundtable setup process* 