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
        $validatedData = $request->validate([
            'userId' => 'required',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'attachment' => 'nullable',
        ]);

        $concern = Concern::create($validatedData);

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
        $concern = Concern::findOrFail($id);

        $validatedData = $request->validate([
            'userId' => 'required',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'attachment' => 'nullable|string|max:255',
        ]);

        $concern->update($validatedData);

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
}
