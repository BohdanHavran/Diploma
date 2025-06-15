import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthProvider'; // Імпортуємо AuthContext

export const OrderContext = createContext();

const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext); // Отримуємо користувача з AuthContext

    // Функція для отримання замовлень
    const fetchOrders = async () => {
        if (!user) {
            setLoading(false); // Якщо користувач не залогінений, зупиняємо завантаження
            return;
        }

        try {
            const userId = user.id; // Використовуємо user.id з AuthContext
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders?user_id=${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Додаємо токен для авторизації
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setOrders(data); // Зберігаємо тільки якщо дані є масивом
                } else {
                    console.error("Invalid data format:", data);
                }
            } else {
                console.error("Failed to fetch orders.");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // Виклик fetchOrders при зміні користувача
    useEffect(() => {
        fetchOrders();
    }, [user]); // Залежність від user, щоб оновлювати при вході/виході

    // Додавання продукту в корзину
    const handleCart = async (product) => {
        if (!user) {
            window.location.href = '/signin'; // Перенаправлення на сторінку входу, якщо не залогінений
            return;
        }

        try {
            const userId = user.id; // Використовуємо user.id з AuthContext
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Додаємо токен
                },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: product.id,
                }),
            });
            if (response.ok) {
                await fetchOrders(); // Оновлення списку замовлень
            } else {
                console.error("Failed to add product to cart.");
            }
        } catch (error) {
            console.error("Error adding product to cart:", error);
        }
    };

    // Видалення продукту з корзини
    const removeProduct = async (orderId) => {
        if (!user) {
            window.location.href = '/signin'; // Перенаправлення на сторінку входу
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Додаємо токен
                },
            });
            if (response.ok) {
                setOrders((prevOrders) => prevOrders.filter((order) => order.id_order !== orderId));
                window.location.href = '/orders';
            } else {
                console.error("Failed to remove product from cart.");
            }
        } catch (error) {
            console.error("Error removing product from cart:", error);
        }
    };

    const totalAmount = orders.reduce((sum, order) => sum + order.product_price, 0);

    const value = {
        orders,
        loading,
        handleCart,
        removeProduct,
        totalAmount,
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export default OrderProvider;