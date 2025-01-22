import { createAsyncThunk } from '@reduxjs/toolkit';
import { newFetchData } from 'data/FetchApi';
const token = localStorage.getItem('token')

export const deleteBranch = createAsyncThunk('branch/deleteBranch', async (branchId: string, thunkAPI) => {
    try {
        const response = await fetch(`${newFetchData.branches}/${branchId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            signal: thunkAPI.signal,
        });

        if (!response.ok) {
            const errorData = await response.json();
            return thunkAPI.rejectWithValue(errorData.message || 'Đã xảy ra lỗi!');
        }

        return branchId;
    } catch (error) {
        return thunkAPI.rejectWithValue('Đã xảy ra lỗi!');
    }
});
