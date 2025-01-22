<?php
namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationAdd implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;
    
    public $conversation;
    
    /**
     * Create a new event instance.
     *
     */
    public function __construct(Conversation $conversation)
    {
        $this->conversation = $conversation;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel
     */
    public function broadcastOn()
    {
        // Chỉ Broadcast vào channel của cuộc hội thoại
        return new Channel('private-conversation');
    }

    /**
     * Dữ liệu sẽ được broadcast khi sự kiện được phát
     * 
     * @return array
     */
    public function broadcastWith()
    {
        return [$this->conversation];
    }
}
