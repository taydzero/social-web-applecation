import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import useSound from "use-sound";
import DIPIENS from "./MusicList/DIPIENS.mp3";

interface Track {
  src: string;
  title: string;
  artist: string;
  cover: string;
}

const tracks: Track[] = [
  {
    src: DIPIENS,
    title: "DIPIENS",
    artist: "Unknown Artist",
    cover: "/covers/dipiens.jpg",
  },
];

interface PlayerContextType {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;

  currentTrackIndex: number;
  currentTrack: Track;

  duration: number;
  currentTime: number;
  seek: (value: number) => void;

  volume: number;
  setVolume: (v: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const [play, { pause, sound }] = useSound(
    tracks[currentTrackIndex].src,
    { volume }
  );

useEffect(() => {
  if (!sound || !sound.duration()) return;

  const interval = setInterval(() => {
    const seek = sound.seek();
    if (typeof seek === "number") {
      setCurrentTime(seek);
    }

    const dur = sound.duration();
    if (typeof dur === "number") {
      setDuration(dur);
    }
  }, 500);

  return () => clearInterval(interval);
}, [sound]);

  const seek = (value: number) => {
    if (!sound) return;
    sound.seek(value);
    setCurrentTime(value);
  };

  const handlePlay = () => {
    play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    pause();
    setIsPlaying(false);
  };

  const handleNext = () => {
    pause();
    setCurrentTime(0);
    setCurrentTrackIndex((i) => (i + 1) % tracks.length);
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    pause();
    setCurrentTime(0);
    setCurrentTrackIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider
      value={{
        isPlaying,
        play: handlePlay,
        pause: handlePause,
        next: handleNext,
        previous: handlePrevious,

        currentTrackIndex,
        currentTrack: tracks[currentTrackIndex],

        duration,
        currentTime,
        seek,

        volume,
        setVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
};