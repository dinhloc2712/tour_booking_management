<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="{{route('branches.index')}}">Danh sách chi nhánh</a></li>
                <li><a href="{{route('staffs.index')}}">Danh sách nhân viên</a></li>
                <li><a href="">Danh sách khách hàng</a></li>
                <li><a href="">Danh sách tour</a></li>
                <li><a href="">Danh sách dịch vụ</a></li>
                <li><a href="">Danh sách đại lý</a></li>
                <li><a href="">Danh sách booking</a></li>
                <li><a href="">Danh sách mã giảm giá</a></li>
                <li><a href="">Thống kê</a></li>
                <li>
                    <form action="{{route('logout')}}" method="post">
                        @csrf
                        <button type="submit">Đăng xuất</button>
                    </form>
                </li>
            </ul>
        </nav>
    </header>
    <main>       
        <h1>@yield('title')</h1>
        <div class="content">
            @yield('content')
        </div>
    </main>
</body>
</html>
