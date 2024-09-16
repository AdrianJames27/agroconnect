<?php

namespace App\Http\Controllers;

use App\Models\Download;
use Illuminate\Http\Request;

class DownloadController extends Controller
{
    // Method to count the rows in the downloads table
    public function countDownloads()
    {
        $count = Download::count();

        return response()->json([
            'download_count' => $count,
        ]);
    }

    // Method to add a new download record
    public function addDownload(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
        ]);

        // Create a new download record
        $download = Download::create($validatedData);

        // Return a success response
        return response()->json([
            'message' => 'Download record added successfully!',
            'download' => $download,
        ], 201); // 201 status code for resource creation
    }
}
