// PlayerContext.tsx
import React, { createContext, useContext, useState } from 'react';
import useSound from 'use-sound';
import DIPIENS from './MusicList/DIPIENS.mp3'; 

const tracks = [DIPIENS];

interface PlayerContextType {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  currentTrackIndex: number;
  currentTrack: string; // Добавляем текущее название трека
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [play, { pause }] = useSound(tracks[currentTrackIndex], { volume: 1 });

  const handlePlay = () => {
    play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    pause();
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    pause();
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
    pause();
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider value={{
      isPlaying,
      play: handlePlay,
      pause: handlePause,
      next: handleNext,
      previous: handlePrevious,
      currentTrackIndex,
      currentTrack: tracks[currentTrackIndex], // Передаем текущее название трека
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

