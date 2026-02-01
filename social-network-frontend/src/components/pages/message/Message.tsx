import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from './MessageContext';
import { Message as MessageType } from '../../../types/types';
import axiosInstance from '../../../axiosConfig';
import { useAuth } from '../../../contexts/AuthContext';

const Message: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { sendMessage } = useMessages();
    const [newMessage, setNewMessage] = useState<string>('');
    const [userMessages, setUserMessages] = useState<MessageType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [recipientName, setRecipientName] = useState<string>('');
    const { user } = useAuth();

    const fetchUserMessages = async () => {
        if (id) {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/api/messages/${id}`);
                console.log("Fetched messages:", response.data);
                setUserMessages(Array.isArray(response.data) ? response.data : []);
                setError(null);
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
                const response = await axiosInstance.get(`/api/users/${id}`);
                console.log("Fetched recipient info:", response.data);
                setRecipientName(response.data.name);
            } catch (error) {
                console.error('Ошибка при загрузке информации о пользователе:', error);
            }
        }
    };

    useEffect(() => {
    fetchUserMessages();
    fetchRecipientInfo();
}, [id, fetchUserMessages, fetchRecipientInfo]);


    const handleSendMessage = async () => {
        if (newMessage.trim() && id) {
            try {
                await sendMessage(id, newMessage.trim());
                setNewMessage('');
                await fetchUserMessages();
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
            }
        }
    };

    if (loading) return <div className="text-center mt-10">Загрузка...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
            <div className="flex flex-col h-screen p-4">
                <h2 className="text-xl mb-4">Переписка с пользователем {recipientName || id}</h2>
                
                <div className="flex-1 overflow-y-auto mb-4"> 
                    {userMessages.length > 0 ? (
                        userMessages.map((msg: MessageType) => {
                            console.log('Processing message:', msg);
                            const isSentByCurrentUser = msg.from._id === user?._id;
                            return (
                                <div 
                                    key={msg._id} 
                                    className={`p-2 mb-2 rounded ${isSentByCurrentUser ? 'bg-blue-200 self-end' : 'bg-green-200 self-start'}`}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: isSentByCurrentUser ? 'flex-end' : 'flex-start' }}
                                >
                                    {!isSentByCurrentUser && msg.from && (
                                        <div className="flex items-center mb-1">
                                            <span className="font-semibold">{msg.from.name || "Имя не указано"}</span>
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
        
                <div className="flex flex-col">
                <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Введите ваше сообщение..."
                        className="w-full p-2 rounded border border-gray-100 "
                        rows={3}
                />

                    <button
                        onClick={handleSendMessage}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Отправить сообщение
                    </button>
                </div>
            </div>
        );
    }

export default Message;


