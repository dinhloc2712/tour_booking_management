import { createSlice } from "@reduxjs/toolkit"

interface DarkMode {
    darkMode: boolean
}

const initialState: DarkMode = {
    darkMode: JSON.parse(localStorage.getItem('darkMode') || 'false')
}

const darkMode = createSlice({
    name: 'darkMode',
    initialState,
    reducers: {
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode
            localStorage.setItem('darkMode', JSON.stringify(state.darkMode))
        },
        setDarkMode: (state, action) => {
            state.darkMode = action.payload
            localStorage.setItem('darkMode', JSON.stringify(state.darkMode))
        }
    }
})

export const {toggleDarkMode, setDarkMode} = darkMode.actions
export default darkMode.reducer