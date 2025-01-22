import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyPost, newFetchData } from "data/FetchApi";
import { BillPayload,ApiResponse } from "redux/Reducer/BillReducer";

export const BillOK = createAsyncThunk<ApiResponse, BillPayload>(
    'billOK/billOK',
    async (billPayload) => {

        console.log('Dữ liệu được gửi:', billPayload);

      const response = await fetch(newFetchData.billOK, bodyPost(billPayload));
  
      if (response.ok) {
        const result: ApiResponse = await response.json();
        if (result.status === 'success') {
          return result.data;
        } else {
          throw new Error(result.message || 'Lỗi API');
        }
      } else {
        throw new Error('Không Thể Lấy Dữ Liệu');
      }
    }
  );