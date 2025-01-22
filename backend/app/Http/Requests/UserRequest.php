<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
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
            // 'branch_id' => ['required'],
            // 'fullname' => ['required', 'string', 'max:100'],
            // 'password' => ['required', 'min:8', 'string'],
            // 'email' => ['required', 'email', 'max:250'],
            // 'avatar' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
            // 'roles' => ['required']
        ];
    }

    public function messages():array
    {
        return [
            'branch_id.required' => 'Bạn chưa chọn chi nhánh',
            'fullname.required'=> 'Bạn chưa nhập họ tên',
            'fullname.string' => 'Họ tên là một chuỗi ký tự',
            'fullname.max' => 'Họ tên là một chuỗi chứ tối 100 ký tự',
            'password.required' => 'Bạn chưa nhập mật khẩu',
            'password.min' => 'Mật khẩu ít nhất 8 ký tự',
            'password.string' => 'Mật khẩu là một chuỗi ký tự',
            'email.required' => 'Bạn chưa nhập email',
            'email.email' => 'Email nhập vào chưa đúng định dạng',
            'email.max' => 'Email chứa tối đa 250 ký tự',
            'avatar.image' => 'Tệp tải lên không phải là hình ảnh',
            'avatar.mimes' => 'Hình ảnh là loại tệp png, jpg, jpeg',
            'avatar.max' => 'Kích thước hình ảnh tối đa 2048 kylobytes'
        ];
    }
}
