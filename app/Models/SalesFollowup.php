<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesFollowup extends Model
{
    protected $fillable = [
        'user_id',
        'client_name',
        'followup_date',
        'status',
        'remarks',
        'next_followup_date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
