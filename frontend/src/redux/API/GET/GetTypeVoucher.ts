import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyGet, newFetchData } from 'data/FetchApi';

export const getTypeVoucher = createAsyncThunk(
    'types/typeVoucher',
    async () => {
        const response = await fetch(newFetchData.voucherType, bodyGet);
        const data = await response.json();
        return data.type;
    }
);