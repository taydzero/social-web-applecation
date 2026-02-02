import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Message } from '../../../types/types';
import axiosInstance from '../../../axiosConfig';
import { socket } from '../../../socket';
import { useAuth } from '../../../contexts/AuthContext';

interface MessageContextType {
  messages: Message[];
  sendMessage: (to: string, content: string) => void;
  fetchMessagesWithUser: (id: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatUserId, setCurrentChatUserId] = useState<string | null>(null);
  const { user } = useAuth();

  // Слушаем новые сообщения через сокет
  useEffect(() => {
    const handleReceiveMessage = (msg: Message) => {
      // Фильтруем только для текущего чата
      if (currentChatUserId && (msg.from._id === currentChatUserId || msg.to._id === currentChatUserId)) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [currentChatUserId]);

  // Загрузка истории сообщений
  const fetchMessagesWithUser = useCallback(async (id: string) => {
    try {
      setCurrentChatUserId(id);
      const response = await axiosInstance.get(`/api/messages/${id}`);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', error);
    }
  }, []);

  // Отправка сообщения
  const sendMessage = useCallback((to: string, content: string) => {
    if (!content.trim() || !user) return;

    // Создаём локальное сообщение сразу
    const localMessage: Message = {
      _id: `${Date.now()}`, // временный id
      content,
      from: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      to: {
        _id: to,
        name: '', // можно оставить пустым, т.к. собеседник добавится с сервера
        email: '',
        avatar: '',
        bio: '',
        createdAt: '',
        updatedAt: '',
      },
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, localMessage]); // добавляем в локальный стейт

    socket.emit('sendMessage', { to, content });
  }, [user]);

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
