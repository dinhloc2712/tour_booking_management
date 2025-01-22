<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\ChangePasswordRequest;
use App\Http\Requests\API\StaffRequest;
use App\Http\Requests\API\UpdateStaffRequest;
use App\Http\Responses\BaseResponse;
use App\Models\Booking;
use App\Models\BookingActivity;
use App\Models\Branch;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Throwable;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        try {
            $roleName = 'customer'; // Vai trò mà bạn muốn loại trừ
            $crurentId = Auth::user()->id;
            $data = User::with(['branch:id,name', 'roles:name', 'userDetail'])
                ->whereHas('roles', function ($query) use ($roleName) {
                    $query->where('name', '<>', $roleName); //lệnh lấy dữ diệu loại có roles khác customer
                })
                ->where('id', '<>', $crurentId)
                ->latest('id')->get();

            return BaseResponse::success($data, 'Danh sách nhân viên', HttpResponse::HTTP_OK);
        } catch (Throwable $th) {
            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR); //500 lỗi truy cập dữ liệu
        }
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            $roles = [
                User::TYPE_ACCOUNTANT,
                User::TYPE_ADMIN_BRANCH,
                User::TYPE_GUIDE,
                User::TYPE_RECEPTIONIST,
                User::TYPE_SALE
            ];
            $branches = Branch::get();
            return BaseResponse::success(['roles' => $roles, 'branches' => $branches]);
        } catch (Throwable $th) {
            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StaffRequest $request)
    {
        DB::beginTransaction();
        try {

            $data = $request->except('roles', 'password');
            $data['password'] = bcrypt($request['password']);

            $staff = User::create($data);
            $staff->assignRole($request['roles']);
            if($request->has('user_detail')){
                $userDetail = $data['user_detail'];
                $userDetail['user_id'] = $staff->id;
                UserDetail::created($userDetail);
            }else{
                $userDetail['user_id'] = $staff->id;
                UserDetail::create($userDetail);
            }
            DB::commit();
            return BaseResponse::success($staff, 'Thêm tài khoản nhân viên thành công', HttpResponse::HTTP_CREATED);
        } catch (\Throwable $th) {
            DB::rollBack();
            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR); //Lỗi 500 không xác định
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $roleName = 'customer'; // Vai trò mà bạn muốn loại trừ
            $data = User::with(['roles', 'userDetail', 'branch'])
                ->whereHas('roles', function ($query) use ($roleName) {
                    $query->where('name', '<>', $roleName); //lệnh lấy dữ diệu loại có roles khác customer
                })->find($id);

            if (empty($data)) {
                return BaseResponse::error('Không tìm thấy thông tin nhân viên', HttpResponse::HTTP_NOT_FOUND);
            }

            $infor = [
                'id' => $data->id,
                'fullname' => $data->fullname,
                'branch_id' => $data->branch_id,
                'branch' => $data['branch']['name'],
                'email' => $data->email,
                'avatar' => $data->avatar,
                'birthday' => !empty($data['userDetail']->birthday) ? $data['userDetail']->birthday : null,
                'phone' => !empty($data['userDetail']->phone) ? $data['userDetail']->phone : null,
                'phone_relative' => !empty($data['userDetail']->phone_relative) ? $data['userDetail']->phone_relative : null,
                'address' => !empty($data['userDetail']->address) ? $data['userDetail']->address : null,
                'passport' => !empty($data['userDetail']->passport) ? $data['userDetail']->passport : null,
                'quantity_voucher' => !empty($data['userDetail']->quantity_voucher) ? $data['userDetail']->quantity_voucher : null,
                'role' => collect($data['roles'])->pluck('name')
            ];

            return BaseResponse::success($infor, 'Thông tin nhân viên', HttpResponse::HTTP_OK);
        } catch (Throwable $th) {
            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR); // lỗi kết nối server 500
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
       
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStaffRequest $request, string $id)
    {
        DB::beginTransaction();
        try {

            $staff = User::find($id);
            if(!isset($staff)){
                return BaseResponse::error('Không tìm thấy thông tin nhân viên', HttpResponse::HTTP_NOT_FOUND);
            }
            $data = $request->except('roles');
            $staff->update($data);
            $staff->syncRoles($request['roles']);

            if($request->has('user_detail')){
                $dataDetail = $request['user_detail'];

                $userDetail = UserDetail::where('user_id', $id)->first();
                if(!isset($userDetail)){
                    $dataDetail['user_id'] = $id;
                    UserDetail::create($dataDetail);
                }else{
                    $userDetail->update($dataDetail);
                }
            }
            DB::commit();
            return BaseResponse::success($staff, 'Cập nhật tài khoản nhân viên thành công', HttpResponse::HTTP_CREATED);
        } catch (\Throwable $th) {
            DB::rollBack();
            return BaseResponse::error($th->getMessage() . ' on ' . $th->getLine(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR); //Lỗi 500 không xác định
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {

            User::findOrFail($id)->delete();
            return BaseResponse::success('', 'Xóa tài khoản thành công', 202);
        } catch (ModelNotFoundException $e) {

            return BaseResponse::error('Không tìm thấy tài khoản', HttpResponse::HTTP_NOT_FOUND); // lỗi 404 Không tìm thấy tài khoản

        } catch (Throwable $th) {

            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR); //Lỗi 500 kết nối server

        }
    }

    public function getStaffsAction($bookingId){
        $data = [];
        $booking = Booking::with('staff', 'bookingTours')->find($bookingId);
        $data[] = ['action' => 'booking',
                    'nameStaff' => $booking->staff->fullname,
                    'nameTour' => '',
                    'datetime' => $booking->updated_at];
        foreach($booking->bookingTours as $bookingTour){
            $bookingActivities = BookingActivity::where('booking_tour_id', $bookingTour->id)->get();
            if(isset($bookingActivities)){
                foreach($bookingActivities as $bookingActivity){
                    $data[] = ['action' => $bookingActivity->name,
                                'nameStaff' => $bookingActivity->name_staff,
                                'nameTour' => $bookingTour->name_tour,
                                'datetime' => $bookingActivity->updated_at];
                }
            }
        }
        return BaseResponse::success($data);
    }

    public function changePassword(ChangePasswordRequest $request){
        $user = Auth::user();

        if (!Hash::check($request->passwordCurrent, $user->password)) {
            return BaseResponse::error('Mật khẩu hiện tại không đúng.', 422);
        }

        $user->password = Hash::make($request->passwordNew);
        $user->save();

        return BaseResponse::success('', 'Cập nhật mật khẩu thành công', 201);
    }
}
