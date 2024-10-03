<?php

use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CropController;
use App\Http\Controllers\CropVarietyController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\FarmerController;
use App\Http\Controllers\RecordController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\PriceController;
use App\Http\Controllers\PestController;
use App\Http\Controllers\DiseaseController;
use App\Http\Controllers\SoilHealthController;
use App\Http\Controllers\ConcernController;
use App\Http\Controllers\WeatherForecastController;
use App\Http\Controllers\DamageReportController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DownloadController;

// Public routes (no authentication required)
Route::get('/users', [UserController::class, 'index']);
Route::post('/login', [UserController::class, 'login']);

Route::get('/crops', [CropController::class, 'index']);
Route::get('/crops/{id}', [CropController::class, 'show']);
Route::get('/crop-varieties', [CropVarietyController::class, 'index']);
Route::get('/barangays', [BarangayController::class, 'index']);
Route::get('/farmers', [FarmerController::class, 'index']);
Route::get('/records', [RecordController::class, 'index']);
Route::get('/productions', [ProductionController::class, 'index']);
Route::get('/prices', [PriceController::class, 'index']);
Route::get('/pests', [PestController::class, 'index']);
Route::get('/diseases', [DiseaseController::class, 'index']);
Route::get('/damages', [DamageReportController::class, 'index']);
Route::get('/soilhealths', [SoilHealthController::class, 'index']);
Route::get('/concerns', [ConcernController::class, 'index']);
Route::get('/weatherforecasts', [WeatherForecastController::class, 'index']);
Route::middleware('auth:sanctum')->get('/records/{type}', [RecordController::class, 'indexByType']);

