import { useState, useEffect, useRef, useCallback } from 'react';

interface TalkingAudioState {
  isEnabled: boolean;
  volume: number;
  currentAgent: string | null;
  isMuted: boolean;
  enabledBeforeMute: boolean;
  volumeBeforeMute: number;
}

const useTalkingAudio = () => {
  const [audioState, setAudioState] = useState<TalkingAudioState>({
    isEnabled: true,
    volume: 0.18, // Lower default volume to 18%
    currentAgent: null,
    isMuted: false,
    enabledBeforeMute: true,
    volumeBeforeMute: 0.18
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Map agent names to their audio files
  const getAudioFile = (agentName: string): string => {
    const audioMap: { [key: string]: string } = {
      'openai': '/gptaudio.mp3',
      'claude': '/claudeaudio.mp3',
      'grok': '/grokaudio.mp3',
      'deepseek': '/deepseekaudio.mp3'
    };
    return audioMap[agentName] || '/gptaudio.mp3';
  };

  // Play talking audio for specific agent with improved error handling
  const playTalkingAudio = useCallback((agentName: string) => {
    if (!audioState.isEnabled || audioState.isMuted) return;
    
    try {
      // Stop current audio if playing
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.src = '';
        } catch (cleanupError) {
          console.warn('Error cleaning up previous audio:', cleanupError);
        }
      }

      // Create new audio instance with hidden controls and lazy loading
      const audioFile = getAudioFile(agentName);
      const audio = new Audio();
      audio.preload = 'none';
      audio.src = audioFile;
      audio.volume = Math.max(0, Math.min(1, audioState.volume));
      audio.loop = true;
      audio.controls = false;
      audio.style.display = 'none';
      
      // Prevent right-click context menu
      audio.oncontextmenu = (e) => e.preventDefault();
      
      // Add error handling for audio loading
      audio.addEventListener('error', (error) => {
        console.warn(`Failed to load talking audio for ${agentName}:`, error);
      });
      
      // Load and play with better error handling
      audio.load();
      audio.play().catch(error => {
        console.warn('Talking audio autoplay failed:', error);
        if (error.name !== 'NotAllowedError') {
          console.error('Unexpected audio error:', error);
        }
      });

      audioRef.current = audio;
      setAudioState(prev => ({ ...prev, currentAgent: agentName }));
    } catch (error) {
      console.error('Error playing talking audio:', error);
    }
  }, [audioState.isEnabled, audioState.isMuted, audioState.volume]);

  // Stop talking audio
  const stopTalkingAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioState(prev => ({ ...prev, currentAgent: null }));
  }, []);

  // Toggle talking audio on/off
  const toggleTalkingAudio = useCallback(() => {
    setAudioState(prev => {
      const newEnabled = !prev.isEnabled;
      if (!newEnabled && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return { ...prev, isEnabled: newEnabled };
    });
  }, []);

  // Set volume with improved error handling and no playback interruption
  const setTalkingVolume = useCallback((volume: number) => {
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      setAudioState(prev => ({ 
        ...prev, 
        volume: clampedVolume,
        volumeBeforeMute: prev.isMuted ? prev.volumeBeforeMute : clampedVolume
      }));
      
      // Update volume smoothly without interrupting playback
      if (audioRef.current && !audioState.isMuted) {
        audioRef.current.volume = clampedVolume;
        audioRef.current.controls = false; // Ensure controls stay hidden
      }
    } catch (error) {
      console.error('Error setting talking volume:', error);
    }
  }, [audioState.isMuted]);

  // Mute talking audio externally with error handling
  const muteTalkingAudio = useCallback(() => {
    try {
      setAudioState(prev => {
        if (!prev.isMuted) {
          // Stop current audio when muting
          if (audioRef.current) {
            try {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            } catch (error) {
              console.warn('Error stopping audio during mute:', error);
            }
          }
          return {
            ...prev,
            isMuted: true,
            enabledBeforeMute: prev.isEnabled,
            volumeBeforeMute: prev.volume,
            currentAgent: null
          };
        }
        return prev;
      });
    } catch (error) {
      console.error('Error muting talking audio:', error);
    }
  }, []);

  // Unmute talking audio and restore previous state with error handling
  const unmuteTalkingAudio = useCallback(() => {
    try {
      setAudioState(prev => {
        if (prev.isMuted) {
          return {
            ...prev,
            isMuted: false,
            isEnabled: prev.enabledBeforeMute,
            volume: prev.volumeBeforeMute
          };
        }
        return prev;
      });
    } catch (error) {
      console.error('Error unmuting talking audio:', error);
    }
  }, []);

  // Update volume when it changes (silent update)
  useEffect(() => {
    if (audioRef.current && !audioState.isMuted) {
      audioRef.current.volume = audioState.volume;
      // Ensure controls remain hidden
      audioRef.current.controls = false;
    }
  }, [audioState.volume, audioState.isMuted]);

  // Cleanup on unmount with error handling
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        } catch (error) {
          console.warn('Error cleaning up talking audio:', error);
        }
      }
    };
  }, []);

  return {
    isEnabled: audioState.isEnabled,
    volume: audioState.volume,
    currentAgent: audioState.currentAgent,
    isMuted: audioState.isMuted,
    playTalkingAudio,
    stopTalkingAudio,
    toggleTalkingAudio,
    setTalkingVolume,
    muteTalkingAudio,
    unmuteTalkingAudio
  };
};

export default useTalkingAudio; 