import { Router } from 'express';
import { getAllMessages, getMessagesWithUser, sendMessage, getConversations } from '../controllers/messageController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { check } from 'express-validator';

const router = Router();

router.get('/conversations', authenticateToken, getConversations);

router.get('/', authenticateToken, getAllMessages);

router.get('/:id', authenticateToken, getMessagesWithUser);

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
