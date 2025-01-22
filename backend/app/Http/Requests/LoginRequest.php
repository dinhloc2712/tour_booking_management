<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
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
            'email' => ['required','email', 'string', 'max:250'],
            'password' => ['required', 'max:250']
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => "Hãy nhập email",
            'email.email' => "Hãy nhập đúng email",
            'email.string'=> "Email là chuỗi ký tự",
            'email.max' => "Email chứa tối đa 255 ký tự",
            'password.required' => "Hãy nhập mật khẩu",
        ];
    }
}
