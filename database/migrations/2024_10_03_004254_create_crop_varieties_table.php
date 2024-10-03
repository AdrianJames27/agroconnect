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
        Schema::create('crop_varieties', function (Blueprint $table) {
            $table->id('varietyId');  // Primary key
            $table->unsignedBigInteger('cropId');
            $table->foreign('cropId')->references('cropId')->on('crops');
            $table->string('varietyName', 100);  // Name of the specific crop variety
            $table->string('color', 50)->nullable();  // Color characteristic
            $table->string('size', 50)->nullable();  // Size characteristic
            $table->string('flavor', 100)->nullable();  // Flavor profile
            $table->text('growthConditions')->nullable();  // Growth conditions
            $table->text('pestDiseaseResistance')->nullable();  // Pest/disease resistance
            $table->text('recommendedPractices')->nullable();  // Recommended farming practices
            $table->text('cropImg')->nullable();  // Image URL for the crop variety
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crop_varieties');
    }
};
