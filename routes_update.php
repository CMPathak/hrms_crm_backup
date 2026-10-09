<?php
$c = file_get_contents('routes/web.php');
$routes = "
    Route::get('/followups/export', [\App\Http\Controllers\SalesFollowupController::class, 'export'])->name('followups.export');
    Route::post('/followups/import', [\App\Http\Controllers\SalesFollowupController::class, 'import'])->name('followups.import');";
$c = str_replace("    Route::post('/followups/import', [\App\Http\Controllers\SalesFollowupController::class, 'import'])->name('followups.import');", $routes, $c);
file_put_contents('routes/web.php', $c);
