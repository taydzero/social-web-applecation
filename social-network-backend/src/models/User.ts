// backend/src/models/User.ts

import { Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: string; // Добавьте поле avatar, оно должно быть необязательным
    bio?: string;
}

// Схема пользователя
import mongoose, { Schema } from 'mongoose';

const UserSchema: Schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String }, // Добавляем поле avatar в схему
    bio: { type: String }
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
