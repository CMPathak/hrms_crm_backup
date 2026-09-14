<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DomainController extends Controller
{
    public function index(Request $request): Response
    {
        $today = Carbon::today()->toDateString();
        $in7Days = Carbon::today()->addDays(7)->toDateString();
        $in30Days = Carbon::today()->addDays(30)->toDateString();

        $search = $request->input('search', '');
        $statusTab = strtolower($request->input('tab', 'all'));

        $query = DB::table('domains_hosting as dh')
            ->leftJoin('customers as c', 'dh.customer_id', '=', 'c.id')
            ->leftJoin('projects as p', 'dh.project_id', '=', 'p.id')
            ->select([
                'dh.id',
                'dh.domain_name',
                'dh.registrar',
                'dh.domain_expiry_date',
                'dh.hosting_provider',
                'dh.hosting_details',
                'dh.ssl_certificate',
                'dh.renewal_date',
                'dh.cost_amount',
                'dh.status as domain_status',
                'c.id as customer_id',
                'c.company_name',
                'c.client_name',
                'c.mobile as client_phone',
                'c.email as client_email',
                'p.id as project_id',
                'p.project_name',
                'p.custom_project_id',
            ]);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('dh.domain_name', 'like', "%{$search}%")
                  ->orWhere('c.company_name', 'like', "%{$search}%")
                  ->orWhere('c.client_name', 'like', "%{$search}%")
                  ->orWhere('dh.registrar', 'like', "%{$search}%")
                  ->orWhere('dh.hosting_provider', 'like', "%{$search}%")
                  ->orWhere('p.project_name', 'like', "%{$search}%");
            });
        }

        // Tab Filter
        if ($statusTab === 'expiring_soon') {
            $query->where('dh.domain_expiry_date', '>=', $today)
                  ->where('dh.domain_expiry_date', '<=', $in30Days);
        } elseif ($statusTab === 'critical') {
            $query->where('dh.domain_expiry_date', '>=', $today)
                  ->where('dh.domain_expiry_date', '<=', $in7Days);
        } elseif ($statusTab === 'expired') {
            $query->where('dh.domain_expiry_date', '<', $today);
        } elseif ($statusTab === 'active') {
            $query->where('dh.domain_expiry_date', '>=', $today);
        }

        $domains = $query->orderBy('dh.domain_expiry_date', 'asc')->get()->map(function ($d) use ($today) {
            $expiry = $d->domain_expiry_date ? Carbon::parse($d->domain_expiry_date) : null;
            $daysRemaining = null;
            $isExpired = false;

            if ($expiry) {
                $daysRemaining = Carbon::parse($today)->diffInDays($expiry, false);
                $isExpired = $daysRemaining < 0;
            }

            return [
                'id' => $d->id,
                'domain_name' => $d->domain_name,
                'registrar' => $d->registrar ?? 'Not Specified',
                'hosting_provider' => $d->hosting_provider ?? 'Not Specified',
                'hosting_details' => $d->hosting_details,
                'ssl_certificate' => $d->ssl_certificate ?? "Let's Encrypt SSL Active",
                'domain_expiry_date' => $d->domain_expiry_date,
                'formatted_expiry' => $expiry ? $expiry->format('M d, Y') : '—',
                'renewal_date' => $d->renewal_date,
                'cost_amount' => $d->cost_amount ? number_format($d->cost_amount, 2) : '0.00',
                'status' => $d->domain_status ?? 'Active',
                'days_remaining' => $daysRemaining,
                'is_expired' => $isExpired,
                'customer' => [
                    'id' => $d->customer_id,
                    'company_name' => $d->company_name ?? '—',
                    'client_name' => $d->client_name ?? '—',
                    'phone' => $d->client_phone ?? '',
                    'email' => $d->client_email ?? '',
                ],
                'project' => $d->project_id ? [
                    'id' => $d->project_id,
                    'project_name' => $d->project_name,
                    'custom_project_id' => $d->custom_project_id,
                ] : null,
            ];
        });

        // Summary KPI Counts
        $totalCount = DB::table('domains_hosting')->count();
        $expiredCount = DB::table('domains_hosting')->where('domain_expiry_date', '<', $today)->count();
        $criticalCount = DB::table('domains_hosting')
            ->where('domain_expiry_date', '>=', $today)
            ->where('domain_expiry_date', '<=', $in7Days)
            ->count();
        $expiringSoonCount = DB::table('domains_hosting')
            ->where('domain_expiry_date', '>=', $today)
            ->where('domain_expiry_date', '<=', $in30Days)
            ->count();
        $activeCount = DB::table('domains_hosting')->where('domain_expiry_date', '>=', $today)->count();

        return Inertia::render('Domains/Index', [
            'domains' => $domains,
            'metrics' => [
                'total' => $totalCount,
                'expiring_soon' => $expiringSoonCount,
                'critical' => $criticalCount,
                'expired' => $expiredCount,
                'active' => $activeCount,
            ],
            'currentTab' => $statusTab,
            'search' => $search,
        ]);
    }
}
