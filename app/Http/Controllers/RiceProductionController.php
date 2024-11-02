<?php

namespace App\Http\Controllers;

use App\Models\RiceProduction;
use App\Models\Crop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RiceProductionController extends Controller
{
    public function index()
    {
        // Get all productions, ordered by their ID in descending order
        $productions = RiceProduction::orderBy('riceProductionId', 'desc')->get();

        return response()->json($productions, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'required|exists:records,recordId',
            'barangay' => 'required|string|max:255',
            'cropName' => 'required|string|max:255',
            'areaPlanted' => 'required|numeric',
            'monthHarvested' => 'required|string|max:255',
            'volumeProduction' => 'required|numeric',
            'averageYield' => 'required|numeric',
            'season' => 'required|string|max:255',
            'year' => 'required|string|max:255',
        ]);

        // If validation passes, create a new production record
        $production = new RiceProduction([
            'recordId' => $request->input('recordId'),
            'barangay' => $request->input('barangay'),
            'cropName' => $request->input('cropName'),
            'areaPlanted' => $request->input('areaPlanted'),
            'monthHarvested' => $request->input('monthHarvested'),
            'volumeProduction' => $request->input('volumeProduction'),
            'averageYield' => $request->input('averageYield'),
            'season' => $request->input('season'),
            'year' => $request->input('year'),
        ]);

        // Save the production record to the database
        $production->save();

        // Return a JSON response with the created production data and status code 201 (Created)
        return response()->json($production, 201);
    }

    public function storeBatch(Request $request)
    {
        $productionDataArray = $request->input('riceProductionData');

        // Log the incoming request data
        Log::info('Received riceProductionData:', ['data' => $productionDataArray]);

        // Process and store each item in the validated data
        foreach ($productionDataArray as $productionData) {
            $request->validate([
                'riceProductionData.*.recordId' => 'required|exists:records,recordId',
                'riceProductionData.*.barangay' => 'required|string|max:255',
                'riceProductionData.*.cropName' => 'required|string|max:255',
                'riceProductionData.*.areaPlanted' => 'required|numeric',
                'riceProductionData.*.monthHarvested' => 'required|string|max:50',
                'riceProductionData.*.volumeProduction' => 'required|numeric',
                'riceProductionData.*.averageYield' => 'required|numeric',
                'riceProductionData.*.season' => 'required|string|max:50',
                'riceProductionData.*.year' => 'required|string|max:255',
            ]);
            RiceProduction::create(
                [
                    'recordId' => $productionData['recordId'],
                    'barangay' => $productionData['barangay'],
                    'cropName' => $productionData['cropName'],
                    'areaPlanted' => $productionData['areaPlanted'],
                    'monthHarvested' => $productionData['monthHarvested'],
                    'volumeProduction' => $productionData['volumeProduction'],
                    'averageYield' => $productionData['averageYield'],
                    'season' => $productionData['season'],
                    'year' => $productionData['year']
                ]
            );
        }

        return response()->json(['message' => 'Batch data stored successfully']);
    }

    public function destroy($id)
    {
        // Find the specific production record by its ID
        $production = RiceProduction::findOrFail($id);

        // Delete the production record from the database
        $production->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }

    public function destroyBatch(Request $request)
    {
        // Retrieve the array of records from the request
        $productionDataArray = $request->input('riceProductionData');

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
        $recordsToDelete = RiceProduction::whereIn('recordId', $foreignKeys)->pluck('riceProductionId');

        // Ensure that we have valid records to delete
        if ($recordsToDelete->isEmpty()) {
            return response()->json(['error' => 'No records found to delete'], 404);
        }

        // Delete the records from the database
        RiceProduction::whereIn('riceProductionId', $recordsToDelete)->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }

    public function updateYear(Request $request)
    {
        // Validate request data
        $request->validate([
            'recordId' => 'required|integer',
            'monthYear' => 'required|string',  // The new value for monthYear
            'season' => 'required|string',
        ]);

        // Find all records with the given recordId
        $records = RiceProduction::where('recordId', $request->input('recordId'))->get();

        // Check if records were found
        if ($records->isEmpty()) {
            return response()->json(['message' => 'No records found with the provided recordId'], 404);
        }

        // Update the monthYear for all matching records
        foreach ($records as $record) {
            $record->year = $request->input('monthYear');
            $record->season = $request->input('season'); // Update the season field
            $record->save();
        }

        // Return a success response
        return response()->json(['message' => 'Year updated successfully'], 200);
    }
}
