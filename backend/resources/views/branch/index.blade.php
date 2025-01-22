@extends('layout')
@section('title')
Danh sách chi nhánh
@endsection
@section('content')
    <a href="{{route('branches.create')}}">Thêm mới</a>
    <table>
        <thead>
            <tr>
                <th>STT</th>
                <th>Tên chi nhánh</th>
                <th>Loại chi nhánh</th>
                <th>Thời gian tạo</th>
                <th>Thời gian cập nhật</th>
                <th>Chức năng</th>
            </tr>
        </thead>
        <tbody>
            @foreach($branches as $index=>$branch)
                <tr>
                    <th>{{$index + 1}}</th>
                    <th>{{$branch->name}}</th>
                    <th>{{$branch->type}}</th>
                    <th>{{$branch->created_at}}</th>
                    <th>{{$branch->created_at}}</th>
                    <th><a href="{{route('branches.edit',['id'=>$branch->id])}}">Sửa</a></th>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection