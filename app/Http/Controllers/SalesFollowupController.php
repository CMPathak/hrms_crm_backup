<?php

namespace App\Http\Controllers;

use App\Models\SalesFollowup;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SalesFollowupController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $roleName = strtolower($user->role?->role_name ?? '');
        $isSales = str_contains($roleName, 'sales');
        $isManager = str_contains($roleName, 'manager');
        $isAdmin = $user->isAdmin();

        if (!$isAdmin && !$isSales) {
            return redirect()->route('dashboard');
        }

        $query = SalesFollowup::with('user');

        if (!$isAdmin) {
            if ($isManager) {
                // Manager sees their own and their subordinates' followups
                $query->whereHas('user', function($q) use ($user) {
                    $q->where('id', $user->id)
                      ->orWhere('manager_id', $user->id);
                });
            } else {
                // Sales person sees only their own
                $query->where('user_id', $user->id);
            }
        }

        $followups = $query->orderBy('followup_date', 'desc')->get();

        return Inertia::render('Followups/Index', [
            'followups' => $followups
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'client_name' => 'required|string|max:255',
            'followup_date' => 'required|date',
            'status' => 'required|string',
            'remarks' => 'nullable|string',
            'next_followup_date' => 'nullable|date',
        ]);

        SalesFollowup::create([
            'user_id' => $request->user()->id,
            'client_name' => $request->client_name,
            'followup_date' => $request->followup_date,
            'status' => $request->status,
            'remarks' => $request->remarks,
            'next_followup_date' => $request->next_followup_date,
        ]);

        return redirect()->back()->with('success', 'Follow-up added successfully.');
    }

    public function update(Request $request, $id)
    {
        $followup = SalesFollowup::findOrFail($id);
        $user = $request->user();
        $isAdmin = $user->isAdmin();

        if (!$isAdmin && $followup->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'client_name' => 'required|string|max:255',
            'followup_date' => 'required|date',
            'status' => 'required|string',
            'remarks' => 'nullable|string',
            'next_followup_date' => 'nullable|date',
        ]);

        $followup->update($request->only([
            'client_name', 'followup_date', 'status', 'remarks', 'next_followup_date'
        ]));

        return redirect()->back()->with('success', 'Follow-up updated successfully.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048'
        ]);

        $file = $request->file('file');
        
        if (($handle = fopen($file->getRealPath(), 'r')) !== false) {
            $header = fgetcsv($handle, 1000, ',');
            // Assume header: client_name, followup_date, status, remarks, next_followup_date
            
            while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                if (count($data) >= 3) { // minimal required: client_name, date, status
                    SalesFollowup::create([
                        'user_id' => $request->user()->id,
                        'client_name' => $data[0] ?? '',
                        'followup_date' => $data[1] ?? now()->format('Y-m-d'),
                        'status' => $data[2] ?? 'Call Back',
                        'remarks' => $data[3] ?? null,
                        'next_followup_date' => !empty($data[4]) ? $data[4] : null,
                    ]);
                }
            }
            fclose($handle);
        }

        return redirect()->back()->with('success', 'Follow-ups imported successfully!');
    }

    public function export(Request $request)
    {
        $user = $request->user();
        $roleName = strtolower($user->role?->role_name ?? '');
        $isAdmin = $user->isAdmin();
        $isManager = str_contains($roleName, 'manager');

        $query = SalesFollowup::with('user');

        if (!$isAdmin) {
            if ($isManager) {
                $query->whereHas('user', function($q) use ($user) {
                    $q->where('id', $user->id)->orWhere('manager_id', $user->id);
                });
            } else {
                $query->where('user_id', $user->id);
            }
        }

        $followups = $query->orderBy('followup_date', 'desc')->get();

        $filename = "sales_followups_" . date('Y-m-d') . ".csv";
        $handle = fopen('php://memory', 'w');
        
        fputcsv($handle, ['Sales Person', 'Client Name', 'Follow-up Date', 'Status', 'Remarks', 'Next Follow-up Date']);
        
        foreach ($followups as $row) {
            fputcsv($handle, [
                $row->user?->name ?? 'Unknown',
                $row->client_name,
                $row->followup_date,
                $row->status,
                $row->remarks,
                $row->next_followup_date
            ]);
        }
        
        fseek($handle, 0);
        $csvData = stream_get_contents($handle);
        fclose($handle);
        
        return response($csvData, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
