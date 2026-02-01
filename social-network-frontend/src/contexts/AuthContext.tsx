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
        axiosInstance.interceptors.request.use(
            (config) => {
                const t = localStorage.getItem('token');
                if (t) {
                    config.headers['Authorization'] = `Bearer ${t}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }, []);

    useEffect(() => {
        if (token) {
            axiosInstance.get('/api/users/profile')
                .then(response => {
                    setUser(response.data);
                })
                .catch(error => {
                    console.error('Ошибка при получении профиля:', error.response?.status);
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        logout();
                    }
                });
        }
    }, [token, logout]);

    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await axiosInstance.post('/api/auth/register', { name, email, password });
            const receivedToken = response.data.token;
            localStorage.setItem('token', receivedToken);
            setToken(receivedToken);

            const profileResponse = await axiosInstance.get('/api/users/profile');
            setUser(profileResponse.data);

            toast.success('Регистрация прошла успешно!');
            navigate('/');
        } catch (error: any) {
            console.error('Ошибка при регистрации:', error.response?.data || error.message);
            const message = error.response?.data?.message || 'Не удалось зарегистрироваться';
            toast.error(message);
            throw new AuthError(message);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axiosInstance.post('/api/auth/login', { email, password });
            const receivedToken = response.data.token;
            localStorage.setItem('token', receivedToken);
            setToken(receivedToken);

            const profileResponse = await axiosInstance.get('/api/users/profile');
            setUser(profileResponse.data);

            toast.success('Вы успешно вошли в систему!');
            navigate('/');
        } catch (error: any) {
            console.error('Ошибка при логине:', error.response?.data || error.message);
            const message = error.response?.data?.message || 'Не удалось войти';
            toast.error(message);
            throw new AuthError(message);
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
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
