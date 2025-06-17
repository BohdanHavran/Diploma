import React, { useState } from 'react';
import ProductTable from './ProductsScreenAdmin';
import UserTable from './UserTable';
import ReviewTable from './ReviewTable';
import OrderTable from './OrderTable'; // Підключили новий компонент

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('products');

    return (
        <section className="max-w-screen-xl py-24 mx-auto px-6">
            <div className="flex justify-center space-x-4">
                <button 
                    className={`btn ${activeTab === 'products' ? 'w-24 btn-primary mx-0 py-3 px-2 poppins text-sm' : 'w-24 btn-secondary mx-0 py-3 px-2 poppins text-sm'}`} 
                    onClick={() => setActiveTab('products')}
                >
                    Products
                </button>
                <button 
                    className={`btn ${activeTab === 'users' ? 'w-24 btn-primary mx-0 py-3 px-2 poppins text-sm' : 'w-24 btn-secondary mx-0 py-3 px-2 poppins text-sm'}`} 
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button 
                    className={`btn ${activeTab === 'orders' ? 'w-24 btn-primary mx-0 py-3 px-2 poppins text-sm' : 'w-24 btn-secondary mx-0 py-3 px-2 poppins text-sm'}`} 
                    onClick={() => setActiveTab('orders')}
                >
                    Orders
                </button>
                <button 
                    className={`btn ${activeTab === 'reviews' ? 'w-24 btn-primary mx-0 py-3 px-2 poppins text-sm' : 'w-24 btn-secondary mx-0 py-3 px-2 poppins text-sm'}`} 
                    onClick={() => setActiveTab('reviews')}
                >
                    Reviews
                </button>
            </div>
            {activeTab === 'products' && <ProductTable />}
            {activeTab === 'users' && <UserTable />}
            {activeTab === 'orders' && <OrderTable />}
            {activeTab === 'reviews' && <ReviewTable />}
        </section>
    );
};

export default AdminPanel;
