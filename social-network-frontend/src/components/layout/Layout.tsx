import React from "react";
import Header from "./header/Header";
import Sidebar from "./sidebar/Sidebar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   return (
      <div className="flex flex-col min-h-screen">
         <Header />
         <div className="flex gap-4 mx-44 mb-4 pt-4 flex-grow">
            <Sidebar />
            {/* opacity-0 hover:opacity-100 */}
            <div className="w-full p-4 bg-white rounded-xl transition-all duration-500
            shadow-xl shadow-rose-500 mr-32 dark:bg-slate-950 dark:text-blue-500 dark:shadow-blue-500">
               {children}
            </div>
         </div>
      </div>
   );
}

export default Layout;



            