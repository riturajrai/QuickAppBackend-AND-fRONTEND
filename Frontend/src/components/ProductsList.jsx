import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, addProduct, deleteProduct, clearProductsError } from '../slices/productsSlice';
import { addToCart } from '../slices/cartSlice';

function Products() {
  const dispatch = useDispatch();
  const { items: products, status, error } = useSelector((state) => state.products);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', stock: '' });
  const userId = 'user123';

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const productData = {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      stock: parseInt(newProduct.stock, 10),
    };
    if (!productData.name || isNaN(productData.price) || !productData.category || isNaN(productData.stock)) {
      alert('Please fill in all fields with valid data');
      return;
    }
    await dispatch(addProduct(productData));
    setNewProduct({ name: '', price: '', category: '', stock: '' });
  };

  const handleDeleteProduct = (id) => {
    dispatch(deleteProduct(id));
  };

  const handleAddToCart = (productId) => {
    dispatch(addToCart({ userId, productId, quantity: 1 }));
  };

  const handleClearError = () => {
    dispatch(clearProductsError());
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      {status === 'loading' && <p>Loading products...</p>}
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
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add New Product</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            className="border p-2 rounded"
            min="0"
            step="0.01"
          />
          <input
            type="text"
            placeholder="Category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            className="border p-2 rounded"
            min="0"
          />
          <button
            onClick={handleAddProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Product
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded shadow">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p>Price: ${product.price.toFixed(2)}</p>
            <p>Category: {product.category}</p>
            <p>Stock: {product.stock}</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleAddToCart(product._id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={product.stock === 0}
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleDeleteProduct(product._id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;