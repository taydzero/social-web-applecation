"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/messageRoutes.ts
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Получение списка всех пользователей, с которыми была переписка
router.get('/conversations', authMiddleware_1.authenticateToken, messageController_1.getConversations);
// Получение всех сообщений текущего пользователя
router.get('/', authMiddleware_1.authenticateToken, messageController_1.getAllMessages);
// Получение сообщений с конкретным пользователем
router.get('/:id', authMiddleware_1.authenticateToken, messageController_1.getMessagesWithUser);
// Отправка нового сообщения
router.post('/', authMiddleware_1.authenticateToken, [
    (0, express_validator_1.check)('to', 'Получатель обязателен').not().isEmpty(),
    (0, express_validator_1.check)('content', 'Сообщение не должно быть пустым').not().isEmpty(),
], messageController_1.sendMessage);
exports.default = router;
