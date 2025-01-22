import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { deleteSource } from "redux/API/DELETE/DeleteSource";
import { GetSourceService } from "redux/API/GET/GetSourceService";
import { addSource } from "redux/API/POST/PostSource";
import { updateSource } from "redux/API/PUT/EditSource";

export interface SourceService {
    id: string,
    name: string,
    email: string,
    phone: string,
    address: string,
    type: string,
    is_active: boolean;
}

interface SourceState {
    sourceList: SourceService[];
    editingSource: SourceService | null;
    loading: boolean;
    error: string | null;
}

const initialState: SourceState = {
    sourceList: [],
    editingSource: null,
    loading: false,
    error: null
}

const sourceReducer = createSlice({
    name: 'source',
    initialState,
    reducers: {
        startEditingSource: (state, action: PayloadAction<string>) => {
            const sourceId = action.payload
            const foundSource = state.sourceList.find((source) => source.id === sourceId) || null
            state.editingSource = foundSource
        },
    },
    extraReducers(builder) {
        builder
            .addCase(GetSourceService.pending, (state) => { })
            .addCase(GetSourceService.fulfilled, (state, action: PayloadAction<SourceService[]>) => {
                state.sourceList = action.payload
            })
            .addCase(GetSourceService.rejected, (state) => { })

            .addCase(addSource.pending, (state) => {
                state.loading = true
            })
            .addCase(addSource.fulfilled, (state, action: PayloadAction<SourceService>) => {
                state.loading = false;
                state.sourceList.push(action.payload);
            })
            .addCase(addSource.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Không thể thêm nguồn";
            })
            .addCase(updateSource.fulfilled, (state, action) => {
                state.sourceList.find((Source, index) => {
                    if (Source.id === action.payload.id) {
                        state.sourceList[index] = action.payload
                        return true
                    }
                    return false
                })
                state.editingSource = null
            })
            .addCase(updateSource.rejected, (state, action) => {
                state.error = action.payload as string;
                state.loading = false;
            })
            .addCase(deleteSource.fulfilled, (state, action) => {
                state.sourceList = state.sourceList.filter(service => service.id !== action.payload);
            })
            .addCase(deleteSource.rejected, (state, action) => {
                console.error(action.payload);
            })
    },

});
export const { startEditingSource } = sourceReducer.actions
export default sourceReducer.reducer

