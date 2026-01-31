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
    _id: string;
    from: User;
    to: User;
    content: string;
    timestamp: Date;
}


