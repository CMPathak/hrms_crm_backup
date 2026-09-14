<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DomainHosting extends Model
{
    protected $table = 'domains_hosting';
    public $timestamps = false;

    protected $guarded = ['id'];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
