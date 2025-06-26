import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ScrapedResult {
  url: string;
  expandedUrl?: string;
  title: string;
  content: string;
  success: boolean;
  scrapedAt?: string;
  error?: string;
}

interface LinkProcessingResult {
  hasLinks: boolean;
  linkCount: number;
  urls?: string[];
  scrapedResults?: ScrapedResult[];
  summaries?: string[];
  combinedSummary?: string;
  error?: string;
}

interface WebhookData {
  id: string;
  type: string;
  timestamp: string;
  content: string;
  enhancedContent?: string; // Content with link summaries for AI analysis
  author: string;
  originalData: any;
  // Twitter-specific fields
  retweet_count?: number;
  favorite_count?: number;
  is_retweet?: boolean;
  is_reply?: boolean;
  // Link processing data
  linkData?: LinkProcessingResult;
}

interface BiasUpdate {
  agent: string;
  newLevel: number;
  timestamp: string;
}

interface WorldviewUpdate {
  agent: string;
  topic: string;
  oldPosition: number;
  newPosition: number;
  shift: number;
  worldview: any;
  timestamp: string;
}

interface RoundtableUpdate {
  threadId: string;
  round: number;
  responses: Array<{
    agent: string;
    agentName: string;
    content: string;
    biasLevel: number;
    worldviewChange: any;
    timestamp: string;
  }>;
  timestamp: string;
}

interface AutoRoundtableComplete {
  topic: string;
  responses: number;
  timestamp: string;
}

interface AgentState {
  biasLevel: number;
  worldview: any;
}

interface DebateState {
  isActive: boolean;
  topic: string;
  currentSpeaker: string | null;
  isThinking: string | null;
  messages: Array<{
    aiAgent: string;
    content: string;
    timestamp: string;
    responseTime?: number;
    biasLevel?: number;
    worldviewChange?: any;
    sentiment?: string;
    politicalLean?: string;
    confidence?: number;
  }>;
  pendingDebatesCount?: number;
  tweetData?: any;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  agentStates: Record<string, AgentState>;
  recentUpdates: Array<BiasUpdate | WorldviewUpdate | RoundtableUpdate>;
  autoRoundtableStatus: {
    running: boolean;
    lastRun?: string;
    lastTopic?: string;
  };
  webhookData: WebhookData[];
  debateState: DebateState | null;
  error: string | null;
  fetchCurrentState: () => void;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({});
  const [recentUpdates, setRecentUpdates] = useState<Array<any>>([]);
  const [autoRoundtableStatus, setAutoRoundtableStatus] = useState<{
    running: boolean;
    lastRun?: string;
    lastTopic?: string;
  }>({
    running: false,
    lastRun: undefined,
    lastTopic: undefined
  });
  const [webhookData, setWebhookData] = useState<WebhookData[]>([]);
  const [debateState, setDebateState] = useState<DebateState | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track cleanup and prevent duplicate listeners
  const socketRef = useRef<Socket | null>(null);
  const listenersSetupRef = useRef(false);

