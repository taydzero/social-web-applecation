// src/components/pages/Profile/UserList.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from './UserContext';
import { User } from '../../../types/types'; // Проверьте путь

interface UserListProps {
    users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
    return (
        <div>
            <h2 className="text-xl mb-4">Список пользователей</h2>
            <ul>
                {users.map((user: User) => (
                    <li key={user._id} className="mb-2 p-2 bg-gray-200 rounded">
                        <Link to={`/profile/${user._id}`} className="text-blue-600 hover:underline">
                            {user.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;