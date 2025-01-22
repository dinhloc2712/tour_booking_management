// redux/Reducer/SearchReducer.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
    query: string;
}

const initialState: SearchState = {
    query: '',
};

const SearchReducer = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.query = action.payload;
        },
    },
});

export const { setSearchQuery } = SearchReducer.actions;
export default SearchReducer.reducer;
