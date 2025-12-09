<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Definisi permissions buat Role policy
        $rolePermissions = [
            'ViewAny:Role',
            'View:Role',
            'Create:Role',
            'Update:Role',
            'Delete:Role',
            'Restore:Role',
            'ForceDelete:Role',
            'ForceDeleteAny:Role',
            'RestoreAny:Role',
            'Replicate:Role',
            'Reorder:Role',
        ];

        // Bikin semua permissions
        foreach ($rolePermissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        // Bikin role super_admin
        $superAdminRole = Role::firstOrCreate([
            'name' => 'super_admin',
            'guard_name' => 'web'
        ]);

        // Kasih SEMUA permissions ke super_admin
        $superAdminRole->syncPermissions(Permission::all());

        // Bikin role user biasa
        $userRole = Role::firstOrCreate([
            'name' => 'Agen',
            'guard_name' => 'web'
        ]);
        $userRole = Role::firstOrCreate([
            'name' => 'Developer',
            'guard_name' => 'web'
        ]);
        $userRole = Role::firstOrCreate([
            'name' => 'Visitor',
            'guard_name' => 'web'
        ]);

        // User biasa cuma bisa view
        $userRole->syncPermissions([
            'ViewAny:Role',
            'View:Role',
        ]);

        // Bikin / update superadmin user
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

        // Assign role super_admin
        $superadmin->syncRoles(['super_admin']);
    }
}