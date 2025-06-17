import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthProvider';

export const OrderContext = createContext();

const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const fetchOrders = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const userId = user.id;
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/order?user_id=${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setOrders(data);
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

    const clearCart = async (userId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/clear`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ user_id: userId }),
            });
            if (response.ok) {
                setOrders([]); // Clear client-side state
                fetchOrders(); // Sync with backend
            } else {
                console.error("Failed to clear cart.");
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const handleCart = async (product) => {
        if (!user) {
            window.location.href = '/signin';
            return;
        }
        try {
            const userId = user.id;
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: product.id,
                }),
            });
            if (response.ok) {
                await fetchOrders();
            } else {
                console.error("Failed to add product to cart.");
            }
        } catch (error) {
            console.error("Error adding product to cart:", error);
        }
    };

    const removeProduct = async (orderId) => {
        if (!user) {
            window.location.href = '/signin';
            return;
        }
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
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
        clearCart,
        totalAmount,
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export default OrderProvider;