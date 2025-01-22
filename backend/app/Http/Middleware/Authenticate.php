<?php

namespace App\Http\Middleware;

use App\Http\Responses\BaseResponse;
use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        return $request->expectsJson() ? null : BaseResponse::error('Đăng nhập hết hạn', 401);
    }
}
