<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Record User Login Activity (Date, Time, IP, Device)
        $user = $request->user();
        if ($user) {
            $user->loadMissing('role');
            DB::table('user_logins')->insert([
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role?->display_name ?? $user->role?->role_name ?? ($user->id === 1 ? 'Super Admin' : 'User'),
                'ip_address' => $request->ip(),
                'user_agent' => substr($request->userAgent() ?? '', 0, 255),
                'login_at' => now(),
            ]);
        }

        if ($user && ($user->role_id === 10 || strtolower($user->role?->role_name ?? '') === 'client')) {
            return redirect()->route('client-portal.index');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
