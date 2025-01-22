import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Branch from "layout/Branch/Branch";
import { deleteBranch } from "redux/API/DELETE/DeleteBranch";
import { getBranchList } from "redux/API/GET/GetBranch";
import { addBranch } from "redux/API/POST/PostBranch";
import { updateBranch } from "redux/API/PUT/EditBranch";

// Định nghĩa interface cho đối tượng Branch
export interface Branch {
    id: string;
    name: string;
    type: string;
}

// Định nghĩa interface cho state của reducer
interface BrandState {
    branchList: Branch[]; // Danh sách các chi nhánh
    editingBranch: Branch | null;
    loading: boolean; // Trạng thái tải dữ liệu
    error: string | null; // Thông báo lỗi nếu có
}

// Giá trị khởi tạo cho state
const initialState: BrandState = {
    branchList: [],
    editingBranch: null,
    loading: false,
    error: null
}

// Tạo slice cho branch với Redux Toolkit
const branchReducer = createSlice({
    name: "branch", // Tên của slice
    initialState,
    reducers: {
        startEditingBranch: (state, action: PayloadAction<string>) => {
            const banchId = action.payload
            const foundBranch = state.branchList.find((branch) => branch.id === banchId) || null
            state.editingBranch = foundBranch
        },
    }, // Không có reducer nào cần thiết cho slice này
    extraReducers(builder) {
        builder
            .addCase(getBranchList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBranchList.fulfilled, (state, action: PayloadAction<Branch[]>) => {
                state.loading = false;
                state.branchList = action.payload;
            })
            .addCase(getBranchList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Không thể lấy dữ liệu";
            })

            .addCase(addBranch.pending, (state) => {
                state.loading = true;
            })

            .addCase(addBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
                state.loading = false;
                state.branchList.push(action.payload);
            })
            .addCase(addBranch.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Không thể thêm chi nhánh";
            })

            .addCase(updateBranch.fulfilled, (state, action) => {
                state.branchList.find((branch, index) => {
                    if (branch.id === action.payload.id) {
                        state.branchList[index] = action.payload
                        return true
                    }
                    return false
                })
                state.editingBranch = null
            })
            .addCase(updateBranch.rejected, (state, action) => {
                state.error = action.payload as string;
                state.loading = false;
            })
            .addCase(deleteBranch.fulfilled, (state, action) => {
                state.branchList = state.branchList.filter(Branch => Branch.id !== action.payload);
            })
            .addCase(deleteBranch.rejected, (state, action) => {
                console.error(action.payload);
            });
    },
});

export const { startEditingBranch } = branchReducer.actions
export default branchReducer.reducer;
