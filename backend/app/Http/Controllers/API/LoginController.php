<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\ForgotPasswordRequest;
use App\Http\Requests\API\ResetPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Responses\BaseResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Session;
use Throwable;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    public function Login(LoginRequest $request)
    {
        try {
            if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
                $user = Auth::user();
                if ($user->hasAnyRole([
                    'admin',
                    'admin_branch',
                    'accountant',
                    'sale',
                    'receptionist',
                    'guide'
                ])) {
                    if($user->is_active){
                        $user->tokens()->delete();

                        $token = $user->createToken('API Token')->plainTextToken;
                        $userDetail = $user->userDetail;
                        return BaseResponse::success([
                            'id' => $user->id,
                            'fullname' => $user->fullname,
                            'avatar' => $user->avatar,
                            'branch_id' => $user->branch_id,
                            'email' => $user->email,
                            'userDetail' => $userDetail,
                            'role' => collect($user['roles'])->pluck('name'),
                            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                            'token' => $token
                        ], 'Đăng nhập thành công', HttpResponse::HTTP_OK); //Đăng nhập thành công
                    }
                    return BaseResponse::error('Tài khoản đã bị khóa', 423);
                } else {
                    return BaseResponse::error('Không đủ quyền hạn', HttpResponse::HTTP_FORBIDDEN); //lỗi 403 không đủ quyền hạn
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Thông tin tài khoản không chính xác'
                ], HttpResponse::HTTP_UNAUTHORIZED); //lỗi 401 tài khoản không thể xác thực
            }
        } catch (Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => $th->getMessage(),
            ], HttpResponse::HTTP_INTERNAL_SERVER_ERROR); // lỗi truy cập dữ liệu 500
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return BaseResponse::success('', 'Đăng xuất thành công',HttpResponse::HTTP_OK);
    }

    protected function invalidateOtherSessions(){
        $user = Auth::user();

        DB::table('sessions')
        ->where('user_id', $user->id)
        ->where('id', '!=', Session::getId())
        ->delete();
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        // Gửi email reset password
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return BaseResponse::success('','Password reset link sent.', 200);
        }

        return BaseResponse::error('Unable to send reset link.', 500);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => bcrypt($password),
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return BaseResponse::success('', 'Password reset successful.', 200);
        }

        return BaseResponse::error('Invalid token or request.', 500);
    }
}
