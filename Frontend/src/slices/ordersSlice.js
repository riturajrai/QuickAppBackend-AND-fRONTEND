import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('http://localhost:5000/api/orders');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createPaypalOrder = createAsyncThunk('orders/createPaypalOrder', async ({ cartItems, totalAmount }, { rejectWithValue }) => {
  try {
    if (!cartItems.every(item => item.productId)) {
      throw new Error('Invalid cart items: missing productId');
    }
    const response = await axios.post('http://localhost:5000/api/create-paypal-order', {
      cartItems,
      totalAmount,
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const capturePaypalOrder = createAsyncThunk('orders/capturePaypalOrder', async ({ orderId, cartItems, totalAmount }, { rejectWithValue }) => {
  try {
    if (!cartItems.every(item => item.productId)) {
      throw new Error('Invalid cart items: missing productId');
    }
    const response = await axios.post('http://localhost:5000/api/capture-paypal-order', {
      orderId,
      cartItems,
      totalAmount,
    });
    return response.data.order;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearOrdersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createPaypalOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createPaypalOrder.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createPaypalOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(capturePaypalOrder.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(capturePaypalOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearOrdersError } = ordersSlice.actions;
export default ordersSlice.reducer;