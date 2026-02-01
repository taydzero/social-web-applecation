import React from "react";
import { Link } from 'react-router-dom';
import UserOutlined from '@ant-design/icons/UserOutlined';

const ColumnTwo = () => {
  return (
    <div className="flex w-48">
      <div className="w-48 h-18 p-4 bg-white rounded-xl shadow-xl shadow-rose-500 transition-all duration-500 dark:bg-slate-950 dark:text-blue-500 dark:shadow-blue-500">
        <nav>
          <ul className="text-sm">
            <li className="p-2 pb-2 dark:hover:text-white hover:text-rose-500 transition-all duration-200 ease-in-out transform hover:scale-105">
              <Link to="/Player">
                <UserOutlined />
                <span className="pl-2">Музыка</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ColumnTwo;
