<?php

namespace App\Traits;
use Cloudinary\Cloudinary;
use App\Http\Responses\BaseResponse;
use App\Models\Tour;
use App\Models\UserDetail;
use App\Models\Voucher;
use Illuminate\Http\Response;

trait AddImage
{
    protected $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary;
    }

    public static function upImage($image)
    {
        $cloudinary = new Cloudinary;
        $uploadedImage = $cloudinary->uploadApi()->upload($image->getRealPath());
        $imageUrl = $uploadedImage['secure_url'];
        return $imageUrl;
    }

}