<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\StoreCheckInRequest;
use App\Http\Requests\API\UpdateCheckInRequest;
use App\Http\Responses\BaseResponse;
use App\Models\Booking;
use App\Models\BookingActivity;
use App\Models\BookingServiceByTour;
use App\Models\BookingTour;
use App\Models\BookingTourServiceUser;
use App\Models\SaleAgent;
use App\Models\Service;
use App\Models\TourSevice;
use App\Models\User;
use App\Models\UserDetail;
use App\Traits\AddBookingDetails;
use App\Traits\AddBookingTourAndService;
use App\Traits\AddUser;
use App\Traits\BookingActivities;
use App\Traits\CheckTime;
use App\Traits\UpdateCustomer;
use App\Traits\UpdateData;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Throwable;

class CheckInController extends Controller
{
    use AddBookingDetails,AddBookingTourAndService,AddUser,BookingActivities,CheckTime,CheckTime,UpdateCustomer,UpdateData;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $bookings = Booking::with('staff', 'booker.userDetail', 'bookingTours', 'bookingServiceByTours', 'bookingTours.bookingTourServiceUsers')->latest('id')->get();
            // return $bookings[0]['bookingTours'][0];
            $processedBookings = [];

            foreach ($bookings as $booking) {
                $bookingData = $booking->toArray(); // Chuyển Booking thành mảng

                foreach ($booking['bookingTours'] as $bookingTour) {
                    $services = $bookingTour->userservices;
                    $bookingData['services'] = $services;

                }
                $processedBookings[] = $bookingData;
            }

