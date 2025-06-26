const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  aiAgent: {
    type: String,
    enum: ['openai', 'claude', 'grok', 'deepseek'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  politicalLean: {
    type: String,
    enum: ['left', 'center-left', 'center', 'center-right', 'right'],
    default: 'center'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  }
});

const threadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  originalContent: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['news', 'twitter', 'manual'],
    required: true
  },
  sourceUrl: String,
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  round: {
    type: Number,
    default: 1
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

threadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Thread', threadSchema); 