<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\UserRequest;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    private $view;

    public function __construct()
    {
        $this->view = [];
    }

    public function showLogin(){
        return view('login');

    }

    public function login(LoginRequest $request){
        if(Auth::attempt(['email'=>$request->email, 'password'=>$request->password])){
            if(Auth::user()->hasRole('customer')){
                return redirect()->back()->with('error', 'Bạn không đủ quyền hạn');
            }else{
                return redirect()->route('staffs.create');
            }
        }else{
            return redirect()->back()->with('error', 'Bạn không đủ quyền hạn');
        }
    }

    public function logout(){
        Auth::logout();
        return redirect()->route('login');
    }

    public function index(){
        $users = new User();
        $branches = new Branch();
        // $this->view['listStaffs'] = $users->loadAllStaffs();
        // $this->view['listBranches'] = $branches->loadAllBranches();
        return view('user.staff.index', $this->view);
    }

    public function detail($id){
        $users = new User();
        $branches = new Branch();
        $this->view['user'] = $users->loadDetailStaff($id);
        $this->view['listBranches'] = $branches->loadAllBranches();
        return view('user.staff.detail', $this->view);
    }

    public function create(){
        // $branches = new Branch();
        $roles = [User::TYPE_ACCOUNTANT, User::TYPE_ADMIN, User::TYPE_ADMIN_BRANCH, User::TYPE_GUIDE, User::TYPE_RECEPTIONIST, User::TYPE_SALE];
        // $this->view['branches'] = $branches->loadAllBranches();
        $this->view['roles'] = $roles;
        return view('user.staff.create', $this->view);
    }

    public function upLoadImage($file){
         // $upload = new UploadApi();
        $upLoadFile = Cloudinary::upload($file->getRealPath())->getSecurePath();
        // ;
        return $upLoadFile;
    }

    public function store(UserRequest $request){
        $data = $request->except('avatar', 'roles', 'password');
        $data['password'] = bcrypt($request['password']);
        if($request->hasFile('avatar') && $request->file('avatar')->isValid()){
            $data['avatar'] = $this->upLoadImage($request->file('avatar'));
        }

        $staff = User::create($data);
        $staff->assignRole($request['roles']);
        if($staff){
            return redirect()->back();
        }else{
            var_dump($data);
        }
    }
}
