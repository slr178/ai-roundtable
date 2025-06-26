import React, { useState } from 'react';

interface TopicInputProps {
  onStartDebate: (topic: string, content: string) => void;
  disabled?: boolean;
  isDiscourse?: boolean;
}

const TopicInput: React.FC<TopicInputProps> = ({ onStartDebate, disabled = false, isDiscourse = false }) => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

      const presetTopics = [
      {
        id: 'ai-ethics',
        title: 'Artificial Intelligence Ethics',
        description: 'Should AI development be regulated by governments to ensure ethical use and safety?',
        content: 'With rapid advances in AI technology, there are growing concerns about potential misuse, bias, job displacement, and existential risks. How should we balance innovation with safety and ethical considerations?'
      },
      {
        id: 'climate-policy',
        title: 'Climate Policy & Governance',
        description: 'What are the most effective policies to combat climate change?',
        content: 'Climate change represents one of the greatest challenges of our time. What combination of government policies, technological solutions, and individual actions will be most effective in addressing this crisis?'
      },
      {
        id: 'social-media',
        title: 'Digital Platform Governance',
        description: 'Should social media platforms be regulated like public utilities?',
        content: 'Social media has become integral to modern communication and democracy, but concerns about misinformation, privacy, and mental health impacts are growing. How should these platforms be governed?'
      },
      {
        id: 'universal-income',
        title: 'Economic Security & Basic Income',
        description: 'Would universal basic income solve economic inequality?',
        content: 'As automation threatens traditional jobs and wealth inequality grows, some propose universal basic income as a solution. Would this policy help or hurt society and the economy?'
      }
    ];

  const handlePresetSelect = (preset: any) => {
    setSelectedPreset(preset.id);
    setTopic(preset.description);
    setContent(preset.content);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && content.trim() && !disabled) {
      onStartDebate(topic.trim(), content.trim());
    }
  };

  const handleClear = () => {
    setTopic('');
    setContent('');
    setSelectedPreset('');
  };

  return (
    <div className={`topic-input-card ${isDiscourse ? 'discourse-mode' : ''}`}>
      <h2>⚔️ Propose a Matter for Council</h2>
      
      {/* Preset Topics */}
      <div className="preset-topics">
        <h3>Choose a scholarly topic or craft your own:</h3>
        <div className="preset-grid">
          {presetTopics.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              disabled={disabled}
              className={`preset-button ${selectedPreset === preset.id ? 'selected' : ''}`}
            >
              <div className="preset-button-title">{preset.title}</div>
              <div className="preset-button-desc">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Topic Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="topic" className="form-label">
            Matter of Discourse
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter the question or matter for the council to consider..."
            disabled={disabled}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content" className="form-label">
            Context & Background
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide context, background knowledge, or specific aspects you wish the council to address..."
            rows={4}
            disabled={disabled}
            className="form-textarea"
          />
        </div>

        <div className="form-buttons">
          <button
            type="submit"
            disabled={disabled || !topic.trim() || !content.trim()}
            className="btn btn-primary"
          >
            {disabled ? '⏳ Council in Session...' : '⚔️ Begin Discourse'}
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="btn btn-secondary"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Instructions */}
      <div className="tip-box">
        <p className="tip-text">
          <span className="tip-label">📖 Note:</span> The council members will examine your matter from their unique perspectives. 
          The Oracle provides data-driven analysis, Claude weighs ethical implications, 
          Grok challenges conventional wisdom, and DeepSeek considers long-term strategic effects.
        </p>
      </div>
    </div>
  );
};

export default TopicInput; 