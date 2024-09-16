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
        Schema::create('farmers', function (Blueprint $table) {
            $table->id('farmerId'); // Creates 'id' as primary key by default
            $table->unsignedBigInteger('barangayId');
            $table->foreign('barangayId')->references('barangayId')->on('barangays');
            $table->string('farmerName', 255)->nullable(false);
            $table->double('fieldArea')->nullable();
            $table->string('fieldType', 255)->nullable(false);
            $table->string('phoneNumber', 255)->nullable();
            $table->timestamps(); // Adds 'created_at' and 'updated_at' columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('farmers');
    }
};
