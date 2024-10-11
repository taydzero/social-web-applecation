// src/models/Message.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
    content: string;
    from: Types.ObjectId; // Изменено с string на ObjectId
    to: Types.ObjectId;   // Изменено с string на ObjectId
    timestamp?: Date;
}

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;

