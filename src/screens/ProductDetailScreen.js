import React, { useState } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { BsArrowLeft, BsCart2 } from 'react-icons/bs';
import Rating from 'react-rating';
import Fade from 'react-reveal/Fade';
import { Link, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import useFetch from '../hooks/useFetchProduct';
import useOrder from '../hooks/useOrder';
import useAuth from '../hooks/useAuth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ProductDetailScreen = () => {
    const [disabled, setDisabled] = useState(false);
    const { name } = useParams();
    const [data] = useFetch();
    const { handleCart, orders } = useOrder();
    const { user } = useAuth();

    // Стан для відгуку та рейтингу
    const [rating, setRating] = useState(0); // Значення вибраного рейтингу
    const [review, setReview] = useState(''); // Текст відгуку

    // Функція для надсилання відгуку
    const handleSubmitReview = async (productId) => {
        if (!user.id) {
            swal("Помилка", "Користувач не авторизований!", "error");
            return;
        }
    
        if (rating === 0 || !review.trim()) {
            swal("Помилка", "Будь ласка, напишіть відгук та оберіть рейтинг!", "error");
            return;
        }
    
        try {
            // API-запит для надсилання відгуку
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productId,
                    user_id: user.id, // Передача user_id
                    rating: rating,
                    review: review,
                }),
            });
    
            if (response.ok) {
                swal("Дякуємо!", "Ваш відгук було успішно відправлено.", "success");
                setRating(0); // Скидаємо рейтинг
                setReview(''); // Скидаємо текст відгуку
            } else {
                swal("Помилка", "Не вдалося надіслати відгук. Спробуйте пізніше.", "error");
            }
        } catch (error) {
            swal("Помилка", "Сталася помилка при надсиланні відгуку.", "error");
            console.error(error);
        }
    };

    return (
        <section className="max-w-screen-xl py-24 mx-auto px-6  overflow-y-hidden">
            <div className="flex flex-col justify-center items-center">
                {data.filter(item => item.name === name).map(product => ( // Замінили title на name
                    <div key={product.id} className="p-6 box-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                        {/* image  */}
                        <div>
                            <Fade left>
                                <img className="w-full h-full mx-auto object-cover rounded-lg" src={`${process.env.REACT_APP_API_BASE_URL}/${product.image}`} alt="coverimg" />
                            </Fade>
                        </div>
                        {/* details  */}
                        <div className="flex flex-col justify-center h-full">
                            <Fade left>
                                <div className="border-b border-gray-400 pb-4">
                                    <h1 className="poppins text-gray-800 text-3xl">{product.name}</h1> {/* Замінили title на name */}
                                    {/* rating and reviews  */}
                                    <div className="flex items-center-space-x-3 mt-4">
                                        <Rating
                                            emptySymbol={<AiOutlineStar className="text-gray-600 text-xl" />}
                                            fullSymbol={<AiFillStar className="text-yellow-400 text-xl" />}
                                            initialRating={product.rating}
                                            readonly
                                        />
                                    </div>
                                    {/* description  */}
                                    <p className="text-gray-400 my-4" dangerouslySetInnerHTML={{ __html: product.description }}></p>
                                </div>
                                <div className="flex items-center justify-between py-6">
                                    <h2 className="text-3xl text-black font-bold poppins">{product.price} ₴</h2>
                                    <button 
                                        disabled={disabled} 
                                        className={`w-36 btn-primary py-3 px-4 poppins text-sm flex items-center space-x-3 text-center justify-center ${disabled ? "opacity-30" : ""}`} 
                                        onClick={() => {
                                            handleCart(product)
                                            setDisabled(true)
                                            swal("Wow!!!", "Your order has added to the cart", "success")
                                        }}
                                    >
                                        <BsCart2 />
                                        <span>{orders.filter(item => item.id === product.id) || disabled ? "Added" : "Add To Cart"}</span>
                                    </button>
                                </div>
                            </Fade>
                        </div>
                        
                    </div>
                ))}
            </div>
            <div className="border-b border-gray-400 pb-4">
                {data.filter(item => item.name === name).map(product => (
                    <div key={product.id}>
                        <h1 className="poppins text-gray-800 text-3xl">Залиште свій відгук</h1> {/* Замінили title на name */}
                        <ReactQuill
                            className="mt-2 my-2 w-full rounded-md"
                            value={review}
                            onChange={setReview} 
                        />
                        <p className="poppins text-gray-800 text-xl mt-4">Оцініть</p>
                        <div className="flex items-center justify-between py-2">
                            <Rating
                                emptySymbol={<AiOutlineStar className="text-gray-600 text-2xl cursor-pointer" />}
                                fullSymbol={<AiFillStar className="text-yellow-400 text-2xl cursor-pointer" />}
                                initialRating={rating}
                                onChange={setRating}
                            />
                            <button
                                className="w-24 btn-primary py-3 px-2 poppins text-sm bg-blue-500 text-white hover:bg-blue-600"
                                onClick={() => handleSubmitReview(product.id)}
                            >
                                Відправити
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <Link to="/products" className="pt-4 text-blue-500 text-sm hover:underline flex items-center space-x-3"><BsArrowLeft /> <span>Back</span></Link>
        </section>
    );
}

export default ProductDetailScreen;
