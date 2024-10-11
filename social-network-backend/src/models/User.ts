// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Применение предохранителя обновления даты
userSchema.pre<IUser>('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;

