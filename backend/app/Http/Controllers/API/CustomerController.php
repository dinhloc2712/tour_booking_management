<?php

namespace App\Http\Controllers\API;

use App\Events\Logout;
use App\Http\Controllers\BaseController;
use App\Http\Responses\BaseResponse;
use App\Models\Bill;
use App\Models\BookingTour;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Throwable;

class CustomerController extends BaseController
{

    protected $model;

    public function __construct()
    {
        $this->model = User::class;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $roleName = 'customer'; // Vai trò mà bạn muốn loại trừ
            $data = User::with(['branch:id,name','userDetail'])
                ->whereHas('roles', function ($query) use ($roleName) {
                    $query->where('name', $roleName); //lệnh lấy dữ diệu loại có roles customer
                })
                ->latest('id')->get();

            return BaseResponse::success($data, 'Danh sách khách hàng', HttpResponse::HTTP_OK);
        } catch (Throwable $th) {
            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR); //500 lỗi truy cập dữ liệu
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        try {
            $data = User::with(['userDetail', 'branch', 'bookingsTourServiceUser.service'])->find($id);

            $bills = Bill::with(['billTours', 'billServices'])->where('customer_id', $id)->get();
            if(empty($data)){
                return BaseResponse::error('Không tìm thấy thông tin khách hàng', HttpResponse::HTTP_NOT_FOUND);
            }

            $bookingToursUsed = BookingTour::whereJsonContains('customer_ids', $id)->where('status', BookingTour::STATUS_ENDED)->get();
            $bookingToursInUse = BookingTour::whereJsonContains('customer_ids', $id)->where('status', BookingTour::STATUS_IS_MOVING)->get();
            
            $data->bookingToursUsed = $bookingToursUsed;
            $data->bookingToursInUser = $bookingToursInUse;

            return BaseResponse::success($data, 'Thông tin khách hàng', HttpResponse::HTTP_OK);
        } catch (Throwable $th) {
            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR); // lỗi kết nối server 500
        }
    }

    public function searchPassPort(Request $request){
        try{
            $value = $request->passport;
            $data = $this->model::with('userDetail')->whereHas('userDetail',
            function ($query) use ($value){
                $query->where('passport', $value);
            })->first();
            
            if(empty($data)){
                return BaseResponse::error('Không có thông tin khách hàng', HttpResponse::HTTP_NOT_FOUND);
            };

            return BaseResponse::success($data, 'Thông tin khách hàng', HttpResponse::HTTP_OK);
        }catch(Throwable $th){
            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
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

    public function lock(string $id){
        $user = $this->model::find($id);
        if(empty($user)){
            return BaseResponse::error('không tìm thấy thông tin', 404);
        }
        $user->is_active = false;
        $user->save();
        broadcast(new Logout($user))->toOthers();

        return BaseResponse::success($user, 'tài khoản đã khóa', 201);
    }

    public function unlock(string $id){
        $user = $this->model::find($id);
        if(empty($user)){
            return BaseResponse::error('không tìm thấy thông tin', 404);
        }

        $user->is_active = true;
        $user->save();
        return BaseResponse::success($user, 'tài khoản đã mở khóa', 201);
    }
}
