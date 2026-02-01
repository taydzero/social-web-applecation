import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Message } from '../../../types/types';
import axiosInstance from '../../../axiosConfig';

interface MessageContextType {
  messages: Message[];
  sendMessage: (to: string, content: string) => Promise<void>;
  fetchMessagesWithUser: (id: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Загрузка сообщений с конкретным пользователем
  const fetchMessagesWithUser = useCallback(async (id: string) => {
    try {
      const response = await axiosInstance.get(`/api/messages/${id}`);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Ошибка при загрузке сообщений с пользователем:', error);
    }
  }, []);

  // Отправка нового сообщения
  const sendMessage = useCallback(async (to: string, content: string) => {
    if (!content.trim()) return;

    try {
      // Отправка сообщения на бек с ID получателя в URL
      await axiosInstance.post(`/api/messages/${to}`, { content });
      // Обновляем список сообщений после отправки
      await fetchMessagesWithUser(to);
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      throw error; // чтобы компонент мог поймать и показать ошибку
    }
  }, [fetchMessagesWithUser]);

  return (
    <MessageContext.Provider value={{ messages, sendMessage, fetchMessagesWithUser }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (!context) throw new Error('useMessages must be used within a MessageProvider');
  return context;
};
