<?php

namespace App\Http\Requests\API;


use App\Http\Responses\BaseResponse;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;
use Throwable;
use Illuminate\Http\Response as HttpResponse;

class StoreCheckInRequest extends FormRequest
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
            'data.*.users.full_name' => 'required|string|max:255',
            'data.*.user_details.birthday' => 'nullable|date',
            'data.*.user_details.passport' => 'required|string|max:20',
            'data.*.user_details.address' => 'required|string|max:255',
            'data.*.user_details.phone' => 'required|string',
            'data.*.booking_tours.*.id' => 'required|integer|exists:booking_tours,id',
            'data.*.booking_tours.*.booking_service_by_tours' => 'array',
            'data.*.booking_tours.*.booking_service_by_tours.*.id' => 'integer|exists:booking_service_by_tours,id',
            // 'data.*.booking_tours.*.booking_service_by_tours' => 'required|array',
            // 'data.*.booking_tours.*.booking_service_by_tours.*.id' => 'required|integer|exists:booking_service_by_tours,id',
        ];
    }

    public function messages()
    {
        return [
            'data.*.users.full_name.required' => 'Tên đầy đủ không được để trống.',
            // 'data.*.user_details.birthday' => 'Ngày sinh không được để trống và phải là một ngày hợp lệ.',
            'data.*.user_details.passport.required' => 'Số hộ chiếu không được để trống và phải có định dạng hợp lệ.',
            'data.*.user_details.address.required' => 'Địa chỉ không được để trống.',
            'data.*.user_details.phone.required' => 'Số điện thoại không được để trống.',
            // 'data.*.user_details.phone.min' => 'Số điện thoại phải có độ dài tối thiểu 10 ký tự.',
            // 'data.*.user_details.phone.max' => 'Số điện thoại phải có độ dài tối đa 15 ký tự.',
            'data.*.booking_tours.*.id.required' => 'Mỗi tour đặt phải có ID.',
            'data.*.booking_tours.*.id.exists' => 'Id  tour đặt không tồn tại.',
            'data.*.booking_tours.*.booking_service_by_tours.required' => 'Danh sách dịch vụ đặt không được để trống.',
            'data.*.booking_tours.*.booking_service_by_tours.*.id.required' => 'ID dịch vụ không được để trống.',
            'data.*.booking_tours.*.booking_service_by_tours.*.id.exists' => 'ID dịch vụ của tour đặt không tồn tại.',

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