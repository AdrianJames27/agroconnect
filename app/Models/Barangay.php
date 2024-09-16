<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    use HasFactory;

    protected $primaryKey = 'barangayId';
    protected $fillable = [
        'barangayName',
        'coordinates',
    ];

    // Optionally, you can define relationships or additional methods here
}
