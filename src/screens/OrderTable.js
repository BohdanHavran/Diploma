import React, { useState, useEffect } from 'react';
import swal from 'sweetalert';

const OrderTable = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Отримання всіх оформлених замовлень
    const fetchOrders = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/checks`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                swal("Помилка", "Не вдалося отримати список замовлень", "error");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            swal("Помилка", "Сталася помилка при завантаженні замовлень", "error");
        } finally {
            setLoading(false);
        }
    };

    // Підтвердження замовлення
    const confirmOrder = async (orderId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/checks/${orderId}/confirm`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                swal("Успішно!", "Замовлення підтверджено.", "success");
                fetchOrders(); // Оновлення списку
            } else {
                swal("Помилка", "Не вдалося підтвердити замовлення", "error");
            }
        } catch (error) {
            console.error("Error confirming order:", error);
            swal("Помилка", "Сталася помилка при підтвердженні замовлення", "error");
        }
    };

    // Видалення замовлення
    const deleteOrder = async (orderId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/checks/${orderId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                swal("Успішно!", "Замовлення видалено.", "success");
                fetchOrders(); // Оновлення списку
            } else {
                swal("Помилка", "Не вдалося видалити замовлення", "error");
            }
        } catch (error) {
            console.error("Error deleting order:", error);
            swal("Помилка", "Сталася помилка при видаленні замовлення", "error");
        }
    };

    // Редагування замовлення
    const editOrder = (order) => {
        setEditingOrder(order);
        setQuantity(order.quantity || 1); // Встановлюємо поточну кількість
    };

    const saveOrder = async () => {
        if (!editingOrder) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/checks/${editingOrder.id_check}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ quantity }),
            });

            if (response.ok) {
                swal("Успішно!", "Замовлення оновлено.", "success");
                setEditingOrder(null);
                fetchOrders(); // Оновлення списку
            } else {
                swal("Помилка", "Не вдалося оновити замовлення", "error");
            }
        } catch (error) {
            console.error("Error updating order:", error);
            swal("Помилка", "Сталася помилка при оновленні замовлення", "error");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="h-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">Оформлені замовлення</h2>
            {loading ? (
                <p>Завантаження замовлень...</p>
            ) : (
                <>
                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">ID Замовлення</th>
                                <th className="border border-gray-300 px-4 py-2">Користувач</th>
                                <th className="border border-gray-300 px-4 py-2">Товар</th>
                                <th className="border border-gray-300 px-4 py-2">Ціна</th>
                                <th className="border border-gray-300 px-4 py-2">Кількість</th>
                                <th className="border border-gray-300 px-4 py-2">Дата</th>
                                <th className="border border-gray-300 px-4 py-2">Статус</th>
                                <th className="border border-gray-300 px-4 py-2">Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="border border-gray-300 px-4 py-2 text-center">
                                    Немає оформлених замовлень
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id_check} className="text-center">
                                    <td className="border border-gray-300 px-4 py-2">{order.id_check}</td>
                                    <td className="border border-gray-300 px-4 py-2">{order.user_name}</td>
                                    <td className="border border-gray-300 px-4 py-2">{order.product_names.join(', ')}</td>
                                    <td className="border border-gray-300 px-4 py-2">{order.order_price}</td>
                                    <td className="border border-gray-300 px-4 py-2">{order.quantity || 1}</td>
                                    <td className="border border-gray-300 px-4 py-2">{order.order_date}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {order.is_confirmed ? "Підтверджено" : "Очікує"}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {!order.is_confirmed && (
                                            <button
                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                onClick={() => confirmOrder(order.id_check)}
                                            >
                                                Підтвердити
                                            </button>
                                        )}
                                        <button
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2"
                                            onClick={() => editOrder(order)}
                                        >
                                            Редагувати
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
                                            onClick={() => deleteOrder(order.id_check)}
                                        >
                                            Видалити
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    {editingOrder && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-lg font-bold mb-4">Редагувати замовлення #{editingOrder.id_check}</h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Кількість:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        className="mt-1 p-2 border border-gray-300 rounded w-full"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                        onClick={() => setEditingOrder(null)}
                                    >
                                        Скасувати
                                    </button>
                                    <button
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                        onClick={saveOrder}
                                    >
                                        Зберегти
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrderTable;