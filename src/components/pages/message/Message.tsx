import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from './MessageContext';
import { Message as MessageType, User } from '../../../types/types';
import axiosInstance from '../../../axiosConfig';
import { useAuth } from '../../../contexts/AuthContext';

const Message: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { messages, sendMessage } = useMessages();
    const [newMessage, setNewMessage] = useState<string>('');
    const [userMessages, setUserMessages] = useState<MessageType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [recipientName, setRecipientName] = useState<string>(''); // Хранение имени получателя
    const { user } = useAuth(); // Получение текущего пользователя

    useEffect(() => {
        const fetchUserMessages = async () => {
            if (id) {
                try {
                    const response = await axiosInstance.get(`/api/messages/${id}`);
                    setUserMessages(Array.isArray(response.data) ? response.data : []);
                } catch (error) {
                    console.error('Ошибка при загрузке сообщений с пользователем:', error);
                    setError('Не удалось загрузить сообщения.');
                } finally {
                    setLoading(false);
                }
            }
        };

        const fetchRecipientInfo = async () => {
            if (id) {
                try {
                    const response = await axiosInstance.get(`/api/users/${id}`); // Получение информации о пользователе
                    setRecipientName(response.data.name); // Предполагаем, что ответ содержит поле name
                } catch (error) {
                    console.error('Ошибка при загрузке информации о пользователе:', error);
                }
            }
        };

        fetchUserMessages();
        fetchRecipientInfo(); // Вызов функции для получения информации о получателе
    }, [id, messages]); // Обновлять при изменении id или сообщений

    const handleSendMessage = async () => {
        if (newMessage.trim() && id) {
            await sendMessage(id, newMessage.trim());
            setNewMessage('');
        }
    };

    if (loading) return <div className="text-center mt-10">Загрузка...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-xl mb-4">Переписка с пользователем {recipientName || id}</h2> {/* Используйте имя получателя */}
            <div className="mb-4">
                {userMessages.length > 0 ? (
                    userMessages.map((msg: MessageType) => {
                        const isSentByCurrentUser = msg.from._id === user?._id;
                        return (
                            <div 
                                key={msg._id} 
                                className={`p-2 mb-2 rounded ${isSentByCurrentUser ? 'bg-blue-200 self-end' : 'bg-green-200 self-start'}`}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: isSentByCurrentUser ? 'flex-end' : 'flex-start' }}
                            >
                                {!isSentByCurrentUser && (
                                    <div className="flex items-center mb-1">
                                        <span className="font-semibold">{msg.from.name}</span>
                                    </div>
                                )}
                                <p>{msg.content}</p>
                                <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</span>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500">Нет сообщений с этим пользователем.</p>
                )}
            </div>

            {/* Форма для отправки нового сообщения */}
            <div className="mt-4 flex flex-col">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите ваше сообщение..."
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={3}
                />
                <button
                    onClick={handleSendMessage}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    Отправить сообщение
                </button>
            </div>
        </div>
    );
};

export default Message;
