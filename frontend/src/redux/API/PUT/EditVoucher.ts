import { createAsyncThunk } from "@reduxjs/toolkit";
import { newFetchData } from "data/FetchApi";
import { Voucher } from "redux/Reducer/VoucherReducer";


export const updateVoucher = createAsyncThunk(
    'voucher/updatevoucher',
    async ({ id, body }: { id: string; body: Voucher }, thunkAPI) => {
        try {
            const response = await fetch(`${newFetchData.voucher}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 422) {
                    return thunkAPI.rejectWithValue(errorData);
                }
                throw new Error('Something went wrong');
            }
            const data = await response.json();
            return data;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Request was aborted');
            } else {
                throw error;
            }
        }
    }
);
