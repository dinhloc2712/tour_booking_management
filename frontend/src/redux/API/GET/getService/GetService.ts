import { createAsyncThunk } from "@reduxjs/toolkit";
import { error } from "console";
import { bodyGet, newFetchData } from "data/FetchApi";

export const getService = createAsyncThunk(
    'service/getService',
    async () => {
        const apiGet = bodyGet();
        const response = await fetch(newFetchData.service, apiGet)
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
