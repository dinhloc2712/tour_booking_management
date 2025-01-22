<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{conversationId}', function (User $user, $conversationId) {
    return $user->canAccessConversation($conversationId);
});

Broadcast::channel('conversation', function($user){
    return $user->conversations();
});

Broadcast::channel('user', function($user){
    return $user;
});

Broadcast::routes(['middleware' => ['auth:api']]);

