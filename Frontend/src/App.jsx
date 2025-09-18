
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Cart from './components/Cart';
import Orders from './components/Order';
import Products from './components/ProductsList';
import Success from './components/Success';
import Cancel from './components/Cancel';
import Navbar from './components/Navbar';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/" element={<Products />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
