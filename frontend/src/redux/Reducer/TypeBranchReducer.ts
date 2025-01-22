// slices/typeSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { getTypeBranch } from 'redux/API/GET/GetTypeBranch';

// Định nghĩa trạng thái cho loại chi nhánh
interface TypeState {
  types: string[]; // Danh sách loại chi nhánh
  loading: boolean; // Trạng thái loading
  error: string | null; // Lỗi nếu có
}

// Giá trị khởi tạo của trạng thái
const initialState: TypeState = {
  types: [],
  loading: false,
  error: null,
};

// Tạo slice cho loại chi nhánh
const typeBranchReducer = createSlice({
  name: 'types', // Tên slice
  initialState, // Trạng thái khởi tạo
  reducers: {}, // Không có reducers trong slice này
  extraReducers: (builder) => {
    builder
      .addCase(getTypeBranch.pending, (state) => {
        // Khi yêu cầu lấy loại chi nhánh đang xử lý
        state.loading = true; // Đặt trạng thái loading thành true
        state.error = null; // Reset lỗi
      })
      .addCase(getTypeBranch.fulfilled, (state, action) => {
        // Khi yêu cầu lấy loại chi nhánh thành công
        state.loading = false; // Đặt trạng thái loading thành false
        state.types = action.payload; // Cập nhật danh sách loại chi nhánh
      })
      .addCase(getTypeBranch.rejected, (state, action) => {
        // Khi yêu cầu lấy loại chi nhánh thất bại
        state.loading = false; // Đặt trạng thái loading thành false
        state.error = action.error.message || 'Failed to fetch types'; // Lưu lỗi nếu có
      });
  },
});

// Xuất reducer để sử dụng trong store
export default typeBranchReducer.reducer;
