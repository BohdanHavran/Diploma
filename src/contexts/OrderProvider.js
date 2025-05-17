import React, { createContext, useState, useEffect } from 'react';

export const OrderContext = createContext();

const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Функція для отримання замовлень
    const fetchOrders = async () => {
        try {
            const userId = 1; // Замінити на динамічний user id
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders?user_id=${userId}`);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setOrders(data); // зберігаємо тільки якщо дані є масивом
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

    // Виклик fetchOrders при завантаженні компонента
    useEffect(() => {
        fetchOrders();
    }, []);

    // Додавання продукту в корзину
    const handleCart = async (product) => {
        try {
            const userId = 1; // Замінити на динамічний user id
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: product.id,
                }),
            });
            if (response.ok) {
                // Виклик fetchOrders для оновлення списку замовлень
                await fetchOrders();
            } else {
                console.error("Failed to add product to cart.");
            }
        } catch (error) {
            console.error("Error adding product to cart:", error);
        }
    };

    // Видалення продукту з корзини
    const removeProduct = async (orderId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Фільтрація видаленого продукту з локального стану
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
        totalAmount, // Загальна сума
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export default OrderProvider;
