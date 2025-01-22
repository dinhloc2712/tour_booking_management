import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyPost, newFetchData } from "data/FetchApi";
import { BillRefundServicePayload,ApiResponse } from "redux/Reducer/BillReducer";

export const BillRefundServiceOK = createAsyncThunk<ApiResponse, BillRefundServicePayload>(
    'billOK/BillRefundServiceOK',
    async (BillRefundServicePayload) => {

        console.log('Dữ liệu được gửi:', BillRefundServicePayload);

      const response = await fetch(newFetchData.billOK, bodyPost(BillRefundServicePayload));
  
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