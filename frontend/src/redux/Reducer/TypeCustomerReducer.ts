// redux/Reducer/BranchRoleReducer.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { bodyGet } from "data/FetchApi";

export interface Branch {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    type: string;
}

export interface BranchRoleState {
    roles: string[];
    branches: Branch[];
    loading: boolean;
    error: string | null;
}

const initialState: BranchRoleState = {
    roles: [],
    branches: [],
    loading: false,
    error: null,
};

export const fetchBranchRoleData = createAsyncThunk(
    "branchRole/fetchBranchRoleData",
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token')
        try {
            const response = await fetch("http://127.0.0.1:8000/api/staff/create", {
                method: "GET",

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },

                mode: 'cors',
            });

            // Kiểm tra nếu phản hồi không thành công
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData?.message || "API Error");
            }

            // Chuyển dữ liệu JSON từ phản hồi
            const data = await response.json();

            return data.data;  // Trả về dữ liệu từ API
        } catch (error: any) {
            // Xử lý lỗi khi có lỗi trong quá trình gọi API
            return rejectWithValue(error?.message || "API Error");
        }
    }
);

const TypeCustomerReducer = createSlice({
    name: "typeBranchAndRole",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBranchRoleData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBranchRoleData.fulfilled, (state, action: PayloadAction<{ roles: string[]; branches: Branch[] }>) => {
                state.loading = false;
                state.roles = action.payload.roles;
                state.branches = action.payload.branches;
            })
            .addCase(fetchBranchRoleData.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default TypeCustomerReducer.reducer;
