import { Link} from 'react-router-dom';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import GroupOutlined from '@ant-design/icons/GroupOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import InsertRowRightOutlined from '@ant-design/icons/InsertRowRightOutlined';

const ColumnFis= () => {
   return(
    // opacity-25 hover:opacity-100
    <div className="flex w-48 h-72">
    <div className="w-48 h-72 p-4 bg-white rounded-xl shadow-xl shadow-rose-500 transition-all duration-500 dark:bg-slate-950 dark:text-blue-500 dark:shadow-blue-500">
       <nav>
         <ul className="text-sm">
           <li className="p-2 pb-2 dark:hover:text-white hover:text-rose-500 transition-all duration-200 ease-in-out transform hover:scale-105">
            <Link to="/profile">
           <UserOutlined />
           <span className="pl-2">Профиль</span>
           </Link>
           </li>
           <li className="p-2 pb-2 dark:hover:text-white hover:text-rose-500 transition-all duration-200 ease-in-out transform hover:scale-105"><Link to="/News"><InsertRowRightOutlined /><span className="pl-2">Новости</span></Link></li>
           <li className="p-2 pb-2 dark:hover:text-white hover:text-rose-500 transition-all duration-200 ease-in-out transform hover:scale-105"><Link to="/"><HomeOutlined /><span className="pl-2">Главная</span></Link></li>
           <li className="p-2 pb-2 dark:hover:text-white hover:text-rose-500 transition-all duration-200 ease-in-out transform hover:scale-105"><Link to="/message"><MessageOutlined /><span className="pl-2">Мессенджер</span></Link></li>
           <li className="p-2 pb-2 dark:hover:text-white hover:text-rose-500 transition-all duration-200 ease-in-out transform hover:scale-105"><Link to="/contacts"><TeamOutlined /><span className="pl-2">Контакты</span></Link></li>
           <li className="p-2 pb-2 dark:hover:text-white hover:text-rose-500 transition-all duration-200 ease-in-out transform hover:scale-105"><Link to="/groups"><GroupOutlined /><span className="pl-2">Группы</span></Link></li>
           <li className="p-2 pb-2 dark:hover:text-white hover:text-rose-500 transition-all duration-200 ease-in-out transform hover:scale-105"><Link to="/settings"><SettingOutlined /><span className="pl-2">Настройки</span></Link></li>
         </ul>
       </nav>
    </div>
 </div>
   )
}

export default ColumnFis