import React, { useState, useEffect } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { BsArrowLeft, BsCart2 } from 'react-icons/bs';
import Rating from 'react-rating';
import Fade from 'react-reveal/Fade';
import { Link, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import useFetch from '../hooks/useFetchProduct';
import useAuth from '../hooks/useAuth';
import useOrder from '../hooks/useOrder';

const ProductDetailScreen = () => {
    const { user } = useAuth();
    const [disabled, setDisabled] = useState(false);
    const { name } = useParams(); // Замінили title на name
    const [data] = useFetch();
    const { handleCart, orders } = useOrder();
    const [datae, setData] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
    const [editProduct, setEditProduct] = useState(null);
    const [fetchData] = useFetch();

    useEffect(() => {
        setData(fetchData || []); // Завантаження даних товарів
    }, [fetchData]);

    const handleAddProduct = () => {
        if (newProduct.name && newProduct.price) {
            setData([...datae, { ...newProduct, id: Date.now() }]);
            setNewProduct({ name: '', price: '', description: '' });
        }
    };

    const handleEditProduct = (id) => {
        const updatedData = datae.map((product) =>
            product.id === id ? { ...product, ...editProduct } : product
        );
        setData(updatedData);
        setEditProduct(null);
    };

    const handleDeleteProduct = (id) => {
        const updatedData = datae.filter((product) => product.id !== id);
        setData(updatedData);
    };

    return (
        <section className="max-w-screen-xl py-24 mx-auto px-6  overflow-y-hidden">
            <div className="flex flex-col justify-center items-center">
                {data.filter(item => item.name === name).map(product => ( // Замінили title на name
                    <div key={product.id_products} className="p-6 box-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
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
                                    {user.status > 0 && (
                                        <>
                                            {editProduct && editProduct.id === product.id_products  ? (
                                                <button
                                                    onClick={() => handleEditProduct(product.id_products )}
                                                    className="w-24 btn-primary py-3 px-2 poppins text-sm bg-green-500 text-white hover:bg-green-600"
                                                >
                                                    Save
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setEditProduct(product.id_products )}
                                                    className="w-24 btn-primary mx-0 py-3 px-2 poppins text-sm"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteProduct(product.id_products )}
                                                className="w-24 btn-primary py-3 px-2 poppins text-sm bg-red-500 text-white hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}      
                                </div>
                            </Fade>
                        </div>
                        <Link to="/products" className="pt-4 text-blue-500 text-sm hover:underline flex items-center space-x-3"><BsArrowLeft /> <span>Back</span></Link>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default ProductDetailScreen;
