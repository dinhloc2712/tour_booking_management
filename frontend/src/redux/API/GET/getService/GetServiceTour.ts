import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyGet, newFetchData } from "data/FetchApi";

export const getServiceTour = createAsyncThunk(
  'serviceTour/getServiceTour',
  async (dataTour: { tourId: any, userId?: any }) => {
    const apiGet = bodyGet();

    const { tourId, userId } = dataTour;
    // Xây dựng URL, nếu có userId thì thêm cả userId vào URL
    let url = `${newFetchData.getServiceTourNew}/${tourId}`;
    
    // Nếu có userId thì thêm vào query string (sử dụng '&' thay vì '?' sau lần đầu)
    if (userId) {
      url = `${url}/${userId}`;
    }
    const response = await fetch(url, apiGet);
    if (response.ok) {
      const result = await response.json();
      console.log('Dữ liệu trả về từ API service tour:', result);
      if (result.status === "success") {
        return result.data;
      } else {
        throw new Error(result.message || 'Lỗi Api');
      }
    } else {
      throw new Error('Không thể lấy dữ liệu');
    }
  }
);
