import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyGet, newFetchData } from "data/FetchApi";
import { StatisticalTour } from "redux/Reducer/StatisticalReducer";


export const getStatisticalTour = createAsyncThunk<StatisticalTour[]>(
    'tour/getTour',
    async () => {
        const response = await fetch(newFetchData.statisticalTourAll, bodyGet)

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
