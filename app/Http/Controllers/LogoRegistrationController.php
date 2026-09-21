<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\LogoRegistration;

class LogoRegistrationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = (int)$request->query('per_page', 5);
        if ($perPage <= 0 || $perPage > 2000) {
            $perPage = 10;
        }

        // Fetch logo registrations from database with related customer
        $registrations = LogoRegistration::with('customer')->orderBy('id', 'desc')->paginate($perPage)->through(function ($reg) {
            return [
                'id' => $reg->id,
                'client_name' => $reg->customer ? $reg->customer->company_name : 'Unknown',
                'brand_name' => $reg->brand_name,
                'type' => $reg->type ?? 'N/A',
                'status' => $reg->status,
                'applied_date' => $reg->applied_date ? date('Y-m-d', strtotime($reg->applied_date)) : null,
                'application_no' => $reg->application_no ?? 'N/A',
            ];
        });
        
        $registrations->appends($request->all());

        return Inertia::render('LogoRegistrations/Index', [
            'registrations' => $registrations
        ]);
    }
}