            return BaseResponse::success($processedBookings);

        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function checkCusTomer(Request $request,string $id){
        try{
            $customer = UserDetail::where('passport', $request->puser_details['passport'])->first();
            if(!$customer){
                return BaseResponse::error('Không tìm thấy khách hàng', HttpResponse::HTTP_NOT_FOUND);
            }
            $checkCustomer = Booking::find($id)->whereIn('customer_ids', $customer->user_id)->first();
            if(!$checkCustomer){
                return BaseResponse::error('Không tìm thấy khách hàng trong booking !', HttpResponse::HTTP_NOT_FOUND);
            }
        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCheckInRequest $request)
    {
        try {
            $datas = [];
            $booking_id = null;
            $booking = null;
            $bookingTours = [];
            $bookingTour = null;
            $bookingServiceByTours = [];
            $bookingServiceByTour = null;
            $userIDs = [];
            $checkHasService = false;
            foreach ($request->all()['data'] as $req) {
                if (! isset($req['users'])) {
                    return response()->json(['error' => 'Missing users data'], 400);
                }
                if (! isset($req['user_details'])) {
                    return response()->json(['error' => 'Missing user_details data'], 400);
                }
                if (! isset($req['booking_tours'])) {
                    return response()->json(['error' => 'Missing booking_tours data'], 400);
                }

                $dataUser = [
                    'full_name' => $req['users']['full_name'] ?? 'N/A',
                    'birthday' => $req['user_details']['birthday'] ?? null,
                    'passport' => $req['user_details']['passport'] ?? 'N/A',
                    'address' => $req['user_details']['address'] ?? 'N/A',
                    'phone' => $req['user_details']['phone'] ?? 'N/A',
                ];

                if (! empty($req['user_details']['email'] ?? null)) {
                    $dataUser['email'] = $req['user_details']['email'];
                }

                $customerId = $this->addUser($dataUser);
                //  return   $bookingTourServicerUserIDs = $this->updateCustomer($req['booking_tours'], $customerId);
                $bookingTourServicerUserIDs = [];
                foreach ($req['booking_tours'] as $req) {
                    $bookingTour = BookingTour::find($req['id']);
                    if (! $bookingTour) {
                        return BaseResponse::error('Không tìm thấy Booking Tour!');
                    }

                    $customerIds = $bookingTour->customer_ids ?? [];
                    if (! is_array($customerIds)) {
                        $customerIds = [];
                    }

                    if (! in_array($customerId, $customerIds)) {
                        $customerIds[] = $customerId;
                        sort($customerIds);
                        $bookingTour->update(['customer_ids' => $customerIds]);
                    }

                    if(!empty($req['booking_service_by_tours'])){
                        foreach ($req['booking_service_by_tours'] as $bookingSer) {
                            $bookingServiceByTour = BookingServiceByTour::find($bookingSer['id']);
                            if (! $bookingServiceByTour) {
                                return BaseResponse::error('Không tìm thấy thông tin Booking Service by Tour!');
                            }
    
                            $customerIds = $bookingServiceByTour->customer_ids ?? [];
                            if (! is_array($customerIds)) {
                                $customerIds = [];
                            }
    
                            if (! in_array($customerId, $customerIds)) {
                                $customerIds[] = $customerId;
                                sort($customerIds);
                                $bookingServiceByTour->update(['customer_ids' => $customerIds]);
                            }
    
                            $bookingTourServicerUser = BookingTourServiceUser::where('booking_tour_id', $req['id'])
                                ->where('service_id', $bookingServiceByTour->service_id)
                                ->where('user_id', $customerId)
                                ->first();
    
                            if (! $bookingTourServicerUser) {
                                $checkHasService = true;
                                $data = [
                                    'booking_tour_id' => $req['id'],
                                    'service_id' => $bookingServiceByTour->service_id,
                                    'quantity' => $bookingSer['quantity'],
                                    'start_time' => $bookingSer['start_time'] ?? $bookingServiceByTour->start_time,
                                    'end_time' => $bookingSer['end_time'] ?? $bookingServiceByTour->end_time,
                                    'unit' => $bookingSer['unit'] ?? 1,
                                    'price' =>TourSevice::where('service_id',$bookingServiceByTour->service_id)->where('tour_id',$bookingTour->tour_id)->first()?->price?? Service::find($bookingServiceByTour->service_id)?->price ,
                                    'note' => $bookingSer['note'] ?? null,
                                    'sale_agent_id' => SaleAgent::find($bookingServiceByTour->sale_agent_id)?->id ?? null,
                                    'user_id' => $customerId,
                                ];
                                $bookingTourServiceUser = BookingTourServiceUser::create($data);
                                $bookingTourServicerUserIDs[] = $bookingTourServiceUser->id;
                            } else {
                                // $bookingTourServicerUserIDs[] = $bookingTourServicerUser->id;
    
                            }
                        }
                    }
                    if(!empty($req['booking_tour_service_users'])){
                        echo "run";
                        foreach ($req['booking_tour_service_users'] as $bookingSer) {
                        
                            $bookingTourServicerUser = BookingTourServiceUser::where('booking_tour_id', $req['id'])
                                ->where('service_id', $bookingSer['service_id'])
                                ->where('user_id', $customerId)
                                ->first();
    
                            if (! $bookingTourServicerUser) {
                                $checkHasService = true;
                                $data = [
                                    'booking_tour_id' => $req['id'],
                                    'service_id' => $bookingSer['service_id'],
                                    'quantity' => $bookingSer['quantity'],
                                    'start_time' => $bookingSer['start_time'] ,
                                    'end_time' => $bookingSer['end_time'] ,
                                    'unit' => $bookingSer['unit'] ?? 1,
                                    'price' => TourSevice::where('service_id',$bookingSer['service_id'])->where('tour_id',$bookingTour->tour_id)->first()?->price??Service::find($bookingSer['service_id'])?->price ?? 0,
                                    'note' => $bookingSer['note'] ?? null,
                                    'sale_agent_id' => SaleAgent::find($bookingSer['sale_agent_id'])?->id ?? null,
                                    'user_id' => $customerId,
                                ];
                                $bookingTourServiceUser = BookingTourServiceUser::create($data);
                                $bookingTourServicerUserIDs[] = $bookingTourServiceUser->id;
                            } else {
                                // $bookingTourServicerUserIDs[] = $bookingTourServicerUser->id;
    
                            }
                        }
                    }
                    
                    $bookingTour = BookingTour::find($req['id']);
                    if (!isset($datas['booking_tours']) || !is_array($datas['booking_tours'])) {
                        $datas['booking_tours'] = [];
                    }
                    
                    if (!in_array($bookingTour->id, $datas['booking_tours'])) {
                        $datas['booking_tours'][] = $bookingTour->id;
                    }

                    // $bookingTour->status = BookingTour::STATUS_IS_MOVING;
                    // $bookingTour->save();
                    $bookingTours[] = $bookingTour->only(['tour_id', 'name_tour', 'customer_ids', 'quantity_customer', 'price', 'note']);
                    // $bookingServiceByTour = BookingServiceByTour::where('booking_tour_id', $req['id'])->first();
                    // return $bookingServiceByTour;
                    // $bookingServiceByTours[] = $bookingServiceByTour->only(['sale_agent_id', 'service_id', 'name_service', 'quantity', 'unit', 'price', 'note']);
                    $booking = Booking::find($bookingTour->booking_id);
                    $booking_id = $booking->id;
                    $datas['booking_id'] = (int) $booking_id;

                    $BookingActivityData = [
                        'staff_id' => $booking->staff_id,
                        'name_staff' => User::find($booking->staff_id)->fullname,
                        'booking_tour_id' => $req['id'],
                        'customer_ids' => $customerId,
                        'name' => BookingActivity::NAME_CHECKIN,
                    ];

                    $this->bookingActivity($BookingActivityData);
                }
                // if (is_array($bookingTourServicerUserIDs)) {
                //     $datas['booking_tour_servicer_user_ids'][] = $bookingTourServicerUserIDs;
                // } else {
                // }
                if (is_array($bookingTourServicerUserIDs)) {
                    if (!isset($datas['booking_tour_servicer_user_ids'])) {
                        $datas['booking_tour_servicer_user_ids'] = []; // Khởi tạo nếu chưa tồn tại
                    }
                    $datas['booking_tour_servicer_user_ids'] = array_merge(
                        $datas['booking_tour_servicer_user_ids'],
                        $bookingTourServicerUserIDs
                    );
                }
                $booking = Booking::find($booking_id);
                // if($checkHasService == true) { 
                    $userIDs[] = (int) $customerId;                   
                // }
            }
            $datas['user_id'] = $userIDs;
            return BaseResponse::success($datas, 'Success');

        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function store2(Request $request)
    {
        try {

            foreach ($request->all()['data'] as $req) {
                if (! isset($req['users'])) {
                    return response()->json(['error' => 'Missing users data'], 400);
                }
                if (! isset($req['user_details'])) {
                    return response()->json(['error' => 'Missing user_details data'], 400);
                }
                if (! isset($req['booking_tours'])) {
                    return response()->json(['error' => 'Missing booking_tours data'], 400);
                }

                $dataUser = [
                    'full_name' => $req['users']['full_name'] ?? 'N/A',
                    'birthday' => $req['user_details']['birthday'] ?? null,
                    'passport' => $req['user_details']['passport'] ?? 'N/A',
                    'address' => $req['user_details']['address'] ?? 'N/A',
                    'phone' => $req['user_details']['phone'] ?? 'N/A',
                ];

                if (! empty($req['user_details']['email'] ?? null)) {
                    $dataUser['email'] = $req['user_details']['email'];
                }

                $customerId = $this->addUser($dataUser);
                // $this->updateCustomer($req['booking_tours'], $customerId);
                foreach ($req['booking_tours'] as $requestBookingTour) {
                    $bookingTour = BookingTour::find($requestBookingTour['id']);
                    if ($bookingTour->customer_ids) {
                        $customerIds = $bookingTour->customer_ids;
                    }
                    if (! is_array($customerIds)) {
                        $customerIds = [];
                    }
                    if (! in_array($customerId, $customerIds)) {
                        $customerIds[] = $customerId;
                    }
                    sort($customerIds);
                    $bookingTour->update([
                        'customer_ids' => $customerIds,
                    ]);
                    foreach ($requestBookingTour['booking_service_by_tours'] as $bookingSer) {
                        $dataBookingSer = [
                            'booking_tour_id' => $bookingTour->id,
                            'service_id' => $bookingSer['service_id'],
                            'quantity' => $bookingSer['quantity'],
                            'name_service' => Service::find($bookingSer['service_id'])->name ?? 'N/A',
                            'customer_ids' => $customerId,
                            'unit' => $bookingSer['unit'],
                            'price' => $bookingSer['price'],
                            'sale_agent_id' => Service::find($bookingSer['service_id'])->sale_agent_id ?? null,
                            'quantity_customer' => 1,
                            'start_time' => $bookingSer['start_time'],
                            'end_time' => $bookingSer['end_time'],
                        ];
                        $bookingServiceByTour = BookingServiceByTour::where('booking_tour_id', $bookingTour->id)->where('service_id', $bookingSer['service_id'])->where('customer_ids', 'like', '%'.$customerId.'%')->first();
                        if (! $bookingServiceByTour) {
                            $bookingServiceByTour = BookingServiceByTour::create($dataBookingSer);
                        }
                    }
                }
            }

            return BaseResponse::success(null, 'Success');
        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

    }

    public function update2(Request $request, string $id)
    {
        try {

            $data = $request->all();
            $user = Auth::user();
            $branchId = $user->branch_id;
            $roles = $user->roles;
            $check = false;
            foreach ($roles as $role) {
                if ($role->name == 'admin') {
                    $check = true;
                } elseif ($role->name == 'admin_branch') {
                    if ($branchId == $request->booking['branch_id']) {
                        $check = true;
                    }
                } elseif ($role->name == 'sale') {
                    if ($user->id == $request->booking['staff_id']) {
                        $check = true;
                    }
                } else {
                    $check = false;
                }
            }
            if ($check == false) {
                return BaseResponse::error('Bạn không có quyền truy cập !', HttpResponse::HTTP_FORBIDDEN);
            }
            $userDetail = UserDetail::where('passport', $request->user_details['passport'])->first();
            if ($userDetail) {
                $userDetail->update($request->user_details);
                $userId = $userDetail->user_id;

                $user = User::find($userId);
                if ($user) {
                    $user->update($request->users);
                }
            }
            foreach ($request->bookings as $bookingData) {
                foreach ($bookingData['booking_tours'] as $bookingTourData) {

                    $bookingTour = BookingTour::updateOrCreate(
                        [
                            'id' => $bookingTourData['id'] ?? null, // nếu có ID thì cập nhật, không thì tạo mới
                        ],
                        [
                            'booking_id' => $bookingData['id'],
                            'tour_id' => $bookingTourData['tour_id'],
                            'voucher_id' => $bookingTourData['voucher_id'],
                            'customer_ids' => json_encode($bookingTourData['customer_ids']),
                            'code_voucher' => $bookingTourData['code_voucher'],
                            'value_voucher' => $bookingTourData['value_voucher'],
                            'start_time' => $bookingTourData['start_time'],
                            'end_time' => $bookingTourData['end_time'],
                            'price' => $bookingTourData['price'],
                            'note' => $bookingTourData['note'],
                            'status' => $bookingTourData['status'],
                            'name_tour' => $bookingTourData['name_tour'],
                            'quantity_customer' => $bookingTourData['quantity_customer'],
                        ]
                    );

                    foreach ($bookingTourData['booking_service_by_tours'] as $serviceData) {
                        BookingServiceByTour::updateOrCreate(
                            [
                                // Không cần truyền 'id' khi tạo mới, Laravel sẽ tự động tạo ID cho bản ghi mới
                                'booking_tour_id' => $bookingTour['id'],
                                'service_id' => $serviceData['service_id'],
                                'quantity' => $serviceData['quantity'],
                                'unit' => $serviceData['unit'],
                                'note' => $serviceData['note'],
                                'status' => $serviceData['status'],
                                'start_time' => $serviceData['start_time'],
                                'end_time' => $serviceData['end_time'],
                                'sale_agent_id' => $serviceData['sale_agent_id'],
                                'quantity_customer' => $serviceData['quantity_customer'],
                                'customer_ids' => $serviceData['customer_ids'],
                                'price' => $serviceData['price'],
                                'name_service' => $serviceData['name_service'],
                            ],
                            [
                                // Cập nhật các trường nếu có bản ghi phù hợp
                                'booking_tour_id' => $bookingTour['id'],
                                'service_id' => $serviceData['service_id'],
                                'quantity' => $serviceData['quantity'],
                                'unit' => $serviceData['unit'],
                                'note' => $serviceData['note'],
                                'status' => $serviceData['status'],
                                'start_time' => $serviceData['start_time'],
                                'end_time' => $serviceData['end_time'],
                                'sale_agent_id' => $serviceData['sale_agent_id'],
                                'quantity_customer' => $serviceData['quantity_customer'],
                                'customer_ids' => $serviceData['customer_ids'],
                                'price' => $serviceData['price'],
                                'name_service' => $serviceData['name_service'],
                            ]
                        );

                    }
                }
            }

            return BaseResponse::success(null, 'Success');
        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getOne($bookingTourId, $userId)
    {
        try {
            $bookingTour = BookingTour::where('id', $bookingTourId)->whereRaw('? IN (SELECT json_array_elements_text(customer_ids))', [$userId])->first();
            if (! $bookingTour) {
                return BaseResponse::error('Booking Tour not found.', HttpResponse::HTTP_NOT_FOUND);
            }
            $bookingTourService = BookingServiceByTour::where('booking_tour_id', $bookingTourId)->whereRaw('? IN (SELECT json_array_elements_text(customer_ids))', [$userId])
                ->first();
            if (! $bookingTourService) {
                return BaseResponse::error('Booking  Service by Tour not found.', HttpResponse::HTTP_NOT_FOUND);
            }
            $bookingActivity = BookingActivity::whereRaw('? IN (SELECT json_array_elements_text(customer_ids))', [$userId])
                ->where('booking_tour_id', $bookingTourId)
                ->get();
            if (! $bookingActivity) {
                return BaseResponse::error('Booking Activity not found.', HttpResponse::HTTP_NOT_FOUND);
            }
            $bookingTourServicerUser = BookingTourServiceUser::where('booking_tour_id', $bookingTourId)->where('user_id', $userId)->get();
            if (! $bookingTourServicerUser) {
                return BaseResponse::error('Booking Tour Service User not found.', HttpResponse::HTTP_NOT_FOUND);
            }
            $data = [
                'booking_tour' => $bookingTour,
                'booking_tour_service' => $bookingTourService,
                'booking_tour_service_user' => $bookingTourServicerUser,
                'booking_activities' => $bookingActivity,

            ];

            return BaseResponse::success($data);

        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id) {}

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCheckInRequest $request, string $id)
    {
        try {
            $user = Auth::user();
            $branchId = $user->branch_id;
            $roles = $user->roles;
            $check = false;
            foreach ($roles as $role) {
                if ($role->name == 'admin') {
                    $check = true;
                } elseif ($role->name == 'admin_branch') {
                    if ($branchId == $request->booking['branch_id']) {
                        $check = true;
                    }
                } elseif ($role->name == 'sale') {
                    if ($user->id == $request->booking['staff_id']) {
                        $check = true;
                    }
                } else {
                    $check = false;
                }
            }
            if ($check == false) {
                return BaseResponse::error('Bạn không có quyền truy cập !', HttpResponse::HTTP_FORBIDDEN);
            }
            if ($this->updateData($request) == true) {
                return BaseResponse::success(null, 'Success');
            } else {
                return BaseResponse::error('Error', HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
            }
        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getAllStatuses()
    {
        $const = BookingActivity::getConstants();

        return BaseResponse::success($const);
    }

    public function updateActivity(Request $request, $bookingTourId)
    {
        return $this->updateName($bookingTourId, $request->customer_ids, $request->name);
    }

    public function cancel(Request $request, $bookingTourId)
    {
        try {
            $user = Auth::user();
            $branchId = $user->branch_id;
            $roles = $user->roles;
            $check = false;
            foreach ($roles as $role) {
                if ($role->name == 'admin') {
                    $check = true;
                } elseif ($role->name == 'admin_branch') {
                    if ($branchId == $request->booking['branch_id']) {
                        $check = true;
                    }
                } elseif ($role->name == 'sale') {
                    if ($user->id == $request->booking['staff_id']) {
                        $check = true;
                    }
                } else {
                    $check = false;
                }
            }
            if ($check == false) {
                return BaseResponse::error('Bạn không có quyền truy cập !', HttpResponse::HTTP_FORBIDDEN);
            }
            $now = date('Y-m-d H:i:s');
            $bookingTour = BookingTour::find($bookingTourId);

            if (! $bookingTour) {
                return BaseResponse::error('Booking Tour not found.', HttpResponse::HTTP_NOT_FOUND);
            }
            $startTime = $bookingTour->start_time;
            $endTime = $bookingTour->end_time;
            $bookingTourCustomers = $bookingTour->customer_ids;

            $checkTime = true;
            if ($this->checkTime($now, $startTime) === 'Yes') {
                // return BaseResponse::success(null, 'Tour Chưa bắt đầu');
                $checkTime = true;
            } elseif ($this->checkTime($now, $startTime) === 'No' && $this->checkTime($now, $endTime) === 'Yes') {
                // return BaseResponse::success(null, 'Tour đang diễn ra');
                $checkTime = true;
            } elseif ($this->checkTime($now, $endTime) === 'No') {
                $checkTime = false;
                return BaseResponse::error('Không thể hủy tour đã kết thúc', HttpResponse::HTTP_BAD_REQUEST);
            }

            $checkCountId = 'one';
            if (count($request->customer_ids) == 1) {
                $checkCountId = 'one';
            } elseif (count($request->customer_ids) > 1) {
                $checkCountId = 'many';
            }

            if ($checkTime == true && $checkCountId === 'one') {

                $customer_id = $request->customer_ids[0];
                $bookingActivity = BookingActivity::where('booking_tour_id', $bookingTourId)->latest()->first();
                $customer_ids = $bookingActivity->customer_ids;
                $customer_ids_error = [];
                if (! in_array($customer_id, $customer_ids)) {
                    return BaseResponse::error(
                        'Khách hàng có id: '.$customer_id.' không có trong tour!'
                    );
                }
                // BookingActivity
                $bookingActivity = BookingActivity::create([
                    'parent_activity_id' => $bookingActivity->id,
                    'booking_tour_id' => intval($bookingTourId),
                    'staff_id' => $bookingActivity['staff_id'],
                    'name_staff' => $bookingActivity['name_staff'],
                    'customer_ids' => $request->customer_ids,
                    'name' => BookingActivity::NAME_CANCEL,
                ]);
                // BookingTour
                if (count($bookingTourCustomers) == 1) {
                    $bookingTour->status = BookingTour::STATUS_CANCEL;
                    $bookingTour->save();
                } else {
                    $bookingTour->customer_ids = array_diff($bookingTourCustomers, $request->customer_ids);
                    $bookingTour->save();

                    $data = $bookingTour;
                    $data['customer_ids'] = $request->customer_ids;
                    $data['status'] = BookingTour::STATUS_CANCEL;
                    BookingTour::create([
                        $data,
                    ]);
                }
                //BookingTourServiceUser
                $bookingTourServiceUser = BookingTourServiceUser::where('booking_tour_id', $bookingTourId)->where('user_id', $customer_id)->get();
                if ($bookingTourServiceUser) {
                    foreach ($bookingTourServiceUser as $item) {
                        $item->status = BookingTourServiceUser::STATUS_CANCEL;
                        $item->save();
                    }
                }
                // BookingServicebyTour
                $bookingServiceByTour = BookingServiceByTour::where('booking_tour_id', $bookingTourId)->latest()->first();
                if (! $bookingServiceByTour) {
                    return BaseResponse::error('Booking Service by Tour not found.', HttpResponse::HTTP_NOT_FOUND);
                }
                $bookingServiceCustomers = $bookingServiceByTour->customer_ids;
                if (count($bookingServiceCustomers) == 1) {
                    $bookingServiceByTour->status = BookingServiceByTour::STATUS_CANCEL;
                    $bookingServiceByTour->save();
                } elseif (count($bookingServiceCustomers) > 1) {
                    $bookingServiceByTour->customer_ids = array_diff($bookingServiceCustomers, $request->customer_ids);
                    $bookingServiceByTour->save();

                    $data = $bookingServiceByTour;
                    $data['customer_ids'] = $request->customer_ids;
                    $data['status'] = BookingServiceByTour::STATUS_CANCEL;
                    BookingServiceByTour::create([
                        $data,
                    ]);
                } else {
                    return BaseResponse::error('Booking Service by Tour not customer_ids.', HttpResponse::HTTP_NOT_FOUND);
                }

                return BaseResponse::success(null, 'Đã hủy tour !');
            } elseif ($checkTime == true && $checkCountId === 'many') {

                $bookingActivity = BookingActivity::where('booking_tour_id', $bookingTourId)->latest()->first();
                $customer_ids = $bookingActivity->customer_ids;
                $customer_ids_error_ac = [];
                $customer_ids_error_tour = [];
                foreach ($request->customer_ids as $customer_id) {
                    if (! in_array($customer_id, $customer_ids)) {
                        $customer_ids_error_ac[] = $customer_id;
                    }
                }

                foreach ($request->customer_ids as $id) {
                    if (! in_array($id, $customer_ids)) {
                        $customer_ids_error_tour[] = $id;
                    }
                }

                if ($customer_ids_error_tour || $customer_ids_error_ac) {
                    if ($customer_ids_error_ac) {
                        return BaseResponse::error(
                            'Khách hàng có id: '.implode(', ', $customer_ids_error_ac).' không có trong BookingActivity!'
                        );
                    } else {
                        return BaseResponse::error(
                            'Khách hàng có id: '.implode(', ', $customer_ids_error_tour).' không có trong BookingTour!'
                        );
                    }

                } else {
                    // BookingActivity
                    $bookingActivity = BookingActivity::create([
                        'parent_activity_id' => $bookingActivity->id,
                        'booking_tour_id' => intval($bookingTourId),
                        'staff_id' => $bookingActivity['staff_id'],
                        'name_staff' => $bookingActivity['name_staff'],
                        'customer_ids' => $request->customer_ids,
                        'name' => BookingActivity::NAME_CANCEL,
                    ]);
                    // BookingTour

                    if (count($bookingTourCustomers) == count($request->customer_ids)) {
                        $bookingTour->status = BookingTour::STATUS_IS_MOVING;
                        $bookingTour->save();
                    } else {
                        $bookingTour->customer_ids = array_diff($bookingTourCustomers, $request->customer_ids);
                        $bookingTour->save();

                        $data = $bookingTour;
                        $data['customer_ids'] = $request->customer_ids;
                        $data['status'] = BookingTour::STATUS_CANCEL;
                        BookingTour::create([
                            $data,
                        ]);
                    }
                    //BookingTourServiceUser
                    foreach ($request->customer_ids as $id) {
                        $bookingTourServiceUser = BookingTourServiceUser::where('booking_tour_id', $bookingTourId)->where('user_id', $customer_id)->get();
                        if ($bookingTourServiceUser) {
                            foreach ($bookingTourServiceUser as $item) {
                                $item->status = BookingTourServiceUser::STATUS_CANCEL;
                                $item->save();
                            }
                        }
                    }

                    // BookingServicebyTour
                    $bookingServiceByTour = BookingServiceByTour::where('booking_tour_id', $bookingTourId)->latest()->first();
                    $bookingServiceCustomers = $bookingServiceByTour->customer_ids;
                    if (count($bookingServiceCustomers) == count($request->customer_ids)) {
                        $bookingServiceByTour->status = BookingServiceByTour::STATUS_CANCEL;
                        $bookingServiceByTour->save();
                    } else {
                        $bookingServiceByTour->customer_ids = array_diff($bookingServiceCustomers, $request->customer_ids);
                        $bookingServiceByTour->save();
                        $data = $bookingServiceByTour;
                        $data['customer_ids'] = $request->customer_ids;
                        $data['status'] = BookingServiceByTour::STATUS_CANCEL;
                        BookingServiceByTour::create([
                            $data,
                        ]);
                    }

                    return BaseResponse::success(null, 'Đã hủy thành công !');
                }
            }
        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
