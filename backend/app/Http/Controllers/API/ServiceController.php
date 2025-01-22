<?php

namespace App\Http\Controllers\API;


use App\Http\Requests\API\StoreServiceRequest;
use App\Http\Requests\API\UpdateServiceRequest;
use App\Models\Service;
use App\Http\Controllers\BaseController;
use App\Http\Responses\BaseResponse;
use App\Models\BookingTour;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceController extends BaseController
{

    protected $Service;

    public function __construct()
    {
        $this->Service = Service::class;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return $this->get($this->Service, $request->limit, $request->col, $request->value);
    }

    public function serviceTour(Request $request)
    {
        $limit = $request->limit;
        $tourId = $request->tour_id;
        $userId = (int) $request->user_id;

        $tourServices = DB::table('tour_service')
            ->where('tour_id', $tourId)
            ->select('service_id', 'price as tour_price')
            ->get()
            ->keyBy('service_id');

        $services = DB::table('services')
            ->select(
                'services.id as service_id',
                'services.name as service_name',
                'services.price as default_price',
                'services.type as service_type'
            )
            ->get();

        $usedServices = DB::table('booking_tour_service_users')
            ->join('booking_tours', 'booking_tours.id', '=', 'booking_tour_service_users.booking_tour_id')
            ->where('booking_tours.tour_id', $tourId)
            ->where('booking_tour_service_users.user_id', $userId)
            ->select('booking_tour_service_users.service_id', DB::raw('COUNT(*) as usage_count'))
            ->groupBy('booking_tour_service_users.service_id')
            ->get()
            ->keyBy('service_id');

        $result = $services->map(function ($service) use ($tourServices, $usedServices, $tourId) {
            $tourService = $tourServices->get($service->service_id);
            $usedService = $usedServices->get($service->service_id);

            return [
                'tour_id' => $tourService ? $tourId : null,
                'service_id' => $service->service_id,
                'service_name' => $service->service_name,
                'service_price' => $tourService->tour_price ?? $service->default_price,
                'service_type' => $service->service_type,
                'is_used' => $usedService ? true : false,
                'usage_count' => $usedService->usage_count ?? 0,
            ];
        });

        $result = $result->sortByDesc(function ($service) {
            return [$service['tour_id'] !== null ? 1 : 0, $service['usage_count']];
        });

        if ($limit) {
            $result = $result->take($limit);
        }

        return BaseResponse::success($result->values()->all());
    }



    public function create()
    {
        $type = [
            service::TYPE_BUS,
            service::TYPE_MOTO,
            service::TYPE_HOTEL,
            service::TYPE_KHAC,
        ];
        return response()->json([
            'type' => $type
        ]);
    }

    public function updateTT(Request $request)
    {
        return $this->updateStatus($this->Service, $request->id, $request->col, $request->value);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceRequest $request)
    {
        return $this->insert($this->Service, $request);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return $this->get($this->Service, null, 'id', $id);
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateServiceRequest $request, string $id)
    {
        return $this->edit($this->Service, $id, $request);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        return $this->delete($this->Service, $id);
    }
}
