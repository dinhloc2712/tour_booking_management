import { createAsyncThunk } from "@reduxjs/toolkit"; 
import { newFetchData } from "data/FetchApi"; 
import { Conversation } from "redux/Reducer/ConversationReducer";
const token = localStorage.getItem('token')

export const updateConversation = createAsyncThunk(
    'conversation/updateConversation', 
    async ({ id, body }: { id: string; body: Conversation }, thunkAPI) => { 
        try {
            const response = await fetch(`${newFetchData.conversation}/${id}`, {
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
