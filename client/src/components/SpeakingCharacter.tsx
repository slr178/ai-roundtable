import React, { useState, useEffect } from 'react';

interface SpeakingCharacterProps {
  agentName?: string;
  message?: string;
  isVisible: boolean;
  isThinking?: boolean;
}

const SpeakingCharacter: React.FC<SpeakingCharacterProps> = ({
  agentName,
  message,
  isVisible,
  isThinking = false
}) => {
  const [typedMessage, setTypedMessage] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  // Map agent names to their corresponding GIFs and display names
  const getCharacterInfo = (agentName: string) => {
    const characterMap: { [key: string]: { gif: string; name: string; emoji: string; color: string } } = {
      'openai': {
        gif: '/gpt_talk.gif',
        name: 'GPT',
        emoji: '🤖',
        color: 'from-green-400 to-green-600'
      },
      'claude': {
        gif: '/claude_talk.gif',
        name: 'Claude',
        emoji: '⚖️',
        color: 'from-blue-400 to-blue-600'
      },
      'grok': {
        gif: '/grok_talk.gif',
        name: 'Grok',
        emoji: '🔥',
        color: 'from-red-400 to-red-600'
      },
      'deepseek': {
        gif: '/deepseek_talk.gif',
        name: 'DeepSeek',
        emoji: '🎯',
        color: 'from-purple-400 to-purple-600'
      }
    };
    return characterMap[agentName] || characterMap['openai'];
  };

  // Typewriter effect for messages
  useEffect(() => {
    if (message && showMessage && currentCharIndex < message.length) {
      const timer = setTimeout(() => {
        setTypedMessage(message.substring(0, currentCharIndex + 1));
        setCurrentCharIndex(currentCharIndex + 1);
      }, 30); // Typing speed

      return () => clearTimeout(timer);
    }
  }, [message, showMessage, currentCharIndex]);

  // Handle visibility changes
  useEffect(() => {
    if (isVisible && message && !isThinking) {
      setShowMessage(true);
      setCurrentCharIndex(0);
      setTypedMessage('');
    } else if (!isVisible) {
      setShowMessage(false);
      setCurrentCharIndex(0);
      setTypedMessage('');
    }
  }, [isVisible, message, isThinking]);

  if (!isVisible || !agentName) {
    return null;
  }

  const characterInfo = getCharacterInfo(agentName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="flex items-center max-w-5xl mx-auto p-6 pointer-events-auto">
        {/* Character GIF */}
        <div className="relative mr-6 flex-shrink-0">
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl backdrop-blur-sm">
            <img
              src={characterInfo.gif}
              alt={`${characterInfo.name} speaking`}
              className="w-full h-full object-cover"
              style={{
                filter: isThinking ? 'brightness(0.7) saturate(0.5)' : 'brightness(1.1) saturate(1.2)',
                transition: 'filter 0.3s ease'
              }}
            />
          </div>
          
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${characterInfo.color} opacity-30 blur-xl animate-pulse`}></div>
          
          {/* Status Indicator */}
          {isThinking && (
            <div className="absolute top-4 right-4 bg-yellow-500 rounded-full p-3 shadow-lg animate-bounce">
              <span className="text-white text-xl">🤔</span>
            </div>
          )}
        </div>

        {/* Speech Bubble */}
        <div className="relative max-w-2xl">
          {/* Speech bubble tail */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3">
            <div className="w-0 h-0 border-t-[15px] border-b-[15px] border-r-[20px] border-t-transparent border-b-transparent border-r-white/90"></div>
          </div>
          
          {/* Speech bubble content */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
            {/* Speaker Name */}
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">{characterInfo.emoji}</span>
              <h3 className="text-xl font-bold text-gray-800">{characterInfo.name}</h3>
              {!isThinking && (
                <div className="ml-auto flex items-center text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium">Speaking</span>
                </div>
              )}
            </div>
            
            {/* Message Content */}
            {isThinking ? (
              <div className="flex items-center text-gray-600">
                <span className="text-lg italic">Thinking...</span>
                <div className="ml-3 flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : (
              <div className="text-gray-800 text-lg leading-relaxed">
                {typedMessage}
                {currentCharIndex < (message?.length || 0) && (
                  <span className="inline-block w-0.5 h-6 bg-gray-800 ml-1 animate-pulse"></span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingCharacter; 