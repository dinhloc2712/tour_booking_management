@extends('layout')
@section('title')
Thêm chi nhánh mới
@endsection
@section('content')
    <form action="{{route('staffs.store')}}" method="post" enctype="multipart/form-data">
        @csrf
        <div class="">
            <label for="">Họ vàTên</label>
            <input type="text" name="fullname" placeholder="Nhập tên họ và tên" value="{{ old('fullname')}}">
        </div>
        <div class="">
            <label for="">Loại chi nhánh</label>
            <input type="number" name="branch_id">
        </div>
        <div class="">
            <label for="">email</label>
            <input type="email" name="email" placeholder="Nhập tên họ và tên" value="{{ old('email')}}">
        </div>
        <div class="">
            <label for="">Mật khẩu</label>
            <input type="password" name="password" placeholder="Nhập tên họ và tên" value="{{ old('password')}}">
        </div>
        <div class="">
            <label for="">Avatar</label>
            <input type="file" name="avatar" placeholder="Nhập tên họ và tên" value="{{ old('avatar')}}">
        </div>
        <div class="">
            <label for="">Vai trò</label>
            <select name="roles" id="">
                @foreach($roles as $role)
                    <option value="{{$role}}">{{ $role }}</option>
                @endforeach
            </select>
        </div>

        <button type="submit">Thêm mới</button>
    </form>
@endsection