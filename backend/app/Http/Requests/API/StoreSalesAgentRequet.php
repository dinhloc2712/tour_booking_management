<?php

namespace App\Http\Requests\API;
use Illuminate\Http\Response;
use Illuminate\Http\Exceptions\HttpResponseException;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

class StoreSalesAgentRequet extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return
        [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'required|numeric',
            'address' => 'required|string',
        ];
    }

     function failedValidation(Validator $validator)
    {
        $errors = $validator->errors();

        $response = response()->json([
            'errors' => $errors->messages(),

        ], Response::HTTP_BAD_REQUEST);

        throw new HttpResponseException($response);
    }

    
}
