<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoilHealth extends Model
{
    use HasFactory;

    protected $primaryKey = 'soilHealthId'; // Specify the primary key field name
    protected $fillable = [
        'recordId',
        'barangay',
        'fieldType',
        'nitrogenContent',
        'phosphorusContent',
        'potassiumContent',
        'pH',
        'generalRating',
        'recommendations',
        'season',
        'monthYear',
    ];

    // Define relationship with Record
    public function record()
    {
        return $this->belongsTo(Record::class, 'recordId', 'recordId');
    }
}
