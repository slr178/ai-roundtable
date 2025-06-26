import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import IntroPage from './components/IntroPage';
import useSocket from './hooks/useSocket';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import useTalkingAudio from './hooks/useTalkingAudio';
import { monitor } from './utils/performance';
import './App.css';

// Lazy load non-critical components for better performance
const Roundtable = React.lazy(() => import('./components/Roundtable'));
const PoliticalBiasDemo = React.lazy(() => import('./components/PoliticalBiasDemo'));
const CharacterProfile = React.lazy(() => import('./components/CharacterProfile'));
const Developers = React.lazy(() => import('./components/Developers'));
const DeveloperDetail = React.lazy(() => import('./components/DeveloperDetail'));
const GorkBackrooms = React.lazy(() => import('./components/GorkBackrooms'));
const Whitepaper = React.lazy(() => import('./components/Whitepaper'));

type TabType = 'roundtable' | 'bias' | 'gork' | 'developers' | 'whitepaper';

interface Message {
  aiAgent: string;
  content: string;
  timestamp: string;
  responseTime?: number;
  // Enhanced political tracking
  biasLevel?: number;
  worldviewChange?: {
    topic: string;
    oldPosition: number;
    newPosition: number;
    shift: number;
    evidence: any;
  };
  sentiment?: string;
  politicalLean?: string;
  confidence?: number;
}

interface Agent {
  name: string;
  id: string;
  emoji: string;
  color: string;
  gif: string;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize performance monitoring in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      monitor.monitorResourceLoading();
      monitor.monitorNavigation();
      
      // Report performance summary after a delay
      setTimeout(() => monitor.reportSummary(), 5000);
      
