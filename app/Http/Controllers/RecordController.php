<?php

namespace App\Http\Controllers;

use App\Models\DamageReport;
use App\Models\Record;
use App\Models\Production;
use App\Models\Price;
use App\Models\Pest;
use App\Models\Disease;
use App\Models\SoilHealth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class RecordController extends Controller
{
    public function index()
    {
        // Get all record, with admins first, ordered by their ID in descending order
        $records = record::orderBy('recordId', 'desc')->get();

        return response()->json($records, 200);
    }

    public function indexByType($type)
    {
        // Query records, filter by type and order by recordId in descending order
        $records = record::where('type', $type)
            ->orderBy('recordId', 'desc')
            ->get();

        // Return the response as JSON
        return response()->json($records, 200);
    }


    public function store(Request $request)
    {
        // Validate the incoming request data
        $request->validate([
            'userId' => 'required|exists:users,userId',
            'name' => 'required|string|max:255',
            'season' => 'required|string|max:255',
            'monthYear' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'fileRecord' => 'required|string',
        ]);


        // Accessing input data using $request->input('fieldName')
        $record = new Record([
            'userId' => $request->input('userId'),
            'name' => $request->input('name'),
            'season' => $request->input('season'),
            'monthYear' => $request->input('monthYear'),
            'type' => $request->input('type'),
            'fileRecord' => $request->input('fileRecord'),
        ]);

        $record->save();

        return response()->json($record, 201);
    }

    public function show($id)
    {
        $record = Record::findOrFail($id);
        return response()->json($record);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'userId' => 'exists:users,userId',
            'name' => 'string|max:255',
            'season' => 'string|max:255',
            'monthYear' => 'string|max:255',
            'type' => 'string|max:255',
            'fileRecord' => 'nullable|string', // Allow fileRecord to be nullable and string
        ]);

        $record = Record::findOrFail($id);

        // Update record attributes except for 'fileRecord'
        $record->fill($request->except('fileRecord'));

        // Check if 'fileRecord' has a value and update it
        if ($request->has('fileRecord') && !empty($request->fileRecord)) {
            $record->fileRecord = $request->fileRecord;
        }

        // Save updated record to the database
        $record->save();

        // Return JSON response with the updated record and status code 200 (OK)
        return response()->json($record, 200);
    }

    public function destroy($id)
    {
        // Start a database transaction to ensure atomicity
        DB::beginTransaction();

        try {
            // Find the record by ID
            $record = Record::findOrFail($id);

            // Check the type of the record
            if ($record->type === 'production') {
                // Delete associated records from the Production table
                Production::where('recordId', $id)->delete();
            } else if ($record->type === 'price') {
                // Delete associated records from the Price table
                Price::where('recordId', $id)->delete();
            } else if ($record->type === 'pestDisease') {
                // Delete associated records from the Price table
                Pest::where('recordId', $id)->delete();
                Disease::where('recordId', $id)->delete();
            } else if ($record->type === 'soilHealth') {
                // Delete associated records from the Price table
                SoilHealth::where('recordId', $id)->delete();
            } else if ($record->type === 'damage') {
                // Delete associated records from the Price table
                DamageReport::where('recordId', $id)->delete();
            }

            // Delete the record itself
            $record->delete();

            // Commit the transaction
            DB::commit();

            return response()->json(null, 204);
        } catch (\Exception $e) {
            // Rollback the transaction if something goes wrong
            DB::rollBack();

            // Return a JSON response with status code 500 (Internal Server Error)
            return response()->json(['error' => 'Failed to delete record'], 500);
        }
    }
}
