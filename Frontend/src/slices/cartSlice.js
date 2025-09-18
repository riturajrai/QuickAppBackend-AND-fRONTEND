import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCartItems = createAsyncThunk('cart/fetchCartItems', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('http://localhost:5000/api/cart');
    const validItems = response.data.filter(item => item.productId && typeof item.productId === 'object');
    if (validItems.length < response.data.length) {
      console.warn('Some cart items have invalid or missing productId:', response.data);
    }
    return validItems;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ userId, productId, quantity }, { rejectWithValue }) => {
  try {
    const response = await axios.post('http://localhost:5000/api/cart', { userId, productId, quantity });
    if (!response.data.cartItem?.productId) {
      throw new Error('Invalid cart item: productId is missing');
    }
    return response.data.cartItem;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateCartQuantity = createAsyncThunk('cart/updateCartQuantity', async ({ id, quantity }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/cart/${id}`, { quantity });
    if (!response.data.cartItem?.productId) {
      throw new Error('Invalid cart item: productId is missing');
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`http://localhost:5000/api/cart/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        const updatedItem = action.payload.cartItem;
        const index = state.items.findIndex((item) => item._id === updatedItem._id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
        state.error = null;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;