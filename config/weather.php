<?php
// config/weather.php
return [
    'api_key' => env('VITE_WEATHER_API_KEY', 'default_api_key'),
    'location_key' => env('VITE_WEATHER_LOCATION_KEY', 'default_location_key'),
];
