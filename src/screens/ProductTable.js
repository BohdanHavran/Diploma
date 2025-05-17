import React, { useState, useEffect } from 'react';
import useFetch from '../hooks/useFetchProduct';

const ProductTable = () => {
    const [data, setData] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
    const [editProduct, setEditProduct] = useState(null);
    const [fetchData] = useFetch();

    useEffect(() => {
        setData(fetchData || []); // Завантаження даних товарів
    }, [fetchData]);

    const handleAddProduct = () => {
        if (newProduct.name && newProduct.price) {
            setData([...data, { ...newProduct, id: Date.now() }]);
            setNewProduct({ name: '', price: '', description: '' });
        }
    };

    const handleEditProduct = (id) => {
        const updatedData = data.map((product) =>
            product.id === id ? { ...product, ...editProduct } : product
        );
        setData(updatedData);
        setEditProduct(null);
    };

    const handleDeleteProduct = (id) => {
        const updatedData = data.filter((product) => product.id !== id);
        setData(updatedData);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Manage Products</h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="input"
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="input"
                />
                <button onClick={handleAddProduct} className="btn btn-primary">Add Product</button>
            </div>
            <table className="w-auto border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">Name</th>
                        <th className="border border-gray-300 px-4 py-2">Price</th>
                        <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((product) => (
                        <tr key={product.id}>
                            <td className="border border-gray-300 px-4 py-2">
                                {editProduct && editProduct.id === product.id ? (
                                    <input
                                        type="text"
                                        value={editProduct.name}
                                        onChange={(e) =>
                                            setEditProduct({ ...editProduct, name: e.target.value })
                                        }
                                        className="input"
                                    />
                                ) : (
                                    product.name
                                )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                {editProduct && editProduct.id === product.id ? (
                                    <input
                                        type="number"
                                        value={editProduct.price}
                                        onChange={(e) =>
                                            setEditProduct({ ...editProduct, price: e.target.value })
                                        }
                                        className="input"
                                    />
                                ) : (
                                    `${product.price} ₴`
                                )}
                            </td>
                            <td className="border border-gray-300 px-auto py-2">
                                {editProduct && editProduct.id === product.id ? (
                                    <button
                                        onClick={() => handleEditProduct(product.id)}
                                        className="btn-primary mx-2 px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setEditProduct(product)}
                                        className="btn-primary mx-2 px-4 py-2 rounded-full"
                                    >
                                        Edit
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="btn-primary mx-2 px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
