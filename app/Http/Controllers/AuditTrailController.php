<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\LoginHistory;
use Illuminate\Http\Request;

class AuditTrailController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $perPage = (int)$request->query('per_page', 5);
        if ($perPage <= 0 || $perPage > 2000) {
            $perPage = 50;
        }

        $histories = LoginHistory::with('user:id,name,email,role_id')->latest('login_at')->paginate($perPage);
        $histories->appends($request->all());

        return Inertia::render('AuditTrail/Index', [
            'histories' => $histories,
            'filters' => $request->only('search', 'per_page')
        ]);
    }
}
