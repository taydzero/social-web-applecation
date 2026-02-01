import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import axiosInstance from '../../../axiosConfig';

interface UserContextType {
    users: User[];
    addUser: (user: User) => void;
    fetchUsers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const TEST_MODE = true; // <- тестовый режим

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/api/users');
            setUsers(response.data);
        } catch (error: any) {
            console.error('Ошибка загрузки пользователей', error.response?.status || error.message);
            if (!TEST_MODE && (error.response?.status === 401 || error.response?.status === 403)) {
                console.error('Неавторизованный доступ');
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const addUser = (user: User) => setUsers(prev => [...prev, user]);

    return (
        <UserContext.Provider value={{ users, addUser, fetchUsers }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUserContext must be used within a UserProvider');
    return context;
};
