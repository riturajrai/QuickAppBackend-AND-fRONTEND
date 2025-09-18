import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCartItems, clearCartError } from '../slices/cartSlice';

function Navbar() {
  const dispatch = useDispatch();
  const { items: cartItems, status, error } = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((total, item) => total + (item.productId ? item.quantity : 0), 0);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCartItems());
    }
  }, [status, dispatch]);

  const handleClearError = () => {
    dispatch(clearCartError());
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">E-Shop</Link>
        <div className="space-x-4 flex items-center">
          <Link to="/" className="text-white hover:text-gray-200">Products</Link>
          <div className="relative">
            <Link to="/cart" className="text-white hover:text-gray-200">Cart</Link>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <Link to="/orders" className="text-white hover:text-gray-200">Orders</Link>
        </div>
      </div>
      {error && (
        <div className="container mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-2 mt-2 rounded flex justify-between items-center">
          <p>{error}</p>
          <button
            onClick={handleClearError}
            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;