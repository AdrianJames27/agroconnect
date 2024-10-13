<?php

namespace App\Http\Controllers;

use App\Models\Disease;
use Illuminate\Http\Request;

class DiseaseController extends Controller
{
    public function index()
    {
        // Get all diseases, ordered by their ID in descending order
        $diseases = Disease::orderBy('diseaseId', 'desc')->get();

        return response()->json($diseases, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'required|exists:records,recordId',
            'barangay' => 'required|string|max:255',
            'cropName' => 'required|string|max:255',
            'diseaseName' => 'required|string|max:255',
            'totalPlanted' => 'required|numeric',
            'totalAffected' => 'required|numeric',
            'season' => 'required|string|max:255',
            'monthYear' => 'required|string|max:255',
        ]);

        // If validation passes, create a new disease record
        $disease = new Disease([
            'recordId' => $request->input('recordId'),
            'barangay' => $request->input('barangay'),
            'cropName' => $request->input('cropName'),
            'diseaseName' => $request->input('diseaseName'),
            'totalPlanted' => $request->input('totalPlanted'),
            'totalAffected' => $request->input('totalAffected'),
            'season' => $request->input('season'),
            'monthYear' => $request->input('monthYear'),
        ]);

        // Save the disease record to the database
        $disease->save();

        // Return a JSON response with the created disease data and status code 201 (Created)
        return response()->json($disease, 201);
    }

    public function storeBatch(Request $request)
    {
        $diseaseDataArray = $request->input('diseaseData');

        // If $diseaseDataArray is empty or not present, skip processing and return
        if (empty($diseaseDataArray)) {
            return response()->json(['message' => 'No data to process']);
        }

        // Process and store each item in the validated data
        foreach ($diseaseDataArray as $diseaseData) {
            $request->validate([
                'diseaseData.*.recordId' => 'required|exists:records,recordId',
                'diseaseData.*.barangay' => 'required|string|max:255',
                'diseaseData.*.cropName' => 'required|string|max:255',
                'diseaseData.*.diseaseName' => 'required|string|max:255',
                'diseaseData.*.totalPlanted' => 'required|numeric',
                'diseaseData.*.totalAffected' => 'required|numeric',
                'diseaseData.*.season' => 'required|string|max:255',
                'diseaseData.*.monthYear' => 'required|string|max:255',
            ]);

            Disease::create(
                [
                    'recordId' => $diseaseData['recordId'],
                    'barangay' => $diseaseData['barangay'],
                    'cropName' => $diseaseData['cropName'],
                    'diseaseName' => $diseaseData['diseaseName'],
                    'totalPlanted' => $diseaseData['totalPlanted'],
                    'totalAffected' => $diseaseData['totalAffected'],
                    'season' => $diseaseData['season'],
                    'monthYear' => $diseaseData['monthYear'],
                ],
            );
        }

        return response()->json(['message' => 'Batch data stored successfully']);
    }

    public function destroy($id)
    {
        // Find the specific disease record by its ID
        $disease = Disease::findOrFail($id);

        // Delete the disease record from the database
        $disease->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }

    public function destroyBatch(Request $request)
    {
        // Retrieve the array of records from the request
        $diseaseDataArray = $request->input('diseaseData');

        // Check if the input is an array and not empty
        if (!is_array($diseaseDataArray) || empty($diseaseDataArray)) {
            return response()->json(['error' => 'Invalid input'], 400);
        }

        // Extract foreign keys (recordIds) from the disease data array
        $foreignKeys = array_column($diseaseDataArray, 'recordId');

        // Validate that foreign keys are properly extracted
        if (empty($foreignKeys)) {
            return response()->json(['error' => 'No valid foreign keys found'], 400);
        }

        // Find the primary keys of records in the Disease table that match the foreign keys
        $recordsToDelete = Disease::whereIn('recordId', $foreignKeys)->pluck('diseaseId');

        // Ensure that we have valid records to delete
        if ($recordsToDelete->isEmpty()) {
            return response()->json(['error' => 'No records found to delete'], 404);
        }

        // Delete the records from the database
        Disease::whereIn('diseaseId', $recordsToDelete)->delete();

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
        $records = Disease::where('recordId', $request->input('recordId'))->get();

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
