<?php

namespace App\Traits;

use App\Http\Responses\BaseResponse;
use App\Models\Tour;
use App\Models\UserDetail;
use App\Models\Voucher;
use Illuminate\Http\Response;

trait CheckVoucher
{
    public function checkVoucher($request)
    {
        $userId = $request['user_id'];
        $tourId = $request['tour_id'];
        $code = $request['code'];

        // Tìm voucher theo code
        $voucher = Voucher::where('code', $code)->first();

        // Kiểm tra xem voucher có tồn tại và đang active hay không
        if (! $voucher || ! $voucher->is_active) {
            return BaseResponse::error('Voucher không tồn tại !', Response::HTTP_NOT_FOUND);
        }

        // Tìm tour theo tourId
        $tour = Tour::find($tourId);
        if (! $tour) {
            return BaseResponse::error('Tour không tồn tại!', Response::HTTP_NOT_FOUND);
        }

        // Kiểm tra xem voucher có áp dụng cho loại đối tượng 'tour' hay không
        if ($voucher->object_type !== 'tour' && $voucher->object_type !== null) {
            return BaseResponse::error('Voucher không áp dụng cho trường hợp này!', Response::HTTP_BAD_REQUEST);
        }

        // Kiểm tra object_ids trong trường hợp voucher áp dụng cho tour
        if ($voucher->object_type === 'tour') {
            $objectIds = is_array($voucher->object_ids) ? $voucher->object_ids : json_decode($voucher->object_ids, true);
            if (! in_array($tourId, $objectIds)) {
                return BaseResponse::error('Voucher không áp dụng cho tour này!', Response::HTTP_BAD_REQUEST);
            }
        }

        // Kiểm tra thời gian hiệu lực của voucher
        $currentDateTime = now();
        if ($currentDateTime < $voucher->start_time) {
            return BaseResponse::error('Voucher chưa có hiệu lực!', Response::HTTP_BAD_REQUEST);
        } elseif ($currentDateTime > $voucher->end_time) {
            return BaseResponse::error('Voucher đã hết hạn!', Response::HTTP_BAD_REQUEST);
        }

        // Kiểm tra số lần sử dụng voucher của người dùng
        $userDetail = UserDetail::where('user_id', $userId)->first();
        if (! $userDetail || $userDetail->quantity_voucher <= 0) {
            return BaseResponse::error('Hết lượt sử dụng voucher!', Response::HTTP_BAD_REQUEST);
        }

        // Nếu tất cả các kiểm tra đều hợp lệ, trả về thông tin voucher hợp lệ
        return BaseResponse::success('Voucher có hiệu lực', Response::HTTP_OK);
    }
}
