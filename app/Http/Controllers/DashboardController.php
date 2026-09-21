<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        $currentUser = $request->user();
        if ($currentUser && ($currentUser->role_id === 10 || strtolower($currentUser->role?->role_name ?? '') === 'client')) {
            return redirect()->route('client-portal.index');
        }

        $metricQuery = Project::query()
            ->select(['id', 'customer_id', 'status', 'gmb_access_desc', 'comments', 'product_details', 'description', 'dvc', 'banner_reel']);

        if ($currentUser && !$currentUser->isAdmin()) {
            $metricQuery->where(function ($q) use ($currentUser) {
                $q->where('developer', $currentUser->name)
                  ->orWhere('seo_person', $currentUser->name)
                  ->orWhere('sales_person_name', $currentUser->name)
                  ->orWhereHas('assignment', function ($aq) use ($currentUser) {
                      $aq->where('developer_id', $currentUser->id)
                         ->orWhere('seo_executive_id', $currentUser->id)
                         ->orWhere('designer_id', $currentUser->id);
                  });
            });
        }
        
        $metricProjects = $metricQuery->get();

        if ($currentUser && !$currentUser->isAdmin()) {
            $customerCount = $metricProjects->pluck('customer_id')->unique()->count();
        } else {
            $customerCount = Customer::count();
        }
        $holdCount = 0;
        $completedCount = 0;
        $closedCount = 0;
        $pendingCount = 0;
        $activeCount = 0;

        $gmbTotal = 0; $gmbPending = 0;
        $smTotal = 0; $smPending = 0;
        $dvcTotal = 0; $dvcPending = 0;
        $brTotal = 0; $brPending = 0;

        foreach ($metricProjects as $p) {
            $st = strtolower(trim($p->status ?? ''));
            if (in_array($st, ['closed', 'closed project', 'permanent closed'], true)) {
                $closedCount++;
            } elseif ($st === 'completed') {
                $completedCount++;
            } elseif (in_array($st, ['on hold', 'hold'], true)) {
                $holdCount++;
            } else {
                $activeCount++;
                if (in_array($st, ['pending', 'not started'], true)) {
                    $pendingCount++;
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

            // DVC
            $dvc = strtolower(trim($p->dvc ?? ''));
            if (!empty($dvc) && $dvc !== 'na') {
                $dvcTotal++;
                if ($dvc !== 'done' && (str_contains($dvc, 'pending') || str_contains($dvc, 'required') || str_contains($dvc, 'no') || str_contains($dvc, 'need') || empty($dvc))) {
                    $dvcPending++;
                }
            }

            // Banner & Reel
            $br = strtolower(trim($p->banner_reel ?? ''));
            if (!empty($br) && $br !== 'na') {
                $brTotal++;
                if ($br !== 'done' && (str_contains($br, 'pending') || str_contains($br, 'required') || str_contains($br, 'no') || str_contains($br, 'need') || empty($br))) {
                    $brPending++;
                }
            }
        }

        $metrics = [
            'customerCount' => $customerCount,
            'activeCount' => $activeCount,
            'holdCount' => $holdCount,
            'completedCount' => $completedCount,
            'closedCount' => $closedCount,
            'pendingCount' => $pendingCount,
            'notifications' => [
                'gmbTotal' => $gmbTotal,
                'gmbPending' => $gmbPending,
                'smTotal' => $smTotal,
                'smPending' => $smPending,
                'dvcTotal' => $dvcTotal,
                'dvcPending' => $dvcPending,
                'brTotal' => $brTotal,
                'brPending' => $brPending,
            ]
        ];

        // Developer Team Projects
        $devQuery = DB::table('projects as p')
            ->join('customers as c', 'p.customer_id', '=', 'c.id')
            ->leftJoin('project_assignments as pa', 'p.id', '=', 'pa.project_id')
            ->leftJoin('users as u_dev', 'pa.developer_id', '=', 'u_dev.id')
            ->leftJoin('domains_hosting as dh', 'p.id', '=', 'dh.project_id')
            ->select([
                'p.id', 'p.project_name', 'p.custom_project_id', 'p.status',
                'c.company_name', 'c.client_name',
                'pa.dev_status', 'pa.dev_completion_pct',
                'u_dev.name as dev_name',
                'dh.domain_name'
            ])
            ->where(function ($q) {
                $q->whereNotNull('pa.developer_id');
            });

        if ($currentUser && !$currentUser->isAdmin()) {
            $devQuery->where(function ($q) use ($currentUser) {
                $q->where('p.developer', $currentUser->name)
                  ->orWhere('p.seo_person', $currentUser->name)
                  ->orWhere('p.sales_person_name', $currentUser->name)
                  ->orWhere('pa.developer_id', $currentUser->id)
                  ->orWhere('pa.seo_executive_id', $currentUser->id)
                  ->orWhere('pa.designer_id', $currentUser->id);
            });
        }
        
        $devProjects = $devQuery->orderBy('p.id', 'desc')->limit(15)->get();

        // SEO Team Projects
        $seoQuery = DB::table('projects as p')
            ->join('customers as c', 'p.customer_id', '=', 'c.id')
            ->leftJoin('project_assignments as pa', 'p.id', '=', 'pa.project_id')
            ->leftJoin('users as u_seo', 'pa.seo_executive_id', '=', 'u_seo.id')
            ->leftJoin('domains_hosting as dh', 'p.id', '=', 'dh.project_id')
            ->select([
                'p.id', 'p.project_name', 'p.custom_project_id', 'p.status', 'p.total_keyword', 'p.gmb_access_desc', 'p.workflow_stage',
                'c.company_name', 'c.client_name',
                'u_seo.name as seo_name',
                'dh.domain_name'
            ])
            ->where(function ($q) {
                $q->whereNotNull('pa.seo_executive_id')
                  ->orWhere('p.total_keyword', '>', 0);
            });

        if ($currentUser && !$currentUser->isAdmin()) {
            $seoQuery->where(function ($q) use ($currentUser) {
                $q->where('p.developer', $currentUser->name)
                  ->orWhere('p.seo_person', $currentUser->name)
                  ->orWhere('p.sales_person_name', $currentUser->name)
                  ->orWhere('pa.developer_id', $currentUser->id)
                  ->orWhere('pa.seo_executive_id', $currentUser->id)
                  ->orWhere('pa.designer_id', $currentUser->id);
            });
        }
        
        $seoProjects = $seoQuery->orderBy('p.id', 'desc')->limit(15)->get();

        // Sales Team Projects
        $salesQuery = DB::table('projects as p')
            ->join('customers as c', 'p.customer_id', '=', 'c.id')
            ->leftJoin('domains_hosting as dh', 'p.id', '=', 'dh.project_id')
            ->leftJoin('project_assignments as pa', 'p.id', '=', 'pa.project_id')
            ->select([
                'p.id', 'p.project_name', 'p.custom_project_id', 'p.sales_person_name', 'p.payment_info', 'p.status',
                'c.company_name', 'c.client_name', 'c.mobile as client_phone',
                'dh.domain_name'
            ])
            ->where(function ($q) {
                $q->whereNotNull('p.sales_person_name')
                  ->where('p.sales_person_name', '!=', '');
            });

        if ($currentUser && !$currentUser->isAdmin()) {
            $salesQuery->where(function ($q) use ($currentUser) {
                $q->where('p.developer', $currentUser->name)
                  ->orWhere('p.seo_person', $currentUser->name)
                  ->orWhere('p.sales_person_name', $currentUser->name)
                  ->orWhere('pa.developer_id', $currentUser->id)
                  ->orWhere('pa.seo_executive_id', $currentUser->id)
                  ->orWhere('pa.designer_id', $currentUser->id);
            });
        }
        
        $salesProjects = $salesQuery->orderBy('p.id', 'desc')->limit(15)->get();

        // Expiring Domains in Next 60 Days
        $today = Carbon::today()->toDateString();
        $sixtyDays = Carbon::today()->addDays(60)->toDateString();
        $domainsQuery = DB::table('domains_hosting as dh')
            ->join('customers as c', 'dh.customer_id', '=', 'c.id')
            ->leftJoin('projects as p', 'dh.project_id', '=', 'p.id')
            ->leftJoin('project_assignments as pa', 'p.id', '=', 'pa.project_id')
            ->select([
                'dh.id', 'dh.domain_name', 'dh.domain_expiry_date',
                'c.company_name', 'c.client_name'
            ])
            ->whereBetween('dh.domain_expiry_date', [$today, $sixtyDays]);

        if ($currentUser && !$currentUser->isAdmin()) {
            $domainsQuery->where(function ($q) use ($currentUser) {
                $q->where('p.developer', $currentUser->name)
                  ->orWhere('p.seo_person', $currentUser->name)
                  ->orWhere('p.sales_person_name', $currentUser->name)
                  ->orWhere('pa.developer_id', $currentUser->id)
                  ->orWhere('pa.seo_executive_id', $currentUser->id)
                  ->orWhere('pa.designer_id', $currentUser->id);
            });
        }

        $expiringDomains = $domainsQuery->orderBy('dh.domain_expiry_date', 'asc')->limit(10)->get();

        $recentQuery = Project::with('customer')->orderBy('id', 'desc');
        
        if ($currentUser && !$currentUser->isAdmin()) {
            $recentQuery->where(function ($q) use ($currentUser) {
                $q->where('developer', $currentUser->name)
                  ->orWhere('seo_person', $currentUser->name)
                  ->orWhere('sales_person_name', $currentUser->name)
                  ->orWhereHas('assignment', function ($aq) use ($currentUser) {
                      $aq->where('developer_id', $currentUser->id)
                         ->orWhere('seo_executive_id', $currentUser->id)
                         ->orWhere('designer_id', $currentUser->id);
                  });
            });
        }
        
        $recentProjects = $recentQuery->limit(10)->get();

        $recentTaskQuery = Task::with(['project', 'assignee'])->orderBy('id', 'desc');
        
        if ($currentUser && !$currentUser->isAdmin()) {
            $recentTaskQuery->where(function ($q) use ($currentUser) {
                $q->where('assigned_to', $currentUser->id)
                  ->orWhereHas('project', function ($pq) use ($currentUser) {
                      $pq->where('developer', $currentUser->name)
                         ->orWhere('seo_person', $currentUser->name)
                         ->orWhere('sales_person_name', $currentUser->name)
                         ->orWhereHas('assignment', function ($aq) use ($currentUser) {
                             $aq->where('developer_id', $currentUser->id)
                                ->orWhere('seo_executive_id', $currentUser->id)
                                ->orWhere('designer_id', $currentUser->id);
                         });
                  });
            });
        }
        
        $recentTasks = $recentTaskQuery->limit(8)->get();

        $currentUserRole = $request->user()->role?->role_name ?? 'super_admin';

        // User Login Activity Audit Log (For Admin Dashboard)
        $userLogins = [];
        if ($request->user()->isAdmin()) {
            $userLogins = DB::table('user_logins')
                ->orderBy('id', 'desc')
                ->limit(20)
                ->get()
                ->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'name' => $log->name,
                        'email' => $log->email,
                        'role' => $log->role,
                        'ip_address' => $log->ip_address ?? '127.0.0.1',
                        'user_agent' => $log->user_agent,
                        'login_date' => Carbon::parse($log->login_at)->format('M d, Y'),
                        'login_time' => Carbon::parse($log->login_at)->format('h:i A'),
                        'time_ago' => Carbon::parse($log->login_at)->diffForHumans(),
                    ];
                });
        }

        return Inertia::render('Dashboard', [
            'metrics' => $metrics,
            'devProjects' => $devProjects,
            'seoProjects' => $seoProjects,
            'salesProjects' => $salesProjects,
            'expiringDomains' => $expiringDomains,
            'recentProjects' => $recentProjects,
            'recentTasks' => $recentTasks,
            'currentUserRole' => $currentUserRole,
            'userLogins' => $userLogins,
        ]);
    }
}
