<?php

declare(strict_types=1);

namespace App\Policies;

use Illuminate\Foundation\Auth\User as AuthUser;
use App\Models\Developer;
use Illuminate\Auth\Access\HandlesAuthorization;

class DeveloperPolicy
{
    use HandlesAuthorization;
    
    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:Developer');
    }

    public function view(AuthUser $authUser, Developer $developer): bool
    {
        return $authUser->can('View:Developer');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:Developer');
    }

    public function update(AuthUser $authUser, Developer $developer): bool
    {
        return $authUser->can('Update:Developer');
    }

    public function delete(AuthUser $authUser, Developer $developer): bool
    {
        return $authUser->can('Delete:Developer');
    }

    public function restore(AuthUser $authUser, Developer $developer): bool
    {
        return $authUser->can('Restore:Developer');
    }

    public function forceDelete(AuthUser $authUser, Developer $developer): bool
    {
        return $authUser->can('ForceDelete:Developer');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:Developer');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:Developer');
    }

    public function replicate(AuthUser $authUser, Developer $developer): bool
    {
        return $authUser->can('Replicate:Developer');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:Developer');
    }

}