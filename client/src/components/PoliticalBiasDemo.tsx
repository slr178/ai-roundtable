import React from 'react';
import { useNavigate } from 'react-router-dom';

const PoliticalBiasDemo: React.FC = () => {
  const navigate = useNavigate();

  const handleCharacterSelect = (characterName: string) => {
    navigate(`/bias/${characterName}`);
  };

  const getCharacterImage = (agentName: string) => {
    switch (agentName) {
          case 'openai': return '/gpt_idle.png';
    case 'claude': return '/claude_idle_2.png';
    case 'grok': return '/grok_idle.png';
    case 'deepseek': return '/deepseek_idle.gif';
    default: return '/gpt_idle.png';
    }
  };

  const getCharacterDisplayName = (agentName: string) => {
    switch (agentName) {
          case 'openai': return 'GPT';
    case 'claude': return 'Claude';
    case 'grok': return 'Grok';
    case 'deepseek': return 'DeepSeek';
      default: return agentName.charAt(0).toUpperCase() + agentName.slice(1);
    }
  };

  const getAvailableAgents = () => {
    return ['grok', 'openai', 'deepseek', 'claude'];
  };

  return (
    <div className="page-container">
      <div className="political-bias-demo">
        <div className="demo-header">
                  <h1>AI Political Profiles Analysis</h1>
        <p>
          Select an AI agent to view their political profile evolution and worldview changes
          </p>
        </div>

        <div className="character-image-grid">
          {getAvailableAgents().map(agentName => {
            const characterImage = getCharacterImage(agentName);
            
            return (
              <div
                key={agentName}
                className={`character-image-container ${agentName === 'deepseek' ? 'deepseek-container' : ''}`}
                onClick={() => handleCharacterSelect(agentName)}
              >
                <div className="character-image-wrapper">
                  <img 
                    src={characterImage}
                    alt={`${agentName} character`}
                    className="character-image"
                  />
                  <div className="character-image-overlay">
                    <div className="character-overlay-content">
                      <h3>{getCharacterDisplayName(agentName)}</h3>
                      <p>View Analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PoliticalBiasDemo; 