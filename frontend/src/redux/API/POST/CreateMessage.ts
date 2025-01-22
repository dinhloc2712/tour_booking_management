import { createAsyncThunk } from "@reduxjs/toolkit";
import { message } from "antd";
import { bodyPost, newFetchData } from "data/FetchApi";
import { Conversation, Message } from "redux/Reducer/ConversationReducer"; 

export const addMessage = createAsyncThunk(
    'message/addMessage',
    async ({conversationId, dataMessages}:{conversationId: Number,dataMessages: Message}) => {       
        const response = await fetch(`${newFetchData.message}/${conversationId}`, bodyPost(dataMessages));
        if( response.ok ){
            const result = await response.json();
            if(result.status === "success"){
                return result.data;
            } else {
                throw new Error('Failes to add Message');
            }
        } else{
            throw new Error('Lỗi server');
        }
    }
)