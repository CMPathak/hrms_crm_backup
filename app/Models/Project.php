<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    public $timestamps = false;

    protected $guarded = ['id'];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignment()
    {
        return $this->hasOne(ProjectAssignment::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function domainHosting()
    {
        return $this->hasOne(DomainHosting::class);
    }

    public function keywords()
    {
        return $this->hasMany(SeoKeyword::class);
    }

    public function reports()
    {
        return $this->hasMany(SeoReport::class);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['Closed', 'closed', 'Closed Project', 'Permanent Closed', 'Completed', 'completed', 'On Hold', 'Hold', 'hold']);
    }

    public function scopeHold($query)
    {
        return $query->whereIn('status', ['On Hold', 'Hold', 'hold']);
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['Completed', 'completed']);
    }

    public function scopeClosed($query)
    {
        return $query->whereIn('status', ['Closed', 'closed', 'Closed Project', 'Permanent Closed']);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['Pending', 'pending', 'Not Started', 'not started']);
    }
}
