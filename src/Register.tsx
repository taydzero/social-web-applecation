// src/components/Register.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from './contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

interface RegisterFormInputs {
    name: string;
    email: string;
    password: string;
}

const schema = yup.object().shape({
    name: yup.string().required('Имя обязательно'),
    email: yup.string().email('Неверный формат email').required('Email обязателен'),
    password: yup.string().min(6, 'Минимум 6 символов').required('Пароль обязателен'),
});

const Register: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
        resolver: yupResolver(schema),
    });
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [serverErrors, setServerErrors] = useState<string[]>([]);

    const onSubmit = async (data: RegisterFormInputs) => {
        try {
            await registerUser(data.name, data.email, data.password);
            navigate('/');
        } catch (error: any) {
            console.error('Ошибка регистрации', error);
            // Обработка ошибок
            if (error.errors) {
                setServerErrors(error.errors.map((err: any) => err.msg));
            } else {
                setServerErrors(['Не удалось выполнить регистрацию. Попробуйте позже.']);
            }
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-2xl mb-4">Регистрация</h2>
            {serverErrors.length > 0 && (
                <div className="mb-4">
                    {serverErrors.map((err, index) => (
                        <p key={index} className="text-red-500">{err}</p>
                    ))}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label className="block mb-1">Имя</label>
                    <input {...register('name')} className="w-full p-2 border rounded" />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>
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
                <button type="submit" className="w-full bg-green-500 text-black dark:text-blue-500 p-2 rounded">
                    Зарегистрироваться
                </button>
            </form>
            <Link to="/Login"><span className="pl-2">Войти</span></Link>
        </div>
    );
};

export default Register;
