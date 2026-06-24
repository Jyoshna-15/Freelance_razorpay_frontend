import { createSlice } from '@reduxjs/toolkit';

const clientSlice = createSlice({
  name: 'clients',
  initialState: { list: [], loading: false },
  reducers: {
    setClients: (state, action) => { state.list = action.payload; },
    addClient: (state, action) => { state.list.unshift(action.payload); },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { setClients, addClient, setLoading } = clientSlice.actions;
export default clientSlice.reducer;