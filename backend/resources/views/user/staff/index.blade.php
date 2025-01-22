@extends('layout')
@section('title')
Danh sách nhân viên
@endsection
@section('content')
    <a href="{{route('staffs.create')}}">Thêm mới</a>
    <table>
        <thead>
            <tr>
                <th>STT</th>
                <th>Chi nhánh</th>
                <th>Họ và tên</th>
                <th>Hình ảnh đại diện</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Thời gian tạo</th>
                <th>Thời gian cập nhật</th>
                <th>Chức năng</th>
            </tr>
        </thead>
        <!-- <tbody>
            @foreach($listStaffs as $index=>$staff)
                <tr>
                    <th>{{$index + 1}}</th>
                    <th> @foreach ($listBranches as $branch)
                        @if ($staff->branch_id == $branch->id)
                            {{$branch->name}}
                        @endif
                    @endforeach </th>
                    <th>{{$staff->fullname}}</th>
                    <th>{{$staff->avatar}}</th>
                    <th>{{$staff->email}}</th>
                    <th>@foreach ($staff->roles as $role)
                            {{ $role->name }} 
                        @endforeach</th>
                    <th>{{$staff->created_at}}</th>
                    <th>{{$staff->updated_at}}</th>
                    <th>
                        <a href="{{route('staffs.detail',['id'=>$staff->id])}}">Chi tiết</a>
                        <a href="{{route('staffs.edit',['id'=>$staff->id])}}">Sửa</a></th>
                </tr>
            @endforeach
        </tbody> -->
    </table>
@endsection