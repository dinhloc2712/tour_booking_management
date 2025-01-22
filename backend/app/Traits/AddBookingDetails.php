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
trait AddBookingDetails
{
    public function addBookingDetails( $request)
    {
        try {

            // Check thời gian  check in booking - thời gian booking tour /////

            $checkinDate = Carbon::createFromFormat('Y-m-d H:i:s', $request->bookings['checkin_date']);
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

            // Thêm booking_tour /////
            $flag2 = true;
            $error = [];

            foreach ($request->bookings['booking_tour'] as $index => $bookingTourData) {
                $index++;
                $voucher = Voucher::find($bookingTourData['voucher_id']);
                if ($voucher->object_ids) {

                    if (in_array($request->bookings['staff_id'], $voucher->object_ids)) {
                        // return 'Đủ quyền !';
                        $user = User::find($request->bookings['staff_id']);
                        $userDetailes = $user->detail;
                        $quantityVoucher = $userDetailes->quantity_voucher;

                        
                        if (empty($quantityVoucher)) {
                            $flag2 = false;
                            return BaseResponse::error('Nhân viên đã hết lượt sử dụng voucher được cấp !');
                        } else {
                            if ($voucher->type === 'percent') {
                                $gia = round($bookingTourData['price_tour'] * $bookingTourData['quantity_customer'] - $bookingTourData['price_tour'] * $bookingTourData['quantity_customer'] * $bookingTourData['voucher_value'] / 100);
                                if ($gia != $bookingTourData['price']) {
                                    $flag2 = false;
                                    $error[] = 'tour '.$index;
                                } else {

                                }

                            }

                        }

                    } else {
                        $flag2 = false;

                        return BaseResponse::error('Nhân viên không đủ quyền !');
                    }

                } else {
                    $flag2 = false;

                    return BaseResponse::error('Voucher không tồn tại !');

                }

            }

            if ($flag2 == false) {
                return BaseResponse::error('Số tiền giảm của '.implode(', ', $error).' không đúng !');

            } else {

            }

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
                $nameParts = explode(' ', strtolower($request->users['full_name']));
                $email = "{$nameParts[0]}.".end($nameParts).rand(100, 999).'@example.com';
                $userDetail = UserDetail::where('passport', $request->user_details['passport'])->first();
                if (empty($userDetail)) {
                    $user = User::create([
                        'fullname' => $request->users['full_name'],
                        'email' => $email,
                        'password' => bcrypt($request->users['full_name']),

                    ]);
                     UserDetail::create([
                        'user_id' => $user->id,
                        'birthday' => $request->user_details['birthday'],
                        'passport' => $request->user_details['passport'],
                        'address' => $request->user_details['address'],
                        'phone' => $request->user_details['phone'],
                    ]);
                } else {
                    $userDetail->update([
                        'phone' => $request->user_details['phone'],
                    ]);
                }

                // Thêm booking /////
                $dataBooking = [
                    'staff_id' => $request->bookings['staff_id'],
                    'booker_id' => $user->id,
                    'branch_id' => $request->bookings['branch_id'],
                    'checkin_time' => $request->bookings['checkin_date'],
                    'sale_agent_id' => $request->bookings['agent_id'],
                    'deposit' => $request->bookings['deposit'],
                    'note' => $request->bookings['note'],
                    'agent_id' => $request->bookings['agent_id'],

                ];
                if ($request->bookings['agent_id']) {
                    $dataBooking['status_agent'] = Booking::STATUS_AGENT_YES;
                }
                if ($request->bookings['deposit'] >= $price) {
                    $dataBooking['status_payment'] = Booking::STATUS_PAYMENT_PAID;

                }
                $booking = Booking::create($dataBooking);
                //End Thêm booking /////
                foreach ($request->bookings['booking_tour'] as $bookingTourData) {
                    $booking_id = $booking->id;

                    $userDetailes->update([
                        'quantity_voucher' => $quantityVoucher - 1,
                    ]);
                    $data = [
                        'booking_id' => $booking_id,
                        'tour_id' => $bookingTourData['tour_id'],
                        'name_tour' => $bookingTourData['tour_name'],
                        'start_time' => $bookingTourData['start_time'],
                        'end_time' => $bookingTourData['end_time'],
                        'quantity_customer' => $bookingTourData['quantity_customer'],
                        'voucher_id' => $bookingTourData['voucher_id'],
                        'voucher_value' => $bookingTourData['voucher_value'],
                        'voucher_code' => $bookingTourData['voucher_code'],
                        'customer_ids' => $user->id,
                        'price' => $bookingTourData['price'],
                        'note' => $bookingTourData['note'],
                    ];

                    $bookingTour = BookingTour::create(
                        $data
                    );
                    foreach ($bookingTourData['booking_services_by_tour'] as $servicesTourData) {

                        $service = Service::find($servicesTourData['service_id']);
                        $servicesTour = BookingTourService::create([
                            'booking_tour_id' => $bookingTour->id,
                            'service_id' => $servicesTourData['service_id'],
                            'name_service' => $service->name,
                            'quantity' => $servicesTourData['quantity'],
                            'unit' => $servicesTourData['unit'],
                            'price' => $servicesTourData['price'],
                            'agent_id' => $servicesTourData['agent_id'],
                            'start_time' => $servicesTourData['start_time'],
                            'end_time' => $servicesTourData['end_time'],
                        ]);

                    }
                }

                return BaseResponse::success(null, 'Success');
                // // });
            }

        } catch (Throwable $e) {
            $message = $e->getMessage();
            $file = $e->getFile();
            $line = $e->getLine();

            return BaseResponse::error("Error: $message in $file on line $line", HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}