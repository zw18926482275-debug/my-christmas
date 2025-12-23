
import React, { useEffect, useRef } from 'react';
import { useAppState } from './Store.tsx';

const REAL_SONG_LINKS = {
  // 🔴 去掉开头的 /
  'all-i-want': 'all_i_want.mp3', 
  'santa-tell-me': 'santa.mp3'
};

export const AudioPlayer: React.FC = () => {
  const { currentSong, isPlaying, isMuted } = useAppState();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.7;
    }
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && currentSong) {
      const targetSrc = REAL_SONG_LINKS[currentSong];
      if (audio.src !== targetSrc) {
        audio.src = targetSrc;
        audio.load();
      }
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  return (
    <audio 
      ref={audioRef} 
      loop 
      preload="auto" 
      crossOrigin="anonymous"
      style={{ display: 'none' }}
    />
  );
};
