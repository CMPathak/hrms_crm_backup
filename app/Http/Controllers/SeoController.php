<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;

class SeoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isSeoUser = $user->role_id == 6 || $user->role_id == 12 || (str_contains(strtolower($user->role->role_name ?? ''), 'seo'));
        if (!$user->isAdmin() && !$isSeoUser) {
            abort(403, 'Unauthorized access.');
        }

        $search = $request->query('search');
        $type = $request->query('type', 'all');

        $query = Project::with(['customer'])
            ->where(function ($q) {
                $q->where('total_keyword', '>', 0)
                  ->orWhere(function ($q2) {
                      $q2->whereNotNull('total_keyword')
                         ->where('total_keyword', '!=', '');
                  });
            });

        if (!$user->isAdmin()) {
            $seoNames = [$user->name];
            $subordinates = \App\Models\User::where('manager_id', $user->id)->pluck('name')->toArray();
            $seoNames = array_unique(array_merge($seoNames, $subordinates));
            
            $query->whereIn('seo_person', $seoNames);
        }

        $query->orderBy('id', 'desc');

        if ($type === 'gmb') {
            $query->whereNotNull('gmb_access_desc')
                  ->where('gmb_access_desc', '!=', '')
                  ->whereRaw('LOWER(TRIM(gmb_access_desc)) != ?', ['na']);
        } elseif ($type === 'social') {
            $query->where(function($q) {
                $q->whereRaw('LOWER(comments) LIKE ?', ['%social%'])
                  ->orWhereRaw('LOWER(product_details) LIKE ?', ['%social%'])
                  ->orWhereRaw('LOWER(description) LIKE ?', ['%social%'])
                  ->orWhereRaw('LOWER(comments) LIKE ?', ['%fb%'])
                  ->orWhereRaw('LOWER(comments) LIKE ?', ['%insta%']);
            });
        } elseif ($type === 'keywords') {
            $query->where('total_keyword', '>', 0)
                  ->orWhere(function ($q2) {
                      $q2->whereNotNull('total_keyword')
                         ->where('total_keyword', '!=', '');
                  });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('project_name', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('company_name', 'like', "%{$search}%")
                         ->orWhere('client_name', 'like', "%{$search}%");
                  });
            });
        }

        $allProjectsQuery = Project::where(function ($q) {
                $q->where('total_keyword', '>', 0)
                  ->orWhere(function ($q2) {
                      $q2->whereNotNull('total_keyword')
                         ->where('total_keyword', '!=', '');
                  });
            });

        if (!$user->isAdmin()) {
            $seoNames = [$user->name];
            $subordinates = \App\Models\User::where('manager_id', $user->id)->pluck('name')->toArray();
            $seoNames = array_unique(array_merge($seoNames, $subordinates));

            $allProjectsQuery->whereIn('seo_person', $seoNames);
        }

        $allProjects = $allProjectsQuery->get();

        $kwTotal = 0; $kwPending = 0;
        $gmbTotal = 0; $gmbPending = 0;
        $smTotal = 0; $smPending = 0;
        foreach ($allProjects as $p) {
            // Keywords
            $tk = (int)trim($p->total_keyword ?? '0');
            if ($tk > 0) {
                $kwTotal += $tk;
                $ak = strtolower(trim($p->approved_keywords ?? ''));
                if ($ak === 'done') {
                    // 0 pending
                } elseif (!empty($ak)) {
                    $lines = preg_match_all('/[^\r\n]+/', $p->approved_keywords, $matches);
                    $kwPending += max(0, $tk - $lines);
                } else {
                    $kwPending += $tk;
                }
            }

            // GMB
            $gmb = strtolower(trim($p->gmb_access_desc ?? ''));
            if (!empty($gmb) && $gmb !== 'na') {
                $gmbTotal++;
                if ($gmb !== 'done' && (str_contains($gmb, 'pending') || str_contains($gmb, 'no') || str_contains($gmb, 'need') || str_contains($gmb, 'required') || empty($gmb))) {
                    $gmbPending++;
                }
            }

            // Social Media
            $comm = strtolower($p->comments ?? '');
            $prod = strtolower($p->product_details ?? '');
            $desc = strtolower($p->description ?? '');
            if (str_contains($comm, 'social') || str_contains($prod, 'social') || str_contains($desc, 'social') || str_contains($comm, 'fb') || str_contains($comm, 'insta')) {
                $smTotal++;
                if (str_contains($comm, 'access') || str_contains($comm, 'login') || str_contains($comm, 'pwd') || str_contains($comm, 'password') || str_contains($comm, 'pending') || str_contains($comm, 'required')) {
                    $smPending++;
                }
            }
        }

        $metrics = [
            'totalKeywords' => $kwTotal,
            'pendingKeywords' => $kwPending,
            'completedKeywords' => max(0, $kwTotal - $kwPending),
            'gmbTotal' => $gmbTotal,
            'gmbPending' => $gmbPending,
            'completedGmb' => max(0, $gmbTotal - $gmbPending),
            'smTotal' => $smTotal,
            'smPending' => $smPending,
            'completedSm' => max(0, $smTotal - $smPending),
        ];

        $perPage = (int)$request->query('per_page', 5);
        if ($perPage <= 0 || $perPage > 2000) {
            $perPage = 5;
        }

        $projects = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Seo/Index', [
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
        $isSeoUser = $user->role_id == 6 || $user->role_id == 12 || (str_contains(strtolower($user->role->role_name ?? ''), 'seo'));
        if (!$user->isAdmin() && !$isSeoUser) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'total_keyword' => 'nullable|string',
            'approved_keywords' => 'nullable|string',
            'first_page' => 'nullable|string',
            'report_send' => 'nullable|string',
            'total_report' => 'nullable|string',
            'gmb_access_desc' => 'nullable|string',
            'social_media_login' => 'nullable|string',
        ]);

        $project->update($validated);

        return redirect()->back()->with('success', 'SEO Details updated successfully!');
    }
}
