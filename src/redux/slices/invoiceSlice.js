import { createSlice } from '@reduxjs/toolkit';

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: { list: [], loading: false },
  reducers: {
    setInvoices: (state, action) => { state.list = action.payload; },
    addInvoice: (state, action) => { state.list.unshift(action.payload); },
    updateInvoice: (state, action) => {
      const index = state.list.findIndex(i => i._id === action.payload._id);
      if (index !== -1) state.list[index] = action.payload;
    },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { setInvoices, addInvoice, updateInvoice, setLoading } = invoiceSlice.actions;
export default invoiceSlice.reducer;