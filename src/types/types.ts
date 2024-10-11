// src/types/types.ts

export interface EditProfileFormInputs {
    name?: string;
    email?: string;
    password?: string;
    bio?: string;
    avatar?: FileList;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    _id: string; // Changed from number to string (since MongoDB IDs are strings)
    from: User;  // Change from string to User type
    to: User;    // Change from string to User type
    content: string;
    timestamp: Date; // Keep as Date
}