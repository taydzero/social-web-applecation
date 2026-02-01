import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosConfig';
import { User } from '../../../types/types';
import { FaUserCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';

const UserProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) {
                if (currentUser) {
                    setUser(currentUser);
                    setLoading(false);
                    return;
                } else {
                    setError('Необходима авторизация');
                    setLoading(false);
                    return;
                }
            }
            
            try {
                setLoading(true);
                setError(null);
                const response = await axiosInstance.get(`/api/users/${id}`);
                console.log("Fetched user profile:", response.data);
                if (response.data) {
                    setUser(response.data);
                } else {
                    setError('Пользователь не найден');
                    toast.error('Пользователь не найден');
                }
            } catch (err: any) {
                console.error('Ошибка загрузки профиля:', err);
                setError('Пользователь не найден');
                toast.error('Пользователь не найден');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, currentUser]);

    if (loading) return <div className="text-center mt-10">Загрузка...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (!user) return null;

    const handleSendMessage = () => {
        navigate(`/message/${user._id}`);
    };

    const handleEditProfile = () => {
        navigate(`/edit-profile`);
    };

    return (
        <div className="max-w-xl mx-auto p-6 shadow-md rounded-md mt-10 ">
            <div className="mb-6">
                <div className='flex items-start gap-4'>
                    {user.avatar ? (
                        <img width="200px" height="200px"
                            src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} 
                            alt="Аватар пользователя" 
                            className="w-40 h-40 rounded-full object-cover border-2 border-gray-300"
                            onError={(e) => {
                                // Если изображение не загрузилось, показываем иконку
                                e.currentTarget.style.display = 'none';
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextElement) nextElement.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    {!user.avatar && (
                        <FaUserCircle className="w-40 h-40 text-gray-300" />
                    )}
                    <div>
                        <div>
                            <div>
                                <h1 className="text-3xl font-semibold">{user.name}</h1>
                                <p className="text-gray-600">{user.email}</p>
                                {user.bio && (
                                    <div className="mt-4">
                                        <h2 className="text-lg font-medium mb-2">О себе</h2>
                                        <p className="text-sm">{user.bio}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-4 mt-6">
                <button
                    onClick={handleEditProfile}
                    className="px-4 py-2 bg-rose-500 dark:bg-slate-950 dark:border-rose-500 text-white rounded transition">
                    Редактировать профиль
                </button>
                <button 
                    onClick={handleSendMessage}
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
