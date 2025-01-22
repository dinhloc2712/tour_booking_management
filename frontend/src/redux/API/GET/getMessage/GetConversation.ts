import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyGet, newFetchData } from "data/FetchApi";

export const getConversation = createAsyncThunk(
    'conversation/getConversation',
    async () => {
        const apiGet = bodyGet();
        
        const response = await fetch(newFetchData.conversation, apiGet);
        if (response.ok){
            const result = await response.json();
            if(result.status === "success"){
                return result.data;
            } else{
                throw new Error(result.message || "lỗi serve")
            }
        } else{
            throw new Error ('Không thể lấy dữ liệu')
        }
    }
)