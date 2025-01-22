<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\BaseController;
use App\Http\Responses\BaseResponse;
use App\Models\Refund;
use App\Models\RefundService;
use App\Models\RefundTour;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use PhpParser\ErrorHandler\Throwing;
use Throwable;

class RefundController extends BaseController
{

    protected $table;

    public function __construct()
    {
        $this->table = Refund::class;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->get($this->table);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try{
            $data = $request->except('refund_tours', 'refund_services');
            $refund = $this->table::create($data);
            $refundId = $refund->id;

            if($request->has('refund_tours')){
                foreach ($request->refund_tours as $refundTour){
                    $refundTour['refund_id'] = $refundId;
                    RefundTour::create($refundTour);
                }
            }

            if($request->has('refund_services')){
                foreach ($request->refund_services as $refundService){
                    $refundService['refund_id'] = $refundId;
                    RefundService::create($refundService);
                }
            }

            DB::commit();

            return BaseResponse::success($refund, 'Tạo hoàn tiền thành công', HttpResponse::HTTP_CREATED);
        }catch(Throwable $th){

            DB::rollBack();

            return BaseResponse::error($th->getMessage() , HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try{
            $data = $this->table::with(['bill', 'refundTour', 'refundService'])->find($id);
            if(empty($data)){
                return BaseResponse::error('Không tìm thấy thông tin', HttpResponse::HTTP_NOT_FOUND);
            }

            return BaseResponse::success($data, 'Chi tiết hoàn tiền', HttpResponse::HTTP_OK);
        
        }catch(Throwable $th){
            
            return BaseResponse::error($th->getMessage(), HttpResponse::HTTP_INTERNAL_SERVER_ERROR);

        }

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
