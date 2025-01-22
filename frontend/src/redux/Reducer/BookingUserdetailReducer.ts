import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notEqual } from 'assert';
import { getAllUserCheckin } from 'redux/API/GET/getBooking/GetAllUserCheckin';

// Định nghĩa kiểu dữ liệu cho từng phần dữ liệu
interface Service {
  id: number;
  service_id: string;
  name_service: string;
  quantity: number;
  unit: string;
  price: number;
  start_time: string;
  end_time: string;
  status: string;
  note: string;
}

interface Tour {
  id: number;
  tour_id: number;
  booking_id: number;
  name_tour: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;
  services: Service[];
  note: string;
}

interface UserDetail {
  id: number;
  fullname: string;
  passport: string;
  phone: string;
  address: string;
  birthday: string;
  user_active: any;
  booking_id: any;
  deposit: any;
  tours: Tour[];
}

interface CheckinUserAllState {
  users: UserDetail[];
  loading: boolean;
  error: string | null;
}

// Khởi tạo state ban đầu
const initialState: CheckinUserAllState = {
  users: [],
  loading: false,
  error: null,
};

// Tạo slice để quản lý state và reducer cho checkinUserAll
const checkinUserAllReducer = createSlice({
  name: 'checkinUserAll',
  initialState,
  reducers: {
    updateService: (
      state,
      action: PayloadAction<{ userId: number; tourId: number; serviceId: number; updatedService: Service }>
    ) => {
      const { userId, tourId, serviceId, updatedService } = action.payload;
      const user = state.users.find(user => user.id === userId);
      const tour = user?.tours.find(tour => tour.id === tourId);
      if (tour) {
        const serviceIndex = tour.services.findIndex(service => service.id === serviceId);
        if (serviceIndex !== -1) tour.services[serviceIndex] = updatedService;
      }
    },
    removeService: (
      state,
      action: PayloadAction<{ userId: number; tourId: number; serviceId: number }>
    ) => {
      const { userId, tourId, serviceId } = action.payload;
      const user = state.users.find(user => user.id === userId);
      const tour = user?.tours.find(tour => tour.id === tourId);
      if (tour) {
        tour.services = tour.services.filter(service => service.id !== serviceId);
      }
    },
    addTour: (
      state,
      action: PayloadAction<{ userId: number; newTour: Tour }>
    ) => {
      const { userId, newTour } = action.payload;
      const user = state.users.find(user => user.id === userId);
      if (user) user.tours.push(newTour);
    },
    clearAllUserCheckin: (state) => {
      state.users = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUserCheckin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUserCheckin.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        console.log(action.payload);
        const groupedUsers: { [key: number]: any } = {};

      // Duyệt qua danh sách booking_tours
      const bookingTours = action.payload.booking?.booking_tours || [];
      bookingTours.forEach((tour: any) => {
        const ID = tour.id;
        const tourId = tour.tour_id;
        const tourName = tour.name_tour;
        const tourStart = tour.start_time;
        const tourEnd = tour.end_time;
        const tourPrice = parseFloat(tour.price || "0");
        const tourStatus = tour.status;
        const tourNote = tour.note;
        const BookingId = tour.booking_id;

        if(!tour.users) return;
        // Duyệt qua danh sách người dùng trong mỗi tour
        tour.users.forEach((user: any) => {

          if(!user.user_detail.passport) return;

          const userId = user.id;
          // Nếu user chưa tồn tại trong nhóm, khởi tạo
          if (!groupedUsers[userId]) {
            groupedUsers[userId] = {
              id: userId,
              fullname: user.fullname,
              phone: user.user_detail?.phone || "",
              address: user.user_detail?.address || "",
              passport: user.user_detail?.passport || "",
              birthday: user.user_detail?.birthday || "",
              user_active: user.booking_activities?.name ?? null,
              tours: [],
            };
          }

          // Thêm thông tin tour vào danh sách tours của user
          groupedUsers[userId].tours.push({
            id: ID,
            tour_id: tourId,
            name_tour: tourName,
            start_time: tourStart,
            end_time: tourEnd,
            price: tourPrice,
            status: tourStatus,
            note: tourNote,
            booking_id: BookingId,
            services: user.booking_tour_servicer_users.map((service: any) => ({
              id: service.id,
              service_id: service.service_id,
              name_service: service.service?.[0]?.name || "",
              price: parseFloat(service.price || "0"),
              quantity: service.quantity,
              unit: service.unit,
              start_time: service.start_time,
              end_time: service.end_time,
              status: service.status,
              note: service.note,
            })),
          });
        });
      });

      // Gán dữ liệu đã nhóm lại cho state.users
      state.users = Object.values(groupedUsers);
      console.log(state.users);
      })
      .addCase(getAllUserCheckin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Có lỗi xảy ra khi tải dữ liệu';
      });
  },
});

export const { 
  updateService, 
  removeService, 
  addTour,
  clearAllUserCheckin,
} = checkinUserAllReducer.actions;
export default checkinUserAllReducer.reducer;
