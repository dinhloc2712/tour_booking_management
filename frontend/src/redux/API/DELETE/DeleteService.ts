import { createAsyncThunk } from '@reduxjs/toolkit';
import { newFetchData } from 'data/FetchApi';

const token = localStorage.getItem('token')


export const deleteService = createAsyncThunk('service/deleteService', async (serviceId: string, thunkAPI) => {
    try {
        const response = await fetch(`${newFetchData.service}/${serviceId}`, {
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

        return serviceId;
    } catch (error) {
        return thunkAPI.rejectWithValue('Đã xảy ra lỗi!');
    }
});
