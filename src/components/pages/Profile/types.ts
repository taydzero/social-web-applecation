// types.ts
export interface User {
    id: number;
    name: string;
    email: string; // Добавьте дополнительные поля, если нужно
    bio?: string;  // Например, биография пользователя
}