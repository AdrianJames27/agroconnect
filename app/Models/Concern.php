<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Concern extends Model
{
    use HasFactory;

    protected $primaryKey = 'concernId'; // Specify the primary key field name
    protected $fillable = [
        'userId',
        'title',
        'content',
        'attachment',
    ];

    // Define relationship with User
    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'userId');
    }
}
