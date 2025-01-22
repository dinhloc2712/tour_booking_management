@extends('layout')
@section('title')
Thêm chi nhánh mới
@endsection
@section('content')
    <form action="{{route('branches.store')}}" method="post">
        @csrf
        <div class="">
            <label for="">Tên chi nhánh</label>
            <input type="text" name="name" placeholder="Nhập tên chi nhánh" value="{{ old('name')}}">
        </div>
        <div class="">
            <label for="">Loại chi nhánh</label>
            <Select name="type">
                @foreach ($type_branches as $type)
                    <option value="{{$type}}">{{$type}}</option>
                @endforeach
            </Select>
        </div>
        <button type="submit">Thêm mới</button>
    </form>
@endsection