      return () => monitor.cleanup();
    }
  }, []);
  
  // Determine active tab based on current route
  const getActiveTabFromPath = (pathname: string): TabType => {
    if (pathname.startsWith('/bias')) return 'bias';
    if (pathname.startsWith('/developers')) return 'developers';
    if (pathname.startsWith('/whitepaper')) return 'whitepaper';
    return 'roundtable';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getActiveTabFromPath(location.pathname));
  
  // Update active tab when route changes
  useEffect(() => {
    const newTab = getActiveTabFromPath(location.pathname);
    setActiveTab(newTab);
    
    // Add body class for character profile pages (bias routes)
    if (location.pathname.startsWith('/bias/') && location.pathname !== '/bias') {
      document.body.classList.add('character-profile-page');
    } else {
      document.body.classList.remove('character-profile-page');
    }
  }, [location.pathname]);

  // Use the Socket.io hook - this handles all socket communication
  const { webhookData, socket, debateState } = useSocket();

  // Use the background music hook - start after intro completes
  const { 
    currentSong, 
    isPlaying, 
    startMusic, 
    volume: musicVolume, 
    changeVolume: setMusicVolume,
    muteMusic,
    unmuteMusic
  } = useBackgroundMusic(500);
  
  // Use the talking audio hook
  const { 
    isEnabled: talkingEnabled, 
    volume: talkingVolume, 
    playTalkingAudio, 
    stopTalkingAudio, 
    toggleTalkingAudio, 
    setTalkingVolume,
    muteTalkingAudio,
    unmuteTalkingAudio
  } = useTalkingAudio();

  // UI state
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isLogVisible, setIsLogVisible] = useState<boolean>(false);
  const [recentTweetCount, setRecentTweetCount] = useState<number>(0);
  const [isFetchingDebate, setIsFetchingDebate] = useState<boolean>(false);
  
  // Client-side display state for typewriter effect
  const [displayedMessage, setDisplayedMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [lastDisplayedMessageId, setLastDisplayedMessageId] = useState<string>('');
  const [typewriterIntervalId, setTypewriterIntervalId] = useState<NodeJS.Timeout | null>(null);

  // AI Agents Configuration
  const agents: Agent[] = [
    {
      name: 'GPT',
      id: 'openai',
      emoji: '',
      color: 'gpt',
      gif: '/gpt_talk.gif'
    },
    {
      name: 'Claude',
      id: 'claude',
      emoji: '',
      color: 'claude',
      gif: '/claude_talk.gif'
    },
    {
      name: 'Grok',
      id: 'grok',
      emoji: '',
      color: 'grok',
      gif: '/grok_talk.gif'
    },
    {
      name: 'DeepSeek',
      id: 'deepseek',
      emoji: '',
      color: 'deepseek',
      gif: '/deepseek_talk.gif'
    }
  ];

  // Cleanup typewriter interval on unmount
  useEffect(() => {
    return () => {
      if (typewriterIntervalId) {
        clearInterval(typewriterIntervalId);
      }
    };
  }, [typewriterIntervalId]);

  // Cleanup body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('character-profile-page');
    };
  }, []);

  // Handle typewriter effect for server messages
  const handleTypewriterEffect = useCallback((message: string) => {
    // Clear any existing typewriter effect first
    if (typewriterIntervalId) {
      clearInterval(typewriterIntervalId);
      setTypewriterIntervalId(null);
    }
    
    setIsTyping(true);
    setDisplayedMessage('');
    
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      // Check if page is visible to avoid glitching when returning from tab switch
      if (document.hidden) {
        return; // Skip this iteration if tab is not visible
      }
      
      if (currentIndex <= message.length) {
        setDisplayedMessage(message.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTypewriterIntervalId(null);
        setIsTyping(false);
      }
    }, 80);

    setTypewriterIntervalId(typeInterval);
  }, [typewriterIntervalId]);

  // Handle visibility change to prevent glitching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && typewriterIntervalId) {
        // Pause typewriter when tab becomes hidden
        clearInterval(typewriterIntervalId);
        setTypewriterIntervalId(null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [typewriterIntervalId]);

  // Handle typewriter effect for current speaker messages
  useEffect(() => {
    if (!debateState || !debateState.currentSpeaker || debateState.messages.length === 0) {
      return;
    }

    const latestMessage = debateState.messages[debateState.messages.length - 1];
    const messageId = `${latestMessage.aiAgent}-${latestMessage.timestamp}-${latestMessage.content.slice(0, 20)}`;
    
    // Only start typewriter if this is a new message from the current speaker
    if (latestMessage.aiAgent === debateState.currentSpeaker && messageId !== lastDisplayedMessageId) {
      console.log('🎬 Starting typewriter effect for new message from', latestMessage.aiAgent);
      setLastDisplayedMessageId(messageId);
      handleTypewriterEffect(latestMessage.content);
    }
  }, [debateState?.currentSpeaker, debateState?.messages, lastDisplayedMessageId, handleTypewriterEffect]);

  // Handle talking audio for current speaker (only after intro)
  useEffect(() => {
    if (!showIntro && debateState?.currentSpeaker) {
      console.log('🎤 Starting talking audio for', debateState.currentSpeaker);
      playTalkingAudio(debateState.currentSpeaker);
    } else {
      console.log('🎤 Stopping talking audio');
      stopTalkingAudio();
    }
  }, [debateState?.currentSpeaker, showIntro, playTalkingAudio, stopTalkingAudio]);

  // Handle audio muting for Gork Backrooms
  useEffect(() => {
    if (location.pathname === '/gork') {
      // Entering Gork Backrooms - mute all audio
      console.log('🔇 Entering Gork Backrooms - muting all audio');
      muteMusic();
      muteTalkingAudio();
    } else {
      // Leaving Gork Backrooms - unmute all audio
      console.log('🔊 Leaving Gork Backrooms - unmuting all audio');
      unmuteMusic();
      unmuteTalkingAudio();
    }
  }, [location.pathname, muteMusic, unmuteMusic, muteTalkingAudio, unmuteTalkingAudio]);

  // Request fresh debate state when intro completes or socket connects
  useEffect(() => {
    if (!showIntro && socket?.connected) {
      console.log('📡 Intro completed, requesting fresh debate state');
      setIsFetchingDebate(true);
      socket.emit('getCurrentDebateState');
    }
  }, [showIntro, socket]);

  // Clear fetching state when we receive debate data
  useEffect(() => {
    if (debateState && isFetchingDebate) {
      console.log('📊 Received debate state, stopping fetch indicator');
      setIsFetchingDebate(false);
    }
  }, [debateState, isFetchingDebate]);

  const getCurrentAgent = () => {
    if (!debateState) return undefined;
    const currentId = debateState.currentSpeaker || debateState.isThinking;
    return agents.find(agent => agent.id === currentId);
  };

  // Tweet count tracking for badge
  useEffect(() => {
    const twitterData = webhookData.filter(w => w.type === 'twitter');
    if (twitterData.length > recentTweetCount) {
      console.log('📱 New tweets detected! Count changed from', recentTweetCount, 'to', twitterData.length);
      setRecentTweetCount(twitterData.length);
    }
  }, [webhookData, recentTweetCount]);

  const tabs = [
    { 
      id: 'roundtable' as TabType, 
      name: 'ROUNDTABLE', 
      icon: '●', 
      path: '/',
      tweetCount: recentTweetCount
    },
    { id: 'bias' as TabType, name: 'POLITICAL PROFILES', icon: '◆', path: '/bias' },
    { id: 'gork' as TabType, name: 'GORK BACKROOMS', icon: '●', path: '/gork', subtitle: 'JUST FOR FUN' },
    { id: 'whitepaper' as TabType, name: 'WHITEPAPER', icon: '●', path: '/whitepaper' },
    { id: 'developers' as TabType, name: 'DEVELOPERS', icon: '●', path: '/developers' }
  ];

  const handleTabClick = (tab: { id: TabType; path: string }) => {
    navigate(tab.path);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    // Start fetching current debate state
    setIsFetchingDebate(true);
    // Start background music after intro completes
    setTimeout(() => {
      startMusic();
    }, 500);
    // App loads immediately after intro - no loading screen needed
  };

  // Lazy load resources after intro completes - non-blocking
  useEffect(() => {
    if (!showIntro) {
      // Use the lazy loading utility for better performance
      import('./utils/lazyImage').then(({ batchLoadImages }) => {
        // Only load the most critical images first
        const criticalImages = [
          '/gpt_idle.png',
          '/claude_idle.png',
          '/grok_idle.png',
          '/deepseek_idle.gif'
        ];
        
        // Load critical images in small batches after a short delay
        setTimeout(() => {
          batchLoadImages(criticalImages, 2);
        }, 200);

        // Load non-critical images later
        setTimeout(() => {
          const nonCriticalImages = [
            '/gpt_talk.gif',
            '/claude_talk.gif',
            '/grok_talk.gif',
            '/deepseek_talk.gif',
            '/gpt_transparent.gif',
            '/claude_transparent.gif',
            '/grok_transparent.gif',
            '/deepseek_transparent.gif'
          ];
          batchLoadImages(nonCriticalImages, 2);
        }, 1000);
      });
    }
  }, [showIntro]);

  const tabStyle = (isActive: boolean, tabId?: string) => ({
    padding: '0.9rem 1.8rem',
    borderRadius: '2px',
    background: tabId === 'gork' 
      ? (isActive 
          ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9))' 
          : 'linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(10, 10, 10, 0.6))')
      : (isActive 
          ? 'rgba(255, 255, 255, 0.15)' 
          : 'rgba(255, 255, 255, 0.06)'),
    color: tabId === 'gork'
      ? (isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)')
      : (isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.65)'),
    fontSize: '0.85rem',
    fontFamily: '"Space Mono", "JetBrains Mono", "Fira Code", monospace',
    fontWeight: isActive ? '600' : '400',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    boxShadow: tabId === 'gork'
      ? (isActive 
          ? '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
          : '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)')
      : (isActive 
          ? '0 4px 15px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
          : '0 2px 8px rgba(255, 255, 255, 0.05)'),
    textShadow: tabId === 'gork'
      ? '0 2px 4px rgba(0, 0, 0, 0.8)'
      : (isActive ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none'),
    border: tabId === 'gork'
      ? '1px solid rgba(0, 0, 0, 0.3)'
      : '1px solid rgba(255, 255, 255, 0.1)'
  });

  // If showing intro, render only the intro page
  if (showIntro) {
    return <IntroPage onComplete={handleIntroComplete} />;
  }

  return (
    <div className="App">
      {/* Navigation Tabs - Hidden in Gork Backrooms */}
      {location.pathname !== '/gork' && (
        <div className="app-navigation" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'url("./background.gif") center/cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'none'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1.2rem 2rem',
          width: '100%'
        }}>
          {/* Left side - Navigation tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                style={tabStyle(activeTab === tab.id, tab.id)}
                className={tab.id === 'gork' ? `gork-tab ${activeTab === tab.id ? 'active' : ''}` : ''}
              >
                {tab.id === 'gork' ? (
                  <div className="gork-tab-content">
                    <div className="gork-tab-main">
                      <span style={{ fontSize: '1rem', opacity: 0.9 }}>{tab.icon}</span>
                      <span>{tab.name}</span>
                    </div>
                    <div className="gork-tab-subtitle">{tab.subtitle}</div>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: '1rem', opacity: 0.9 }}>{tab.icon}</span>
                    <span>{tab.name}</span>
                    
                    {/* Tweet counter badge for Roundtable tab */}
                    {tab.id === 'roundtable' && tab.tweetCount && tab.tweetCount > 0 && (
                      <span style={{
                        background: 'rgba(76, 175, 80, 0.9)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '8px',
                        minWidth: '1.2rem',
                        textAlign: 'center' as const,
                        lineHeight: '1',
                        marginLeft: '0.3rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                      }}>
                        {tab.tweetCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
          
          {/* Right side - Audio controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '8px',
            padding: '8px 12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* Music controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Music
              </span>
              {!currentSong && !isPlaying ? (
                <button
                  onClick={startMusic}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Start Background Music"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.8)">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    style={{
                      width: '60px',
                      height: '3px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    title={`Music Volume: ${Math.round(musicVolume * 100)}%`}
                  />
                </>
              )}
            </div>
            
            {/* Voice controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Voice
              </span>
              <button
                onClick={toggleTalkingAudio}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={talkingEnabled ? 'Disable Voice Audio' : 'Enable Voice Audio'}
              >
                {talkingEnabled ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={talkingVolume}
                onChange={(e) => setTalkingVolume(parseFloat(e.target.value))}
                disabled={!talkingEnabled}
                style={{
                  width: '60px',
                  height: '3px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer',
                  opacity: talkingEnabled ? 1 : 0.5
                }}
                title={`Voice Volume: ${Math.round(talkingVolume * 100)}%`}
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Content Area */}
      <div className="app-content" style={{
        marginTop: location.pathname === '/gork' ? '0px' : '80px',
        minHeight: location.pathname === '/gork' ? '100vh' : 'calc(100vh - 80px)',
        position: 'relative'
      }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Roundtable 
                  webhookData={webhookData}
                  messages={debateState?.messages || []}
                  isDebating={debateState?.isActive || false}
                  currentTopic={debateState?.topic || ''}
                  currentContent={''}
                  currentSpeaker={debateState?.currentSpeaker || null}
                  isThinking={debateState?.isThinking || null}
                  error={null}
                  currentMessage={''}
                  displayedMessage={displayedMessage}
                  isTyping={isTyping}
                  isLogVisible={isLogVisible}
                  setIsLogVisible={setIsLogVisible}
                  agents={agents}
                  getCurrentAgent={getCurrentAgent}
                  pendingDebatesCount={debateState?.pendingDebatesCount || 0}
                  tweetData={debateState?.tweetData}
                  isFetchingDebate={isFetchingDebate}
                />
              </Suspense>
            } 
          />
          <Route path="/bias" element={<Suspense fallback={<LoadingFallback />}><PoliticalBiasDemo /></Suspense>} />
          <Route path="/bias/:name" element={<Suspense fallback={<LoadingFallback />}><CharacterProfile /></Suspense>} />
          <Route path="/gork" element={<Suspense fallback={<LoadingFallback />}><GorkBackrooms /></Suspense>} />
          <Route path="/whitepaper" element={<Suspense fallback={<LoadingFallback />}><Whitepaper /></Suspense>} />
          <Route path="/developers" element={<Suspense fallback={<LoadingFallback />}><Developers /></Suspense>} />
          <Route path="/developers/:name" element={<Suspense fallback={<LoadingFallback />}><DeveloperDetail /></Suspense>} />
          <Route 
            path="/character/:name" 
            element={<Suspense fallback={<LoadingFallback />}><CharacterProfile /></Suspense>} 
          />
        </Routes>
      </div>
      

      
      {/* Logos Video - Bottom Left Corner (Hidden in Gork Backrooms) */}
      {location.pathname !== '/gork' && (
        <video 
          className="logos-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="./logos.mp4" type="video/mp4" />
        </video>
      )}

      {/* Social Buttons - Bottom Right Corner (Hidden in Gork Backrooms) */}
      {location.pathname !== '/gork' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          gap: '12px',
          flexDirection: 'column'
        }}>
          {/* X (Twitter) Button */}
          <a
            href="https://x.com/roundtableai"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '25px',
              color: 'white',
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(29, 161, 242, 0.9)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Follow us on X"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          
          {/* Email Button */}
          <a
            href="mailto:developers@roundtable.ai"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '25px',
              color: 'white',
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34, 139, 34, 0.9)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Email developers@roundtable.ai"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

// Loading component for lazy-loaded routes
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'url("./background.gif") center/cover',
    backgroundAttachment: 'fixed',
    color: 'white',
    fontSize: '1.2rem',
    fontFamily: '"Space Mono", monospace'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: 'rgba(0, 0, 0, 0.6)',
      padding: '2rem',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        borderTopColor: 'rgba(255, 255, 255, 0.8)',
        animation: 'spin 1s ease-in-out infinite'
      }} />
      Loading...
    </div>
  </div>
);

export default App;
