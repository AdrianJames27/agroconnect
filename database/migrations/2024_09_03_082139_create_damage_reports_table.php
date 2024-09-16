<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDamageReportsTable extends Migration
{
    public function up()
    {
        Schema::create('damage_reports', function (Blueprint $table) {
            $table->id('damageId');
            $table->unsignedBigInteger('recordId');
            $table->foreign('recordId')->references('recordId')->on('records');
            $table->string('barangay');
            $table->string('cropName');
            $table->string('variety')->nullable();
            $table->integer('numberOfFarmers');
            $table->decimal('areaAffected', 8, 2); // 8 digits total, 2 decimal places
            $table->string('yieldLoss');
            $table->decimal('grandTotalValue', 15, 2); // 15 digits total, 2 decimal places
            $table->string('season');
            $table->string('monthYear');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('damage_reports');
    }
}
