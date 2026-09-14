<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Project;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProjectMigrationTest extends TestCase
{
    public function test_unauthenticated_user_is_redirected_to_login(): void
    {
        $response = $this->get('/projects');
        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_dashboard(): void
    {
        $user = User::first();
        $this->assertNotNull($user, 'A user should exist in hms_erp.');

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('metrics')
            ->has('recentProjects')
        );
    }

    public function test_authenticated_user_can_access_projects_and_metrics(): void
    {
        $user = User::first();
        $response = $this->actingAs($user)->get('/projects');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Projects/Index')
            ->has('projects.data')
            ->has('metrics', fn (Assert $page) => $page
                ->has('customerCount')
                ->has('activeCount')
                ->has('holdCount')
                ->has('completedCount')
                ->has('closedCount')
                ->has('pendingCount')
                ->has('notifications')
            )
        );
    }

    public function test_authenticated_user_can_create_project(): void
    {
        $user = User::first();
        $customer = Customer::first();
        $this->assertNotNull($customer, 'A customer must exist.');

        $projectName = 'Laravel React Migration Demo ' . rand(100, 999);
        $response = $this->actingAs($user)->post('/projects', [
            'customer_id' => $customer->id,
            'project_name' => $projectName,
            'service_type' => 'Full-Stack Development',
            'package' => 'Enterprise',
            'start_date' => date('Y-m-d'),
            'due_date' => date('Y-m-d', strtotime('+30 days')),
            'status' => 'Active',
            'priority' => 'High',
            'developer' => 'Lead Developer',
            'seo_person' => 'SEO Specialist',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('projects', [
            'project_name' => $projectName,
            'customer_id' => $customer->id,
        ]);
    }
}
