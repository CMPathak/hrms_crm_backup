<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LoginHistory;
use App\Models\User;

class LoginHistorySeeder extends Seeder
{
    public function run()
    {
        $users = User::all();
        foreach($users as $user) {
            for($i=0; $i<3; $i++) {
                LoginHistory::create([
                    'user_id' => $user->id,
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                    'login_at' => now()->subHours(rand(1, 48))
                ]);
            }
        }
    }
}
