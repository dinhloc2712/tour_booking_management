<?php

namespace App\Http\Requests\API;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Response;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class UpdateSalesAgentRequet extends FormRequest
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
        $id = $this->route('sale_agent');
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:sale_agents,email,' . $id,
            'phone' => 'required|numeric',
            'address' => 'required|string',
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
