import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { getCustomer } from "redux/API/GET/GetCustomer";

export interface Customer {
    id: string,
    branch_id: string,
    fullname: string,
    phone: string,
    avatar: string,
    roles: string,
    password: string,
    is_active: boolean,

}

interface CustomerState {
    customerList: Customer[];
    //editingStaff: Staff | null;
    loading: boolean;
    error: string | null;
}

const initialState: CustomerState = {
    customerList: [],
    //editingStaff:null,
    loading: false,
    error: null
}
const customerReducer = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        // startEditingStaff: (state, action: PayloadAction<string>) => {
        //     const staffID = action.payload
        //     const foundStaff = state.staffList.find((staff) => staff.id === staffID) || null
        //     state.editingStaff = foundStaff
        // },
    },
    extraReducers(builder) {
        builder
            .addCase(getCustomer.pending, (state) => { })
            .addCase(getCustomer.fulfilled, (state, action) => {
                state.customerList = action.payload
            })
            .addCase(getCustomer.rejected, (state) => { })

            // .addCase(addStaff.pending, (state) => {
            //     state.loading = true
            // })
            // .addCase(addStaff.fulfilled, (state, action: PayloadAction<Staff>) => {
            //     state.loading = false;
            //     state.staffList.push(action.payload);
            // })
            // .addCase(addStaff.rejected, (state, action) => {
            //     state.loading = false;
            //     state.error = action.error.message || "Không thể thêm tài khoản";
            // })
            // .addCase(deleteCustomer.fulfilled, (state, action) => {
            //     state.customerList = state.customerList.filter(staff => staff.id !== action.payload);
            // })
            // .addCase(deleteCustomer.rejected, (state, action) => {
            //     console.error(action.payload); // Handle error state if needed
            // });
    },
});
// export const { startEditingStaff } = staffReducer.actions
export default customerReducer.reducer