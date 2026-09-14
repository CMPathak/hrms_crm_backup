<?php

namespace App\Http\Controllers;

use App\Models\TeamMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TeamChatController extends Controller
{
    /**
     * Channels configuration.
     */
    protected array $channels = [
        ['id' => 'general', 'name' => 'General', 'description' => 'Company-wide announcements and general chat'],
        ['id' => 'development', 'name' => 'Development', 'description' => 'Web & software engineering team discussions'],
        ['id' => 'design', 'name' => 'Design & Creative', 'description' => 'UI/UX mockups, banners, and logos discussions'],
        ['id' => 'seo-ads', 'name' => 'SEO & Ads', 'description' => 'Google Ads, rankings, and SEO keyword strategies'],
        ['id' => 'sales', 'name' => 'Sales & Client Onboarding', 'description' => 'Lead discussions, proposals, and customer updates'],
    ];

    /**
     * Display Team Chat view.
     */
    public function index(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        $user = Auth::user();
        $roleId = (int) ($user->role_id ?? 0);
        $roleName = strtolower($user->role->role_name ?? '');

        // Clients are not part of internal team chat
        if ($roleId === 10 || $roleName === 'client') {
            return redirect()->route('client-portal.index')->with('error', 'Team chat is restricted to internal staff.');
        }

        // Active channel or recipient DM
        $activeChannel = $request->input('channel', 'general');
        $activeDmUserId = $request->input('dm_user_id');

        // Internal team members (excluding clients)
        $teamMembers = User::where('role_id', '!=', 10)
            ->where('id', '!=', $user->id)
            ->where('status', 'active')
            ->with('role:id,role_name,display_name')
            ->select('id', 'name', 'email', 'role_id', 'status', 'created_at')
            ->orderBy('name')
            ->get();

        // If viewing direct message, mark incoming as read
        if ($activeDmUserId) {
            TeamMessage::where('sender_id', $activeDmUserId)
                ->where('receiver_id', $user->id)
                ->where('is_read', 0)
                ->update(['is_read' => 1]);
        }

        // Load initial messages
        $messages = $this->fetchMessages($user->id, $activeChannel, $activeDmUserId);
        $unreadCounts = $this->getUnreadCounts($user->id);

        return Inertia::render('Chat/Index', [
            'channels' => $this->channels,
            'activeChannel' => $activeChannel,
            'activeDmUserId' => $activeDmUserId ? (int)$activeDmUserId : null,
            'teamMembers' => $teamMembers,
            'initialMessages' => $messages,
            'initialUnreadCounts' => $unreadCounts,
            'currentUserId' => $user->id,
        ]);
    }

    /**
     * API to fetch messages for active channel or direct message.
     */
    public function getMessages(Request $request)
    {
        $user = Auth::user();
        $channel = $request->input('channel');
        $dmUserId = $request->input('dm_user_id');

        if ($dmUserId) {
            TeamMessage::where('sender_id', $dmUserId)
                ->where('receiver_id', $user->id)
                ->where('is_read', 0)
                ->update(['is_read' => 1]);
        }

        $messages = $this->fetchMessages($user->id, $channel, $dmUserId);
        $unreadCounts = $this->getUnreadCounts($user->id);

        return response()->json([
            'messages' => $messages,
            'unreadCounts' => $unreadCounts,
        ]);
    }

    /**
     * API to send a strictly text-only message.
     */
    public function sendMessage(Request $request)
    {
        $user = Auth::user();
        $roleId = (int) ($user->role_id ?? 0);
        if ($roleId === 10) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'message' => 'required|string|max:2000',
            'channel' => 'nullable|string|max:50',
            'receiver_id' => 'nullable|exists:users,id',
        ]);

        $text = trim($request->message);
        if (empty($text)) {
            return response()->json(['error' => 'Message cannot be empty.'], 422);
        }

        $message = TeamMessage::create([
            'sender_id' => $user->id,
            'receiver_id' => $request->receiver_id ?: null,
            'channel' => $request->receiver_id ? null : ($request->channel ?: 'general'),
            'message' => $text,
            'is_read' => 0,
            'created_at' => now(),
        ]);

        $message->load('sender:id,name,role_id');

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    /**
     * Helper to retrieve messages.
     */
    protected function fetchMessages(int $currentUserId, ?string $channel, ?int $dmUserId)
    {
        $query = TeamMessage::query()->with('sender:id,name,role_id');

        if ($dmUserId) {
            $query->where(function ($q) use ($currentUserId, $dmUserId) {
                $q->where(function ($sub) use ($currentUserId, $dmUserId) {
                    $sub->where('sender_id', $currentUserId)->where('receiver_id', $dmUserId);
                })->orWhere(function ($sub) use ($currentUserId, $dmUserId) {
                    $sub->where('sender_id', $dmUserId)->where('receiver_id', $currentUserId);
                });
            });
        } else {
            $ch = $channel ?: 'general';
            $query->where('channel', $ch)->whereNull('receiver_id');
        }

        return $query->orderBy('id', 'desc')->limit(100)->get()->reverse()->values();
    }

    /**
     * Helper to compute unread notification counts per channel and per direct user.
     */
    protected function getUnreadCounts(int $currentUserId): array
    {
        // Direct messages unread: grouped by sender_id
        $directUnread = TeamMessage::where('receiver_id', $currentUserId)
            ->where('is_read', 0)
            ->selectRaw('sender_id, count(*) as count')
            ->groupBy('sender_id')
            ->pluck('count', 'sender_id')
            ->toArray();

        // Channel unread counts: count messages in last 24h from others
        $channelsList = ['general', 'development', 'design', 'seo-ads', 'sales'];
        $channelCounts = [];
        foreach ($channelsList as $ch) {
            $cnt = TeamMessage::where('channel', $ch)
                ->whereNull('receiver_id')
                ->where('sender_id', '!=', $currentUserId)
                ->where('created_at', '>=', now()->subHours(24))
                ->count();
            if ($cnt > 0) {
                $channelCounts[$ch] = $cnt;
            }
        }

        return [
            'channels' => $channelCounts,
            'direct' => $directUnread,
        ];
    }
}
