import React, { useState, useEffect } from 'react'
import Brand from '../Brand'
import Button from '../Form/Button'
import TextField from '../Form/TextField'
import swal from 'sweetalert';
import useProduct from '../../hooks/useProduct'
import { useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill'; // імпорт редактора
import 'react-quill/dist/quill.snow.css';

const AddProduct = () => {
    const location = useLocation();

    const { addProduct, updateProduct } = useProduct();

    const productToEdit = location.state?.productToEdit;

    const [productInput, setProductInput] = useState({
        image: null,
        name: '',
        short_description: '',
        description: '',
        price: '',
        count: '',
    });
    
    useEffect(() => {
        if (productToEdit) {
            setProductInput({
                name: productToEdit.name,
                short_description: productToEdit.short_description,
                description: productToEdit.description,
                price: productToEdit.price,
                count: productToEdit.count,
                image: productToEdit.images, // Зображення потрібно оновлювати окремо
            });
        }
    }, [productToEdit]);

    const Inputs = [
        { id: 1, type: "text", placeholder: "Name", value: productInput.name, name: 'name' },
        { id: 2, type: "text", placeholder: "Short description", value: productInput.short_description, name: 'short_description' },
        { id: 3, type: "text", placeholder: "Description", value: productInput.description, name: 'description' },
        { id: 4, type: "number", placeholder: "Price", value: productInput.price, name: 'price' },
        { id: 5, type: "number", placeholder: "Count", value: productInput.count, name: 'count' }
    ];

    const handleChange = (e) => {
        const { value, name } = e.target;
        setProductInput(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditorChange = (value) => {
        setProductInput((prev) => ({
            ...prev,
            description: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        const allowedExtensions = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (file && !allowedExtensions.includes(file.type)) {
            swal("Error", "Only image files (JPEG, PNG, GIF, WEBP) are allowed.", "error");
            return;
        }

        setProductInput(prev => ({
            ...prev,
            image: file
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!productInput.name || !productInput.short_description || !productInput.description || !productInput.price || !productInput.count) {
            swal("Error", "Please fill in all fields.", "error");
            return;
        }
    
        if (productInput.image) {
            const reader = new FileReader();
            reader.onload = async () => {
                const image = reader.result.split(',')[1];
                console.log('Image loaded successfully', image);
    
                if (productToEdit) {
                    console.log('Updating product...');
                    await updateProduct(
                        productToEdit.id,
                        productInput.name,
                        productInput.short_description,
                        productInput.description,
                        productInput.price,
                        productInput.count,
                        image
                    );
                } else {
                    console.log('Adding product...');
                    await addProduct(
                        productInput.name,
                        productInput.short_description,
                        productInput.description,
                        productInput.price,
                        productInput.count,
                        image
                    );
                }
            };
            reader.onerror = () => {
                swal("Error", "Failed to read the image file.", "error");
            };
            reader.readAsDataURL(productInput.image);
        } else {
            if (productToEdit) {
                console.log('Updating product without new image...');
                await updateProduct(
                    productToEdit.id,
                    productInput.name,
                    productInput.short_description,
                    productInput.description,
                    productInput.price,
                    productInput.count,
                    productInput.image
                );
            }
        }
    };

    return (
        <main className="h-full max-w-screen-xl mx-auto my-20 banner">
            <div className="grid gap-10">
                {/* Форма */}
                <div className="flex flex-col justify-center items-center h-full">
                    {/* Логотип */}
                    <Brand />
                    {/* Форма додавання продукту */}
                    <form className="bg-white w-96 mt-6 p-4 rounded-lg shadow-lg" onSubmit={handleSubmit}>
                        <div className="flex flex-col space-y-6">
                            {Inputs.map(input => (
                                input.name === 'description' ? (
                                    // Використовуємо ReactQuill тільки для поля "description"
                                    <ReactQuill
                                        value={input.value}
                                        onChange={handleEditorChange}
                                        placeholder={input.placeholder}
                                        className="mt-2 w-full rounded-md"
                                    />
                                ) : (
                                    // Для інших полів використовуємо TextField
                                    <TextField
                                        type={input.type}
                                        placeholder={input.placeholder}
                                        value={input.value}
                                        name={input.name}
                                        onChange={handleChange}
                                    />
                                )
                            ))}
                            {/* Поле для вибору файлу */}
                            <div>
                                <label className="block text-sm font-medium poppins text-gray-800">Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="btn-primary poppins mt-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                {/* Відображення вибраного файлу */}
                                {productInput.image && typeof productInput.image === "object" ? (
                                    <div className="mt-2">
                                        <img
                                            src={URL.createObjectURL(productInput.image)}
                                            alt="Selected file preview"
                                            className="w-full h-40 object-cover rounded-md"
                                        />
                                    </div>
                                ) : productToEdit?.image ? (
                                    <div className="mt-2">
                                        <img
                                            src={`${process.env.REACT_APP_API_BASE_URL}/${productToEdit.image}`}
                                            alt="Selected file preview"
                                            className="w-full h-40 object-cover rounded-md"
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <Button text={productToEdit ? "Update" : "Add"} />
                    </form>
                </div>
            </div>
        </main>
    );
};

export default AddProduct;
