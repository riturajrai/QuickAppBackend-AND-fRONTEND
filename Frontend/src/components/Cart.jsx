import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCartItems, updateCartQuantity, removeFromCart, clearCartError } from '../slices/cartSlice';
import { createPaypalOrder, capturePaypalOrder } from '../slices/ordersSlice';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, status, error } = useSelector((state) => state.cart);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCartItems());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (cartItems.length > 0 && window.paypal) {
      window.paypal
        .Buttons({
          createOrder: async () => {
            try {
              // Filter valid cart items for PayPal order
              const validCartItems = cartItems.filter(item => item.productId);
              if (validCartItems.length === 0) {
                throw new Error('No valid items in cart for payment');
              }
              const totalAmount = validCartItems.reduce((total, item) => total + item.productId.price * item.quantity, 0);
              localStorage.setItem('cartItems', JSON.stringify(validCartItems.map(item => ({ productId: item.productId._id, quantity: item.quantity }))));
              localStorage.setItem('totalAmount', totalAmount.toFixed(2));
              const response = await dispatch(createPaypalOrder({
                cartItems: validCartItems.map(item => ({ productId: item.productId._id, quantity: item.quantity })),
                totalAmount,
              })).unwrap();
              return response.id;
            } catch (error) {
              alert('Error initiating payment: ' + error.message);
            }
          },
          onApprove: async (data) => {
            try {
              await dispatch(capturePaypalOrder({
                orderId: data.orderID,
                cartItems: JSON.parse(localStorage.getItem('cartItems')),
                totalAmount: parseFloat(localStorage.getItem('totalAmount')),
              })).unwrap();
              localStorage.removeItem('cartItems');
              localStorage.removeItem('totalAmount');
              alert('Order placed successfully!');
              navigate('/orders');
            } catch (error) {
              alert('Error completing payment: ' + error.message);
            }
          },
          onCancel: () => {
            navigate('/cancel');
          },
          onError: (err) => {
            console.error('PayPal error:', err);
            alert('An error occurred with PayPal. Please try again.');
          },
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
          },
        })
        .render('#paypal-button-container');
    }
  }, [cartItems, dispatch, navigate]);

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }
    dispatch(updateCartQuantity({ id, quantity }));
  };

  const handleClearError = () => {
    dispatch(clearCartError());
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      {status === 'loading' && <p>Loading cart...</p>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <p>{error}</p>
          <button
            onClick={handleClearError}
            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      )}
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            item.productId ? (
              <div key={item._id} className="border p-4 rounded mb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{item.productId.name}</h3>
                  <p>Price: ${item.productId.price.toFixed(2)}</p>
                  <div className="flex items-center mt-2">
                    <p className="mr-2">Quantity:</p>
                    <button
                      onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                      className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item._id, parseInt(e.target.value) || 1)}
                      className="w-16 mx-2 border p-1 rounded text-center"
                      min="1"
                      max={item.productId.stock}
                    />
                    <button
                      onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                      className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400"
                      disabled={item.quantity >= item.productId.stock}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Available stock: {item.productId.stock}</p>
                </div>
                <button
                  onClick={() => handleRemoveFromCart(item._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div key={item._id} className="border p-4 rounded mb-2 bg-red-100 flex justify-between items-center">
                <p className="text-red-600">Error: Product details unavailable for this item.</p>
                <button
                  onClick={() => handleRemoveFromCart(item._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Remove Item
                </button>
              </div>
            )
          ))}
          <div className="mt-4">
            <p className="text-xl font-semibold">
              Total: ${cartItems.reduce((total, item) => total + (item.productId?.price || 0) * item.quantity, 0).toFixed(2)}
            </p>
            {cartItems.some(item => !item.productId) ? (
              <p className="text-red-600 mt-2">Please remove invalid items before proceeding to payment.</p>
            ) : (
              <div id="paypal-button-container" className="mt-2"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;