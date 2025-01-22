import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyGet, newFetchData } from "data/FetchApi";

export const fetchBookingToursWithStatus = createAsyncThunk(
    'bookingTour/fetchBookingToursWithStatus',
    async () => {
        const bookingToursPromise = fetch(newFetchData.bookingTour);
        const statusPromise = fetch(newFetchData.bookingActivity);

        const [bookingToursResponse, statusResponse] = await Promise.all([bookingToursPromise, statusPromise]);

        if (!bookingToursResponse.ok || !statusResponse.ok) {
            throw new Error('Có lỗi xảy ra khi lấy dữ liệu');
        }

        const bookingToursData = await bookingToursResponse.json();
        const statusData = await statusResponse.json();

        console.log('Dữ liệu trả về từ API:', bookingToursData, statusData);

        return {
            bookingTours: bookingToursData.data,
            status: statusData.data,
        };
    }
);



