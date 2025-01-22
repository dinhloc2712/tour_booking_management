<?php

namespace App\Http\Controllers;

use App\Http\Responses\BaseResponse;
use Cloudinary\Cloudinary;
use Exception;
use Illuminate\Http\Response as HttpResponse;
use Throwable;

class BaseController extends Controller
{
    protected $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary;
    }

    public static function upImage($image)
    {
        $cloudinary = new Cloudinary;
        // Upload the image to Cloudinary
        $uploadedImage = $cloudinary->uploadApi()->upload($image->getRealPath());

        // Get the URL of the uploaded image
        $imageUrl = $uploadedImage['secure_url'];

        // Optionally save the URL to the database or return it
        return $imageUrl;
    }

    public static function get($model, $limit = null, $col = null, $value = null, $keyword = null, $filters = [], $keywordSearchFor = [])
    {
        try {
            $query = $model::latest('id'); // Sắp xếp theo id mới nhất

            // Nếu có cột id và giá trị, tìm kiếm theo id cụ thể
            if ($col === 'id' && $value) {
                $data = $query->find($value);
                if (!$data) {
                    return BaseResponse::error('Data not found', HttpResponse::HTTP_NOT_FOUND);
                }
                return BaseResponse::success($data, 'Data retrieved successfully!', HttpResponse::HTTP_OK);
            }

            // Lọc theo từ khóa (nếu có)
            if ($keyword && !empty($keywordSearchFor)) {
                $query->where(function ($q) use ($keyword, $keywordSearchFor) {
                    foreach ($keywordSearchFor as $field) {
                        $q->orWhere($field, 'like', '%' . $keyword . '%');
                    }
                });
            }

            // Lọc theo các trường khác bổ sung (nếu có)
            foreach ($filters as $filterField => $filterValue) {
                $query->where($filterField, $filterValue);
            }

            // Giới hạn số lượng kết quả trả về (nếu có)
            $query->when($limit, function ($q) use ($limit) {
                return $q->limit($limit);
            });

            // Nếu có cả cột và giá trị, thêm điều kiện where
            $query->when($col && $value, function ($q) use ($col, $value) {
                return $q->where($col, $value);
            });

            // Lấy dữ liệu
            $data = $query->get();

            // Nếu không có dữ liệu, trả về lỗi
            if ($data->isEmpty()) {
                return BaseResponse::error('Data not found', HttpResponse::HTTP_NOT_FOUND);
            }

            // Trả về dữ liệu thành công
            return BaseResponse::success($data, 'Data retrieved successfully!', HttpResponse::HTTP_OK);
        } catch (Throwable $e) {
            // Trả về lỗi server nếu có lỗi xảy ra
            return BaseResponse::error($e->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public static function updateStatus($model,$id, $col = null, $value = null)
    {
        try {
            $query  = $model::find($id);
            if (empty($query)) {
                return BaseResponse::error($message = 'Data not found !', $status = HttpResponse::HTTP_NOT_FOUND);
            }
            $query->when($col && $value, function ($q) use ($col, $value) {
                return $q->update([
                    $col => $value
                ]);
            });



            return BaseResponse::success($query, 'Data retrieved successfully !', HttpResponse::HTTP_OK);
        } catch (Throwable $e) {
            return BaseResponse::error($e->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

    }



    public static function insert($model, $request)
    {
        try {
            if ($request->hasFile('image')) {
                $image = self::upImage($request->file('image'));
                $data = $model::create(array_merge($request->all(), ['image_url' => $image]));

                return BaseResponse::success($data, $message = 'Record created successfully !', $statusCode = HttpResponse::HTTP_CREATED);
            }
            $data = $model::create($request->all());
            $data = $model::find($data->id);

            return BaseResponse::success($data, $message = 'Record created successfully !', $statusCode = HttpResponse::HTTP_CREATED);
        } catch (\Throwable $e) {
            return BaseResponse::error($message = $e->getMessage(), $status = HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public static function edit($model, $id, $request)
    {
        try {
            $s = $model::find($id);
            if (empty($s)) {
                return BaseResponse::error($message = 'Data not found !', $status = HttpResponse::HTTP_NOT_FOUND);
            }

            if ($request->hasFile('image')) {
                $image = self::upImage($request->file('image'));
                $data = $s::update(array_merge($request->all(), ['image_url' => $image]));

                return BaseResponse::success(null, $message = 'Record updated successfully', $statusCode = HttpResponse::HTTP_OK);
            }
            $data = $s->update($request->all());
            $data = $model::find($id);

            return BaseResponse::success($data, $message = 'Record updated successfully', $statusCode = HttpResponse::HTTP_OK);
        } catch (\Throwable $e) {
            return BaseResponse::error($message = $e->getMessage(), $status = HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public static function delete($model, $id)
    {
        try {
            $data = $model::find($id);
            if (empty($data)) {
                return BaseResponse::error($message = 'Data not found !', $status = HttpResponse::HTTP_NOT_FOUND);
            }
            $data->delete();

            return BaseResponse::success(null, $message = 'Record deleted successfully !', $statusCode = HttpResponse::HTTP_OK);

        } catch (\Throwable $e) {
            return BaseResponse::error($message = $e->getMessage(), $status = HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

    }
}
