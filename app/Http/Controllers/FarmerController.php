<?php

namespace App\Http\Controllers;

use App\Models\Farmer;
use Illuminate\Http\Request;

class FarmerController extends Controller
{
    public function index()
    {
        // Get all farmer, with admins first, ordered by their ID in descending order
        $farmers = farmer::orderBy('farmerId', 'desc')->get();

        return response()->json($farmers, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'barangayId' => 'required|exists:barangays,barangayId',
            'farmerName' => 'required|string|max:255',
            'fieldArea' => 'nullable|numeric',
            'fieldType' => 'required|string|max:255',
            'phoneNumber' => 'nullable|string|max:255',
        ]);

        // If validation passes, create a new farmer record
        $farmer = new Farmer([
            'barangayId' => $request->input('barangayId'),
            'farmerName' => $request->input('farmerName'),
            'fieldArea' => $request->input('fieldArea'),
            'fieldType' => $request->input('fieldType'),
            'phoneNumber' => $request->input('phoneNumber'),
        ]);

        // Save the farmer record to the database
        $farmer->save();

        // Return a JSON response with the created farmer data and status code 201 (Created)
        return response()->json($farmer, 201);
    }

    public function show($id)
    {
        $farmer = Farmer::findOrFail($id);
        return response()->json($farmer);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'barangayId' => 'exists:barangays,barangayId',
            'farmerName' => 'string|max:255',
            'fieldArea' => 'nullable|numeric',
            'fieldType' => 'string|max:255',
            'phoneNumber' => 'nullable|string|max:255',
        ]);

        $farmer = Farmer::findOrFail($id);
        $farmer->update($request->all());

        return response()->json($farmer, 200);
    }

    public function destroy($id)
    {
        $farmer = Farmer::findOrFail($id);
        $farmer->delete();

        return response()->json(null, 204);
    }
}
