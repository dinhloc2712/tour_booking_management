import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export interface ChangePasswordRequest {
    passwordCurrent: string;
    passwordNew: string;
    passwordNew_confirmation: string;
}

export interface ChangePasswordState {
    loading: boolean;
    success: boolean;
    error: string | null;
}

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (
      { passwordCurrent, passwordNew, passwordNew_confirmation }: ChangePasswordRequest,
      { rejectWithValue, getState }
    ) => {
      try {
        const state: any = getState();
        const token = state.auth.token; 
  
        const response = await fetch('http://127.0.0.1:8000/api/staff/changePassword', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 
          },
          body: JSON.stringify({
            passwordCurrent,
            passwordNew,
            passwordNew_confirmation,
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Something went wrong');
        }
  
        return await response.json();
      } catch (error: any) {
        return rejectWithValue(error.message || 'Network error');
      }
    }
  );
  

const initialState: ChangePasswordState = {
    loading: false,
    success: false,
    error: null,
};

const changePasswordSlice = createSlice({
    name: 'changePassword',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                state.error = null;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload as string;
            });
    },
});

export default changePasswordSlice.reducer;
