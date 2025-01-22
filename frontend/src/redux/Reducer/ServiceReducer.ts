import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deleteService } from 'redux/API/DELETE/DeleteService';
import { getService } from 'redux/API/GET/getService/GetService';
import { getServiceTour } from 'redux/API/GET/getService/GetServiceTour';
import { updateService } from 'redux/API/PUT/EditService';

export interface Service {
  id: string,
  name: string,
  price: string,
  type: string,
  description: string,
  is_active: boolean,
}

interface ServiceState {
  serviceList: Service[];
  editingService: Service | null;
  loading: boolean;
  error: string | null;

  serviceTourList: any[]; // Danh sách dịch vụ tour
  loadingServiceTour: boolean; // Trạng thái loading của serviceTour
  errorServiceTour: string | null; // Lỗi khi lấy dịch vụ tour
}

const initialState: ServiceState = {
  serviceList: [],
  editingService: null,
  loading: false,
  error: null,

  serviceTourList: [], // Khởi tạo danh sách serviceTour rỗng
  loadingServiceTour: false, // Trạng thái ban đầu là chưa loading
  errorServiceTour: null, // Không có lỗi ban đầu
};

const ServiceReducer = createSlice({
  name: 'service',
  initialState,
  reducers: {
    startEditingService: (state, action: PayloadAction<string>) => {
      const serviceId = action.payload
      const foundService = state.serviceList.find((service) => service.id === serviceId) || null
      state.editingService = foundService
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getService.pending, (state) => {
        state.loading = true;
      })
      .addCase(getService.fulfilled, (state, action) => {
        state.serviceList = action.payload;
        state.loading = false;
      })
      .addCase(getService.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch services';
        state.loading = false;
      })
      // Thêm case cho cập nhật service
      .addCase(updateService.fulfilled, (state, action) => {
        state.serviceList.find((server, index) => {
          if (server.id === action.payload.id) {
            state.serviceList[index] = action.payload
            return true
          }
          return false
        })
        state.editingService = null
      })
      .addCase(updateService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.serviceList = state.serviceList.filter(service => service.id !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => {
        console.error(action.payload); // Handle error state if needed
      })


      //  serviceTour

      .addCase(getServiceTour.pending, (state) => {
        state.loadingServiceTour = true; // Đang loading dịch vụ tour
        state.errorServiceTour = null; // Reset lỗi trước khi gọi API
      })
      .addCase(getServiceTour.fulfilled, (state, action) => {
        state.serviceTourList = action.payload; // Lưu dữ liệu dịch vụ tour vào state
        console.log('serviceTourList:', state.serviceTourList); // Log dữ liệu ra để xác minh 
        state.loadingServiceTour = false; // Set loading là false sau khi lấy thành công
      })
      .addCase(getServiceTour.rejected, (state, action) => {
        state.errorServiceTour = action.error.message || 'Failed to fetch service tours'; // Lưu lỗi nếu có
        state.loadingServiceTour = false; // Set loading là false nếu có lỗi
      });
  },
});
export const { startEditingService } = ServiceReducer.actions
export default ServiceReducer.reducer;