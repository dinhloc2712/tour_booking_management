<?php

namespace App\Traits;

use App\Models\BookingServiceByTour;
use App\Models\BookingTour;
use App\Models\Service;

trait AddBookingTourAndService
{
    public function addBookingTourAndService($request,$customerId)
    {

        foreach ($request->bookings['booking_tour'] as $bookingTourData) {
            $bookingTour = BookingTour::findOrFail($bookingTourData['id']);
            $customerIds = $bookingTour->customer_ids;
            if (!is_array($customerIds)) {
                $customerIds = [];
            }
            $newCustomerId = 3;
            if (!in_array($newCustomerId, $customerIds)) {
                $customerIds[] = $newCustomerId;
            }
            sort($customerIds);
            $bookingTour->update([
                'customer_ids' => $customerIds
            ]);

            foreach ($bookingTourData['booking_services_by_tour'] as $servicesTourData) {
                // Lọc dữ liệu cùng service_id và thời gian
                $existingService = BookingServiceByTour::where('booking_tour_id', $bookingTourData['id'])
                                    ->where('service_id', $servicesTourData['service_id'])
                                    ->where('start_time', $servicesTourData['start_time'])
                                    ->where('end_time', $servicesTourData['end_time'])
                                    ->first();
            
                // Kiểm tra nếu tìm thấy dịch vụ và giờ chuẩn
                if ($existingService) {
                    // Lấy danh sách customer_ids từ bản ghi hiện tại
                    $customerIds = $existingService->customer_ids;
                    if (!is_array($customerIds)) {
                        $customerIds = [];
                    }
            
                    // Kiểm tra nếu customerId trong database chưa
                    if (!in_array($customerId, $customerIds)) {
                        $customerIds[] = $customerId;
                        $existingService->update([
                            'customer_ids' => $customerIds
                        ]);
                    } else {
                        // Nếu customerId đã có, tạo bản ghi mới cho dịch vụ mới của họ
                        $service = Service::find($servicesTourData['service_id']);
                        BookingServiceByTour::create([
                            'booking_tour_id' => $bookingTour->id,
                            'service_id' => $servicesTourData['service_id'],
                            'name_service' => $service->name,
                            'quantity' => $servicesTourData['quantity'],
                            'unit' => $servicesTourData['unit'],
                            'price' => $servicesTourData['price'],
                            'agent_id' => $servicesTourData['agent_id'],
                            'start_time' => $servicesTourData['start_time'],
                            'end_time' => $servicesTourData['end_time'],
                            'customer_ids' => [$customerId] // Chỉ chứa ID của người dùng mới
                        ]);
                    }
                } else {
                    // Nếu không tìm thấy bản ghi dịch vụ nào, tạo bản ghi mới
                    $service = Service::find($servicesTourData['service_id']);
                    BookingServiceByTour::create([
                        'booking_tour_id' => $bookingTour->id,
                        'service_id' => $servicesTourData['service_id'],
                        'name_service' => $service->name,
                        'quantity' => $servicesTourData['quantity'],
                        'unit' => $servicesTourData['unit'],
                        'price' => $servicesTourData['price'],
                        'agent_id' => $servicesTourData['agent_id'],
                        'start_time' => $servicesTourData['start_time'],
                        'end_time' => $servicesTourData['end_time'],
                        'customer_ids' => [$customerId] 
                    ]);
                }

            }
            
        }
    }
}
