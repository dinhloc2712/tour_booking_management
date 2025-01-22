import { createAsyncThunk } from "@reduxjs/toolkit";
import { Tour } from "redux/Reducer/TourReducer";

export const addTour = createAsyncThunk<Tour, Omit<Tour, 'id' | 'image'>>(
    'tour/createTour',
    async (newTour, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:8000/api/tours', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newTour,
                    services: newTour.services.map(service => ({
                        service_id: service.id,
                        name: service.name,
                        price: service.price
                    })),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                return rejectWithValue(errorData.message || 'Unknown error occurred');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to create tour:', error);
            return rejectWithValue('Failed to create tour');
        }
    }
);