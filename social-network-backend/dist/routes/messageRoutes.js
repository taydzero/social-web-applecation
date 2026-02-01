"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.get('/conversations', authMiddleware_1.authenticateToken, messageController_1.getConversations);
router.get('/', authMiddleware_1.authenticateToken, messageController_1.getAllMessages);
router.get('/:id', authMiddleware_1.authenticateToken, messageController_1.getMessagesWithUser);
router.post('/', authMiddleware_1.authenticateToken, [
    (0, express_validator_1.check)('to', 'Получатель обязателен').not().isEmpty(),
    (0, express_validator_1.check)('content', 'Сообщение не должно быть пустым').not().isEmpty(),
], messageController_1.sendMessage);
exports.default = router;
