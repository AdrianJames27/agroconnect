<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeatherForecast extends Model
{
    use HasFactory;

    protected $primaryKey = 'weatherforecastId'; // Specify the primary key field name
    protected $fillable = [
        'weather_data',
        'timestamp',
    ];

    protected $casts = [
        'weather_data' => 'array', // Cast JSON data to an array
        'timestamp' => 'integer', // Cast timestamp to integer
    ];
    // The 'weatherData' column is of type JSON, so no relationships are defined here
}
