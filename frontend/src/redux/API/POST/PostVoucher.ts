import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyPost, newFetchData } from "data/FetchApi";
import { Voucher } from "redux/Reducer/VoucherReducer";

export const addVoucher = createAsyncThunk<Voucher, Voucher>(
    'voucher/addVoucher',
    async (voucher: Voucher) => {
        const response = await fetch(newFetchData.voucher, bodyPost(voucher));

        if (response.ok) {
            const result = await response.json();
            if (result.status === "success") {
                return result.data;
            } else {
                throw new Error('Failed to add service');
            }
        } else {
            throw new Error('API Error');
        }
    }
);