<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\TrimTrailingSlashes;

Route::get('/', function () {
    return file_get_contents(public_path('index.html'));
})->name('index');

Route::get('/seasonal-trends', function () {
    return file_get_contents(public_path('components/pages/seasonaltrends.html'));
})->name('seasonal-trends');

Route::get('/top-crops', function () {
    return file_get_contents(public_path('components/pages/topcrops.html'));
})->name('top-crops');

Route::get('/map-trends', function () {
    return file_get_contents(public_path('components/pages/maptrends.html'));
})->name('map-trends');

Route::get('/soil-health', function () {
    return file_get_contents(public_path('components/pages/soilhealth.html'));
})->name('soil-health');

Route::get('/weather-forecast', function () {
    return file_get_contents(public_path('components/pages/weatherforecast.html'));
})->name('weather-forecast');

Route::get('/contact-us', function () {
    return file_get_contents(public_path('components/pages/contact.html'));
})->name('contact-us');

//Print
Route::get('/print-seasonal-trends', function () {
    return file_get_contents(public_path('components/print/seasonalTrends.html'));
})->name('print-seasonal-trends');

Route::get('/print-soil-health', function () {
    return file_get_contents(public_path('components/print/soilHealth.html'));
})->name('print-soil-health');

Route::get('/print-map-trends', function () {
    return file_get_contents(public_path('components/print/mapTrends.html'));
})->name('print-map-trends');

Route::middleware([TrimTrailingSlashes::class])->group(function () {
    Route::get('/greet/me', function () {
        return view('greet');
    });
});
