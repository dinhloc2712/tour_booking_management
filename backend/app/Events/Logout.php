<?php
namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class Logout implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;
    
    public $user;
    
    /**
     * Create a new event instance.
     *
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel
     */
    public function broadcastOn()
    {
        // Chỉ Broadcast vào channel của cuộc hội thoại
        return new Channel('private-user');
    }

    /**
     * Dữ liệu sẽ được broadcast khi sự kiện được phát
     * 
     * @return array
     */
    public function broadcastWith()
    {
        return [$this->user];
    }
}
