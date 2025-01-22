import { createAsyncThunk } from "@reduxjs/toolkit";
import { newFetchData } from "data/FetchApi";
import { Branch } from "redux/Reducer/BranchReducer";
import { AppDispatch, RootState } from "redux/store";
import { authLogout } from "../POST/AuthThunks";

export const getBranchList = createAsyncThunk<Branch[], void, { dispatch: AppDispatch, state: RootState }>(
    'branch/branchList', // Tên của action type cho thunk này
    async (_, { dispatch, getState }) => {
        const token = getState().auth.token; // Lấy token từ state
        console.log(token);

        // Tạo headers với token
        const headers = {
            'Content-Type': 'application/json', // Đảm bảo gửi dữ liệu với Content-Type là JSON
            'Authorization': `Bearer ${token}` // Thêm token vào headers
        };

        // Thực hiện fetch với headers đã tạo
        const response = await fetch(newFetchData.branches, { 
            method: 'GET',
            headers: headers // Truyền headers vào yêu cầu fetch
        });

        if (response.ok) {
            const result = await response.json();

            if (result.status === "success") {
                return result.data; 
            } else {
                throw new Error('Không thể lấy dữ liệu');
            }
        } else if (response.status === 401) {
            dispatch(authLogout()); 
            localStorage.removeItem('user'); 
            localStorage.removeItem('token'); 
            window.location.href = '/'; 
            
        } else {
            throw new Error('Lỗi API @@');
        }
    }
);
