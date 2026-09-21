<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\AuditTrailController;
use App\Http\Controllers\LogoRegistrationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Projects Routes
    Route::get('/projects/export', [ProjectController::class, 'export'])->name('projects.export');
    Route::post('/projects/import', [ProjectController::class, 'import'])->name('projects.import');
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::patch('/projects/{project}/status', [ProjectController::class, 'updateStatus'])->name('projects.updateStatus');
    Route::post('/projects/{project}/assignment', [ProjectController::class, 'updateAssignment'])->name('projects.updateAssignment');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    // Tasks Routes
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.updateStatus');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    // User & Role Management Routes
    Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::patch('/users/{user}/status', [UserManagementController::class, 'updateStatus'])->name('users.updateStatus');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');

    // Logo Registrations Route
    Route::get('/logo-registrations', [LogoRegistrationController::class, 'index'])->name('logo-registrations.index');

    // Audit Trail Route (Admin Only)
    Route::get('/audit-trail', [AuditTrailController::class, 'index'])->name('audit-trail');

    // Domain Expiry Routes (Visible to all users)
    Route::get('/domains', [\App\Http\Controllers\DomainController::class, 'index'])->name('domains.index');

    // Client Portal Routes (Admin / Super Admin & Client)
    Route::get('/client-portal', [\App\Http\Controllers\ClientPortalController::class, 'index'])->name('client-portal.index');
    Route::post('/client-portal/client', [\App\Http\Controllers\ClientPortalController::class, 'storeClient'])->name('client-portal.storeClient');
    Route::patch('/client-portal/projects/{project}/progress', [\App\Http\Controllers\ClientPortalController::class, 'updateProgress'])->name('client-portal.updateProgress');

    // Support Tickets Routes (Admin / Super Admin & Client)
    Route::get('/support-tickets', [\App\Http\Controllers\TicketController::class, 'index'])->name('tickets.index');
    Route::post('/support-tickets', [\App\Http\Controllers\TicketController::class, 'store'])->name('tickets.store');
    Route::post('/support-tickets/{id}/reply', [\App\Http\Controllers\TicketController::class, 'reply'])->name('tickets.reply');
    Route::patch('/support-tickets/{id}/status', [\App\Http\Controllers\TicketController::class, 'updateStatus'])->name('tickets.updateStatus');

    // Internal Team Chat Routes (Internal staff only)
    Route::get('/team-chat', [\App\Http\Controllers\TeamChatController::class, 'index'])->name('chat.index');
    Route::get('/team-chat/messages', [\App\Http\Controllers\TeamChatController::class, 'getMessages'])->name('chat.messages');
    Route::post('/team-chat/messages', [\App\Http\Controllers\TeamChatController::class, 'sendMessage'])->name('chat.send');
    Route::put('/team-chat/messages/{id}', [\App\Http\Controllers\TeamChatController::class, 'editMessage'])->name('chat.edit');
    Route::delete('/team-chat/messages/{id}', [\App\Http\Controllers\TeamChatController::class, 'deleteMessage'])->name('chat.delete');

    // Live Notifications Summary Routes
    Route::get('/notifications/summary', [\App\Http\Controllers\NotificationController::class, 'summary'])->name('notifications.summary');
    Route::post('/notifications/mark-chat-read', [\App\Http\Controllers\NotificationController::class, 'markChatRead'])->name('notifications.markChatRead');

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
