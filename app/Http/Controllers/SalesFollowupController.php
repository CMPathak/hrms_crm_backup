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
            'client_name' => 'nullable|string|max:255',
            'company_name' => 'required|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'client_email' => 'nullable|email|max:255',
            'client_contact' => 'nullable|string|max:255',
            'client_address' => 'nullable|string',
            'followup_date' => 'required|date',
            'status' => 'required|string',
            'remarks' => 'nullable|string',
            'next_followup_date' => 'nullable|date',
            'meeting_date' => 'nullable|date',
            'meeting_time' => 'nullable',
        ]);

        SalesFollowup::create([
            'user_id' => $request->user()->id,
            'client_name' => $request->client_name ?? $request->company_name,
            'company_name' => $request->company_name,
            'owner_name' => $request->owner_name,
            'client_email' => $request->client_email,
            'client_contact' => $request->client_contact,
            'client_address' => $request->client_address,
            'followup_date' => $request->followup_date,
            'status' => $request->status,
            'remarks' => $request->remarks,
            'next_followup_date' => $request->next_followup_date,
            'meeting_date' => $request->meeting_date,
            'meeting_time' => $request->meeting_time,
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
            'client_name' => 'nullable|string|max:255',
            'company_name' => 'required|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'client_email' => 'nullable|email|max:255',
            'client_contact' => 'nullable|string|max:255',
            'client_address' => 'nullable|string',
            'followup_date' => 'required|date',
            'status' => 'required|string',
            'remarks' => 'nullable|string',
            'next_followup_date' => 'nullable|date',
            'meeting_date' => 'nullable|date',
            'meeting_time' => 'nullable',
        ]);

        $updateData = $request->only([
            'client_name', 'company_name', 'owner_name', 'client_email', 'client_contact', 'client_address', 'followup_date', 'status', 'remarks', 'next_followup_date', 'meeting_date', 'meeting_time'
        ]);
        if (empty($updateData['client_name'])) {
            $updateData['client_name'] = $request->company_name;
        }

        $followup->update($updateData);

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
            // Assume header: client_name, client_email, client_contact, client_address, followup_date, status, remarks, next_followup_date
            
            while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                if (count($data) >= 3) { // minimal required fields
                    SalesFollowup::create([
                        'user_id' => $request->user()->id,
                        'client_name' => $data[0] ?? '',
                        'client_email' => $data[1] ?? null,
                        'client_contact' => $data[2] ?? null,
                        'client_address' => $data[3] ?? null,
                        'followup_date' => $data[4] ?? now()->format('Y-m-d'),
                        'status' => $data[5] ?? 'Call Back',
                        'remarks' => $data[6] ?? null,
                        'next_followup_date' => !empty($data[7]) ? $data[7] : null,
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
        
        fputcsv($handle, ['Sales Person', 'Client Name', 'Client Email', 'Client Contact', 'Client Address', 'Follow-up Date', 'Status', 'Remarks', 'Next Follow-up Date']);
        
        foreach ($followups as $row) {
            fputcsv($handle, [
                $row->user?->name ?? 'Unknown',
                $row->client_name,
                $row->client_email,
                $row->client_contact,
                $row->client_address,
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
