import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { checkPassport } from "redux/API/POST/CheckPassport";

export interface Passport {
    id: any | null;
    fullname: string | null;
}

export interface UserDetails {
    passport: string | null;
    address: string | null;
    phone: string | null;
}
interface PassportState {
    currentPassport: Passport | null;
    currentUserDetails: UserDetails | null;  
    loading: boolean;
    error: string | null;
}

// Khởi tạo state ban đầu
const initialState: PassportState = {
    currentPassport: null,
    currentUserDetails: null, 
    loading: false,
    error: null,
};

// Tạo slice cho PassportReducer
const PassportReducer = createSlice({
    name: "passport",
    initialState,
    reducers: {
        clearPassportData: (state) => {
            state.currentPassport = null;
            state.currentUserDetails = null; 
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkPassport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkPassport.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                const passportData = action.payload;  
                state.currentPassport = {
                    id: passportData?.id || null,
                    fullname: passportData?.fullname || null,
                };
                state.currentUserDetails = {
                    passport: passportData?.user_detail?.passport || null,
                    address: passportData?.user_detail?.address || null,
                    phone: passportData?.user_detail?.phone || null,
                };
            })
            .addCase(checkPassport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Có lỗi xảy ra';
            });
    },
});


export const { clearPassportData } = PassportReducer.actions;
export default PassportReducer.reducer;
