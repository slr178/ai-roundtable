import React from 'react';

interface MusicControlsProps {
  currentSong: number | null;
  isPlaying: boolean;
  startMusic: () => void;
  // Music volume controls
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  // Talking audio props
  talkingEnabled: boolean;
  talkingVolume: number;
  toggleTalkingAudio: () => void;
  setTalkingVolume: (volume: number) => void;
}

const MusicControls: React.FC<MusicControlsProps> = ({
  currentSong,
  isPlaying,
  startMusic,
  musicVolume,
  setMusicVolume,
  talkingEnabled,
  talkingVolume,
  toggleTalkingAudio,
  setTalkingVolume
}) => {
  // Show start button if no song is playing (autoplay blocked)
  const showStartButton = !currentSong && !isPlaying;

  return (
    <div className="music-controls">
      <div className="audio-controls-section">
        <div className="control-group">
          <span className="control-label">Music</span>
          {showStartButton ? (
            <button
              onClick={startMusic}
              className="music-start-btn"
              title="Start Background Music"
              aria-label="Start Background Music"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title="Music Playing">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="volume-slider"
                title={`Music Volume: ${Math.round(musicVolume * 100)}%`}
                style={{ width: '80px' }}
              />
            </div>
          )}
        </div>

        <div className="control-group">
          <span className="control-label">Voice</span>
          <button
            onClick={toggleTalkingAudio}
            className="talking-toggle-btn"
            title={talkingEnabled ? 'Disable Voice Audio' : 'Enable Voice Audio'}
            aria-label={talkingEnabled ? 'Disable Voice Audio' : 'Enable Voice Audio'}
          >
            {talkingEnabled ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
            className="volume-slider"
            title={`Voice Volume: ${Math.round(talkingVolume * 100)}%`}
            disabled={!talkingEnabled}
          />
        </div>
      </div>
      
      {/* Show current song info */}
      {currentSong && !showStartButton && (
        <div className="music-info">
          <span className="music-status">
            {isPlaying ? '♪' : '⏸'} Track {currentSong} | {Math.round(musicVolume * 100)}% Volume
          </span>
        </div>
      )}
    </div>
  );
};

export default MusicControls; 