Route::get('/weather-keys', function () {
    return response()->json([
        'weather_api_key' => config('weather.api_key'),
        'weather_location_key' => config('weather.location_key'),
    ]);
});

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // Api for users
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/logout', [UserController::class, 'logout']);
    Route::post('/admin/change-password/{user}', [UserController::class, 'adminChangePassword']);

    // Api for crops
    Route::post('/crops', [CropController::class, 'store']);
    Route::put('/crops/{id}', [CropController::class, 'update']);
    Route::delete('/crops/{id}', [CropController::class, 'destroy']);

    // Api for crop varieties
    Route::post('/crop-varieties', [CropVarietyController::class, 'store']);    // Create a new crop variety
    Route::get('/crop-varieties/{id}', [CropVarietyController::class, 'show']); // Get details of a specific crop variety
    Route::put('/crop-varieties/{id}', [CropVarietyController::class, 'update']); // Update a specific crop variety
    Route::delete('/crop-varieties/{id}', [CropVarietyController::class, 'destroy']); // Delete a specific crop variety

    // Api for barangays
    Route::post('/barangays', [BarangayController::class, 'store']);
    Route::get('/barangays/{id}', [BarangayController::class, 'show']);
    Route::put('/barangays/{id}', [BarangayController::class, 'update']);
    Route::delete('/barangays/{id}', [BarangayController::class, 'destroy']);

    // Api for farmers
    Route::post('/farmers', [FarmerController::class, 'store']);
    Route::get('/farmers/{id}', [FarmerController::class, 'show']);
    Route::put('/farmers/{id}', [FarmerController::class, 'update']);
    Route::delete('/farmers/{id}', [FarmerController::class, 'destroy']);

    // Api for records
    Route::post('/records', [RecordController::class, 'store']);
    Route::get('/records/{id}', [RecordController::class, 'show']);
    Route::put('/records/{id}', [RecordController::class, 'update']);
    Route::delete('/records/{id}', [RecordController::class, 'destroy']);

    // Api for productions
    Route::post('/productions', [ProductionController::class, 'store']);
    Route::get('/productions/{id}', [ProductionController::class, 'show']);
    Route::put('/productions/{id}', [ProductionController::class, 'update']);
    Route::post('/productions-batch', [ProductionController::class, 'storeBatch']);
    Route::delete('/productionsByRecords', [ProductionController::class, 'destroyBatch']);
    Route::post('/productions/update-month-year', [ProductionController::class, 'updateMonthYear']);


    // Api for prices
    Route::post('/prices', [PriceController::class, 'store']);
    Route::get('/prices/{id}', [PriceController::class, 'show']);
    Route::put('/prices/{id}', [PriceController::class, 'update']);
    Route::delete('/prices/{id}', [PriceController::class, 'destroy']);
    Route::post('/prices-batch', [PriceController::class, 'storeBatch']);
    Route::delete('/pricesByRecords', [PriceController::class, 'destroyBatch']);
    Route::post('/prices/update-month-year', [PriceController::class, 'updateMonthYear']);

    // Api for pests
    Route::post('/pests', [PestController::class, 'store']);
    Route::get('/pests/{id}', [PestController::class, 'show']);
    Route::put('/pests/{id}', [PestController::class, 'update']);
    Route::delete('/pests/{id}', [PestController::class, 'destroy']);
    Route::post('/pests-batch', [PestController::class, 'storeBatch']);
    Route::delete('/pestsByRecords', [PestController::class, 'destroyBatch']);
    Route::post('/pests/update-month-year', [PestController::class, 'updateMonthYear']);

    // Api for damage reports
    Route::post('/damages', [DamageReportController::class, 'store']);
    Route::get('/damages/{id}', [DamageReportController::class, 'show']);
    Route::put('/damages/{id}', [DamageReportController::class, 'update']);
    Route::delete('/damages/{id}', [DamageReportController::class, 'destroy']);
    Route::post('/damages-batch', [DamageReportController::class, 'storeBatch']);
    Route::delete('/damagesByRecords', [DamageReportController::class, 'destroyBatch']);
    Route::post('/damages/update-month-year', [DamageReportController::class, 'updateMonthYear']);

    // Api for diseases
    Route::post('/diseases', [DiseaseController::class, 'store']);
    Route::get('/diseases/{id}', [DiseaseController::class, 'show']);
    Route::put('/diseases/{id}', [DiseaseController::class, 'update']);
    Route::delete('/diseases/{id}', [DiseaseController::class, 'destroy']);
    Route::post('/diseases-batch', [DiseaseController::class, 'storeBatch']);
    Route::delete('/diseasesByRecords', [DiseaseController::class, 'destroyBatch']);
    Route::post('/diseases/update-month-year', [DiseaseController::class, 'updateMonthYear']);

    // Api for soilhealths
    Route::post('/soilhealths', [SoilHealthController::class, 'store']);
    Route::get('/soilhealths/{id}', [SoilHealthController::class, 'show']);
    Route::put('/soilhealths/{id}', [SoilHealthController::class, 'update']);
    Route::delete('/soilhealths/{id}', [SoilHealthController::class, 'destroy']);
    Route::post('/soilhealths-batch', [SoilHealthController::class, 'storeBatch']);
    Route::delete('/soilhealthsByRecords', [SoilHealthController::class, 'destroyBatch']);
    Route::post('/soilhealths/update-month-year', [SoilHealthController::class, 'updateMonthYear']);

    // Api for concerns
    Route::get('/concerns/{id}', [ConcernController::class, 'show']);
    Route::put('/concerns/{id}', [ConcernController::class, 'update']);
    Route::delete('/concerns/{id}', [ConcernController::class, 'destroy']);

    // Api for weatherforecasts
    Route::put('/weatherforecasts/{id}', [WeatherForecastController::class, 'update']);
    Route::delete('/weatherforecasts/{id}', [WeatherForecastController::class, 'destroy']);
});

Route::post('/concerns', [ConcernController::class, 'store']);
Route::post('/weatherforecasts', [WeatherForecastController::class, 'store']);
Route::get('/weatherforecasts/{id}', [WeatherForecastController::class, 'show']);

// Downloads routes
Route::get('/downloads/count', [DownloadController::class, 'countDownloads']);
Route::post('/downloads/add', [DownloadController::class, 'addDownload']);

// Check user route
Route::get('check-user', function (Request $request) {
    $user = $request->attributes->get('user');
    return response()->json([
        'message' => 'Token is valid',
        'user' => $user
    ]);
})->middleware('check.user');


// Crops Selection Api
Route::get('/unique-crop-names', [CropController::class, 'getUniqueCropNames']);
Route::get('/crop-varieties/by-crop/{cropId}', [CropVarietyController::class, 'getVarietiesByCrop']);
