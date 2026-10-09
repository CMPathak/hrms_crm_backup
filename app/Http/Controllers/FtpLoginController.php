<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FtpLoginController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 5);
        
        $query = Project::with('customer')
            ->select('id', 'project_name', 'customer_id', 'ftp_login_details')
            ->whereNotNull('ftp_login_details')
            ->where('ftp_login_details', '!=', '');

        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('project_name', 'like', "%{$search}%")
                  ->orWhere('ftp_login_details', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($cq) use ($search) {
                      $cq->where('company_name', 'like', "%{$search}%")
                         ->orWhere('client_name', 'like', "%{$search}%");
                  });
            });
        }

        $projects = $query->orderBy('id', 'desc')->paginate($perPage)->withQueryString()->through(function($p) {
            $parsed = $this->parseFtpDetails($p->ftp_login_details);
            return [
                'id' => $p->id,
                'project_name' => $p->project_name,
                'customer' => $p->customer ? [
                    'company_name' => $p->customer->company_name,
                    'client_name' => $p->customer->client_name,
                ] : null,
                'ftp_login_details' => $p->ftp_login_details,
                'wp_details' => $parsed['wp'],
                'cpanel_details' => $parsed['cpanel'],
            ];
        });

        return Inertia::render('FtpLogins/Index', [
            'projects' => $projects,
            'search' => $search,
            'per_page' => $perPage
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'ftp_login_details' => 'nullable|string',
        ]);

        $project->update([
            'ftp_login_details' => $validated['ftp_login_details']
        ]);

        return back()->with('success', 'FTP Login Details updated successfully.');
    }

    private function parseFtpDetails($text)
    {
        $text = trim((string)$text);
        if (empty($text) || strtolower($text) === 'na') {
            return ['wp' => null, 'cpanel' => null];
        }

        $lowerText = strtolower($text);
        $hasWp = str_contains($lowerText, 'wordpress') || str_contains($lowerText, 'wp-') || str_contains($lowerText, 'wp login');
        $hasCpanel = str_contains($lowerText, 'cpanel') || str_contains($lowerText, 'hosting') || str_contains($lowerText, 'plesk') || str_contains($lowerText, '8880') || str_contains($lowerText, '2083') || str_contains($lowerText, 'domainname');

        if ($hasWp && !$hasCpanel) {
            return ['wp' => $text, 'cpanel' => null];
        }
        if ($hasCpanel && !$hasWp) {
            return ['wp' => null, 'cpanel' => $text];
        }
        if (!$hasWp && !$hasCpanel) {
            // Default to cpanel if we don't recognize either
            return ['wp' => null, 'cpanel' => $text];
        }

        // Has both, try to split
        $lines = preg_split('/\r\n|\r|\n/', $text);
        $wp = [];
        $cpanel = [];
        $context = 'cpanel'; // Default to cpanel until we see WP

        foreach ($lines as $line) {
            $lower = strtolower($line);
            if (str_contains($lower, 'wordpress') || str_contains($lower, 'wp-') || str_contains($lower, 'wp login')) {
                $context = 'wp';
            } elseif (str_contains($lower, 'cpanel') || str_contains($lower, 'hosting') || str_contains($lower, 'plesk') || str_contains($lower, '8880') || str_contains($lower, 'domainname')) {
                $context = 'cpanel';
            }

            if ($context === 'wp') {
                $wp[] = $line;
            } else {
                $cpanel[] = $line;
            }
        }

        return [
            'wp' => trim(implode("\n", $wp)),
            'cpanel' => trim(implode("\n", $cpanel)),
        ];
    }
}
