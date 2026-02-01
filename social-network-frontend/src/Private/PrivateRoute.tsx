import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    children: JSX.Element;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
    const { user, isChecking } = useAuth();

    const TEST_MODE = true; // <- временно разрешаем заходить без токена

    if (isChecking) return <div>Проверка авторизации...</div>;

    if (!user && !TEST_MODE) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;
