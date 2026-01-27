// src/components/pages/Contacts/Contacts.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosConfig';
import { User } from '../../../types/types';

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
            <h2 className="text-2xl font-bold">Все пользователи</h2>
            
            {users.length > 0 ? (
                // grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
                <div className="">
                    {users.map((user) => (
                        <div 
                            key={user._id} 
                            className=""
                            //p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-slate-800
                        >
                            <div className="">
                                {/* flex items-center mb-4 */}
                                {user.avatar ? (
                                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                        <img
                                        src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} 
                                        alt={user.name} 
                                        className="w-full h-full object-cover block"
                                        //w-12 rounded-full mb-2 object-cover
                                        onError={(e) => {
                                            // Если изображение не загрузилось, показываем placeholder
                                            e.currentTarget.style.display = 'none';
                                            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (placeholder) placeholder.style.display = 'flex';
                                        }}
                                    /></div>
                                ) : null}
                                {!user.avatar && (
                                    <div className="">
                                        {/* w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mb-2 */}
                                        <span className="text-2xl text-gray-600 dark:text-gray-300">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className=''>
                                <h3 className="font-semibold text-lg">{user.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
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
