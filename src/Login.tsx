import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from './contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

interface LoginFormInputs {
    email: string;
    password: string;
}

const schema = yup.object().shape({
    email: yup.string().email('Неверный формат email').required('Email обязателен'),
    password: yup.string().min(6, 'Минимум 6 символов').required('Пароль обязателен'),
});

const Login: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
        resolver: yupResolver(schema),
    });
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: LoginFormInputs) => {
        try {
            await login(data.email, data.password);
            navigate('/');
        } catch (error: any) {
            console.error('Ошибка логина', error);
        }
    };
    

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-2xl mb-4">Вход</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label className="block mb-1">Email</label>
                    <input {...register('email')} className="w-full p-2 border rounded" />
                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Пароль</label>
                    <input type="password" {...register('password')} className="w-full p-2 border rounded" />
                    {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                    Войти
                </button>
            </form>
            <Link to="/Register"><span className="pl-2">Зарегистрироваться</span></Link>
        </div>
    );
};

export default Login;
