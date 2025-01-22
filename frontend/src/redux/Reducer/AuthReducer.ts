import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authLogin, authLogout } from 'redux/API/POST/AuthThunks';

// Định nghĩa kiểu dữ liệu cho người dùng
interface User {
    id: number;
    fullname: string;
    avatar: string | null;
    role: string[];
    branch_id: string;
    permissions: string[];
    token: string;
    // birthday: string;
    // address: string;
    // phone: string;
    // phone_relative: string;
    // passport: string;
}

// Định nghĩa trạng thái cho Redux
interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

// Trạng thái khởi tạo
const initialState: AuthState = {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
};

// Tạo slice cho xác thực
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            // Lưu token vào localStorage
            localStorage.setItem('token', action.payload);
        },
        clearUser: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(authLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(authLogin.fulfilled, (state, action) => {
                state.loading = false;

                // Lưu thông tin người dùng vào trạng thái
                state.user = {
                    ...action.payload,
                    permissions: action.payload.permissions || [],
                    // birthday: action.payload.birthday || '',
                    // address: action.payload.address || '',
                    // phone: action.payload.phone || '',
                    // phone_relative: action.payload.phone_relative || '',
                    // passport: action.payload.passport || '',
                };

                state.token = action.payload.token;

                // Lưu thông tin người dùng và token vào localStorage
                localStorage.setItem('user', JSON.stringify(state.user));
                localStorage.setItem('token', state.token);
            })
            .addCase(authLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(authLogout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(authLogout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;

                // Xóa thông tin người dùng và token khỏi localStorage
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            })
            .addCase(authLogout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Xử lý tự động khi lỗi xác thực 401 (Unauthorized)
            .addMatcher(
                (action) => action.type.endsWith('/rejected') && action.payload === 'Unauthorized',
                (state) => {
                    state.loading = false;
                    state.user = null;
                    state.token = null;

                    // Xóa thông tin khi gặp lỗi xác thực
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            );
    },
});

// Xuất các action và reducer
export const { setUser, setToken, clearUser } = authSlice.actions;
export default authSlice.reducer;
