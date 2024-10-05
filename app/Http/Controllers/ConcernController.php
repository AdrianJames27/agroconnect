<?php

namespace App\Http\Controllers;

use App\Models\Concern;
use Illuminate\Http\Request;

class ConcernController extends Controller
{
    /**
     * Display a listing of the concerns.
     */
    public function index()
    {
        $concerns = Concern::all();
        return response()->json($concerns);
    }

    /**
     * Store a newly created concern in storage.
     */
    public function store(Request $request)
    {
        // Validate incoming request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'attachment' => 'nullable',
            'status' => 'nullable|string', // Allow status to be nullable
        ]);

        // Set default status to "unread" if not provided
        if (empty($validatedData['status'])) {
            $validatedData['status'] = 'unread'; // Set status to "unread"
        }

        // Create a new concern with the validated data
        $concern = Concern::create($validatedData);

        // Return the created concern as a JSON response
        return response()->json($concern, 201);
    }

    /**
     * Display the specified concern.
     */
    public function show($id)
    {
        $concern = Concern::findOrFail($id);
        return response()->json($concern);
    }

    /**
     * Update the specified concern in storage.
     */
    public function update(Request $request, $id)
    {
        // Find the concern by ID or fail if not found
        $concern = Concern::findOrFail($id);

        // Validate incoming request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'attachment' => 'nullable|string|max:255',
            'status' => 'nullable|string', // Allow status to be nullable
        ]);

        // Set default status to "unread" if not provided
        if (empty($validatedData['status'])) {
            $validatedData['status'] = 'unread'; // Set status to "unread"
        }

        // Update the concern with the validated data
        $concern->update($validatedData);

        // Return the updated concern as a JSON response
        return response()->json($concern);
    }

    /**
     * Remove the specified concern from storage.
     */
    public function destroy($id)
    {
        $concern = Concern::findOrFail($id);
        $concern->delete();

        return response()->json(null, 204);
    }

    public function updateStatus(Request $request, $id)
    {
        // Find the concern by ID or fail if not found
        $concern = Concern::findOrFail($id);

        // Validate incoming request data
        $validatedData = $request->validate([
            'status' => 'required|in:1,2', // Accept only 1 (read) or 2 (resolved)
        ]);

        // Update the status based on the provided value
        if ($validatedData['status'] == '1') {
            $concern->status = 'read'; // Update to "read"
        } elseif ($validatedData['status'] == '2') {
            $concern->status = 'resolved'; // Update to "resolved"
        }

        // Save the updated concern
        $concern->save();

        // Return the updated concern as a JSON response
        return response()->json($concern);
    }
}
