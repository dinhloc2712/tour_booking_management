import { createAsyncThunk } from "@reduxjs/toolkit"; 
import { newFetchData } from "data/FetchApi"; 
import { Staff } from "redux/Reducer/StaffReducer";


export const updateStaff = createAsyncThunk(
    'staff/updateStaff', 
    async ({ id, body }: { id: string; body: Staff }, thunkAPI) => { 
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${newFetchData.staff}/${id}`, {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body), 
            });

            if (!response.ok) {
                const errorData = await response.json(); 
                if (response.status === 422) { 
                    return thunkAPI.rejectWithValue(errorData); 
                }
                throw new Error('Something went wrong'); 
            }

            const data = await response.json(); 
            return data;
        } catch (error: any) {
            if (error.name === 'AbortError') { 
                console.log('Request was aborted'); 
            } else {
                throw error;
            }
        }
    }
);
