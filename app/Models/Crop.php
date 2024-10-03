<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Crop extends Model
{
    use HasFactory;

    protected $primaryKey = 'cropId';

    protected $fillable = [
        'cropName',
        'cropType',
        'scientificName',    // Added scientific name
        'plantingSeason',    // Added planting season
        'growthDuration',    // Added growth duration in days
        'unit',              // Added unit (e.g., kg, lbs)
        'weight',            // Added weight
        'cropImg'
    ];

    // Define relationship with Production model
    public function productions()
    {
        return $this->hasMany(Production::class, 'cropId', 'cropId');
    }

    // Define relationship with CropVariety model
    public function varieties()
    {
        return $this->hasMany(CropVariety::class, 'cropId', 'cropId');
    }
}
