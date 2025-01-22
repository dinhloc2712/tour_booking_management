import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ObjectState {
    objectType: string | null;
    objectList: Array<{ id: string; name: string }>;
    loading: boolean;
    error: string | null;
}

const initialState: ObjectState = {
    objectType: null,
    objectList: [],
    loading: false,
    error: null,
};

const objectSlice = createSlice({
    name: 'object',
    initialState,
    reducers: {
        setObjectType(state, action: PayloadAction<string>) {
            state.objectType = action.payload;
        },
        setObjectList(state, action: PayloadAction<Array<{ id: string; name: string }>>) {
            state.objectList = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        resetState(state) {
            state.objectType = null;
            state.objectList = [];
            state.loading = false;
            state.error = null;
        },
    },
});

export const { setObjectType, setObjectList, setLoading, setError, resetState } = objectSlice.actions;

export default objectSlice.reducer;
