import React, { useState } from 'react';
import Bounce from 'react-reveal/Bounce';
import OrderCard from '../components/Order/OrderCard';
import useOrder from '../hooks/useOrder';
import useAuth from '../hooks/useAuth';

const OrderScreen = () => {
    const { user } = useAuth();
    const { orders, clearCart } = useOrder(); // Використовуємо ваш хук для отримання замовлень та очищення кошика
    const [receipt, setReceipt] = useState(null);

    // Функція для підтвердження замовлення
    const handleConfirmOrder = async () => {
        try {
            const userId = user.id  ; // Встановити динамічний user_id
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId }),
            });
    
            if (response.ok) {
                const data = await response.json();
                setReceipt(data.receipt);
                clearCart();
            } else {
                console.error('Failed to confirm order');
            }
        } catch (error) {
            console.error('Error confirming order:', error);
        }
    };

    return (
        <section className="h-screen max-w-screen-xl py-24 mx-auto px-6">
            {orders.length === 0 ? (
                <div className="h-screen">
                    <h1 className="text-5xl poppins text-center text-blue-600">No Order added!!!</h1>
                </div>
            ) : (
                <>
                    <div className="flex flex-col items-center space-x-2 pb-8">
                        <h1 className="text-gray-700 poppins text-3xl">All <span className="text-blue-600 font-semibold select-none">Orders</span></h1>
                        <div className="bg-blue-600 flex items-center justify-center w-16 h-1 mt-2 rounded-full"></div>
                    </div>
                    <div className="flex justify-center">
                        <div className="flex flex-col space-y-4">
                            {orders.map(item => (
                                <OrderCard key={item.id} {...item} />
                            ))}
                        </div>
                    </div>
                </>
            )}
            {orders.length > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={handleConfirmOrder}
                        className="mt-5 px-4 py-2 bg-green-600 text-white rounded-md"
                    >
                        Підтвердити замовлення
                    </button>
                </div>
            )}
            {receipt && (
                <div className="mt-5 bg-white p-4 border rounded-md">
                    <h2>Receipt</h2>
                    <ul>
                        {receipt.orderDetails.map((item, index) => (
                            <li key={index}>{item.name} - {item.price} x {item.quantity}</li>
                        ))}
                    </ul>
                    <h3>Total: {receipt.totalAmount}</h3>
                    <p>Date: {receipt.date}</p>
                </div>
            )}
        </section>
    );
}

export default OrderScreen
