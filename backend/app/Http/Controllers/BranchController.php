<?php

namespace App\Http\Controllers;

use App\Http\Requests\API\BranchRequest;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    private $view;

    public function __construct()
    {
        $this->view = [];
    }
    /**
     * Display a listing of the resource.
     */
    
    public function index()
    {
        $branch = new Branch();
        $this->view['branches'] = $branch->loadAllBranches();
        return view('branch.index', $this->view);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $branch = new Branch();
        $this->view['type_branches'] = [$branch::TYPE_GENERAL, $branch::TYPE_SUB];
        return view('branch.create', $this->view);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BranchRequest $request)
    {
        $data = $request->all();
        $branch = new Branch();
        $res = $branch->insertDataBranch($data);
        if($res){
            return redirect()->route('branches.index');
        }else{
            return redirect()->back();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $id)
    {
        $branch = new Branch();
        $this->view['branch'] = $branch->loadOneBranch($id);
        $this->view['type_branches'] = [$branch::TYPE_GENERAL, $branch::TYPE_SUB];
        return view('branch.edit', $this->view);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(BranchRequest $request, int $id)
    {
        $data = $request->all();
        $branch = new Branch();
        $res = $branch->updateDataBranch($data, $id);
        if($res){
            return redirect()->route('branches.index');
        }else{
            return redirect()->back();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $branch = new Branch();
        $res = $branch->deleteDataBranch($id);
        if($res){
            return redirect()->route('branches.index');
        }else{
            return redirect()->back();
        }
    }
}
