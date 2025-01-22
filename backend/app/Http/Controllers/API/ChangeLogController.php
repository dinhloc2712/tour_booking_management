<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\BaseController;
use Illuminate\Http\Request;
use App\Models\ChangeLog;
use App\Http\Responses\BaseResponse;

class ChangeLogController extends BaseController
{
    public function index()
    {
        $logs = ChangeLog::latest()->get(); 
        // $logs = ChangeLog::latest()->paginate(10); 
        return BaseResponse::success($logs);
    }

    public function show($id)
    {
        $log = ChangeLog::findOrFail($id); 
        return BaseResponse::success($log);
    }

    public function getAllLogModel(string $model = null){
        // $logModes = ChangeLog::select('mode')->distinct()->get();
        if($model == null){
            // $logModes = ChangeLog::;
            // return BaseResponse::success($logModes);
        } else{
            $logModes = ChangeLog::where('model_name', $model)->with(['user.userDetail'])->get();
        return BaseResponse::success($logModes);
        }
        
    }
}
