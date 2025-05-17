import React, { useState, useEffect, createContext, useCallback } from 'react';
import swal from 'sweetalert';
// Створення контексту автентифікації
export const ProductContext = createContext();

const ProductProvider = ({ children }) => {

    const addProduct = async (name, short_description, description, price, count, image) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, short_description, description, price, count, image })
            });
            
            const data = await response.json();
    
            if (response.ok) {
                console.log("Add product successfully");
                swal("Product", "Add product successfully", "success").then((result) => {
                    window.location.href = '/admin_panel';
                });
            } 
            else {
                swal("Product", "Failed add product successfully", "error");
                console.log("Failed add produc:", data);
            }
        } catch (error) {
            console.error("Error add product:", error);
        }
    };

    const deleteProduct = async (id) => {
        try {
            // API-запит на видалення продукту за ID
            await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/del/${id}`, { method: 'DELETE' });
            swal("Success", "Product deleted successfully", "success").then((result) => {
                window.location.href = '/admin_panel';
            });
        } catch (error) {
            swal("Error", "Failed to delete product", "error");
        }
    };

    const updateProduct = async (id, name, short_description, description, price, count, image) => {
        try {
            // API-запит на оновлення продукту
            await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/update/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, short_description, description, price, count, image }),
            });
            swal("Success", "Product updated successfully", "success").then((result) => {
                window.location.href = '/admin_panel';
            });
        } catch (error) {
            swal("Error", "Failed to update product", "error");
        }
    };

    const value = {
        addProduct,
        deleteProduct,
        updateProduct,
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductProvider;
