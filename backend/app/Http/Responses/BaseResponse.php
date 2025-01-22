<?php

namespace App\Http\Responses;

use Cloudinary\Cloudinary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response as HttpResponse;
use Response;

class BaseResponse
{   
    public static function success($data = null, $message = 'Success', $statusCode = HttpResponse::HTTP_OK): JsonResponse
    {
        return response()->json([
            'status' => "success",
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public static function error($message = 'Error', $status = HttpResponse::HTTP_BAD_REQUEST): JsonResponse
    {
        return response()->json([
            'status' => "error",
            'message' => $message,
        ], $status);
    }
}
