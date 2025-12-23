import React, { useEffect, useRef } from 'react';
import { useAppState } from './Store';

// 🔴 简单粗暴：直接写死 GitHub 的完整路径
// 这样绝对不会因为“路径对不上”而死循环
const REAL_SONG_LINKS = {
  'all-i-want': '/my-christmas/all_i_want.mp3', 
  'santa-tell-me': '/my-christmas/santa.mp3'
};

export const AudioPlayer: React.FC = () => {
  const { currentSong, isPlaying, isMuted } = useAppState();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. 处理静音
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.7;
    }
  }, [isMuted]);

  // 2. 处理播放逻辑
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && currentSong) {
      const targetSrc = REAL_SONG_LINKS[currentSong];
      
      // 🟢 关键修复：只有当链接真的不一样时，才重新加载
      // 使用 .endsWith() 来避免“相对路径”vs“绝对路径”造成的死循环
      if (!audio.src.endsWith(targetSrc)) {
        console.log("切换歌曲:", targetSrc);
        audio.src = targetSrc;
        audio.load();
      }
      
      // 尝试播放
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // 这里的报错通常是因为用户还没点击屏幕，属于正常现象
          console.log("等待交互:", error);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]); // 监听这些变化

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
