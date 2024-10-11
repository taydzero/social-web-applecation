// Player.tsx
import React from "react";
import { usePlayer } from "./PlayerContext"; // Импортируем хук контекста
import PauseOutlined from '@ant-design/icons/PauseOutlined';
import PlayCircleOutlined from '@ant-design/icons/PlayCircleOutlined';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';

const Player: React.FC<{ isHeader?: boolean }> = ({ isHeader }) => {
  const { isPlaying, play, pause, next, previous, currentTrack, currentTrackIndex } = usePlayer();

  return (
    <div className={isHeader ? "flex items-center" : "my-4"}>
      <div className={isHeader ? "flex items-center gap-2" : ""}>
        {isPlaying ? (
          <PauseOutlined onClick={pause} style={{ fontSize: isHeader ? 20 : 40 }} />
        ) : (
          <PlayCircleOutlined onClick={play} style={{ fontSize: isHeader ? 20 : 40 }} />
        )}
        <LeftOutlined onClick={previous} style={{ fontSize: isHeader ? 20 : 40 }} />
        <RightOutlined onClick={next} style={{ fontSize: isHeader ? 20 : 40 }} />
      </div>
      {!isHeader && <p className="mt-2">Playing: {currentTrack}</p>} {/* Отображаем трек только на странице плеера */}
    </div>
  );
};

export default Player;
