<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        // Create a user with the role 'guest'
        DB::table('users')->insert([
            'firstName' => 'GuestUser',
            'lastName' => 'GuestUser',
            'username' => 'GuestUser',
            'password' => Hash::make('userguest@!123'), // Use a hashed password
            'role' => 'guest',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
