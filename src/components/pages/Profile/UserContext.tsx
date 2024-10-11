// UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import axios from 'axios';

interface UserContextType {
    users: User[];
    addUser: (user: User) => void;
    fetchUsers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Ошибка загрузки пользователей', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const addUser = (user: User) => {
        setUsers((prev) => [...prev, user]);
    };

    return (
        <UserContext.Provider value={{ users, addUser, fetchUsers }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};
