import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders, clearOrdersError } from '../slices/ordersSlice';

function Orders() {
  const dispatch = useDispatch();
  const { items: orders, status, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchOrders());
    }
  }, [status, dispatch]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  };

  const handleClearError = () => {
    dispatch(clearOrdersError());
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Your Orders</h1>
      
      {/* Loading State */}
      {status === 'loading' && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-lg text-gray-600">Loading orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 flex justify-between items-center shadow-sm">
          <p className="font-medium">{error}</p>
          <button
            onClick={handleClearError}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty State */}
      {status !== 'loading' && orders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500 font-medium">No orders found.</p>
          <p className="mt-2 text-sm text-gray-400">Place an order to see it here!</p>
        </div>
      )}

      {/* Orders List */}
      {status !== 'loading' && orders.length > 0 && (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-xl shadow-lg bg-white p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-gray-900">Order ID: {order._id}</h3>
                  <p className="text-sm text-gray-500">Placed on: {formatDate(order.createdAt)}</p>
                  {order.createdAt !== order.updatedAt && (
                    <p className="text-sm text-gray-500">
                      Last Updated: {formatDate(order.updatedAt)}
                    </p>
                  )}
                </div>
                <div className="mt-4 sm:mt-0 text-left sm:text-right space-y-1">
                  <p
                    className={`text-sm font-semibold ${
                      order.status === 'Delivered'
                        ? 'text-green-600'
                        : order.status === 'Cancelled'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  >
                    Status: {order.status}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      order.paymentStatus === 'Completed'
                        ? 'text-green-600'
                        : order.paymentStatus === 'Failed'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    Payment: {order.paymentStatus}
                  </p>
                </div>
              </div>

              <h4 className="text-lg font-medium text-gray-700 mb-3">Items:</h4>
              <div className="space-y-4">
                {order.cartItems.map((item) => (
                  item.productId ? (
                    <div
                      key={item.productId._id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 py-3"
                    >
                      <div className="space-y-1">
                        <p className="text-gray-900 font-semibold">{item.productId.name}</p>
                        <p className="text-sm text-gray-500">
                          Price: ${item.productId.price.toFixed(2)} | Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="mt-2 sm:mt-0 text-gray-900 font-semibold">
                        Total: ${(item.productId.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <div
                      key={item.productId?._id || Math.random()}
                      className="border-b border-gray-200 py-3 text-red-600 text-sm"
                    >
                      <p>Item unavailable (product may have been deleted)</p>
                    </div>
                  )
                ))}
              </div>

              <p className="text-xl font-bold text-gray-900 mt-6">
                Order Total: ${order.totalAmount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;