
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TreeState, ChristmasSong } from '../types';

interface AppContextType {
  state: TreeState;
  setState: (s: TreeState) => void;
  userBlessing: string | null;
  setUserBlessing: (b: string | null) => void;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
  isExploded: boolean;
  setIsExploded: (e: boolean) => void;
  currentSong: ChristmasSong;
  setCurrentSong: (song: ChristmasSong) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TreeState>(TreeState.IDLE);
  const [userBlessing, setUserBlessing] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [currentSong, setCurrentSong] = useState<ChristmasSong>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <AppContext.Provider value={{ 
      state, setState, 
      userBlessing, setUserBlessing, 
      isMuted, setIsMuted, 
      isExploded, setIsExploded,
      currentSong, setCurrentSong,
      isPlaying, setIsPlaying
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppState must be used within AppProvider");
  return context;
};
