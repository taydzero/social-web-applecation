"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = (0, express_1.Router)();
// Получение профиля текущего пользователя
router.get('/profile', userController_1.getUserProfile);
// Получение профиля пользователя по ID
router.get('/:id', userController_1.getUserById);
// Обновление профиля пользователя с загрузкой аватара
router.post('/profile', upload_1.default.single('avatar'), userController_1.updateUserProfile);
exports.default = router;
