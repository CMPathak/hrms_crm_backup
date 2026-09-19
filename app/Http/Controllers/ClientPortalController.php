<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Role;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ClientPortalController extends Controller
{
    /**
     * Display the client portal index page.
     */
    public function index(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        $user = Auth::user();
        $roleName = strtolower($user->role->role_name ?? '');
        $roleId = (int) ($user->role_id ?? 0);
        $isAdmin = in_array($roleName, ['super_admin', 'admin'], true) || in_array($roleId, [1, 2], true) || $user->id === 1;
        $isClient = $roleName === 'client' || $roleId === 10;

        // If regular internal staff (not admin, not client), redirect to dashboard
        if (!$isAdmin && !$isClient) {
            return redirect()->route('dashboard')->with('error', 'Access restricted to Admin and Client accounts.');
        }

        if ($isClient) {
            // Find linked customer for this client user
            $customer = Customer::where('user_id', $user->id)
                ->orWhere('email', $user->email)
                ->first();

            $projects = [];
            $invoices = [];
            $tickets = [];
            $seoKeywords = [];

            if ($customer) {
                $projects = Project::where('customer_id', $customer->id)
                    ->select([
                        'id', 'custom_project_id', 'customer_id', 'project_name',
                        'description', 'status', 'workflow_stage', 'start_date', 'due_date',
                        'dev_completion_pct', 'design_banner', 'design_logo', 'design_ui', 'design_client_approval'
                    ])
                    ->get();

                $invoices = DB::table('invoices')
                    ->where('customer_id', $customer->id)
                    ->orderBy('id', 'desc')
                    ->limit(10)
                    ->get();

                $tickets = SupportTicket::where('customer_id', $customer->id)
                    ->orderBy('id', 'desc')
                    ->limit(10)
                    ->get();

                $projectIds = $projects->pluck('id');
                $seoKeywords = DB::table('seo_keywords')
                    ->whereIn('project_id', $projectIds)
                    ->orderBy('id', 'desc')
                    ->limit(10)
                    ->get();
            }

            return Inertia::render('ClientPortal/Index', [
                'viewMode' => 'client',
                'customer' => $customer,
                'projects' => $projects,
                'invoices' => $invoices,
                'tickets' => $tickets,
                'seoKeywords' => $seoKeywords,
                'isAdmin' => false,
            ]);
        }

        // ADMIN VIEW: List of clients & management
        $clientsQuery = Customer::query()
            ->with(['user:id,name,email,status', 'projects:id,customer_id,project_name,status,workflow_stage,dev_completion_pct,design_banner,design_logo,design_ui,design_client_approval'])
            ->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = trim($request->search);
            $clientsQuery->where(function ($q) use ($search) {
                $q->where('client_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('custom_id', 'like', "%{$search}%");
            });
        }

        $clients = $clientsQuery->paginate(15)->withQueryString();

        // Count metrics for admin
        $totalClients = Customer::count();
        $clientsWithLogin = Customer::whereNotNull('user_id')->count();
        $totalTickets = SupportTicket::count();
        $openTickets = SupportTicket::where('status', 'Open')->count();

        // Projects list for dropdown when assigning to client
        $allProjects = Project::select('id', 'project_name', 'customer_id')
            ->orderBy('project_name')
            ->get();

        return Inertia::render('ClientPortal/Index', [
            'viewMode' => 'admin',
            'clients' => $clients,
            'filters' => $request->only(['search']),
            'stats' => [
                'totalClients' => $totalClients,
                'clientsWithLogin' => $clientsWithLogin,
                'totalTickets' => $totalTickets,
                'openTickets' => $openTickets,
            ],
            'allProjects' => $allProjects,
            'isAdmin' => true,
        ]);
    }

    /**
     * Add a new client and automatically create their login account.
     */
    public function storeClient(Request $request)
    {
        $user = Auth::user();
        $roleName = strtolower($user->role->role_name ?? '');
        $roleId = (int) ($user->role_id ?? 0);
        $isAdmin = in_array($roleName, ['super_admin', 'admin'], true) || in_array($roleId, [1, 2], true) || $user->id === 1;

        if (!$isAdmin) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'client_name' => 'required|string|max:100',
            'company_name' => 'required|string|max:150',
            'email' => 'required|email|max:150',
            'mobile' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'business_category' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'project_name' => 'nullable|string|max:150',
        ]);

        DB::transaction(function () use ($request) {
            // 1. Create or find User with role client (role_id 10)
            $clientRole = Role::where('role_name', 'client')->first();
            $clientRoleId = $clientRole ? $clientRole->id : 10;

            $clientUser = User::where('email', $request->email)->first();
            if (!$clientUser) {
                $clientUser = User::create([
                    'name' => $request->client_name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role_id' => $clientRoleId,
                    'phone' => $request->mobile,
                    'status' => 'active',
                ]);
            } else {
                // Update password and ensure client role
                $clientUser->update([
                    'role_id' => $clientRoleId,
                    'password' => Hash::make($request->password),
                    'status' => 'active',
                ]);
            }

            // 2. Generate custom_id e.g. HMS-C100
            $maxId = Customer::max('id') ?? 0;
            $customId = 'HMS-C' . ($maxId + 101);

            // 3. Create customer record
            $customer = Customer::create([
                'user_id' => $clientUser->id,
                'custom_id' => $customId,
                'client_name' => $request->client_name,
                'company_name' => $request->company_name,
                'contact_person' => $request->client_name,
                'mobile' => $request->mobile ?? '',
                'email' => $request->email,
                'address' => $request->address ?? '',
                'business_category' => $request->business_category ?? 'General',
                'created_at' => now(),
            ]);

            // 4. Optionally create or link initial project
            if ($request->filled('project_name')) {
                $maxProjId = Project::max('id') ?? 0;
                Project::create([
                    'custom_project_id' => 'PRJ-' . ($maxProjId + 101),
                    'customer_id' => $customer->id,
                    'project_name' => $request->project_name,

                    'description' => 'Initial onboarding project for ' . $request->company_name,
                    'start_date' => now()->toDateString(),
                    'due_date' => now()->addMonth()->toDateString(),
                    'status' => 'Active',
                    'workflow_stage' => 'Project Created',
                    'dev_completion_pct' => 0,
                    'design_banner' => 0,
                    'design_logo' => 0,
                    'design_ui' => 0,
                    'design_client_approval' => 0,
                ]);
            }
        });

        return redirect()->back()->with('success', 'New client added successfully and login account created! Client can now log in using ' . $request->email);
    }

    /**
     * Update project progress (dev percentage, workflow stage, design approvals).
     */
    public function updateProgress(Request $request, $projectId)
    {
        $user = Auth::user();
        $roleName = strtolower($user->role->role_name ?? '');
        $roleId = (int) ($user->role_id ?? 0);
        $isAdmin = in_array($roleName, ['super_admin', 'admin'], true) || in_array($roleId, [1, 2], true) || $user->id === 1;

        if (!$isAdmin) {
            abort(403, 'Unauthorized');
        }

        $project = Project::findOrFail($projectId);

        $request->validate([
            'dev_completion_pct' => 'nullable|integer|min:0|max:100',
            'workflow_stage' => 'nullable|string|max:100',
            'design_banner' => 'nullable|boolean',
            'design_logo' => 'nullable|boolean',
            'design_ui' => 'nullable|boolean',
            'design_client_approval' => 'nullable|boolean',
            'status' => 'nullable|string|max:50',
        ]);

        $project->update([
            'dev_completion_pct' => $request->input('dev_completion_pct', $project->dev_completion_pct ?? 0),
            'workflow_stage' => $request->input('workflow_stage', $project->workflow_stage ?? 'Project Created'),
            'design_banner' => $request->boolean('design_banner'),
            'design_logo' => $request->boolean('design_logo'),
            'design_ui' => $request->boolean('design_ui'),
            'design_client_approval' => $request->boolean('design_client_approval'),
            'status' => $request->input('status', $project->status ?? 'Active'),
        ]);

        return redirect()->back()->with('success', 'Project progress updated successfully!');
    }
}
