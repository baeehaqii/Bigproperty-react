<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use Spatie\Permission\Models\Role;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // pastiin role super_admin ada
        Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);

        // bikin / update superadmin
        $superadmin = User::updateOrCreate(
            ['username' => 'superadmin'],
            [
                'id' => Str::uuid(),
                'firstname' => 'Super',
                'lastname' => 'Admin',
                'email' => 'superadmin@starter-kit.com',
                'email_verified_at' => now(),
                'password' => Hash::make('superadmin'),
            ]
        );

        $superadmin->assignRole('super_admin');

        // bikin user biasa (opsional)
        Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

        for ($i = 0; $i < 3; $i++) {
            $user = User::create([
                'id' => Str::uuid(),
                'username' => $faker->unique()->userName,
                'firstname' => $faker->firstName,
                'lastname' => $faker->lastName,
                'email' => $faker->unique()->safeEmail,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ]);

            $user->assignRole('user');
        }
    }
}
