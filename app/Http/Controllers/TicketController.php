<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Project;
use App\Models\SupportTicket;
use App\Models\TicketReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    /**
     * Display a listing of support tickets.
     */
    public function index(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        $user = Auth::user();
        $roleName = strtolower($user->role->role_name ?? '');
        $roleId = (int) ($user->role_id ?? 0);
        $isAdmin = in_array($roleName, ['super_admin', 'admin'], true) || in_array($roleId, [1, 2], true) || $user->id === 1;
        $isClient = $roleName === 'client' || $roleId === 10;

        // If internal non-admin staff, redirect as requested
        if (!$isAdmin && !$isClient) {
            return redirect()->route('dashboard')->with('error', 'Support tickets access is restricted.');
        }

        $query = SupportTicket::query()
            ->with([
                'customer:id,company_name,client_name,email,mobile',
                'project:id,project_name,custom_project_id'
            ])
            ->orderBy('id', 'desc');

        $clientCustomer = null;
        if ($isClient) {
            $clientCustomer = Customer::where('user_id', $user->id)
                ->orWhere('email', $user->email)
                ->first();

            if ($clientCustomer) {
                $query->where('customer_id', $clientCustomer->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('company_name', 'like', "%{$search}%")
                            ->orWhere('client_name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('project', function ($pq) use ($search) {
                        $pq->where('project_name', 'like', "%{$search}%");
                    });
            });
        }

        $tickets = $query->paginate(20)->withQueryString();

        // Also fetch replies for these tickets so modal can show conversation
        $ticketIds = collect($tickets->items())->pluck('id');
        $replies = TicketReply::whereIn('ticket_id', $ticketIds)
            ->with('user:id,name,role_id')
            ->orderBy('created_at', 'asc')
            ->get()
            ->groupBy('ticket_id');

        // Customers and Projects for dropdowns
        $customersList = [];
        $projectsList = [];

        if ($isAdmin) {
            $customersList = Customer::select('id', 'company_name', 'client_name')
                ->orderBy('company_name')
                ->get();
            $projectsList = Project::select('id', 'project_name', 'customer_id')
                ->orderBy('project_name')
                ->get();
        } elseif ($clientCustomer) {
            $projectsList = Project::where('customer_id', $clientCustomer->id)
                ->select('id', 'project_name', 'customer_id')
                ->orderBy('project_name')
                ->get();
        }

        $stats = [
            'total' => $isClient ? ($clientCustomer ? SupportTicket::where('customer_id', $clientCustomer->id)->count() : 0) : SupportTicket::count(),
            'open' => $isClient ? ($clientCustomer ? SupportTicket::where('customer_id', $clientCustomer->id)->where('status', 'Open')->count() : 0) : SupportTicket::where('status', 'Open')->count(),
            'in_progress' => $isClient ? ($clientCustomer ? SupportTicket::where('customer_id', $clientCustomer->id)->where('status', 'In Progress')->count() : 0) : SupportTicket::where('status', 'In Progress')->count(),
            'resolved' => $isClient ? ($clientCustomer ? SupportTicket::where('customer_id', $clientCustomer->id)->where('status', 'Resolved')->count() : 0) : SupportTicket::where('status', 'Resolved')->count(),
        ];

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'replies' => $replies,
            'customers' => $customersList,
            'projects' => $projectsList,
            'stats' => $stats,
            'filters' => $request->only(['status', 'priority', 'search']),
            'isAdmin' => $isAdmin,
            'isClient' => $isClient,
            'currentCustomer' => $clientCustomer,
        ]);
    }

    /**
     * Store a newly created support ticket.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $roleName = strtolower($user->role->role_name ?? '');
        $roleId = (int) ($user->role_id ?? 0);
        $isAdmin = in_array($roleName, ['super_admin', 'admin'], true) || in_array($roleId, [1, 2], true) || $user->id === 1;
        $isClient = $roleName === 'client' || $roleId === 10;

        $customerId = null;
        if ($isClient) {
            $customer = Customer::where('user_id', $user->id)->orWhere('email', $user->email)->first();
            if (!$customer) {
                return redirect()->back()->with('error', 'Customer profile not found for this account.');
            }
            $customerId = $customer->id;
        } else {
            $request->validate([
                'customer_id' => 'required|exists:customers,id',
            ]);
            $customerId = $request->customer_id;
        }

        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'required|in:High,Medium,Low',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        $ticketNumber = 'TCK-' . rand(1000, 9999);
        while (SupportTicket::where('ticket_number', $ticketNumber)->exists()) {
            $ticketNumber = 'TCK-' . rand(1000, 9999);
        }

        SupportTicket::create([
            'ticket_number' => $ticketNumber,
            'customer_id' => $customerId,
            'project_id' => $request->project_id ?: null,
            'subject' => $request->subject,
            'message' => $request->message,
            'priority' => $request->priority,
            'status' => 'Open',
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', "Support Ticket {$ticketNumber} has been created successfully!");
    }

    /**
     * Post a reply to a support ticket.
     */
    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply_message' => 'required|string',
            'status' => 'nullable|in:Open,In Progress,Resolved,Closed',
        ]);

        $ticket = SupportTicket::findOrFail($id);

        TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'reply_message' => $request->reply_message,
            'created_at' => now(),
        ]);

        if ($request->filled('status')) {
            $ticket->update(['status' => $request->status]);
        }

        return redirect()->back()->with('success', 'Reply submitted successfully!');
    }

    /**
     * Update status of a support ticket.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Open,In Progress,Resolved,Closed',
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->update(['status' => $request->status]);

        return redirect()->back()->with('success', "Ticket {$ticket->ticket_number} status updated to {$request->status}.");
    }
}
