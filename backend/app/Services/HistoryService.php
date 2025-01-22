<?php
namespace App\Services;

use App\Models\ChangeLog;

class HistoryService
{
    public static function log(string $modelName, int $recordId, array $oldData, array $newData, ?int $userId = null)
    {
        // // Chỉ lưu những thay đổi khác nhau
        // $changes = array_diff_assoc($newData, $oldData);

        // if (!empty($changes)) {
        //     ChangeLog::create([
        //         'model_name' => $modelName,
        //         'record_id' => $recordId,
        //         'changed_data' => json_encode([
        //             'old' => array_intersect_key($oldData, $changes),
        //             'new' => $changes,
        //         ]),
        //         'changed_by' => $userId,
        //     ]);
        // }

        //lưu thay đổi 
        ChangeLog::create([
            'model_name' => $modelName,
            'record_id' => $recordId,
            'changed_data' => [
                'old' => $oldData,
                'new' => $newData,
            ],
            'changed_by' => $userId,
        ]);
    }
}
