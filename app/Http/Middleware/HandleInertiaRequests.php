<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $renewalAlerts = [];
        if ($user = $request->user()) {
            $query = \App\Models\Project::with('domainHosting')
                ->whereHas('domainHosting', function ($q) {
                    $q->whereNotNull('renewal_date')
                      ->where('renewal_date', '<=', now()->addDays(60));
                })
                ->whereNotIn('status', ['completed', 'closed']);

            if (!$user->isAdmin()) {
                $query->where(function ($q) use ($user) {
                    $q->where('developer', $user->name)
                      ->orWhere('seo_person', $user->name)
                      ->orWhere('sales_person_name', $user->name)
                      ->orWhereHas('assignment', function ($aq) use ($user) {
                          $aq->where('developer_id', $user->id)
                             ->orWhere('seo_executive_id', $user->id)
                             ->orWhere('designer_id', $user->id);
                      });
                });
            }
            $renewalAlerts = $query->get()->map(function($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->project_name,
                    'renewal_date' => $project->domainHosting->renewal_date,
                    'days_left' => round(now()->diffInDays($project->domainHosting->renewal_date, false))
                ];
            });
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('role') : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'renewal_alerts' => $renewalAlerts,
        ];
    }
}
