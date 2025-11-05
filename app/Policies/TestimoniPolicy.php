<?php

declare(strict_types=1);

namespace App\Policies;

use Illuminate\Foundation\Auth\User as AuthUser;
use App\Models\Testimoni;
use Illuminate\Auth\Access\HandlesAuthorization;

class TestimoniPolicy
{
    use HandlesAuthorization;
    
    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:Testimoni');
    }

    public function view(AuthUser $authUser, Testimoni $testimoni): bool
    {
        return $authUser->can('View:Testimoni');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:Testimoni');
    }

    public function update(AuthUser $authUser, Testimoni $testimoni): bool
    {
        return $authUser->can('Update:Testimoni');
    }

    public function delete(AuthUser $authUser, Testimoni $testimoni): bool
    {
        return $authUser->can('Delete:Testimoni');
    }

    public function restore(AuthUser $authUser, Testimoni $testimoni): bool
    {
        return $authUser->can('Restore:Testimoni');
    }

    public function forceDelete(AuthUser $authUser, Testimoni $testimoni): bool
    {
        return $authUser->can('ForceDelete:Testimoni');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:Testimoni');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:Testimoni');
    }

    public function replicate(AuthUser $authUser, Testimoni $testimoni): bool
    {
        return $authUser->can('Replicate:Testimoni');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:Testimoni');
    }

}