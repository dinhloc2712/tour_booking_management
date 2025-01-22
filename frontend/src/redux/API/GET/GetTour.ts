import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyGet, newFetchData } from "data/FetchApi";
import { error, log } from "console";
import { Tour } from "redux/Reducer/TourReducer";

export const getTour = createAsyncThunk<Tour[]>(
    'tour/getTour',
    async () => {
        const response = await fetch(newFetchData.tour, bodyGet)

        if (response.ok) {
            const result = await response.json()
            if (result.status === "success") {
                return result.data;
            } else {
                throw new Error(result.message || 'Lỗi Api')
            }
        } else {
            throw new Error('Không Thể Lấy Dữ Liệu')
        }

    }


)
