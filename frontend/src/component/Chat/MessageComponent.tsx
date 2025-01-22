import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getMessage } from "redux/API/GET/getMessage/GetMessage";
import { addMessage } from "redux/API/POST/CreateMessage";
import { RootState, useAppDispatch } from "redux/store";
import echo from "config/echo";
import { Button } from "antd";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { showModal } from "redux/Redux/modal/modalSlice";
import AddUser from "modal/Conversation/addUser";
import { setConversation } from "redux/Reducer/ConversationReducer";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { deleteConversation } from "redux/API/DELETE/DeleteConversation";

const MessageApp = ({ conversation }) => {
    const dispatch = useAppDispatch();
    const messages = useSelector((state: RootState) => state.ConversationReducer.messageList); // Lấy tin nhắn cho cuộc hội thoại
    const [content, setContent] = useState('');
    const conversationId = conversation.id;
    const staffLogin = JSON.parse(localStorage.getItem('user') || '{}');
    const staffLoginId = Number(staffLogin.id);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const msgTypeUser = 'user';

    useEffect(() => {
       const chanel = echo.private(`conversation.${conversationId}`)
       chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
       dispatch(setConversation(conversation.id));
        dispatch(getMessage(conversation.id));
        
        chanel.listen('MessageSent', (event)=>{
          dispatch(getMessage(conversation.id))// Thêm tin nhắn mới vào store
          chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
        }).error((error) => {
          console.error('Error with channel subscription:', error);
        });
    }, [conversation, dispatch]);

    const sendMessage = (e) => {
        const dataToSend = {
            content: content,
            user_id: staffLoginId,
          };
      
          try {
            dispatch(addMessage({
              conversationId: conversationId,
              dataMessages: dataToSend
            }));
            setContent('');  // Sau khi gửi tin nhắn, xóa nội dung
          } catch (err) {
            console.error('Lỗi gửi tin nhắn:', err);
          }
    };

    const handleModalAddUser = () => {
      dispatch(showModal('Modal Add User'));
    }

    const delConversation = (e: string) => {
      if (confirm("Bạn có chắc chắn muốn giải tát cuộc hội thoại này không?")) {
          dispatch(deleteConversation({id: e}));
      }
    }

    return (
        <div className="messageContainer">
            {messages ? (
              <>
                <div className="chatHeader">
                    <img
                      // src={messages.user.avatar}
                      // alt={`${messages.name}'s avatar`}
                      className="avatar"
                    />
                    <h3>{conversation.name}</h3>
                    <Button className='show-add-user' onClick={handleModalAddUser}><AiOutlineUsergroupAdd /></Button>
                    <div className="del-conversation" onClick={() => delConversation(conversationId)}><IoMdRemoveCircleOutline /></div>
                </div>
    
                <div className="messagesContainer">
                  {messages.map((msg, index) => (
                    msg.type ==  msgTypeUser 
                    ?<div
                        key={index}
                        className={`message ${
                          msg.user.id === staffLoginId ? 'right' : 'left'
                        }`}
                      >
                        <strong>{msg.user.fullname} - <em style={{color : 'gray'}}>{msg.user.branch.name}</em></strong><br />
                        <span>{msg.content}</span><br />
                        <span style={{ fontSize: '0.8em', color: 'gray' }}>{msg.created_at}</span>
                      </div> 
                      : <p className="messageSystem"><em>{msg.user.id === staffLoginId ? `Bạn ${msg.content}` : `${msg.user.fullname} ${msg.content}`}</em></p>
                  ))}
                  <div ref={chatContainerRef}></div>
                </div>
    
                <div className="inputContainer">
                  <input
                    type="text"
                    placeholder="Type a message"
                    className="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(e)}
                    required
                  />
                  <button type='submit' onClick={(e)=>sendMessage(e)} className="sendButton">
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="noChatSelected">
                <p>Select a chat to start messaging</p>
              </div>
            )}
          <AddUser idModal="Modal Add User" />
        </div> 
    );
}

export default MessageApp;