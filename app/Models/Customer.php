<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'custom_id',
        'client_name',
        'company_name',
        'contact_person',
        'mobile',
        'email',
        'address',
        'business_category',
        'created_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function domains()
    {
        return $this->hasMany(DomainHosting::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
