<?php

namespace App\Traits;
use Illuminate\Support\Facades\Auth;
use App\Http\Responses\BaseResponse;
use Illuminate\Http\Response as HttpResponse;


trait AuthorizeBookingAccess {
    public function authorizeBookingAccess($branch_id, $staff_id) {
        if (Auth::check()) {
            $user = Auth::user();
            $branchId = $user->branch_id;
            $roles = $user->roles;
            $check = false;
            foreach ($roles as $role) {
                if ($role->name == 'admin') {
                    $check = true;
                } else if ($role->name == 'admin_branch') {
                    if ($branchId == $branch_id) {
                        $check = true;
                    }
                } else if ($role->name == 'sale') {
                    if ($user->id == $staff_id) {
                        $check = true;
                    }
                }else {
                    $check = false;
                }
            }
            if($check == false){
                return BaseResponse::error('Bạn không có quyền truy cập !', HttpResponse::HTTP_FORBIDDEN);
            }
        }
    }
}