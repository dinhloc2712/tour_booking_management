import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getConversation } from "redux/API/GET/getMessage/GetConversation";
import { getMessage } from "redux/API/GET/getMessage/GetMessage";
import { getOneConversation } from "redux/API/GET/getMessage/GetOneConversation";
export interface Conversation {
    id: any,
    name: any,
    type: any,
    user_ids: [],
    add_user_ids: any,
    del_user_ids: any,
    users: [{
        id: string,
        fullname:any,
    }]
    latest_message: {
        id: any,
        user_id: any,
        content: any,
        user: {
            fullname: any,
        }
    }
};

export interface Message{
    id: any,
    conversation_id: any,
    type: any,
    user_id: any,
    content: any,
    created_at: any,
    user: {
        id: any,
        fullname:any,
        branch:{
            name:any,
        }
    }
}

interface ConversationState {
    conversationList: Conversation[]; 
    messageList: Message[];
    conversation: Conversation | null;
    loading: boolean;
    error: string | null;
};



const initialState: ConversationState = {
    conversationList: [],
    conversation: null,
    messageList: [],
    loading: false,
    error: null,
};

const ConversationReducer = createSlice({
    name: 'conversation',
    initialState,
    reducers: {
        setConversation: (state, action: PayloadAction<number>) => {
            const conversationId = action.payload;
            state.conversation = state.conversationList.find((conversation) => conversation.id === conversationId) || null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getConversation.pending, (state) => {
                state.loading = true;
            })

            .addCase(getConversation.fulfilled, (state, action) => {
                state.conversationList = action.payload;
                state.loading = false;
            })

            .addCase(getConversation.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to fetch conversation';
                state.loading = false;
            })

            .addCase(getMessage.pending, (state) => {
                state.loading = true;
            })

            .addCase(getMessage.fulfilled, (state, action) => {
                state.messageList = action.payload;
                state.loading = false;
            })

            .addCase(getMessage.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to fetch message';
                state.loading = false;
            })
    }
})

export const { setConversation } = ConversationReducer.actions
export default ConversationReducer.reducer;