<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; // Import Carbon for timestamp generation

class FarmerSeeder extends Seeder
{
    public function run()
    {
        $data = [
            ['Farmer A', 4, 1.50, 'Vegetable', '0912345678'],
            ['Farmer B', 5, 2.00, 'Fruit Trees', '0912345679'],
            ['Farmer C', 6, 2.50, 'OA', '0912345680'],
            ['Farmer D', 7, 3.00, 'Corn', '0912345681'],
            ['Farmer E', 8, 3.50, 'Rice', '0912345682'],
            ['Farmer F', 4, 1.50, 'Vegetable', '0912345683'],
            ['Farmer G', 5, 2.00, 'Fruit Trees', '0912345684'],
            ['Farmer H', 6, 2.50, 'OA', '0912345685'],
            ['Farmer I', 7, 3.00, 'Corn', '0912345686'],
            ['Farmer J', 8, 3.50, 'Rice', '0912345687'],
            ['Farmer K', 4, 1.50, 'Vegetable', '0912345688'],
            ['Farmer L', 5, 2.00, 'Fruit Trees', '0912345689'],
            ['Farmer M', 6, 2.50, 'OA', '0912345690'],
            ['Farmer N', 7, 3.00, 'Corn', '0912345691'],
            ['Farmer O', 8, 3.50, 'Rice', '0912345692'],
            ['Farmer P', 4, 1.50, 'Vegetable', '0912345693'],
            ['Farmer Q', 5, 2.00, 'Fruit Trees', '0912345694'],
            ['Farmer R', 6, 2.50, 'OA', ''],
            ['Farmer S', 7, 3.00, 'Corn', '0912345696'],
            ['Farmer T', 8, 3.50, 'Rice', '0912345697'],
            ['Farmer U', 4, 1.50, 'Vegetable', '0912345698'],
            ['Farmer V', 5, 2.00, 'Fruit Trees', '0912345699'],
            ['Farmer W', 6, 2.50, 'OA', '0912345700'],
            ['Farmer X', 7, 3.00, 'Corn', '0912345701'],
            ['Farmer Y', 8, 3.50, 'Rice', '0912345702'],
            ['Farmer Z', 4, 1.50, 'Vegetable', '0912345703'],
            ['Farmer AA', 5, 2.00, 'Fruit Trees', '0912345704'],
            ['Farmer BB', 6, 2.50, 'OA', '0912345705'],
            ['Farmer CC', 7, 3.00, 'Corn', '0912345706'],
            ['Farmer DD', 8, 3.50, 'Rice', '0912345707'],
            ['Farmer EE', 4, 1.50, 'Vegetable', '0912345708'],
            ['Farmer FF', 5, 2.00, 'Fruit Trees', '0912345709'],
            ['Farmer GG', 6, 2.50, 'OA', ''],
            ['Farmer HH', 7, 3.00, 'Corn', '0912345711'],
            ['Farmer II', 8, 3.50, 'Rice', ''],
            ['Farmer JJ', 4, 1.50, 'Vegetable', ''],
            ['Farmer KK', 5, 2.00, 'Fruit Trees', '0912345714'],
            ['Farmer LL', 6, 2.50, 'OA', '0912345715'],
            ['Farmer MM', 7, 3.00, 'Corn', '0912345716'],
            ['Farmer NN', 8, 3.50, 'Rice', '0912345717'],
            ['Farmer OO', 4, 1.50, 'Vegetable', '0912345718'],
            ['Farmer PP', 5, 2.00, 'Fruit Trees', ''],
            ['Farmer QQ', 6, 2.50, 'OA', '0912345720'],
            ['Farmer RR', 7, 3.00, 'Corn', '0912345721'],
            ['Farmer SS', 8, 3.50, 'Rice', '0912345722'],
            ['Farmer TT', 4, 1.50, 'Vegetable', '0912345723'],
            ['Farmer UU', 5, 2.00, 'Fruit Trees', ''],
            ['Farmer VV', 6, 2.50, 'OA', '0912345725'],
        ];


        foreach ($data as $record) {
            DB::table('farmers')->insert([
                'barangayId' => $record[1],
                'farmerName' => $record[0],
                'fieldArea' => $record[2],
                'fieldType' => $record[3],
                'phoneNumber' => $record[4],
                'created_at' => Carbon::now(), // Current timestamp
                'updated_at' => Carbon::now(), // Current timestamp
            ]);
        }
    }
}
