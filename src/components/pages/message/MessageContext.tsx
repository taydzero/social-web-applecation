// src/components/pages/message/MessageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../../../axiosConfig';
import { Message } from '../../../types/types';
import { useAuth } from '../../../contexts/AuthContext';

interface MessageContextType {
    messages: Message[];
    sendMessage: (to: string, msg: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchMessages = async () => {
            if (user) {
                try {
                    const response = await axiosInstance.get('/api/messages');
                    console.log('Полученные сообщения:', response.data); // Логирование
                    setMessages(Array.isArray(response.data) ? response.data : []);
                } catch (error) {
                    console.error('Ошибка при получении сообщений:', error);
                }
            }
        };
        fetchMessages();
    }, [user]);

    const sendMessage = async (to: string, msg: string) => {
        if (!user) return;

        try {
            const response = await axiosInstance.post('/api/messages', { to, content: msg });
            setMessages(prev => [...prev, response.data]);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    };

    return (
        <MessageContext.Provider value={{ messages, sendMessage }}>
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
