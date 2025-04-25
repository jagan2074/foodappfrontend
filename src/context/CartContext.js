// src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const calculateTotal = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

const calculateItemCount = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + item.quantity, 0);
};

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('foodAppCartItems');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Error reading cart from localStorage", error);
            return [];
        }
    });
    const [totalPrice, setTotalPrice] = useState(0);
    const [itemCount, setItemCount] = useState(0);

    useEffect(() => {
        try {
            localStorage.setItem('foodAppCartItems', JSON.stringify(cartItems));
            const newCount = calculateItemCount(cartItems);
            const newTotal = calculateTotal(cartItems);
            setItemCount(newCount);
            setTotalPrice(newTotal);
            console.log("CartContext: Cart updated", { cartItems, itemCount: newCount, totalPrice: newTotal });
        } catch (error) {
            console.error("Error saving cart to localStorage", error);
        }
    }, [cartItems]);

    const addItemToCart = (itemToAdd) => {
        // Add more robust check for item structure
        if (!itemToAdd || !itemToAdd._id || itemToAdd.price === undefined || !itemToAdd.name || !itemToAdd.restaurant) {
            console.error("CartContext: Invalid item data provided to addItemToCart", itemToAdd);
            // Optionally throw an error or show a user message
            return;
        }

        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item._id === itemToAdd._id);

            if (existingItemIndex > -1) {
                // Item exists: Increase quantity
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + 1
                };
                console.log(`CartContext: Increased quantity for ${itemToAdd.name}`);
                return updatedItems;
            } else {
                // Item doesn't exist: Add it
                console.log(`CartContext: Added new item ${itemToAdd.name}`);
                const newItem = {
                    _id: itemToAdd._id,
                    name: itemToAdd.name,
                    price: itemToAdd.price,
                    // --- MODIFICATION: Ensure restaurant ID is stored ---
                    restaurant: itemToAdd.restaurant, // Store the restaurant ObjectId
                    // --- END MODIFICATION ---
                    quantity: 1
                };
                return [...prevItems, newItem];
            }
        });
    };

    const removeItemFromCart = (itemIdToRemove) => {
        setCartItems(prevItems => {
            console.log(`CartContext: Removing item ${itemIdToRemove}`);
            return prevItems.filter(item => item._id !== itemIdToRemove);
        });
    };

    const updateItemQuantity = (itemIdToUpdate, newQuantity) => {
        const quantity = Math.max(0, parseInt(newQuantity, 10) || 0);
        setCartItems(prevItems => {
            if (quantity === 0) {
                console.log(`CartContext: Removing item ${itemIdToUpdate} due to quantity 0`);
                return prevItems.filter(item => item._id !== itemIdToUpdate);
            }
            return prevItems.map(item =>
                item._id === itemIdToUpdate
                    ? { ...item, quantity: quantity }
                    : item
            );
        });
        console.log(`CartContext: Updated quantity for ${itemIdToUpdate} to ${quantity}`);
    };

    const clearCart = () => {
        console.log("CartContext: Clearing cart");
        setCartItems([]);
    };

    const value = {
        cartItems,
        itemCount,
        totalPrice,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};