<?php

namespace App\Http\Controllers;

use App\Models\WeatherForecast;
use Illuminate\Http\Request;

class WeatherForecastController extends Controller
{
    /**
     * Display a listing of the weather forecasts.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Retrieve the latest weather forecast record
        $forecast = WeatherForecast::latest()->first();

        // Return a JSON response with the weather forecast data
        return response()->json($forecast);
    }

    /**
     * Store a newly created weather forecast in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            // Validate incoming request data
            $validated = $request->validate([
                'weather_data' => 'required|array',
                'timestamp' => 'required|integer',
            ]);

            // Create a new weather forecast record
            $forecast = WeatherForecast::create([
                'weather_data' => $validated['weather_data'],
                'timestamp' => $validated['timestamp'],
            ]);

            // Return a JSON response with the created weather forecast data and status code 201 (Created)
            return response()->json($forecast, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal Server Error' . $e->getMessage()], 500);
        }
    }
    /**
     * Display the specified weather forecast.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        // Find a specific weather forecast by its ID
        $forecast = WeatherForecast::findOrFail($id);
        return response()->json($forecast);
    }

    /**
     * Update the specified weather forecast in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Validate incoming request data
        $validated = $request->validate([
            'weather_data' => 'array',
            'timestamp' => 'integer',
        ]);

        // Find the specific weather forecast record by its ID
        $forecast = WeatherForecast::findOrFail($id);

        // Update the weather forecast record with validated data
        $forecast->update([
            'weather_data' => $validated['weather_data'],
            'timestamp' => $validated['timestamp'],
        ]);

        // Return a JSON response with the updated weather forecast data and status code 200 (OK)
        return response()->json($forecast, 200);
    }

    /**
     * Remove the specified weather forecast from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        // Find the specific weather forecast record by its ID
        $forecast = WeatherForecast::findOrFail($id);

        // Delete the weather forecast record from the database
        $forecast->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }
}
