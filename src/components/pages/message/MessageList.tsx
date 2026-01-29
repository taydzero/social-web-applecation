import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../axiosConfig';
import { User } from '../../../types/types';
import { useAuth } from '../../../contexts/AuthContext';

interface ConversationUser extends User {
    lastMessage?: {
        content: string;
        timestamp: Date;
        fromUserId: string;
    } | null;
}

const MessageList: React.FC = () => {
    const [conversations, setConversations] = useState<ConversationUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axiosInstance.get('/api/messages/conversations');
                console.log("Fetched conversations:", response.data); // add to debug
                setConversations(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Ошибка загрузки разговоров', error);
                setError('Не удалось загрузить разговоры.');
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    if (loading) return <div className="text-center mt-10">Загрузка...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Ваши сообщения</h2>
            {conversations.length > 0 ? (
                <div className="space-y-2">
                    {conversations.map((user) => (
                        <Link 
                            key={user._id} 
                            to={`/message/${user._id}`}
                            className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
                            dark:bg-slate-800 dark:hover:bg-slate-700
                            ease-in-out transform hover:scale-[1.02]"
                        >
                            <div className="flex items-center gap-4">
                                {/* <div className="flex-shrink-0">
                                    {user.avatar ? (
                                        <img 
                                            src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} 
                                            alt={user.name} 
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (placeholder) placeholder.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    {!user.avatar && (
                                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div> */}
                                
                                {/* Информация о пользователе и последнее сообщение */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                            {user.name}
                                        </h3>
                                        {user.lastMessage && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                                {new Date(user.lastMessage.timestamp).toLocaleDateString('ru-RU', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        )}
                                    </div>
                                    {user.lastMessage ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                            {user.lastMessage.fromUserId === currentUser?._id && (
                                                <span className="text-gray-500 dark:text-gray-400">Вы: </span>
                                            )}
                                            {user.lastMessage.content}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                                            Нет сообщений
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">У вас нет переписок.</p>
                </div>
            )}
        </div>
    );
};

export default MessageList;

