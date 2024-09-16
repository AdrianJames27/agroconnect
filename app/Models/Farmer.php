<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Farmer extends Model
{
    use HasFactory;

    protected $primaryKey = 'farmerId'; // Specify the primary key field name
    protected $fillable = [
        'barangayId',
        'farmerName',
        'fieldArea',
        'fieldType',
        'phoneNumber',
    ];

    // Define relationship with Barangay
    public function barangay()
    {
        return $this->belongsTo(Barangay::class, 'barangayId', 'barangayId');
    }
}
