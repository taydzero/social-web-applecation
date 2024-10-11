// src/components/pages/message/MessageList.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../axiosConfig'; // Используйте axiosInstance для авторизованных запросов
import { User } from '../../../types/types';

const MessageList: React.FC = () => {
    const [conversations, setConversations] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axiosInstance.get('/api/messages/conversations');
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
        <div className="p-4">
            <h2 className="text-xl mb-4">Ваши сообщения</h2>
            {conversations.length > 0 ? (
                <ul>
                    {conversations.map((user) => (
                        <li key={user._id} className="mb-2 p-2 bg-gray-200 rounded">
                            <Link to={`/message/${user._id}`} className="text-blue-600 hover:underline">
                                {user.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">У вас нет переписок.</p>
            )}
        </div>
    );
};

export default MessageList;
