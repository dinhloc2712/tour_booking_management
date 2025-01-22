import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyPost, newFetchData } from 'data/FetchApi';

interface Data {
    id: number;
    fullname: string;
    avatar: string | null;
    email: string | null;
    role: string[];
    branch_id: string;
    token: string;
    permissions: string[];
    userDetail: {
        birthday: string;
        address: string;
        phone: string;
        phone_relative: string;
        passport: string;
    };
}

interface ApiResponse {
    status: string;
    message: string;
    data: Data;
}

interface LoginParams {
    email: string;
    password: string;
}

interface User {
    id: number;
    fullname: string;
    avatar: string | null;
    email: string | null;
    role: string[];
    branch_id: string;
    permissions: string[];
    token: string;
    birthday: string;
    address: string;
    phone: string;
    phone_relative: string;
    passport: string;
}

export const authLogin = createAsyncThunk<User, LoginParams, { rejectValue: string }>(
    'auth/login',
    async ({ email, password }, thunkAPI) => {
        if (!email || !password) {
            return thunkAPI.rejectWithValue('Email và mật khẩu không được để trống');
        }

        try {
            const response = await fetch(newFetchData.login, bodyPost({ email, password }));

            if (!response.ok) {
                const errorData = await response.json();
                return thunkAPI.rejectWithValue(errorData.message || 'Đăng nhập thất bại');
            }

            const data: ApiResponse = await response.json();
            const { id, fullname, avatar, role, branch_id, token, permissions, userDetail } = data.data;

            // Kiểm tra nếu userDetail là null
            const {
                birthday = '',
                address = '',
                phone = '',
                phone_relative = '',
                passport = '',
            } = userDetail || {};

            // Lưu thông tin người dùng vào localStorage
            localStorage.setItem(
                'user',
                JSON.stringify({
                    id,
                    fullname,
                    avatar,
                    email,
                    role,
                    branch_id,
                    permissions,
                    birthday,
                    address,
                    phone,
                    phone_relative,
                    passport,
                })
            );
            localStorage.setItem('token', token);

            return {
                id,
                fullname,
                avatar,
                email,
                role,
                branch_id,
                token,
                permissions,
                birthday,
                address,
                phone,
                phone_relative,
                passport,
            };

        } catch (error) {
            return thunkAPI.rejectWithValue('Đăng nhập thất bại');
        }
    }
);




export const authLogout = createAsyncThunk<void, void, { rejectValue: string }>(
    'auth/logout',
    async (_, thunkAPI) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return thunkAPI.rejectWithValue('Token không tồn tại');
            }

            const response = await fetch(newFetchData.logout, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log('Lỗi từ API:', errorData);
                return thunkAPI.rejectWithValue(errorData.message || "Đăng xuất thất bại");
            }

            localStorage.removeItem('user');
            localStorage.removeItem('token');
            console.log('Đăng xuất thành công');
        } catch (error) {
            console.log('Lỗi kết nối:', error);
            return thunkAPI.rejectWithValue('Không kết nối tới API');
        }
    }
);