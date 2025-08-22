import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

const savedToken = localStorage.getItem('token') || null;
const savedUser = JSON.parse(localStorage.getItem('user') || 'null');

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post('/login', credentials);
    // backend bisa ngembaliin access_token atau token
    const token = res.data.access_token ?? res.data.token;
    if (!token) throw new Error('Token tidak ditemukan');
    localStorage.setItem('token', token);

    const me = await api.get('/me');
    localStorage.setItem('user', JSON.stringify(me.data));
    return { token, user: me.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/register', payload);
    const token = res.data.access_token ?? res.data.token ?? null;
    if (token) {
      localStorage.setItem('token', token);
      const me = await api.get('/me');
      localStorage.setItem('user', JSON.stringify(me.data));
      return { token, user: me.data };
    }
    return { token: null, user: res.data.user ?? null };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const slice = createSlice({
  name: 'auth',
  initialState: { token: savedToken, user: savedUser, status: 'idle', error: null },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, s => { s.status = 'loading'; s.error = null; })
      .addCase(login.fulfilled, (s, a) => { s.status = 'succeeded'; s.token = a.payload.token; s.user = a.payload.user; })
      .addCase(login.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })

      .addCase(register.pending, s => { s.status = 'loading'; s.error = null; })
      .addCase(register.fulfilled, (s, a) => { s.status = 'succeeded'; s.token = a.payload.token; s.user = a.payload.user; })
      .addCase(register.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; });
  }
});

export const { logout } = slice.actions;
export default slice.reducer;
