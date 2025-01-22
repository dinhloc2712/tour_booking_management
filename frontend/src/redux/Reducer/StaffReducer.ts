import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { deleteStaff } from "redux/API/DELETE/DeleteStaff";
import { getStaff } from "redux/API/GET/GetStaff";
import { addStaff } from "redux/API/POST/PostStaff";

export interface Staff {
    id: string,
    branch_id: string,
    branch:{
        name: any,
    }
    fullname: string,
    email: string,
    avatar: string,
    roles: string,
    password: string,
    is_active: boolean,

}

interface StaffState {
    staffList: Staff[];
    editingStaff: Staff | null;
    loading: boolean;
    error: string | null;
}

const initialState: StaffState = {
    staffList: [],
    editingStaff:null,
    loading: false,
    error: null
}
const staffReducer = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        startEditingStaff: (state, action: PayloadAction<string>) => {
            const staffID = action.payload
            const foundStaff = state.staffList.find((staff) => staff.id === staffID) || null
            state.editingStaff = foundStaff
        },
    },
    extraReducers(builder) {
        builder
            .addCase(getStaff.pending, (state) => { })
            .addCase(getStaff.fulfilled, (state, action) => {
                state.staffList = action.payload
            })
            .addCase(getStaff.rejected, (state) => { })

            .addCase(addStaff.pending, (state) => {
                state.loading = true
            })
            .addCase(addStaff.fulfilled, (state, action: PayloadAction<Staff>) => {
                state.loading = false;
                state.staffList.push(action.payload);
            })
            .addCase(addStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Không thể thêm tài khoản";
            })
            .addCase(deleteStaff.fulfilled, (state, action) => {
                state.staffList = state.staffList.filter(staff => staff.id !== action.payload);
            })
            .addCase(deleteStaff.rejected, (state, action) => {
                console.error(action.payload); // Handle error state if needed
            });
    },
});
export const { startEditingStaff } = staffReducer.actions
export default staffReducer.reducer