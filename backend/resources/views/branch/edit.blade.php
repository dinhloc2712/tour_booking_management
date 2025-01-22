@extends('layout')
@section('title')
Sửa chi nhánh
@endsection
@section('content')
    <form action="{{route('branches.update', ['id'=>$branch->id])}}" method="post">
        @csrf
        @method('PUT')
        <div class="">
            <label for="">Tên chi nhánh</label>
            <input type="text" name="name" placeholder="Nhập tên chi nhánh" value="{{$branch->name}}">
        </div>
        <div class="">
            <label for="">Loại chi nhánh</label>
            <Select name="type">
                @foreach ($type_branches as $type)
                    <option value="{{$type}}">{{$type}}</option>
                @endforeach
            </Select>
        </div>
        <button type="submit">Cập nhật</button>
    </form>
    <form action="{{route('branches.delete',['id'=>$branch->id])}}" method="post">
        @csrf
        @method('DELETE')
        <button type="submit" onclick=" return confirm('Bạn chắc chắn muốn xóa chi nhánh này')">Xóa</button>
    </form>
@endsection