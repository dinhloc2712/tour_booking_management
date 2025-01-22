<?php

namespace App\Http\Requests\API;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class UpdateVoucherRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Cho phép người dùng truy cập
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $voucherId = $this->route('voucher'); // Lấy ID của voucher từ route

        return [
            'code' => [
                'sometimes', // Chỉ kiểm tra nếu 'code' có trong request
                'string',
                Rule::unique('vouchers', 'code')->ignore($voucherId),
            ],
            'type' => 'sometimes|required|string',
            'value' => 'sometimes|required|numeric',
            'quantity' => 'sometimes|required|numeric|min:1',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'sometimes|required|date',
            'is_active' => 'sometimes|required|boolean',
            'object_ids' => 'sometimes|array', // Chỉ yêu cầu khi cập nhật
            'object_ids.*' => 'integer',
            'object_type' => 'sometimes|required|string', // Chỉ yêu cầu khi cập nhật
        ];
    }


    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors();

        $response = response()->json([
            'errors' => $errors->messages()
        ], Response::HTTP_BAD_REQUEST);

        throw new HttpResponseException($response);
    }
}
