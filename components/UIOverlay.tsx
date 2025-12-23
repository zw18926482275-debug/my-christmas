import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, VolumeX, RefreshCcw, Music, ChevronRight } from 'lucide-react';
import { useAppState } from './Store';
import { TreeState, ChristmasSong } from '../types';
import { selectBestBlessing } from '../services/geminiService';

const PREDEFINED_BLESSINGS = [
  "岁末雪落，静候春信.愿圣诞的宁静烛火，为你照亮一整个温和的良夜.",
  "冬意渐浓，星河长明.愿你珍重的所有，都安然栖息于这季银白色的祝福里.",
  "窗外是皑皑白雪，窗内是暖暖烛光.愿这个圣诞，你的世界安静而丰盈.",
  "钟声与飘雪，都是岁末的诗歌.愿你聆听这份静谧，怀抱喜悦，步入崭新而明亮的章节.",
  "愿圣诞的每一片雪花，都载着一个轻柔的愿望，悄然落在你新年的扉页上.",
  "长冬伊始，万物安宁.愿此刻的团聚与暖意，成为你来年心间不灭的炉火.",
  "这是四季写给我们的，一个带着松香与星光的逗号.歇息片刻，然后，让我们奔赴下一场山海.圣诞快乐.",
  "愿炉火的温度、书籍的墨香与陪伴的絮语，交织成你今夜最柔软的梦境.",
  "当驯鹿踏雪而过，愿它留下的印记，都是通往你未来幸运的小径.圣诞愉快.",
  "日历翻到最厚重的一页，故事也在此刻变得温暖.愿你与所爱之人，共享这页故事的圆满尾声.",
  "愿这季的冷风，只吹送清澈与清醒；愿圣诞的暖光，只照耀平安与前程.",
  "时光行至岁末，仿佛一首歌的间奏.愿你在这一拍温柔的休止符里，听见属于自己的、平静的回响.",
  "将这一年的纷扰，折进圣诞卡里封存.只取出那些闪光的瞬间，挂在明日新生的希望之树上.",
  "愿今夜，所有跋涉都有归处，所有思念都有回响，所有默默的努力，都积攒成来年绽放的光芒.",
  "冬日虽寒，幸有佳节可期，有旧友可念，有新愿可许.圣诞快乐，祝我们好在接下来的一季又一季."
];

