<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Record extends Model
{
    use HasFactory;

    protected $primaryKey = 'recordId';
    protected $fillable = [
        'userId',
        'name',
        'season',
        'monthYear',
        'type',
        'fileRecord'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}
