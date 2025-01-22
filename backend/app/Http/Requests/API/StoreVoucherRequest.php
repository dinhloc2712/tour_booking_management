<?php

namespace App\Http\Requests\API;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;

class StoreVoucherRequest extends FormRequest
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
    public function rules(): array
    {
        return [
            'code' => 'required|string|unique:vouchers,code',
            'type' => 'required|string',
            'value' => 'required|numeric',
            'quantity' => 'required|numeric|min:1',
            'start_time' => 'required|date',
            'end_time' => 'required|date',
            'description' => 'nullable|string',
            'limit' => 'nullable|numeric',
            // Đảm bảo rằng object_ids được validate như một mảng
            'object_ids' => 'nullable|array',
            'object_ids.*' => 'integer',
            'object_type' => 'nullable|string',

            // Nếu có object_type thì object_ids phải có và ngược lại
            'object_ids' => 'required_with:object_type|nullable|array',
            'object_type' => 'required_with:object_ids|nullable|string',
        ];
    }
    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors();
        $firstError = collect($errors->messages())->flatten()->first();
        
        $response = response()->json([
            'status' => 'error',
            'message' => $firstError
        ], Response::HTTP_BAD_REQUEST);

        throw new HttpResponseException($response);
    }

}