export const UIOverlay: React.FC = () => {
  const { 
    state, setState, 
    userBlessing, setUserBlessing, 
    isMuted, setIsMuted, 
    setIsExploded,
    currentSong, setCurrentSong,
    isPlaying, setIsPlaying
  } = useAppState();

  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [showMusicMenu, setShowMusicMenu] = useState(false);

  const handleConsultOracle = async () => {
    if (!userName.trim()) return;
    setLoading(true);
    setState(TreeState.WISHING);
    
    try {
      const blessing = await selectBestBlessing(userName, PREDEFINED_BLESSINGS);
      setUserBlessing(blessing);
    } catch (error) {
      const randomIdx = Math.floor(Math.random() * PREDEFINED_BLESSINGS.length);
      setUserBlessing(PREDEFINED_BLESSINGS[randomIdx]);
    } finally {
      setLoading(false);
      setState(TreeState.CELEBRATING);
    }
  };

  const toggleCinematicMode = () => {
    if (state === TreeState.SCATTERED) {
      setState(TreeState.TREE_SHAPE);
      setIsExploded(false);
    } else {
      setState(TreeState.SCATTERED);
    }
  };

  const selectSong = (song: ChristmasSong) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setIsMuted(false);
    setShowMusicMenu(false);
  };

  const reset = () => {
    setUserBlessing(null);
    setUserName('');
    setState(TreeState.TREE_SHAPE);
    setIsExploded(false);
  };

  const isCinematic = state === TreeState.SCATTERED;

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between px-6 pt-14 pb-8 md:p-16 z-10 overflow-hidden">
      
      <div className="flex justify-between items-start pointer-events-auto">
        <motion.div 
          animate={{ opacity: isCinematic ? 0 : 1, x: isCinematic ? -50 : 0 }}
          className="flex flex-col"
        >
          {/* 🟢 修复：调整标题字号，防止PC端过大 */}
          <h1 className="text-6xl md:text-7xl font-elegant text-[#FFCC00] font-bold tracking-normal leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            Merry<br/>Christmas
          </h1>
          <div className="w-32 h-[4px] bg-[#FFCC00] mt-2 shadow-[0_0_15px_rgba(255,204,0,0.6)]" />
        </motion.div>
        
        {/* 右上角按钮组 */}
        <div className="flex gap-4 relative">
          <button 
            onClick={toggleCinematicMode}
            className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all text-[11px] font-bold uppercase tracking-[0.3em] ${
              isCinematic 
              ? 'bg-[#ffd700] text-[#010806] border-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.6)]' 
              : 'bg-transparent text-[#ffd700] border-[#ffd700]/30 hover:border-[#ffd700]'
            }`}
          >
            {isCinematic ? <RefreshCcw size={14} /> : <Sparkles size={14} />}
            {isCinematic ? '返回' : '圣诞树'}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMusicMenu(!showMusicMenu)}
              className={`p-3 bg-black/40 border border-white/20 rounded-full hover:bg-black/60 transition-all text-[#fefae0] flex items-center gap-2 ${isCinematic ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              {isPlaying ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                    <Music size={18} className="text-[#ffd700]" />
                </motion.div>
              ) : (
                <VolumeX size={18} />
              )}
            </button>

            <AnimatePresence>
              {showMusicMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 mt-4 w-64 md:w-72 bg-black/95 backdrop-blur-3xl border border-[#ffd700]/30 rounded-[2rem] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.9)] z-50 overflow-hidden"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-end border-b border-[#ffd700]/20 pb-3">
                      <h3 className="text-[10px] uppercase tracking-[0.5em] text-[#ffd700]">圣诞歌单</h3>
                      {isPlaying && <span className="text-[8px] uppercase tracking-widest text-[#ffd700] animate-pulse">Playing</span>}
                    </div>
                    
                    <button 
                      onClick={() => selectSong('all-i-want')}
                      className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between group border ${currentSong === 'all-i-want' ? 'bg-[#ffd700]/15 border-[#ffd700]/50' : 'hover:bg-white/5 border-transparent'}`}
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Mariah Carey</span>
                        <span className={`text-sm font-serif italic tracking-wide truncate ${currentSong === 'all-i-want' ? 'text-[#ffd700]' : 'text-white/90'}`}>All I Want...</span>
                      </div>
                      <ChevronRight size={14} className="text-white/20 shrink-0" />
                    </button>
                    
                    <button 
                      onClick={() => selectSong('santa-tell-me')}
                      className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between group border ${currentSong === 'santa-tell-me' ? 'bg-[#ffd700]/15 border-[#ffd700]/50' : 'hover:bg-white/5 border-transparent'}`}
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Ariana Grande</span>
                        <span className={`text-sm font-serif italic tracking-wide truncate ${currentSong === 'santa-tell-me' ? 'text-[#ffd700]' : 'text-white/90'}`}>Santa Tell Me</span>
                      </div>
                      <ChevronRight size={14} className="text-white/20 shrink-0" />
                    </button>

                    <button 
                      onClick={() => { setIsPlaying(!isPlaying); setShowMusicMenu(false); }}
                      className="w-full text-center py-2 text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-[#ffd700] transition-colors"
                    >
                      {isPlaying ? '暂停' : '播放'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {!isCinematic && (
            <motion.div 
              key="ui-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center h-full pointer-events-none"
            >
              {(state === TreeState.IDLE || state === TreeState.TREE_SHAPE || state === TreeState.REASSEMBLING) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/60 backdrop-blur-3xl border border-[#ffd700]/40 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] max-w-sm md:max-w-md w-full pointer-events-auto shadow-[0_40px_120px_rgba(0,0,0,1)] text-center mx-4"
                >
                  <h2 className="text-2xl md:text-3xl font-serif text-[#fefae0] mb-2 italic tracking-tight">开启圣诞祝福</h2>
                  <p className="text-[10px] text-[#ffd700] mb-8 uppercase tracking-[0.5em] font-light">
                    请输入您的姓名
                  </p>
                  <div className="space-y-6 md:space-y-8">
                    <input 
                      type="text"
                      placeholder="姓名"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-white/5 border-b border-[#ffd700]/60 py-3 text-center text-[#fefae0] focus:outline-none focus:border-[#ffd700] tracking-[0.5em] uppercase text-lg"
                    />
                    <button 
                      onClick={handleConsultOracle}
                      className="w-full bg-gradient-to-r from-[#ffd700] to-[#f5cb5c] text-[#010806] font-black py-4 md:py-6 rounded-full flex items-center justify-center gap-4 shadow-lg uppercase text-xs tracking-[0.4em]"
                    >
                      <Sparkles size={18} />
                      点亮祝福
                    </button>
                  </div>
                </motion.div>
              )}

              {loading && (
                <div className="flex flex-col items-center gap-8 text-[#ffd700]">
                  <RefreshCcw className="animate-spin" size={48} />
                  <p className="font-serif italic tracking-[0.6em] text-xs">正在感应星光...</p>
                </div>
              )}

              {state === TreeState.CELEBRATING && userBlessing && !loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  // 🟢 修复：PC端底部边距减小 (md:mb-12)，防止被顶出屏幕
                  className="w-full text-right pointer-events-auto self-end mb-10 md:mb-12 px-4 flex justify-end"
                >
                    {/* 🟢 修复：内边距减小 (md:p-12)，最大宽度限制 (max-w-4xl) */}
                    <div className="flex flex-col items-end gap-4 md:gap-6 bg-black/70 backdrop-blur-xl p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/20 max-w-4xl">
                      <div className="flex items-center gap-4 md:gap-6">
                        {/* 🟢 修复：字号从 9xl 减小到 7xl */}
                        <span className="text-4xl md:text-7xl font-script text-[#ffd700]">To</span>
                        {/* 🟢 修复：字号从 8xl 减小到 6xl */}
                        <span className="text-3xl md:text-6xl font-artistic text-white">{userName}:</span>
                      </div>
                      {/* 🟢 修复：核心修复！正文字号从 6xl 减小到 4xl，确保能完整显示 */}
                      <p className="text-xl md:text-4xl font-artistic text-[#fefae0] leading-relaxed tracking-wider italic text-right">
                        {userBlessing}
                      </p>
                      <button 
                        onClick={reset}
                        className="mt-6 md:mt-8 px-10 md:px-16 py-4 md:py-5 rounded-full border border-[#ffd700]/60 text-[#ffd700] hover:bg-[#ffd700] hover:text-[#010806] uppercase text-[10px] md:text-[12px] tracking-[0.5em] flex items-center gap-4 font-black"
                      >
                        <RefreshCcw size={16} /> 重新开启
                      </button>
                    </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-end">
        <motion.div 
          animate={{ opacity: isCinematic ? 0 : 1 }}
          className="text-xs md:text-base uppercase tracking-[0.6em] text-[#ffd700] font-bold"
        >
          {userName === '储星宇' ? '专属定制' : 'From 萨莱'}
        </motion.div>
        
        <div className="hidden md:block text-[10px] uppercase tracking-[0.5em] text-white/60">
           15,000 冰晶粒子实时渲染
        </div>
      </div>
    </div>
  );
};
