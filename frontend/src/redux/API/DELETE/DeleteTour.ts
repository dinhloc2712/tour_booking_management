import { createAsyncThunk } from '@reduxjs/toolkit';
import { newFetchData } from 'data/FetchApi';

export const deleteTour = createAsyncThunk('tour/deleteTour', async (tourID: string, thunkAPI) => {
    try {
        const response = await fetch(`${newFetchData.tour}/${tourID}`, {
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

        return tourID;
    } catch (error) {
        return thunkAPI.rejectWithValue('Đã xảy ra lỗi!');
    }
});
