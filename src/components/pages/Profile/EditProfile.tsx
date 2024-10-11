// src/components/pages/Profile/EditProfile.tsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../../axiosConfig';
import { User, EditProfileFormInputs } from '../../../types/types';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FaUserCircle } from 'react-icons/fa';

const schema = yup.object({
    name: yup.string().optional(),
    email: yup.string().email('Неверный формат email').optional(),
    password: yup.string().min(6, 'Минимум 6 символов').optional(),
    bio: yup.string().optional(),
    avatar: yup
        .mixed<FileList>()
        .test('fileSize', 'Размер файла слишком большой', (value) => {
            if (!value || value.length === 0) return true; // Файл не выбран
            return value[0].size <= 2000000; // 2MB
        })
        .test('fileType', 'Неверный тип файла', (value) => {
            if (!value || value.length === 0) return true; // Файл не выбран
            return ['image/jpeg', 'image/png', 'image/gif'].includes(value[0].type);
        }),
}).required();


const EditProfile: React.FC = () => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<EditProfileFormInputs>({
        resolver: yupResolver(schema),
    });
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get('/api/users/profile');
                setUser(response.data);
                setValue('name', response.data.name);
                setValue('email', response.data.email);
                setValue('bio', response.data.bio || '');
            } catch (err: any) {
                setError('Не удалось загрузить профиль');
                toast.error('Не удалось загрузить профиль');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [setValue]);

    const onSubmit = async (data: EditProfileFormInputs) => {
        try {
            const formData = new FormData();
            if (data.name) formData.append('name', data.name);
            if (data.email) formData.append('email', data.email);
            if (data.password) formData.append('password', data.password);
            if (data.bio) formData.append('bio', data.bio);
            if (data.avatar && data.avatar.length > 0) formData.append('avatar', data.avatar[0]);

            await axiosInstance.put('/api/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Профиль обновлен успешно');
        } catch (err: any) {
            console.error('Ошибка при обновлении профиля:', err.response?.data);
            if (err.response?.data?.errors) {
                err.response.data.errors.forEach((err: any) => toast.error(err.msg));
            } else {
                toast.error('Не удалось обновить профиль');
            }
        }
    };

    if (loading) return <div className="text-center mt-10">Загрузка...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (!user) return null;

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
            <h1 className="text-2xl font-semibold mb-6">Редактировать профиль</h1>
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
                <div className="mb-4">
                    <label className="block mb-1">О себе</label>
                    <textarea {...register('bio')} className="w-full p-2 border rounded" />
                    {errors.bio && <p className="text-red-500">{errors.bio.message}</p>}
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Аватар</label>
                    <input type="file" {...register('avatar')} className="w-full p-2 border rounded" />
                    {errors.avatar && <p className="text-red-500">{errors.avatar.message}</p>}
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
                    Сохранить изменения
                </button>
            </form>
        </div>
    );
};

export default EditProfile;
