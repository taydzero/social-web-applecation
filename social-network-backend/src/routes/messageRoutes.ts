import { Router } from 'express';
import { getAllMessages, getMessagesWithUser, sendMessage, getConversations } from '../controllers/messageController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { check } from 'express-validator';

const router = Router();

// Получить список всех диалогов пользователя
router.get('/conversations', authenticateToken, getConversations);

// Получить все сообщения пользователя (не обязательно, может быть для админки)
router.get('/', authenticateToken, getAllMessages);

// Получить сообщения с конкретным пользователем
router.get('/:id', authenticateToken, getMessagesWithUser);

// Отправить сообщение конкретному пользователю
router.post(
    '/:id',
    authenticateToken,
    [
        check('content', 'Сообщение не должно быть пустым').not().isEmpty(),
    ],
    sendMessage
);

export default router;
