<?php

namespace App\Traits;

use App\Http\Responses\BaseResponse;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Http\Response as HttpResponse;

trait AddUser
{
    public function addUser($request)
    {

    $userDetail = UserDetail::where('passport', $request['passport'])->first();
         if (isset($request['email'])) {
            $data['email'] = $request['email'];

        } else {
            $data['email'] = fake()->email;
        }
    $data = [
        'fullname' => $request['full_name'],
        'password' => bcrypt($request['full_name']),
        'email' => $request['email'] ?? fake()->email,
    ];

    if (empty($userDetail)) {
        $user = User::create($data);
        $user->assignRole(User::TYPE_CUSTOMER);

        $userDetail = UserDetail::create([
            'user_id' => $user->id,
            'birthday' => $request['birthday'],
            'passport' => $request['passport'],
            'address' => $request['address'],
            'phone' => $request['phone'],
        ]);
    } else {
        $userDetail->update([
            'phone' => $request['phone'],
        ]);
    }

    return $userDetail->user_id;


    }
}
