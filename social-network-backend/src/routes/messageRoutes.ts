// src/routes/messageRoutes.ts
import { Router } from 'express';
import { getAllMessages, getMessagesWithUser, sendMessage, getConversations } from '../controllers/messageController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { check } from 'express-validator';

const router = Router();

// Получение списка всех пользователей, с которыми была переписка
router.get('/conversations', authenticateToken, getConversations);

// Получение всех сообщений текущего пользователя
router.get('/', authenticateToken, getAllMessages);

// Получение сообщений с конкретным пользователем
router.get('/:id', authenticateToken, getMessagesWithUser);

// Отправка нового сообщения
router.post(
    '/',
    authenticateToken,
    [
        check('to', 'Получатель обязателен').not().isEmpty(),
        check('content', 'Сообщение не должно быть пустым').not().isEmpty(),
    ],
    sendMessage
);

export default router;
