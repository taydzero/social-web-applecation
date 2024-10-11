// models/Message.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    content: string;
    from: string;
    to: string;
    timestamp?: Date;
}

const messageSchema = new Schema<IMessage>({
    content: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
