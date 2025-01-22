<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\BaseController;
use App\Http\Requests\API\StoreSalesAgentRequet;
use App\Http\Requests\API\UpdateSalesAgentRequet;
use App\Http\Responses\BaseResponse;
use App\Models\DebtAgentService;
use App\Models\SaleAgent;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;

class SalesAgentController extends BaseController
{
    protected $Model;

    public function __construct()
    {
        $this->Model = SaleAgent::class;
    }

    //  Hiển thị danh sách các Sales Agent.
    public function index(Request $request)
    {

        return $this->get($this->Model, $request->limit, $request->col, $request->value);
    }

    public function updateTT(Request $request)
    {
        return $this->updateStatus($this->Model, $request->id, $request->col, $request->value);
    }

    public function create()
    {
        $type = [
            saleAgent::TYPE_TOUR,
            saleAgent::TYPE_TOUR_ONL,
            saleAgent::TYPE_HOTEL,
            saleAgent::TYPE_BUS,
            saleAgent::TYPE_MOTO,
            saleAgent::TYPE_KHAC,
        ];

        return response()->json([
            'type' => $type,
        ]);
    }

    //  Lưu một Sales Agent mới vào cơ sở dữ liệu.
    public function store(StoreSalesAgentRequet $request)
    {
        try{
            $data = [
                'name' => $request->name,
                'type' => $request->type,
                'address' => $request->address,
                'phone' => $request->phone,
                'email' => $request->email
            ];
            $saleAgent = SaleAgent::create($data);
            if($request->type != SaleAgent::TYPE_TOUR_ONL && $request->type != SaleAgent::TYPE_TOUR){
                $debtAgent = DebtAgentService::create([
                    'sale_agent_id' => $saleAgent->id,
                ]);
            }
            
            return BaseResponse::success($saleAgent);
        } catch (\Throwable $e) {
            return BaseResponse::error($message = $e->getMessage(), $status = HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        // return $this->insert($this->Model, $request);
    }

    // Hiển thị thông tin của một Sales Agent cụ thể.
    public function show(string $id)
    {
        return $this->get($this->Model, null, 'id', $id);
    }

    // Cập nhật thông tin của một Sales Agent.
    public function update(UpdateSalesAgentRequet $request, string $id)
    {
        return $this->edit($this->Model, $id, $request);
    }

    // Xóa một Sales Agent khỏi cơ sở dữ liệu.
    public function destroy(string $id)
    {
        return $this->delete($this->Model, $id);
    }

    public function getTypes(Request $request, $type = null, $sort = 'id')
    {
        try {

            if ($type == 'tour') {
                $types = [SaleAgent::TYPE_TOUR, SaleAgent::TYPE_TOUR_ONL];

            } elseif ($type == 'service') {
                $types = [SaleAgent::TYPE_HOTEL, SaleAgent::TYPE_MOTO, SaleAgent::TYPE_BUS, SaleAgent::TYPE_KHAC];

            } elseif ($type == null) {
                $types = $request->input('types', [SaleAgent::TYPE_TOUR, SaleAgent::TYPE_TOUR_ONL]);
            }

            if ($sort == 'id') {
                $sort_by = $request->input('sort_by', 'id');
            } elseif ($sort == 'name') {
                $sort_by = $request->input('sort_by', 'name');
            }

            $datas = SaleAgent::whereIn(DB::raw('LOWER(type)'), array_map('strtolower', $types))
                ->orderBy($sort_by == 'name' ? 'name' : 'id', $sort_by == 'name' ? 'asc' : 'desc')
                ->get();


            return BaseResponse::success($datas);
        } catch (\Throwable $e) {
            return BaseResponse::error($message = $e->getMessage(), $status = HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

    }

    public function create2()
    {
        $const = SaleAgent::getConstants();
        return BaseResponse::success($const);
    }
}
