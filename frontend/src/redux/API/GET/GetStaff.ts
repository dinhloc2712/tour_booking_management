import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyGet, newFetchData } from "data/FetchApi";
import { RootState } from "redux/store";

export const getStaff = createAsyncThunk(
    'staff/getStaff',
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as RootState; // Lấy toàn bộ state từ Redux
        const token = state.auth.token; // Lấy token từ state (cần điều chỉnh theo slice auth của bạn)

        // Cấu hình API call
        const apiGet = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Thêm token vào Header
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await fetch(newFetchData.staff, apiGet); // Thực hiện API call

            if (response.ok) {
                const result = await response.json();
                if (result.status === "success") {
                    return result.data; // Trả về dữ liệu nếu thành công
                } else {
                    throw new Error(result.message || 'Lỗi API');
                }
            } else {
                throw new Error('Không Thể Lấy Dữ Liệu');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Lỗi không xác định'); // Trả về lỗi nếu xảy ra
        }
    }
)

export const getOneStaff = createAsyncThunk(
    'staff/staff',
    async (_, thunkAPI) => {
        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                throw new Error('Người dùng chưa đăng nhập');
            }

            const { id } = JSON.parse(storedUser);

            const apiGet = bodyGet();
            const response = await fetch(`${newFetchData.staff}/${id}`, apiGet);

            if (response.ok) {
                const result = await response.json();
                if (result.status === 'success') {
                    return result.data;
                } else {
                    throw new Error(result.message || 'Lỗi API');
                }
            } else {
                throw new Error('Không thể lấy dữ liệu');
            }
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);


