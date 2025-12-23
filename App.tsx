
import React from 'react';
import { Scene } from './components/Scene.tsx';
import { UIOverlay } from './components/UIOverlay.tsx';
import { AppProvider } from './components/Store.tsx';
import { AudioPlayer } from './components/AudioPlayer.tsx';

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="relative w-full h-full overflow-hidden bg-[#010806]">
        {/* Headless Audio Management */}
        <AudioPlayer />

        {/* The 3D World */}
        <Scene />
        
        {/* The UI Layer */}
        <UIOverlay />
        
        {/* Visual Embellishments - Vignette shadow */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />
      </div>
    </AppProvider>
  );
};

export default App;
