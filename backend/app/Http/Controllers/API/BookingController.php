<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\StoreBookingRequest;
use App\Http\Requests\API\UpdateBookingRequest;
use App\Http\Responses\BaseResponse;
use App\Models\Booking;
use App\Models\BookingActivity;
use App\Models\BookingServiceByTour;
use App\Models\BookingTour;
use App\Models\BookingTourServiceUser;
use App\Models\Service;
use App\Models\Tour;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\Voucher;
use App\Traits\AddUser;
use App\Traits\BookingActivities;
use App\Traits\CheckRole;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

use function PHPUnit\Framework\isEmpty;

class BookingController extends Controller
{
    use AddUser, BookingActivities, CheckRole;

    public function __construct() {}

    public function index()
    {
        try {
            // if(!$this->checkRole(['admin','sale','admin_branch'])){
            //     return BaseResponse::error('Bạn không có quyền truy cập !', HttpResponse::HTTP_FORBIDDEN);
            // }
            $bookings = Booking::with('staff', 'booker.userDetail', 'bookingTours.bookingServiceByTours', 'bookingTours.bookingTourServiceUsers')->latest('id')->get();
            foreach ($bookings as $booking) {
                foreach ($booking['bookingTours'] as $bookingTour) {
                    foreach ($bookingTour['bookingServiceByTours'] as $bookingTourService) {
                        $service = Service::find($bookingTourService->service_id);
                        if ($service) {
                            $bookingTourService->setAttribute('service_name', $service->name);
                        }
                    }
                }
            }

            return BaseResponse::success($bookings);
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
    public function store(StoreBookingRequest $request)
    {

        try {
            $user = User::find($request->bookings['staff_id']);
            if (! $user) {
                return BaseResponse::error('Nhân viên không tồn tại !');
            }
            $userStaff = $user->userDetail;
            if (! $userStaff) {
                return BaseResponse::error('Chi tiết nhân viên không tồn tại!');
            }
            $checkinDate = Carbon::createFromFormat('Y-m-d H:i:s', $request->bookings['checkin_time']);
            $errors = [];
            $flag = true;
            $tours = [];
            $price = 0;
            if ($checkinDate == false) {
                return BaseResponse::error('Ngày check-in không hợp lệ.');
            }

            foreach ($request->bookings['booking_tour'] as $index => $bookingTourData) {
                $index++;
                $price += $bookingTourData['price'];
                $startTime = Carbon::createFromFormat('Y-m-d H:i:s', $bookingTourData['start_time']);

                if ($startTime == false) {
                    $flag = false;
                    $errors[] = 'Thời gian bắt đầu không hợp lệ cho tour '.$index;

                    continue;
                }

                if ($checkinDate->greaterThan($startTime)) {
                    $flag = false;
                    $tours[] = 'tour '.$index;
                }
            }

            if (! $flag) {
                $errorMessages = array_merge($errors, $tours);
                $errorMessage = 'Thời gian bắt đầu của '.implode(', ', $errorMessages).' nhỏ hơn ngày check-in.';

                return BaseResponse::error($errorMessage);
            }
            $flag2 = true;
            $error = [];
            $bookingTours = $request->bookings['booking_tour'];

            foreach ($bookingTours as $index => $bookingTourData) {
                if ($bookingTourData['voucher_id'] != null) {
                    $voucher = Voucher::find($bookingTourData['voucher_id']);
                    if ($voucher) {
                        if ($voucher->object_ids) {
                            $user = User::find($request->bookings['staff_id']);
                            if (! $user) {
                                return BaseResponse::error('Nhân viên không tồn tại !');
                            }

                            $userStaff = $user->userDetail;
                            if (! $userStaff) {
                                return BaseResponse::error('Chi tiết nhân viên không tồn tại!');
                            }

                            $quantityVoucher = $userStaff->quantity_voucher;
                            if (empty($quantityVoucher)) {
                                return BaseResponse::error('Nhân viên đã hết lượt sử dụng voucher được cấp !');
                            } else {
                                $tour = Tour::find($bookingTourData['tour_id']);
                                if ($voucher->type == Voucher::TYPE_PERCENT) {
                                    $voucherValue = $bookingTourData['price'] - $bookingTourData['price'] * $voucher->value / 100;
                                    if ($tour->price_min > $bookingTourData['price'] * $voucher->value / 100) {
                                        $voucherValue = $bookingTourData['price'] - $tour->price_min;
                                    }
                                } elseif ($voucher->type == Voucher::TYPE_MONEY) {
                                    $voucherValue = $voucher->value;
                                    if ($tour->price_min > $bookingTourData['price'] - $voucherValue) {
                                        $voucherValue = $bookingTourData['price'] - $tour->price_min;
                                    }
                                }

                            }
                        }
                    } else {
                        return BaseResponse::error('Voucher không tồn tại !');
                    }
                }
            }

            // if ($flag2 == false) {
            //     return BaseResponse::error('Số tiền giảm của ' . implode(', ', $error) . ' không đúng !');
            // } else {
            // }

            //end Thêm booking_tour /////

            $error3 = [];
            $flag3 = true;
            $tour = [];
            $errorSer = [];

            foreach ($request->bookings['booking_tour'] as $index1 => $bookingTourData) {
                $index1++;
                $tour[] = 'tour '.$index1;

                foreach ($bookingTourData['booking_services_by_tour'] as $index2 => $servicesTour) {
                    $index2++;

                    $startTime = Carbon::createFromFormat('Y-m-d H:i:s', $servicesTour['start_time']);
                    if ($checkinDate->greaterThan($startTime)) {
                        $flag3 = false;
                        $errorSer[] = 'service '.$index2;
                        $error3 = 'Thời gian bắt đầu : '.$startTime.' của '.implode(', ', $errorSer).' của '.implode(', ', $tour).' nhỏ hơn ngày check-in';
                    }
                }
            }

            if (! $flag3) {
                return BaseResponse::error($error3);
            }
            if ($flag == true && $flag2 == true && $flag3 == true) {
                // DB::transaction(function () use ($request) {
                $userId = null;
                $nameParts = explode(' ', strtolower($request->users['full_name']));
                $email = "{$nameParts[0]}.".end($nameParts).rand(100, 999).'@example.com';
                $userDetail = UserDetail::where('passport', $request->user_details['passport'])->first();
                if (empty($userDetail)) {
                    $user = User::create([
                        'fullname' => $request->users['full_name'],
                        'email' => $email,
                        'password' => bcrypt($request->users['full_name']),
                        'branch_id' => $request->bookings['branch_id'],

                    ]);
                    $user->assignRole(User::TYPE_CUSTOMER);
                    UserDetail::create([
                        'user_id' => $user->id,
                        'passport' => $request->user_details['passport'],
                        'address' => $request->user_details['address'],
                        'phone' => $request->user_details['phone'],
                    ]);
                    $userId = $user->id;
                } else {
                    $userId = $userDetail->user_id;
                    $userDetail->update([
                        'phone' => $request->user_details['phone'],
                    ]);
                }
                // Thêm booking /////
                $dataBooking = [
                    'staff_id' => $request->bookings['staff_id'],
                    'booker_id' => $userId,
                    'branch_id' => $request->bookings['branch_id'],
                    'checkin_time' => $request->bookings['checkin_time'],
                    'sale_agent_id' => $request->bookings['sale_agent_id'] ?? null,
                    'total_amount' => $request->bookings['total_amount'],
                    'deposit' => $request->bookings['deposit'] ?? 0,
                    'quantity_customer' => $request->bookings['quantity_customer'] ?? 0,
                    'note' => $request->bookings['note'] ?? null,

                ];
                if ($request->bookings['sale_agent_id']) {
                    $dataBooking['status_agent'] = Booking::STATUS_AGENT_YES;
                }

                if ($request->bookings['deposit'] >= $request->bookings['total_amount']) {
                    $dataBooking['status_payment'] = Booking::STATUS_PAYMENT_PAID;
                } elseif ($request->bookings['deposit'] > 0) {
                    $dataBooking['status_payment'] = Booking::STATUS_PAYMENT_DEPOSIT;
                }
                $customerIds = [];
                if (is_array($request->bookings['customers'])) {
                    $customerIds = [];
                    foreach ($request->bookings['customers'] as $customer) {
                        if (!isset($customer['passport'])) {
                            continue; // Bỏ qua nếu thiếu passport
                        }

                        $checkUserDetail = UserDetail::where('passport', $customer['passport'])->first();

                        if (empty($checkUserDetail)) {
                            $newUser = User::create([
                                'fullname' => $customer['full_name'],
                                'email' => $customer['email'],
                                'password' => bcrypt($customer['full_name']),
                                'branch_id' => $request->bookings['branch_id'],
                            ]);

                            $newUser->assignRole(User::TYPE_CUSTOMER);

                            UserDetail::create([
                                'user_id' => $newUser->id,
                                'passport' => $customer['passport'],
                                'address' => $customer['address'],
                                'phone' => $customer['phone'] ?? null,
                                'birthday' => $customer['birthday'] ?? null,
                            ]);

                            $customerId = $newUser->id;
                        } else {
                            $customerId = $checkUserDetail->user_id;
                            $checkUserDetail->update([
                                'phone' => $customer['phone'] ?? $checkUserDetail->phone,
                                'address' => $customer['address'] ?? $checkUserDetail->address,
                                'birthday' => $customer['birthday'] ?? $checkUserDetail->birthday,
                            ]);
                        }

                        $customerIds[] = $customerId;
                    }

                    $dataBooking['customer_ids'] = $customerIds;
                }


                $booking = Booking::create($dataBooking);
                //End Thêm booking /////

                foreach ($request->bookings['booking_tour'] as $bookingTourData) {
                    $booking_id = $booking->id;

                    if ($userStaff->quantityVoucher) {
                        $userStaff->update([
                            'quantity_voucher' => $quantityVoucher - 1,
                        ]);
                    }
                    $voucher = Voucher::find($bookingTourData['voucher_id']);
                    $tour = Tour::find($bookingTourData['tour_id']);
                    if ($voucher) {
                        if ($voucher->type == Voucher::TYPE_PERCENT) {
                            $voucherValue = $bookingTourData['price'] - $bookingTourData['price'] * $voucher->value / 100;
                            if ($tour->price_min > $bookingTourData['price'] * $voucher->value / 100) {
                                $voucherValue = $bookingTourData['price'] - $tour->price_min;
                            }
                        } elseif ($voucher->type == Voucher::TYPE_MONEY) {
                            $voucherValue = $voucher->value;
                            if ($tour->price_min > $bookingTourData['price'] - $voucherValue) {
                                $voucherValue = $bookingTourData['price'] - $tour->price_min;
                            }
                        }
                    }
                    $data = [
                        'booking_id' => $booking_id,
                        'tour_id' => $bookingTourData['tour_id'],
                        'name_tour' => $bookingTourData['name_tour'],
                        'start_time' => $bookingTourData['start_time'],
                        'end_time' => $bookingTourData['end_time'],
                        'quantity_customer' => $bookingTourData['quantity_customer'],
                        'voucher_id' => $bookingTourData['voucher_id'] ?? null,
                        'value_voucher' => $voucherValue ?? null,
                        'code_voucher' => $bookingTourData['voucher_code'] ?? null,
                        // 'total_amount' => $bookingTourData['total_amount'],
                        // 'customer_ids' => [$userId],
                        'price' => $bookingTourData['price'],
                        'note' => $bookingTourData['note'],
                    ];

                    $bookingTour = BookingTour::create(
                        $data
                    );

                    // /// BookingActivity
                    // $bookingActivityData = [
                    //     'staff_id' => $request->bookings['staff_id'],
                    //     'name_staff' => User::find($request->bookings['staff_id'])->fullname,
                    //     'booking_tour_id' => $bookingTour->id,
                    //     'customer_ids' => $userId,
                    // ];
                    // $this->bookingActivities(null, $bookingActivityData);
                    // /// End BookingActivity
                    // if(!empty($bookingTourData['booking_services_by_tour'])){
                    //     foreach ($bookingTourData['booking_services_by_tour'] as $servicesTourData) {
                    //         $service = Service::find($servicesTourData['service_id']);
                    //         $servicesTour = BookingServiceByTour::create([
                    //             'booking_tour_id' => $bookingTour->id,
                    //             'service_id' => $servicesTourData['service_id'],
                    //             'name_service' => $service->name,
                    //             'quantity' => $servicesTourData['quantity'],
                    //             'unit' => $servicesTourData['unit'],
                    //             'price' => $servicesTourData['price'],
                    //             // 'customer_ids' => [$userId],
                    //             'sale_agent_id' => $servicesTourData['sale_agent_id'] ?? null,
                    //             'start_time' => $servicesTourData['start_time'] ?? null,
                    //             'end_time' => $servicesTourData['end_time'] ?? null,
                    //             // 'quantity_customer'=>$servicesTourData['quantity_customer']
                    //         ]);
                    //     }
                    // }
                    if(!isEmpty($bookingTourData['booking_services_by_tour'])){
                        foreach ($bookingTourData['booking_services_by_tour'] as $servicesTourData) {
                            $service = Service::find($servicesTourData['service_id']);
                            $servicesTour = BookingServiceByTour::create([
                                'booking_tour_id' => $bookingTour->id,
                                'service_id' => $servicesTourData['service_id'],
                                'name_service' => $service->name,
                                'quantity' => $servicesTourData['quantity'],
                                'unit' => $servicesTourData['unit'],
                                'price' => $servicesTourData['price'],
                                // 'customer_ids' => [$userId],
                                'sale_agent_id' => $servicesTourData['sale_agent_id'] ?? null,
                                'start_time' => $servicesTourData['start_time'] ?? null,
                                'end_time' => $servicesTourData['end_time'] ?? null,
                                // 'quantity_customer'=>$servicesTourData['quantity_customer']
                            ]);
                        }
                    }
                    foreach ($bookingTourData['booking_services_by_tour'] as $servicesTourData) {

                        $service = Service::find($servicesTourData['service_id']);
                        $servicesTour = BookingServiceByTour::create([
                            'booking_tour_id' => $bookingTour->id,
                            'service_id' => $servicesTourData['service_id'],
                            'name_service' => $service->name,
                            'quantity' => $servicesTourData['quantity'],
                            'unit' => $servicesTourData['unit'],
                            'price' => $servicesTourData['price'],
                            // 'customer_ids' => [$userId],
                            'sale_agent_id' => $servicesTourData['sale_agent_id'],
                            'start_time' => $servicesTourData['start_time'],
                            'end_time' => $servicesTourData['end_time'],
                            // 'quantity_customer'=>$servicesTourData['quantity_customer']
                        ]);
                    }
                }

                // return $data = $this->show($booking->id);
                // return  $userStaff;

                return response()->json([
                    'status' => 'success',
                    'message' => 'Booking created successfully',
                    'id' => $booking->id,
                ], HttpResponse::HTTP_CREATED);
                // });
            }
        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show(string $id)
    {
        try {
            $booking = Booking::find($id);
            $data = [];
            $data['booking'] = null;
            if ($booking) {
                if($booking->customer_ids != null){
                    $customerIds = $booking->customer_ids;
                    $customers = User::whereIn('id', $customerIds)->with('userDetail')->get();
                    $data['customers'] = $customers;
                }
                $saleAgents = $booking->saleAgent;
                $staff = $booking->staff;
                $booker = $booking->booker;
                $bookingTours = $booking->bookingTours;
                $deital = $booker->userDetail;
                foreach ($bookingTours as $bookingTour) {
                    if (! empty($bookingTour->customer_ids) && is_array($bookingTour->customer_ids)) {
                        $data['users'] = User::whereIn('id', $bookingTour->customer_ids)->with('userDetail')->get();

                    }
                    $bookingTour['min_price'] = $bookingTour->tour->price_min;
                    $bookingActivities = $bookingTour->bookingActivities;
                    $bookingServices = $bookingTour->bookingTourServiceUsers;
                    $bookingTourServices = $bookingTour->bookingServiceByTours;
                    foreach ($bookingTourServices as $bookingTourService) {
                        $bookingTourService['sale_agent'] = $bookingTourService->saleAgent;
                        $service = Service::find($bookingTourService->service_id);
                        if ($service) {
                            // Gắn trực tiếp service_name vào bookingTourService
                            $bookingTourService->service_name = $service->name;
                        }
                    }
                }

                $data['booking'] = $booking;

                return BaseResponse::success($data, 'success');
            } else {
                return BaseResponse::error('Booking not found.');
            }
        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBookingRequest $request, string $id)
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
            $userData = [
                'full_name' => $request->users['full_name'],
                'phone' => $request->user_details['phone'],
                'passport' => $request->user_details['passport'],
                'birthday' => $request->user_details['birthday'] ?? null,
            ];
            $userId = $this->AddUser($userData);
            if ($userId == null) {
                return BaseResponse::error('User not found', HttpResponse::HTTP_NOT_FOUND);
            }

            $booking = Booking::find($id);
            if (! $booking) {
                return BaseResponse::error('Booking not found.', HttpResponse::HTTP_NOT_FOUND);
            }
            if (isset($request->bookings)) {
                $bookingData = [
                    'sale_agent_id' => $request->bookings['sale_agent_id'] ?? $booking->sale_agent_id,
                    'quantity_customer' => $request->bookings['quantity_customer'] ?? $booking->quantity_customer,
                    'staff_id' => $request->bookings['staff_id'] ?? $booking->staff_id,
                    'booker_id' => $request->bookings['booker_id'] ?? $booking->booker_id,
                    'branch_id' => $request->bookings['branch_id'] ?? $booking->branch_id,
                    'checkin_time' => $request->bookings['checkin_time'] ?? $booking->checkin_time,
                    'total_amount' => $request->bookings['total_amount'] ?? $booking->total_amount,
                    'deposit' => $request->bookings['deposit'] ?? $booking->deposit,
                    'note' => $request->bookings['note'] ?? $booking->note,
                ];
                if ($request->bookings['sale_agent_id']) {
                    $bookingData['status_agent'] = Booking::STATUS_AGENT_YES;
                }

                if ($request->bookings['deposit'] >= $request->bookings['total_amount']) {
                    $bookingData['status_payment'] = Booking::STATUS_PAYMENT_PAID;
                } elseif ($request->bookings['deposit'] > 0) {
                    $bookingData['status_payment'] = Booking::STATUS_PAYMENT_DEPOSIT;
                }
                $customerIds = [];
                if($request->bookings['customers'] && is_array($request->bookings['customers'])){

                    foreach($request->bookings['customers'] as $customer){
                        $checkUserDetail = UserDetail::where('passport', $customer['passport'])->first();
                    if (empty($checkUserDetail)) {
                        $customer = User::create([
                            'fullname' => $customer['full_name'],
                            'email' => $customer['email'] ,
                            'password' => bcrypt($customer['full_name']),
                            'branch_id' => $request->bookings['branch_id'],

                        ]);
                        $customer->assignRole(User::TYPE_CUSTOMER);
                        UserDetail::create([
                            'user_id' => $customer->id,
                            'passport' => $customer['passport'],
                            'address' => $customer['address'] ?? null,
                            'phone' => $customer['phone'] ?? null,
                            'birthday' => $customer['birthday'] ?? null,
                        ]);
                        $customerId = $customer->id;
                    } else {
                        $customerId = $checkUserDetail->user_id;
                        $dataDetail = [];
                        if($customer['phone'] != null){
                            $dataDetail['phone'] = $customer['phone'];
                        }
                        if($customer['birthday'] != null){
                            $dataDetail['birthday'] = $customer['birthday'];
                        }
                        if($customer['address'] != null){
                            $dataDetail['address'] = $customer['address'];
                        }
                        if($customer['email'] != null){
                            $dataDetail['email'] = $customer['email'];
                        }


                        $checkUserDetail->update($dataDetail);
                    }
                    $customerIds[] = $customerId;
                    }
                    $bookingData['customer_ids'] = $customerIds;
                }

                $booking->update($bookingData);

            }
            if (isset($request->bookings['booking_tour'])) {

                foreach ($request->bookings['booking_tour'] as $booking_tour) {
                    if (isset($booking_tour['id'])) {
                        $bookingTour = BookingTour::find($booking_tour['id']);
                        if (! $bookingTour) {
                            return BaseResponse::error('Booking Tour not found for ID: '.$booking_tour['id'], HttpResponse::HTTP_NOT_FOUND);
                        }
                        $bookingTourData = [
                            'quantity_customer' => $booking_tour['quantity_customer'] ?? $bookingTour->quantity_customer,
                            'tour_id' => $booking_tour['tour_id'] ?? $bookingTour->tour_id,
                            'voucher_id' => $booking_tour['voucher_id'] ?? $bookingTour->voucher_id,
                            'code_voucher' => $booking_tour['code_voucher'] ?? $bookingTour->code_voucher,
                            'customer_ids' => $booking_tour['customer_ids'] ?? $bookingTour->customer_ids,
                            'start_time' => $booking_tour['start_time'] ?? $bookingTour->start_time,
                            'end_time' => $booking_tour['end_time'] ?? $bookingTour->end_time,
                            'price' => $booking_tour['price'] ?? $bookingTour->price,
                            'note' => $booking_tour['note'] ?? $bookingTour->note,
                            'status' => $booking_tour['status'] ?? $bookingTour->status,
                        ];

                        $bookingTour->update($booking_tour);
                    } else {
                        $bookingTour = BookingTour::create([
                            'booking_id' => $booking->id,
                            'tour_id' => $booking_tour['tour_id'],
                            'name_tour' => Tour::find($booking_tour['tour_id'])->name,
                            'quantity_customer' => $booking_tour['quantity_customer'],
                            'voucher_id' => $booking_tour['voucher_id'] ?? null,
                            'value_voucher' => $booking_tour['value_voucher'] ?? null,
                            'code_voucher' => $booking_tour['code_voucher'] ?? null,
                            'customer_ids' => [$userId],
                            'price' => $booking_tour['price'],
                            'start_time' => $booking_tour['start_time'],
                            'end_time' => $booking_tour['end_time'],
                            'note' => $booking_tour['note'] ?? null,
                        ]);
                    }
                    if (isset($booking_tour['booking_services_by_tour'])) {
                        foreach ($booking_tour['booking_services_by_tour'] as $serviceData) {
                            if (isset($serviceData['id'])) {

                                $service = BookingServiceByTour::find($serviceData['id']);
                                if (! $service) {
                                    return BaseResponse::error('Service not found for ID: '.$serviceData['id'], HttpResponse::HTTP_NOT_FOUND);
                                }
                                $serviceDataToUpdate = $serviceData;
                                $service->update($serviceDataToUpdate);
                            } else {
                                $service = BookingServiceByTour::create([
                                    'booking_tour_id' => $bookingTour->id,
                                    'service_id' => $serviceData['service_id'],
                                    'name_service' => Service::find($serviceData['service_id'])->name,
                                    'quantity' => $serviceData['quantity'],
                                    'unit' => $serviceData['unit'],
                                    'price' => $serviceData['price'],
                                    'customer_ids' => [$userId],
                                    'sale_agent_id' => $serviceData['sale_agent_id'],
                                    'start_time' => $serviceData['start_time'],
                                    'end_time' => $serviceData['end_time'],
                                ]);
                            }
                        }
                    }

                    if (isset($booking_tour['booking_tour_servicer_users'])) {
                        foreach ($booking_tour['booking_tour_servicer_users'] as $serviceData) {
                            if (isset($serviceData['id'])) {
                                $service = BookingTourServiceUser::find($serviceData['id']);
                                if (! $service) {
                                    return BaseResponse::error('Service not found for ID: '.$serviceData['id'], HttpResponse::HTTP_NOT_FOUND);
                                }
                                $serviceDataToUpdate = $serviceData;
                                $service->update($serviceDataToUpdate);
                            } else {
                                $service = BookingTourServiceUser::create([
                                    'booking_tour_id' => $bookingTour->id,
                                    'service_id' => $serviceData['service_id'],
                                    'quantity' => $serviceData['quantity'],
                                    'unit' => $serviceData['unit'],
                                    'price' => $serviceData['price'],
                                    'user_id' => $userId,
                                    'sale_agent_id' => $serviceData['sale_agent_id'],
                                    'start_time' => $serviceData['start_time'],
                                    'end_time' => $serviceData['end_time'],
                                ]);
                            }
                        }
                    }

                }
            }

            return $this->show($id);
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
    public function create()
    {
        $const = Booking::getConstants();

        return BaseResponse::success($const);
    }

    public function getOneUser(string $id, $status = null)
    {
        try {
            $data = [];
            $booking = Booking::find($id);

            if (! $booking) {
                return BaseResponse::error('Booking not found.', HttpResponse::HTTP_NOT_FOUND);
            }
            if($booking->customer_ids != null){
                $customerIds = $booking->customer_ids;
                $customers = User::whereIn('id', $customerIds)->with('userDetail')->get();
                $data['customers'] = $customers;
            }

            $bookingActivities = $booking->bookingTours->flatMap(function ($bookingTour) {
                return $bookingTour->bookingActivities;
            });
            $customerIds = [];

            if ($bookingActivities) {
                if ($status) {
                    $bookingActivities = $booking->bookingTours->flatMap(function ($bookingTour) use ($status) {
                        return $bookingTour->bookingActivities->where('status', $status);
                    });
                    foreach ($bookingActivities as $activity) {
                        $customerIds = array_merge($customerIds, $activity->customer_ids);
                    }
                    $customerIds = array_unique($customerIds); // Loại bỏ các ID trùng lặp

                } else {
                    foreach ($bookingActivities as $activity) {
                        $customerIds = array_merge($customerIds, $activity->customer_ids);
                    }
                    $customerIds = array_unique($customerIds); // Loại bỏ các ID trùng lặp

                }
            }

            foreach ($customerIds as $customerId) {
                $user = User::find($customerId);

                if ($user) {
                    $userDetail = $user->userDetail;
                    $userData = [
                        'user' => $user,
                        // 'user_detail' => $userDetail,
                        'booking_tours' => $booking->bookingTours->map(function ($bookingTour) {
                            return [
                                'booking_tour' => $bookingTour,
                                'tour' => $bookingTour->tour,
                                'booking_activities' => $bookingTour->bookingActivities,
                                'booking_services' => $bookingTour->bookingServices->map(function ($service) {
                                    return [
                                        'booking_service' => $service,
                                        'service' => $service->service,
                                    ];
                                }),
                                'booking_tour_service_users' => $bookingTour->bookingTourServiceUsers->map(function ($service) {
                                    return [
                                        'booking_tour_service_users' => $service,
                                        'service' => $service->service,
                                    ];
                                }),
                            ];
                        }),
                    ];

                    $data[] = $userData;
                }
            }

            return BaseResponse::success($data);

        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getOneBookingUser(string $id)
    {
        try {
            $data = [];
            $booking = Booking::find($id);
            if (! $booking) {
                return BaseResponse::error('Booking not found', HttpResponse::HTTP_NOT_FOUND);
            }
            $data['booking'] = $booking;
            $bookingTours = $booking->bookingTours;
            if (! $bookingTours) {
                return BaseResponse::error('Booking not found', HttpResponse::HTTP_NOT_FOUND);
            }
            $data['booking']['booking_tours'] = $bookingTours;
            $customerIds = $bookingTours->pluck('customer_ids')->flatten()->unique()->values();
            foreach ($bookingTours as $key => $bookingTour) {
                $check = true;
                if ($bookingTour->bookingActivities()->latest()->first()) {
                    $check = true;
                } else {
                    $check = false;
                }
                if ($check == true) {
                    // unset($bookingTours[$key]);
                    $customerIds = $bookingTour->customer_ids;
                    $users = [];
                    foreach ($customerIds as $customerId) {
                        $user = User::find($customerId);
                        if ($user) {
                            $user->user_detail = $user->userDetail;
                            $user->booking_tour_servicer_users = BookingTourServiceUser::where('booking_tour_id', $bookingTour->id)
                                ->where('user_id', $customerId)
                                ->get();

                            foreach ($user->booking_tour_servicer_users as $booking_tour_servicer_user) {
                                $booking_tour_servicer_user->service = $booking_tour_servicer_user->service()->get();
                            }

                            $user->booking_activities = BookingActivity::where('booking_tour_id', $bookingTour->id)
                                ->whereJsonContains('customer_ids', $customerId)
                                ->latest()
                                ->first();

                            $users[] = $user;
                        }
                    }

                    $bookingTour->setAttribute('users', $users);

                }
            }

            return BaseResponse::success($data);

        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

    }


    // public function cancel(Request $request, string $id)
    // {

    //     try {
    //         // cái nào dùng r thì hủy luôn , mình làm
    //         $now = now();
    //         $booking = Booking::find($id);
    //         $data = [];
    //         $checkrefund = false;

    //         if (! $booking) {
    //             return BaseResponse::error('Booking not found', HttpResponse::HTTP_NOT_FOUND);
    //         }

    //         if ($booking->status_touring === Booking::STATUS_CANCEL) {
    //             return BaseResponse::error('Booking has been cancelled', HttpResponse::HTTP_BAD_REQUEST);
    //         }

    //         $bookingTours = $booking->bookingTours()
    //             ->whereNotIn('status', [BookingTour::STATUS_CANCEL, BookingTour::STATUS_ENDED])
    //             ->get();

    //         if ($bookingTours->isEmpty()) {
    //             return BaseResponse::error('No active Booking Tours to cancel', HttpResponse::HTTP_BAD_REQUEST);
    //         }

    //         $refundBookingTours = $bookingTours->filter(function ($bookingTour) use ($now) {
    //             return $bookingTour->start_time > $now && $bookingTour->status === BookingTour::STATUS_WAITING;
    //         });
    //         $data['refund_booking_tour_ids'] = $refundBookingTours->pluck('id');

    //         $validBookingTours = $bookingTours->filter(function ($bookingTour) use ($now) {
    //             return $bookingTour->end_time > $now && $bookingTour->status === BookingTour::STATUS_IS_MOVING;
    //             // return $bookingTour->end_time > $now && $bookingTour->status === BookingTour::STATUS_IS_MOVING;
    //         });

    //         if ($validBookingTours->isEmpty()) {
    //             // return BaseResponse::error('No Booking Tours can be cancelled', HttpResponse::HTTP_BAD_REQUEST);
    //         } else {
    //             $checkrefund = true;
    //         }

    //         $bookingTourIds = $validBookingTours->pluck('id');
    //         // $data['refund_booking_tour_ids'] = $bookingTourIds;
    //         BookingTour::whereIn('id', $bookingTourIds)->update(['status' => BookingTour::STATUS_CANCEL]);
    //         foreach ($booking->bookingTours()->get() as $tour) {
    //             $tourServices = BookingServiceByTour::where('booking_tour_id', $tour->id)
    //                 ->whereNotIn('status', [BookingServiceByTour::STATUS_CANCEL, BookingServiceByTour::STATUS_ENDED, BookingServiceByTour::STATUS_WAITING])
    //                 ->where('start_time', '<=', $now)
    //                 ->get();
    //             foreach ($tourServices as $service) {
    //                 $service->update(['status' => BookingServiceByTour::STATUS_CANCEL]);
    //             }
    //             $refundTourServices = BookingServiceByTour::where('booking_tour_id', $tour->id)
    //                 ->whereNotIn('status', [BookingServiceByTour::STATUS_IN_PROGRESS, BookingServiceByTour::STATUS_CANCEL])
    //                 ->orWhere('start_time', '>', $now)
    //                 ->get();

    //             // $data['refund_booking_service_by_tours_ids'][] = $refundTourServices->pluck('id');
    //             $data['refund_booking_service_by_tours_ids'] = [];

    //             foreach ($refundTourServices->pluck('id') as $id) {
    //                 if (! in_array($id, $data['refund_booking_service_by_tours_ids'])) {
    //                     $data['refund_booking_service_by_tours_ids'][] = $id;
    //                 }
    //             }

    //             // $data['refund_booking_service_by_tours_ids'][] = $tourServices->pluck('id');

    //             $refundTourServiceUsers = BookingTourServiceUser::where('booking_tour_id', $tour->id)
    //                 ->whereNotIn('status', [BookingTourServiceUser::STATUS_CANCEL, BookingTourServiceUser::STATUS_ENDED, BookingServiceByTour::STATUS_IN_PROGRESS])
    //                 ->where('start_time', '>', $now)
    //                 ->get();
    //             if ($refundTourServiceUsers->isNotEmpty()) {
    //                 if(!isset($data['refund_booking_tours_service_users_ids'])){
    //                     $data['refund_booking_tours_service_users_ids'] = [];
    //                 }
    //                 foreach ($refundTourServiceUsers->pluck('id') as $id) {
    //                 if (! in_array($id, $data['refund_booking_tours_service_users_ids'])) {
    //                     $data['refund_booking_tours_service_users_ids'][] = $id;
    //                 }
    //             }
    //             }
    //             BookingTourServiceUser::where('booking_tour_id', $tour->id)
    //                 ->whereNotIn('status', [
    //                     BookingTourServiceUser::STATUS_CANCEL,
    //                     BookingTourServiceUser::STATUS_ENDED,
    //                     BookingServiceByTour::STATUS_WAITING,
    //                 ])
    //                 ->where('end_time', '>', $now)
    //                 ->update(['status' => BookingTourServiceUser::STATUS_CANCEL]);

    //             $latestActivity = $tour->bookingActivities()->latest()->first();
    //             if ($latestActivity) {
    //                 BookingActivity::create([
    //                     'parent_activity_id' => $latestActivity ? $latestActivity->id : null,
    //                     'staff_id' => auth()->id(),
    //                     'name_staff' => auth()->user()->fullname,
    //                     'booking_tour_id' => $tour->id,
    //                     'customer_ids' => $latestActivity ? $latestActivity->customer_ids : '[]',
    //                     'name' => BookingActivity::NAME_CANCEL,
    //                     'note' => $request->note,
    //                 ]);
    //             }
    //         }
    //         if ($booking->status_payment == Booking::STATUS_PAYMENT_PAID && $checkrefund == false || $booking->status_payment == Booking::STATUS_PAYMENT_DEPOSIT && $checkrefund == false) {
    //             $data['refund_booking'] = [
    //                 'id' => $booking->id,
    //                 'deposit' => $booking->deposit,
    //                 'total_amount' => $booking->total_amount,
    //             ];
    //         } else if ($checkrefund == true || $booking->status_payment == Booking::STATUS_PAYMENT_UNPAID) {
    //             $booking->note = $request->note;
    //             $booking->status_touring = Booking::STATUS_CANCEL;
    //             $booking->save();
    //         }
    //         return BaseResponse::success($data, 'Booking cancelled successfully');
    //     } catch (Throwable $e) {
    //         return BaseResponse::error(
    //             "Error: {$e->getMessage()} in {$e->getFile()} on line {$e->getLine()}",
    //             HttpResponse::HTTP_INTERNAL_SERVER_ERROR
    //         );
    //     }
    // }

    public function cancel(Request $request, string $id)
    {

        try {
            // cái nào dùng r thì hủy luôn , mình làm
            $now = now();
            $booking = Booking::find($id);
            $data = [];
            $checkrefund = false;

            if (! $booking) {
                return BaseResponse::error('Booking not found', HttpResponse::HTTP_NOT_FOUND);
            }

            if ($booking->status_touring === Booking::STATUS_CANCEL) {
                return BaseResponse::error('Booking has been cancelled', HttpResponse::HTTP_BAD_REQUEST);
            }

            $bookingTours = $booking->bookingTours()
                ->whereNotIn('status', [BookingTour::STATUS_CANCEL, BookingTour::STATUS_ENDED])
                ->get();

            if ($bookingTours->isEmpty()) {
                return BaseResponse::error('No active Booking Tours to cancel', HttpResponse::HTTP_BAD_REQUEST);
            }

            $booking->status_touring = Booking::STATUS_CANCEL;
            $booking->save();
        
       
            $bookingTourIds = $bookingTours->pluck('id');
            // $data['refund_booking_tour_ids'] = $bookingTourIds;
            BookingTour::whereIn('id', $bookingTourIds)->update(['status' => BookingTour::STATUS_CANCEL]);
            foreach ($bookingTours as $bookingTour) {
                $tourServices = BookingServiceByTour::where('booking_tour_id', $bookingTour->id)
                    ->whereNotIn('status', [BookingServiceByTour::STATUS_CANCEL, BookingServiceByTour::STATUS_ENDED])
                    // ->where('start_time', '<=', $now)
                    ->get();
                foreach ($tourServices as $service) {
                    $service->update(['status' => BookingServiceByTour::STATUS_CANCEL]);
                }
                

                BookingTourServiceUser::where('booking_tour_id', $bookingTour->id)
                    ->whereNotIn('status', [
                        BookingTourServiceUser::STATUS_CANCEL,
                        BookingTourServiceUser::STATUS_ENDED,
                    ])
                    // ->where('end_time', '>', $now)
                    ->update(['status' => BookingTourServiceUser::STATUS_CANCEL]);

                $latestActivity = $bookingTour->bookingActivities()->latest()->first();
                if ($latestActivity) {
                    BookingActivity::create([
                        'parent_activity_id' => $latestActivity ? $latestActivity->id : null,
                        'staff_id' => auth()->id(),
                        'name_staff' => auth()->user()->fullname,
                        'booking_tour_id' => $bookingTour->id,
                        'customer_ids' => $latestActivity ? $latestActivity->customer_ids : '[]',
                        'name' => BookingActivity::NAME_CANCEL,
                        'note' => $request->note,
                    ]);
                }
            }
          
            return BaseResponse::success($data, 'Booking cancelled successfully');
        } catch (Throwable $e) {
            return BaseResponse::error(
                "Error: {$e->getMessage()} in {$e->getFile()} on line {$e->getLine()}",
                HttpResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
