import React, { useEffect, useState } from 'react';
import swal from 'sweetalert';

const ReviewTable = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch reviews from the backend
    const fetchReviews = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/get_reviews`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            } else {
                swal("Помилка", "Не вдалося отримати список відгуків", "error");
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            swal("Помилка", "Сталася помилка при завантаженні відгуків", "error");
        } finally {
            setLoading(false);
        }
    };

    // Approve review
    const approveReview = async (reviewId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/${reviewId}/approve`, {
                method: 'PUT',
            });

            if (response.ok) {
                swal("Успішно!", "Відгук підтверджено.", "success");
                fetchReviews(); // Refresh reviews list
            } else {
                swal("Помилка", "Не вдалося підтвердити відгук", "error");
            }
        } catch (error) {
            console.error("Error approving review:", error);
            swal("Помилка", "Сталася помилка при підтвердженні відгуку", "error");
        }
    };

    // Delete review
    const deleteReview = async (reviewId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/${reviewId}/delete`, {
                method: 'DELETE',
            });

            if (response.ok) {
                swal("Успішно!", "Відгук видалено.", "success");
                fetchReviews(); // Refresh reviews list
            } else {
                swal("Помилка", "Не вдалося видалити відгук", "error");
            }
        } catch (error) {
            console.error("Error deleting review:", error);
            swal("Помилка", "Сталася помилка при видаленні відгуку", "error");
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    return (
        <div className="h-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">Відгуки</h2>
            {loading ? (
                <p>Завантаження відгуків...</p>
            ) : (
                <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2">ID</th>
                            <th className="border border-gray-300 px-4 py-2">Користувач</th>
                            <th className="border border-gray-300 px-4 py-2">Товар</th>
                            <th className="border border-gray-300 px-4 py-2">Рейтинг</th>
                            <th className="border border-gray-300 px-4 py-2">Відгук</th>
                            <th className="border border-gray-300 px-4 py-2">Статус</th>
                            <th className="border border-gray-300 px-4 py-2">Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review.id} className="text-center">
                                <td className="border border-gray-300 px-4 py-2">{review.id}</td>
                                <td className="border border-gray-300 px-4 py-2">{review.user_name}</td>
                                <td className="border border-gray-300 px-4 py-2">{review.product_name}</td>
                                <td className="border border-gray-300 px-4 py-2">{review.rating}</td>
                                <td className="border border-gray-300 px-4 py-2" dangerouslySetInnerHTML={{ __html: review.review }}></td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {review.is_approved ? "Підтверджено" : "Очікує"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {!review.is_approved && (
                                        <button
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                            onClick={() => approveReview(review.id)}
                                        >
                                            Підтвердити
                                        </button>
                                    )}
                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
                                        onClick={() => deleteReview(review.id)}
                                    >
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ReviewTable;
