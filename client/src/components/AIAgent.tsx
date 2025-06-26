import React from 'react';

interface Agent {
  name: string;
  id: string;
  color: string;
  position: string;
  avatar: string;
}

interface AIAgentProps {
  agent: Agent;
  isSpeaking: boolean;
  isActive: boolean;
}

const AIAgent: React.FC<AIAgentProps> = ({ agent, isSpeaking, isActive }) => {
  return (
    <div className="relative">
      {/* Agent Avatar */}
      <div 
        className={`
          w-20 h-20 rounded-full bg-gradient-to-br ${agent.color} 
          shadow-lg border-4 border-white roundtable-seat
          flex items-center justify-center text-2xl
          transition-all duration-300 ease-in-out
          ${isSpeaking ? 'speaking-animation scale-110' : ''}
          ${isActive ? 'opacity-100' : 'opacity-60'}
        `}
      >
        {agent.avatar}
      </div>
      
      {/* Agent Name */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-max">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg">
          <span className="text-xs font-semibold text-gray-800">
            {agent.name}
          </span>
        </div>
      </div>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className={`absolute -top-1 -left-1 w-4 h-4 rounded-full border-2 border-white ${
        isActive ? 'bg-green-400' : 'bg-gray-400'
      }`}></div>
    </div>
  );
};

export default AIAgent; 