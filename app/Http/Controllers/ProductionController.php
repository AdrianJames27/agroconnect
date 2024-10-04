<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\Crop;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    public function index()
    {
        // Get all productions, ordered by their ID in descending order
        $productions = Production::orderBy('productionId', 'desc')->get();

        return response()->json($productions, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'required|exists:records,recordId',
            'barangay' => 'required|string|max:255',
            'cropName' => 'required|string|max:255',
            'variety' => 'required|string|max:255',
            'areaPlanted' => 'required|numeric',
            'monthPlanted' => 'required|string|max:255',
            'monthHarvested' => 'required|string|max:255',
            'volumeProduction' => 'required|numeric',
            'productionCost' => 'required|numeric',
            'price' => 'required|string|max:255',
            'volumeSold' => 'required|numeric',
            'season' => 'required|string|max:255',
            'monthYear' => 'required|string|max:255',
        ]);

        // If validation passes, create a new production record
        $production = new Production([
            'recordId' => $request->input('recordId'),
            'barangay' => $request->input('barangay'),
            'cropName' => $request->input('cropName'),
            'variety' => $request->input('variety'),
            'areaPlanted' => $request->input('areaPlanted'),
            'monthPlanted' => $request->input('monthPlanted'),
            'monthHarvested' => $request->input('monthHarvested'),
            'volumeProduction' => $request->input('volumeProduction'),
            'productionCost' => $request->input('productionCost'),
            'price' => $request->input('price'),
            'volumeSold' => $request->input('volumeSold'),
            'season' => $request->input('season'),
            'monthYear' => $request->input('monthYear'),
        ]);

        // Save the production record to the database
        $production->save();

        // Return a JSON response with the created production data and status code 201 (Created)
        return response()->json($production, 201);
    }

    public function storeBatch(Request $request)
    {
        $productionDataArray = $request->input('productionData');

        // Process and store each item in the validated data
        foreach ($productionDataArray as $productionData) {
            $request->validate([
                'productionData.*.recordId' => 'required|exists:records,recordId',
                'productionData.*.recordId' => 'required|exists:records,recordId',
                'productionData.*.barangay' => 'required|string|max:255',
                'productionData.*.cropName' => 'required|string|max:255',
                'productionData.*.variety' => 'nullable|string|max:255',
                'productionData.*.areaPlanted' => 'required|numeric',
                'productionData.*.monthPlanted' => 'required|string|max:50',
                'productionData.*.monthHarvested' => 'required|string|max:50',
                'productionData.*.volumeProduction' => 'required|numeric',
                'productionData.*.productionCost' => 'required|numeric',
                'productionData.*.volumeSold' => 'required|numeric',
                'productionData.*.price' => 'required|string|max:255',
                'productionData.*.season' => 'required|string|max:50',
                'productionData.*.monthYear' => 'required|string|max:255',
            ]);
            Production::updateOrCreate(
                [
                    'recordId' => $productionData['recordId'],
                    'barangay' => $productionData['barangay'],
                    'cropName' => $productionData['cropName'],
                    'variety' => $productionData['variety'] ?? '',
                    'areaPlanted' => $productionData['areaPlanted'],
                    'monthPlanted' => $productionData['monthPlanted'],
                    'monthHarvested' => $productionData['monthHarvested'],
                    'volumeProduction' => $productionData['volumeProduction'],
                    'productionCost' => $productionData['productionCost'],
                    'volumeSold' => $productionData['volumeSold'],
                    'price' => $productionData['price'],
                    'season' => $productionData['season'],
                    'monthYear' => $productionData['monthYear']
                ]
            );
        }

        return response()->json(['message' => 'Batch data stored successfully']);
    }

    public function destroy($id)
    {
        // Find the specific production record by its ID
        $production = Production::findOrFail($id);

        // Delete the production record from the database
        $production->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }

    public function destroyBatch(Request $request)
    {
        // Retrieve the array of records from the request
        $productionDataArray = $request->input('productionData');

        // Check if the input is an array and not empty
        if (!is_array($productionDataArray) || empty($productionDataArray)) {
            return response()->json(['error' => 'Invalid input'], 400);
        }

        // Extract foreign keys (recordIds) from the production data array
        $foreignKeys = array_column($productionDataArray, 'recordId');

        // Validate that foreign keys are properly extracted
        if (empty($foreignKeys)) {
            return response()->json(['error' => 'No valid foreign keys found'], 400);
        }

        // Find the primary keys of records in the Production table that match the foreign keys
        $recordsToDelete = Production::whereIn('recordId', $foreignKeys)->pluck('productionId');

        // Ensure that we have valid records to delete
        if ($recordsToDelete->isEmpty()) {
            return response()->json(['error' => 'No records found to delete'], 404);
        }

        // Delete the records from the database
        Production::whereIn('productionId', $recordsToDelete)->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }

    public function updateMonthYear(Request $request)
    {
        // Validate request data
        $request->validate([
            'recordId' => 'required|integer',
            'monthYear' => 'required|string',  // The new value for monthYear
        ]);

        // Find all records with the given recordId
        $records = Production::where('recordId', $request->input('recordId'))->get();

        // Check if records were found
        if ($records->isEmpty()) {
            return response()->json(['message' => 'No records found with the provided recordId'], 404);
        }

        // Update the monthYear for all matching records
        foreach ($records as $record) {
            $record->monthYear = $request->input('monthYear');
            $record->save();
        }

        // Return a success response
        return response()->json(['message' => 'MonthYear updated successfully'], 200);
    }

    public function getTotalAreaPlanted($cropId, $variety)
    {
        // Fetch the cropName using the cropId from the Crop model
        $crop = Crop::find($cropId);

        // Check if the crop exists
        if (!$crop) {
            return response()->json([
                'error' => 'Crop not found',
            ], 404);
        }

        // Fetch total areaPlanted for the given cropName and variety
        $totalAreaPlanted = Production::where('cropName', $crop->cropName)
            ->where('variety', $variety)
            ->sum('areaPlanted');

        return response()->json([
            'cropId' => $cropId,
            'cropName' => $crop->cropName,
            'variety' => $variety,
            'totalAreaPlanted' => $totalAreaPlanted,
        ]);
    }
}
