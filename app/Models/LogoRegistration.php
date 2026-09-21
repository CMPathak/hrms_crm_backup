<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogoRegistration extends Model
{
    protected $guarded = ['id'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
