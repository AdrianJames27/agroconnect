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
            $table->string('varietyName');  // Name of the specific crop variety
            $table->longText('color')->nullable();  // Color characteristic
            $table->longText('size')->nullable();  // Size characteristic
            $table->longText('flavor')->nullable();  // Flavor profile
            $table->longText('growthConditions')->nullable();  // Growth conditions
            $table->longText('pestDiseaseResistance')->nullable();  // Pest/disease resistance
            $table->longText('recommendedPractices')->nullable();  // Recommended farming practices
            $table->longText('cropImg')->nullable();  // Image URL for the crop variety
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
