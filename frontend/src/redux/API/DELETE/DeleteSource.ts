import { createAsyncThunk } from '@reduxjs/toolkit';
import { newFetchData } from 'data/FetchApi';
const token = localStorage.getItem('token')

export const deleteSource = createAsyncThunk('source/deleteSource', async (saleAgentsID: string, thunkAPI) => {
    try {
        const response = await fetch(`${newFetchData.saleAgentsh}/${saleAgentsID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            signal: thunkAPI.signal,
        });

        console.log(response);
        
        if (!response.ok) {
            const errorData = await response.json();
            return thunkAPI.rejectWithValue(errorData.message || 'Đã xảy ra lỗi!');
        }

        return saleAgentsID;
    } catch (error) {
        return thunkAPI.rejectWithValue('Đã xảy ra lỗi!');
    }
});
