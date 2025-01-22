import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyGet, newFetchData } from 'data/FetchApi';

export const getTypeSource = createAsyncThunk(
    'types/typeSource',
    async () => {
        const response = await fetch(newFetchData.saleAgentsType, bodyGet);
        const data = await response.json();
        return data.type;
    }
);