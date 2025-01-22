<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TcpServer extends Command
{
    protected $signature = 'tcp:server';
    protected $description = 'Chạy TCP server trong Laravel';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        // Tạo TCP server
        $address = '0.0.0.0'; // Lắng nghe trên tất cả các địa chỉ IP
        $port = 8080;

        $sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
        socket_bind($sock, $address, $port);
        socket_listen($sock);

        $this->info("TCP Server đang chạy trên $address:$port...");

        do {
            $client = socket_accept($sock);

            // Đọc dữ liệu từ client
            $input = socket_read($client, 1024);
            $this->info("Dữ liệu nhận được: $input");

            // Phản hồi lại client
            $response = "Dữ liệu đã nhận: $input";
            socket_write($client, $response, strlen($response));

            // Đóng kết nối
            socket_close($client);
        } while (true);

        socket_close($sock);
    }
}
