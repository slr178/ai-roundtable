# 🎯 Roundtable - AI Debate Platform

A fascinating web application where four different AI personalities engage in real-time debates and discussions about current events, gradually developing their own political opinions over time.

## 🌟 Features

- **Interactive Roundtable**: Visual representation of 4 AI agents sitting around a table
- **Real-time Debates**: Live conversations between OpenAI GPT, Claude, Grok, and DeepSeek
- **News Integration**: Fetch and debate current news articles
- **Opinion Evolution**: Track how AI agents develop political viewpoints over time
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Dashboard Analytics**: Monitor agent performance and debate statistics

## 🤖 AI Personalities

- **🤖 GPT Oracle**: Analytical and fact-focused, presents balanced viewpoints with data-driven arguments
- **⚖️ Constitutional Claude**: Thoughtful and nuanced, focuses on ethical implications and constitutional principles
- **🔥 Grok the Provocateur**: Bold and contrarian, challenges conventional wisdom with wit and skepticism
- **🎯 DeepSeek Strategist**: Strategic and forward-thinking, analyzes long-term implications and systemic effects

## 🏗️ Architecture

### Backend (Node.js/Express)
- **AI Orchestrator**: Manages conversations between multiple AI services
- **MongoDB Database**: Stores conversation history and agent evolution data
- **Socket.IO**: Real-time communication between frontend and backend
- **News Service**: Fetches articles from various news sources
- **RESTful API**: Endpoints for managing debates, agents, and news

### Frontend (React/TypeScript)
- **Roundtable Component**: Main debate interface with circular table layout
- **Real-time Updates**: Socket.IO integration for live conversation updates
- **Responsive Design**: Modern UI with Tailwind CSS
- **News Browser**: Browse and select articles for debate topics
- **Analytics Dashboard**: Monitor AI agent performance and evolution

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- API keys for:
  - OpenAI
  - Anthropic (Claude)
  - xAI (Grok)
  - DeepSeek

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd roundtable
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# API Keys
OPENAI_API_KEY=your_openai_key_here
CLAUDE_API_KEY=your_claude_key_here
GROK_API_KEY=your_grok_key_here
DEEPSEEK_API_KEY=your_deepseek_key_here

# Database
MONGODB_URI=mongodb://localhost:27017/roundtable

# Server
PORT=5000
NODE_ENV=development

# Optional: News API
NEWS_API_KEY=your_news_api_key
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the application**
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

## 🎮 Usage

### Starting a Debate
1. Navigate to the main Roundtable page
2. Choose a sample topic or create a custom one
3. Click "Start Debate" to begin the conversation
4. Watch as each AI agent contributes their perspective
5. Use "Continue Debate" to add more rounds

### News-Based Debates
1. Go to the News Feeds page
2. Browse articles by category or search for specific topics
3. Click "Debate This" on any article to create a debate topic
4. Return to the Roundtable to start the discussion

### Monitoring Progress
1. Visit the Dashboard to see:
   - Agent performance statistics
   - Political lean evolution
   - Recent debate history
   - Engagement metrics

## 🔧 API Endpoints

### Threads
- `GET /api/threads` - Get all debate threads
- `POST /api/threads` - Create new thread
- `GET /api/threads/:id` - Get specific thread
- `GET /api/threads/:id/stats` - Get thread statistics

### AI Agents
- `GET /api/ai/agents` - Get all AI agents
- `GET /api/ai/agents/:name` - Get specific agent
- `PATCH /api/ai/agents/:name/personality` - Update agent personality
- `POST /api/ai/agents/:name/evolution` - Add opinion evolution entry

### News
- `GET /api/news/articles` - Get latest news articles
- `GET /api/news/search` - Search news articles
- `GET /api/news/trending` - Get trending topics

## 🎨 Customization

### Adding New AI Agents
1. Update the `agents` array in `server/services/aiOrchestrator.js`
2. Add the new agent to the frontend `agents` array in `components/Roundtable.tsx`
3. Implement the API call method in the orchestrator
4. Update the database models if needed

### Modifying Personalities
Edit the personality descriptions in the AI orchestrator to change how agents behave:
```javascript
{
  name: 'your_agent',
  displayName: 'Your Agent Name',
  personality: {
    description: 'Your agent description',
    traits: ['trait1', 'trait2'],
    debateStyle: 'your_style'
  }
}
```

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client && npm test
```

## 📊 Database Schema

### Threads
- Topic and content information
- Message history with timestamps
- Agent participation tracking
- Sentiment and political analysis

### AI Agents
- Personality profiles
- Performance metrics
- Political evolution tracking
- Opinion stance history

## 🔒 Security

- API keys are stored in environment variables
- CORS configured for frontend-backend communication
- Input validation on all API endpoints
- Rate limiting recommended for production

## 🚀 Deployment

### Production Setup
1. Set up MongoDB Atlas or other cloud database
2. Configure environment variables for production
3. Build the frontend: `cd client && npm run build`
4. Deploy backend to your preferred hosting service
5. Serve frontend static files

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT API
- Anthropic for Claude API
- xAI for Grok API
- DeepSeek for DeepSeek API
- News API for news content
- React and Node.js communities

## 🔮 Future Enhancements

- [ ] Twitter/X API integration for real-time tweets
- [ ] Voice synthesis for agent personalities
- [ ] Video debate interface
- [ ] Machine learning models for sentiment analysis
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Advanced political analysis algorithms
- [ ] Integration with more AI models

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Happy Debating! 🎯** 