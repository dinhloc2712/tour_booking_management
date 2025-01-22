import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import SourceAgent from "layout/Source/SourceAgent/SourceAgent";
import { deleteSource } from "redux/API/DELETE/DeleteSource";
import { getSourceAgent } from "redux/API/GET/GetSourceAgent";
import { addSourceAgent } from "redux/API/POST/PostSourceAgent";
import { updateSourceAgent } from "redux/API/PUT/EditSourceAgent";

export interface SourceAgent {
    id: string,
    name: string,
    email: string,
    phone: string,
    address: string,
    type: string,
    is_active: boolean;
}

interface SourceState {
    sourceList: SourceAgent[];
    editingSource: SourceAgent | null;
    loading: boolean;
    error: string | null;
}

const initialState: SourceState = {
    sourceList: [],
    editingSource: null,
    loading: false,
    error: null
}

const sourceReducerAgent = createSlice({
    name: 'sourceAgent',
    initialState,
    reducers: {
        startEditingSourceAgent: (state, action: PayloadAction<string>) => {
            const sourceAgentId = action.payload
            const foundSource = state.sourceList.find((sourceAgent) => sourceAgent.id === sourceAgentId) || null
            state.editingSource = foundSource
        },
    },
    extraReducers(builder) {
        builder
            .addCase(getSourceAgent.pending, (state) => { })
            .addCase(getSourceAgent.fulfilled, (state, action: PayloadAction<SourceAgent[]>) => {
                state.sourceList = action.payload
            })
            .addCase(getSourceAgent.rejected, (state) => { })

            .addCase(addSourceAgent.pending, (state) => {
                state.loading = true
            })
            .addCase(addSourceAgent.fulfilled, (state, action: PayloadAction<SourceAgent>) => {
                state.loading = false;
                state.sourceList.push(action.payload);
            })
            .addCase(addSourceAgent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Không thể thêm nguồn";
            })
            .addCase(updateSourceAgent.fulfilled, (state, action) => {
                state.sourceList.find((Source, index) => {
                    if (Source.id === action.payload.id) {
                        state.sourceList[index] = action.payload
                        return true
                    }
                    return false
                })
                state.editingSource = null
            })
            .addCase(updateSourceAgent.rejected, (state, action) => {
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
export const { startEditingSourceAgent } = sourceReducerAgent.actions
export default sourceReducerAgent.reducer

