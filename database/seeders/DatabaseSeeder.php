<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Barangay;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Seed the barangays table
        $barangays = [
            [
                'barangayName' => 'Barangay 1',
                'coordinates' => '123.456,789.012',
            ],
            [
                'barangayName' => 'Barangay 2',
                'coordinates' => '456.789,012.345',
            ],
            // Add more barangays as needed
        ];

        foreach ($barangays as $barangay) {
            Barangay::create($barangay);
        }

        // You can add more seeders for other tables if needed
    }
}
