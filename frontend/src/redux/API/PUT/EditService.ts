import { createAsyncThunk } from "@reduxjs/toolkit"; // Nhập createAsyncThunk từ Redux Toolkit
import { newFetchData } from "data/FetchApi"; // Nhập dữ liệu fetch từ API
import { Service } from "redux/Reducer/ServiceReducer"; // Nhập kiểu dữ liệu Service từ reducer
const token = localStorage.getItem('token')

// Tạo async thunk để cập nhật dịch vụ
export const updateService = createAsyncThunk(
    'service/updateService', // Tên của action
    async ({ id, body }: { id: string; body: Service }, thunkAPI) => { // Hàm async nhận id và body
        try {
            // Gửi yêu cầu PUT để cập nhật dịch vụ
            const response = await fetch(`${newFetchData.service}/${id}`, {
                method: 'PUT', // Phương thức PUT để cập nhật
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                body: JSON.stringify(body), // Chuyển đổi body thành chuỗi JSON
            });
            console.log(response);
            // Kiểm tra xem phản hồi có hợp lệ không
            if (!response.ok) {
                const errorData = await response.json(); // Lấy dữ liệu lỗi nếu có
                if (response.status === 422) { // Nếu mã trạng thái là 422 (Unprocessable Entity)
                    return thunkAPI.rejectWithValue(errorData); // Trả về lỗi cho Redux
                }
                throw new Error('Something went wrong'); // Ném lỗi nếu không phải 422
            }

            const data = await response.json(); // Giả sử response trả về dữ liệu
            return data; // Trả về dữ liệu thành công
        } catch (error: any) {
            // Xử lý lỗi
            if (error.name === 'AbortError') { // Nếu yêu cầu bị hủy
                console.log('Request was aborted'); // Log thông báo
            } else {
                throw error; // Ném lại lỗi cho redux để xử lý
            }
        }
    }
);