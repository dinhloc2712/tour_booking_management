import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyPost, newFetchData } from "data/FetchApi";
import { SourceService } from "redux/Reducer/SourceReducer";


export const addSource = createAsyncThunk<SourceService, SourceService>(
    'source/addSource',
    async (source: SourceService) => {
        const response = await fetch(newFetchData.saleAgentsh, bodyPost(source));
        if (response.ok) {
            const result = await response.json();
            if (result.status === "success") {
                return result.data;
            } else {
                throw new Error('Failed to add service');
            }
        } else {
            throw new Error('API Error');
        }
    }
);