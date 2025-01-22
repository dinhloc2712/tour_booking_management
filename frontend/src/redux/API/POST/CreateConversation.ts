import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyPost, newFetchData } from "data/FetchApi";
import { Conversation } from "redux/Reducer/ConversationReducer";

export const AddConversation = createAsyncThunk<Conversation, Conversation>(
    'conversation/addConversation',
    async (conversation: Conversation) => {
        const response = await fetch(newFetchData.conversation, bodyPost(conversation));
        if(response.ok){
            const result = await response.json();
            if(result.status === "success"){
                return result.data;
            } else{
                throw new Error('Failed to add conversation');
            }
        }else{
            throw new Error('lỗi server');
        }
    }
)