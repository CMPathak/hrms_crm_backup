<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'role_name',
        'display_name',
        'description',
        'created_at',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
