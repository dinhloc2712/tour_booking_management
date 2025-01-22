<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\BaseController;
use App\Http\Requests\API\StoreVoucherRequest;
use App\Http\Requests\API\UpdateVoucherRequest;
use App\Http\Responses\BaseResponse;
use App\Models\Tour;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class VoucherController extends BaseController
{
    protected $Voucher;

    public function __construct()
    {
        $this->Voucher = Voucher::class;
    }

    public function index(Request $request)
    {
        // Lọc theo keyword (nếu có)
        $keyword = $request->input('keyword', null);

        $keywordSearchFor = ['code'];

        // Lấy các điều kiện lọc bổ sung từ request (nếu có)
        $filters = [];

        // Lọc theo type (nếu có)
        if ($request->filled('type')) {
            $filters['type'] = $request->type;
        }

        // Lọc theo object_type (nếu có)
        if ($request->filled('object_type')) {
            $filters['object_type'] = $request->object_type;
        }

        return $this->get(
            $this->Voucher,
            $request->limit,
            $request->col,
            $request->value,
            $keyword,
            $filters,
            $keywordSearchFor
        );
    }

    public function type_voucher()
    {
        $type = [
            voucher::TYPE_PERCENT,
            voucher::TYPE_MONEY,
        ];
        return response()->json([
            'type' => $type
        ]);
    }

    public function object_type_voucher(){
        $object_type = [
            voucher::OBJECT_TYPE_TOUR,
            voucher::OBJECT_TYPE_USER,
        ];
        return response()->json([
            'object_type' => $object_type
        ]);
    }

    public function store(StoreVoucherRequest $request)
    {
        try {
            // Chuẩn bị dữ liệu từ request
            $data = $request->all();

            // Chuyển đổi thời gian bắt đầu và kết thúc theo định dạng mong muốn mà không thay đổi giờ phút giây
            $data['start_time'] = Carbon::parse($data['start_time']); // Giữ nguyên giờ phút giây
            $data['end_time'] = Carbon::parse($data['end_time']); // Giữ nguyên giờ phút giây

            // Gọi phương thức insert từ base để xử lý tạo mới voucher
            return $this->insert(Voucher::class, new Request($data));
        } catch (\Throwable $e) {
            return BaseResponse::error($e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show(string $id)
    {
        return $this->get($this->Voucher, null, 'id', $id);
    }

    public function update(UpdateVoucherRequest $request, string $id)
    {
        return $this->edit($this->Voucher, $id, $request);
    }

    public function destroy(string $id)
    {
        return $this->delete($this->Voucher, $id);
    }

    public function checkVoucherTour(Request $request)
    {
        $userId = $request['user_id'];
        $tourId = $request['tour_id'];
        $code = $request['code'];

        // Tìm voucher theo code
        $voucher = Voucher::where('code', $code)->first();

        // Kiểm tra xem voucher có tồn tại và đang active hay không
        if (!$voucher || !$voucher->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher không tồn tại !',
            ], Response::HTTP_NOT_FOUND);
        }

        // Tìm tour theo tourId
        $tour = Tour::find($tourId);
        if (!$tour) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tour không tồn tại!',
            ], Response::HTTP_NOT_FOUND);
        }

        // Kiểm tra xem voucher có áp dụng cho loại đối tượng 'tour' hay không
        if ($voucher->object_type !== 'tour' && $voucher->object_type !== null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher không áp dụng cho trường hợp này!',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Kiểm tra object_ids trong trường hợp voucher áp dụng cho tour
        if ($voucher->object_type === 'tour') {
            $objectIds = is_array($voucher->object_ids) ? $voucher->object_ids : json_decode($voucher->object_ids, true);
            if (!in_array($tourId, $objectIds)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Voucher không áp dụng cho tour này!',
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        // Kiểm tra thời gian hiệu lực của voucher
        $currentDateTime = now();
        if ($currentDateTime < $voucher->start_time) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher chưa có hiệu lực!',
            ], Response::HTTP_BAD_REQUEST);
        } elseif ($currentDateTime > $voucher->end_time) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher đã hết hạn!',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Kiểm tra số lần sử dụng voucher của người dùng
        $userDetail = UserDetail::where('user_id', $userId)->first();
        if (!$userDetail || $userDetail->quantity_voucher <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hết lượt sử dụng voucher!',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Nếu tất cả các kiểm tra đều hợp lệ, trả về thông tin voucher hợp lệ
        return response()->json([
            'status' => 'success',
            'message' => 'Voucher có hiệu lực',
            'voucher' => $voucher,
        ], Response::HTTP_OK);
    }

    public function checkVoucherCustomer(Request $request)
    {
        $userId = $request['user_id'];
        $code = $request['code'];

        // Tìm voucher theo code
        $voucher = Voucher::where('code', $code)->first();

        // Kiểm tra xem voucher có tồn tại và đang active hay không
        if (!$voucher || !$voucher->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher không tồn tại !',
            ], Response::HTTP_NOT_FOUND);
        }
        // Tìm user theo userId
        $user = User::find($userId);
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User không tồn tại!',
            ], Response::HTTP_NOT_FOUND);
        }
        // Kiểm tra xem voucher có áp dụng cho loại đối tượng 'user' hay không
        if ($voucher->object_type !== 'user' && $voucher->object_type !== null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher không áp dụng cho trường hợp này!',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Kiểm tra object_ids trong trường hợp voucher áp dụng cho user thì user đó có trong danh sách object_ids hay không
        if ($voucher->object_type === 'user') {
            $objectIds = is_array($voucher->object_ids) ? $voucher->object_ids : json_decode($voucher->object_ids, true);
            if (!in_array($userId, $objectIds)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Voucher không áp dụng cho khách hàng này!',
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        // Kiểm tra thời gian hiệu lực của voucher
        $currentDateTime = now();
        if ($currentDateTime < $voucher->start_time) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher chưa có hiệu lực!',
            ], Response::HTTP_BAD_REQUEST);
        } elseif ($currentDateTime > $voucher->end_time) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher đã hết hạn!',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Nếu tất cả các kiểm tra đều hợp lệ, trả về thông tin voucher hợp lệ
        return response()->json([
            'status' => 'success',
            'message' => 'Voucher có hiệu lực',
            'voucher' => $voucher,
        ], Response::HTTP_OK);
    }
}
