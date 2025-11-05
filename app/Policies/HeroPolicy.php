<?php

declare(strict_types=1);

namespace App\Policies;

use Illuminate\Foundation\Auth\User as AuthUser;
use App\Models\Hero;
use Illuminate\Auth\Access\HandlesAuthorization;

class HeroPolicy
{
    use HandlesAuthorization;
    
    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:Hero');
    }

    public function view(AuthUser $authUser, Hero $hero): bool
    {
        return $authUser->can('View:Hero');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:Hero');
    }

    public function update(AuthUser $authUser, Hero $hero): bool
    {
        return $authUser->can('Update:Hero');
    }

    public function delete(AuthUser $authUser, Hero $hero): bool
    {
        return $authUser->can('Delete:Hero');
    }

    public function restore(AuthUser $authUser, Hero $hero): bool
    {
        return $authUser->can('Restore:Hero');
    }

    public function forceDelete(AuthUser $authUser, Hero $hero): bool
    {
        return $authUser->can('ForceDelete:Hero');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:Hero');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:Hero');
    }

    public function replicate(AuthUser $authUser, Hero $hero): bool
    {
        return $authUser->can('Replicate:Hero');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:Hero');
    }

}