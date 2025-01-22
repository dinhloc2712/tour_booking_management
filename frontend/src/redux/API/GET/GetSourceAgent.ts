import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyGet, newFetchData } from "data/FetchApi";
import { SourceAgent } from "redux/Reducer/SourceReducerAgent";

export const getSourceAgent = createAsyncThunk<SourceAgent[]>(
    'source/getSourceAgent',
    async () => {
        const response = await fetch(newFetchData.saleAgentsAgent, bodyGet)
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
