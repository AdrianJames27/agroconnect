<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DamageReport extends Model
{
    use HasFactory;

    protected $primaryKey = 'damageId';
    protected $fillable = [
        'recordId',
        'barangay',
        'cropName',
        'variety',
        'numberOfFarmers',
        'areaAffected',
        'yieldLoss',
        'grandTotalValue',
        'season',
        'monthYear',
    ];

    // Define relationship with Record
    public function record()
    {
        return $this->belongsTo(Record::class, 'recordId', 'recordId');
    }
}
