import React, { FC } from "react";
import ColumnFis from './ColumnFis'
import ColumnTwo from "./ColumnTwo";


const Sidebar: FC = () => {
   return (
      <div className="flex flex-col gap-4">
         <ColumnFis />
         <ColumnTwo />
      </div>
   );
}

export default Sidebar;
