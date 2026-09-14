<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\TeamMessage;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Get real-time summary of notifications and unread chat messages.
     */
    public function summary(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['unreadChatCount' => 0, 'notifications' => []]);
        }

        $isClient = (int)($user->role_id ?? 0) === 10 || strtolower($user->role?->role_name ?? '') === 'client';

        // 1. Unread chat count
        $unreadChatCount = 0;
        $chatAlerts = [];

        if (!$isClient) {
            // Direct messages unread
            $directUnread = TeamMessage::where('receiver_id', $user->id)
                ->where('is_read', 0)
                ->count();

            // Recent channel messages in last 12 hours from other users
            $recentChannelCount = TeamMessage::whereNull('receiver_id')
                ->where('sender_id', '!=', $user->id)
                ->where('created_at', '>=', now()->subHours(12))
                ->count();

            $unreadChatCount = $directUnread > 0 ? $directUnread : min($recentChannelCount, 99);

            // Fetch latest 4 chat messages for notification dropdown
            $latestChats = TeamMessage::with('sender:id,name')
                ->where('sender_id', '!=', $user->id)
                ->orderBy('id', 'desc')
                ->limit(4)
                ->get();

            foreach ($latestChats as $c) {
                $chatAlerts[] = [
                    'id' => 'chat_' . $c->id,
                    'type' => 'chat',
                    'title' => ($c->sender?->name ?? 'Team Member') . ($c->channel ? " in #{$c->channel}" : ''),
                    'description' => substr($c->message, 0, 75) . (strlen($c->message) > 75 ? '...' : ''),
                    'time' => Carbon::parse($c->created_at)->diffForHumans(),
                    'link' => route('chat.index'),
                ];
            }
        }

        // 2. Support Tickets alerts
        $ticketAlerts = [];
        $ticketQuery = SupportTicket::with('customer:id,company_name')
            ->where('status', 'Open')
            ->orderBy('id', 'desc');

        if ($isClient) {
            $customer = DB::table('customers')->where('user_id', $user->id)->orWhere('email', $user->email)->first();
            if ($customer) {
                $ticketQuery->where('customer_id', $customer->id);
            } else {
                $ticketQuery->whereRaw('1 = 0');
            }
        }

        $openTickets = $ticketQuery->limit(3)->get();
        foreach ($openTickets as $t) {
            $ticketAlerts[] = [
                'id' => 'ticket_' . $t->id,
                'type' => 'ticket',
                'title' => "Ticket {$t->ticket_number}: {$t->subject}",
                'description' => ($t->customer?->company_name ?? 'Client') . " • Priority: {$t->priority}",
                'time' => Carbon::parse($t->created_at)->diffForHumans(),
                'link' => route('tickets.index'),
            ];
        }

        // 3. Domain Expiration alerts (for internal staff)
        $domainAlerts = [];
        if (!$isClient) {
            $today = Carbon::today();
            $nextMonth = Carbon::today()->addDays(30);
            $expiringDomains = DB::table('domains_hosting')
                ->whereNotNull('domain_expiry_date')
                ->where('domain_expiry_date', '<=', $nextMonth->toDateString())
                ->orderBy('domain_expiry_date', 'asc')
                ->limit(3)
                ->get();

            foreach ($expiringDomains as $d) {
                $days = Carbon::parse($d->domain_expiry_date)->diffInDays(Carbon::today(), false);
                $isExpired = $days > 0;
                $daysLeft = abs($days);
                $domainAlerts[] = [
                    'id' => 'domain_' . $d->id,
                    'type' => 'domain',
                    'title' => "Domain Alert: {$d->domain_name}",
                    'description' => $isExpired ? "Expired {$daysLeft} days ago" : "Expiring in {$daysLeft} days (" . Carbon::parse($d->domain_expiry_date)->format('M d') . ")",
                    'time' => $isExpired ? 'Expired' : "{$daysLeft}d left",
                    'link' => route('domains.index'),
                ];
            }
        }

        $allNotifications = array_merge($chatAlerts, $ticketAlerts, $domainAlerts);
        $totalNotificationsCount = count($allNotifications);

        return response()->json([
            'unreadChatCount' => $unreadChatCount,
            'totalNotificationsCount' => $totalNotificationsCount,
            'notifications' => $allNotifications,
        ]);
    }

    /**
     * Mark chat messages as read for current user.
     */
    public function markChatRead(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            TeamMessage::where('receiver_id', $user->id)
                ->where('is_read', 0)
                ->update(['is_read' => 1]);
        }
        return response()->json(['success' => true]);
    }
}
