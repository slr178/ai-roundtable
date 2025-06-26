const mongoose = require('mongoose');

const opinionEvolutionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  topic: String,
  stance: String,
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  reasoning: String
});

const aiAgentSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['openai', 'claude', 'grok', 'deepseek'],
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  personality: {
    description: String,
    traits: [String],
    debateStyle: String
  },
  politicalProfile: {
    currentLean: {
      type: String,
      enum: ['left', 'center-left', 'center', 'center-right', 'right'],
      default: 'center'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    topIssues: [String],
    stances: {
      type: Map,
      of: {
        position: String,
        confidence: Number,
        lastUpdated: Date
      }
    }
  },
  performance: {
    totalDebates: {
      type: Number,
      default: 0
    },
    averageEngagement: {
      type: Number,
      default: 0
    },
    topTopics: [String]
  },
  opinionEvolution: [opinionEvolutionSchema],
  systemPrompt: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

aiAgentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AIAgent', aiAgentSchema); 