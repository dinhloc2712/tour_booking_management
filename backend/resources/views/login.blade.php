<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng nhập</title>
</head>
<body>
    <div class="container">
        <h1>Đăng nhập</h1>
        <form action="{{Route('login')}}" method="post">
            @csrf
            <div>
                <label for="">Email</label><br>
                <input type="email" name="email" placeholder="Nhập email" value="{{old('email')}}">
            </div>
            <div>
                <label for="">Password</label><br>
                <input type="password" name="password" placeholder="Nhập email" value="{{old('password')}}">
            </div>
            <button type="submit">Đăng nhập</button>
        </form>
    </div>
</body>
</html>
