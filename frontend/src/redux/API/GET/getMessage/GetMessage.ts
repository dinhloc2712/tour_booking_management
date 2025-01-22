import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { bodyGet, newFetchData } from "data/FetchApi";

export const getMessage = createAsyncThunk(
    'message/getMessage',
    async (conversationId: number, { dispatch, rejectWithValue }) => {
        const apiGet = bodyGet();
        const response = await axios(`${newFetchData.message}/${conversationId}`, apiGet);
        
        if(response.status == 200){
            const result = await response.data;
            if(result.status === "success"){
                return result.data;
            } else{
                throw new Error(result.message || "Lỗi server")
            }
        }else{
            throw new Error('Không thể lấy dữ liệu')
        }
    }
)