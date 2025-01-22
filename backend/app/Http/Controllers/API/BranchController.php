<?php

namespace App\Http\Controllers\API;

use App\Models\Branch;
use Illuminate\Http\Request;
use App\Http\Controllers\BaseController;
use App\Http\Requests\API\BranchRequest;

class BranchController extends BaseController
{
    /**
     * Display a listing of the resource.
     */

    protected $model;

    public function __construct()
    {
        $this->model = Branch::class;
    }

    public function index(Request $request)
    {
        return $this->get($this->model);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $type = [Branch::TYPE_GENERAL, Branch::TYPE_SUB];
        return response()->json(['type'=>$type]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BranchRequest $request)
    {
        return $this->insert($this->model, $request);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
       return $this->get($this->model,null, 'id', $id);
    }

    /**
     * Show the form for editing the specified resource.
     */


    /**
     * Update the specified resource in storage.
     */
    public function update(BranchRequest $request, string $id)
    {
        return $this->edit($this->model, $id, $request);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
       return $this->delete($this->model, $id);
    }
}
