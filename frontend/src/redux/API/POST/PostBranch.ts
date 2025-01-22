import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyPost, newFetchData } from "data/FetchApi";
import { Branch } from "redux/Reducer/BranchReducer";

// Tạo một thunk để thêm một chi nhánh mới
export const addBranch = createAsyncThunk<Branch, Branch>(
    'branch/addBranch', // Tên của action type cho thunk này
    async (branch: Branch) => {
        // Gửi request POST đến API để thêm chi nhánh mới
        const response = await fetch(newFetchData.branches, bodyPost(branch));

        if (response.ok) {
            // Nếu phản hồi thành công, chuyển đổi phản hồi thành JSON
            const result = await response.json();
            
            // Kiểm tra nếu kết quả trả về có status "success"
            if (result.status === "success") {
                return result.data; // Trả về dữ liệu chi nhánh mới được thêm
            } else {
                // Ném lỗi nếu status không phải "success"
                throw new Error('Failed to add branch');
            }
        } else {
            // Ném lỗi nếu phản hồi không thành công
            throw new Error('API Error');
        }
    }
);
