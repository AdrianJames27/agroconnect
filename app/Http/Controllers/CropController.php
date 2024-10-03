<?php

namespace App\Http\Controllers;

use App\Models\Crop;
use App\Models\Production;
use Illuminate\Http\Request;

class CropController extends Controller
{
    // Fetch all crops, ordered by their ID in descending order
    public function index()
    {
        $crops = Crop::orderBy('cropId', 'desc')->get(); // Include varieties
        return response()->json($crops, 200);
    }

    // Store a new crop
    public function store(Request $request)
    {
        // Validate the input data
        $request->validate([
            'cropName' => 'required|string',
            'cropType' => 'required|string',
            'scientificName' => 'nullable|string', // Optional field
            'plantingSeason' => 'nullable|string', // Optional field
            'growthDuration' => 'nullable|integer', // Optional field
            'unit' => 'nullable|string',
            'weight' => 'nullable|numeric',
            'type' => 'required|string',
            'cropImg' => 'nullable|string',  // Optional field
        ]);

        // Create a new crop
        $crop = new Crop([
            'cropName' => $request->input('cropName'),
            'cropType' => $request->input('cropType'),
            'scientificName' => $request->input('scientificName'),
            'plantingSeason' => $request->input('plantingSeason'),
            'growthDuration' => $request->input('growthDuration'),
            'unit' => $request->input('unit'),
            'weight' => $request->input('weight'),
            'type' => $request->input('type'),
            'cropImg' => $request->input('cropImg'),
        ]);

        $crop->save();

        return response()->json($crop, 201);
    }

    // Show details of a specific crop by ID
    public function show($id)
    {
        $crop = Crop::findOrFail($id); // Include varieties
        return response()->json($crop, 200);
    }

    // Update a specific crop by ID
    public function update(Request $request, $id)
    {
        // Find crop by ID
        $crop = Crop::findOrFail($id);

        // Validate input data
        $request->validate([
            'cropName' => 'required|string',
            'cropType' => 'required|string',
            'scientificName' => 'nullable|string',
            'plantingSeason' => 'nullable|string',
            'growthDuration' => 'nullable|integer',
            'unit' => 'nullable|string',
            'weight' => 'nullable|numeric',
            'type' => 'required|string',
            'cropImg' => 'nullable|string',  // Optional field
        ]);

        // Update crop attributes
        $crop->fill($request->only([
            'cropName', 'cropType', 'scientificName', 'plantingSeason', 'growthDuration',
            'unit', 'weight', 'type', 'cropImg'
        ]));

        // Save updated crop to the database
        $crop->save();

        return response()->json($crop, 200);
    }

    // Delete a crop by ID
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

    // Get unique crop names, optionally filtered by season and crop type
    public function getUniqueCropNames(Request $request)
    {
        $season = $request->query('season'); // e.g., 'Dry' or 'Wet'
        $type = $request->query('type'); // e.g., 'vegetable', 'fruit', 'rice'

        // Build query for filtering crops
        $query = Production::select('cropName')
            ->groupBy('cropName')
            ->havingRaw('COUNT(*) >= 5'); // Only crops with at least 5 records

        // Apply season filter if provided
        if ($season) {
            $query->where('season', $season);
        }

        // Apply type filter if provided
        if ($type) {
            $query->whereHas('crop', function ($subQuery) use ($type) {
                $subQuery->where('type', $type);
            });
        }

        // Get unique crop names
        $uniqueCropNames = $query->pluck('cropName');

        return response()->json($uniqueCropNames, 200);
    }
}
