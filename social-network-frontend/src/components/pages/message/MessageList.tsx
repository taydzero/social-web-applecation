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
        <div className="h-full flex flex-col px-6 py-4">
            <h2 className="text-2xl font-semibold mb-6 text-blue-400">
            Ваши сообщения
            </h2>

            {conversations.length > 0 ? (
            <div className="flex flex-col gap-4">
                {conversations.map((user) => (
                <Link
                    key={user._id}
                    to={`/message/${user._id}`}
                    className="
                    flex items-center gap-4
                    px-4 py-3
                    rounded-xl
                    bg-slate-900/60
                    hover:bg-slate-800/80
                    transition-colors
                    border border-slate-700/50
                    "
                >
                    {/* Инфо */}
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-medium dark:text-white truncate">
                        {user.name}
                        </h3>

                        {user.lastMessage && (
                        <span className="text-xs text-slate-400 ml-2 shrink-0">
                            {new Date(user.lastMessage.timestamp).toLocaleDateString(
                            'ru-RU',
                            {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            }
                            )}
                        </span>
                        )}
                    </div>

                    {user.lastMessage ? (
                        <p className="text-sm text-slate-300 truncate">
                        {user.lastMessage.fromUserId === currentUser?._id && (
                            <span className="text-slate-400">Вы: </span>
                        )}
                        {user.lastMessage.content}
                        </p>
                    ) : (
                        <p className="text-sm text-slate-500 italic">
                        Нет сообщений
                        </p>
                    )}
                    </div>
                </Link>
                ))}
            </div>
            ) : (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-500">У вас нет переписок</p>
            </div>
            )}
        </div>
        );

};

export default MessageList;

