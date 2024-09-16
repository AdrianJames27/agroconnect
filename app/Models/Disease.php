<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disease extends Model
{
    use HasFactory;

    protected $primaryKey = 'diseaseId'; // Specify the primary key field name
    protected $fillable = [
        'recordId',
        'barangay',
        'cropName',
        'diseaseName',
        'totalPlanted',
        'totalAffected',
        'season',
        'monthYear',
    ];

    // Define relationship with Record
    public function record()
    {
        return $this->belongsTo(Record::class, 'recordId', 'recordId');
    }
}
