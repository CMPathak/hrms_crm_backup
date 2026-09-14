<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    public $timestamps = false;

    protected $guarded = ['id'];

    protected $casts = [
        'due_date' => 'date:Y-m-d',
        'created_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function assigner()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
