<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CropVariety extends Model
{
    use HasFactory;

    protected $primaryKey = 'varietyId';

    protected $fillable = [
        'cropId',                // Foreign key linking to the Crop model
        'varietyName',           // Name of the specific crop variety
        'color',                 // Color characteristic of the crop variety
        'size',                  // Size characteristic of the crop variety
        'flavor',                // Flavor profile of the variety
        'growthConditions',      // Conditions required for optimal growth
        'pestDiseaseResistance', // Resistance to pests/diseases
        'recommendedPractices',   // Recommended farming practices
        'cropImg'
    ];

    // Define relationship with Crop model
    public function crop()
    {
        return $this->belongsTo(Crop::class, 'cropId', 'cropId');
    }
}
