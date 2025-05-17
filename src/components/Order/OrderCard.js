import React from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { MdDeleteOutline } from 'react-icons/md';
import Rating from 'react-rating';
import Bounce from 'react-reveal/Bounce';
import useOrder from '../../hooks/useOrder';

const OrderCard = (props) => {
    const { name, price, image, rating, order_id } = props;
    const { removeProduct } = useOrder();

    return (
        <Bounce left>
            <div className="flex space-x-5 bg-gray-50 rounded-xl p-4 transition transform hover:scale-105 hover:shadow-xl duration-700">
                {/* image  */}
                <div>
                    <img 
                        className="w-40" 
                        src={image ? `${process.env.REACT_APP_API_BASE_URL}/${image}` : `${process.env.REACT_APP_API_BASE_URL}/default-image.jpg`} 
                        alt={name} 
                    />
                </div>
                {/* details  */}
                <div className="flex flex-col justify-between flex-grow">
                    <h1 className="text-lg poppins text-gray-700">{name}</h1>
                    {/* price  */}
                    <h2 className="text-gray-900 font-bold poppins text-2xl">{price} ₴</h2>
                    {/* rating (optional) */}
                    <div className="flex items-center space-x-2">
                        {rating !== "Rating unavailable" ? (
                            <Rating
                                emptySymbol={<AiOutlineStar className="text-yellow-400 text-xl" />}
                                fullSymbol={<AiFillStar className="text-yellow-400 text-xl" />}
                                initialRating={rating}
                                readonly
                            />
                        ) : (
                            <span className="text-gray-600 text-xl">Rating unavailable</span>
                        )}
                    </div>
                </div>
                {/* delete  */}
                <div>
                    <MdDeleteOutline 
                        className="text-2xl text-gray-600 cursor-pointer" 
                        onClick={() => removeProduct(order_id)} 
                    />
                </div>
            </div>
        </Bounce>
    );
}

export default OrderCard;
