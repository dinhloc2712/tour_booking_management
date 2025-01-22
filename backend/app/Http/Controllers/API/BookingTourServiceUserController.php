<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Responses\BaseResponse;
use App\Models\BookingTourServiceUser;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingTourServiceUserController extends Controller
{
    public function create()
    {
        $const = BookingTourServiceUser::getConstants();

        return BaseResponse::success($const);
    }

    // store 
    public function store(Request $request)
    {
        try {
            $bookingTourServiceUser = BookingTourServiceUser::create($request->all());
            return BaseResponse::success($bookingTourServiceUser);
        } catch (\Throwable $e) {
            return BaseResponse::error($e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
        }
    }



    public function update(BookingTourServiceUser $bookingTourServiceUser, Request $request)
    {
        try {
            $bookingTourServiceUser->update($request->all());
            return BaseResponse::success($bookingTourServiceUser);
        } catch (\Throwable $e) {
            return BaseResponse::error($e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
        }
    }






    public function suggestServices(string $bookingTourId, string $userId)
    {
        // $sers = Service::all();
        // return response()->json($sers);

        $usedServicesByUsers = [];

        $usedServicesByUser = DB::table('booking_tour_service_users')
            ->select('service_id', DB::raw('COUNT(*) as usage_count'))
            ->where('user_id', $userId)
            ->where('booking_tour_id', $bookingTourId)
            ->groupBy('service_id')
            ->orderBy('usage_count', 'desc')
            ->get();
        foreach ($usedServicesByUser as $service) {
            $ser = Service::where('id', $service->service_id)->where('is_active', true)->first();
            if ($ser) {
                $usedServicesByUsers[] = $ser;
            }
        }
        // $serviceIds=$usedServicesByUser->pluck('service_id');
        // $usedServicesByUser = Service::whereIn('id', $serviceIds)->get();


        $popularServicess = [];
        $popularServices = DB::table('booking_tour_service_users')
            ->select('service_id', DB::raw('COUNT(DISTINCT user_id) as customer_count'))
            ->where('booking_tour_id', $bookingTourId)
            ->whereNotIn('service_id', $usedServicesByUser->pluck('service_id'))
            ->groupBy('service_id')
            ->orderBy('customer_count', 'desc')
            ->get();
        foreach ($popularServices as $service) {
            $ser = Service::where('id', $service->service_id)->where('is_active', true)->first();
            if ($ser) {
                $popularServicess[] = $ser;
            }
        }


        $remainingServices = DB::table('services')
            ->whereNotIn('id', $usedServicesByUser->pluck('service_id'))
            ->whereNotIn('id', $popularServices->pluck('service_id'))
            ->where('is_active', true)
            ->orderBy('price', 'asc')
            ->get();

        $suggestedServices = collect($usedServicesByUsers)
            ->merge($popularServicess)
            ->concat($remainingServices);

        return BaseResponse::success($suggestedServices);
    }

    // public function suggestServices2(string $TourId, $userId = null)
    // {
    //     // $sers = Service::all();
    //     // return response()->json($sers);

    //     $usedServicesByUsers=[];

    //     $usedServicesByUser = DB::table('booking_tour_service_users')
    //         ->select('service_id', DB::raw('COUNT(*) as usage_count'))
    //         ->where('user_id', $userId)
    //         // ->where('tour_id', $TourId)
    //         ->groupBy('service_id')
    //         ->orderBy('usage_count', 'desc')
    //         ->get();
    //     foreach ($usedServicesByUser as $service) {
    //         $ser = Service::where('id', $service->service_id)->where('is_active', true)->first();
    //         if($ser){
    //             $usedServicesByUsers[]= $ser;
    //         }
    //     }
    //     // $serviceIds=$usedServicesByUser->pluck('service_id');
    //     // $usedServicesByUser = Service::whereIn('id', $serviceIds)->get();


    //     $popularServicess = [];
    //     $popularServices = DB::table('booking_tour_service_users')
    //         ->select('service_id', DB::raw('COUNT(DISTINCT user_id) as customer_count'))
    //         ->where('tour_id', $TourId)
    //         ->whereNotIn('service_id', $usedServicesByUser->pluck('service_id')) 
    //         ->groupBy('service_id')
    //         ->orderBy('customer_count', 'desc')
    //         ->get();
    //     foreach ($popularServices as $service) {
    //         $ser = Service::where('id', $service->service_id)->where('is_active', true)->first();
    //         if($ser){
    //             $popularServicess[]= $ser;
    //         }
    //     }


    //     $remainingServices = DB::table('services')
    //         ->whereNotIn('id', $usedServicesByUser->pluck('service_id')) 
    //         ->whereNotIn('id', $popularServices->pluck('service_id'))   
    //         ->where('is_active', true)
    //         ->orderBy('price', 'asc') 
    //         ->get();

    //     $suggestedServices = collect($usedServicesByUsers)
    //         ->merge($popularServicess)
    //         ->concat($remainingServices);

    //     return BaseResponse::success($suggestedServices);
    // }

    public function suggestServices2(string $tourId, $userId = null)
    {
        $userServices = DB::table('booking_tour_service_users')
            ->select('service_id', DB::raw('COUNT(*) as usage_count'))
            ->where('user_id', $userId)
            ->groupBy('service_id')
            ->orderBy('usage_count', 'desc')
            ->pluck('service_id')
            ->toArray();

        $popularServices = DB::table('booking_tour_service_users')
            ->join('booking_tours', 'booking_tours.id', '=', 'booking_tour_service_users.booking_tour_id')
            ->select('booking_tour_service_users.service_id', DB::raw('COUNT(DISTINCT booking_tour_service_users.user_id) as user_count'))
            ->where('booking_tours.tour_id', $tourId)
            ->groupBy('booking_tour_service_users.service_id')
            ->orderBy('user_count', 'desc')
            ->pluck('booking_tour_service_users.service_id')
            ->toArray();


        $remainingServices = Service::where('is_active', true)
            ->whereNotIn('id', array_merge($userServices, $popularServices))
            ->orderBy('price', 'asc')
            ->pluck('id')
            ->toArray();
            $allService = array_merge($userServices, $popularServices, $remainingServices);
            $allService = array_unique($allService);
          

        $serviceWeights = [];
        foreach ($userServices as $serviceId) {
            $serviceWeights[$serviceId] = 3;
        }
        foreach ($popularServices as $serviceId) {
            $serviceWeights[$serviceId] = $serviceWeights[$serviceId] ?? 0;
            $serviceWeights[$serviceId] += 2;
        }
        foreach ($remainingServices as $serviceId) {
            $serviceWeights[$serviceId] = $serviceWeights[$serviceId] ?? 0;
            $serviceWeights[$serviceId] += 1;
        }


        $allServices = array_merge($userServices, $popularServices, $remainingServices);
        $allServices = array_unique($allServices);

        usort($allServices, function ($a, $b) use ($serviceWeights) {
            $weightA = $serviceWeights[$a] ?? 0;
            $weightB = $serviceWeights[$b] ?? 0;

            if ($weightA !== $weightB) {
                return $weightB - $weightA;
            }

            $priceA = Service::find($a)->price;
            $priceB = Service::find($b)->price;

            return $priceA <=> $priceB;
        });


        $sortedServices = Service::whereIn('id', $allService)
        ->where('is_active', true)
        ->orderByRaw(
            "CASE id " . implode(' ', array_map(fn($id, $index) => "WHEN $id THEN $index", $allService, array_keys($allService))) . " END"
        )
        ->get();
        foreach ($sortedServices as $service) {
            $service['service_name'] = $service->name;
            $service['service_price'] = $service->price;
            $service['service_id'] = $service->id;  

        }
    
    

        return BaseResponse::success($sortedServices);
    }
}
