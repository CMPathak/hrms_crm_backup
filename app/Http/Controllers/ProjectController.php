<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\LogoRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    private function getMetrics($user = null): array
    {
        $query = Project::query()
            ->select(['id', 'status', 'gmb_access_desc', 'comments', 'product_details', 'description', 'dvc', 'banner_reel', 'customer_id']);

        if ($user && !$user->isAdmin()) {
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

        $metricProjects = $query->get();

        if ($user && !$user->isAdmin()) {
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

        return [
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
    }

    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status');
        $serviceFilter = $request->query('service');
        $priorityFilter = $request->query('priority');
        $teamFilter = $request->query('team');
        $search = $request->query('search');
        $perPage = (int)$request->query('per_page', 5);
        if ($perPage <= 0 || $perPage > 2000) {
            $perPage = 50;
        }

        $query = Project::with(['customer', 'assignment.developer', 'assignment.designer', 'assignment.seoExecutive', 'domainHosting'])
            ->orderByRaw('COALESCE(start_date, created_at) DESC, id DESC');

        $user = $request->user();
        if ($user && !$user->isAdmin()) {
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

        if ($statusFilter) {
            if ($statusFilter === 'active') {
                $query->active();
            } elseif ($statusFilter === 'hold') {
                $query->hold();
            } elseif ($statusFilter === 'completed') {
                $query->completed();
            } elseif ($statusFilter === 'closed') {
                $query->closed();
            } elseif ($statusFilter === 'pending') {
                $query->pending();
            } else {
                $query->where('status', $statusFilter);
            }
        }

        if ($serviceFilter) {
            $query->where('service_type', 'like', "%{$serviceFilter}%");
        }

        if ($priorityFilter) {
            $query->where('priority', $priorityFilter);
        }

        if ($teamFilter) {
            $query->where(function ($q) use ($teamFilter) {
                $q->where('developer', 'like', "%{$teamFilter}%")
                  ->orWhere('seo_person', 'like', "%{$teamFilter}%");
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('project_name', 'like', "%{$search}%")
                  ->orWhere('custom_project_id', 'like', "%{$search}%")
                  ->orWhere('developer', 'like', "%{$search}%")
                  ->orWhere('seo_person', 'like', "%{$search}%")
                  ->orWhere('sales_person_name', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('company_name', 'like', "%{$search}%")
                         ->orWhere('client_name', 'like', "%{$search}%")
                         ->orWhere('mobile', 'like', "%{$search}%");
                  });
            });
        }

        $projects = $query->paginate($perPage)->withQueryString();
        $metrics = $this->getMetrics($user);
        $customers = Customer::select(['id', 'client_name', 'company_name'])->orderBy('company_name')->get();
        $users = User::select(['id', 'name', 'role_id'])->with('role:id,role_name,display_name')->orderBy('name')->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'metrics' => $metrics,
            'currentFilter' => $statusFilter ?? 'all',
            'customers' => $customers,
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'status' => $statusFilter ?? '',
                'service' => $serviceFilter ?? '',
                'priority' => $priorityFilter ?? '',
                'team' => $teamFilter ?? '',
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user() || (!$request->user()->isAdmin() && !$request->user()->hasRole(['sales', 'sales_manager']))) {
            return redirect()->back()->with('error', 'Unauthorized. Only Super Admin, Admin or Sales can create new projects.');
        }

        $validated = $request->validate([
            'client_name' => 'nullable|string|max:150',
            'company_name' => 'required|string|max:150',
            'email' => 'nullable|email|max:150',
            'contact_person' => 'nullable|string|max:150',
            'mobile' => 'nullable|string|max:50',
            'business_category' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'project_name' => 'required|string|max:150',
            'package_tier' => 'nullable|string|max:100',
            'start_date' => 'required|date',
            'due_date' => 'required|date',
            'payment_info' => 'nullable|string|max:255',
            'developer' => 'nullable|string|max:150',
            'seo_person' => 'nullable|string|max:150',
            'domain_name' => 'nullable|string|max:150',
            'renewal_date' => 'nullable|string',
            'sales_person_name' => 'nullable|string|max:150',
            'sales_person_email' => 'nullable|email|max:150',
            'package_lmh' => 'nullable|string|max:100',
            'status' => 'nullable|string',
            'priority' => 'nullable|in:High,Medium,Low',
            'banner_reel' => 'nullable|string',
            'gmb_access_desc' => 'nullable|string',
            'dvc' => 'nullable|string',
            'total_keyword' => 'nullable|string',
            'approved_keywords' => 'nullable|string',
            'first_page' => 'nullable|string',
            'report_send' => 'nullable|string',
            'total_report' => 'nullable|string',
            'adword_sponser' => 'nullable|string',
            'analytics_webmaster_email' => 'nullable|string|max:150',
            'design_status' => 'nullable|string',
            'product_details' => 'nullable|string',
            'ftp_login_details' => 'nullable|string',
            'social_media_login' => 'nullable|string',
            'issue_comment' => 'nullable|string',
            'comments' => 'nullable|string',
            'description' => 'nullable|string',
            'include_logo_registration' => 'nullable|boolean',
        ]);

        // 1. Find or create Customer
        $customer = null;
        if (!empty($validated['email'])) {
            $customer = Customer::where('email', $validated['email'])->first();
        }
        if (!$customer && !empty($validated['company_name'])) {
            $customer = Customer::where('company_name', $validated['company_name'])->first();
        }

        if ($customer) {
            $customer->update(array_filter([
                'client_name' => $validated['client_name'] ?? $customer->client_name,
                'contact_person' => $validated['contact_person'] ?? $customer->contact_person,
                'mobile' => $validated['mobile'] ?? $customer->mobile,
                'address' => $validated['address'] ?? $customer->address,
                'business_category' => $validated['business_category'] ?? $customer->business_category,
            ]));
        } else {
            do {
                $customCustId = 'CUST-' . rand(10000, 99999);
            } while (Customer::where('custom_id', $customCustId)->exists());

            $customer = Customer::create([
                'custom_id' => $customCustId,
                'client_name' => $validated['client_name'] ?? $validated['company_name'],
                'company_name' => $validated['company_name'],
                'contact_person' => $validated['contact_person'] ?? '',
                'mobile' => $validated['mobile'] ?? '',
                'email' => $validated['email'] ?? ($validated['company_name'] . '@client.local'),
                'address' => $validated['address'] ?? '',
                'business_category' => $validated['business_category'] ?? '',
                'created_at' => now(),
            ]);
        }

        // 2. Generate Unique Project ID
        do {
            $customProjectId = 'PRJ-' . rand(10000, 99999);
        } while (Project::where('custom_project_id', $customProjectId)->exists());


        $issueComment = $validated['issue_comment'] ?? ($validated['comments'] ?? '');

        // 3. Create Project
        $project = Project::create([
            'customer_id' => $customer->id,
            'custom_project_id' => $customProjectId,
            'project_name' => $validated['project_name'],

            'start_date' => $validated['start_date'],
            'due_date' => $validated['due_date'],
            'payment_info' => $validated['payment_info'] ?? '',
            'developer' => $validated['developer'] ?? null,
            'seo_person' => $validated['seo_person'] ?? null,
            'sales_person_name' => $validated['sales_person_name'] ?? null,
            'sales_person_email' => $validated['sales_person_email'] ?? null,
            'package_lmh' => $validated['package_lmh'] ?? null,
            'product_details' => $validated['product_details'] ?? null,
            'banner_reel' => $validated['banner_reel'] ?? null,
            'gmb_access_desc' => $validated['gmb_access_desc'] ?? null,
            'dvc' => $validated['dvc'] ?? null,
            'total_keyword' => $validated['total_keyword'] ?? null,
            'approved_keywords' => $validated['approved_keywords'] ?? null,
            'first_page' => $validated['first_page'] ?? null,
            'report_send' => $validated['report_send'] ?? null,
            'total_report' => $validated['total_report'] ?? null,
            'adword_sponser' => $validated['adword_sponser'] ?? null,
            'analytics_webmaster_email' => $validated['analytics_webmaster_email'] ?? null,
            'ftp_login_details' => $validated['ftp_login_details'] ?? null,
            'social_media_login' => $validated['social_media_login'] ?? null,
            'issue_comment' => $issueComment,
            'comments' => $issueComment,
            'description' => $validated['description'] ?? null,
            'renewal_date' => !empty($validated['renewal_date']) ? $validated['renewal_date'] : null,
            'status' => $validated['status'] ?? 'Active',
            'priority' => $validated['priority'] ?? 'Medium',
            'workflow_stage' => 'Project Created',
            'created_at' => now(),
        ]);

        // 4. Save Domain if present
        if (!empty($validated['domain_name'])) {
            DB::table('domains_hosting')->updateOrInsert(
                ['project_id' => $project->id],
                [
                    'customer_id' => $customer->id,
                    'domain_name' => $validated['domain_name'],
                    'registrar' => 'HubTech Panel',
                    'hosting_provider' => 'Cloud Hosting',
                    'domain_expiry_date' => !empty($validated['renewal_date']) ? $validated['renewal_date'] : null,
                    'renewal_date' => !empty($validated['renewal_date']) ? $validated['renewal_date'] : null,
                    'status' => 'Active',
                ]
            );
        }

        // 5. Link Project Assignment
        $devId = null;
        if (!empty($validated['developer'])) {
            $devId = User::whereRaw('LOWER(name) = ?', [strtolower(trim($validated['developer']))])->value('id');
        }
        $seoId = null;
        if (!empty($validated['seo_person'])) {
            $seoId = User::whereRaw('LOWER(name) = ?', [strtolower(trim($validated['seo_person']))])->value('id');
        }

        if ($devId || $seoId) {
            DB::table('project_assignments')->updateOrInsert(
                ['project_id' => $project->id],
                [
                    'developer_id' => $devId,
                    'seo_executive_id' => $seoId,
                    'dev_status' => 'Assigned',
                    'dev_completion_pct' => 0,
                ]
            );
        }

        // 6. Handle Logo Registration Checkbox
        if (!empty($validated['include_logo_registration']) && $validated['include_logo_registration']) {
            LogoRegistration::create([
                'project_id' => $project->id,
                'customer_id' => $customer->id,
                'brand_name' => $validated['project_name'],
                'application_no' => 'APP-' . rand(1000000, 9999999),
                'status' => 'Pending',
                'applied_date' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Project created successfully with customer and department details!');
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'project_name' => 'required|string|max:150',

            'status' => 'required|string',
            'priority' => 'nullable|in:High,Medium,Low',
            'workflow_stage' => 'nullable|string',
            'developer' => 'nullable|string|max:150',
            'seo_person' => 'nullable|string|max:150',
            'sales_person_name' => 'nullable|string|max:150',
            'sales_person_email' => 'nullable|email|max:150',
            'package_lmh' => 'nullable|string|max:100',
            'payment_info' => 'nullable|string|max:255',
            'first_page' => 'nullable|string',
            'report_send' => 'nullable|string',
            'total_report' => 'nullable|string',
            'adword_sponser' => 'nullable|string',
            'approved_keywords' => 'nullable|string',
            'total_keyword' => 'nullable|string',
            'gmb_access_desc' => 'nullable|string',
            'banner_reel' => 'nullable|string',
            'dvc' => 'nullable|string',
            'renewal_date' => 'nullable|string',
            'analytics_webmaster_email' => 'nullable|string|max:150',
            'design_status' => 'nullable|string',
            'ftp_login_details' => 'nullable|string',
            'social_media_login' => 'nullable|string',
            'product_details' => 'nullable|string',
            'issue_comment' => 'nullable|string',
            'comments' => 'nullable|string',
            'due_date' => 'nullable|date',
            'start_date' => 'nullable|date',
            'include_logo_registration' => 'nullable|boolean',
        ]);

        if (isset($validated['issue_comment']) && !isset($validated['comments'])) {
            $validated['comments'] = $validated['issue_comment'];
        }

        $project->update($validated);

        // Update Customer Details if provided
        if ($project->customer_id) {
            $custData = [];
            if ($request->filled('client_name')) $custData['client_name'] = $request->input('client_name');
            if ($request->filled('company_name')) $custData['company_name'] = $request->input('company_name');
            if ($request->filled('email')) $custData['email'] = $request->input('email');
            if ($request->filled('contact_person')) $custData['contact_person'] = $request->input('contact_person');
            if ($request->filled('mobile')) $custData['mobile'] = $request->input('mobile');
            if ($request->filled('address')) $custData['address'] = $request->input('address');
            if ($request->filled('business_category')) $custData['business_category'] = $request->input('business_category');

            if (!empty($custData)) {
                DB::table('customers')->where('id', $project->customer_id)->update($custData);
            }
        }

        // Sync Domain Details
        if ($request->filled('domain_name')) {
            $renewalInput = $request->input('renewal_date');
            $domainExpiry = (!empty($renewalInput) && $renewalInput !== '0000-00-00') 
                ? $renewalInput 
                : null;
                
            DB::table('domains_hosting')->updateOrInsert(
                ['project_id' => $project->id],
                [
                    'customer_id' => $project->customer_id ?? 1,
                    'domain_name' => $request->input('domain_name'),
                    'registrar' => 'HubTech Panel',
                    'hosting_provider' => 'Cloud Hosting',
                    'domain_expiry_date' => $domainExpiry,
                    'renewal_date' => $domainExpiry,
                    'status' => 'Active',
                ]
            );
        }

        // Sync Project Assignment Developer & SEO
        $devId = null;
        if (!empty($validated['developer'])) {
            $devId = User::whereRaw('LOWER(name) = ?', [strtolower(trim($validated['developer']))])->value('id');
        }
        $seoId = null;
        if (!empty($validated['seo_person'])) {
            $seoId = User::whereRaw('LOWER(name) = ?', [strtolower(trim($validated['seo_person']))])->value('id');
        }

        if ($devId || $seoId) {
            DB::table('project_assignments')->updateOrInsert(
                ['project_id' => $project->id],
                [
                    'developer_id' => $devId,
                    'seo_executive_id' => $seoId,
                ]
            );
        }

        // Handle Logo Registration Checkbox during update
        if (!empty($validated['include_logo_registration']) && $validated['include_logo_registration']) {
            LogoRegistration::firstOrCreate(
                ['project_id' => $project->id],
                [
                    'customer_id' => $project->customer_id ?? 1,
                    'brand_name' => $validated['project_name'],
                    'application_no' => 'APP-' . rand(1000000, 9999999),
                    'status' => 'Pending',
                    'applied_date' => now(),
                ]
            );
        }

        return redirect()->back()->with('success', 'Project updated successfully!');
    }

    public function updateStatus(Request $request, Project $project)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'workflow_stage' => 'nullable|string',
        ]);

        $project->update($validated);

        return redirect()->back()->with('success', 'Status updated successfully!');
    }

    public function updateAssignment(Request $request, Project $project)
    {
        $validated = $request->validate([
            'developer_id' => 'nullable|exists:users,id',
            'designer_id' => 'nullable|exists:users,id',
            'seo_executive_id' => 'nullable|exists:users,id',
            'dev_status' => 'nullable|string|max:100',
            'dev_completion_pct' => 'nullable|integer|min:0|max:100',
        ]);

        DB::table('project_assignments')->updateOrInsert(
            ['project_id' => $project->id],
            [
                'developer_id' => $validated['developer_id'] ?? null,
                'designer_id' => $validated['designer_id'] ?? null,
                'seo_executive_id' => $validated['seo_executive_id'] ?? null,
                'dev_status' => $validated['dev_status'] ?? 'Assigned',
                'dev_completion_pct' => $validated['dev_completion_pct'] ?? 0,
            ]
        );

        $updates = [];
        if (!empty($validated['developer_id'])) {
            $updates['developer'] = User::where('id', $validated['developer_id'])->value('name');
        }
        if (!empty($validated['seo_executive_id'])) {
            $updates['seo_person'] = User::where('id', $validated['seo_executive_id'])->value('name');
        }
        if (!empty($updates)) {
            $project->update($updates);
        }

        return redirect()->back()->with('success', 'Department assignments updated successfully!');
    }

    public function destroy(Request $request, Project $project)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return redirect()->back()->with('error', 'Unauthorized. Only Super Admin and Admin can delete projects.');
        }

        // Safely clean up associated records before deleting project
        Task::where('project_id', $project->id)->delete();
        DB::table('domains_hosting')->where('project_id', $project->id)->delete();
        DB::table('project_assignments')->where('project_id', $project->id)->delete();
        DB::table('seo_keywords')->where('project_id', $project->id)->delete();
        DB::table('seo_reports')->where('project_id', $project->id)->delete();

        $project->delete();
        return redirect()->back()->with('success', 'Project deleted successfully!');
    }

    public function export(Request $request)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="projects_all.csv"',
        ];

        $columns = ["id", "custom_project_id", "customer_id", "project_name", "service_type", "package", "payment_info", "sales_person_name", "sales_person_email", "package_lmh", "product_details", "description", "banner_reel", "gmb_access_desc", "dvc", "total_keyword", "total_report", "adword_sponser", "comments", "start_date", "due_date", "completion_date", "status", "priority", "workflow_stage", "created_at", "first_page", "report_send", "approved_keywords", "renewal_date", "ftp_login_details", "client_type", "analytics_webmaster_email", "social_media_login", "issue_comment", "seo_person", "developer", "dev_completion_pct", "design_banner", "design_logo", "design_ui", "design_client_approval"];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            // Write Header
            fputcsv($file, $columns);

            Project::chunk(500, function ($projects) use ($file, $columns) {
                foreach ($projects as $row) {
                    $data = [];
                    foreach ($columns as $col) {
                        $data[] = $row->{$col};
                    }
                    fputcsv($file, $data);
                }
            });
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return redirect()->back()->with('error', 'Unauthorized. Only Admin can import projects.');
        }

        $request->validate([
            'file' => 'required|mimes:csv,txt|max:2097152', // 2GB in KB
        ]);

        $file = $request->file('file');
        $handle = fopen($file->path(), 'r');

        $columns = ["id", "custom_project_id", "customer_id", "project_name", "service_type", "package", "payment_info", "sales_person_name", "sales_person_email", "package_lmh", "product_details", "description", "banner_reel", "gmb_access_desc", "dvc", "total_keyword", "total_report", "adword_sponser", "comments", "start_date", "due_date", "completion_date", "status", "priority", "workflow_stage", "created_at", "first_page", "report_send", "approved_keywords", "renewal_date", "ftp_login_details", "client_type", "analytics_webmaster_email", "social_media_login", "issue_comment", "seo_person", "developer", "dev_completion_pct", "design_banner", "design_logo", "design_ui", "design_client_approval"];

        $header = null;
        $chunk = [];
        while (($row = fgetcsv($handle, 10000, ',')) !== false) {
            if (!$header) {
                $header = $row;
                continue;
            }

            $projectData = [];
            foreach ($columns as $index => $col) {
                if ($col === 'id' || $col === 'created_at') continue;
                
                if (isset($row[$index]) && trim($row[$index]) !== '') {
                    $projectData[$col] = $row[$index];
                }
            }

            if (!empty($projectData['project_name'])) {
                $chunk[] = $projectData;
            }

            if (count($chunk) >= 500) {
                Project::insert($chunk);
                $chunk = [];
            }
        }
        
        if (count($chunk) > 0) {
            Project::insert($chunk);
        }
        
        fclose($handle);

        return redirect()->back()->with('success', 'Projects imported successfully with all columns!');
    }
}
