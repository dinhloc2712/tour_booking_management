import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyPost, newFetchData } from "data/FetchApi";
import { Staff } from "redux/Reducer/StaffReducer";

export const addStaff = createAsyncThunk<Staff, Staff>(
  "staff/addstaff",
  async (staff: Staff, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); 

      const response = await fetch(newFetchData.staff, {
        ...bodyPost(staff),
        headers: {
          ...bodyPost(staff).headers, 
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === "success") {
          return result.data;
        } else {
          throw new Error("Failed to add staff");
        }
      } else {
        throw new Error("API Error");
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
