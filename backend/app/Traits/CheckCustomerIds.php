<?php
namespace App\Traits;
use App\Http\Responses\BaseResponse;
use App\Models\Booking;
use App\Models\BookingTour;
use App\Models\BookingTourService;
use App\Models\Service;
use App\Models\Tour;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\Voucher;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Throwable;
trait CheckCustomerIds
{
    public function checkCustomerIds($Arrcustomer,$customerIds)
    {
        if($Arrcustomer && $customerIds){
            $customer_ids_error = [];

            if(count($Arrcustomer) >= count($customerIds)){
                foreach($customerIds as $key => $customer){
                    if(!in_array($customer->id,$Arrcustomer)){
                        $customer_ids_error[] = $customer->id;
                    }
                }
                return $customer_ids_error;
            }else {
                return false;
            }
        }
        
        
        


    }
}