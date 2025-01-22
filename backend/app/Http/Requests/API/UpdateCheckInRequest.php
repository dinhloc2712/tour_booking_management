<?php

namespace App\Http\Requests\API;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class UpdateCheckInRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules()
    {
        return [
            // Users            
            'users.full_name' => 'required|string|max:255',
            // User Details
            'user_details.passport' => 'required|string|max:20',
            'user_details.address' => 'required|string|max:255',
            'user_details.phone' => 'required|string',
            // Booking
            'booking.id' => 'required|integer|exists:bookings,id',
            'booking.staff_id' => 'required|integer|exists:users,id',
            'booking.booker_id' => 'required|integer|exists:users,id',
            'booking.branch_id' => 'required|integer|exists:branches,id',
            'booking.checkin_time' => 'required|date_format:Y-m-d H:i:s',
            'booking.deposit' => 'required|numeric',
            'booking.status_payment' => ['required', Rule::in(['paid', 'unpaid', 'deposit', 'waiting'])],
            'booking.status_touring' => ['required', Rule::in(['waiting', 'cancel', 'checked_in', 'checked_out'])],
            'booking.note' => 'nullable|string|max:255',
            'booking.sale_agent_id' => 'required|integer|exists:sale_agents,id',
            'booking.status_agent' => ['required', Rule::in(['agent', 'no_agent', 'unpaid', 'paid'])],
            'booking.quantity_customer' => 'required|integer|min:1',
            'booking.total_amount' => 'required|numeric',

            'booking.sale_agent.id' => 'required|integer|exists:sale_agents,id',
            'booking.sale_agent.name' => 'required|string|max:255',
            'booking.sale_agent.type' => ['required', Rule::in(['tour', 'tour_onl', 'bus', 'hotel', 'moto', 'khac'])],
            'booking.sale_agent.email' => 'required|email|max:255',
            'booking.sale_agent.phone' => 'required|string|regex:/^\+?\d{10,15}$/',
            'booking.sale_agent.address' => 'required|string|max:255',

            'booking.staff.id' => 'required|integer|exists:users,id',
            'booking.staff.fullname' => 'required|string|max:255',
            'booking.staff.email' => 'required|email|max:255',

            'booking.booker.id' => 'required|integer|exists:users,id',
            'booking.booker.fullname' => 'required|string|max:255',
            'booking.booker.email' => 'required|email|max:255',
            'booking.booker.user_detail.birthday' => 'required|date_format:Y-m-d',
            'booking.booker.user_detail.address' => 'required|string|max:255',
            'booking.booker.user_detail.phone' => 'required|string',
            'booking.booker.user_detail.passport' => 'required|string|max:20',

            'booking.booking_tours.*.id' => 'required|integer|exists:booking_tours,id',
            'booking.booking_tours.*.tour_id' => 'required|integer|exists:tours,id',
            'booking.booking_tours.*.customer_ids' => 'required|array',
            'booking.booking_tours.*.start_time' => 'required|date_format:Y-m-d H:i:s',
            'booking.booking_tours.*.end_time' => 'required|date_format:Y-m-d H:i:s|after:booking.booking_tours.*.start_time',
            'booking.booking_tours.*.price' => 'required|numeric',
            'booking.booking_tours.*.note' => 'nullable|string|max:255',

            'booking.booking_tours.*.booking_service_by_tours.*.id' => 'required|integer|exists:booking_service_by_tours,id',
            'booking.booking_tours.*.booking_service_by_tours.*.service_id' => 'required|integer|exists:services,id',
            'booking.booking_tours.*.booking_service_by_tours.*.quantity' => 'required|integer|min:1',
            'booking.booking_tours.*.booking_service_by_tours.*.unit' => 'required|string|max:10',
            'booking.booking_tours.*.booking_service_by_tours.*.price' => 'required|numeric',
        ];
    }

    public function messages()
    {
        return [
            // Users
            'users.full_name.required' => 'Tên đầy đủ là bắt buộc.',
            'users.full_name.string' => 'Tên đầy đủ phải là một chuỗi.',
            'users.full_name.max' => 'Tên đầy đủ không được vượt quá :max ký tự.',

            // User Details
            'user_details.passport.required' => 'Số hộ chiếu là bắt buộc.',
            'user_details.passport.string' => 'Số hộ chiếu phải là một chuỗi.',
            'user_details.passport.max' => 'Số hộ chiếu không được vượt quá :max ký tự.',

            'user_details.address.required' => 'Địa chỉ là bắt buộc.',
            'user_details.address.string' => 'Địa chỉ phải là một chuỗi.',
            'user_details.address.max' => 'Địa chỉ không được vượt quá :max ký tự.',

            'user_details.phone.required' => 'Số điện thoại là bắt buộc.',
            // 'user_details.phone.string' => 'Số điện thoại phải là một chuỗi.',
            // 'user_details.phone.regex' => 'Số điện thoại không hợp lệ.',

            // Booking
            'booking.id.required' => 'ID đặt phòng là bắt buộc.',
            'booking.id.integer' => 'ID đặt phòng phải là một số nguyên.',
            'booking.id.exists' => 'ID đặt phòng không tồn tại.',

            'booking.staff_id.required' => 'ID nhân viên là bắt buộc.',
            'booking.staff_id.integer' => 'ID nhân viên phải là một số nguyên.',
            'booking.staff_id.exists' => 'ID nhân viên không tồn tại.',

            'booking.booker_id.required' => 'ID người đặt là bắt buộc.',
            'booking.booker_id.integer' => 'ID người đặt phải là một số nguyên.',
            'booking.booker_id.exists' => 'ID người đặt không tồn tại.',

            'booking.branch_id.required' => 'ID chi nhánh là bắt buộc.',
            'booking.branch_id.integer' => 'ID chi nhánh phải là một số nguyên.',
            'booking.branch_id.exists' => 'ID chi nhánh không tồn tại.',

            'booking.checkin_time.required' => 'Thời gian nhận phòng là bắt buộc.',
            'booking.checkin_time.date_format' => 'Thời gian nhận phòng phải có định dạng Y-m-d H:i:s.',

            'booking.deposit.required' => 'Tiền đặt cọc là bắt buộc.',
            'booking.deposit.numeric' => 'Tiền đặt cọc phải là một số.',

            'booking.status_payment.required' => 'Trạng thái thanh toán là bắt buộc.',
            'booking.status_payment.in' => 'Trạng thái thanh toán không hợp lệ.',

            'booking.status_touring.required' => 'Trạng thái du lịch là bắt buộc.',
            'booking.status_touring.in' => 'Trạng thái du lịch không hợp lệ. ',

            'booking.note.string' => 'Ghi chú phải là một chuỗi.',
            'booking.note.max' => 'Ghi chú không được vượt quá :max ký tự.',

            'booking.sale_agent_id.required' => 'ID đại lý bán hàng là bắt buộc.',
            'booking.sale_agent_id.integer' => 'ID đại lý bán hàng phải là một số nguyên.',
            'booking.sale_agent_id.exists' => 'ID đại lý bán hàng không tồn tại.',

            'booking.status_agent.required' => 'Trạng thái đại lý là bắt buộc.',
            'booking.status_agent.in' => 'Trạng thái đại lý không hợp lệ. ',

            'booking.quantity_customer.required' => 'Số lượng khách hàng là bắt buộc.',
            'booking.quantity_customer.integer' => 'Số lượng khách hàng phải là một số nguyên.',
            'booking.quantity_customer.min' => 'Số lượng khách hàng phải tối thiểu là :min.',

            'booking.total_amount.required' => 'Tổng số tiền là bắt buộc.',
            'booking.total_amount.numeric' => 'Tổng số tiền phải là một số.',

            // Sale Agent
            'booking.sale_agent.id.required' => 'ID đại lý bán hàng là bắt buộc.',
            'booking.sale_agent.id.integer' => 'ID đại lý bán hàng phải là một số nguyên.',
            'booking.sale_agent.id.exists' => 'ID đại lý bán hàng không tồn tại.',

            'booking.sale_agent.name.required' => 'Tên đại lý là bắt buộc.',
            'booking.sale_agent.name.string' => 'Tên đại lý phải là một chuỗi.',
            'booking.sale_agent.name.max' => 'Tên đại lý không được vượt quá :max ký tự.',

            'booking.sale_agent.type.required' => 'Loại đại lý là bắt buộc.',
            'booking.sale_agent.type.in' => 'Loại đại lý không hợp lệ. ',

            'booking.sale_agent.email.required' => 'Email đại lý là bắt buộc.',
            'booking.sale_agent.email.email' => 'Email không hợp lệ.',
            'booking.sale_agent.email.max' => 'Email không được vượt quá :max ký tự.',

            'booking.sale_agent.phone.required' => 'Số điện thoại đại lý là bắt buộc.',
            'booking.sale_agent.phone.string' => 'Số điện thoại đại lý phải là một chuỗi.',
            'booking.sale_agent.phone.regex' => 'Số điện thoại đại lý không hợp lệ.',

            'booking.sale_agent.address.required' => 'Địa chỉ đại lý là bắt buộc.',
            'booking.sale_agent.address.string' => 'Địa chỉ đại lý phải là một chuỗi.',
            'booking.sale_agent.address.max' => 'Địa chỉ đại lý không được vượt quá :max ký tự.',

            // Staff
            'booking.staff.id.required' => 'ID nhân viên là bắt buộc.',
            'booking.staff.id.integer' => 'ID nhân viên phải là một số nguyên.',
            'booking.staff.id.exists' => 'ID nhân viên không tồn tại.',

            'booking.staff.fullname.required' => 'Tên nhân viên là bắt buộc.',
            'booking.staff.fullname.string' => 'Tên nhân viên phải là một chuỗi.',
            'booking.staff.fullname.max' => 'Tên nhân viên không được vượt quá :max ký tự.',

            'booking.staff.email.required' => 'Email nhân viên là bắt buộc.',
            'booking.staff.email.email' => 'Email không hợp lệ.',
            'booking.staff.email.max' => 'Email không được vượt quá :max ký tự.',

            // Booker
            'booking.booker.id.required' => 'ID người đặt là bắt buộc.',
            'booking.booker.id.integer' => 'ID người đặt phải là một số nguyên.',
            'booking.booker.id.exists' => 'ID người đặt không tồn tại.',

            'booking.booker.fullname.required' => 'Tên người đặt là bắt buộc.',
            'booking.booker.fullname.string' => 'Tên người đặt phải là một chuỗi.',
            'booking.booker.fullname.max' => 'Tên người đặt không được vượt quá :max ký tự.',

            'booking.booker.email.required' => 'Email người đặt là bắt buộc.',
            'booking.booker.email.email' => 'Email không hợp lệ.',
            'booking.booker.email.max' => 'Email không được vượt quá :max ký tự.',

            'booking.booker.user_detail.birthday.required' => 'Ngày sinh là bắt buộc.',
            'booking.booker.user_detail.birthday.date_format' => 'Ngày sinh phải có định dạng Y-m-d.',

            'booking.booker.user_detail.address.required' => 'Địa chỉ người đặt là bắt buộc.',
            'booking.booker.user_detail.address.string' => 'Địa chỉ người đặt phải là một chuỗi.',
            'booking.booker.user_detail.address.max' => 'Địa chỉ người đặt không được vượt quá :max ký tự.',

            'booking.booker.user_detail.phone.required' => 'Số điện thoại người đặt là bắt buộc.',
            'booking.booker.user_detail.phone.string' => 'Số điện thoại người đặt phải là một chuỗi.',
            'booking.booker.user_detail.phone.regex' => 'Số điện thoại người đặt không hợp lệ.',

            'booking.booker.user_detail.passport.required' => 'Số hộ chiếu người đặt là bắt buộc.',
            'booking.booker.user_detail.passport.string' => 'Số hộ chiếu người đặt phải là một chuỗi.',
            'booking.booker.user_detail.passport.max' => 'Số hộ chiếu người đặt không được vượt quá :max ký tự.',

            // Booking Tours
            'booking.booking_tours.*.id.required' => 'ID tour là bắt buộc.',
            'booking.booking_tours.*.id.integer' => 'ID tour phải là một số nguyên.',
            'booking.booking_tours.*.id.exists' => 'ID tour không tồn tại.',

            'booking.booking_tours.*.tour_id.required' => 'ID tour là bắt buộc.',
            'booking.booking_tours.*.tour_id.integer' => 'ID tour phải là một số nguyên.',
            'booking.booking_tours.*.tour_id.exists' => 'ID tour không tồn tại.',

            'booking.booking_tours.*.customer_ids.required' => 'Danh sách khách hàng là bắt buộc.',
            'booking.booking_tours.*.customer_ids.array' => 'Danh sách khách hàng phải là một mảng.',

            'booking.booking_tours.*.start_time.required' => 'Thời gian bắt đầu là bắt buộc.',
            'booking.booking_tours.*.start_time.date_format' => 'Thời gian bắt đầu phải có định dạng Y-m-d H:i:s.',

            'booking.booking_tours.*.end_time.required' => 'Thời gian kết thúc là bắt buộc.',
            'booking.booking_tours.*.end_time.date_format' => 'Thời gian kết thúc phải có định dạng Y-m-d H:i:s.',
            'booking.booking_tours.*.end_time.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',

            'booking.booking_tours.*.price.required' => 'Giá tour là bắt buộc.',
            'booking.booking_tours.*.price.numeric' => 'Giá tour phải là một số.',

            'booking.booking_tours.*.note.string' => 'Ghi chú tour phải là một chuỗi.',
            'booking.booking_tours.*.note.max' => 'Ghi chú tour không được vượt quá :max ký tự.',

            // Booking Service by Tours
            'booking.booking_tours.*.booking_service_by_tours.*.id.required' => 'ID dịch vụ là bắt buộc.',
            'booking.booking_tours.*.booking_service_by_tours.*.id.integer' => 'ID dịch vụ phải là một số nguyên.',
            'booking.booking_tours.*.booking_service_by_tours.*.id.exists' => 'ID dịch vụ không tồn tại.',

            'booking.booking_tours.*.booking_service_by_tours.*.service_id.required' => 'ID dịch vụ là bắt buộc.',
            'booking.booking_tours.*.booking_service_by_tours.*.service_id.integer' => 'ID dịch vụ phải là một số nguyên.',
            'booking.booking_tours.*.booking_service_by_tours.*.service_id.exists' => 'ID dịch vụ không tồn tại.',

            'booking.booking_tours.*.booking_service_by_tours.*.quantity.required' => 'Số lượng dịch vụ là bắt buộc.',
            'booking.booking_tours.*.booking_service_by_tours.*.quantity.integer' => 'Số lượng dịch vụ phải là một số nguyên.',
            'booking.booking_tours.*.booking_service_by_tours.*.quantity.min' => 'Số lượng dịch vụ phải tối thiểu là :min.',

            'booking.booking_tours.*.booking_service_by_tours.*.unit.required' => 'Đơn vị dịch vụ là bắt buộc.',
            'booking.booking_tours.*.booking_service_by_tours.*.unit.string' => 'Đơn vị dịch vụ phải là một chuỗi.',
            'booking.booking_tours.*.booking_service_by_tours.*.unit.max' => 'Đơn vị dịch vụ không được vượt quá :max ký tự.',

            'booking.booking_tours.*.booking_service_by_tours.*.price.required' => 'Giá dịch vụ là bắt buộc.',
            'booking.booking_tours.*.booking_service_by_tours.*.price.numeric' => 'Giá dịch vụ phải là một số.',
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
