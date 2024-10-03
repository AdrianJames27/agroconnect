<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('crops', function (Blueprint $table) {
            $table->id('cropId');  // Primary key
            $table->string('cropName', 100);
            $table->string('cropType', 100);
            $table->string('scientificName', 150)->nullable();
            $table->string('plantingSeason', 50)->nullable();
            $table->integer('growthDuration')->nullable();  // Growth duration in days
            $table->string('unit', 20)->default('kg');  // Unit of weight (e.g., kg, lbs)
            $table->decimal('weight', 10, 2)->default(0.00);  // Weight in decimal, optional
            $table->string('cropImg')->nullable();  // Image URL for the crop variety
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crops');
    }
};