  const fetchCurrentState = async () => {
    try {
      console.log('📡 Fetching current state...');
      const response = await fetch(`${API_URL}/api/ai/current-state`);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Received state data:', data);
        setAgentStates(data.agents || {});
        setAutoRoundtableStatus(prev => ({
          ...prev,
          running: data.autoRoundtableRunning || false
        }));
        console.log('✅ Agent states updated:', Object.keys(data.agents || {}));
      } else {
        console.error('❌ Failed to fetch state:', response.status, response.statusText);
        setError(`Failed to fetch state: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching current state:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'Unknown error';
      setError(errorMessage);
    }
  };

  // Setup socket listeners once
  const setupSocketListeners = (socket: Socket) => {
    if (listenersSetupRef.current) {
      console.log('🔄 Listeners already set up, skipping...');
      return;
    }

    console.log('🔌 Setting up socket event listeners');
    listenersSetupRef.current = true;

    // Connection events
    socket.on('connect', () => {
      console.log(`🔗 Successfully connected to Socket.IO server at ${SOCKET_URL}`);
      setIsConnected(true);
      setError(null);
      fetchCurrentState();
      
      // Request current debate state after connection
      setTimeout(() => {
        if (socket.connected) {
          console.log('📡 Requesting current debate state');
          socket.emit('getCurrentDebateState');
        }
      }, 100);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      setIsConnected(false);
      listenersSetupRef.current = false; // Allow re-setup on reconnect
    });

    socket.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error);
      const errorMessage = error?.message || error?.toString() || 'Connection failed';
      setError(`Connection failed: ${errorMessage}`);
      setIsConnected(false);
    });

    // Debate state updates
    socket.on('debateState', (state: DebateState) => {
      console.log('📺 Received debate state update:', state);
      setDebateState(state);
    });

    // Real-time update events
    socket.on('biasUpdate', (data: BiasUpdate) => {
      console.log('📊 Bias update received:', data);
      
      setAgentStates(prev => ({
        ...prev,
        [data.agent]: {
          ...prev[data.agent],
          biasLevel: data.newLevel
        }
      }));
      
      setRecentUpdates(prev => [...prev.slice(-19), { type: 'bias', ...data }]);
    });

    socket.on('worldviewUpdate', (data: WorldviewUpdate) => {
      console.log('🧠 Worldview update received:', data);
      
      setAgentStates(prev => ({
        ...prev,
        [data.agent]: {
          ...prev[data.agent],
          worldview: data.worldview
        }
      }));
      
      setRecentUpdates(prev => [...prev.slice(-19), { type: 'worldview', ...data }]);
    });

    socket.on('roundtableUpdate', (data: RoundtableUpdate) => {
      console.log('🎯 Roundtable update received:', data);
      
      // Update all agent states that participated
      data.responses.forEach(response => {
        setAgentStates(prev => ({
          ...prev,
          [response.agentName]: {
            biasLevel: response.biasLevel,
            worldview: prev[response.agentName]?.worldview
          }
        }));
      });
      
      setRecentUpdates(prev => [...prev.slice(-19), { type: 'roundtable', ...data }]);
    });

    socket.on('autoRoundtableComplete', (data: AutoRoundtableComplete) => {
      console.log('🤖 Auto-roundtable completed:', data);
      
      setAutoRoundtableStatus(prev => ({
        ...prev,
        lastRun: data.timestamp,
        lastTopic: data.topic
      }));
      
      setRecentUpdates(prev => [...prev.slice(-19), { type: 'autoComplete', ...data }]);
    });

    socket.on('dataReset', (data: { timestamp: string }) => {
      console.log('🔄 Data reset received:', data);
      
      // Reset all states
      setAgentStates({});
      setRecentUpdates([]);
      setWebhookData([]);
      setDebateState(null);
      
      // Fetch fresh state
      setTimeout(fetchCurrentState, 500);
    });

    // Webhook data events
    socket.on('newWebhookData', (data: WebhookData) => {
      console.log('📡 Webhook data received:', data);
      setWebhookData(prev => [data, ...prev.slice(0, 19)]);
    });

    socket.on('error', (errorData: any) => {
      console.error('🚨 Socket error:', errorData);
      // Handle both string errors and Event objects
      const errorMessage = typeof errorData === 'string' 
        ? errorData 
        : errorData?.message || errorData?.toString() || 'Unknown socket error';
      setError(errorMessage);
    });

    // Welcome message
    socket.on('welcome', (data: any) => {
      console.log('👋 Welcome message received:', data);
    });
  };

  // Cleanup socket listeners
  const cleanupSocketListeners = (socket: Socket) => {
    console.log('🧹 Cleaning up socket listeners');
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('debateState');
    socket.off('biasUpdate');
    socket.off('worldviewUpdate');
    socket.off('roundtableUpdate');
    socket.off('autoRoundtableComplete');
    socket.off('dataReset');
    socket.off('newWebhookData');
    socket.off('error');
    socket.off('welcome');
    listenersSetupRef.current = false;
  };

  useEffect(() => {
    // Create socket connection
    console.log(`🔌 Creating Socket.IO connection to ${SOCKET_URL}`);
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    setSocket(newSocket);
    socketRef.current = newSocket;
    
    // Setup listeners
    setupSocketListeners(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up socket connection');
      cleanupSocketListeners(newSocket);
      newSocket.close();
      socketRef.current = null;
    };
  }, []); // Empty dependency array - only run once

  return {
    socket,
    isConnected,
    agentStates,
    recentUpdates,
    autoRoundtableStatus,
    webhookData,
    debateState,
    error,
    fetchCurrentState
  };
};

export default useSocket;
export type { WebhookData, LinkProcessingResult, DebateState }; 