<?php

namespace App\Http\Controllers\API;

use App\Events\ConversationAdd;
use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\API\ConversationRequest;
use App\Http\Responses\BaseResponse;
use Illuminate\Http\Response as HttpResponse;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Faker\Provider\Base;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class ConversationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userId = Auth::user()->id;
        $conversations = Conversation::with(['users','latestMessage.user'])
            ->whereHas('users', fn($q) => $q->where('user_id', $userId))
            ->withCount(['messages as latest_message_time' => fn($query) => 
                $query->select('created_at')->latest('created_at')->take(1) // Lấy thời gian tin nhắn mới nhất
            ])
            ->orderByDesc('latest_message_time') // Sắp xếp theo thời gian tin nhắn mới nhất
            ->get();
        
        return BaseResponse::success($conversations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ConversationRequest $request)
    {
        try{
            $staff = Auth::user();
            if($staff->hasAnyRole(['admin', 'admin_branch'])){
            $userIds = $request->user_ids;
            $userIds[] = $staff->id;
            $conversation = Conversation::create([
                'name' => $request->type == 'group' ? $request->name : null,
                'type' => $request->type,
            ]);
    
            // Thêm người dùng vào cuộc trò chuyện
            $conversation->users()->attach($userIds);

            broadcast(new ConversationAdd($conversation))->toOthers();

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'type' => 'system',
                'content' => "đã tạo nhóm",
                'user_id' => $staff->id,
            ]);

            broadcast(new MessageSent($message))->toOthers();
    
            return BaseResponse::success($conversation, 'Thêm cuộc trò chuyện thành công', HttpResponse::HTTP_CREATED);
            }else{
                return BaseResponse::error('Chỉ có admin hoặc admin chi nhánh mới được tạo cuộc hội thoại', 403);
            }
        }
        catch (\Throwable $th) {
            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR); //Lỗi 500 không xác định
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $conversation = Conversation::with('users')->find($id);

        if(empty($conversation)){
            return BaseResponse::error('Không tìm thấy cuộc hội thoại', 404);
        }

        return BaseResponse::success($conversation, 'thông tin cuộc hội thoại', 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $staff = Auth::user();
            if($staff->hasAnyRole(['admin', 'admin_branch'])){
                $data = $request->except('add_user_ids', 'del_user_ids');
                $conversation = Conversation::find($id);
                if(empty($conversation)){
                    return BaseResponse::error('Không tìm thấy cuộc hội thoại', 404);
                }
                if(!empty($data)){
                    $conversation->update($data);
                    $message = Message::create([
                        'conversation_id' => $id,
                        'type' => 'system',
                        'content' => "đã cập nhập tên nhóm thành ". $conversation->name,
                        'user_id' => $staff->id,
                    ]);

                    broadcast(new MessageSent($message))->toOthers();
                }
        
                if($request->has('add_user_ids')){
                    $conversation->users()->attach($request->add_user_ids);
                    foreach($request->add_user_ids as $user_id){
                        $user = User::find($user_id);
                        $message = Message::create([
                            'conversation_id' => $id,
                            'type' => 'system',
                            'content' => "đã thêm: $user->fullname",
                            'user_id' => $staff->id,
                        ]);

                        broadcast(new MessageSent($message))->toOthers();
                    }
                }
        
                if($request->has('del_user_ids')){
                    $conversation->user()->detach($request->del_user_ids);
                    foreach($request->add_user_ids as $user_id){
                        $user = User::find($user_id);
                        $message = Message::create([
                            'conversation_id' => $id,
                            'type' => 'system',
                            'content' => "đã kích: $user->fullname",
                            'user_id' => $staff->id,
                        ]);

                        broadcast(new MessageSent($message))->toOthers();
                    }
                }
        
                return BaseResponse::success($conversation, 'cập nhật cuộc hội thoại thành công', '201');
            }else{
                return BaseResponse::error('Chỉ có admin hoặc admin chi nhánh mới được sửa', 403);

            }
        } catch (ModelNotFoundException $e) {

            return BaseResponse::error('Không tìm thấy cuộc hội thoại', HttpResponse::HTTP_NOT_FOUND); // lỗi 404 Không tìm thấy tài khoản

        } catch (Throwable $th) {

            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR); //Lỗi 500 kết nối server

        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try{
            if(Auth::user()->hasAnyRole(['admin', 'admin_branch'])){
                Conversation::findOrFail($id)->delete();
                $conversation = Conversation::first();
                broadcast(new ConversationAdd($conversation))->toOthers();
    
                BaseResponse::success('', 'Xóa thành công', 202);
            }else{
                return BaseResponse::error('Chỉ có admin hoặc admin chi nhánh mới được sửa', 403);
            }
            
        } catch (ModelNotFoundException $e) {

            return BaseResponse::error('Không tìm thấy cuộc hội thoại', HttpResponse::HTTP_NOT_FOUND); // lỗi 404 Không tìm thấy tài khoản

        } catch (Throwable $th) {

            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR); //Lỗi 500 kết nối server

        }
    }
}
