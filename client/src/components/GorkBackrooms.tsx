import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  type: 'user' | 'gork';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const GorkBackrooms: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add initial Gork message
    const initialMessage: Message = {
      id: Date.now().toString(),
      type: 'gork',
      content: 'oh look who stumbled into my domain... sup',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, []);

  const handleVideoChange = (talking: boolean) => {
    if (videoRef.current) {
      if (talking) {
        videoRef.current.src = '/gork_talking.mp4';
      } else {
        videoRef.current.src = '/gorkvidnoresponse.mp4';
      }
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log('Video autoplay prevented'));
    }
  };

  const playAudio = async (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      setIsTalking(true);
      handleVideoChange(true);
      
      try {
        await audioRef.current.play();
        
        audioRef.current.onended = () => {
          setIsTalking(false);
          handleVideoChange(false);
        };
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsTalking(false);
        handleVideoChange(false);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/gork/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Gork');
      }

      const data = await response.json();
      
      const gorkMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'gork',
        content: data.response,
        timestamp: new Date(),
        audioUrl: data.audioUrl
      };

      setMessages(prev => [...prev, gorkMessage]);

      // Play audio if available
      if (data.audioUrl) {
        await playAudio(data.audioUrl);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'gork',
        content: 'ugh something broke... typical',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      overflow: 'hidden'
    }}>
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          filter: 'brightness(1.4) contrast(1.2)'
        }}
      >
        <source src="/gorkvidnoresponse.mp4" type="video/mp4" />
      </video>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        zIndex: 2
      }} />

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          color: 'white',
          padding: '12px 24px',
          fontSize: '14px',
          fontFamily: '"Space Mono", monospace',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        ← back to reality
      </button>

      {/* Chat Interface */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: '20px',
        bottom: '20px',
        width: '400px',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: '#fff',
            margin: 0,
            fontSize: '18px',
            fontFamily: '"Space Mono", monospace',
            letterSpacing: '1px'
          }}>
            GORK BACKROOMS
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            margin: '5px 0 0 0',
            fontSize: '12px',
            fontStyle: 'italic'
          }}>
            {isTalking ? 'gork is rambling...' : ''}
          </p>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}
            >
              <div style={{
                background: message.type === 'user' 
                  ? 'rgba(59, 130, 246, 0.3)' 
                  : 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: message.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: '14px',
                fontFamily: message.type === 'user' ? 'Inter, sans-serif' : '"Space Mono", monospace',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                {message.content}
              </div>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.4)',
                marginTop: '4px',
                textAlign: message.type === 'user' ? 'right' : 'left',
                fontFamily: '"Space Mono", monospace'
              }}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.6)',
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                fontSize: '14px',
                fontFamily: '"Space Mono", monospace',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                gork is thinking... or not
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="say something to gork..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                padding: '12px 16px',
                fontSize: '14px',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !input.trim() ? 0.5 : 1,
                backdropFilter: 'blur(10px)'
              }}
            >
              send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GorkBackrooms; 