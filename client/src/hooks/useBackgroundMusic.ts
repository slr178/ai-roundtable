import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Global singleton to ensure only one music instance
class BackgroundMusicManager {
  private static instance: BackgroundMusicManager | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.12;
  private isMuted: boolean = false;
  private currentSong: number | null = null;
  private retryTimeout: NodeJS.Timeout | null = null;
  private isInitializing: boolean = false;
  private subscribers: Set<() => void> = new Set();

  static getInstance(): BackgroundMusicManager {
    if (!BackgroundMusicManager.instance) {
      BackgroundMusicManager.instance = new BackgroundMusicManager();
    }
    return BackgroundMusicManager.instance;
  }

  private constructor() {
    // Cleanup any existing audio when page unloads
    window.addEventListener('beforeunload', () => this.destroy());
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  destroy() {
    this.stopMusic();
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.subscribers.clear();
  }

  stopMusic() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.src = '';
        this.currentAudio = null;
      } catch (error) {
        console.warn('Error stopping music:', error);
      }
    }
    this.isPlaying = false;
    this.isInitializing = false;
    this.currentSong = null;
    this.notifySubscribers();
  }

  async playMusic() {
    console.log('🎵 Starting background music (singleton)');
    
    // If music is already playing or initializing, don't start another instance
    if (this.isPlaying || this.isInitializing) {
      console.log('🎵 Music already playing or initializing, skipping');
      return;
    }

    const availableSongs = [1, 2, 3, 4, 6, 7, 8, 9, 10];
    const randomSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
    
    this.playSong(randomSong);
  }

  private playSong(songNumber: number) {
    if (this.isInitializing) {
      console.log('🎵 Already initializing, skipping song', songNumber);
      return;
    }

    this.isInitializing = true;
    
    try {
      // Stop any existing music first
      this.stopMusic();
      this.isInitializing = true; // Reset since stopMusic clears it

      console.log(`🎵 Playing song ${songNumber}`);
      
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = `/${songNumber}.mp3`;
      audio.volume = this.isMuted ? 0 : this.volume;
      audio.loop = false;
      audio.controls = false;
      audio.style.display = 'none';
      
      audio.oncontextmenu = (e) => e.preventDefault();

      // Handle song end
      audio.addEventListener('ended', () => {
        console.log(`🎵 Song ${songNumber} ended, playing next`);
        this.isInitializing = false;
        this.currentSong = null;
        
        // Play next song after a small delay
        setTimeout(() => {
          if (!this.isInitializing && !this.isPlaying) {
            this.playMusic();
          }
        }, 500);
      });

      // Handle errors
      audio.addEventListener('error', (error) => {
        console.warn(`🎵 Song ${songNumber} failed to load:`, error);
        this.isInitializing = false;
        this.isPlaying = false;
        this.notifySubscribers();
        
        // Retry with a different song
        setTimeout(() => {
          if (!this.isInitializing && !this.isPlaying) {
            this.playMusic();
          }
        }, 2000);
      });

      // Handle successful load
      audio.addEventListener('canplay', () => {
        console.log(`🎵 Song ${songNumber} loaded successfully`);
        this.isPlaying = true;
        this.isInitializing = false;
        this.currentSong = songNumber;
        this.notifySubscribers();
      });

      this.currentAudio = audio;
      
      // Start playing
      const playPromise = audio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            console.log(`🎵 Song ${songNumber} started playing`);
          })
          .catch((error) => {
            console.warn('🎵 Play promise rejected:', error);
            this.isInitializing = false;
            if (error.name !== 'NotAllowedError') {
              // Retry for non-autoplay errors
              setTimeout(() => {
                if (!this.isInitializing && !this.isPlaying) {
                  this.playMusic();
                }
              }, 2000);
            }
            this.notifySubscribers();
          });
      }
      
    } catch (error) {
      console.error('🎵 Error in playSong:', error);
      this.isInitializing = false;
      this.isPlaying = false;
      this.notifySubscribers();
    }
  }

  setVolume(newVolume: number) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.currentAudio && !this.isMuted) {
      this.currentAudio.volume = this.volume;
    }
    this.notifySubscribers();
  }

  mute() {
    this.isMuted = true;
    if (this.currentAudio) {
      this.currentAudio.volume = 0;
    }
    this.notifySubscribers();
  }

  unmute() {
    this.isMuted = false;
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
    this.notifySubscribers();
  }

  getState() {
    return {
      currentSong: this.currentSong,
      isPlaying: this.isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
      hasError: false
    };
  }
}

export const useBackgroundMusic = (startDelay: number = 1000) => {
  const managerRef = useRef<BackgroundMusicManager>();
  const [state, setState] = useState(() => {
    if (!managerRef.current) {
      managerRef.current = BackgroundMusicManager.getInstance();
    }
    return managerRef.current.getState();
  });

  // Subscribe to manager updates
  useEffect(() => {
    const manager = managerRef.current!;
    return manager.subscribe(() => {
      setState(manager.getState());
    });
  }, []);

  // Start music function
  const startMusic = useCallback(() => {
    console.log('🎵 useBackgroundMusic: startMusic called');
    managerRef.current?.playMusic();
  }, []);

  // Volume control
  const changeVolume = useCallback((newVolume: number) => {
    managerRef.current?.setVolume(newVolume);
  }, []);

  // Mute controls
  const muteMusic = useCallback(() => {
    managerRef.current?.mute();
  }, []);

  const unmuteMusic = useCallback(() => {
    managerRef.current?.unmute();
  }, []);

  // Cleanup on unmount (but don't destroy the singleton)
  useEffect(() => {
    return () => {
      // Don't destroy the manager, just unsubscribe
      // The manager will persist across component mounts
    };
  }, []);

  return {
    currentSong: state.currentSong,
    isPlaying: state.isPlaying,
    volume: state.volume,
    isMuted: state.isMuted,
    hasError: state.hasError,
    changeVolume,
    startMusic,
    muteMusic,
    unmuteMusic
  };
}; 