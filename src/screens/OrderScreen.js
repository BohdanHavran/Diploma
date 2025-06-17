import React, { useState } from 'react';
import Bounce from 'react-reveal/Bounce';
import OrderCard from '../components/Order/OrderCard';
import useOrder from '../hooks/useOrder';
import useAuth from '../hooks/useAuth';
import swal from 'sweetalert';

const OrderScreen = () => {
    const { user } = useAuth();
    const { orders, clearCart } = useOrder(); // Changed to use clearCart instead of removeProduct
    const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

    const handleConfirmOrder = async () => {
        try {
            const userId = user.id;
            console.log('Orders before checkout:', orders);
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    user_id: userId,
                    order_details: orders.map(item => ({
                        id_order: item.order_id,
                        quantity: item.quantity || 1,
                        price: item.price
                    }))
                }),
            });

            if (response.ok) {
                const data = await response.json();
                clearCart(userId); // Clear cart on the client and sync with backend
                setIsOrderConfirmed(true); // Show success message
                swal("Успішно!", "Замовлення оформлено. Корзина очищена.", "success").then((result) => {
                    window.location.href = '/orders';
                });
                
            } else {
                swal("Помилка", "Не вдалося оформити замовлення", "error");
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            swal("Помилка", "Сталася помилка при оформленні замовлення", "error");
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
                                <OrderCard key={item.id_order} {...item} />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={handleConfirmOrder}
                            className="mt-5 px-4 py-2 bg-green-600 text-white rounded-md"
                            disabled={orders.length === 0}
                        >
                            Підтвердити замовлення
                        </button>
                    </div>
                </>
            )}
            {isOrderConfirmed}
        </section>
    );
};

export default OrderScreen;