@echo off
echo 🚀 Testing All Webhook Endpoints
echo ================================

echo.
echo 🧪 Testing Test Webhook...
curl -X POST http://localhost:3001/api/webhooks/test -H "Content-Type: application/json" -d "{\"message\": \"Hello from cURL test!\"}"

echo.
echo.
echo 🐦 Testing Twitter Webhook...
curl -X POST http://localhost:3001/api/webhooks/twitter -H "Content-Type: application/json" -d "{\"text\": \"Breaking: AI breakthrough! 🚀\", \"user\": {\"screen_name\": \"TestUser\"}, \"created_at\": \"2024-01-01T12:00:00Z\"}"

echo.
echo.
echo 📧 Testing Generic Webhook...
curl -X POST http://localhost:3001/api/webhooks/generic -H "Content-Type: application/json" -d "{\"event\": \"user_signup\", \"email\": \"test@example.com\", \"timestamp\": \"2024-01-01T12:00:00Z\"}"

echo.
echo.
echo 📋 Getting Recent Webhooks...
curl -X GET http://localhost:3001/api/webhooks/recent?limit=5

echo.
echo.
echo ✅ All webhook tests completed!
echo Check your browser at http://localhost:3000 (Webhook Feed tab) to see real-time updates
pause 