import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

class AuthError extends Error {
    errors?: Array<{ msg: string }>;

    constructor(message: string, errors?: Array<{ msg: string }>) {
        super(message);
        this.name = 'AuthError';
        this.errors = errors;
    }
}

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

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login');
        toast.info('Вы вышли из системы.');
    }, [navigate]);

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
    }, [token, logout]);

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
            console.error('Ошибка при регистрации:', error.response?.data || error.message);
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach((err: any) => toast.error(err.msg));
                throw new AuthError('Ошибка регистрации', error.response.data.errors);
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
                throw new AuthError(error.response.data.message);
            } else {
                const message = error.message === 'Network Error' 
                    ? 'Сервер недоступен. Проверьте соединение.' 
                    : 'Не удалось выполнить регистрацию. Попробуйте позже.';
                toast.error(message);
                throw new AuthError(message);
            }
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
            console.error('Ошибка при логине:', error.response?.data || error.message);
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach((err: any) => toast.error(err.msg));
                throw new AuthError('Ошибка входа', error.response.data.errors);
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
                throw new AuthError(error.response.data.message);
            } else {
                const message = error.message === 'Network Error' 
                    ? 'Сервер недоступен. Проверьте соединение.' 
                    : 'Не удалось выполнить вход. Попробуйте позже.';
                toast.error(message);
                throw new AuthError(message);
            }
        }
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
