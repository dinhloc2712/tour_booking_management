import { createAsyncThunk } from '@reduxjs/toolkit';
import { newFetchData } from 'data/FetchApi';

export const deleteVoucher = createAsyncThunk('voucher/deleteVoucher', async (voucherID: string, thunkAPI) => {
    try {
        const response = await fetch(`${newFetchData.voucher}/${voucherID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: thunkAPI.signal,
        });

        if (!response.ok) {
            const errorData = await response.json();
            return thunkAPI.rejectWithValue(errorData.message || 'Đã xảy ra lỗi!');
        }

        return voucherID;
    } catch (error) {
        return thunkAPI.rejectWithValue('Đã xảy ra lỗi!');
    }
});
