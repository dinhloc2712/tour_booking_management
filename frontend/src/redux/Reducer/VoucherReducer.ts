import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import Voucher from "layout/Voucher/Voucher";
import { deleteVoucher } from "redux/API/DELETE/DeleteVoucher";
import { getVoucherList } from "redux/API/GET/GetVoucher";
import { addVoucher } from "redux/API/POST/PostVoucher";
import { updateVoucher } from "redux/API/PUT/EditVoucher";
import { checkVoucherTour } from "redux/API/POST/CheckVocherTour";

export interface Voucher {
    id: string;
    code: string;
    object_type: string,
    object_ids?: string[];
    description: string;
    type: string;
    value: string;
    quantity: string;
    start_time: string | null; // Cho phép null
    end_time: string | null;   // Cho phép null
    is_active: boolean;
    date_range?: [moment.Moment | null, moment.Moment | null];

}

interface VoucherState {
    voucherList: Voucher[];
    editingVoucher: Voucher | null;
    checkedVoucherTourResult: any;
    loading: boolean;
    error: string | null;
}

const initialState: VoucherState = {
    voucherList: [],
    editingVoucher: null,
    checkedVoucherTourResult: null,
    loading: false,
    error: null
}

const VoucherReducer = createSlice({
    name: 'voucher',
    initialState,
    reducers: {
        startEditingVoucher: (state, action: PayloadAction<string>) => {
            const voucherID = action.payload
            const foundVoucher = state.voucherList.find((voucher) => voucher.id === voucherID) || null
            state.editingVoucher = foundVoucher
          },
        clearCheckedVoucherTourResult: (state) => {
            state.checkedVoucherTourResult = null
        }
    },
    extraReducers(builder) {
        builder
            .addCase(getVoucherList.pending, (state) => { })
            .addCase(getVoucherList.fulfilled, (state, action) => {
                state.voucherList = action.payload
            })
            .addCase(getVoucherList.rejected, (state) => { })

            .addCase(addVoucher.pending, (state) => {
                state.loading = true
            })
            .addCase(addVoucher.fulfilled, (state, action: PayloadAction<Voucher>) => {
                state.loading = false;
                state.voucherList.push(action.payload);
            })
            .addCase(addVoucher.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Không thể thêm Khuyến Mại";
            })

            .addCase(updateVoucher.fulfilled, (state, action) => {
                state.voucherList.find((voucher, index) => {
                  if (voucher.id === action.payload.id) {
                    state.voucherList[index] = action.payload
                    return true
                  }
                  return false
                })
                state.editingVoucher = null
              })
              .addCase(updateVoucher.rejected, (state, action) => {
                state.error = action.payload as string;
                state.loading = false;
              })
              .addCase(deleteVoucher.fulfilled, (state, action) => {
                state.voucherList = state.voucherList.filter(Voucher => Voucher.id !== action.payload);
              })
              .addCase(deleteVoucher.rejected, (state, action) => {
                console.error(action.payload); // Handle error state if needed
              })

              .addCase(checkVoucherTour.pending, (state)=>{
                state.loading = true;
                state.checkedVoucherTourResult = null;
              })
              .addCase(checkVoucherTour.fulfilled, (state, action)=>{
                state.loading = false;
                state.checkedVoucherTourResult = action.payload;
              })
              .addCase(checkVoucherTour.rejected, (state, action)=>{
                state.loading = false;
                state.error = typeof action.payload === 'string' ? action.payload : action.error.message || 'Failed to check voucher';
              });

    },
});
export const { startEditingVoucher, clearCheckedVoucherTourResult } = VoucherReducer.actions
export default VoucherReducer.reducer