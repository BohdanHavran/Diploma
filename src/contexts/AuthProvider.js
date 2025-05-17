import React, { useState, useEffect, createContext, useCallback } from 'react';
import swal from 'sweetalert';
// Створення контексту автентифікації
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Зберігаємо користувача
    const [isLoading, setIsLoading] = useState(true); // Стан завантаження

    // Ваші методи автентифікації
    const signUpUser = async (email, password, name, image) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name, image })
            });
            
            const data = await response.json();
    
            if (response.ok) {
                console.log("User registered successfully");
                await signInUser(email, password);
                swal("Register", "User registered successfully", "success").then((result) => {
                    window.location.href = '/signin';
                });
            } 
            else if (data.message === "User with this email already exists") {
                swal("Register", "User with this email already exists", "error");
                console.log("User with this email already exists:", data);
            } 
            else {
                swal("Register", "Failed to register user", "error");
                console.log("Failed to register user:", data);
            }
        } catch (error) {
            console.error("Error signing up:", error);
        }
    };

    const signInUser = async (email, password) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) throw new Error('Login failed');
            const data = await response.json();

            // Зберігаємо токени в локальному сховищі
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
            localStorage.setItem('user', JSON.stringify({ displayName: data.name, photoURL: data.image, status: data.status, id: data.id }));

            setUser({ email });
            swal("Login", "Success", "success").then((result) => {
                window.location.href = '/';
            });
        } catch (error) {
            swal("Login", "Invalid email or password", "error");
        }
    };

    const refreshToken = useCallback(async () => {
        try {
            const refresh_token = localStorage.getItem('refreshToken');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token }),
            });

            if (!response.ok) throw new Error('Failed to refresh token');

            const data = await response.json();
            localStorage.setItem('accessToken', data.access_token);

            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData) {
                setUser(userData);
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            signOutUser();
        }
    }, []);

    const signOutUser = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        window.location.href = '/signin';
    };
    // Інші функції автентифікації можна додати тут...

    useEffect(() => {
        const initAuth = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                try {
                    // Валідація токена
                    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/protected`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    if (!response.ok) throw new Error();

                    const userData = JSON.parse(localStorage.getItem('user'));
                    if (userData) {
                        setUser(userData);
                    }
                } catch (error) {
                    // Оновлення токена
                    console.error('Error parsing user data:', error);
                    await refreshToken();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [refreshToken]);

    const value = {
        user,
        signUpUser,
        signInUser,
        signOutUser,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
