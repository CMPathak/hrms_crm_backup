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

        $histories = LoginHistory::with('user:id,name,email,role_id')->latest('login_at')->paginate(50);

        return Inertia::render('AuditTrail/Index', [
            'histories' => $histories
        ]);
    }
}
