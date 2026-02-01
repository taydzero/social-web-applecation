import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../../../axiosConfig';
import { Message } from '../../../types/types';
import { useAuth } from '../../../contexts/AuthContext';

interface MessageContextType {
    messages: Message[];
    sendMessage: (to: string, msg: string) => Promise<void>;
    fetchMessages: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const { user, logout } = useAuth();

    const fetchMessages = async () => {
        if (!user) return;

        try {
            const response = await axiosInstance.get('/api/messages');
            console.log('Полученные сообщения:', response.data);
            setMessages(Array.isArray(response.data) ? response.data : []);
        } catch (error: any) {
            console.error('Ошибка при получении сообщений:', error.response?.status || error.message);
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.warn('Токен недействителен, выходим...');
                logout();
            }
        }
    };

    useEffect(() => {
        fetchMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const sendMessage = async (to: string, msg: string) => {
        if (!user) return;

        try {
            const response = await axiosInstance.post('/api/messages', { to, content: msg });
            setMessages(prev => [...prev, response.data]);
        } catch (error: any) {
            console.error('Ошибка при отправке сообщения:', error.response?.status || error.message);
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.warn('Токен недействителен, выходим...');
                logout();
            }
        }
    };

    return (
        <MessageContext.Provider value={{ messages, sendMessage, fetchMessages }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessages = (): MessageContextType => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
};
