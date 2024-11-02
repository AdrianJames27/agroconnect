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
        Schema::create('rice_productions', function (Blueprint $table) {
            $table->id('riceProductionId');
            $table->unsignedBigInteger('recordId');
            $table->foreign('recordId')->references('recordId')->on('records');
            $table->string('barangay', 255);
            $table->string('cropName', 255);
            $table->double('areaPlanted');
            $table->string('monthHarvested', 255);
            $table->double('volumeProduction');
            $table->double('averageYield');
            $table->string('season', 255);
            $table->string('year', 255);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rice_productions');
    }
};
