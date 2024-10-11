// src/components/pages/Profile/UserProfile.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Импортируйте useNavigate
import axiosInstance from '../../../axiosConfig';
import { User } from '../../../types/types';
import { FaUserCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const UserProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); // Инициализация хука навигации
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(`/api/users/${id}`);
                setUser(response.data);
            } catch (err: any) {
                setError('Пользователь не найден');
                toast.error('Пользователь не найден');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return <div className="text-center mt-10">Загрузка...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (!user) return null;

    // Функция для отправки сообщения
    const handleSendMessage = () => {
        navigate(`/message/${user._id}`); // Переход к диалогу с пользователем
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
            <div className="mb-6">
                <div className='flex'>
                    {/* Проверяем наличие аватара пользователя */}
                    {user.avatar ? (
                        <img src={user.avatar} alt="Аватар пользователя" className="w-40 h-40 rounded-full" />
                    ) : (
                        <FaUserCircle className="w-40 h-40 text-gray-300 mr-4" />
                    )}
                    <div className="">
                        <div className="">
                            <div>
                                <h1 className="text-3xl font-semibold">{user.name}</h1>
                                <p className="text-gray-600">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Кнопка редактирования профиля */}
                <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">
                    Редактировать профиль
                </button>

                {user.bio && (
                    <div className="mt-4">
                        <h2 className="text-xl font-medium mb-2">О себе</h2>
                        <p className="text-gray-700">{user.bio}</p>
                    </div>
                )}
            </div>
            {/* Кнопки взаимодействия */}
            <div className="space-x-4 mt-6">
                {/* Измените кнопку для отправки сообщения */}
                <button 
                    onClick={handleSendMessage} // Обработчик для перехода к сообщениям
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    Отправить сообщение
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
                    Следовать
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
