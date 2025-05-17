import React, { useState } from 'react';
import Bounce from 'react-reveal/Bounce';
import Heading from '../components/Heading';
import Product from '../components/products/Product';
import useFetch from '../hooks/useFetchProduct';
import useAuth from '../hooks/useAuth';
import { useHistory } from 'react-router-dom';

const ProductsScreen = () => {
    const { user } = useAuth();
    const [data, loading, error] = useFetch();
    const [searchTerm, setSearchTerm] = useState(''); // Стан для пошуку
    const [sortOption, setSortOption] = useState(''); // Стан для сортування
    const [currentPage, setCurrentPage] = useState(1); // Стан для пагінації
    const itemsPerPage = 6; // Кількість товарів на сторінку
    const history = useHistory();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Фільтрувати товари за назвою
    const filteredProducts = data.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Сортування товарів
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        return 0;
    });

    // Пагінація: розділення товарів на сторінки
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

    // Обробка зміни сторінки
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <section className="max-w-screen-xl py-24 mx-auto px-6">
            {/* heading  */}
            <Heading title="Products" />
            <div className="flex justify-center mb-6 space-x-4">
                <input
                    type="text"
                    placeholder="Search by name..."
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Сортування */}
                <select
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="">Sort by...</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                </select>
            </div>
            {/* products  */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 py-6">
                {paginatedProducts.map(product => (
                    <Bounce left key={product.id_products}>
                        <Product {...product} />
                    </Bounce>
                ))}
            </div>
            {/* Пагінація */}
            <div className="flex justify-center items-center mt-6 space-x-4">
                <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className="text-lg font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </section>
    );
}

export default ProductsScreen;
