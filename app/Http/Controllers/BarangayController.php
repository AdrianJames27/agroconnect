<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class BarangayController extends Controller
{

    public function index()
    {
        // Get all barangays, with admins first, ordered by their ID in descending order
        $barangays = barangay::orderBy('barangayId', 'desc')->get();

        return response()->json($barangays, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'barangayName' => 'required|string',
            'coordinates' => 'required|string',
        ]);

        // Accessing input data using $request->input('fieldName')
        $barangay = new Barangay([
            'barangayName' => $request->input('barangayName'),
            'coordinates' => $request->input('coordinates'),
        ]);

        $barangay->save();

        return response()->json($barangay, 201);
    }

    public function show($id)
    {
        $barangay = barangay::findOrFail($id);
        return response()->json($barangay, 200);
    }

    public function update(Request $request, $id)
    {
        // Find barangay by username
        $barangay = barangay::findOrFail($id);

        // Validate request data
        $request->validate([
            'barangayName' => 'string',
            'coordinates' => 'string',
        ]);

        // Update barangay attributes
        $barangay->fill($request->only(['barangayName', 'coordinates']));

        // Save updated barangay to the database
        $barangay->save();

        // Return JSON response with the updated barangay and status code 200 (OK)
        return response()->json($barangay, 200);
    }

    public function destroy($id)
    {
        $barangay = barangay::find($id);
        if ($barangay) {
            $barangay->delete();
            return response()->json(null, 204);
        } else {
            return response()->json(['message' => 'barangay not found'], 404);
        }
    }
}
