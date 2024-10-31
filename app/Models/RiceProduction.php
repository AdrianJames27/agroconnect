<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Production extends Model
{
    use HasFactory;

    protected $primaryKey = 'productionId'; // Specify the primary key field name
    protected $fillable = [
        'recordId',
        'barangay',
        'cropName',
        'areaPlanted',
        'volumeProduction',
        'averageYield',
        'monthHarvested',
        'season',
        'year'
    ];

    // Define relationship with Record
    public function record()
    {
        return $this->belongsTo(Record::class, 'recordId');
    }

    // Define the relationship with Crop model
    public function crop()
    {
        return $this->belongsTo(Crop::class, 'cropName', 'cropName');
    }
}
