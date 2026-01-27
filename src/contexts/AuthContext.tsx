// src/contexts/authContext
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AuthContextType {
    user: User | null;
    token: string | null;
    register: (name: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

interface User {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            // Получение профиля пользователя при наличии токена
            axiosInstance.get('/api/users/profile')
                .then(response => {
                    setUser(response.data);
                })
                .catch(error => {
                    console.error('Ошибка при получении профиля:', error);
                    logout();
                });
        }
    }, [token]);

    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await axiosInstance.post('/api/auth/register', { name, email, password });
            const receivedToken = response.data.token;
            localStorage.setItem('token', receivedToken);
            setToken(receivedToken);

            // Получение профиля после регистрации
            const profileResponse = await axiosInstance.get('/api/users/profile');
            setUser(profileResponse.data);

            toast.success('Регистрация прошла успешно!');
            navigate('/');
        } catch (error: any) {
            console.error('Ошибка при регистрации:', error.response?.data);
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach((err: any) => toast.error(err.msg));
            } else {
                toast.error('Не удалось выполнить регистрацию. Попробуйте позже.');
            }
            throw error.response?.data;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axiosInstance.post('/api/auth/login', { email, password });
            const receivedToken = response.data.token;
            localStorage.setItem('token', receivedToken);
            setToken(receivedToken);

            // Получение профиля после логина
            const profileResponse = await axiosInstance.get('/api/users/profile');
            setUser(profileResponse.data);

            toast.success('Вы успешно вошли в систему!');
            navigate('/');
        } catch (error: any) {
            console.error('Ошибка при логине:', error.response?.data);
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach((err: any) => toast.error(err.msg));
            } else {
                toast.error('Не удалось выполнить вход. Попробуйте позже.');
            }
            throw error.response?.data;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login');
        toast.info('Вы вышли из системы.');
    };

    return (
        <AuthContext.Provider value={{ user, token, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
