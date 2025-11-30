'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';

interface CartContextType {
    cart: Product[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    isCheckoutOpen: boolean;
    setIsCheckoutOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Product[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('huehouse_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart from localStorage', e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('huehouse_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product) => {
        setCart((prev) => [...prev, product]);
        setIsCheckoutOpen(true); // Optional: Open checkout or show toast
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => {
            const index = prev.findIndex((p) => p.id === productId);
            if (index > -1) {
                const newCart = [...prev];
                newCart.splice(index, 1);
                return newCart;
            }
            return prev;
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                clearCart,
                isCheckoutOpen,
                setIsCheckoutOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
