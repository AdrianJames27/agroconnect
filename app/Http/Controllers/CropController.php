<?php

namespace App\Http\Controllers;

use App\Models\Crop;
use App\Models\Production;
use Illuminate\Http\Request;

class CropController extends Controller
{

    public function index()
    {
        // Get all crops, ordered by their ID in descending order
        $crops = Crop::orderBy('cropId', 'desc')->get();

        return response()->json($crops, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cropName' => 'required|string',
            'priceWeight' => 'required|string',
            'variety' => 'nullable|string',
            'type' => 'required|string',
            'cropImg' => 'nullable|string',  // Optional field
            'description' => 'nullable|string',  // Optional field
        ]);

        // Accessing input data using $request->input('fieldName')
        $crop = new Crop([
            'cropName' => $request->input('cropName'),
            'priceWeight' => $request->input('priceWeight'),
            'variety' => $request->input('variety'),
            'type' => $request->input('type'),
            'cropImg' => $request->input('cropImg'),  // Optional field
            'description' => $request->input('description'),  // Optional field
        ]);

        $crop->save();

        return response()->json($crop, 201);
    }

    public function show($id)
    {
        $crop = Crop::findOrFail($id);
        return response()->json($crop, 200);
    }

    public function update(Request $request, $id)
    {
        // Find crop by ID
        $crop = Crop::findOrFail($id);

        // Validate request data
        $request->validate([
            'cropName' => 'required|string',
            'priceWeight' => 'required|string',
            'variety' => 'nullable|string',
            'type' => 'required|string',
            'cropImg' => 'nullable|string',  // Optional field
            'description' => 'nullable|string',  // Optional field
        ]);

        // Update crop attributes
        $crop->fill($request->only(['cropName', 'priceWeight', 'type', 'variety', 'cropImg', 'description']));

        // Save updated crop to the database
        $crop->save();

        // Return JSON response with the updated crop and status code 200 (OK)
        return response()->json($crop, 200);
    }

    public function destroy($id)
    {
        $crop = Crop::find($id);
        if ($crop) {
            $crop->delete();
            return response()->json(null, 204);
        } else {
            return response()->json(['message' => 'Crop not found'], 404);
        }
    }

    public function getUniqueCropNames(Request $request)
    {
        // Get parameters from the request
        $season = $request->query('season'); // e.g., 'Dry' or 'Wet'
        $type = $request->query('type'); // e.g., 'vegetable', 'fruit', 'rice'

        // Build the query to filter crops based on production season and crop type
        $query = Production::select('cropName')
            ->groupBy('cropName')
            ->havingRaw('COUNT(*) >= 5'); // Filter crops with at least 5 records

        if ($season) {
            $query->where('season', $season); // Filter by season if provided
        }

        if ($type) {
            $query->whereHas('crop', function ($query) use ($type) {
                $query->where('type', $type); // Filter by type if provided
            });
        }

        // Get distinct crop names
        $uniqueCropNames = $query->pluck('cropName');

        return response()->json($uniqueCropNames, 200);
    }
}
