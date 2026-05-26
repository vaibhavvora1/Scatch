import { createContext, useContext, useState, useCallback } from 'react';
import { wishlistAPI } from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const { data } = await wishlistAPI.get();
      setWishlist(data.wishlist || []);
    } catch {}
  }, [isLoggedIn]);

  const toggle = async (productId) => {
    try {
      const { data } = await wishlistAPI.toggle(productId);
      setWishlist(data.wishlist || []);
      return data;
    } catch {}
  };

  const isWishlisted = (productId) =>
    wishlist.some((item) =>
      (typeof item === 'string' ? item : item._id?.toString()) === productId
    );

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
