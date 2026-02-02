import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from './MessageContext';
import { useAuth } from '../../../contexts/AuthContext';
import axiosInstance from '../../../axiosConfig';

const Message: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { messages, fetchMessagesWithUser, sendMessage } = useMessages();

  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState<{ name: string; avatar?: string; bio?: string }>({ name: '', avatar: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const scrollToBottom = useCallback(() => {
    if (!isScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [isScrolledUp]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setIsScrolledUp(scrollTop + clientHeight < scrollHeight - 50);
  };

  // Загрузка истории сообщений
  useEffect(() => {
    if (!id) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        await fetchMessagesWithUser(id); // обновляет сообщения в контексте
      } catch (err) {
        console.error(err);
        setError('Ошибка при загрузке сообщений');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [id, fetchMessagesWithUser]);

  // Загрузка данных получателя
  useEffect(() => {
    if (!id) return;
    const loadRecipientInfo = async () => {
      try {
        const response = await axiosInstance.get(`/api/users/${id}`);
        setRecipient({
          name: response.data.name || 'Имя не указано',
          avatar: response.data.avatar || '/default-avatar.png',
          bio: response.data.bio || 'Нет описания',
        });
      } catch (err) {
        console.error('Ошибка при загрузке информации о получателе:', err);
      }
    };
    loadRecipientInfo();
  }, [id]);

  // Автоскролл при новых сообщениях
  useEffect(() => {
    if (isScrolledUp) {
      setUnreadCount(prev => prev + 1);
    } else {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, isScrolledUp]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !id) return;
    sendMessage(id, newMessage.trim());
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) return <div className="text-center mt-10">Загрузка...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-screen p-4">
      <h2 className="text-xl mb-2 flex items-center justify-between">
        <span>Переписка с {recipient.name}</span>
        {unreadCount > 0 && <span className="text-sm text-red-500">{unreadCount} новое сообщение{unreadCount > 1 ? 'я' : ''}</span>}
      </h2>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto mb-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length > 0 ? (
          messages.map(msg => {
            const isSentByCurrentUser = msg.from._id === user?._id;
            return (
              <div
                key={msg._id}
                className={`p-2 mb-2 rounded ${isSentByCurrentUser ? 'bg-blue-200 self-end' : 'bg-green-200 self-start'}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isSentByCurrentUser ? 'flex-end' : 'flex-start',
                  border: !isSentByCurrentUser && isScrolledUp ? '1px solid #f87171' : 'none',
                }}
              >
                {!isSentByCurrentUser && msg.from && (
                  <div className="flex items-center mb-1">
                    <img src={msg.from.avatar || '/default-avatar.png'} alt={msg.from.name} className="w-6 h-6 rounded-full mr-2" />
                    <span className="font-semibold">{msg.from.name || 'Имя не указано'}</span>
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
        <div ref={messagesEndRef}></div>
      </div>

      <div className="flex flex-col">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение (Enter — отправка, Shift+Enter — новая строка)"
          className="w-full p-2 rounded border border-gray-100"
          rows={3}
        />
        <button onClick={handleSendMessage} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Message;
