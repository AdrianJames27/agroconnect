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
        Schema::create('soil_healths', function (Blueprint $table) {
            $table->id('soilHealthId');
            $table->unsignedBigInteger('recordId');
            $table->foreign('recordId')->references('recordId')->on('records');
            $table->string('barangay', 255);
            $table->string('fieldType', 255);
            $table->string('nitrogenContent', 255);
            $table->string('phosphorusContent', 255);
            $table->string('potassiumContent', 255);
            $table->string('pH', 255);
            $table->string('generalRating', 255);
            $table->string('recommendations', 255);
            $table->string('season', 255);
            $table->string('monthYear', 255);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soil_healths');
    }
};
