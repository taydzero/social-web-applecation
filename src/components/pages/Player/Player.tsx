// Player.tsx
import React from "react";
import { usePlayer } from "./PlayerContext";
import PauseOutlined from '@ant-design/icons/PauseOutlined';
import PlayCircleOutlined from '@ant-design/icons/PlayCircleOutlined';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';

const Player: React.FC<{ isHeader?: boolean }> = ({ isHeader }) => {
  const { isPlaying, play, pause, next, previous, currentTrack, duration, currentTime, seek, volume, setVolume } = usePlayer();

  const formatTime = (rawTime: number) => {
    if (!rawTime || isNaN(rawTime)) return "0:00";


    const totalSeconds = Math.floor(rawTime);


    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;


    if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
    }


    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-xl flex items-center gap-4">
      <div className={isHeader ? "flex items-center gap-2" : ""}>
        <img
          src={currentTrack.cover}
          alt=""
          className="w-12 h-12 rounded-md object-cover"
        />
        {isPlaying ? (
          <PauseOutlined onClick={pause} style={{ fontSize: isHeader ? 20 : 40 }} />
        ) : (
          <PlayCircleOutlined className="bg-slate-800" onClick={play} style={{ fontSize: isHeader ? 20 : 40 }} />
        )}
        <LeftOutlined onClick={previous} style={{ fontSize: isHeader ? 20 : 40 }} />
        <RightOutlined onClick={next} style={{ fontSize: isHeader ? 20 : 40 }} />
      </div>
      <span>{formatTime(currentTime)}</span>
      <input
        type="range"
        min={0}
        max={duration}
        value={currentTime}
        onChange={(e) => seek(Number(e.target.value))}
        className="w-full accent-white"
      />
      <div className="flex justify-between text-xs text-neutral-400">
        <span>{formatTime(duration)}</span>
      </div>
      {!isHeader && <p className="mt-2">
  {currentTrack.artist} — {currentTrack.title}
</p>} {/* Отображаем трек только на странице плеера */}
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={volume}
      onChange={(e) => setVolume(Number(e.target.value))}
      className="w-24 accent-white"
    />
    </div>
    
  );
};

export default Player;
