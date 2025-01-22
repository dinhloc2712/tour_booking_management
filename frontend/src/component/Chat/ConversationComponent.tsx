import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getConversation } from 'redux/API/GET/getMessage/GetConversation'; // Giả sử bạn có action này để lấy cuộc hội thoại
import { RootState, useAppDispatch } from 'redux/store';
import { Button } from 'antd';
import { MdAddComment } from 'react-icons/md';
import AddConversations from 'modal/Conversation/addConversation';
import { showModal } from 'redux/Redux/modal/modalSlice';
import echo from 'config/echo';

const ChatApp = ({ setActiveConversation, activeConversation })  => {
  const dispatch = useAppDispatch();
  const conversations = useSelector((state: RootState) => state.ConversationReducer.conversationList); // Lấy danh sách cuộc hội thoại

  
  const staffLogin = JSON.parse(localStorage.getItem('user') || '{}');
  const staffLoginId = Number(staffLogin.id);

  // Khi trang load, lấy cuộc hội thoại đầu tiên và các tin nhắn
  useEffect(() => {
    // Lấy danh sách cuộc hội thoại nếu chưa có
    const chanel = echo.private(`conversation`)

    chanel.listen('ConversationAdd', (event) => {
      dispatch(getConversation());
    })
    dispatch(getConversation());
  }, [dispatch]);

  const handleModalAddConversation = () => {
    dispatch(showModal('Modal Conversation'));
  }


  return (
      <div className="sidebar">
        <div className='sidebarHeader'>
          <h3 className="">Message</h3>
          <Button className='show-add-conver' onClick={handleModalAddConversation}><MdAddComment /></Button>
        </div>
        <div className="sidebarContent">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversationItem ${
                activeConversation && activeConversation.id === conversation.id ? 'selected' : ''              
              }`}
              onClick={() => setActiveConversation(conversation)}
            >
              <img
                src={''}
                // alt={`${conversation.name}'s avatar`}
                className="avatar"
              />
              <div>
                <h5 className="conversationName">{conversation.name}<br />
                <span className='conversationContent'>
                  { conversation.latest_message?
                  staffLoginId == conversation.latest_message.user_id 
                  ? `Bạn: ${conversation.latest_message.content}` 
                  : `${conversation.latest_message.user.fullname}: ${conversation.latest_message.content}` 
                  : ''}
                </span></h5> 
              </div>
            </div>
          ))}
        </div>
       
      <AddConversations idModal="Modal Conversation" />
      </div>
  );
};

export default ChatApp;

