import React, { useState, useEffect } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { BsCart2 } from 'react-icons/bs';
import Rating from 'react-rating';
import { useHistory } from 'react-router-dom';
import swal from 'sweetalert';
import useAuth from '../../hooks/useAuth';
import useOrder from '../../hooks/useOrder';
import Button from '../Form/Button';
import useFetch from '../../hooks/useFetchProduct';
import useProduct from '../../hooks/useProduct';

const Product = (props) => {
    const [disabled, setDisabled] = useState(false);
    const { id, name, image, short_description, price, count, rating } = props;
    const history = useHistory();
    const { handleCart, orders } = useOrder();
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
    const [editProduct, setEditProduct] = useState(null);
    const [fetchData] = useFetch();

    const { deleteProduct } = useProduct();

    useEffect(() => {
        setData(fetchData || []); // Завантаження даних товарів
    }, [fetchData]);

    return (
        <div className="flex flex-col justify-center items-center space-y-3 bg-white border border-gray-200 hover:shadow-xl transition duration-700 ease-in-out transform hover:scale-105 p-4 box-border rounded-xl">
            <img className="w-full h-72" src={`${process.env.REACT_APP_API_BASE_URL}/${image}`} alt={name} />
            <h1 className="text-gray-600 poppins text-lg text-center">{name}</h1>
            <p className="text-gray-500 text-center flex-grow">{short_description.slice(0, 70)}</p>

            { /* price  */ }
            <h2 className="text-gray-900 text-center font-bold poppins text-3xl">{price} ₴</h2>
            <h2 className="text-gray-900 text-center font-bold poppins text-1xl">Count: {count}</h2>
            { /* rating  */ }
            <div className="flex items-center space-x-2">
                <Rating
                    emptySymbol={<AiOutlineStar className="text-gray-600 text-xl" />}
                    fullSymbol={<AiFillStar className="text-yellow-400 text-xl" />}
                    initialRating={`${rating}`}
                    readonly
                />
            </div>

            { /* buttons */ }
            <div className="flex items-center space-x-3">
                <Button className="w-36 btn-primary py-3 px-2 poppins text-sm" text="View" onClick={() => history.push(`/productsadmin/${name}`)} />
                {user.status > 0 && (
                    <>
                        <button
                            onClick={() => history.push('/edit-product', { productToEdit: props })}
                            className="w-24 btn-primary py-3 px-2 poppins text-sm"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => deleteProduct(id)}
                            className="w-24 btn-primary py-3 px-2 poppins text-sm bg-red-500 text-white hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </>
                )}                   
            </div>
        </div>
    )
}

export default Product;
