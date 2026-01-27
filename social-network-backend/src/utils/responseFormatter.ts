// Утилита для преобразования данных бэкенда в формат, ожидаемый фронтендом
import { User } from '../entities/User';
import { Message } from '../entities/Message';

// Преобразование User в формат фронтенда
export const formatUser = (user: User): any => {
    if (!user) return null;
    return {
        _id: user.id.toString(),
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
};

// Преобразование Message в формат фронтенда
export const formatMessage = (message: Message): any => {
    if (!message) return null;
    return {
        _id: message.id.toString(),
        from: formatUser(message.fromUser),
        to: formatUser(message.toUser),
        content: message.content,
        timestamp: message.timestamp,
    };
};

// Преобразование массива сообщений
export const formatMessages = (messages: Message[]): any[] => {
    return messages.map(formatMessage);
};

// Преобразование массива пользователей
export const formatUsers = (users: User[]): any[] => {
    return users.map(formatUser);
};

