import React, { useEffect, useRef } from 'react';
import { useAppState } from './Store'; // 注意：这里通常不需要加 .tsx 后缀

// 🟢 自动获取 Vite 配置里的 base 路径 (就是 /my-christmas/)
const BASE_URL = import.meta.env.BASE_URL;

const REAL_SONG_LINKS = {
  // 🟢 自动拼接路径，不管在哪都不会错
  'all-i-want': `${BASE_URL}all_i_want.mp3`, 
  'santa-tell-me': `${BASE_URL}santa.mp3`
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
      
      // 🟢 修复判断逻辑：使用 includes 防止绝对路径和相对路径不一致导致的死循环
      // 如果当前播放的地址不包含目标地址，才重新加载
      if (!audio.src.includes(targetSrc)) {
        audio.src = targetSrc;
        audio.load();
        
        // 尝试播放，处理浏览器的自动播放限制
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("等待用户交互才能播放:", error);
          });
        }
      } else {
        // 如果地址一样，只需要确保它是播放状态
        audio.play().catch(() => {});
      }
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

