// thunks/typeThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyGet, newFetchData } from 'data/FetchApi';

// Tạo thunk để lấy danh sách loại chi nhánh
export const getTypeBranch = createAsyncThunk(
    'types/typeBranch', // Tên action prefix
    async () => {
        // Gửi yêu cầu fetch đến API để lấy dữ liệu loại chi nhánh
        const response = await fetch(newFetchData.branchType, bodyGet);
        // Chuyển đổi phản hồi thành định dạng JSON
        const data = await response.json();
        // Trả về danh sách loại chi nhánh từ dữ liệu
        return data.type;
    }
);
