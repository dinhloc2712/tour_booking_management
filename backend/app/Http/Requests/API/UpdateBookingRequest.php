<?php

namespace App\Http\Requests\API;

use Illuminate\Contracts\Validation\Validator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;
class UpdateBookingRequest extends FormRequest
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
        'users.full_name' => 'nullable|string|max:255',

        // User_details
        // 'user_details.birthday' => 'nullable|date_format:Y-m-d|before:today',
        'user_details.passport' => 'nullable|string|max:20',
        'user_details.address' => 'nullable|string|max:255',
        'user_details.phone' => 'nullable',

        // Bookings
        'bookings.staff_id' => 'nullable|integer|exists:users,id',
        'bookings.booker_id' => 'nullable|integer|exists:users,id',
        'bookings.branch_id' => 'nullable|integer|exists:branches,id',
        'bookings.checkin_time' => 'nullable|date_format:Y-m-d H:i:s',
        'bookings.deposit' => 'nullable|numeric|min:0',
        'bookings.note' => 'nullable|string',
        'bookings.sale_agent_id' => 'nullable|integer|exists:sale_agents,id',

        // Booking_tour
        'bookings.booking_tour' => 'nullable|array|min:1',
        'bookings.booking_tour.*.id' => 'nullable|integer|exists:booking_tours,id',
        'bookings.booking_tour.*.tour_id' => 'nullable|integer|exists:tours,id',
        'bookings.booking_tour.*.name_tour' => 'nullable|string|max:255',
        'bookings.booking_tour.*.start_time' => 'nullable|date_format:Y-m-d H:i:s',
        'bookings.booking_tour.*.end_time' => 'nullable|date_format:Y-m-d H:i:s|after:bookings.booking_tour.*.start_time',
        'bookings.booking_tour.*.quantity_customer' => 'nullable|integer|min:1',
        'bookings.booking_tour.*.voucher_id' => 'nullable|integer|exists:vouchers,id',
        'bookings.booking_tour.*.voucher_value' => 'nullable|numeric|min:0',
        'bookings.booking_tour.*.voucher_code' => 'nullable|string|max:50',
        // 'bookings.booking_tour.*.price_tour' => 'nullable|numeric|min:0',
        'bookings.booking_tour.*.price' => 'nullable|numeric|min:0',
        'bookings.booking_tour.*.note' => 'nullable|string',

        // Booking_services_by_tour
        'bookings.booking_tour.*.booking_services_by_tour' => 'nullable|array',
        'bookings.booking_tour.*.booking_services_by_tour.*.id' => 'nullable|integer|exists:booking_service_by_tours,id',
        'bookings.booking_tour.*.booking_services_by_tour.*.service_id' => 'nullable|integer|exists:services,id',
        'bookings.booking_tour.*.booking_services_by_tour.*.quantity' => 'nullable|integer|min:1',
        'bookings.booking_tour.*.booking_services_by_tour.*.unit' => 'nullable|numeric|min:0',
        'bookings.booking_tour.*.booking_services_by_tour.*.price' => 'nullable|numeric|min:0',
        'bookings.booking_tour.*.booking_services_by_tour.*.sale_agent_id' => 'nullable|integer|exists:sale_agents,id',
        'bookings.booking_tour.*.booking_services_by_tour.*.start_time' => 'nullable|date_format:Y-m-d H:i:s',
        'bookings.booking_tour.*.booking_services_by_tour.*.end_time' => 'nullable|date_format:Y-m-d H:i:s|after:bookings.booking_tour.*.booking_services_by_tour.*.start_time',
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
        'user_details.birthday.required' => 'Ngày sinh là bắt buộc.',
        'user_details.birthday.date_format' => 'Ngày sinh phải theo định dạng Y-m-d.',
        'user_details.birthday.before' => 'Ngày sinh phải trước ngày hiện tại.',
        'user_details.passport.required' => 'Số hộ chiếu là bắt buộc.',
        'user_details.passport.string' => 'Số hộ chiếu phải là chuỗi ký tự.',
        'user_details.passport.max' => 'Số hộ chiếu không được vượt quá 20 ký tự.',
        'user_details.address.required' => 'Địa chỉ là bắt buộc.',
        'user_details.address.string' => 'Địa chỉ phải là chuỗi ký tự.',
        'user_details.address.max' => 'Địa chỉ không được vượt quá 255 ký tự.',
        'user_details.phone.required' => 'Số điện thoại là bắt buộc.',
        'user_details.phone.regex' => 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.',

        // Bookings
        'bookings.staff_id.required' => 'ID nhân viên là bắt buộc.',
        'bookings.staff_id.integer' => 'ID nhân viên phải là số nguyên.',
        'bookings.staff_id.exists' => 'ID nhân viên không tồn tại trong hệ thống.',
        
        'bookings.booker_id.integer' => 'ID người đặt phải là số nguyên.',
        'bookings.booker_id.exists' => 'ID người đặt không tồn tại trong hệ thống.',
        
        'bookings.branch_id.required' => 'ID chi nhánh là bắt buộc.',
        'bookings.branch_id.integer' => 'ID chi nhánh phải là số nguyên.',
        'bookings.branch_id.exists' => 'ID chi nhánh không tồn tại trong hệ thống.',
        
        'bookings.checkin_time.required' => 'Thời gian nhận phòng là bắt buộc.',
        'bookings.checkin_time.date_format' => 'Thời gian nhận phòng phải theo định dạng Y-m-d H:i:s.',
        
        'bookings.deposit.required' => 'Tiền đặt cọc là bắt buộc.',
        'bookings.deposit.numeric' => 'Tiền đặt cọc phải là số.',
        'bookings.deposit.min' => 'Tiền đặt cọc không được nhỏ hơn 0.',
        
        'bookings.note.string' => 'Ghi chú phải là chuỗi ký tự.',
        
        'bookings.sale_agent_id.required' => 'ID đại lý là bắt buộc.',
        'bookings.sale_agent_id.integer' => 'ID đại lý phải là số nguyên.',
        'bookings.sale_agent_id.exists' => 'ID đại lý không tồn tại trong hệ thống.',

        // Booking_tour
        'bookings.booking_tour.required' => 'Danh sách tour là bắt buộc.',
        'bookings.booking_tour.array' => 'Danh sách tour phải là một mảng.',
        'bookings.booking_tour.min' => 'Danh sách tour phải có ít nhất một tour.',
        
        'bookings.booking_tour.*.id.integer' => 'ID tour phải là số nguyên.',
        
        
        'bookings.booking_tour.*.tour_id.required' => 'ID tour là bắt buộc.',
        'bookings.booking_tour.*.tour_id.integer' => 'ID tour phải là số nguyên.',
        'bookings.booking_tour.*.tour_id.exists' => 'ID tour không tồn tại trong hệ thống.',
        
        'bookings.booking_tour.*.name_tour.required' => 'Tên tour là bắt buộc.',
        'bookings.booking_tour.*.name_tour.string' => 'Tên tour phải là chuỗi ký tự.',
        'bookings.booking_tour.*.name_tour.max' => 'Tên tour không được vượt quá 255 ký tự.',
        
        'bookings.booking_tour.*.start_time.required' => 'Thời gian bắt đầu là bắt buộc.',
        'bookings.booking_tour.*.start_time.date_format' => 'Thời gian bắt đầu phải theo định dạng Y-m-d H:i:s.',
        
        'bookings.booking_tour.*.end_time.required' => 'Thời gian kết thúc là bắt buộc.',
        'bookings.booking_tour.*.end_time.date_format' => 'Thời gian kết thúc phải theo định dạng Y-m-d H:i:s.',
        'bookings.booking_tour.*.end_time.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',
        
        'bookings.booking_tour.*.quantity_customer.required' => 'Số lượng khách hàng là bắt buộc.',
        'bookings.booking_tour.*.quantity_customer.integer' => 'Số lượng khách hàng phải là số nguyên.',
        'bookings.booking_tour.*.quantity_customer.min' => 'Số lượng khách hàng không được nhỏ hơn 1.',
        
        'bookings.booking_tour.*.voucher_id.integer' => 'ID voucher phải là số nguyên.',
        'bookings.booking_tour.*.voucher_id.exists' => 'ID voucher không tồn tại trong hệ thống.',
        
        'bookings.booking_tour.*.voucher_value.numeric' => 'Giá trị voucher phải là số.',
        'bookings.booking_tour.*.voucher_value.min' => 'Giá trị voucher không được nhỏ hơn 0.',
        
        'bookings.booking_tour.*.voucher_code.string' => 'Mã voucher phải là chuỗi ký tự.',
        'bookings.booking_tour.*.voucher_code.max' => 'Mã voucher không được vượt quá 50 ký tự.',
        
        // 'bookings.booking_tour.*.price_tour.required' => 'Giá tour là bắt buộc.',
        // 'bookings.booking_tour.*.price_tour.numeric' => 'Giá tour phải là số.',
        // 'bookings.booking_tour.*.price_tour.min' => 'Giá tour không được nhỏ hơn 0.',
        
        'bookings.booking_tour.*.price.required' => 'Giá là bắt buộc.',
        'bookings.booking_tour.*.price.numeric' => 'Giá phải là số.',
        'bookings.booking_tour.*.price.min' => 'Giá không được nhỏ hơn 0.',
        
        'bookings.booking_tour.*.note.string' => 'Ghi chú tour phải là chuỗi ký tự.',

        // Booking_services_by_tour
        'bookings.booking_tour.*.booking_services_by_tour.array' => 'Dịch vụ tour phải là một mảng.',
        
        'bookings.booking_tour.*.booking_services_by_tour.*.id.integer' => 'ID dịch vụ phải là số nguyên.',
        'bookings.booking_tour.*.booking_services_by_tour.*.id.exists' => 'ID Booking Service By Tour không tồn tại.',
        
        'bookings.booking_tour.*.booking_services_by_tour.*.service_id.required' => 'ID dịch vụ là bắt buộc.',
        'bookings.booking_tour.*.booking_services_by_tour.*.service_id.integer' => 'ID dịch vụ phải là số nguyên.',
        'bookings.booking_tour.*.booking_services_by_tour.*.service_id.exists' => 'ID dịch vụ không tồn tại trong hệ thống.',
        
        'bookings.booking_tour.*.booking_services_by_tour.*.quantity.required' => 'Số lượng dịch vụ là bắt buộc.',
        'bookings.booking_tour.*.booking_services_by_tour.*.quantity.integer' => 'Số lượng dịch vụ phải là số nguyên.',
        'bookings.booking_tour.*.booking_services_by_tour.*.quantity.min' => 'Số lượng dịch vụ không được nhỏ hơn 1.',
        
        'bookings.booking_tour.*.booking_services_by_tour.*.unit.required' => 'Đơn vị dịch vụ là bắt buộc.',
        'bookings.booking_tour.*.booking_services_by_tour.*.unit.numeric' => 'Đơn vị dịch vụ phải là số.',
        'bookings.booking_tour.*.booking_services_by_tour.*.unit.min' => 'Đơn vị dịch vụ không được nhỏ hơn 0.',
        
        'bookings.booking_tour.*.booking_services_by_tour.*.price.required' => 'Giá dịch vụ là bắt buộc.',
        'bookings.booking_tour.*.booking_services_by_tour.*.price.numeric' => 'Giá dịch vụ phải là số.',
        'bookings.booking_tour.*.booking_services_by_tour.*.price.min' => 'Giá dịch vụ không được nhỏ hơn 0.',
        
        'bookings.booking_tour.*.booking_services_by_tour.*.sale_agent_id.required' => 'ID đại lý là bắt buộc.',
        'bookings.booking_tour.*.booking_services_by_tour.*.sale_agent_id.integer' => 'ID đại lý phải là số nguyên.',
        'bookings.booking_tour.*.booking_services_by_tour.*.sale_agent_id.exists' => 'ID đại lý không tồn tại trong hệ thống.',
        
        'bookings.booking_tour.*.booking_services_by_tour.*.start_time.required' => 'Thời gian bắt đầu dịch vụ là bắt buộc.',
        'bookings.booking_tour.*.booking_services_by_tour.*.start_time.date_format' => 'Thời gian bắt đầu dịch vụ phải theo định dạng Y-m-d H:i:s.',
        
        'bookings.booking_tour.*.booking_services_by_tour.*.end_time.required' => 'Thời gian kết thúc dịch vụ là bắt buộc.',
        'bookings.booking_tour.*.booking_services_by_tour.*.end_time.date_format' => 'Thời gian kết thúc dịch vụ phải theo định dạng Y-m-d H:i:s.',
        'bookings.booking_tour.*.booking_services_by_tour.*.end_time.after' => 'Thời gian kết thúc dịch vụ phải sau thời gian bắt đầu dịch vụ.',
    ];
}


    protected function failedValidation(Validator $validator)
    {
        
            $errors = $validator->errors();

        $response = response()->json([
            'errors' => $errors->messages(),

        ], Response::HTTP_BAD_REQUEST);

        throw new HttpResponseException($response);
    }
}
