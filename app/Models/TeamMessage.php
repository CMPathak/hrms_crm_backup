<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMessage extends Model
{
    protected $table = 'team_messages';
    public $timestamps = false;

    protected $guarded = ['id'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
