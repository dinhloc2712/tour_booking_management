<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait CheckRole
{
    public function checkRole(array $roles)
    {
        $user = Auth::guard('sanctum')->user();
        $check = $user->hasRole($roles);
        if (! $check) {
            return false;
        }
        return true;
    }
}
