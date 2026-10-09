<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesFollowup extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'owner_name',
        'client_name',
        'client_email',
        'client_contact',
        'client_address',
        'followup_date',
        'status',
        'remarks',
        'next_followup_date',
        'meeting_date',
        'meeting_time'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
