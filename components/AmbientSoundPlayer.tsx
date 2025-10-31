import React, { useEffect, useRef, useState } from 'react';

interface AmbientSoundPlayerProps {
  src: string;
  isPlaying: boolean;
}

const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({ src, isPlaying }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasError, setHasError] = useState(false);

  // When a new `src` is provided, reset the error state for the new audio element.
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // This effect controls audio playback imperatively to handle errors gracefully.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || hasError) {
      return;
    }

    audio.volume = 0.2;

    if (isPlaying) {
      // .play() returns a promise which can reject if autoplay is blocked by the browser.
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // AbortError is common when changing sources quickly and can be ignored.
          if (error.name !== 'AbortError') {
            console.error(`Ambient audio playback failed for ${src}:`, error.message);
            setHasError(true);
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, src, hasError]);


  // Don't render the component if it's not supposed to be playing or if an error occurred.
  if (!isPlaying || hasError) {
    return null;
  }

  return (
    <audio
      key={src} // Forces a re-mount when src changes, providing a clean state.
      ref={audioRef}
      src={src}
      loop
      // `autoPlay` is removed in favor of imperative control in the useEffect hook.
      onError={() => {
        console.error(`Ambient audio failed to load source: ${src}`);
        setHasError(true);
      }}
    />
  );
};

export default AmbientSoundPlayer;
