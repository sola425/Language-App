import React, { useEffect, useRef } from 'react';

interface AmbientSoundPlayerProps {
  src: string;
  isPlaying: boolean;
}

const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({ src, isPlaying }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // This effect runs once after the component mounts to set the initial volume.
  // The `onPlay` handler also sets the volume as a fallback.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }
  }, []);

  if (!isPlaying) {
    return null;
  }

  return (
    <audio
      key={src}
      ref={audioRef}
      src={src}
      autoPlay
      loop
      data-testid="ambient-audio"
      onPlay={() => {
        // Ensure volume is set once playback starts, as a fallback.
        if (audioRef.current) {
          audioRef.current.volume = 0.2;
        }
      }}
      onError={() => {
        // Log a descriptive error without logging the circular event object itself,
        // which was causing the "Converting circular structure to JSON" error.
        console.error(`Ambient audio failed to load source: ${src}`);
      }}
    />
  );
};

export default AmbientSoundPlayer;
