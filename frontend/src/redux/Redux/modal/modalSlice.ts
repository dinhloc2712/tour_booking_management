import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface modalState {
    modals: { [key: string]: boolean };
}

const initialState: modalState = {
    modals: {},
}

const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        showModal(state, action: PayloadAction<string>) {
            state.modals[action.payload] = true;
        },
        hideModal(state, action: PayloadAction<string>) {
            state.modals[action.payload] = false;
        },
    }
})



export const { showModal, hideModal } = modalSlice.actions

export default modalSlice.reducer


