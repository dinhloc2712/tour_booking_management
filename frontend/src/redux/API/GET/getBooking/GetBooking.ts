import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyGet, newFetchData } from "data/FetchApi";

export const getBooking = createAsyncThunk(
    'booking/getBooking',
    async () => {
        
        const apibodyGet = bodyGet();

        const response = await fetch(newFetchData.booking, apibodyGet)
        
        if (response.ok) {
            const result = await response.json()
            if (result.status === "success") {
                return result.data;
            }else{
                throw new Error(result.message || 'Lỗi Api')
            }
           
        }else{
            throw new Error('Không Thể Lấy Dữ Liệu')

        }

    }

)
