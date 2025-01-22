<?php

namespace App\Traits;
use Carbon\Carbon;

use App\Http\Responses\BaseResponse;
use Illuminate\Http\Response;

trait CheckTime
{
    public function checkTime($Time1,$Time2)
    {
        $Time1 = Carbon::createFromFormat('Y-m-d H:i:s', $Time1);
        $Time2 = Carbon::createFromFormat('Y-m-d H:i:s', $Time2);
        // Time 1 lớn hơn Time 2
        if($Time1->greaterThan($Time2)){
            // return false;
            return "No";
        }
            // return true;
            return "Yes";
    }
       
}
