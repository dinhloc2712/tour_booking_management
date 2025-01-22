import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyPost, newFetchData } from "data/FetchApi";
import { BillAddServiceInfo,ApiResponse } from "redux/Reducer/BillReducer";

export const BillAddServiceOK = createAsyncThunk<ApiResponse, BillAddServiceInfo>(
    'billOK/BillAddServiceOK',
    async (BillAddServiceInfo) => {

        console.log('Dữ liệu được gửi:', BillAddServiceInfo);

      const response = await fetch(newFetchData.billOK, bodyPost(BillAddServiceInfo));
  
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