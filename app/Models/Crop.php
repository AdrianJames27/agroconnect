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
        'variety',
        'priceWeight',
        'type',
        'cropImg',
        'description',
    ];

    // Define relationship with Production model
    public function productions()
    {
        return $this->hasMany(Production::class, 'cropName', 'cropName');
    }
}
