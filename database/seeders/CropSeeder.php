<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CropSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $now = Carbon::now();
        $dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...'; // Sample base64 encoded image string
        $crops = [
            // Fruits
            ['cropName' => 'Coffee', 'type' => 'Fruits', 'priceWeight' => 'kg', 'variety' => 'Arabica', 'cropImg' => $dummyImage, 'description' => 'High-quality coffee beans.', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Banana', 'type' => 'Fruits', 'priceWeight' => 'kg', 'variety' => 'Cavendish', 'cropImg' => $dummyImage, 'description' => 'Rich in potassium and fiber.', 'created_at' => $now, 'updated_at' => $now],
            // Vegetables
            ['cropName' => 'Upo', 'type' => 'Vegetables', 'priceWeight' => 'pc/(about 1kg)', 'variety' => 'Mayumi', 'cropImg' => $dummyImage, 'description' => 'A smooth, elongated gourd used in various dishes.', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Squash', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'variety' => 'Suprema', 'cropImg' => $dummyImage, 'description' => 'Large, flavorful squash with a rich, nutty taste.', 'created_at' => $now, 'updated_at' => $now],
            // More crop records...
        ];

        DB::table('crops')->insert($crops);
    }
}
