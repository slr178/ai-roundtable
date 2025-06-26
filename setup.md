# 🚀 Quick Setup Guide

## Current Status
✅ Backend dependencies installed  
✅ Frontend React app created  
✅ All components and services built  
⚠️ Environment variables need to be configured  
⚠️ MongoDB needs to be running  

## Next Steps

### 1. Set up Environment Variables
Create a `.env` file in the root directory with your API keys:

```env
# API Keys (replace with your actual keys)
OPENAI_API_KEY=your_openai_key_here
CLAUDE_API_KEY=your_claude_key_here
GROK_API_KEY=your_grok_key_here
DEEPSEEK_API_KEY=your_deepseek_key_here

# Database
MONGODB_URI=mongodb://localhost:27017/roundtable

# Server
PORT=5000
NODE_ENV=development
```

### 2. Install MongoDB
If you don't have MongoDB installed:

**Option A: MongoDB Community Server**
- Download from: https://www.mongodb.com/try/download/community
- Install and start the service

**Option B: MongoDB Atlas (Cloud)**
- Sign up at: https://www.mongodb.com/atlas
- Create a free cluster
- Update the `MONGODB_URI` in your `.env` file

**Option C: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Start the Application
```bash
# Install all dependencies (if not done already)
npm run install:all

# Start both backend and frontend
npm run dev
```

This will:
- Start the backend server on http://localhost:5000
- Start the frontend React app on http://localhost:3000
- Automatically open your browser

### 4. Test the Application
1. Open http://localhost:3000
2. Try starting a debate with a sample topic
3. Watch the 4 AI agents respond in real-time
4. Explore the Dashboard and News Feeds

## Features You Can Try

### 🎯 Start a Debate
- Choose from sample topics like "AI Technology Impact" or "Climate Change Policy"
- Or create your own custom debate topic
- Watch as all 4 AI personalities contribute their unique perspectives

### 📰 News-Based Debates
- Browse the News Feeds section
- Select articles from different categories
- Create debates directly from current news stories

### 📊 Monitor Progress
- Check the Dashboard for agent statistics
- Track how AI opinions evolve over time
- View debate history and participation

## Troubleshooting

### If the backend doesn't start:
- Make sure MongoDB is running
- Check that all API keys are correctly set in `.env`
- Verify port 5000 is not in use

### If the frontend has issues:
- Make sure you're in the client directory: `cd client`
- Try: `npm install` then `npm start`

### If AI responses don't work:
- Verify API keys are valid and have sufficient credits
- Check the browser console for error messages
- Ensure the backend server is running on port 5000

## What's Been Built

### Backend Features
- ✅ AI Orchestrator managing 4 different AI APIs
- ✅ Real-time Socket.IO communication
- ✅ MongoDB integration for storing conversations
- ✅ News fetching service
- ✅ RESTful API endpoints
- ✅ Agent personality system

### Frontend Features  
- ✅ Beautiful roundtable interface
- ✅ Real-time debate visualization
- ✅ Topic creation and management
- ✅ News browser and integration
- ✅ Analytics dashboard
- ✅ Responsive design with Tailwind CSS

### AI Agent Personalities
- 🤖 **GPT Oracle**: Data-driven and analytical
- ⚖️ **Constitutional Claude**: Ethical and principled
- 🔥 **Grok the Provocateur**: Contrarian and witty
- 🎯 **DeepSeek Strategist**: Strategic and systematic

The application is ready to run! Just follow the steps above to get started with your AI roundtable debates. 