import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyGet, newFetchData } from "data/FetchApi";

export const getBookingActiverALlUser = createAsyncThunk(
  "bookingTour/getBookingActiverALlUser", // Tên action
  async (value: string, thunkAPI) => {
    try {
      const apibodyGet = bodyGet();
      const response = await fetch(
        `${newFetchData.getBookingTourAllUsers}/${value}`,
        apibodyGet
      );

      if (!response.ok) {
        throw new Error("Không Thể Lấy Dữ Liệu");
      }
      const result = await response.json();
      if (result.status === "success") {
        console.log("Dữ liệu trả về từ API:", result);
        return result.data;
      } else {
        throw new Error(result.message || "Lỗi Api");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message); // Trả lỗi về thunk
    }
  }
);
