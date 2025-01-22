<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\StoreTourRequest;
use App\Models\Tour;
use App\Models\TourGallery;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Response;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;


class TourController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $tours = Tour::with(['services', 'tourSchedules', 'branch', 'tourGallery'])->latest('id')->get();
            return response()->json([
                'status'  => 'success',
                'message' => 'Danh sách tour',
                'data' => $tours
            ], Response::HTTP_OK);
        } catch (QueryException $e) {
            Log::error('Database error while fetching tours: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Lỗi cơ sở dữ liệu, không thể lấy danh sách tour'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Throwable $e) {
            Log::error('Error fetching tours: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Đã xảy ra lỗi không xác định'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTourRequest $request)
    {
        try {
            // Validate and create tour
            $tour = Tour::create($request->all());

            // Handle gallery images if they exist
            if ($request->hasFile('tourGallery')) {
                foreach ($request->file('tourGallery') as $image) {
                    $path = $image->store('tour_gallery');
                    TourGallery::create([
                        'tour_id' => $tour->id,
                        'image' => $path
                    ]);
                }
            }

            // Attach services to the tour if they exist
            if ($request->has('services')) {
                $services = $request->input('services');
                foreach ($services as $service) {
                    $tour->services()->attach($service['service_id'], [
                        'price' => $service['price'],
                        'is_active' => $service['is_active'] ?? true,
                    ]);
                }
            }

            // Handle tour schedules if they exist
            if ($request->has('tourSchedules')) {
                foreach ($request->input('tourSchedules') as $tourSchedule) {
                    $tour->tourSchedules()->create($tourSchedule);
                }
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Tạo mới tour thành công',
                'data' => $tour
            ], Response::HTTP_CREATED);
        } catch (QueryException $e) {
            Log::error('Database error while creating tour: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Lỗi cơ sở dữ liệu, không thể tạo mới tour'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Throwable $e) {
            Log::error('Error creating tour: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Đã xảy ra lỗi không xác định'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $tour = Tour::with(['services', 'tourSchedules', 'branch', 'tourGallery'])->findOrFail($id);
            return response()->json([
                'status'  => 'success',
                'message' => 'Chi tiết tour',
                'data' => $tour
            ], Response::HTTP_OK);
        } catch (ModelNotFoundException $e) {
            Log::error('Tour not found: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Tour không tìm thấy'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Throwable $e) {
            Log::error('Error fetching tour details: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Đã xảy ra lỗi không xác định'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            // Validate the incoming request data
            $validated = $request->validate([
                'name' => 'required|string',
                'price_min' => 'required|numeric',
                'price_max' => 'required|numeric',
                'description' => 'required|string',
                'services' => 'required|array',
                'tourGallery' => 'nullable|array',
                'tourSchedules' => 'nullable|array',
            ]);

            // Find the tour to update
            $tour = Tour::findOrFail($id);

            // Update tour fields except for relationships
            $tour->update($validated);

            // Handle gallery images if they exist
            if ($request->hasFile('tourGallery')) {
                TourGallery::where('tour_id', $tour->id)->delete();
                foreach ($request->file('tourGallery') as $image) {
                    $path = $image->store('tour_gallery');
                    TourGallery::create([
                        'tour_id' => $tour->id,
                        'image' => $path
                    ]);
                }
            }

            // Handle services update
            if ($request->has('services')) {
                $tour->services()->detach();
                $services = $request->input('services');
                foreach ($services as $service) {
                    $tour->services()->attach($service['service_id'], [
                        'price' => $service['price'],
                        'is_active' => $service['is_active'] ?? true,
                    ]);
                }
            }

            // Handle tour schedules update
            if ($request->has('tourSchedules')) {
                $tour->tourSchedules()->delete();
                foreach ($request->input('tourSchedules') as $tourSchedule) {
                    $tour->tourSchedules()->create($tourSchedule);
                }
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Cập nhật tour thành công',
                'data' => $tour
            ], Response::HTTP_OK);
        } catch (QueryException $e) {
            Log::error('Database error while updating tour: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Lỗi cơ sở dữ liệu, không thể cập nhật tour'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Throwable $e) {
            Log::error('Error updating tour: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Đã xảy ra lỗi không xác định'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $tour = Tour::findOrFail($id);
            TourGallery::where('tour_id', $tour->id)->delete();
            $tour->services()->detach();
            $tour->tourSchedules()->delete();
            $tour->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Xóa tour thành công',
            ], Response::HTTP_OK);
        } catch (ModelNotFoundException $e) {
            Log::error('Tour not found while deleting: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Tour không tìm thấy'
            ], Response::HTTP_NOT_FOUND);
        } catch (QueryException $e) {
            Log::error('Database error while deleting tour: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Lỗi cơ sở dữ liệu, không thể xóa tour'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Throwable $e) {
            Log::error('Error deleting tour: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Đã xảy ra lỗi không xác định'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
