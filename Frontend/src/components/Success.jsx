
import { Link } from 'react-router-dom';

function Success() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-green-600">Order Successful!</h1>
      <p>Your order has been placed successfully. Thank you for shopping with us!</p>
      <Link to="/orders" className="text-blue-600 hover:underline mt-4 inline-block">
        View Your Orders
      </Link>
    </div>
  );
}

export default Success;
