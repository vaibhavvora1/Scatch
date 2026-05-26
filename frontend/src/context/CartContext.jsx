import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [cart, setCart]       = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) { setCart([]); return; }
    try {
      const { data } = await cartAPI.get();
      setCart(data.cart || []);
    } catch { setCart([]); }
  }, [isLoggedIn]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId) => {
    try {
      const { data } = await cartAPI.add(productId);
      setCart(data.cart || []);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  const updateItem = async (itemId, action) => {
    try {
      const { data } = await cartAPI.update(itemId, action);
      setCart(data.cart || []);
    } catch {}
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await cartAPI.remove(itemId);
      setCart(data.cart || []);
    } catch {}
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart([]);
    } catch {}
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const cartTotal = cart.reduce((sum, item) => {
    if (!item.product) return sum;
    const price = item.product.price - (item.product.price * (item.product.discount || 0)) / 100;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, loading, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
