import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { deleteTour } from "redux/API/DELETE/DeleteTour";
import { getTour } from "redux/API/GET/GetTour";
import { addTour } from "redux/API/POST/PostTour";
import { updateTour } from "redux/API/PUT/EditTour";

export interface Service {
  id: number;
  name: string;
  price: string;
  description: string;
  is_active: boolean;
  type: string;
  pivot: {
    tour_id: string;
    service_id: string;
    price: number;
    is_active: boolean;
  };
}

export interface Branch {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  type: string;
}

// TourReducer.ts
export interface Tour {
  id: any;
  name: string;
  price_min: number;
  price_max: number;
  quantity: number;
  description: string;
  is_active: boolean;
  branch_id: string;
  services: Service[];
  tour_schedules: any[];
  branch: Branch | string;
  tour_gallery: any[];
  image: string; 
}


interface TourState {
  tourList: Tour[];
  edittingTour: Tour | null;
  loading: boolean;
  error: string | null;
  services: Service[];
}

const initialState: TourState = {
  edittingTour: null,
  tourList: [],
  loading: false,
  error: null,
  services: []
};




const tourReducer = createSlice({
  name: 'tour',
  initialState,
  reducers: {
    startEditingTour: (state, action: PayloadAction<any>) => { 
      const tourID = action.payload;
      const foundTour = state.tourList.find((tour) => tour.id === tourID) || null;
      state.edittingTour = foundTour;
    },
    clearError: (state) => {
      state.error = null; // Reset lỗi
    },
  },
  extraReducers(builder) {
    builder
   
      .addCase(getTour.pending, (state) => { 
        state.loading = true;
        state.error = null;
      })
      .addCase(getTour.fulfilled, (state, action: PayloadAction<Tour[]>) => {
        state.tourList = action.payload;
        state.loading = false;
      })
      .addCase(getTour.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.error.message || "Failed to fetch tours"; 
      })
      .addCase(addTour.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTour.fulfilled, (state, action: PayloadAction<Tour>) => {
        state.loading = false;
        state.tourList.push(action.payload);
      })
      .addCase(addTour.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể thêm tour";
      })
      .addCase(deleteTour.fulfilled, (state, action) => {
        state.tourList = state.tourList.filter(tour => tour.id !== action.payload);
      })
      .addCase(deleteTour.rejected, (state, action) => {
        state.error = action.error.message || "Không thể xóa tour";
      })
      .addCase(updateTour.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTour.fulfilled, (state, action: PayloadAction<Tour>) => {
        state.loading = false;
        const updatedTour = action.payload;
      
        // Kiểm tra xem services có tồn tại trong updatedTour không
        console.log("Updated tour services:", updatedTour.services);
      
        const index = state.tourList.findIndex(tour => tour.id === updatedTour.id);
        if (index !== -1) {
          state.tourList[index] = updatedTour;
        } else {
          state.error = "Tour not found";
        }
      
        // Nếu cần, cập nhật lại edittingTour
        if (state.edittingTour?.id === updatedTour.id) {
          state.edittingTour = updatedTour;
        }
      })
      
      .addCase(updateTour.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể cập nhật tour";
      });
  },
});

export const { startEditingTour, clearError } = tourReducer.actions; // Xuất action clearError
export default tourReducer.reducer;