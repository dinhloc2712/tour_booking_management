import { createAsyncThunk } from '@reduxjs/toolkit';
import { newFetchData } from 'data/FetchApi';

export const deleteStaff = createAsyncThunk('staff/deleteStaff', async (staffId: string, thunkAPI) => {
    try {
        const response = await fetch(`${newFetchData.staff}/${staffId}`, {
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

        return staffId;
    } catch (error) {
        return thunkAPI.rejectWithValue('Đã xảy ra lỗi!');
    }
});
