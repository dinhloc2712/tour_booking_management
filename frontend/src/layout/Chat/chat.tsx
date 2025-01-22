import ConversationComponent from 'component/Chat/ConversationComponent';
import MessageComponent from 'component/Chat/MessageComponent';
import { useEffect, useState } from 'react';

const Conversation: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<[id:any, name:any, type:any]|null>(null);
  

  return (
    <div id="conversationContainer">
      <ConversationComponent setActiveConversation={setActiveConversation}
      activeConversation={activeConversation} />     
      {activeConversation && <MessageComponent conversation={activeConversation} />} 
    </div>
  );
};

export default Conversation;