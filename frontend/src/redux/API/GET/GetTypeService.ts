import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyGet, newFetchData } from 'data/FetchApi';

export const getTypeService = createAsyncThunk(
    'types/typeService',
    async () => {
        const response = await fetch(newFetchData.serviceType, bodyGet);
        const data = await response.json();
        return data.type;
    }
);