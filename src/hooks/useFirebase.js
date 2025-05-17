import { useEffect, useState } from 'react';

// Замість Firebase ви можете реалізувати власні методи автентифікації тут
const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Логіка для перевірки стану автентифікації
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const signUpUser = async (email, password, name, image) => {
        // Ваша логіка реєстрації
        // Після успішної реєстрації збережіть користувача в localStorage
        const newUser = { displayName: name, photoURL: image }; // Сформуйте об'єкт користувача
        localStorage.setItem('user', JSON.stringify(newUser)); // Зберігайте в localStorage
        setUser(newUser);
    };

    const signInUser = async (email, password) => {
        // Ваша логіка входу
        // Після успішного входу збережіть користувача в localStorage
    };

    const signOutUser = async () => {
        // Ваша логіка виходу
        localStorage.removeItem('user'); // Видалення користувача з localStorage
        setUser(null);
    };

    return {
        user,
        signUpUser,
        signInUser,
        signOutUser,
        isLoading,
    };
};

export default useAuth;
