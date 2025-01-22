<?php
namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;
    
    public $message;
    
    /**
     * Create a new event instance.
     *
     * @param Message $message
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel
     */
    public function broadcastOn()
    {
        // Chỉ Broadcast vào channel của cuộc hội thoại
        return new Channel('private-conversation.' . $this->message->conversation_id);
    }

    /**
     * Dữ liệu sẽ được broadcast khi sự kiện được phát
     * 
     * @return array
     */
    public function broadcastWith()
    {
        $this->message->user;
        return [$this->message];
    }
}
