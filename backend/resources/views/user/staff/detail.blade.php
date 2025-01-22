@extends('layout')
@section('title')
    Chi tiết nhân viên
@endsection
@section('content')
    <div>
        <label for="">Chi nhánh:</label><br>
        <input type="text" @foreach ($listBranches as $branch)
            @if ($user->branch_id == $branch->id)
            value="{{$branch->name}}"
            @endif
        @endforeach >
    </div>
    <div>
        <label for="">Họ và tên:</label><br>
        <input type="text" value="{{$user->fullname}}" disabled>
    </div>
    <div>
        <label for="">Email:</label><br>
        <input type="text" value="{{$user->email}}" disabled>
    </div>
    @foreach ($user->user_details as $detail)
        <div>
            <label for="">Số điện thoại:</label><br>
            <input type="text" value="{{$detail->phone}}" disabled>
        </div>
        <div>
            <label for="">Số điện thoại người thân:</label><br>
            <input type="text" value="{{$detail->phone_relative}}" disabled>
        </div>
        <div>
            <label for="">Địa chỉ</label><br>
            <input type="text" value="{{$detail->address}}" disabled>
        </div>
        <div>
            <label for="">Số căn cước công dân:</label><br>
            <input type="text" value="{{$detail->passport}}" disabled>
        </div>
        <div>
            <label for="">Số lượng voucher:</label><br>
            <input type="text" value="{{$detail->quantity_voucher}}" disabled>
        </div>
    @endforeach
    
@endsection
