<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\BaseController;
use App\Http\Requests\API\BillRequest;
use App\Http\Responses\BaseResponse;
use App\Models\Bill;
use App\Models\BillService;
use App\Models\BillTour;
use App\Models\Booking;
use App\Models\BookingActivity;
use App\Models\BookingTour;
use App\Models\BookingTourServiceUser;
use App\Models\DebtAgentService;
use App\Models\DebtDetail;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\RefundService;
use App\Models\RefundTour;
use App\Models\User;
use App\Models\Voucher;
use Faker\Provider\Base;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class BillController extends BaseController
{
    /**
     * Display a listing of the resource.
     */

    protected $table;

    public function __construct()
    {
        $this->table = Bill::class;
    }
    public function index()
    {
        return $this->get($this->table);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try{
            $data = $request->except('bill_tours', 'bill_services', 'payment', 'refunds');
            $quantity_customer = $data['quantity_customer'];
            $total_amount = $data['total_amount'];
            $bills = $this->table::where('booking_id', $data['booking_id'])->get();
            if(isset($bills)){
                foreach($bills as $bill){
                    $quantity_customer += $bill->quantity_customer;
                    $total_amount += $bill->total_amount;
                }
            }
            $bill = $this->table::create($data);
            if(isset($data['voucher_id'])){
                $voucher = Voucher::find($data['voucher_id']);
                if(!isset($voucher)){
                    return BaseResponse::error('voucher không tồn tại', HttpResponse::HTTP_BAD_REQUEST);
                }

                if(!$voucher->is_active){
                    return BaseResponse::error('voucher không đang không hoạt động', HttpResponse::HTTP_BAD_REQUEST);
                }

                if($voucher->quantity == 0){
                    return BaseResponse::error('Hết voucher', HttpResponse::HTTP_BAD_REQUEST);
                }

                if($data['code_voucher'] != $voucher->code){
                    return BaseResponse::error('mã voucher không chính xác', HttpResponse::HTTP_BAD_REQUEST);
                }
                if($voucher->type == Voucher::TYPE_MONEY){
                    if($data['value_voucher'] != $voucher->value){
                        return BaseResponse::error('giá trị voucher không đúng', HttpResponse::HTTP_BAD_REQUEST);
                    }
                }

                if($voucher->type == Voucher::TYPE_PERCENT){
                    $valueVoucher = $data['total_amount'] * $voucher->value / 100;
                    if($valueVoucher > $voucher->limit){
                        $valueVoucher = $voucher->limit;
                    }
                    if($data['value_voucher'] != $valueVoucher){
                        return BaseResponse::error('giá trị voucher không đúng', HttpResponse::HTTP_BAD_REQUEST);
                    }
                }

                $bill->voucherUsages()->create(['voucher_id' => $voucher->id, 'time_usage' => now()]);
            }
            if($request->has('bill_tours')){
                foreach ($request->bill_tours as $bill_tour){
                    $bill_tour['bill_id'] = $bill->id;
                    BillTour::create($bill_tour);
                    $bookingActivity = BookingActivity::where('booking_tour_id', $bill_tour['booking_tour_id'])
                    ->where('name', BookingActivity::NAME_PAID)->latest()->first();
                    if(isset($bookingActivity)){
                        $customer_ids = array_merge($bookingActivity->customer_ids, $bill_tour['customer_ids']);
                        $bookingActivity->update('customer_ids', $customer_ids);
                    }else{
                        $bookingActivityNew = [
                            'booking_tour_id' => $bill_tour['booking_tour_id'],
                            'staff_id' => $data['staff_id'],
                            'name_staff' => $data['name_staff'],
                            'customer_ids' => $bill_tour['customer_ids'],
                            'name' => BookingActivity::NAME_PAID,
                            'note' => $bill_tour['note'],
                        ];

                        $bookingActivityBefore = BookingActivity::where('booking_tour_id', $bill_tour['booking_tour_id'])
                        ->latest()->first();
                        if(isset($bookingActivityBefore)){
                            $bookingActivityNew['parent_activity_id'] = $bookingActivityBefore->id;
                        }

                        BookingActivity::create($bookingActivityNew);
                    }

                }
            }

            if($request->has('bill_services')){
                foreach ($request->bill_services as $bill_service){
                    $bill_service['bill_id'] = $bill->id;
                    BillService::create($bill_service);
                    if(isset($bill_service['sale_agent_id'])){
                        $debtAgent = DebtAgentService::where('sale_agent_id', $bill_service['sale_agent_id'])->first();

                        $debtDetail = DebtDetail::where('debt_agent_service_id', $debtAgent->id)
                                    ->where('service_id', $bill_service['service_id'])
                                    ->where('price', $bill_service['price'])->first();

                        if(!isset($debtDetail)){
                            $debtDetail = ['debt_agent_service_id' => $debtAgent->id,
                                        'service_id' => $bill_service['service_id'],
                                        'name_service' => $bill_service['name_service'],
                                        'price' => $bill_service['price'],
                                        'quantity' => $bill_service['quantity'],
                                        'unit' => $bill_service['unit']
                                        ];
                            DebtDetail::create($debtDetail);
                        }else{
                            $debtDetail->update([
                                'quantity' => DB::raw('quantity + ' . $bill_service['quantity']),
                                'unit' => DB::raw('unit + '. $bill_service['unit'])
                            ]);
                        }

                        $revenue = $bill_service['price'] * $bill_service['quantity'] * $bill_service['unit'];
                        $debtAgent->increment('revenue', $revenue);
                    }

                }
            }

            if($request->has('refunds')){
                $refunds = $request->refunds;
                $refunds['bill_id'] = $bill->id;
                $refund = Refund::create($refunds);
                if(isset($refunds['refundTours'])){
                    foreach($refunds['refundTours'] as $refundTour){
                        $bookingTour = BookingTour::find($refundTour['booking_tour_id']);
                        if(!isset($bookingTour)){
                            BaseResponse::error('Booking tour có id '.$refundTour['booking_tour_id'].' không tồn tại', 404);
                        }
                        $refundTour['refund_id'] = $refund->id;
                        RefundTour::create($refundTour);
                        $bookingActivity = BookingActivity::where('booking_tour_id', $refundTour['booking_tour_id'])
                        ->where('name', BookingActivity::NAME_CANCEL)->latest()->first();
                        if(isset($bookingActivity)){
                            $customer_ids = array_merge($bookingActivity->customer_ids, $refundTour['customer_ids']);
                            $bookingActivity->update('customer_ids', $customer_ids);
                        }else{
                            $bookingActivityNew = [
                                'booking_tour_id' => $refundTour['booking_tour_id'],
                                'staff_id' => $data['staff_id'],
                                'name_staff' => $data['name_staff'],
                                'customer_ids' => $refundTour['customer_ids'],
                                'name' => BookingActivity::NAME_CANCEL,
                                'note' => $bill_tour['note'],
                            ];

                            $bookingActivityBefore = BookingActivity::where('booking_tour_id', $refundTour['booking_tour_id'])
                            ->latest()->first();
                            if(isset($bookingActivityBefore)){
                                $bookingActivityNew['parent_activity_id'] = $bookingActivityBefore->id;
                            }

                            BookingActivity::create($bookingActivityNew);
                        }
                        $customerIdsOnBookingTour = sort($bookingTour->customer_ids);
                        $customerIdsOnRefund = sort($refundTour['customer_ids']);
                        if($customerIdsOnBookingTour == $customerIdsOnRefund){
                            $bookingTour->update('status', BookingTour::STATUS_CANCEL);
                        }else{
                            $customerIds = array_diff($bookingTour->customer_ids, $customerIdsOnRefund);
                            $bookingTour->update('customer_ids', $customerIds);
                        }
                    }
                }

                if(isset($refunds['refundServices'])){
                    foreach($refunds['refundServices'] as $refundService){
                        $bookingTourServiceUser = BookingTourServiceUser::find($refundService['booking_tour_service_user_id']);
                        if(!isset($bookingTourServiceUser)){
                            BaseResponse::error('booking_tour_service_user có id '.$refundService['booking_tour_service_user_id'].' không tồn tại', 404);
                        }
                        $refundService['refund_id'] = $refund->id;
                        RefundService::create($refundService);

                        $bookingTourServiceUser->update(['status'=> BookingTourServiceUser::STATUS_CANCEL]);

                        if(isset($refundService['sale_agent_id'])){
                            $debtAgent = DebtAgentService::where('sale_agent_id', $refundService['sale_agent_id'])->first();
                            $debtDetail = DebtDetail::where('debt_agent_service_id', $debtAgent->id)
                                        ->where('service_id', $refundService['service_id'])
                                        ->where('price', $refundService['price'])->first();
                            if(isset($debtDetail)){
                                $debtDetail->update([
                                    'quantity' => DB::raw('quantity - ' . $refundService['quantity']),
                                    'unit' => DB::raw('unit - '. $refundService['unit'])
                                ]);
                            }

                            $revenue = $refundService['price'] * $refundService['quantity'] * $refundService['unit'];
                            $debtAgent->decrement('revenue', $revenue);
                        }

                    }
                }
            }
            $payment = $request->payment;
            $payment['bill_id'] = $bill->id;
            Payment::create($payment);

            $booking = Booking::find($data['booking_id']);
            if($quantity_customer == $booking->quantity_customer){
                // if($booking->deposit > 0){
                //     $total_amount = $total_amount - $booking->deposit;
                // }
                if($total_amount == $booking->total_amount){
                    $booking->update(['status_payment' => Booking::STATUS_PAYMENT_PAID,
                                  'status_touring' => Booking::STATUS_TOURING_CHECKED_IN]);
                    if(isset($booking->sale_agent_id)){
                        $booking->update(['status_agent' => Booking::STATUS_AGENT_UNPAID]);
                    }
                }
            }
            DB::commit();

            return BaseResponse::success($bill, 'Payment', HttpResponse::HTTP_CREATED);
        }catch(Throwable $th){
            DB::rollBack();
            return BaseResponse::error($th->getMessage() , HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try{
            $data = $this->table::with(['staff:id,fullname', 'customer:id,fullname', 'billServices', 'billTours'])
            ->find($id);

            if(!$data){
                return BaseResponse::error('Không tìm thấy bill', HttpResponse::HTTP_NOT_FOUND);
            }

            foreach ($data->billTours as $index => $billTour){
                $data->billTours[$index]->name_customers = [];
                $name = [];
                foreach ($billTour->customer_ids as $customer){
                    $infor = User::find($customer);
                    if(!$infor){
                        $infor = "Không tìm thấy thông tin khách hàng";
                    }else{
                        $infor = $infor->fullname;
                    }
                    $name[] = $infor;
                }
                $data->billTours[$index]->name_customers =  $name;
            } ;

            return BaseResponse::success($data, 'Chi tiết bill');
        }catch(\Throwable $th){
            if ($th instanceof ModelNotFoundException){
                return BaseResponse::error('Không tìm thấy bill', HttpResponse::HTTP_NOT_FOUND);
            }

            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {

    }

    public function create(Request $request){
        try{
            $req = $request->all();
            $typeBills = [Bill::TYPE_BILL_RED, Bill::TYPE_NORMAL];
            $typePayments = [Payment::TYPE_BANKING, Payment::TYPE_CASH];
            $booking = Booking::find($req['booking_id']);
            $bookingTours = [];

            $refundTours = [];
            $refundServices = [];
            $customers = [];
            $customerRefunds = [];
            $deposit = $booking->deposit;
            $quantity_customer = 0;
            if(isset($req['customer_ids'])){
                foreach ($req['customer_ids'] as $id){
                    $customer = User::with('userDetail')->find($id);
                    if(!isset($customer)){
                        return BaseResponse::error('Khách hàng id: '.$id.'không tồn tại', HttpResponse::HTTP_BAD_REQUEST);
                    }
                    $quantity_customer += 1;
                    $customers[] = $customer;
                }
            }

            if($booking->status_payment == Booking::STATUS_PAYMENT_DEPOSIT){
                $bills = Bill::where('booking_id', $booking->id);
                if(isset($bills)){
                    foreach($bills as $bill){
                        if($bill->quantity_customer > 0){
                            if($bill->deposit > 0){
                                $deposit = 0;
                            }
                        }
                    }
                }
            }

            if(isset($req['bookingTour_ids'])){
                foreach($req['bookingTour_ids'] as $bookingTourId){
                    $quantity = 0;
                    $bookingServices = [];
                    $customer_ids = [];
                    $bookingTour = BookingTour::find($bookingTourId);

                    foreach ($req['customer_ids'] as $id) {
                        if(in_array($id, $bookingTour->customer_ids)){
                            $quantity += 1;
                            $customer_ids[] = $id;
                        }
                    }

                    if(isset($req['bookingTourServiceUser_ids'])){
                        foreach($req['bookingTourServiceUser_ids'] as $id){
                            $bookingService = BookingTourServiceUser::with(['service:id,name','bookingTour:id,tour_id'])->find($id);
                            if(isset($bookingService)){
                                if($bookingService->booking_tour_id == $bookingTourId){
                                    $bookingServices[] = $bookingService;
                                }
                            }
                        }
                    }

                    if($quantity > 0){
                        if(isset($bookingTour->voucher_id)){
                            $bookingTour->price = round($bookingTour->price - $bookingTour->value_voucher, 2);
                        }
                        $bookingTours[] = ['booking_tour_id' => $bookingTour->id,
                                         'name_tour' => $bookingTour->name_tour,
                                         'customer_ids' => $customer_ids,
                                         'quantity_customer' => $quantity,
                                         'price' => $bookingTour->price,
                                         'note' => $bookingTour->note,
                                         'bookingServices' => $bookingServices];
                    }
                }
            }

            if(isset($req['refunds'])){
                foreach ($req['refunds']['customer_ids'] as $id){
                    $customer = User::with('userDetail')->find($id);
                    if(!isset($customer)){
                        return BaseResponse::error('Khách hàng id: '.$id.'không tồn tại', HttpResponse::HTTP_BAD_REQUEST);
                    }
                    $customerRefunds[] = $customer;
                }
                if(isset($req['refunds']['bookingTour_ids'])){
                    foreach($req['refunds']['bookingTour_ids'] as $bookingTourId){
                        $quantity = 0;
                        $customer_ids = [];
                        $bookingTour = BookingTour::find($bookingTourId);

                        foreach ($req['refunds']['customer_ids'] as $id) {
                            if(in_array($id, $bookingTour->customer_ids)){
                                $quantity += 1;
                                $customer_ids[] = $id;
                            }
                        }

                        if($quantity > 0){
                            if(isset($bookingTour->voucher_id)){
                                $bookingTour->price = round($bookingTour->price - $bookingTour->value_voucher, 2);
                            }
                            $refundTours[] = ['booking_tour_id' => $bookingTour->id,
                                            'name_tour' => $bookingTour->name_tour,
                                            'customer_ids' => $customer_ids,
                                            'quantity_customer' => $quantity,
                                            'price' => $bookingTour->price,
                                            'note' => $bookingTour->note];
                        }
                    }
                }

                if(isset($req['refunds']['bookingTourServiceUser_ids'])){
                    foreach($req['refunds']['bookingTourServiceUser_ids'] as $id){
                        $refundServices[] = BookingTourServiceUser::with('service:id,name')->find($id);
                    }
                }
            }


            $data = ['typeBills'=>$typeBills, 'typePayments'=>$typePayments, 'quantity_customer' => $quantity_customer,
                    'customers' => $customers, 'bookingTours' => $bookingTours, 'deposit' => $deposit,
                    'customerRefunds' => $customerRefunds, 'refundTours' => $refundTours, 'refundServices' => $refundServices];

            return BaseResponse::success($data);

        }catch(Throwable $th){
            return BaseResponse::error($th->getMessage() . 'in line: ' . $th->getLine() , 500);
        }
    }

    public function getBillBooking($id){
        $data = Bill::with(['Booking', 'customer', 'refunds', 'payments', 'billTours', 'billServices'])->where('booking_id', $id)->get();
        return BaseResponse::success($data);
    }

    public function createDeposit($bookingId){
        $typeBills = [Bill::TYPE_BILL_RED, Bill::TYPE_NORMAL];
        $typePayments = [Payment::TYPE_BANKING, Payment::TYPE_CASH];
        $booking = Booking::find($bookingId);
        $data = [];
        if(isset($booking)){
            $deposit = $booking->deposit;
            $booker = User::with('userDetail')->find($booking->booker_id);
            $data = ['typeBills' => $typeBills,
                    'typePayments' => $typePayments,
                    'booker' => $booker,
                    'deposit' => $deposit];
        }

        return BaseResponse::success($data);
    }

    public function getBillBookingTour($bookingTourId){
        $billTours = BillTour::where('booking_tour_id', $bookingTourId)->get();
        if(isset($billTours)){
            foreach($billTours as $index=>$billTour){
                $customers = [];
                if(isset($billTour->customer_ids)){
                    foreach ($billTour->customer_ids as $id) {
                        $customers[] = User::with('userDetail')->find($id);
                    }
                }
                $billTours[$index]['customers'] = $customers;
            }
        }
        return BaseResponse::success($billTours);
    }

    public function createRefundBooking($bookingId){
        $booking = Booking::find($bookingId);
        $bookingTours = [];
        $customers = [];
        if(!isset($booking)){
            BaseResponse::error('booking có id '. $bookingId. ' không tồn tại', 404);
        }
        if($booking->status_payment == Booking::STATUS_PAYMENT_PAID){
            $customerIds = [];
            if(isset($booking->bookingTours)){
                foreach($booking->bookingTours as $index => $bookingTour){
                    $customerIds = $customerIds + $bookingTour['customer_ids'];
                    $bookingTourServiceUsers = [];
                    if($bookingTour['status'] != BookingTour::STATUS_CANCEL){
                        if(isset($booking->bookingTours[$index]->userservices)){
                            foreach($booking->bookingTours[$index]->userservices as $bookingService){
                                if($bookingService['status'] != BookingTourServiceUser::STATUS_CANCEL){
                                    $bookingTourServiceUsers[] = $bookingService;
                                }
                            }
                        }
                        if(isset($bookingTour['voucher_id'])){
                            $bookingTour['price'] = round($bookingTour['price'] - $bookingTour['value_voucher'], 2);
                        }
                        $bookingTours[] = ['booking_tour_id' => $bookingTour['id'],
                                         'name_tour' => $bookingTour['name_tour'],
                                         'customer_ids' => $bookingTour['customer_ids'],
                                         'quantity_customer' => $bookingTour['quantity'],
                                         'price' => $bookingTour['price'],
                                         'bookingServices' => $bookingTourServiceUsers
                                        ];
                    }
                }
            }
            foreach($customerIds as $id){
                $customer = User::with('userDetail')->find($id);
                if(isset($customer)){
                    $customers[] = $customer;
                }

            }
            $booking = Booking::find($bookingId);
            $data = ['customers' => $customers, 'booking' => $booking, 'bookingTours' => $bookingTours];
        }

        if($booking->status_payment == Booking::STATUS_PAYMENT_DEPOSIT){
            $booking->booker->userDetail;
            $booker = $booking->booker;
            $deposit = $booking->deposit;
            $data = ['booking_id' => $bookingId, 'booker' => $booker, 'deposit' => $deposit];
        }

        return BaseResponse::success($data);
    }
}
