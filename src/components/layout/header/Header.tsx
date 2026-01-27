// Header.tsx
import React, { FC } from "react";
import { Link } from "react-router-dom";
import Player from "../../pages/Player/Player";

const Header: FC = () => {
  return (
    <nav className="bg-white text-base h-16 m-0 px-24 transition-all duration-500 shadow-lg shadow-rose-500 dark:shadow-blue-500 dark:bg-slate-950 dark:text-white ">
      <div className="flex items-center justify-between h-full">
        <Link className="flex items-center gap-2 text-3xl font-bold" to="/">
          {/* <img src={logo} alt="Logo" height={42} width={42} /> */}
          会話
        </Link>


        <div className="flex items-center gap-4">
          <Player isHeader={true} /> {/* Плеер в шапке */}
          <Link to="/Login"><span className="pl-2">войти</span></Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
