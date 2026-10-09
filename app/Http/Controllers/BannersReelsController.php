<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;

class BannersReelsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isDesigner = $user->role_id == 5 || (strtolower($user->role->role_name ?? '') === 'designer') || (strtolower($user->role->role_name ?? '') === 'ui/ux designer');
        if (!$user->isAdmin() && !$isDesigner) {
            abort(403, 'Unauthorized access.');
        }

        $search = $request->query('search');
        $type = $request->query('type', 'all');

        $query = Project::with(['customer', 'assignment.designer'])
            ->where(function ($q) {
                $q->where('total_banners', '>', 0)
                  ->orWhere('total_reels', '>', 0)
                  ->orWhere('total_dvc', '>', 0)
                  ->orWhere(function ($q2) {
                      $q2->whereNotNull('banner_reel')
                         ->where('banner_reel', '!=', '')
                         ->where('banner_reel', 'not like', 'na')
                         ->where('banner_reel', 'not like', 'n/a');
                  })
                  ->orWhere(function ($q3) {
                      $q3->whereNotNull('dvc')
                         ->where('dvc', '!=', '')
                         ->where('dvc', 'not like', 'na')
                         ->where('dvc', 'not like', 'n/a');
                  });
            })
            ->orderBy('id', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('project_name', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('company_name', 'like', "%{$search}%")
                         ->orWhere('client_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($type === 'banners') {
            $query->where('total_banners', '>', 0);
        } elseif ($type === 'reels') {
            $query->where('total_reels', '>', 0);
        } elseif ($type === 'dvc') {
            $query->where('total_dvc', '>', 0);
        }

        $allProjects = Project::where(function ($q) {
                $q->where('total_banners', '>', 0)
                  ->orWhere('total_reels', '>', 0)
                  ->orWhere('total_dvc', '>', 0)
                  ->orWhere(function ($q2) {
                      $q2->whereNotNull('banner_reel')
                         ->where('banner_reel', '!=', '')
                         ->where('banner_reel', 'not like', 'na')
                         ->where('banner_reel', 'not like', 'n/a');
                  })
                  ->orWhere(function ($q3) {
                      $q3->whereNotNull('dvc')
                         ->where('dvc', '!=', '')
                         ->where('dvc', 'not like', 'na')
                         ->where('dvc', 'not like', 'n/a');
                  });
            })->get();

        $metrics = [
            'totalBanners' => $allProjects->sum('total_banners'),
            'completedBanners' => $allProjects->sum('completed_banners'),
            'pendingBanners' => $allProjects->sum('total_banners') - $allProjects->sum('completed_banners'),
            'totalReels' => $allProjects->sum('total_reels'),
            'completedReels' => $allProjects->sum('completed_reels'),
            'pendingReels' => $allProjects->sum('total_reels') - $allProjects->sum('completed_reels'),
            'totalDvc' => $allProjects->sum('total_dvc'),
            'completedDvc' => $allProjects->sum('completed_dvc'),
            'pendingDvc' => $allProjects->sum('total_dvc') - $allProjects->sum('completed_dvc'),
        ];

        $perPage = (int)$request->query('per_page', 5);
        if ($perPage <= 0 || $perPage > 2000) {
            $perPage = 5;
        }

        $projects = $query->paginate($perPage)->withQueryString();

        return Inertia::render('BannersReels/Index', [
            'projects' => $projects,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search ?? '',
                'per_page' => $perPage,
                'type' => $type
            ]
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $user = $request->user();
        $isDesigner = $user->role_id == 5 || (strtolower($user->role->role_name ?? '') === 'designer') || (strtolower($user->role->role_name ?? '') === 'ui/ux designer');
        if (!$user->isAdmin() && !$isDesigner) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'total_banners' => 'required|integer|min:0',
            'completed_banners' => 'required|integer|min:0',
            'total_reels' => 'required|integer|min:0',
            'completed_reels' => 'required|integer|min:0',
            'total_dvc' => 'required|integer|min:0',
            'completed_dvc' => 'required|integer|min:0',
        ]);

        $project->update($validated);

        return redirect()->back()->with('success', 'Creative counts updated successfully!');
    }
}
