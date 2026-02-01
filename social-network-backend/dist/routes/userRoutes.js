"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = (0, express_1.Router)();
router.get('/', userController_1.getAllUsers);
router.get('/profile', userController_1.getUserProfile);
router.get('/:id', userController_1.getUserById);
router.put('/profile', upload_1.default.single('avatar'), userController_1.updateUserProfile);
exports.default = router;
