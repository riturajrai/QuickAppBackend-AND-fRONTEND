
import { Link } from 'react-router-dom';

function Cancel() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Order Cancelled</h1>
      <p>Your order was cancelled. Please try again or contact support if you need assistance.</p>
      <Link to="/cart" className="text-blue-600 hover:underline mt-4 inline-block">
        Return to Cart
      </Link>
    </div>
  );
}

export default Cancel;
