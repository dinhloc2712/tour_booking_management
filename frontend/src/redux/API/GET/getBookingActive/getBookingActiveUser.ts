import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyGet, newFetchData } from "data/FetchApi";

export const getBookingActiveUser = createAsyncThunk(
  "bookingTour/getBookingActiveUser", // Tên action
  async (value: string, thunkAPI) => {
    try {
      const apibodyGet = bodyGet();
      const response = await fetch(
        `${newFetchData.bookingTour}/${value}`,
        apibodyGet
      );

      if (!response.ok) {
        throw new Error("Không Thể Lấy Dữ Liệu");
      }

      const result = await response.json();


      if (result.status === "success") {
        console.log("Dữ liệu trả về từ API:", result);
        return result.data; // Trả về dữ liệu nếu thành công
      } else {
        throw new Error(result.message || "Lỗi Api");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message); // Trả lỗi về thunk
    }
  }
);
