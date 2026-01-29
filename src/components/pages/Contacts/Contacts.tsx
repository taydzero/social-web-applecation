// src/components/pages/Contacts/Contacts.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosConfig';
import { User } from '../../../types/types';
import Avatar from '../../ui/Avatar/Avatar';

const Contacts: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get('/api/users');
                console.log("Fetched users:", response.data);
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Ошибка загрузки пользователей', error);
                setError('Не удалось загрузить список пользователей.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleSendMessage = (userId: string) => {
        navigate(`/message/${userId}`);
    };

    const handleViewProfile = (userId: string) => {
        navigate(`/profile/${userId}`);
    };

    if (loading) return <div className="text-center mt-10">Загрузка...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Все пользователи</h2>
            
            {users.length > 0 ? (
                // grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
                <div className="">
                    {users.map((user) => (
                        <div 
                            key={user._id} 
                            className=""
                            //p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-slate-800
                        >
                            <div className="flex items-center gap-4">
                                
                                <div className="">
                                <Avatar
                                    src={user.avatar}
                                    name={user.name}
                                    size={120}
                                />

                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <h2 className="font-semibold text-2xl">{user.name}</h2>
                                    <div className='flex gap-4'>
                                    <button
                                        onClick={() => handleViewProfile(user._id)}
                                        className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
                                    >
                                        Профиль
                                    </button>
                                    <button
                                        onClick={() => handleSendMessage(user._id)}
                                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                                    >
                                        Написать
                                    </button>
                                    </div>
                                </div>
                                {/* <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p> */}
                            </div>   
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center mt-10">
                    <p className="text-gray-500 dark:text-gray-400">Нет других пользователей</p>
                </div>
            )}
        </div>
    );
};

export default Contacts;
