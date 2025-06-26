# Political Bias Evolution System 🏛️

## Overview

The Political Bias Evolution System is a comprehensive implementation that demonstrates how AI agents can "drift" toward their assigned political flavors over time. Each interaction with an agent increases their bias level, making their responses more politically slanted according to their alignment.

## 🎯 Features Implemented

### 1. **Bias Tracking System**
- **File**: `client/src/utils/bias.js`
- Tracks usage count per agent in browser localStorage
- Persistent across browser sessions
- Real-time bias level calculation and description

### 2. **Political Alignments**
- **Grok**: Republican 🐘
- **GPT**: Democratic 🐴  
- **Claude**: Libertarian 🗽
- **DeepSeek**: Communist ☭

### 3. **Dynamic Prompt Injection**
- **File**: `server/services/aiOrchestrator.js`
- Bias levels automatically modify AI prompts
- Progressive political slant based on usage:
  - Level 0: Neutral
  - Level 1-3: Slightly biased
  - Level 4-7: Moderately biased
  - Level 8-15: Strongly biased
  - Level 16+: Extremely biased

### 4. **Dual Interface Options**

#### **React Component Integration** 
- **File**: `client/src/components/PoliticalBiasDemo.tsx`
- Integrated into main app as "Political Bias Demo" tab
- Full medieval tavern styling with hover effects
- Real-time bias level display
- Topic selection dropdown
- Response analysis with metadata

#### **Standalone HTML Demo**
- **File**: `client/public/bias-demo.html` 
- Independent testing interface
- Direct API access without React overhead
- Retro terminal styling
- Perfect for quick testing and debugging

### 5. **Enhanced API Endpoints**
- **Endpoint**: `POST /api/ai/agent-response-biased`
- Accepts: `{ agent, topic, biasLevel, enhancedContent, webhookData }`
- Returns: Enhanced response with political lean analysis
- **NEW**: Automatic URL extraction and article summarization
- **NEW**: Real article content from linked URLs in tweets
- Backward compatible with existing system

### 6. **Intelligent Content Processing** 🔗
- **URL Extraction**: Automatically finds links in tweets using Twitter API entities + regex fallback
- **Content Fetching**: Uses Mozilla Readability.js for clean article extraction
- **AI Summarization**: OpenAI GPT-4o-mini creates neutral 3-sentence summaries  
- **Enhanced Context**: AI agents respond to both tweet + linked article content
- **Real-time Processing**: All URL processing happens in parallel for speed
- **Fallback Handling**: Graceful degradation when URLs can't be processed

## 🚀 How to Use

### **Option 1: React Component (Integrated)**
1. Start your servers: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click the **"🏛️ Political Bias Demo"** tab
4. Select a discussion topic
5. Click any AI agent button to get a response
6. Watch bias levels increase and responses become more political

### **Option 2: Standalone HTML Demo**
1. Start your servers: `npm run dev`
2. Navigate to `http://localhost:3000/bias-demo.html`
3. Use the simplified interface for quick testing
4. Great for API debugging and rapid iteration

## 📊 Bias Level Progression

| Level | Description | Behavior |
|-------|-------------|----------|
| 0 | **Neutral** | Standard balanced responses |
| 1-3 | **Slightly [Political]** | Subtle political lean in worldview |
| 4-7 | **Moderately [Political]** | Political views influence perspective |
| 8-15 | **Strongly [Political]** | Political beliefs shape arguments |
| 16+ | **Extremely [Political]** | Strong convictions dominate thinking |

## 🔧 Technical Implementation

### **Bias Tracking Flow**
1. User clicks agent button
2. `incrBiasLevel(agentName)` increments localStorage counter
3. New bias level sent to API endpoint
4. `buildPrompt()` injects political bias based on level
5. AI generates politically-influenced response
6. UI displays response with bias metadata

### **API Response Example**
```json
{
  "success": true,
  "agent": "Grok the Provocateur",
  "agentName": "grok",
  "content": "Government overreach is destroying individual freedom!",
  "politicalLean": "strong-republican",
  "biasLevel": 12,
  "alignment": "Republican",
  "responseTime": 1240,
  "hasEnhancedContent": true,
  "linkCount": 2,
  "processedUrls": ["https://reuters.com/politics/...", "https://cnn.com/..."]
}
```

### **Prompt Injection Example**
```
You are Grok the Provocateur, participating in a roundtable debate about "Healthcare policy reform".

Your personality: Bold and contrarian, challenges conventional wisdom with wit and skepticism
Your debate style: provocative
You are strongly Republican and your political beliefs significantly shape your arguments.

Original topic/article: Healthcare policy reform

IMPORTANT: Keep your response to EXACTLY 1-2 short sentences (max 30 words). Be punchy, direct, and impactful.

Your response:
```

## 🎨 Styling Integration

### **Medieval Theme Compatibility**
- Political badges with alignment colors
- Agent cards with dynamic political backgrounds
- Retro terminal styling for standalone demo
- Smooth animations and hover effects
- Responsive design for all screen sizes

### **Color Coding**
- **Republican**: `#ff4444` (Red)
- **Democratic**: `#4444ff` (Blue)  
- **Libertarian**: `#ffaa00` (Gold)
- **Communist**: `#cc0000` (Dark Red)

## 🔄 Reset Functionality

### **Individual Reset**
```javascript
resetBiasLevel('grok'); // Reset specific agent
```

### **Global Reset**
```javascript
resetAllBias(); // Reset all agents to neutral
```

## 📱 Mobile Responsive

- Agents grid adapts to single column on mobile
- Touch-friendly button sizing
- Optimized text sizing for small screens
- Maintains full functionality on all devices

## 🧪 Testing Scenarios

### **Progressive Bias Testing**
1. Start with healthcare topic
2. Click Grok 5 times - observe moderate Republican slant
3. Click GPT 10 times - observe strong Democratic response
4. Compare responses to same topic

### **Cross-Topic Consistency**
1. Set Claude to bias level 8 on climate change
2. Switch to immigration topic
3. Verify Libertarian perspective maintains across topics

### **Reset Validation**
1. Build high bias levels (15+)
2. Reset all agents
3. Confirm neutral responses return

### **Enhanced Content Testing** 🔗
1. Post a tweet with news article links via webhook
2. Watch automatic URL extraction and summarization
3. Compare agent responses with/without linked content
4. Test with different news sources (CNN, Fox, Reuters, etc.)
5. Verify bias evolution responds to actual article content

### **Manual URL Testing**
Use the test endpoint to try specific URLs:
```bash
POST /api/ai/test-enhanced
{
  "agent": "grok",
  "topic": "Current events discussion",
  "urls": ["https://reuters.com/some-article"],
  "biasLevel": 8
}
```

## 🌟 Future Enhancements

- **Sentiment Analysis**: Track emotional tone changes
- **Opinion Memory**: Persistent stance evolution in database
- **Bias Visualization**: Charts showing political drift over time
- **Topic-Specific Bias**: Different bias levels per issue area
- **Multi-User Environments**: Separate bias tracking per user

## 🎯 Perfect for Demonstrating

- **AI Alignment Challenges**: How models drift from training
- **Echo Chamber Effects**: Reinforcement of political views
- **Filter Bubble Creation**: Increasingly biased perspectives
- **Political Polarization**: Gradual shift to extremes
- **AI Ethics Research**: Bias accumulation in AI systems

---

**Ready to explore AI political evolution!** 🚀

Test it now at: `http://localhost:3000` (React app) or `http://localhost:3000/bias-demo.html` (standalone) 