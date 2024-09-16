<?php

namespace App\Http\Controllers;

use App\Models\Price;
use Illuminate\Http\Request;

class PriceController extends Controller
{
    public function index()
    {
        // Get all prices, ordered by their ID in descending order
        $prices = Price::orderBy('priceId', 'desc')->get();

        return response()->json($prices, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'required|exists:records,recordId',
            'cropName' => 'required|string|max:255',
            'price' => 'required|string|max:255',
            'season' => 'required|string|max:255',
            'monthYear' => 'required|string|max:255',
        ]);

        // If validation passes, create a new price record
        $price = new Price([
            'recordId' => $request->input('recordId'),
            'cropName' => $request->input('cropName'),
            'price' => $request->input('price'),
            'season' => $request->input('season'),
            'monthYear' => $request->input('monthYear'),
        ]);

        // Save the price record to the database
        $price->save();

        // Return a JSON response with the created price data and status code 201 (Created)
        return response()->json($price, 201);
    }

    public function storeBatch(Request $request)
    {
        $priceDataArray = $request->input('priceData');

        // Process and store each item in the validated data
        foreach ($priceDataArray as $priceData) {
            $request->validate([
                'priceData.*.recordId' => 'required|exists:records,recordId',
                'priceData.*.cropName' => 'required|string|max:255',
                'priceData.*.price' => 'required|string|max:255',
                'priceData.*.season' => 'required|string|max:255',
                'priceData.*.monthYear' => 'required|string|max:255',
            ]);

            Price::updateOrCreate(
                [
                    'recordId' => $priceData['recordId'],
                    'cropName' => $priceData['cropName'],
                    'price' => $priceData['price'],
                    'season' => $priceData['season'],
                    'monthYear' => $priceData['monthYear']
                ]
            );
        }

        return response()->json(['message' => 'Batch data stored successfully']);
    }

    public function destroy($id)
    {
        // Find the specific price record by its ID
        $price = Price::findOrFail($id);

        // Delete the price record from the database
        $price->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }

    public function destroyBatch(Request $request)
    {
        // Retrieve the array of records from the request
        $priceDataArray = $request->input('priceData');

        // Check if the input is an array and not empty
        if (!is_array($priceDataArray) || empty($priceDataArray)) {
            return response()->json(['error' => 'Invalid input'], 400);
        }

        // Extract foreign keys (recordIds) from the price data array
        $foreignKeys = array_column($priceDataArray, 'recordId');

        // Validate that foreign keys are properly extracted
        if (empty($foreignKeys)) {
            return response()->json(['error' => 'No valid foreign keys found'], 400);
        }

        // Find the primary keys of records in the Price table that match the foreign keys
        $recordsToDelete = Price::whereIn('recordId', $foreignKeys)->pluck('priceId');

        // Ensure that we have valid records to delete
        if ($recordsToDelete->isEmpty()) {
            return response()->json(['error' => 'No records found to delete'], 404);
        }

        // Delete the records from the database
        Price::whereIn('priceId', $recordsToDelete)->delete();

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
        $records = Price::where('recordId', $request->input('recordId'))->get();

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
