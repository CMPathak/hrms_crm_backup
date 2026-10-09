<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TargetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $roleName = strtolower($user->role?->role_name ?? '');
        $isSales = str_contains($roleName, 'sales');
        
        if (!$user->isAdmin() && !$isSales) {
            return redirect()->route('dashboard');
        }

        $query = User::with('role');

        if (!$user->isAdmin()) {
            if (str_contains($roleName, 'manager')) {
                // Manager sees themselves + users assigned to them
                $query->where(function($q) use ($user) {
                    $q->where('id', $user->id)
                      ->orWhere('manager_id', $user->id);
                });
            } else {
                // Regular sales/seo person sees only themselves
                $query->where('id', $user->id);
            }
        }

        $allSales = $query->get()->filter(function($u) {
            $rName = strtolower($u->role?->role_name ?? '');
            return str_contains($rName, 'sales') || $u->monthly_target > 0;
        })->values();

        return Inertia::render('Targets/Index', [
            'salesUsers' => $allSales,
            'canEdit' => true
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        $targetUser = User::findOrFail($id);
        
        // A manager can only edit if it's their own or their subordinate's
        // A sales person can only edit their own
        if (!$user->isAdmin()) {
            if ($targetUser->id !== $user->id && $targetUser->manager_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized. You can only edit your assigned users.'], 403);
            }
        }

        $request->validate([
            'monthly_target' => 'required|numeric|min:0',
            'monthly_achieved' => 'required|numeric|min:0',
        ]);

        $user = User::findOrFail($id);
        
        DB::table('users')->where('id', $id)->update([
            'monthly_target' => $request->monthly_target,
            'monthly_achieved' => $request->monthly_achieved,
        ]);

        return redirect()->back()->with('success', 'Target updated successfully.');
    }
}
