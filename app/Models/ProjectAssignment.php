<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectAssignment extends Model
{
    public $timestamps = false;

    protected $guarded = ['id'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function developer()
    {
        return $this->belongsTo(User::class, 'developer_id');
    }

    public function designer()
    {
        return $this->belongsTo(User::class, 'designer_id');
    }

    public function seoExecutive()
    {
        return $this->belongsTo(User::class, 'seo_executive_id');
    }

    public function googleAdsExecutive()
    {
        return $this->belongsTo(User::class, 'google_ads_executive_id');
    }
}
