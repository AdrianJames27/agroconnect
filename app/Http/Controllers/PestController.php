<?php

namespace App\Http\Controllers;

use App\Models\Pest;
use Illuminate\Http\Request;

class PestController extends Controller
{
    public function index()
    {
        // Get all pests, ordered by their ID in descending order
        $pests = Pest::orderBy('pestId', 'desc')->get();

        return response()->json($pests, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'required|exists:records,recordId',
            'barangay' => 'required|string|max:255',
            'cropName' => 'required|string|max:255',
            'pestName' => 'required|string|max:255',
            'totalPlanted' => 'required|numeric',
            'totalAffected' => 'required|numeric',
            'season' => 'required|string|max:255',
            'monthYear' => 'required|string|max:255',
        ]);

        // If validation passes, create a new pest record
        $pest = new Pest([
            'recordId' => $request->input('recordId'),
            'barangay' => $request->input('barangay'),
            'cropName' => $request->input('cropName'),
            'pestName' => $request->input('pestName'),
            'totalPlanted' => $request->input('totalPlanted'),
            'totalAffected' => $request->input('totalAffected'),
            'season' => $request->input('season'),
            'monthYear' => $request->input('monthYear'),
        ]);

        // Save the pest record to the database
        $pest->save();

        // Return a JSON response with the created pest data and status code 201 (Created)
        return response()->json($pest, 201);
    }

    public function storeBatch(Request $request)
    {
        $pestDataArray = $request->input('pestData');

        if (empty($pestDataArray)) {
            return response()->json(['message' => 'No data to process']);
        }

        // Process and store each item in the validated data
        foreach ($pestDataArray as $pestData) {
            $request->validate([
                'pestData.*.recordId' => 'required|exists:records,recordId',
                'pestData.*.barangay' => 'required|string|max:255',
                'pestData.*.cropName' => 'required|string|max:255',
                'pestData.*.pestName' => 'required|string|max:255',
                'pestData.*.totalPlanted' => 'required|numeric',
                'pestData.*.totalAffected' => 'required|numeric',
                'pestData.*.season' => 'required|string|max:255',
                'pestData.*.monthYear' => 'required|string|max:255',
            ]);

            Pest::create(
                [
                    'recordId' => $pestData['recordId'],
                    'barangay' => $pestData['barangay'],
                    'cropName' => $pestData['cropName'],
                    'pestName' => $pestData['pestName'],
                    'totalPlanted' => $pestData['totalPlanted'],
                    'totalAffected' => $pestData['totalAffected'],
                    'season' => $pestData['season'],
                    'monthYear' => $pestData['monthYear']
                ],
            );
        }

        return response()->json(['message' => 'Batch data stored successfully']);
    }

    public function destroy($id)
    {
        // Find the specific pest record by its ID
        $pest = Pest::findOrFail($id);

        // Delete the pest record from the database
        $pest->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }

    public function destroyBatch(Request $request)
    {
        // Retrieve the array of records from the request
        $pestDataArray = $request->input('pestData');

        // Check if the input is an array and not empty
        if (!is_array($pestDataArray) || empty($pestDataArray)) {
            return response()->json(['error' => 'Invalid input'], 400);
        }

        // Extract foreign keys (recordIds) from the pest data array
        $foreignKeys = array_column($pestDataArray, 'recordId');

        // Validate that foreign keys are properly extracted
        if (empty($foreignKeys)) {
            return response()->json(['error' => 'No valid foreign keys found'], 400);
        }

        // Find the primary keys of records in the Pest table that match the foreign keys
        $recordsToDelete = Pest::whereIn('recordId', $foreignKeys)->pluck('pestId');

        // Ensure that we have valid records to delete
        if ($recordsToDelete->isEmpty()) {
            return response()->json(['error' => 'No records found to delete'], 404);
        }

        // Delete the records from the database
        Pest::whereIn('pestId', $recordsToDelete)->delete();

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
        $records = Pest::where('recordId', $request->input('recordId'))->get();

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
}
