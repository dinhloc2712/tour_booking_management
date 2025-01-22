import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyPost, newFetchData } from "data/FetchApi";
import { Service } from "redux/Reducer/ServiceReducer";
     export const addService = createAsyncThunk<Service, Service>(
        'service/addService',
        async (service: Service) =>{
        const response = await fetch(newFetchData.service, bodyPost(service));
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