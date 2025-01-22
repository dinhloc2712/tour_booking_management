<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Responses\BaseResponse;
use App\Models\Bill;
use App\Models\BillTour;
use App\Models\BookingTour;
use App\Models\Branch;
use App\Models\Refund;
use App\Models\SaleAgent;
use App\Models\Tour;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\BookingActivity;
use App\Models\DebtAgentService;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class StatisticController extends Controller
{
    public function statisticBooking(Request $request)
    {
        $from_date = $request->input('from_date');
        $to_date = $request->input('to_date');

        $query = Booking::query();

        if (empty($from_date) && empty($to_date)) {
            $from_date = Carbon::today()->startOfDay();
            $to_date = Carbon::today()->endOfDay();
        } elseif (!empty($from_date) && !empty($to_date)) {
            $from_date = Carbon::parse($from_date)->startOfDay();
            $to_date = Carbon::parse($to_date)->endOfDay();
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Thông tin truyền vào không hợp lệ',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Tạo danh sách các ngày trong khoảng từ from_date đến to_date
        $period = new \DatePeriod(
            new \DateTime($from_date),
            new \DateInterval('P1D'),
            new \DateTime($to_date)
        );

        $dates = [];
        foreach ($period as $date) {
            $dates[$date->format("Y-m-d")] = [
                'date' => $date->format("Y-m-d"),
                'total_bookings' => 0,
                'total_deposit' => 0,
                'paid_bookings' => 0,
                'unpaid_bookings' => 0,
                'partial_paid_bookings' => 0,
                'sale_agent_bookings' => 0,
            ];
        }

        // Lấy dữ liệu từ CSDL với khoảng thời gian chính xác từ 00:00:00 to 23:59:59
        $statistics = $query->selectRaw('DATE(created_at) as date')
            ->selectRaw('COUNT(*) as total_bookings')
            ->selectRaw('SUM(COALESCE(deposit, 0)) as total_deposit')
            ->selectRaw("SUM(CASE WHEN status_payment = 'paid' THEN 1 ELSE 0 END) as paid_bookings")
            ->selectRaw("SUM(CASE WHEN status_payment = 'unpaid' THEN 1 ELSE 0 END) as unpaid_bookings")
            ->selectRaw("SUM(CASE WHEN status_payment = 'partial' THEN 1 ELSE 0 END) as partial_paid_bookings")
            ->selectRaw("SUM(CASE WHEN sale_agent_id IS NOT NULL THEN 1 ELSE 0 END) as sale_agent_bookings")
            ->whereBetween('created_at', [$from_date, $to_date])
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->keyBy('date')
            ->toArray();

        // Kết hợp dữ liệu lấy từ CSDL với danh sách ngày đầy đủ
        $totals = [
            'total_bookings' => 0,
            'total_deposit' => 0,
            'paid_bookings' => 0,
            'unpaid_bookings' => 0,
            'partial_paid_bookings' => 0,
            'sale_agent_bookings' => 0,
        ];

        foreach ($dates as $date => &$values) {
            if (isset($statistics[$date])) {
                $values = array_merge($values, $statistics[$date]);

                // Cộng dồn vào totals
                $totals['total_bookings'] += $statistics[$date]['total_bookings'];
                $totals['total_deposit'] += $statistics[$date]['total_deposit'];
                $totals['paid_bookings'] += $statistics[$date]['paid_bookings'];
                $totals['unpaid_bookings'] += $statistics[$date]['unpaid_bookings'];
                $totals['partial_paid_bookings'] += $statistics[$date]['partial_paid_bookings'];
                $totals['sale_agent_bookings'] += $statistics[$date]['sale_agent_bookings'];
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Thống kê Bookings từ ' . $from_date->toDateString() . ' đến ' . $to_date->toDateString(),
            'data' => array_values($dates),
            'totals' => $totals
        ], Response::HTTP_OK);
    }

    public function statisticBookingsPerDay()
    {
        $current_year = Carbon::now()->year;
        $current_month = Carbon::now()->month;

        $days_in_month = Carbon::createFromDate($current_year, $current_month, 1)->daysInMonth;
        $days = []; // Mảng chứa thông tin từng ngày
        $total_bookings_per_day = []; // Mảng chỉ chứa số lượng bookings

        for ($day = 1; $day <= $days_in_month; $day++) {
            $booking_count = Booking::whereDate('created_at', Carbon::createFromDate($current_year, $current_month, $day))
                ->count();

            $days[] = [
                'day' => $day,
                'date' => Carbon::createFromDate($current_year, $current_month, $day)->toDateString(),
                'total_bookings' => $booking_count,
            ];

            // Thêm số lượng bookings vào mảng chỉ chứa số
            $total_bookings_per_day[] = $booking_count;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Số lượng Bookings theo từng ngày trong tháng ' . $current_month . '/' . $current_year,
            'data' => $days, // Mảng chứa thông tin từng ngày
            'total_bookings_per_day' => $total_bookings_per_day, // Mảng chứa số lượng bookings của từng ngày
        ], Response::HTTP_OK);
    }

    public function statisticBookingsPerMonth()
    {
        $year = Carbon::now()->year;

        // Trả về số lượng bookings theo từng tháng trong năm hiện tại
        $bookings_per_month = [];
        $total_bookings_per_month = []; // Mảng chứa số lượng bookings từng tháng

        // Lặp qua từng tháng từ 1 đến 12
        for ($month = 1; $month <= 12; $month++) {
            $booking_count = Booking::whereMonth('created_at', $month)
                ->whereYear('created_at', $year)
                ->count();

            // Thêm thông tin tháng và tổng số bookings vào mảng
            $bookings_per_month[] = [
                'month' => $month,
                'total_bookings' => $booking_count,
            ];

            // Thêm số lượng bookings vào mảng chỉ chứa số
            $total_bookings_per_month[] = $booking_count;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Số lượng Bookings theo từng tháng trong năm ' . $year,
            'year' => $year,
            'bookings_per_month' => $bookings_per_month, // Mảng chứa số lượng bookings của từng tháng
            'total_bookings_per_month' => $total_bookings_per_month, // Mảng chứa số lượng bookings từng tháng
        ], Response::HTTP_OK);
    }

    public function statisticBookingsPerWeek()
    {
        $month = Carbon::now()->month;
        $year = Carbon::now()->year;

        // Lấy ngày đầu tiên và ngày cuối cùng của tháng
        $start_of_month = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $end_of_month = $start_of_month->copy()->endOfMonth();

        // Tính số tuần trong tháng
        $weeks_in_month = [];
        $total_bookings_per_week = []; // Mảng chứa số lượng bookings từng tuần
        $current_week_start = $start_of_month->copy()->startOfWeek();

        // Lặp qua từng tuần
        while ($current_week_start->lte($end_of_month)) {
            // Ngày kết thúc của tuần hiện tại
            $current_week_end = $current_week_start->copy()->endOfWeek();

            // Đảm bảo ngày kết thúc không vượt quá cuối tháng
            if ($current_week_end->gt($end_of_month)) {
                $current_week_end = $end_of_month;
            }

            // Đếm số lượng bookings trong tuần này
            $booking_count = Booking::whereBetween('created_at', [$current_week_start, $current_week_end])
                ->count();

            // Lưu số lượng bookings cho tuần này
            $weeks_in_month[] = [
                'start_of_week' => $current_week_start->toDateString(),
                'end_of_week' => $current_week_end->toDateString(),
                'total_bookings' => $booking_count,
            ];

            // Thêm số lượng bookings vào mảng chỉ chứa số
            $total_bookings_per_week[] = $booking_count;

            // Chuyển sang tuần tiếp theo
            $current_week_start->addWeek();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Số lượng Bookings theo từng tuần trong tháng ' . $month . '/' . $year,
            'month' => $month,
            'year' => $year,
            'weeks_in_month' => $weeks_in_month, // Mảng chứa số lượng bookings của từng tuần
            'total_bookings_per_week' => $total_bookings_per_week, // Mảng chứa số lượng bookings từng tuần
        ], Response::HTTP_OK);
    }

    public function statisticBookingOfDayDetails(Request $request)
    {
        // Nhận ngày từ request
        $date = $request->input('date');

        if (empty($date)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ngày chưa được truyền vào',
            ], 400);
        }

        // Chuyển đổi date từ string sang Carbon để dễ xử lý
        $date = Carbon::parse($date)->format('Y-m-d');

        // Truy vấn các booking trong ngày và join với bảng users, branches, booking_tours, tours, user_details
        $bookings = DB::table('bookings')
            ->join('users as staff', 'bookings.staff_id', '=', 'staff.id') // Join bảng users cho nhân viên
            ->join('users as booker', 'bookings.booker_id', '=', 'booker.id') // Join bảng users cho khách hàng
            ->leftJoin('sale_agents', 'bookings.sale_agent_id', '=', 'sale_agents.id') // Join bảng sale_agents cho đại lý (nếu có)
            ->leftJoin('branches', 'bookings.branch_id', '=', 'branches.id') // Join bảng branches để lấy tên chi nhánh
            ->leftJoin('booking_tours', 'bookings.id', '=', 'booking_tours.booking_id') // Join bảng booking_tours
            ->leftJoin('user_details', 'bookings.booker_id', '=', 'user_details.user_id') // Join bảng user_details để lấy phone
            ->select(
                'bookings.id as booking_id',
                'bookings.created_at',
                'bookings.status_payment',  // Lấy trạng thái thanh toán
                'bookings.deposit',
                'booker.fullname as booker_name',  // Lấy fullname của khách hàng
                'user_details.phone as booker_phone',  // Lấy số điện thoại của khách hàng từ bảng user_details
                'branches.name as branch_name',  // Lấy tên chi nhánh từ bảng branches
                'staff.fullname as staff_name',  // Lấy fullname của nhân viên
                'sale_agents.name as sale_agent_name', // Lấy tên đại lý (nếu có)
                'booking_tours.name_tour as tour_name',  // Lấy tên tour
                'booking_tours.start_time as tour_start_time'  // Thêm thông tin start_time của tour để sắp xếp
            )
            ->whereDate('bookings.created_at', $date)
            ->orderBy('bookings.created_at', 'asc')  // Sắp xếp các booking theo thời gian tạo (created_at) tăng dần
            ->orderBy('booking_tours.start_time')  // Sắp xếp các tour theo start_time
            ->get();

        // Kiểm tra nếu không có booking nào
        if ($bookings->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Không có booking nào trong ngày ' . $date,
                'data' => [],
            ], 200);
        }

        // Biến để lưu kết quả cuối cùng
        $result = [];

        // Duyệt qua các booking và nhóm tour theo booking_id
        foreach ($bookings as $booking) {
            // Kiểm tra xem booking đã có trong kết quả hay chưa
            if (!isset($result[$booking->booking_id])) {
                // Nếu chưa có, tạo mới một mảng cho booking này
                $result[$booking->booking_id] = [
                    'created_at' => $booking->created_at,
                    'tours_name' => [], // Mảng chứa tên các tour
                    'status_payment' => $booking->status_payment,
                    // Kiểm tra nếu deposit là null thì gán giá trị bằng 0
                    'deposit' => $booking->deposit ?? '0',  // Nếu deposit là null thì gán bằng "0"
                    'booker_name' => $booking->booker_name,
                    'booker_phone' => $booking->booker_phone, // Lấy số điện thoại của khách hàng
                    'branch_name' => $booking->branch_name,
                    'staff_name' => $booking->staff_name,
                    'sale_agent_name' => $booking->sale_agent_name ?? '', // Nếu không có đại lý thì để chuỗi rỗng
                ];
            }

            // Thêm tên tour vào mảng tours_name của booking
            $result[$booking->booking_id]['tours_name'][] = $booking->tour_name;
        }

        // Chuyển kết quả từ mảng kết quả thành danh sách
        $final_result = array_values($result);

        // Trả về kết quả
        return response()->json([
            'status' => 'success',
            'message' => 'Chi tiết bookings trong ngày ' . $date,
            'data' => $final_result,
        ], 200);
    }

    public function statisticTotalAmount(Request $request)
    {
        $from_date = $request->input('from_date');
        $to_date = $request->input('to_date');

        // Kiểm tra và xử lý dữ liệu đầu vào
        if (empty($from_date) || empty($to_date)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thông tin truyền vào không hợp lệ',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Chuyển từ chuỗi sang đối tượng Carbon
        $from_date = Carbon::parse($from_date)->startOfDay();
        $to_date = Carbon::parse($to_date)->endOfDay();

        // Tạo phạm vi ngày
        $period = new \DatePeriod(
            new \DateTime($from_date),
            new \DateInterval('P1D'),
            new \DateTime($to_date)
        );

        $dates = [];
        $totals = [
            'total_amount_bill' => 0,
            'total_amount_refund' => 0,
            'total_amount_deposit' => 0,
            'total_revenue' => 0,
            'total_count_bill_paid' => 0,
            'total_count_bill_refund' => 0,
            'total_count_booking_deposit' => 0,
        ];

        // Khởi tạo mảng cho các ngày
        foreach ($period as $date) {
            $formatted_date = $date->format("Y-m-d");
            $dates[$formatted_date] = [
                'date' => $formatted_date,
                'total_amount_bill' => 0,
                'total_amount_refund' => 0,
                'total_amount_deposit' => 0,
                'total_revenue' => 0,
                'count_bill_paid' => 0,
                'count_bill_refund' => 0,
                'count_booking_deposit' => 0,
            ];
        }

        // Lấy thông tin từ bảng payments (amount > 0 là thu tiền, < 0 là hoàn tiền)
        $payments = Payment::selectRaw('DATE(created_at) as date, amount, bill_id')
            ->whereBetween('created_at', [$from_date, $to_date])
            ->get()
            ->groupBy('date');

        // Lấy thông tin từ bảng bookings
        $bookings = Booking::selectRaw('DATE(created_at) as date, SUM(deposit) as total_deposit, COUNT(id) as count')
            ->whereBetween('created_at', [$from_date, $to_date])
            ->groupBy('date')
            ->get()
            ->keyBy('date')
            ->toArray();

        // Lấy thông tin từ bảng bill
        $bills = Bill::selectRaw('DATE(created_at) as date, id')
            ->doesntHave('refunds')
            ->whereBetween('created_at', [$from_date, $to_date])
            ->get()
            ->groupBy('date');

        // Lấy thông tin rừ bảng refund
        $refunds = Refund::selectRaw('DATE(created_at) as date, id')
            ->whereBetween('created_at', [$from_date, $to_date])
            ->get()
            ->groupBy('date');

        // Lặp qua các ngày và tính tổng tiền
        foreach ($dates as $date => &$values) {
            // Tổng tiền thanh toán (amount > 0) và hoàn trả (amount < 0)
            $total_amount_for_date = 0;
            $total_refund_for_date = 0;
            $paid_bill_count_for_date = 0;
            $refund_bill_count_for_date = 0;

            if (isset($payments[$date])) {
                foreach ($payments[$date] as $payment) {
                    if ($payment->amount > 0) {
                        $total_amount_for_date += $payment->amount; // Cộng tiền thu được từ khách
                    } elseif ($payment->amount < 0) {
                        $total_refund_for_date += $payment->amount; // Cộng tiền hoàn trả cho khách
                    }
                }
            }

            if (isset($refunds[$date])) {
                $refund_bill_count_for_date = count($refunds[$date]);
            }

            if (isset($bills[$date])) {
                $paid_bill_count_for_date = count($bills[$date]);
            }

            // Lấy thông tin tiền cọc từ bảng bookings
            $deposit_for_date = 0;
            $booking_count_for_date = 0;
            if (isset($bookings[$date])) {
                $deposit_for_date = $bookings[$date]['total_deposit'];
                $booking_count_for_date = $bookings[$date]['count'];
            }

            // Cập nhật các giá trị cho ngày đó
            $values['total_amount_bill'] = $total_amount_for_date;
            $values['total_amount_refund'] = $total_refund_for_date;
            $values['total_amount_deposit'] = $deposit_for_date;
            $values['total_revenue'] = $total_amount_for_date + $total_refund_for_date;
            $values['count_bill_paid'] = $paid_bill_count_for_date;
            $values['count_bill_refund'] = $refund_bill_count_for_date;
            $values['count_booking_deposit'] = $booking_count_for_date;

            // Cập nhật tổng các giá trị
            $totals['total_amount_bill'] += $total_amount_for_date;
            $totals['total_amount_refund'] += $total_refund_for_date;
            $totals['total_amount_deposit'] += $deposit_for_date;
            $totals['total_revenue'] += $values['total_revenue'];
            $totals['total_count_bill_paid'] += $paid_bill_count_for_date;
            $totals['total_count_bill_refund'] += $refund_bill_count_for_date;
            $totals['total_count_booking_deposit'] += $booking_count_for_date;
        }

        // Chỉ lấy mảng total_revenue
        $total_revenue_for_chart = array_map(function ($item) {
            return $item['total_revenue'];
        }, $dates);

        return response()->json([
            'status' => 'success',
            'message' => 'Thống kê doanh thu từ ' . $from_date->toDateString() . ' đến ' . $to_date->toDateString(),
            'data' => array_values($dates),
            'totals' => $totals,
            'total_revenue_for_date' => $total_revenue_for_chart, // Chỉ có mảng total_revenue
        ], Response::HTTP_OK);
    }

    public function statisticTotalAmountPerDay()
    {
        $current_year = Carbon::now()->year;
        $current_month = Carbon::now()->month;

        $days_in_month = Carbon::createFromDate($current_year, $current_month, 1)->daysInMonth;
        $days = []; // Mảng chứa thông tin từng ngày
        $total_amount_per_day = []; // Mảng chỉ chứa tổng số tiền

        for ($day = 1; $day <= $days_in_month; $day++) {
            $current_date = Carbon::createFromDate($current_year, $current_month, $day)->toDateString();

            // Lấy thông tin từ bảng payments (amount > 0 là thu tiền, < 0 là hoàn tiền)
            $payments = Payment::selectRaw('SUM(amount) as total_amount')
                ->whereDate('created_at', $current_date)
                ->first();

            $total_amount_for_date = 0;
            $total_refund_for_date = 0;

            if ($payments) {
                $total_amount_for_date = $payments->total_amount > 0 ? $payments->total_amount : 0;
                $total_refund_for_date = $payments->total_amount < 0 ? $payments->total_amount : 0;
            }

            // Tính tổng doanh thu cho ngày
            $total_revenue_for_date = $total_amount_for_date + $total_refund_for_date;

            // Thêm thông tin vào mảng
            $days[] = [
                'day' => $day,
                'date' => $current_date,
                'total_amount' => (float) $total_revenue_for_date,
            ];

            // Thêm tổng doanh thu vào mảng chỉ chứa tổng số tiền
            $total_amount_per_day[] = (float) $total_revenue_for_date;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tổng tiền doanh thu theo từng ngày trong tháng ' . $current_month . '/' . $current_year,
            'data' => $days, // Mảng chứa thông tin từng ngày
            'total_amount_per_day' => $total_amount_per_day, // Mảng chứa tổng số tiền của từng ngày
        ], Response::HTTP_OK);
    }

    public function statisticTotalAmountPerMonth()
    {
        $year = Carbon::now()->year;

        // Mảng chứa tổng số tiền theo từng tháng trong năm
        $amounts_per_month = [];
        $total_amount_per_month = []; // Mảng chỉ chứa tổng số tiền của từng tháng

        // Lặp qua từng tháng từ 1 đến 12
        for ($month = 1; $month <= 12; $month++) {
            $current_month_start = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $current_month_end = Carbon::createFromDate($year, $month, 1)->endOfMonth();

            // Lấy tổng doanh thu từ bảng payments (amount > 0 là thu tiền, < 0 là hoàn tiền)
            $payments = Payment::selectRaw('SUM(amount) as total_amount')
                ->whereBetween('created_at', [$current_month_start, $current_month_end])
                ->first();

            $total_amount_for_month = 0;
            $total_refund_for_month = 0;

            if ($payments) {
                // Phân biệt giữa tiền thu và tiền hoàn trả
                $total_amount_for_month = $payments->total_amount > 0 ? $payments->total_amount : 0;
                $total_refund_for_month = $payments->total_amount < 0 ? $payments->total_amount : 0;
            }

            // Tính tổng doanh thu cho tháng
            $total_revenue_for_month = $total_amount_for_month + $total_refund_for_month;

            // Thêm thông tin vào mảng
            $amounts_per_month[] = [
                'month' => $month,
                'total_amount' => (float) $total_revenue_for_month,
            ];

            // Thêm tổng doanh thu vào mảng chỉ chứa tổng số tiền
            $total_amount_per_month[] = (float) $total_revenue_for_month;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tổng tiền doanh thu theo từng tháng trong năm ' . $year,
            'year' => $year,
            'amounts_per_month' => $amounts_per_month, // Mảng chứa tổng số tiền của từng tháng
            'total_amount_per_month' => $total_amount_per_month, // Mảng chỉ chứa tổng số tiền của từng tháng
        ], Response::HTTP_OK);
    }

    public function statisticTotalAmountPerWeek()
    {
        $month = Carbon::now()->month;
        $year = Carbon::now()->year;

        // Lấy ngày đầu tiên và ngày cuối cùng của tháng
        $start_of_month = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $end_of_month = $start_of_month->copy()->endOfMonth();

        // Mảng chứa tổng số tiền theo từng tuần trong tháng
        $amounts_per_week = [];
        $total_amount_per_week = []; // Mảng chỉ chứa tổng số tiền của từng tuần

        // Bắt đầu từ tuần đầu tiên trong tháng
        $current_week_start = $start_of_month->copy()->startOfWeek();

        // Lặp qua từng tuần
        while ($current_week_start->lte($end_of_month)) {
            // Ngày kết thúc của tuần hiện tại
            $current_week_end = $current_week_start->copy()->endOfWeek();

            // Đảm bảo ngày kết thúc không vượt quá cuối tháng
            if ($current_week_end->gt($end_of_month)) {
                $current_week_end = $end_of_month;
            }

            // Lấy tổng doanh thu từ bảng payments (amount > 0 là thu tiền, < 0 là hoàn tiền)
            $payments = Payment::selectRaw('SUM(amount) as total_amount')
                ->whereBetween('created_at', [$current_week_start, $current_week_end])
                ->first();

            $total_amount_for_week = 0;
            $total_refund_for_week = 0;

            if ($payments) {
                // Phân biệt giữa tiền thu và tiền hoàn trả
                $total_amount_for_week = $payments->total_amount > 0 ? $payments->total_amount : 0;
                $total_refund_for_week = $payments->total_amount < 0 ? $payments->total_amount : 0;
            }

            // Tính tổng doanh thu cho tuần
            $total_revenue_for_week = $total_amount_for_week + $total_refund_for_week;

            // Thêm thông tin vào mảng
            $amounts_per_week[] = [
                'start_of_week' => $current_week_start->toDateString(),
                'end_of_week' => $current_week_end->toDateString(),
                'total_amount' => (float) $total_revenue_for_week,
            ];

            // Thêm tổng doanh thu vào mảng chỉ chứa tổng số tiền
            $total_amount_per_week[] = (float) $total_revenue_for_week;

            // Chuyển sang tuần tiếp theo
            $current_week_start->addWeek();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tổng tiền doanh thu theo từng tuần trong tháng ' . $month . '/' . $year,
            'month' => $month,
            'year' => $year,
            'amounts_per_week' => $amounts_per_week, // Mảng chứa tổng số tiền của từng tuần
            'total_amount_per_week' => $total_amount_per_week, // Mảng chỉ chứa tổng số tiền của từng tuần
        ], Response::HTTP_OK);
    }

    public function statisticTour()
    {
        // Thống kê số lượng booking cho từng tour có trạng thái active và tính tổng
        $tour_statistics = Tour::leftJoin('booking_tours', 'tours.id', '=', 'booking_tours.tour_id')
            ->select(
                'tours.id as tour_id',
                'tours.name as tour_name',
                DB::raw('COUNT(booking_tours.tour_id) as booking_count')
            )
            ->where('tours.is_active', true)
            ->groupBy('tours.id', 'tours.name')
            ->get();

        // Tính tổng số lượng booking cho các tour có trạng thái active
        $total_bookings = $tour_statistics->sum('booking_count');

        // Tính phần trăm cho từng tour
        $tour_statistics->transform(function ($item) use ($total_bookings) {
            $item->percentage = $total_bookings > 0 ? round(($item->booking_count / $total_bookings) * 100, 2) : 0;
            return $item;
        });

        return BaseResponse::success($tour_statistics);
    }

    public function statisticTourBookingByMonth(Request $request)
    {
        // Nhận tour_id, branch_id và year từ request
        $tour_id = $request->input('tour_id');
        $branch_id = $request->input('branch_id');
        $year = $request->input('year', date('Y'));  // Nếu không có năm, mặc định lấy năm hiện tại

        // Lấy tên chi nhánh và tên tour
        $branch = Branch::find($branch_id);
        $tour = Tour::find($tour_id);

        // Kiểm tra xem tour_id và branch_id có được truyền vào hay không
        if (empty($tour_id) || empty($branch_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'tour_id hoặc branch_id chưa được truyền vào',
            ], 400);
        }

        if (!$branch || !$tour) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy chi nhánh hoặc tour.',
            ], 404);
        }

        // Truy vấn số lượng bookings cho tour_id và branch_id mỗi tháng trong năm được truyền vào
        $monthly_tour_statistic = Booking::where('bookings.branch_id', $branch_id)  // Lọc theo branch_id
            ->whereYear('bookings.created_at', $year)  // Lọc theo năm được truyền vào
            ->join('booking_tours', 'bookings.id', '=', 'booking_tours.booking_id')  // Join với bảng booking_tours
            ->where('booking_tours.tour_id', $tour_id)  // Lọc theo tour_id
            ->selectRaw("EXTRACT(MONTH FROM bookings.created_at) as month,
                         COUNT(*) as total_bookings,
                         AVG(DATE(booking_tours.end_time) - DATE(booking_tours.start_time)) as average_days")  // Tính số ngày trung bình
            ->groupByRaw("EXTRACT(MONTH FROM bookings.created_at)")  // Nhóm theo tháng
            ->orderByRaw("EXTRACT(MONTH FROM bookings.created_at)")  // Sắp xếp theo tháng từ 1 đến 12
            ->get();

        // Tạo mảng kết quả với 12 tháng, mặc định là 0 bookings
        $result = [];
        for ($month = 1; $month <= 12; $month++) {
            $result[] = [
                'month' => $month,
                'total_bookings' => 0,  // Mặc định là 0
                'average_days' => 0,  // Mặc định là 0
            ];
        }

        // Gán số lượng booking và trung bình số ngày vào đúng tháng
        foreach ($monthly_tour_statistic as $statistic) {
            $result[$statistic->month - 1]['total_bookings'] = $statistic->total_bookings;  // -1 vì mảng bắt đầu từ index 0
            $result[$statistic->month - 1]['average_days'] = round($statistic->average_days, 2);  // Trung bình số ngày, làm tròn 2 chữ số
        }

        // Lọc các tháng có bookings > 0 và bookings = 0
        $filtered_result = collect($result);
        $positive_bookings = $filtered_result->where('total_bookings', '>', 0);  // Các tháng có booking > 0
        $zero_bookings = $filtered_result->where('total_bookings', 0);  // Các tháng có booking = 0

        // Lấy 4 tháng có booking nhiều nhất (có booking > 0)
        $top_months = $positive_bookings->count() < 4 ? $positive_bookings : $positive_bookings->sortByDesc('total_bookings')->take(4);

        // Lấy tháng từ kết quả đã lọc, chỉ lấy tháng (tạo mảng tháng)
        $top_months = $top_months->pluck('month')->toArray();

        // Lấy 4 tháng có booking ít nhất (có booking = 0)
        $bottom_months = $zero_bookings->count() >= 5 ? 'Chưa thể xác định' : ($zero_bookings->count() > 0 ? $zero_bookings->take(4) : 'Chưa thể xác định');

        // Nếu có tháng ít nhất, chỉ lấy tháng (tạo mảng tháng)
        if (is_array($bottom_months)) {
            $bottom_months = $bottom_months->pluck('month')->toArray();
        }

        // Phân loại các tháng có average_days vào các nhóm
        $grouped_by_days = [
            '1-2 ngày' => 0,
            '3-4 ngày' => 0,
            '5-7 ngày' => 0,
            'trên 7 ngày' => 0
        ];

        // Kiểm tra xem có bất kỳ tháng nào có average_days > 0 hay không
        $has_positive_average_days = false;

        foreach ($positive_bookings as $statistic) {
            if ($statistic['average_days'] < 3) {
                $grouped_by_days['1-2 ngày']++;
            } elseif ($statistic['average_days'] >= 3 && $statistic['average_days'] <= 4) {
                $grouped_by_days['3-4 ngày']++;
            } elseif ($statistic['average_days'] > 4 && $statistic['average_days'] <= 7) {
                $grouped_by_days['5-7 ngày']++;
            } else {
                $grouped_by_days['trên 7 ngày']++;
            }
            // Nếu có ít nhất 1 tháng có average_days > 0, thì cập nhật biến
            if ($statistic['average_days'] > 0) {
                $has_positive_average_days = true;
            }
        }

        // Nếu không có tháng nào có average_days > 0, hiển thị "Chưa xác định"
        if (!$has_positive_average_days) {
            $max_group = 'Chưa thể xác định';
        } else {
            // Tìm nhóm phổ biến nhất
            $max_group = array_keys($grouped_by_days, max($grouped_by_days))[0];
        }

        // Trả về kết quả thống kê
        $inforTour = [
            'tour_name' => $tour->name,
            'branch_name' => $branch->name,
            '4month_max' => !empty($top_months) ? $top_months : 'Chưa thể xác định',
            '4month_min' => $bottom_months,
            'favorite_amount_days' => $max_group,  // Nhóm số ngày phổ biến nhất
            'grouped_by_days' => $grouped_by_days,  // Các nhóm phân loại theo số ngày
        ];
        return response()->json([
            'status' => 'success',
            'message' => 'Số lượng booking của tour: ' . $tour->name . ' theo tháng trong năm ' . $year . ' tại chi nhánh: ' . $branch->name,
            'data' => $result,
            'inforTour' => $inforTour
        ], 200);
    }

    public function statisticSaleAgent(Request $request)
    {
        // Lấy thông tin từ request
        $year_month = $request->input('year_month');
        $sale_agent_id = $request->input('sale_agent_id');

        // Kiểm tra các tham số đầu vào
        if (empty($year_month) || empty($sale_agent_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thiếu thông tin year_month hoặc sale_agent_id',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Parse year_month thành ngày bắt đầu và kết thúc của tháng
        $start_date = Carbon::createFromFormat('Y-m', $year_month)->startOfMonth();
        $end_date = Carbon::createFromFormat('Y-m', $year_month)->endOfMonth();

        // Lấy tên đại lý
        $agent = SaleAgent::find($sale_agent_id);
        if (!$agent) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy đại lý với ID ' . $sale_agent_id,
            ], Response::HTTP_NOT_FOUND);
        }

        // Truy vấn để lấy dữ liệu thống kê
        $statistics = Booking::where('sale_agent_id', $sale_agent_id)
            ->whereBetween('created_at', [$start_date, $end_date]) // Chỉ lấy bookings trong tháng và năm cụ thể
            ->selectRaw('DATE(bookings.created_at) as date') // Lấy ngày của booking
            ->selectRaw('COUNT(*) as booking_count') // Đếm số lượng booking
            ->selectRaw('SUM(COALESCE(bookings.deposit, 0)) as total_deposit') // Tổng tiền đặt cọc
            ->selectRaw('SUM(COALESCE(bookings.total_amount, 0)) as total_amount') // Tổng tiền của bookings
            ->selectRaw("SUM(CASE WHEN bookings.status_agent = 'paid' THEN 1 ELSE 0 END) as paid_commission") // Số lượng đã thanh toán hoa hồng
            ->selectRaw("SUM(CASE WHEN bookings.status_agent = 'unpaid' THEN 1 ELSE 0 END) as unpaid_commission") // Số lượng chưa thanh toán hoa hồng
            ->groupBy('date') // Nhóm theo ngày
            ->orderBy('date', 'asc') // Sắp xếp theo ngày
            ->get();

        // Tạo mảng để chứa dữ liệu kết quả
        $dates_in_month = [];
        $totals = [
            'booking_count' => 0, // Tổng số lượng booking trong tháng
            'total_deposit' => 0,
            'total_amount' => 0,
            'paid_commission' => 0,
            'unpaid_commission' => 0,
        ];

        // Lặp qua các thống kê từ cơ sở dữ liệu và cập nhật vào mảng dates_in_month
        foreach ($statistics as $stat) {
            $dates_in_month[$stat->date] = [
                'date' => $stat->date,
                'booking_count' => $stat->booking_count, // Số lượng booking trong ngày
                'total_deposit' => $stat->total_deposit,
                'total_amount' => $stat->total_amount,
                'paid_commission' => $stat->paid_commission,
                'unpaid_commission' => $stat->unpaid_commission,
            ];

            // Cộng dồn vào mảng totals
            $totals['booking_count'] += $stat->booking_count; // Cộng dồn số lượng booking
            $totals['total_deposit'] += $stat->total_deposit;
            $totals['total_amount'] += $stat->total_amount;
            $totals['paid_commission'] += $stat->paid_commission;
            $totals['unpaid_commission'] += $stat->unpaid_commission;
        }

        // Trả về kết quả
        return response()->json([
            'status' => 'success',
            'message' => 'Thống kê bookings của đại lý ' . $agent->name . ' trong tháng ' . $year_month,
            'data' => array_values($dates_in_month), // Chuyển mảng sang dạng list để trả về
            'total' => $totals, // Mảng tổng hợp
        ], Response::HTTP_OK);
    }

    public function statisticRefunds(Request $request){
        $req = $request->all();
        $refund = Refund::with(['refundTour', 'refundService', 'customer.userDetail', 'staff.branch', 'payment'])->whereDate('created_at', $req['day'])->get();
        return BaseResponse::success($refund);
    }

    public function statisticBills(Request $request){
        $req = $request->all();
        $bills = Bill::with(['billTours', 'billServices', 'customer.userDetail', 'staff.branch:id,name', 'payments'])
        ->where('total_amount', '>' , 0)->whereDate('created_at', $req['day'])->get();

        return BaseResponse::success($bills);
    }

    public function statisticDebtAgentService(){
        $debtAgents = DebtAgentService::with(['saleAgent', 'debtDetails'])->get();
        return BaseResponse::success($debtAgents);
    }

    public function statisticTotalAll(Request $request)
    {

        $today_start = Carbon::today()->startOfDay();
        $today_end = Carbon::today()->endOfDay();

        $total_customers = Booking::whereBetween('checkin_time', [$today_start, $today_end])
            ->sum('quantity_customer');

        $checked_in_customer_ids = BookingActivity::whereBetween('created_at', [$today_start, $today_end])
            ->pluck('customer_ids')
            ->flatten()
            ->unique();

        $checked_in_customers = $checked_in_customer_ids->count();

        if ($checked_in_customers > $total_customers) {
            $checked_in_customers = $total_customers;
        }

        $not_checked_in_customers = $total_customers - $checked_in_customers;

        $revenue = Payment::whereBetween('created_at', [$today_start, $today_end])
            ->where('amount', '>', 0)
            ->sum('amount');

        $refund_amount = Payment::whereBetween('created_at', [$today_start, $today_end])
            ->where('amount', '<', 0)
            ->sum('amount');

        $booking_count = Booking::where('created_at', '!=', null)
            ->whereDate('created_at', Carbon::today())
            ->count();

        $result = [
            'date' => Carbon::today()->toDateString(),
            'total_customers' => $total_customers,
            'checked_in_customers' => $checked_in_customers,
            'not_checked_in_customers' => $not_checked_in_customers,
            'check_in_ratio' => $checked_in_customers . '/' . $total_customers,
            'revenue' => number_format($revenue),
            'refund_amount' => number_format($refund_amount),
            'booking_count' => $booking_count,
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Thống kê khách hàng và doanh thu cho ngày hôm nay (' . Carbon::today()->toDateString() . ')',
            'data' => $result,
        ], Response::HTTP_OK);
    }

    public function statisticTop10New(Request $request){
        $topTours = DB::table('booking_tours')
        ->join('tours', 'booking_tours.tour_id', '=', 'tours.id')
        ->select('tours.id AS tour_id', 'tours.name AS tour_name',
            'booking_tours.id AS booking_tour_id',
            'booking_tours.start_time AS start_time',
            'booking_tours.end_time AS end_time',
            'booking_tours.quantity_customer AS quantity_customer',
            'booking_tours.status as status',
            DB::raw('MAX(booking_tours.start_time) AS last_booking_date'))
        ->groupBy('tours.id', 'tours.name', 'booking_tours.id')
        ->orderByDesc('last_booking_date')
        ->limit(10)
        ->get();

        foreach($topTours as $index => $tour){
            $bill =  DB::table('bill_tours')
            ->where('booking_tour_id', $tour->booking_tour_id)
            ->selectRaw('SUM(price * quantity_customer) AS bill')
            ->first();

            $customer_ids = BookingTour::find($tour->booking_tour_id)->customer_ids;
            $customers = [];
            if(!empty($customer_ids)){
                foreach($customer_ids as $id){
                    $customer = User::with('userDetail')->find($id);
                    $phone = '';
                    if(!empty($customer)){
                        if(!empty($customer->userDetail)){
                            $phone = $customer->userDetail->phone;
                        }
                        $customers[] = ['fullName' => $customer->fullname,
                                        'phone' => $phone];
                    }
                }
            }

            $topTours[$index]->customers = $customers;
            $topTours[$index]->bill = (int)$bill->bill;
            $refund =  DB::table('refund_tours')
            ->where('booking_tour_id', $tour->booking_tour_id)
            ->selectRaw('SUM(price * quantity_customer) AS refund')
            ->first();
            $topTours[$index]->refund =(int)$refund->refund;

            $payment =$bill->bill - $refund->refund;
            $topTours[$index]->payment = (int) $payment;
        }

        return BaseResponse::success($topTours, 'danh sách top 10 booking tour mới nhất') ;
    }

    public function statisticTypePayment(Request $request){
        
    }

}

