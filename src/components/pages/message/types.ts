// types.ts
export interface User {
    id: number;
    name: string;
}

export interface Message {
    id: number;
    senderId: number;
    recipientId: number;
    content: string;
    timestamp: Date;
}

