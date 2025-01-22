<?php

namespace App\Http\Requests\API;

use App\Models\UserDetail;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;

class UpdateStaffRequest extends FormRequest
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
        $id = $this->route('staff');
        $userDetailExists = UserDetail::where('user_id', $id)->exists();
        return [
            'branch_id' => ['required'],
            'fullname' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:250', 'unique:users,email,'. $id],
            'avatar' => ['nullable', 'string'],
            'roles' => ['required', 'string'],
            'user_detail.birthday' => ['date'],
            'user_detail.address' => ['string'],
            'user_detail.phone' => ['string', 'min:10'],
            // 'user_detail.phone_relative' => ['required', 'string', 'min:10'],
            // 'user_detail.passport' => $userDetailExists 
            // ? ['string', 'max:250', 'unique:user_details,passport,' . $id . ',user_id'] 
            // : ['nullable', 'string', 'max:250','unique:user_details,passport'],
            'user_detail.quantity_voucher' => ['integer', 'min:0']
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
