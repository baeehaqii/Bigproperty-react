<?php

declare(strict_types=1);

namespace App\Policies;

use Illuminate\Foundation\Auth\User as AuthUser;
use App\Models\Agen;
use Illuminate\Auth\Access\HandlesAuthorization;

class AgenPolicy
{
    use HandlesAuthorization;
    
    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:Agen');
    }

    public function view(AuthUser $authUser, Agen $agen): bool
    {
        return $authUser->can('View:Agen');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:Agen');
    }

    public function update(AuthUser $authUser, Agen $agen): bool
    {
        return $authUser->can('Update:Agen');
    }

    public function delete(AuthUser $authUser, Agen $agen): bool
    {
        return $authUser->can('Delete:Agen');
    }

    public function restore(AuthUser $authUser, Agen $agen): bool
    {
        return $authUser->can('Restore:Agen');
    }

    public function forceDelete(AuthUser $authUser, Agen $agen): bool
    {
        return $authUser->can('ForceDelete:Agen');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:Agen');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:Agen');
    }

    public function replicate(AuthUser $authUser, Agen $agen): bool
    {
        return $authUser->can('Replicate:Agen');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:Agen');
    }

}