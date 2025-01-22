<?php

namespace App\Http\Controllers\API;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\API\MessageRequest;
use App\Http\Responses\BaseResponse;
use App\Models\Message;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($conversationId)
    {
        $messages = Message::where('conversation_id', $conversationId)
        ->with('user.branch')
        ->oldest('id')
        ->get();

        return BaseResponse::success($messages);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MessageRequest $request, $conversationId)
    {
        try{
            $message = Message::create([
                'conversation_id' => $conversationId,
                'user_id' => $request->user_id,
                'content' => $request->content,
            ]);

            broadcast(new MessageSent($message))->toOthers();

            return BaseResponse::success($message, 'nhắn tin thành công', HttpResponse::HTTP_CREATED);
        }catch (\Throwable $th) {
            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR); //Lỗi 500 không xác định
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
