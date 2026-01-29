import React from "react";

type AvatarProps = {
  src?: string;
  name: string;
  size?: number;
};

const BACKEND_URL = "http://localhost:5000";

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 48 }) => {
  const avatarSrc = src
    ? src.startsWith("http")
      ? src
      : `${BACKEND_URL}${src}`
    : null;

  return (
    <div
      style={{ width: size, height: size }}
      className=" overflow-hidden bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0"
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={name}
          className="w-full h-full object-cover block rounded-xl"
        />
      ) : (
        <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

export default Avatar;