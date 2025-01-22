<?php

namespace App\Http\Requests\API;


use App\Http\Responses\BaseResponse;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;
use Throwable;
use Illuminate\Http\Response as HttpResponse;

class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        return [
            // Users
        'users.full_name' => 'required|string|max:255',

        // User_details
        'user_details.passport' => 'required|string|max:20',
        'user_details.address' => 'required|string|max:255',
        'user_details.phone' => 'required',


        // Bookings
        'bookings.staff_id' => 'required|integer|exists:users,id',
        'bookings.booker_id' => 'nullable|integer|exists:users,id',
        'bookings.branch_id' => 'required|integer|exists:branches,id',
        'bookings.checkin_time' => 'required|date_format:Y-m-d H:i:s|after_or_equal:now',
        'bookings.deposit' => 'required|numeric|min:0',
        'bookings.note' => 'nullable|string',
        'bookings.sale_agent_id' => 'nullable|integer|exists:sale_agents,id',
        'bookings.quantity_customer' => 'required|integer|min:1',
        'bookings.total_amount' => 'required|numeric|min:0',

        // Booking_tour
        'bookings.booking_tour' => 'required|array|min:1',
        'bookings.booking_tour.*.tour_id' => 'required|integer|exists:tours,id',
        'bookings.booking_tour.*.name_tour' => 'required|string|max:255',
        'bookings.booking_tour.*.start_time' => 'required|date_format:Y-m-d H:i:s|after:bookings.checkin_time',
        'bookings.booking_tour.*.end_time' => 'required|date_format:Y-m-d H:i:s|after:bookings.booking_tour.*.start_time',
        'bookings.booking_tour.*.voucher_id' => 'nullable|integer|exists:vouchers,id',
        'bookings.booking_tour.*.voucher_value' => 'nullable|numeric|min:0',
        'bookings.booking_tour.*.voucher_code' => 'nullable|string|max:50',
        'bookings.booking_tour.*.customer_ids' => 'nullable|array',
        'bookings.booking_tour.*.customer_ids.*' => 'integer|exists:customers,id',
        // 'bookings.booking_tour.*.price_tour' => 'required|numeric|min:0',
        'bookings.booking_tour.*.price' => 'required|numeric|min:0',
        'bookings.booking_tour.*.note' => 'nullable|string',
        'bookings.booking_tour.*.quantity_customer' => 'required|integer|min:1',

        // Booking_services_by_tour
        'bookings.booking_tour.*.booking_services_by_tour' => 'nullable|array',
        'bookings.booking_tour.*.booking_services_by_tour.*.service_id' => 'integer|exists:services,id',
        'bookings.booking_tour.*.booking_services_by_tour.*.quantity' => 'integer|min:1',
        'bookings.booking_tour.*.booking_services_by_tour.*.unit' => 'numeric|min:0',
        'bookings.booking_tour.*.booking_services_by_tour.*.price' => 'numeric|min:0',
        'bookings.booking_tour.*.booking_services_by_tour.*.sale_agent_id' => 'nullable|integer|exists:sale_agents,id',
        'bookings.booking_tour.*.booking_services_by_tour.*.quantity_customer' => 'integer|min:1',
        'bookings.booking_tour.*.booking_services_by_tour.*.start_time' => 'date_format:Y-m-d H:i:s|after:bookings.checkin_time',
        'bookings.booking_tour.*.booking_services_by_tour.*.end_time' => 'date_format:Y-m-d H:i:s|after:bookings.booking_tour.*.booking_services_by_tour.*.start_time',
        ];
    }

    public function messages()
    {
        return [
            // Users
            'users.full_name.required' => 'Họ và tên là bắt buộc.',
            'users.full_name.string' => 'Họ và tên phải là chuỗi ký tự.',
            'users.full_name.max' => 'Họ và tên không được vượt quá 255 ký tự.',
    
            // User_details
            'user_details.passport.required' => 'Số hộ chiếu là bắt buộc.',
            'user_details.passport.string' => 'Số hộ chiếu phải là chuỗi ký tự.',
            'user_details.passport.max' => 'Số hộ chiếu không được vượt quá 20 ký tự.',
            'user_details.address.required' => 'Địa chỉ là bắt buộc.',
            'user_details.address.string' => 'Địa chỉ phải là chuỗi ký tự.',
            'user_details.address.max' => 'Địa chỉ không được vượt quá 255 ký tự.',
            'user_details.phone.required' => 'Số điện thoại là bắt buộc.',
    
            // Bookings
            'bookings.staff_id.required' => 'ID nhân viên là bắt buộc.',
            'bookings.staff_id.integer' => 'ID nhân viên phải là số nguyên.',
            'bookings.staff_id.exists' => 'Nhân viên không tồn tại trong hệ thống.',
            'bookings.booker_id.integer' => 'ID người đặt phải là số nguyên.',
            'bookings.booker_id.exists' => 'Người đặt không tồn tại trong hệ thống.',
            'bookings.branch_id.required' => 'ID chi nhánh là bắt buộc.',
            'bookings.branch_id.integer' => 'ID chi nhánh phải là số nguyên.',
            'bookings.branch_id.exists' => 'Chi nhánh không tồn tại trong hệ thống.',
            'bookings.checkin_time.required' => 'Thời gian check-in là bắt buộc.',
            'bookings.checkin_time.after_or_equal' => 'Thời gian check-in phải lớn hơn hoặc bằng thời gian hiện tại.',
            'bookings.checkin_time.date_format' => 'Thời gian check-in phải theo định dạng Y-m-d H:i:s.',
            'bookings.deposit.required' => 'Tiền cọc là bắt buộc.',
            'bookings.deposit.numeric' => 'Tiền cọc phải là số.',
            'bookings.deposit.min' => 'Tiền cọc không được âm.',
            'bookings.note.string' => 'Ghi chú phải là chuỗi ký tự.',
            'bookings.sale_agent_id.required' => 'ID đại lý bán hàng là bắt buộc.',
            'bookings.sale_agent_id.integer' => 'ID đại lý bán hàng phải là số nguyên.',
            'bookings.sale_agent_id.exists' => 'Đại lý bán hàng không tồn tại trong hệ thống.',
            'bookings.quantity_customer.required' => 'Số lượng khách là bắt buộc.',
            'bookings.quantity_customer.integer' => 'Số lượng khách phải là số nguyên.',
            'bookings.quantity_customer.min' => 'Số lượng khách phải lớn hơn hoặc bằng 1.',
            'bookings.total_amount.required' => 'Tổng tiền là bắt buộc.',
            'bookings.total_amount.numeric' => 'Tổng tiền phải là số.',
            'bookings.total_amount.min' => 'Tổng tiền không được âm.',
    
            // Booking_tour
            'bookings.booking_tour.required' => 'Danh sách tour không được bỏ trống.',
            'bookings.booking_tour.array' => 'Danh sách tour phải là mảng.',
            'bookings.booking_tour.*.tour_id.required' => 'ID tour là bắt buộc.',
            'bookings.booking_tour.*.tour_id.integer' => 'ID tour phải là số nguyên.',
            'bookings.booking_tour.*.tour_id.exists' => 'Tour không tồn tại trong hệ thống.',
            'bookings.booking_tour.*.name_tour.required' => 'Tên tour là bắt buộc.',
            'bookings.booking_tour.*.name_tour.string' => 'Tên tour phải là chuỗi ký tự.',
            'bookings.booking_tour.*.name_tour.max' => 'Tên tour không được vượt quá 255 ký tự.',
            'bookings.booking_tour.*.start_time.required' => 'Thời gian bắt đầu tour là bắt buộc.',
            'bookings.booking_tour.*.start_time.date_format' => 'Thời gian bắt đầu phải theo định dạng Y-m-d H:i:s.',
            'bookings.booking_tour.*.end_time.required' => 'Thời gian kết thúc tour là bắt buộc.',
            'bookings.booking_tour.*.end_time.date_format' => 'Thời gian kết thúc phải theo định dạng Y-m-d H:i:s.',
            'bookings.booking_tour.*.end_time.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',
            'bookings.booking_tour.*.voucher_id.integer' => 'ID voucher phải là số nguyên.',
            'bookings.booking_tour.*.voucher_id.exists' => 'Voucher không tồn tại trong hệ thống.',
            'bookings.booking_tour.*.voucher_value.numeric' => 'Giá trị voucher phải là số.',
            'bookings.booking_tour.*.voucher_value.min' => 'Giá trị voucher không được âm.',
            'bookings.booking_tour.*.voucher_code.string' => 'Mã voucher phải là chuỗi ký tự.',
            'bookings.booking_tour.*.voucher_code.max' => 'Mã voucher không được vượt quá 50 ký tự.',
            'bookings.booking_tour.*.customer_ids.array' => 'Danh sách khách hàng phải là mảng.',
            'bookings.booking_tour.*.customer_ids.*.integer' => 'ID khách hàng phải là số nguyên.',
            'bookings.booking_tour.*.customer_ids.*.exists' => 'Khách hàng không tồn tại trong hệ thống.',
            // 'bookings.booking_tour.*.price_tour.required' => 'Giá tour là bắt buộc.',
            // 'bookings.booking_tour.*.price_tour.numeric' => 'Giá tour phải là số.',
            // 'bookings.booking_tour.*.price_tour.min' => 'Giá tour không được âm.',
            'bookings.booking_tour.*.price.required' => 'Giá booking là bắt buộc.',
            'bookings.booking_tour.*.price.numeric' => 'Giá booking phải là số.',
            'bookings.booking_tour.*.price.min' => 'Giá booking không được âm.',
            'bookings.booking_tour.*.note.string' => 'Ghi chú của tour phải là chuỗi ký tự.',
            'bookings.booking_tour.*.quantity_customer.required' => 'Số lượng khách trong tour là bắt buộc.',
            'bookings.booking_tour.*.quantity_customer.integer' => 'Số lượng khách phải là số nguyên.',
            'bookings.booking_tour.*.quantity_customer.min' => 'Số lượng khách trong tour phải ít nhất là 1.',
    
            // Booking_service_by_tours
            'bookings.booking_tour.*.booking_services_by_tour.array' => 'Danh sách dịch vụ phải là mảng.',
            'bookings.booking_tour.*.booking_services_by_tour.*.service_id.required' => 'ID dịch vụ là bắt buộc.',
            'bookings.booking_tour.*.booking_services_by_tour.*.service_id.integer' => 'ID dịch vụ phải là số nguyên.',
            'bookings.booking_tour.*.booking_services_by_tour.*.service_id.exists' => 'Dịch vụ không tồn tại trong hệ thống.',
            'bookings.booking_tour.*.booking_services_by_tour.*.quantity.required' => 'Số lượng dịch vụ là bắt buộc.',
            'bookings.booking_tour.*.booking_services_by_tour.*.quantity.integer' => 'Số lượng dịch vụ phải là số nguyên.',
            'bookings.booking_tour.*.booking_services_by_tour.*.quantity.min' => 'Số lượng dịch vụ phải lớn hơn hoặc bằng 1.',
            'bookings.booking_tour.*.booking_services_by_tour.*.unit.required' => 'Đơn giá dịch vụ là bắt buộc.',
            'bookings.booking_tour.*.booking_services_by_tour.*.unit.numeric' => 'Đơn giá dịch vụ phải là số.',
            'bookings.booking_tour.*.booking_services_by_tour.*.unit.min' => 'Đơn giá không được âm.',
            'bookings.booking_tour.*.booking_services_by_tour.*.price.required' => 'Giá dịch vụ là bắt buộc.',
            'bookings.booking_tour.*.booking_services_by_tour.*.price.numeric' => 'Giá dịch vụ phải là số.',
            'bookings.booking_tour.*.booking_services_by_tour.*.price.min' => 'Giá dịch vụ không được âm.',
            'bookings.booking_tour.*.booking_services_by_tour.*.sale_agent_id.required' => 'ID đại lý bán hàng là bắt buộc.',
            'bookings.booking_tour.*.booking_services_by_tour.*.sale_agent_id.integer' => 'ID đại lý bán hàng phải là số nguyên.',
            'bookings.booking_tour.*.booking_services_by_tour.*.sale_agent_id.exists' => 'Đại lý bán hàng không tồn tại.',
            'bookings.booking_tour.*.booking_services_by_tour.*.quantity_customer.required' => 'Số lượng khách sử dụng dịch vụ là bắt buộc.',
            'bookings.booking_tour.*.booking_services_by_tour.*.quantity_customer.integer' => 'Số lượng khách phải là số nguyên.',
            'bookings.booking_tour.*.booking_services_by_tour.*.quantity_customer.min' => 'Số lượng khách phải ít nhất là 1.',
            'bookings.booking_tour.*.booking_services_by_tour.*.start_time.required' => 'Thời gian bắt đầu dịch vụ là bắt buộc.',
            'bookings.booking_tour.*.booking_services_by_tour.*.start_time.date_format' => 'Thời gian bắt đầu phải theo định dạng Y-m-d H:i:s.',
            'bookings.booking_tour.*.booking_services_by_tour.*.end_time.required' => 'Thời gian kết thúc dịch vụ là bắt buộc.',
            'bookings.booking_tour.*.booking_services_by_tour.*.end_time.date_format' => 'Thời gian kết thúc phải theo định dạng Y-m-d H:i:s.',
            'bookings.booking_tour.*.booking_services_by_tour.*.end_time.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',
        ];
    }
    




    protected function failedValidation(Validator $validator)
    {
        // try{
            $errors = $validator->errors();

        $response = response()->json([
            'errors' => $errors->messages(),

        ], Response::HTTP_BAD_REQUEST);

        throw new HttpResponseException($response);

    }

}
