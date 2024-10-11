// src/components/ProtectedComponent.tsx
import React from 'react';

const ProtectedComponent: React.FC = () => {
    return (
        <div>
            <h1>Это защищённый маршрут</h1>
            <p>Только аутентифицированные пользователи могут видеть это.</p>
        </div>
    );
};

export default ProtectedComponent;
